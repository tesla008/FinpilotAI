"""Orchestrates the AI recommendation flow: build a grounded summary, check
the cache, call Claude with one retry on a schema failure, and always
degrade to a safe fallback rather than let an API problem break the
dashboard. Prompt/schema/orchestration are kept in this one file (plus
schema.py/prompt.py alongside it) since the brief calls out that these get
iterated on a lot during development.
"""
import logging

from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.ai.client import ClaudeUnavailableError, call_claude
from app.ai.schema import RecommendationOutput
from app.ai.summary import build_summary, data_version
from app.core.config import get_settings
from app.models.recommendation import Recommendation

logger = logging.getLogger("finpilot.ai")
settings = get_settings()

FALLBACK_OUTPUT = RecommendationOutput(
    summary="AI advice is temporarily unavailable — your numbers below are unaffected.",
    insights=[],
    recommendations=[],
    risks=[],
)


def get_recommendations(
    db: Session, user_id: str, force_refresh: bool = False, is_demo: bool = False
) -> tuple[RecommendationOutput, bool]:
    """Returns (output, was_cached).

    In demo mode, a live-call failure falls back to the most recent cached
    recommendation for this user (any data_version) rather than the generic
    FALLBACK_OUTPUT — a demo showing a real, specific-looking recommendation
    it already generated once beats a "temporarily unavailable" message if
    the network blips mid-presentation."""
    summary = build_summary(db, user_id)
    version = data_version(summary)

    if not force_refresh:
        cached = (
            db.query(Recommendation)
            .filter(Recommendation.data_version == version, Recommendation.user_id == user_id)
            .order_by(Recommendation.generated_at.desc())
            .first()
        )
        if cached:
            return RecommendationOutput.model_validate(cached.output), True

    output = _call_with_retry(summary)

    if output is FALLBACK_OUTPUT and is_demo:
        any_cached = (
            db.query(Recommendation)
            .filter(Recommendation.user_id == user_id)
            .order_by(Recommendation.generated_at.desc())
            .first()
        )
        if any_cached:
            return RecommendationOutput.model_validate(any_cached.output), True

    if output is not FALLBACK_OUTPUT:
        record = Recommendation(
            user_id=user_id,
            data_version=version,
            input_summary=summary,
            output=output.model_dump(),
            model_version=settings.anthropic_model,
        )
        db.add(record)
        db.commit()

    return output, False


def _call_with_retry(summary: dict) -> RecommendationOutput:
    for attempt in range(2):
        try:
            raw = call_claude(summary)
            return RecommendationOutput.model_validate(raw)
        except ClaudeUnavailableError as exc:
            logger.warning("Claude call failed (attempt %d): %s", attempt + 1, exc)
        except ValidationError as exc:
            logger.warning("Claude response failed schema validation (attempt %d): %s", attempt + 1, exc)

    logger.error("AI recommendations unavailable after retry — degrading to fallback.")
    return FALLBACK_OUTPUT
