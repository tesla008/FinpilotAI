from pydantic import BaseModel, Field


class EvidenceOut(BaseModel):
    metric: str
    value: str
    period: str


class InsightOut(BaseModel):
    title: str
    detail: str
    evidence: EvidenceOut
    severity: str = Field(pattern="^(info|watch|urgent)$")


class RecommendationOut(BaseModel):
    action: str
    why: str
    impact_inr_per_month: float
    effort: str = Field(pattern="^(low|medium|high)$")
    category: str = Field(pattern="^(budget|save|invest|debt)$")


class AdviceOutput(BaseModel):
    headline: str
    health_score: int = Field(ge=0, le=100)
    insights: list[InsightOut]
    recommendations: list[RecommendationOut]
    questions_to_consider: list[str]
