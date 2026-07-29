"""Tests for admin blog CRUD + public blog read endpoints.

The test DB is session-scoped and shared across tests, so every test uses
unique slugs (and unique tags where totals are asserted) to stay independent.
"""

from datetime import UTC, datetime

from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import AdminUser, BlogPost
from app.security import hash_password

ADMIN_BLOG = "/api/v1/admin/blog"
PUBLIC_BLOG = "/api/v1/public/blog"
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


def post_payload(slug: str, **overrides: object) -> dict:
    payload: dict = {
        "slug": slug,
        "title": f"Post {slug}",
        "excerpt": "A short excerpt.",
        "content_html": "<p>Hello world</p>",
        "tags": ["design"],
        "status": "draft",
    }
    payload.update(overrides)
    return payload


async def make_post(
    db: AsyncSession,
    slug: str,
    *,
    status: str = "published",
    published_at: datetime | None = None,
    tags: list[str] | None = None,
) -> BlogPost:
    post = BlogPost(
        slug=slug,
        title=f"Post {slug}",
        excerpt=f"Excerpt for {slug}",
        content_html=f"<p>Body of {slug}</p>",
        tags=tags if tags is not None else [],
        status=status,
        published_at=published_at,
    )
    db.add(post)
    await db.commit()
    return post


# ---------------------------------------------------------------------------
# Admin CRUD
# ---------------------------------------------------------------------------


async def test_blog_requires_auth(client: AsyncClient) -> None:
    assert (await client.get(ADMIN_BLOG)).status_code == 401
    assert (await client.post(ADMIN_BLOG, json=post_payload("x"))).status_code == 401


async def test_blog_rbac_forbidden(client: AsyncClient, db: AsyncSession) -> None:
    await make_user(db, "blog-team@example.com", role="team")
    await make_user(db, "blog-client@example.com", role="client")
    for email in ("blog-team@example.com", "blog-client@example.com"):
        token = await token_for(client, email)
        assert (await client.get(ADMIN_BLOG, headers=auth(token))).status_code == 403
        r = await client.post(ADMIN_BLOG, json=post_payload("rbac-post"), headers=auth(token))
        assert r.status_code == 403
        assert (
            await client.delete(f"{ADMIN_BLOG}/rbac-post", headers=auth(token))
        ).status_code == 403


async def test_blog_create_and_get(client: AsyncClient, db: AsyncSession) -> None:
    await make_user(db, "blog-admin1@example.com")
    token = await token_for(client, "blog-admin1@example.com")

    r = await client.post(ADMIN_BLOG, json=post_payload("create-post"), headers=auth(token))
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["slug"] == "create-post"
    assert body["status"] == "draft"
    assert body["published_at"] is None
    assert body["created_at"] is not None

    r = await client.get(f"{ADMIN_BLOG}/create-post", headers=auth(token))
    assert r.status_code == 200
    assert r.json()["content_html"] == "<p>Hello world</p>"


async def test_blog_create_duplicate_conflict(client: AsyncClient, db: AsyncSession) -> None:
    await make_user(db, "blog-admin2@example.com")
    token = await token_for(client, "blog-admin2@example.com")
    assert (
        await client.post(ADMIN_BLOG, json=post_payload("dup-post"), headers=auth(token))
    ).status_code == 201
    assert (
        await client.post(ADMIN_BLOG, json=post_payload("dup-post"), headers=auth(token))
    ).status_code == 409


async def test_blog_slug_new_rejected(client: AsyncClient, db: AsyncSession) -> None:
    await make_user(db, "blog-admin3@example.com")
    token = await token_for(client, "blog-admin3@example.com")
    r = await client.post(ADMIN_BLOG, json=post_payload("new"), headers=auth(token))
    assert r.status_code == 422


async def test_blog_publish_autosets_published_at(
    client: AsyncClient, db: AsyncSession
) -> None:
    await make_user(db, "blog-admin4@example.com")
    token = await token_for(client, "blog-admin4@example.com")

    r = await client.post(
        ADMIN_BLOG, json=post_payload("autodate-post", status="published"), headers=auth(token)
    )
    assert r.status_code == 201, r.text
    assert r.json()["published_at"] is not None

    # Publishing an existing draft via PUT also stamps the date.
    r = await client.post(ADMIN_BLOG, json=post_payload("autodate-put"), headers=auth(token))
    assert r.status_code == 201
    r = await client.put(
        f"{ADMIN_BLOG}/autodate-put",
        json=post_payload("autodate-put", status="published"),
        headers=auth(token),
    )
    assert r.status_code == 200, r.text
    assert r.json()["published_at"] is not None


