from sqlalchemy.orm import Session

from app.categorization import classifier
from app.categorization.rules import match_keyword_rule
from app.models.category import Category


def categorize(db: Session, description: str) -> tuple[str | None, bool]:
    """Returns (category_id, was_confident). Tries the ML classifier first
    (once there's enough confirmed history), then falls back to keyword
    rules, then "Other" is left for the caller to assign if both miss."""
    ml_result = classifier.predict(description)
    if ml_result:
        category_name, _confidence = ml_result
        category = db.query(Category).filter(Category.name == category_name).first()
        if category:
            return category.id, True

    rule_match = match_keyword_rule(description)
    if rule_match:
        category = db.query(Category).filter(Category.name == rule_match).first()
        if category:
            return category.id, True

    return None, False


def categorize_with_confidence(db: Session, description: str) -> tuple[str | None, float | None]:
    """Returns (category_name, confidence). Confidence is only ever a real
    number when the ML classifier produced one — a keyword-rule match is
    "confident" in the boolean sense `categorize()` uses, but we don't have
    an actual probability for it, so it comes back as None rather than a
    made-up number. Used by the CSV preview, which shows the confidence bar
    only when there's a genuine score behind it."""
    ml_result = classifier.predict(description)
    if ml_result:
        category_name, confidence = ml_result
        return category_name, confidence

    rule_match = match_keyword_rule(description)
    if rule_match:
        return rule_match, None

    return None, None
