from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.forecasting.generate import generate_forecast
from app.models.forecast import Forecast
from app.schemas.forecast import ForecastResponse

router = APIRouter(prefix="/forecasts", tags=["forecasts"])


@router.get("/latest", response_model=ForecastResponse)
def latest_forecast(db: Session = Depends(get_db)):
    existing = db.query(Forecast).order_by(Forecast.generated_at.desc()).first()
    if existing:
        return existing
    return generate_forecast(db)


@router.post("/generate", response_model=ForecastResponse)
def regenerate_forecast(db: Session = Depends(get_db)):
    return generate_forecast(db)
