from datetime import date

from sqlalchemy.orm import Session

from app.categorization.service import categorize
from app.ingestion.csv_parser import ColumnMapping, normalize_rows
from app.ingestion.dedup import dedupe
from app.models.transaction import Transaction


def commit_rows(db: Session, raw: bytes, mapping: ColumnMapping) -> tuple[int, int, int]:
    """Returns (inserted, duplicates_skipped, unparseable_skipped)."""
    all_rows, unparseable = normalize_rows(raw, mapping)
    to_insert, duplicates = dedupe(db, all_rows)

    for row in to_insert:
        category_id, _confident = categorize(db, row.description)
        db.add(
            Transaction(
                date=date.fromisoformat(row.date),
                description=row.description,
                raw_description=row.description,
                amount_minor=row.amount_minor,
                category_id=category_id,
                category_confirmed=False,  # auto-assigned; not yet human-confirmed
                source="csv",
            )
        )

    db.commit()
    return len(to_insert), duplicates, unparseable
