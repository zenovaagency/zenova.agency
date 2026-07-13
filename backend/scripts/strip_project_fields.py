"""One-off cleanup: strip removed fields from existing project rows.

The ``category`` and ``tags`` fields were dropped from the project schema. Since
projects are stored as JSONB and validated on read with
``ProjectDetail.model_validate(row.data)`` — and the schema base sets
``extra="forbid"`` — any existing row that still carries those keys would raise a
validation error (500) on read. This removes the stale keys in place.

Idempotent — safe to re-run (a no-op once every row is clean).

Usage:
    python -m scripts.strip_project_fields
"""

from __future__ import annotations

import asyncio

from sqlalchemy import select

from app.db import session_scope
from app.models import Project

STALE_KEYS = ("category", "tags")


async def strip_fields() -> None:
    cleaned = 0
    async with session_scope() as db:
        rows = (await db.execute(select(Project))).scalars().all()
        for row in rows:
            if not any(key in row.data for key in STALE_KEYS):
                continue
            # JSONB mutation isn't tracked in place — build a new dict and
            # reassign so SQLAlchemy flushes the change.
            row.data = {k: v for k, v in row.data.items() if k not in STALE_KEYS}
            cleaned += 1

    print(f"Cleaned {cleaned} project row(s).")


def main() -> None:
    asyncio.run(strip_fields())


if __name__ == "__main__":
    main()
