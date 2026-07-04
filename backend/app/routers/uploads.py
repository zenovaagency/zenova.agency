"""R2 media library — list, upload, delete."""

from __future__ import annotations

import io

from fastapi import APIRouter, File, Form, Query, UploadFile, status

from app.config import get_settings
from app.deps import CurrentAdmin
from app.errors import ValidationFailed
from app.logging import logger
from app.schemas import UploadItem, UploadList, UploadResult
from app.storage import (
    DuplicateUpload,
    StorageDisabled,
    StoredObject,
    delete_object,
    list_objects,
    upload_image,
)

router = APIRouter(prefix="/admin/uploads", tags=["admin", "uploads"])


def _to_item(obj: StoredObject) -> UploadItem:
    return UploadItem(
        url=obj.url,
        key=obj.key,
        name=obj.name,
        content_type=obj.content_type,
        size=obj.size,
        uploaded_at=obj.uploaded_at,
    )


@router.get("", response_model=UploadList)
async def list_uploads(
    current: CurrentAdmin,
    prefix: str | None = Query(default=None, max_length=120),
    limit: int = Query(default=500, ge=1, le=1000),
) -> UploadList:
    settings = get_settings()
    if not settings.uploads_enabled:
        raise StorageDisabled()
    objects = list_objects(prefix=prefix, limit=limit)
    logger.info(
        "uploads_listed",
        by=str(current.id),
        count=len(objects),
        prefix=prefix or "",
    )
    return UploadList(items=[_to_item(o) for o in objects], count=len(objects))


async def _do_upload(
    current: CurrentAdmin,
    file: UploadFile,
    prefix: str,
    force: bool,
    kind: str,
) -> UploadResult:
    """Shared handler for image and video uploads."""
    settings = get_settings()
    if not settings.uploads_enabled:
        raise StorageDisabled()
    if not file.filename:
        raise ValidationFailed("Missing filename.")
    if not file.content_type:
        raise ValidationFailed("Missing content type.")

    contents = await file.read()
    size = len(contents)

    try:
        public_url, key, renamed = upload_image(
            stream=io.BytesIO(contents),
            filename=file.filename,
            content_type=file.content_type,
            size=size,
            prefix=prefix,
            force=force,
        )
    except DuplicateUpload as e:
        logger.info(
            "upload_duplicate_blocked",
            by=str(current.id),
            key=e.existing_key,
            original_name=file.filename,
            size=size,
        )
        raise
    logger.info(
        f"upload_{kind}",
        by=str(current.id),
        key=key,
        original_name=file.filename,
        size=size,
        content_type=file.content_type,
        renamed=renamed,
        forced=force,
    )
    return UploadResult(
        url=public_url,
        key=key,
        name=key.rsplit("/", 1)[-1],
        content_type=file.content_type,
        size=size,
        renamed=renamed,
    )


@router.post("/image", response_model=UploadResult, status_code=status.HTTP_201_CREATED)
async def upload(
    current: CurrentAdmin,
    file: UploadFile = File(...),
    prefix: str = Form("projects"),
    force: bool = Form(False),
) -> UploadResult:
    """Upload an image.

    By default the object's key is derived from the uploaded filename so the
    library stays human-readable and clients can detect re-uploads. If a key
    already exists the request fails with ``409 duplicate_upload``; pass
    ``force=true`` to store the file with a ``(1)`` / ``(2)`` suffix instead.
    """
    return await _do_upload(current, file, prefix, force, "image")


@router.post("/video", response_model=UploadResult, status_code=status.HTTP_201_CREATED)
async def upload_video(
    current: CurrentAdmin,
    file: UploadFile = File(...),
    prefix: str = Form("services"),
    force: bool = Form(False),
) -> UploadResult:
    """Upload a video.

    Same duplicate-handling semantics as ``POST /admin/uploads/image``.
    """
    return await _do_upload(current, file, prefix, force, "video")


@router.delete("/image", status_code=status.HTTP_204_NO_CONTENT)
async def remove(current: CurrentAdmin, key: str) -> None:
    if not key or key.startswith("/") or ".." in key:
        raise ValidationFailed("Invalid object key.")
    delete_object(key)
    logger.info("delete_image", by=str(current.id), key=key)
