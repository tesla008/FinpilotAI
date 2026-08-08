from datetime import date, datetime

from pydantic import BaseModel


class ForecastResponse(BaseModel):
    id: str
    generated_at: datetime
    horizon_month: date
    predicted_total_minor: int
    confidence_low_minor: int
    confidence_high_minor: int
    per_category_breakdown: dict
    model_used: str
    is_low_confidence: bool
    mae: float | None
    mape: float | None
    benchmark_model: str | None
    benchmark_mae: float | None
    benchmark_mape: float | None

    model_config = {"from_attributes": True}
