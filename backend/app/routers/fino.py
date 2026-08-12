import json as jsonlib
import logging
from pathlib import Path

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.ai.client import ClaudeUnavailableError, stream_claude
from app.ai.fino_context import build_fino_context
from app.ai.fino_history import split_history, to_anthropic_messages
from app.ai.fino_prompt import build_fino_system_prompt
from app.core.config import get_settings
from app.core.database import SessionLocal, get_db
from app.core.rate_limit import enforce_ip_rate_limit
from app.core.security import get_current_user
from app.models.fino_message import FinoMessage
from app.models.user import User
from app.schemas.fino import FinoMessageResponse, FinoSendRequest

logger = logging.getLogger("finpilot.fino")
settings = get_settings()
router = APIRouter(prefix="/api/fino", tags=["fino"])

_CAPABILITIES_PATH = Path(__file__).resolve().parent.parent / "ai" / "platform_capabilities.json"
_capabilities_cache: dict | None = None

FALLBACK_MESSAGE = (
    "I'm having trouble connecting right now — give it a moment and try again. "
    "Your numbers on the dashboard are unaffected either way."
)


def _load_capabilities() -> dict:
    global _capabilities_cache
    if _capabilities_cache is None:
        _capabilities_cache = jsonlib.loads(_CAPABILITIES_PATH.read_text())
    return _capabilities_cache


@router.get("/messages", response_model=list[FinoMessageResponse])
def list_messages(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return (
        db.query(FinoMessage).filter(FinoMessage.user_id == current_user.id).order_by(FinoMessage.created_at).all()
    )


@router.post("/messages")
def send_message(
    request: Request,
    payload: FinoSendRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    enforce_ip_rate_limit(request, f"fino-{current_user.id}", max_per_minute=settings.fino_rate_limit_per_minute)

    db.add(FinoMessage(user_id=current_user.id, role="user", content=payload.message))
    db.commit()

    history = (
        db.query(FinoMessage).filter(FinoMessage.user_id == current_user.id).order_by(FinoMessage.created_at).all()
    )
    recent, older_summary = split_history(history)
    system_prompt = build_fino_system_prompt(
        build_fino_context(db, current_user.id), _load_capabilities(), older_summary
    )
    messages = to_anthropic_messages(recent)
    user_id = current_user.id

    def generate():
        # Retry only covers the connection/first-chunk phase — once real
        # content has started streaming to the client we can't un-send
        # bytes, so a mid-stream failure just ends the stream rather than
        # restarting it (which would duplicate everything already sent).
        full_text = ""
        stream = None
        last_error: Exception | None = None

        for attempt in range(2):
            try:
                stream = stream_claude(system_prompt, messages)
                first_chunk = next(stream)
                full_text += first_chunk
                yield first_chunk
                last_error = None
                break
            except StopIteration:
                last_error = ClaudeUnavailableError("empty response")
            except ClaudeUnavailableError as exc:
                last_error = exc
                logger.warning("Fino stream failed to start (attempt %d): %s", attempt + 1, exc)

        if last_error is not None:
            full_text = FALLBACK_MESSAGE
            yield full_text
        elif stream is not None:
            try:
                for delta in stream:
                    full_text += delta
                    yield delta
            except ClaudeUnavailableError as exc:
                logger.warning("Fino stream interrupted mid-response: %s", exc)

        # The request-scoped `db` dependency is closed by the time this
        # generator actually runs (FastAPI tears down yield-dependencies
        # right after the endpoint returns, not after streaming finishes),
        # so persist the reply with a fresh session.
        session = SessionLocal()
        try:
            session.add(FinoMessage(user_id=user_id, role="assistant", content=full_text))
            session.commit()
        finally:
            session.close()

    return StreamingResponse(generate(), media_type="text/plain")
