"""Inbound third-party webhooks.

- ``POST /webhooks/resend`` — Resend email event webhooks (delivered, bounced,
  opened, clicked, etc.). Signature verified when ``RESEND_WEBHOOK_SECRET`` is set.
"""

from __future__ import annotations

import base64
import binascii
import hashlib
import hmac
from typing import Annotated

from fastapi import APIRouter, Header, Request, status

from app.config import get_settings
from app.errors import AuthError
from app.logging import logger

router = APIRouter(tags=["webhooks"])

_settings = get_settings()


class WebhookVerificationError(AuthError):
    status_code = 401
    code = "webhook_verification_failed"
    message = "Webhook signature verification failed."


def _resend_signing_key(secret: str) -> bytes:
    """Return the raw HMAC key from a Resend/Svix signing secret.

    Svix secrets are usually ``whsec_<base64>``; the base64 portion must be
    decoded before use. Plain secrets are accepted as-is.
    """
    prefix = "whsec_"
    if secret.startswith(prefix):
        encoded = secret[len(prefix) :]
        try:
            return base64.b64decode(encoded)
        except (binascii.Error, ValueError) as e:
            raise WebhookVerificationError("Malformed Resend webhook secret.") from e
    return secret.encode()


def _verify_resend_signature(
    body: bytes,
    secret: str,
    svix_id: str,
    svix_timestamp: str,
    svix_signature: str,
) -> None:
    """Verify a Resend/Svix webhook signature.

    Resend signs payloads using HMAC-SHA256. The signed content is the
    dot-separated ``svix-id``, ``svix-timestamp`` and raw request body.
    The ``svix-signature`` header may contain one or more space-separated
    ``v1,<base64>`` signatures; verification succeeds if any matches.
    """
    if not secret:
        raise WebhookVerificationError("Resend webhook secret is not configured.")

    key = _resend_signing_key(secret)
    payload = f"{svix_id}.{svix_timestamp}.".encode() + body
    mac = hmac.new(key, payload, hashlib.sha256).digest()
    expected = base64.b64encode(mac).decode()

    for part in svix_signature.split():
        if part.startswith("v1,"):
            provided = part[3:].strip()
            if hmac.compare_digest(provided, expected):
                return

    raise WebhookVerificationError("Invalid Resend webhook signature.")


@router.post("/webhooks/resend", status_code=status.HTTP_204_NO_CONTENT)
async def resend_webhook(
    request: Request,
    svix_id: Annotated[str | None, Header()] = None,
    svix_timestamp: Annotated[str | None, Header()] = None,
    svix_signature: Annotated[str | None, Header()] = None,
) -> None:
    """Receive Resend email event webhooks.

    Returns 204 on success so Resend marks the event as acknowledged. The
    endpoint intentionally does not expose whether verification failed beyond
    a 401; logging retains enough detail for debugging.
    """
    body = await request.body()

    if _settings.resend_webhook_secret:
        if not svix_id or not svix_timestamp or not svix_signature:
            raise WebhookVerificationError("Missing Svix signature headers.")
        _verify_resend_signature(
            body=body,
            secret=_settings.resend_webhook_secret,
            svix_id=svix_id,
            svix_timestamp=svix_timestamp,
            svix_signature=svix_signature,
        )

    try:
        data = await request.json() if body else {}
    except Exception:
        data = {}

    event_type = data.get("type") if isinstance(data, dict) else None
    event_id = data.get("id") if isinstance(data, dict) else None
    logger.info(
        "resend_webhook_received",
        event_type=event_type,
        event_id=event_id,
        body_bytes=len(body),
    )