async def test_blog_rename_moves_row(client: AsyncClient, db: AsyncSession) -> None:
    await make_user(db, "blog-admin5@example.com")
    token = await token_for(client, "blog-admin5@example.com")

    r = await client.post(ADMIN_BLOG, json=post_payload("rename-old"), headers=auth(token))
    assert r.status_code == 201
    created_at = r.json()["created_at"]

    r = await client.put(
        f"{ADMIN_BLOG}/rename-old", json=post_payload("rename-new"), headers=auth(token)
    )
    assert r.status_code == 200, r.text
    assert r.json()["slug"] == "rename-new"
    assert r.json()["created_at"] == created_at  # creation timestamp preserved

    assert (await client.get(f"{ADMIN_BLOG}/rename-old", headers=auth(token))).status_code == 404
    assert (await client.get(f"{ADMIN_BLOG}/rename-new", headers=auth(token))).status_code == 200


async def test_blog_rename_conflict(client: AsyncClient, db: AsyncSession) -> None:
    await make_user(db, "blog-admin6@example.com")
    token = await token_for(client, "blog-admin6@example.com")
    for slug in ("clash-a", "clash-b"):
        assert (
            await client.post(ADMIN_BLOG, json=post_payload(slug), headers=auth(token))
        ).status_code == 201
    r = await client.put(
        f"{ADMIN_BLOG}/clash-a", json=post_payload("clash-b"), headers=auth(token)
    )
    assert r.status_code == 409


async def test_blog_delete(client: AsyncClient, db: AsyncSession) -> None:
    await make_user(db, "blog-admin7@example.com")
    token = await token_for(client, "blog-admin7@example.com")
    assert (
        await client.post(ADMIN_BLOG, json=post_payload("gone-post"), headers=auth(token))
    ).status_code == 201
    assert (
        await client.delete(f"{ADMIN_BLOG}/gone-post", headers=auth(token))
    ).status_code == 204
    assert (
        await client.delete(f"{ADMIN_BLOG}/gone-post", headers=auth(token))
    ).status_code == 404
    assert (
        await db.execute(select(BlogPost).where(BlogPost.slug == "gone-post"))
    ).scalar_one_or_none() is None


# ---------------------------------------------------------------------------
# Public reads
# ---------------------------------------------------------------------------


async def test_public_blog_lists_only_published(client: AsyncClient, db: AsyncSession) -> None:
    await make_post(db, "pub-a", published_at=datetime(2026, 1, 1, tzinfo=UTC))
    await make_post(db, "pub-b", published_at=datetime(2026, 2, 1, tzinfo=UTC))
    await make_post(db, "pub-draft", status="draft")

    r = await client.get(PUBLIC_BLOG, params={"limit": 50})
    assert r.status_code == 200, r.text
    slugs = [item["slug"] for item in r.json()["items"]]
    assert "pub-draft" not in slugs
    # Newest first.
    assert slugs.index("pub-b") < slugs.index("pub-a")
    # Listing payload stays light — no body HTML.
    assert "content_html" not in r.json()["items"][0]
    # ...but it does carry updated_at: sitemap.xml reads the listing and needs a
    # real modification date for <lastmod>. published_at alone goes stale the
    # first time a published post is edited.
    assert r.json()["items"][0]["updated_at"]


async def test_public_blog_pagination_and_tag_filter(
    client: AsyncClient, db: AsyncSession
) -> None:
    tag = "unique-pagination-tag"
    for i in range(3):
        await make_post(
            db,
            f"tagged-{i}",
            published_at=datetime(2026, 3, i + 1, tzinfo=UTC),
            tags=[tag],
        )
    await make_post(db, "tagged-draft", status="draft", tags=[tag])

    r = await client.get(PUBLIC_BLOG, params={"tag": tag, "limit": 2, "offset": 0})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["total"] == 3  # draft with the tag is excluded
    assert len(body["items"]) == 2
    assert body["items"][0]["slug"] == "tagged-2"

    r = await client.get(PUBLIC_BLOG, params={"tag": tag, "limit": 2, "offset": 2})
    body = r.json()
    assert len(body["items"]) == 1
    assert body["items"][0]["slug"] == "tagged-0"


async def test_public_blog_detail(client: AsyncClient, db: AsyncSession) -> None:
    await make_post(db, "detail-post", published_at=datetime(2026, 4, 1, tzinfo=UTC))
    r = await client.get(f"{PUBLIC_BLOG}/detail-post")
    assert r.status_code == 200, r.text
    assert r.json()["content_html"] == "<p>Body of detail-post</p>"


async def test_public_blog_detail_hides_drafts(client: AsyncClient, db: AsyncSession) -> None:
    await make_post(db, "hidden-draft", status="draft")
    assert (await client.get(f"{PUBLIC_BLOG}/hidden-draft")).status_code == 404
    assert (await client.get(f"{PUBLIC_BLOG}/never-existed")).status_code == 404
