from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import SessionLocal
from app.core.seed_categories import ensure_system_categories
from app.routers import ai, analysis, budgets, categories, forecasts, goals, markets, reports, transactions

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()
    try:
        ensure_system_categories(db)
    finally:
        db.close()
    yield


app = FastAPI(title="FinPilot AI", lifespan=lifespan)

# Single-tenant local demo, no auth — credentials aren't needed cross-origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categories.router)
app.include_router(transactions.router)
app.include_router(budgets.router)
app.include_router(goals.router)
app.include_router(reports.router)
app.include_router(ai.router)
app.include_router(analysis.router)
app.include_router(forecasts.router)
app.include_router(markets.router)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/settings")
def get_app_settings():
    return {"currency": settings.default_currency}
