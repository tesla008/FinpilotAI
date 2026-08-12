from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import new_uuid, utcnow


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)

    # The stable Google subject identifier — the actual identity, since email
    # can change (or be reused after an account is deleted on Google's side).
    google_sub: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)

    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    picture_url: Mapped[str | None] = mapped_column(String(512), nullable=True)

    # Bumped on logout / "sign out everywhere" so previously-issued refresh
    # tokens (which embed the version they were minted with) stop validating.
    token_version: Mapped[int] = mapped_column(default=0, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
