"""Shared slowapi limiter so routers can apply per-endpoint limits."""

from __future__ import annotations

from slowapi import Limiter

from app.config import get_settings
from app.netutil import client_ip


def _key(request) -> str:  # type: ignore[no-untyped-def]
    # Key on the forwarded client IP (not the socket peer) so throttling works
    # behind Render's proxy, where every request otherwise shares one IP.
    return client_ip(request)


_settings = get_settings()
limiter = Limiter(
    key_func=_key,
    default_limits=[_settings.rate_limit_default],
    headers_enabled=True,
)
