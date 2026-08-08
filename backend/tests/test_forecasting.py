from app.forecasting.service import forecast_series


def test_cold_start_uses_average_fallback_under_three_months():
    series = [("2026-01", 10000), ("2026-02", 12000)]
    result = forecast_series(series)

    assert result.model_used == "average_fallback"
    assert result.is_low_confidence is True
    assert result.predicted_minor == 11000  # plain average
    # Fixed +/-30% band, not a statistically derived interval.
    assert result.low_minor == round(11000 * 0.7)
    assert result.high_minor == round(11000 * 1.3)
    assert result.mae is None
    assert result.mape is None


def test_cold_start_handles_empty_series():
    result = forecast_series([])
    assert result.model_used == "average_fallback"
    assert result.predicted_minor == 0
    assert result.is_low_confidence is True


def test_prophet_path_used_once_enough_history():
    # Flat series is easy for Prophet to fit quickly and predictably.
    series = [(f"2026-{m:02d}", 10000) for m in range(1, 6)]
    result = forecast_series(series)

    assert result.model_used == "prophet"
    assert result.predicted_minor > 0
    assert result.low_minor <= result.predicted_minor <= result.high_minor


def test_prophet_forecast_is_low_confidence_just_above_cold_start_threshold():
    # Exactly 3 months: past the cold-start cutoff, but too little history to backtest.
    series = [("2026-01", 5000), ("2026-02", 5200), ("2026-03", 5100)]
    result = forecast_series(series)

    assert result.model_used == "prophet"
    assert result.is_low_confidence is True
    assert result.mae is None  # not enough history to hold a month out
