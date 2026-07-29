"""FastAPI app factory."""

from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app import __version__
from app.config import get_settings
from app.db import dispose_engine, get_engine
from app.errors import install_exception_handlers
from app.limiter import limiter
from app.logging import configure_logging, logger
from app.middleware import RequestIDMiddleware
from app.rebuild import affects_published_urls, cancel_pending_rebuild, schedule_rebuild
from app.routers import (
    auth,
    blog,
    brand,
    client_project,
    contact,
    content,
    jobs,
    projects,
    public,
    seo_pages,
    services,
    team,
    uploads,
    users,
)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    configure_logging()
    settings = get_settings()
    get_engine()  # eager init so connection errors surface at boot
    logger.info(
        "startup",
        env=settings.app_env,
        version=__version__,
        cors_origins=settings.cors_origins,
        uploads_enabled=settings.uploads_enabled,
        rebuild_hook_enabled=settings.rebuild_hook_enabled,
    )
    try:
        yield
    finally:
        await cancel_pending_rebuild()
        await dispose_engine()
        logger.info("shutdown")


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="Zenova API",
        version=__version__,
        default_response_class=ORJSONResponse,
        docs_url="/docs" if not settings.is_production else None,
        redoc_url="/redoc" if not settings.is_production else None,
        openapi_url="/openapi.json" if not settings.is_production else None,
        lifespan=lifespan,
    )
    app.state.limiter = limiter

    app.add_middleware(RequestIDMiddleware)
    app.add_middleware(SlowAPIMiddleware)

    @app.middleware("http")
    async def _rebuild_on_content_change(request, call_next):  # type: ignore[no-untyped-def]
        """Queue a frontend rebuild after any successful content mutation.

        Here rather than in the five content routers because the routers have
        ~20 mutating endpoints between them, and the one that gets forgotten is
        the one whose content silently never goes live. See app/rebuild.py.

        Only on 2xx: a rejected or unauthorised write changed nothing, and
        rebuilding for it would hand an unauthenticated caller a way to burn
        build minutes.
        """
        response = await call_next(request)
        if 200 <= response.status_code < 300 and affects_published_urls(
            request.url.path, request.method
        ):
            await schedule_rebuild()
        return response
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
        expose_headers=["X-Request-ID"],
        max_age=600,
    )

    @app.exception_handler(RateLimitExceeded)
    async def _ratelimited(_, __) -> ORJSONResponse:  # type: ignore[no-untyped-def]
        return ORJSONResponse(
            status_code=429,
            content={
                "error": {
                    "code": "rate_limited",
                    "message": "Too many requests. Slow down.",
                }
            },
        )

    install_exception_handlers(app)

    @app.get("/health", tags=["meta"])
    async def health() -> dict[str, str]:
        return {"status": "ok", "version": __version__, "env": settings.app_env}

    @app.get("/readyz", tags=["meta"])
    async def readyz() -> dict[str, str]:
        """Probe that touches the DB so orchestrators can wait for real readiness."""
        from sqlalchemy import text

        from app.db import get_sessionmaker

        sm = get_sessionmaker()
        async with sm() as session:
            await session.execute(text("SELECT 1"))
        return {"status": "ready"}

    @app.get("/", include_in_schema=False)
    async def root() -> dict[str, str]:
        return {"name": "Zenova API", "version": __version__, "docs": "/docs"}

    prefix = "/api/v1"
    app.include_router(auth.router, prefix=prefix)
    app.include_router(public.router, prefix=prefix)
    app.include_router(services.router, prefix=prefix)
    app.include_router(projects.router, prefix=prefix)
    app.include_router(jobs.router, prefix=prefix)
    app.include_router(team.router, prefix=prefix)
    app.include_router(content.router, prefix=prefix)
    app.include_router(brand.router, prefix=prefix)
    app.include_router(uploads.router, prefix=prefix)
    app.include_router(users.router, prefix=prefix)
    app.include_router(client_project.router, prefix=prefix)
    app.include_router(contact.router, prefix=prefix)
    app.include_router(blog.router, prefix=prefix)
    app.include_router(seo_pages.router, prefix=prefix)

    return app


app = create_app()
