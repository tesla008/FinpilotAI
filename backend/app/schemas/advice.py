from pydantic import BaseModel

from app.ai.advice_schema import InsightOut


class RecommendationApiOut(BaseModel):
    id: str  # "{advice_id}:{index}" — stable as long as this Advice row is served from cache
    action: str
    why: str
    impact_inr_per_month: float
    effort: str
    category: str
    status: str  # "pending" | "dismissed" | "done"


class AdviceApiResponse(BaseModel):
    advice_id: str
    generated_at: str
    cached: bool
    is_fallback: bool
    headline: str
    health_score: int
    insights: list[InsightOut]
    recommendations: list[RecommendationApiOut]
    questions_to_consider: list[str]


class RecommendationActionIn(BaseModel):
    status: str  # "pending" | "dismissed" | "done"
