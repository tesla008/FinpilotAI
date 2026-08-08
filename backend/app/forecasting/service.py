from dataclasses import dataclass

from app.forecasting import models
from app.forecasting.models import COLD_START_MIN_MONTHS, PointForecast, average_fallback, backtest_error, run_arima, run_prophet


@dataclass(frozen=True)
class ForecastPiece:
    predicted_minor: int
    low_minor: int
    high_minor: int
    model_used: str
    is_low_confidence: bool
    mae: float | None
    mape: float | None
    benchmark_model: str | None
    benchmark_mae: float | None
    benchmark_mape: float | None


def forecast_series(series: list[tuple[str, int]]) -> ForecastPiece:
    """series: [("YYYY-MM", spend_minor), ...] ascending, spend-only (positive)."""
    if len(series) == 0:
        return ForecastPiece(0, 0, 0, "average_fallback", True, None, None, None, None, None)

    if len(series) < COLD_START_MIN_MONTHS:
        point = average_fallback(series)
        return ForecastPiece(
            predicted_minor=round(point.predicted),
            low_minor=round(point.lower),
            high_minor=round(point.upper),
            model_used="average_fallback",
            is_low_confidence=True,
            mae=None,
            mape=None,
            benchmark_model=None,
            benchmark_mae=None,
            benchmark_mape=None,
        )

    point = run_prophet(series)
    mae_mape = backtest_error(series, run_prophet)

    benchmark_model = None
    benchmark_mae = None
    benchmark_mape = None
    arima_error = backtest_error(series, run_arima)
    if arima_error is not None:
        benchmark_model = "arima"
        benchmark_mae, benchmark_mape = arima_error

    return ForecastPiece(
        predicted_minor=round(point.predicted),
        low_minor=round(point.lower),
        high_minor=round(point.upper),
        model_used="prophet",
        is_low_confidence=len(series) < models.BACKTEST_MIN_MONTHS,
        mae=mae_mape[0] if mae_mape else None,
        mape=mae_mape[1] if mae_mape else None,
        benchmark_model=benchmark_model,
        benchmark_mae=benchmark_mae,
        benchmark_mape=benchmark_mape,
    )
