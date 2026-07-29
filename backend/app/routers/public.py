"""Unauthenticated read endpoints used by the public site."""

from __future__ import annotations

from fastapi import APIRouter, Query
from sqlalchemy import func, select

from app.deps import DbSession
from app.errors import NotFoundError
from app.models import (
    BlogPost,
    BrandSettings,
    Job,
    Project,
    SeoPage,
    Service,
    SiteContent,
    TeamMember,
)
from app.schemas import (
    BrandSettings as BrandSchema,
)
from app.schemas import (
    JobDetail,
    ProjectDetail,
    PublicBlogList,
    PublicBlogListItem,
    PublicBlogPost,
    PublicSeoPage,
    PublicSeoPageListItem,
    ServiceDetail,
    SiteBundle,
)
from app.schemas import (
    SiteContent as SiteContentSchema,
)
from app.schemas import (
    TeamMember as TeamMemberSchema,
)

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/site", response_model=SiteBundle)
async def site(db: DbSession) -> SiteBundle:
    """Return everything the public site needs in one request."""
    services_q = await db.execute(select(Service).order_by(Service.position, Service.slug))
    projects_q = await db.execute(select(Project).order_by(Project.position, Project.slug))
    jobs_q = await db.execute(select(Job).order_by(Job.position, Job.slug))
    team_q = await db.execute(select(TeamMember).order_by(TeamMember.position, TeamMember.id))
    content_row = await db.get(SiteContent, 1)
    brand_row = await db.get(BrandSettings, 1)

    if content_row is None or brand_row is None:
        raise NotFoundError("Site content is not initialized — run the seed.")

    return SiteBundle(
        services=[ServiceDetail.model_validate(s.data) for s in services_q.scalars()],
        projects=[ProjectDetail.model_validate(p.data) for p in projects_q.scalars()],
        jobs=[JobDetail.model_validate(j.data) for j in jobs_q.scalars()],
        team=[TeamMemberSchema.model_validate(t.data) for t in team_q.scalars()],
        content=SiteContentSchema.model_validate(content_row.data),
        brand=BrandSchema.model_validate(brand_row.data),
    )


@router.get("/services", response_model=list[ServiceDetail])
async def list_services(db: DbSession) -> list[ServiceDetail]:
    rows = await db.execute(select(Service).order_by(Service.position, Service.slug))
    return [ServiceDetail.model_validate(s.data) for s in rows.scalars()]


@router.get("/services/{slug}", response_model=ServiceDetail)
async def get_service(slug: str, db: DbSession) -> ServiceDetail:
    row = await db.get(Service, slug)
    if row is None:
        raise NotFoundError(f"Service '{slug}' not found.")
    return ServiceDetail.model_validate(row.data)


@router.get("/projects", response_model=list[ProjectDetail])
async def list_projects(db: DbSession) -> list[ProjectDetail]:
    rows = await db.execute(select(Project).order_by(Project.position, Project.slug))
    return [ProjectDetail.model_validate(p.data) for p in rows.scalars()]


@router.get("/projects/{slug}", response_model=ProjectDetail)
async def get_project(slug: str, db: DbSession) -> ProjectDetail:
    row = await db.get(Project, slug)
    if row is None:
        raise NotFoundError(f"Project '{slug}' not found.")
    return ProjectDetail.model_validate(row.data)


@router.get("/jobs", response_model=list[JobDetail])
async def list_jobs(db: DbSession) -> list[JobDetail]:
    rows = await db.execute(select(Job).order_by(Job.position, Job.slug))
    return [JobDetail.model_validate(j.data) for j in rows.scalars()]


@router.get("/jobs/{slug}", response_model=JobDetail)
async def get_job(slug: str, db: DbSession) -> JobDetail:
    row = await db.get(Job, slug)
    if row is None:
        raise NotFoundError(f"Job '{slug}' not found.")
    return JobDetail.model_validate(row.data)


def _blog_list_item(row: BlogPost) -> PublicBlogListItem:
    return PublicBlogListItem(
        slug=row.slug,
        title=row.title,
        excerpt=row.excerpt,
        cover_image_url=row.cover_image_url,
        author_name=row.author_name,
        tags=row.tags,
        published_at=row.published_at,
        updated_at=row.updated_at,
    )


@router.get("/blog", response_model=PublicBlogList)
async def list_blog_posts(
    db: DbSession,
    limit: int = Query(12, ge=1, le=50),
    offset: int = Query(0, ge=0),
    tag: str | None = Query(None, max_length=60),
) -> PublicBlogList:
    """Published posts only, newest first."""
    filters = [BlogPost.status == "published"]
    if tag:
        filters.append(BlogPost.tags.contains([tag]))
    total = (
        await db.execute(select(func.count()).select_from(BlogPost).where(*filters))
    ).scalar_one()
    rows = await db.execute(
        select(BlogPost)
        .where(*filters)
        .order_by(BlogPost.published_at.desc().nulls_last(), BlogPost.slug)
        .limit(limit)
        .offset(offset)
    )
    return PublicBlogList(
        items=[_blog_list_item(row) for row in rows.scalars()],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/blog/{slug}", response_model=PublicBlogPost)
async def get_blog_post(slug: str, db: DbSession) -> PublicBlogPost:
    row = await db.get(BlogPost, slug)
    if row is None or row.status != "published":
        raise NotFoundError(f"Blog post '{slug}' not found.")
    return PublicBlogPost(
        slug=row.slug,
        title=row.title,
        excerpt=row.excerpt,
        cover_image_url=row.cover_image_url,
        author_name=row.author_name,
        tags=row.tags,
        published_at=row.published_at,
        content_html=row.content_html,
        meta_title=row.meta_title,
        meta_description=row.meta_description,
        og_image_url=row.og_image_url,
        updated_at=row.updated_at,
    )


@router.get("/pages", response_model=list[PublicSeoPageListItem])
async def list_seo_pages(db: DbSession) -> list[PublicSeoPageListItem]:
    """Published standalone pages — consumed by the build-time sitemap step."""
    rows = await db.execute(
        select(SeoPage).where(SeoPage.is_published).order_by(SeoPage.slug)
    )
    return [
        PublicSeoPageListItem(
            slug=row.slug,
            title=row.title,
            meta_title=row.meta_title,
            meta_description=row.meta_description,
            updated_at=row.updated_at,
        )
        for row in rows.scalars()
    ]


@router.get("/pages/{slug}", response_model=PublicSeoPage)
async def get_seo_page(slug: str, db: DbSession) -> PublicSeoPage:
    row = await db.get(SeoPage, slug)
    if row is None or not row.is_published:
        raise NotFoundError(f"Page '{slug}' not found.")
    return PublicSeoPage(
        slug=row.slug,
        title=row.title,
        content_html=row.content_html,
        meta_title=row.meta_title,
        meta_description=row.meta_description,
        og_image_url=row.og_image_url,
        updated_at=row.updated_at,
    )
