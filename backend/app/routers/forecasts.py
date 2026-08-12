from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_effective_user
from app.forecasting.generate import generate_forecast
from app.models.forecast import Forecast
from app.models.user import User
from app.schemas.forecast import ForecastResponse

router = APIRouter(prefix="/forecasts", tags=["forecasts"])


@router.get("/latest", response_model=ForecastResponse)
def latest_forecast(db: Session = Depends(get_db), current_user: User = Depends(get_effective_user)):
    existing = (
        db.query(Forecast)
        .filter(Forecast.user_id == current_user.id)
        .order_by(Forecast.generated_at.desc())
        .first()
    )
    if existing:
        return existing
    return generate_forecast(db, current_user.id)


@router.post("/generate", response_model=ForecastResponse)
def regenerate_forecast(db: Session = Depends(get_db), current_user: User = Depends(get_effective_user)):
    return generate_forecast(db, current_user.id)
