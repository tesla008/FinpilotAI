import logging

from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.ai.client import ClaudeUnavailableError, call_claude_vision
from app.ai.vision_prompt import EXTRACTION_USER_MESSAGE, build_extraction_system_prompt
from app.ai.vision_schema import TransactionExtraction
from app.ingestion.image_processing import UnsupportedImageError, process_screenshot
from app.models.category import Category, owned_or_system

logger = logging.getLogger("finpilot.extraction")


class ExtractionFailedError(Exception):
    """Raised whenever we can't hand back a trustworthy extraction — a bad
    upload, an unreachable Claude API, or a response that failed schema
    validation. Callers turn this into a clean 4xx, never a raw model
    response or a stack trace."""


def extract_transaction(db: Session, raw_image: bytes, user_id: str) -> TransactionExtraction:
    try:
        jpeg_bytes, media_type = process_screenshot(raw_image)
    except UnsupportedImageError as exc:
        raise ExtractionFailedError(str(exc)) from exc

    category_names = [
        c.name for c in db.query(Category).filter(owned_or_system(user_id)).order_by(Category.name).all()
    ]
    system_prompt = build_extraction_system_prompt(category_names)

    try:
        raw = call_claude_vision(jpeg_bytes, media_type, system_prompt, EXTRACTION_USER_MESSAGE)
    except ClaudeUnavailableError as exc:
        logger.warning("Screenshot extraction failed: %s", exc)
        raise ExtractionFailedError("Could not read this image right now — please try again.") from exc

    try:
        extraction = TransactionExtraction.model_validate(raw)
    except ValidationError as exc:
        logger.warning("Screenshot extraction returned an invalid shape: %s", exc)
        raise ExtractionFailedError("Could not confidently read this image.") from exc

    # Extra guard beyond the prompt: never hand back a category we don't
    # actually have, even if the model ignored the instruction.
    if extraction.category is not None and extraction.category not in category_names:
        extraction.category = None
        extraction.unreadable_fields = [*extraction.unreadable_fields, "category"]

    return extraction
