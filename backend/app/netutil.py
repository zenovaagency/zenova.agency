"""Networking helpers shared by request logging and rate limiting."""

from __future__ import annotations

from starlette.requests import Request


def client_ip(request: Request) -> str:
    """Best-effort originating client IP.

    Prefers the first entry of ``X-Forwarded-For`` — the real client when the
    app sits behind a proxy (e.g. Render's load balancer), where the socket
    peer is the proxy and would collapse every visitor onto one IP. Falls back
    to the socket peer when no forwarded header is present.

    Both the access log and the rate limiter key on this, so they stay
    consistent: a throttled IP is the same IP that shows up in the logs.
    """
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        # Left-most entry is the originating client.
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "-"
