from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.budget import Budget
from app.models.category import Category
from app.schemas.budget import BudgetResponse, BudgetUpsert

router = APIRouter(prefix="/budgets", tags=["budgets"])


def _to_response(b: Budget) -> BudgetResponse:
    resp = BudgetResponse.model_validate(b)
    resp.category_name = b.category.name if b.category else None
    return resp


@router.get("", response_model=list[BudgetResponse])
def list_budgets(db: Session = Depends(get_db)):
    budgets = db.query(Budget).all()
    return [_to_response(b) for b in budgets]


@router.put("", response_model=BudgetResponse)
def upsert_budget(payload: BudgetUpsert, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == payload.category_id).first()
    if not category:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Category not found.")

    budget = db.query(Budget).filter(Budget.category_id == payload.category_id).first()
    if budget:
        budget.monthly_limit_minor = payload.monthly_limit_minor
    else:
        budget = Budget(category_id=payload.category_id, monthly_limit_minor=payload.monthly_limit_minor)
        db.add(budget)

    db.commit()
    db.refresh(budget)
    return _to_response(budget)


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(budget_id: str, db: Session = Depends(get_db)):
    budget = db.query(Budget).filter(Budget.id == budget_id).first()
    if not budget:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Budget not found.")
    db.delete(budget)
    db.commit()
