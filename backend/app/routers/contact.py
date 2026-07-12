"""Contact form intake + admin lead inbox.

- ``POST /contact``            — public, rate-limited. Stores a lead.
- ``GET /admin/leads``        — admin lists submissions (newest first).
- ``PATCH /admin/leads/{id}`` — admin toggles read/unread.
- ``DELETE /admin/leads/{id}``— admin removes a lead.
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Request, Response, status
from sqlalchemy import select

from app.config import get_settings
from app.deps import CurrentAdmin, DbSession
from app.errors import NotFoundError
from app.limiter import limiter
from app.logging import logger
from app.models import Lead
from app.schemas import ContactCreate, LeadOut, LeadPatch

router = APIRouter(tags=["contact"])

_settings = get_settings()


def _to_out(lead: Lead) -> LeadOut:
    return LeadOut(
        id=str(lead.id),
        name=lead.name,
        email=lead.email,
        message=lead.message,
        is_read=lead.is_read,
        created_at=lead.created_at,
    )


@router.post("/contact", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit(_settings.rate_limit_contact)
async def submit(
    request: Request, response: Response, payload: ContactCreate, db: DbSession
) -> None:
    """Public contact-form intake. Returns 204 whether or not spam was detected."""
    if payload.company_website.strip():
        # Honeypot tripped — accept silently so the bot sees success and moves on.
        logger.info("contact_spam_dropped", email=payload.email)
        return
    lead = Lead(name=payload.name, email=payload.email.lower(), message=payload.message)
    db.add(lead)
    await db.flush()
    logger.info("contact_received", lead_id=str(lead.id), email=lead.email)


@router.get("/admin/leads", response_model=list[LeadOut])
async def list_leads(_: CurrentAdmin, db: DbSession) -> list[LeadOut]:
    rows = await db.execute(select(Lead).order_by(Lead.created_at.desc()))
    return [_to_out(lead) for lead in rows.scalars()]


@router.patch("/admin/leads/{lead_id}", response_model=LeadOut)
async def patch_lead(
    lead_id: uuid.UUID, payload: LeadPatch, current: CurrentAdmin, db: DbSession
) -> LeadOut:
    lead = await db.get(Lead, lead_id)
    if lead is None:
        raise NotFoundError("Lead not found.")
    if payload.is_read is not None:
        lead.is_read = payload.is_read
    await db.flush()
    logger.info("lead_patched", lead_id=str(lead_id), by=str(current.id))
    return _to_out(lead)


@router.delete("/admin/leads/{lead_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lead(lead_id: uuid.UUID, current: CurrentAdmin, db: DbSession) -> None:
    lead = await db.get(Lead, lead_id)
    if lead is None:
        raise NotFoundError("Lead not found.")
    await db.delete(lead)
    logger.info("lead_deleted", lead_id=str(lead_id), by=str(current.id))
