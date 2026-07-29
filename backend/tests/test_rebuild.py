"""Tests for the frontend rebuild hook.

The thing worth protecting here is the *predicate*: it is what decides whether a
piece of published content ever becomes reachable, and it is driven by path
strings rather than by a call in each endpoint, so a router rename would break it
silently. These assertions are what turn that into a test failure.
"""

from __future__ import annotations

import asyncio

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app import rebuild
from app.config import get_settings
from tests.test_blog import auth, make_user, post_payload, token_for

# ---------------------------------------------------------------------------
# Which requests should queue a rebuild
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "path",
    [
        "/api/v1/admin/blog",
        "/api/v1/admin/blog/my-post",
        "/api/v1/admin/seo-pages",
        "/api/v1/admin/seo-pages/landing",
        "/api/v1/admin/services",
        "/api/v1/admin/services/web",
        "/api/v1/admin/projects/northwind-labs",
        "/api/v1/admin/jobs/senior-engineer",
    ],
)
@pytest.mark.parametrize("method", ["POST", "PUT", "PATCH", "DELETE"])
def test_content_mutations_trigger(path: str, method: str) -> None:
    assert rebuild.affects_published_urls(path, method) is True


@pytest.mark.parametrize("method", ["GET", "HEAD", "OPTIONS"])
def test_reads_never_trigger(method: str) -> None:
    assert rebuild.affects_published_urls("/api/v1/admin/blog/my-post", method) is False


@pytest.mark.parametrize(
    "path",
    [
        # None of these adds or removes a URL, so none needs a build.
        "/api/v1/admin/team",
        "/api/v1/admin/brand",
        "/api/v1/admin/content",
        "/api/v1/admin/uploads",
        "/api/v1/admin/users",
        "/api/v1/auth/login",
        "/api/v1/contact",
        # Public reads are not writes at all.
        "/api/v1/public/blog",
    ],
)
def test_non_url_owning_paths_do_not_trigger(path: str) -> None:
    assert rebuild.affects_published_urls(path, "POST") is False


# ---------------------------------------------------------------------------
# Scheduling behaviour
# ---------------------------------------------------------------------------


@pytest.fixture(autouse=True)
def _clean_pending():
    """No window may leak between tests — the module state is global."""
    yield
    rebuild._pending = None  # noqa: SLF001


async def test_disabled_by_default_schedules_nothing() -> None:
    """An unset hook URL must not create a task, or CI would sleep for two minutes."""
    assert get_settings().rebuild_hook_enabled is False
    await rebuild.schedule_rebuild()
    assert rebuild._pending is None  # noqa: SLF001


async def test_burst_of_changes_coalesces_into_one_build(monkeypatch) -> None:
    """Ten saves in a row must queue one build, not ten."""
    calls: list[str] = []

    settings = get_settings()
    hook = "https://example.invalid/hook"
    monkeypatch.setattr(settings, "vercel_deploy_hook_url", hook, raising=False)
    monkeypatch.setattr(settings, "rebuild_debounce_seconds", 0, raising=False)

    # Replace the network leg entirely; we are asserting on scheduling, not HTTP.
    async def _fire(delay_seconds: int) -> None:
        await asyncio.sleep(delay_seconds)
        calls.append("fired")
        rebuild._pending = None  # noqa: SLF001

    monkeypatch.setattr(rebuild, "_fire", _fire)

    for _ in range(10):
        await rebuild.schedule_rebuild()

    pending = rebuild._pending  # noqa: SLF001
    assert pending is not None
    await pending
    assert calls == ["fired"], "a burst of edits must produce exactly one build"


async def test_a_later_change_opens_a_new_window(monkeypatch) -> None:
    """Once a build has fired, the next change must be able to queue another."""
    fired = 0

    settings = get_settings()
    hook = "https://example.invalid/hook"
    monkeypatch.setattr(settings, "vercel_deploy_hook_url", hook, raising=False)
    monkeypatch.setattr(settings, "rebuild_debounce_seconds", 0, raising=False)

    async def _fire(delay_seconds: int) -> None:
        nonlocal fired
        await asyncio.sleep(delay_seconds)
        fired += 1
        rebuild._pending = None  # noqa: SLF001

    monkeypatch.setattr(rebuild, "_fire", _fire)

    await rebuild.schedule_rebuild()
    await rebuild._pending  # noqa: SLF001
    await rebuild.schedule_rebuild()
    await rebuild._pending  # noqa: SLF001

    assert fired == 2


# ---------------------------------------------------------------------------
# The middleware wiring
# ---------------------------------------------------------------------------
#
# The unit tests above prove the predicate and the coalescing. They cannot prove
# that the middleware is actually installed, or that it passes the path the
# predicate expects — and if it does not, the symptom is that published content
# never appears and nothing anywhere errors. These two drive a real request
# through the app to close that gap.


async def test_publishing_a_post_queues_a_rebuild(
    client: AsyncClient, db: AsyncSession, monkeypatch
) -> None:
    scheduled = 0

    async def _spy() -> None:
        nonlocal scheduled
        scheduled += 1

    # Patched on the module main.py imported *from*, which is where the
    # middleware's reference points.
    monkeypatch.setattr("app.main.schedule_rebuild", _spy)

    await make_user(db, "rebuild-admin@example.com")
    token = await token_for(client, "rebuild-admin@example.com")

    r = await client.post(
        "/api/v1/admin/blog",
        json=post_payload("rebuild-hook-post", status="published"),
        headers=auth(token),
    )
    assert r.status_code == 201, r.text
    assert scheduled == 1, "creating a post must queue a rebuild"


async def test_failed_write_does_not_queue_a_rebuild(
    client: AsyncClient, monkeypatch
) -> None:
    """An unauthenticated write changed nothing — and must not burn build minutes."""
    scheduled = 0

    async def _spy() -> None:
        nonlocal scheduled
        scheduled += 1

    monkeypatch.setattr("app.main.schedule_rebuild", _spy)

    r = await client.post("/api/v1/admin/blog", json=post_payload("unauthorised-post"))
    assert r.status_code == 401, r.text
    assert scheduled == 0
