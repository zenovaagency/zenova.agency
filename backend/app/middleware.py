"""HTTP middleware: request ID + access logging.

Each request gets a stable ``request_id`` (forwarded via ``X-Request-ID`` if the
client provides one, otherwise generated). The ID is also bound to structlog
``contextvars`` so every log emitted inside the request — including ones from
deep inside routers — automatically carries it.

On the way out we emit a single ``request`` event with method, path, status,
latency, the client IP, and a truncated user agent. That one line is intended
to be the per-request access record: detailed enough to debug from, terse
enough to keep noise low.
"""

from __future__ import annotations

import time
import uuid

import structlog
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from starlette.types import ASGIApp

from app.netutil import client_ip as _client_ip

REQUEST_ID_HEADER = "X-Request-ID"
_SILENT_PATHS = {"/health", "/livez", "/readyz", "/", "/favicon.ico"}
_UA_LIMIT = 80

logger = structlog.get_logger("zenova.http")


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Attach a request ID to every request and emit a one-line access log."""

    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):  # type: ignore[no-untyped-def]
        rid = request.headers.get(REQUEST_ID_HEADER) or uuid.uuid4().hex
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(
            request_id=rid,
            client_ip=_client_ip(request),
        )
        request.state.request_id = rid

        started = time.perf_counter()
        try:
            response: Response = await call_next(request)
        except Exception as exc:
            elapsed_ms = (time.perf_counter() - started) * 1000
            logger.error(
                "request_failed",
                method=request.method,
                path=request.url.path,
                duration_ms=round(elapsed_ms, 2),
                error=type(exc).__name__,
            )
            structlog.contextvars.clear_contextvars()
            raise

        elapsed_ms = (time.perf_counter() - started) * 1000
        response.headers[REQUEST_ID_HEADER] = rid

        if request.url.path not in _SILENT_PATHS:
            ua = (request.headers.get("user-agent") or "")[:_UA_LIMIT]
            log = logger.warning if response.status_code >= 500 else (
                logger.info if response.status_code < 400 else logger.warning
            )
            log(
                "request",
                method=request.method,
                path=request.url.path,
                status=response.status_code,
                duration_ms=round(elapsed_ms, 2),
                query=request.url.query or None,
                ua=ua or None,
            )
        structlog.contextvars.clear_contextvars()
        return response
