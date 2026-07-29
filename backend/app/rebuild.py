"""Fires the frontend's deploy hook when publishable content changes.

Why the API has to care about the frontend's build at all: every dynamic route
on the site sets ``dynamicParams = false``, because that is the only way to make
a request-time 404 render as real HTML rather than an empty document (the full
reasoning is in ``app/not-found.tsx`` in the web app). The consequence is that
``generateStaticParams`` pins the servable slug set at build time — so a post
created here after the last deploy would 404 until the next one. This module
buys that back: a content change here triggers a rebuild there, and the new slug
is live once it finishes.

Design notes:

* **One choke point, not twenty call sites.** This is driven by a middleware in
  ``app.main`` keyed on request path and method, not by a ``trigger()`` call
  added to each mutating endpoint. There are ~20 of those across five routers,
  and the failure mode of the per-endpoint approach is that someone adds the
  twenty-first and their content silently never goes live. Routing it through
  one predicate makes that unrepresentable, and covers new endpoints for free.

* **Coalescing, not debouncing.** A burst of saves must produce *at least* one
  build that lands after the last of them, and an editor hammering ⌘S must not
  push the build indefinitely into the future. So the first change opens a
  window and later changes inside it are absorbed; the build fires when the
  window closes. Resetting the timer on every change (a true debounce) would let
  an active editing session postpone the build forever.

* **Never fails a request.** The admin's save succeeded; a deploy hook that is
  misconfigured, rate-limited, or down is an operational problem to read in the
  logs, not a 500 for the person who just clicked Publish.

* **Off by default.** With no hook URL configured this is inert, which is what
  keeps local development and the test suite from talking to the network.

Multi-worker note: the window is per-process, so N workers can fire N hooks for
the same burst. Vercel supersedes queued builds for the same branch, so the
practical effect is a wasted queue entry rather than N deploys.
"""

from __future__ import annotations

import asyncio

import httpx

from app.config import get_settings
from app.logging import logger

# Paths whose mutations can change which slugs the site is able to serve.
# Anything under these prefixes is a content collection with its own route in
# the web app; `team`, `brand`, `content` and `uploads` are deliberately absent
# because none of them adds or removes a URL.
_CONTENT_PREFIXES = (
    "/admin/blog",
    "/admin/seo-pages",
    "/admin/services",
    "/admin/projects",
    "/admin/jobs",
)

_MUTATING_METHODS = frozenset({"POST", "PUT", "PATCH", "DELETE"})

# The in-flight coalescing window, if one is open.
_pending: asyncio.Task[None] | None = None
_lock = asyncio.Lock()


def affects_published_urls(path: str, method: str) -> bool:
    """True when a successful `method` on `path` may change the site's URL set.

    Deliberately coarse: it does not try to tell a slug rename from a typo fix
    in the body. Distinguishing them means parsing the request body in
    middleware and knowing each collection's publish field, which is precisely
    the per-endpoint knowledge this design exists to avoid. The price of being
    coarse is an occasional rebuild that only needed an ISR revalidation; the
    price of being clever would be a missed rebuild, which is invisible until a
    reader reports a 404 on an article that is supposedly live.
    """
    if method.upper() not in _MUTATING_METHODS:
        return False
    return any(prefix in path for prefix in _CONTENT_PREFIXES)


async def _fire(delay_seconds: int) -> None:
    """Wait out the coalescing window, then POST the hook exactly once."""
    global _pending
    try:
        await asyncio.sleep(delay_seconds)
        settings = get_settings()
        url = settings.vercel_deploy_hook_url
        if not url:  # Disabled between scheduling and firing.
            return
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                res = await client.post(url)
            if res.is_success:
                logger.info("rebuild_triggered", status=res.status_code)
            else:
                # A 4xx here is almost always a stale or revoked hook URL.
                logger.warning("rebuild_hook_rejected", status=res.status_code)
        except httpx.HTTPError as exc:
            logger.warning("rebuild_hook_failed", error=str(exc))
    except asyncio.CancelledError:
        # Shutdown mid-window. Nothing to clean up; the next change reschedules.
        raise
    finally:
        async with _lock:
            if _pending is asyncio.current_task():
                _pending = None


async def schedule_rebuild() -> None:
    """Open a coalescing window, or join the one already open."""
    settings = get_settings()
    if not settings.rebuild_hook_enabled:
        return

    global _pending
    async with _lock:
        if _pending is not None and not _pending.done():
            # A build is already queued behind this window and will observe the
            # change that was just committed. Nothing more to do.
            return
        _pending = asyncio.create_task(_fire(settings.rebuild_debounce_seconds))


async def cancel_pending_rebuild() -> None:
    """Drop any open window. Called on shutdown so the task does not outlive the loop."""
    global _pending
    async with _lock:
        task, _pending = _pending, None
    if task is not None and not task.done():
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass  # Expected: we just cancelled it.
        except Exception as exc:  # noqa: BLE001
            # Logged rather than raised: this runs in the shutdown path, ahead of
            # dispose_engine(), and a failing hook must not leak the DB pool.
            logger.warning("rebuild_cancel_failed", error=str(exc))
