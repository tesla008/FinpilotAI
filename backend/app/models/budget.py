from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import new_uuid, utcnow


class Budget(Base):
    """A recurring monthly limit per category. One row per category — the
    limit applies to every month until changed, which is enough for a
    single-tenant demo and avoids a budgets-per-month explosion."""

    __tablename__ = "budgets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    category_id: Mapped[str] = mapped_column(String(36), ForeignKey("categories.id"), unique=True, nullable=False)
    monthly_limit_minor: Mapped[int] = mapped_column(Integer, nullable=False)
    period: Mapped[str] = mapped_column(String(16), default="monthly", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    category: Mapped["Category"] = relationship("Category")
