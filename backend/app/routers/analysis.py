from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.analysis.anomalies import detect_category_month_anomalies, detect_transaction_anomalies
from app.analysis.budgets import budget_adherence
from app.analysis.monthly import category_breakdown, monthly_category_breakdown, monthly_spend_totals
from app.analysis.savings import monthly_savings_rate
from app.analysis.trends import detect_trends
from app.core.database import get_db
from app.core.security import get_current_user
from app.forecasting.generate import load_records
from app.models.budget import Budget
from app.models.category import Category
from app.models.user import User

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.get("/monthly-totals")
def get_monthly_totals(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return monthly_spend_totals(load_records(db, current_user.id))


@router.get("/category-breakdown")
def get_category_breakdown(
    month: str | None = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return category_breakdown(load_records(db, current_user.id), month=month)


@router.get("/monthly-category-breakdown")
def get_monthly_category_breakdown(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return monthly_category_breakdown(load_records(db, current_user.id))


@router.get("/trends")
def get_trends(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return detect_trends(load_records(db, current_user.id))


@router.get("/anomalies")
def get_anomalies(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    records = load_records(db, current_user.id)
    return {
        "transactions": detect_transaction_anomalies(records),
        "category_months": detect_category_month_anomalies(records),
    }


@router.get("/savings-rate")
def get_savings_rate(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return monthly_savings_rate(load_records(db, current_user.id))


@router.get("/balance")
def get_balance(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """All-time net balance (income minus spend). Not a real bank balance —
    there's no starting-balance concept in this model — but the closest
    honest proxy for the dashboard's hero figure."""
    records = load_records(db, current_user.id)
    return {"balance_minor": sum(r.amount_minor for r in records)}


@router.get("/budget-adherence")
def get_budget_adherence(
    month: str | None = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    records = load_records(db, current_user.id)
    budget_rows = (
        db.query(Budget, Category)
        .join(Category, Budget.category_id == Category.id)
        .filter(Budget.user_id == current_user.id)
        .all()
    )
    budgets_minor = {cat.name: b.monthly_limit_minor for b, cat in budget_rows}
    return budget_adherence(records, budgets_minor, month=month)
