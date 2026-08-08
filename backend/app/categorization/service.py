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
