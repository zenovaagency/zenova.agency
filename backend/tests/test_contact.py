"""Tests for the public contact form + admin lead inbox.

Public ``POST /api/v1/contact`` is rate-limited (5/minute) and the autouse
``_reset_rate_limits`` fixture clears the limiter before each test — so a single
test may POST at most 5 times. Admin-side tests seed ``Lead`` rows directly via
the ``db`` fixture to avoid the public throttle.
"""

import uuid

from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import AdminUser, Lead
from app.security import hash_password

CONTACT = "/api/v1/contact"
LEADS = "/api/v1/admin/leads"
PASSWORD = "correcthorse"  # noqa: S105 -- test credential


async def make_user(
    db: AsyncSession,
    email: str,
    role: str = "admin",
    password: str = PASSWORD,
    *,
    is_active: bool = True,
) -> AdminUser:
    user = AdminUser(
        email=email,
        name=email.split("@")[0].title(),
        role=role,
        password_hash=hash_password(password),
        is_active=is_active,
    )
    db.add(user)
    await db.commit()
    return user


async def token_for(client: AsyncClient, email: str, password: str = PASSWORD) -> str:
    r = await client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200, r.text
    return r.json()["tokens"]["access_token"]


def auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


async def make_lead(db: AsyncSession, name: str, email: str, message: str = "hi") -> Lead:
    lead = Lead(name=name, email=email, message=message)
    db.add(lead)
    await db.commit()
    return lead


# ---------------------------------------------------------------------------
# Public submit
# ---------------------------------------------------------------------------


async def test_submit_creates_lead(client: AsyncClient, db: AsyncSession) -> None:
    payload = {"name": "Ada Lovelace", "email": "Ada@Example.com", "message": "Hello there"}
    r = await client.post(CONTACT, json=payload)
    assert r.status_code == 204, r.text

    rows = (await db.execute(select(Lead).where(Lead.name == "Ada Lovelace"))).scalars().all()
    assert len(rows) == 1
    lead = rows[0]
    assert lead.email == "ada@example.com"  # normalized to lowercase
    assert lead.message == "Hello there"
    assert lead.is_read is False


async def test_submit_honeypot_dropped(client: AsyncClient, db: AsyncSession) -> None:
    payload = {
        "name": "Spam Bot",
        "email": "spam@example.com",
        "message": "buy now",
        "company_website": "http://spam.example",
    }
    r = await client.post(CONTACT, json=payload)
    assert r.status_code == 204, r.text

    rows = (await db.execute(select(Lead).where(Lead.email == "spam@example.com"))).scalars().all()
    assert rows == []


async def test_submit_validation_rejects_bad_input(client: AsyncClient) -> None:
    # Missing message
    r = await client.post(CONTACT, json={"name": "No Message", "email": "a@example.com"})
    assert r.status_code == 422
    # Invalid email
    r = await client.post(
        CONTACT, json={"name": "Bad Email", "email": "not-an-email", "message": "hi"}
    )
    assert r.status_code == 422
    # Empty name
    r = await client.post(CONTACT, json={"name": "", "email": "a@example.com", "message": "hi"})
    assert r.status_code == 422


async def test_submit_rejects_unknown_field(client: AsyncClient) -> None:
    # _Base forbids extras; an unexpected key is a 422.
    r = await client.post(
        CONTACT,
        json={"name": "X", "email": "x@example.com", "message": "hi", "role": "admin"},
    )
    assert r.status_code == 422


# ---------------------------------------------------------------------------
# Admin inbox
# ---------------------------------------------------------------------------


async def test_leads_requires_auth(client: AsyncClient) -> None:
    assert (await client.get(LEADS)).status_code == 401


async def test_leads_rbac_forbidden(client: AsyncClient, db: AsyncSession) -> None:
    await make_user(db, "leads-team@example.com", role="team")
    await make_user(db, "leads-client@example.com", role="client")
    some_id = str(uuid.uuid4())
    for email in ("leads-team@example.com", "leads-client@example.com"):
        token = await token_for(client, email)
        assert (await client.get(LEADS, headers=auth(token))).status_code == 403
        r = await client.patch(f"{LEADS}/{some_id}", json={"is_read": True}, headers=auth(token))
        assert r.status_code == 403
        assert (await client.delete(f"{LEADS}/{some_id}", headers=auth(token))).status_code == 403


async def test_leads_listed_newest_first(client: AsyncClient, db: AsyncSession) -> None:
    await make_user(db, "leads-admin1@example.com")
    await make_lead(db, "First", "first@example.com")
    await make_lead(db, "Second", "second@example.com")
    token = await token_for(client, "leads-admin1@example.com")

    r = await client.get(LEADS, headers=auth(token))
    assert r.status_code == 200, r.text
    body = r.json()
    emails = [row["email"] for row in body]
    # Newest-first: Second was inserted after First.
    assert emails.index("second@example.com") < emails.index("first@example.com")


async def test_lead_mark_read(client: AsyncClient, db: AsyncSession) -> None:
    await make_user(db, "leads-admin2@example.com")
    lead = await make_lead(db, "Mark", "mark@example.com")
    token = await token_for(client, "leads-admin2@example.com")

    r = await client.patch(f"{LEADS}/{lead.id}", json={"is_read": True}, headers=auth(token))
    assert r.status_code == 200, r.text
    assert r.json()["is_read"] is True

    await db.refresh(lead)
    assert lead.is_read is True


async def test_lead_patch_missing_is_404(client: AsyncClient, db: AsyncSession) -> None:
    await make_user(db, "leads-admin3@example.com")
    token = await token_for(client, "leads-admin3@example.com")
    r = await client.patch(f"{LEADS}/{uuid.uuid4()}", json={"is_read": True}, headers=auth(token))
    assert r.status_code == 404


async def test_lead_delete(client: AsyncClient, db: AsyncSession) -> None:
    await make_user(db, "leads-admin4@example.com")
    lead = await make_lead(db, "Gone", "gone@example.com")
    lead_id = lead.id
    token = await token_for(client, "leads-admin4@example.com")

    r = await client.delete(f"{LEADS}/{lead_id}", headers=auth(token))
    assert r.status_code == 204, r.text

    assert (await db.execute(select(Lead).where(Lead.id == lead_id))).scalar_one_or_none() is None


async def test_lead_delete_missing_is_404(client: AsyncClient, db: AsyncSession) -> None:
    await make_user(db, "leads-admin5@example.com")
    token = await token_for(client, "leads-admin5@example.com")
    r = await client.delete(f"{LEADS}/{uuid.uuid4()}", headers=auth(token))
    assert r.status_code == 404
