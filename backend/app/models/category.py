from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import new_uuid

SYSTEM_CATEGORIES = [
    "Food",
    "Rent",
    "Transport",
    "Utilities",
    "Shopping",
    "Health",
    "Entertainment",
    "Income",
    "Other",
]


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    name: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    is_system: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
