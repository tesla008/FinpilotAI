from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.ai.client import call_claude
from app.ai.recommendations import get_recommendations
from app.ai.schema import RecommendationOutput
from app.ai.summary import build_summary
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/ai", tags=["ai"])


@router.get("/recommendations")
def recommendations(
    force_refresh: bool = False, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    output, was_cached = get_recommendations(db, current_user.id, force_refresh=force_refresh)
    return {"cached": was_cached, **output.model_dump()}


@router.post("/whatif-commentary")
def whatif_commentary(
    scenario: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """AI commentary on a what-if scenario the user has already computed
    client-side. Grounded the same way as the main recommendations — built
    from the real summary plus the hypothetical adjustments the client sends."""
    base_summary = build_summary(db, current_user.id)
    combined = {**base_summary, "whatif_scenario": scenario}

    try:
        raw = call_claude(combined)
        return RecommendationOutput.model_validate(raw).model_dump()
    except Exception:
        return {
            "summary": "AI commentary is temporarily unavailable — your projected numbers above are unaffected.",
            "insights": [],
            "recommendations": [],
            "risks": [],
        }
