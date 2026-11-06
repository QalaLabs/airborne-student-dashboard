"""Token auth for Cadet + Admin API routes."""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import time
from typing import Any, Dict, Optional

from fastapi import Header, HTTPException

from server.config import API_SHARED_SECRET

TOKEN_TTL_SECONDS = 60 * 60 * 24 * 14  # 14 days


def _b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _b64decode(data: str) -> bytes:
    pad = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + pad)


def create_access_token(
    *,
    role: str,
    user_id: str,
    student_code: Optional[str] = None,
    email: Optional[str] = None,
    name: Optional[str] = None,
) -> str:
    payload: Dict[str, Any] = {
        "role": role,
        "uid": user_id,
        "iat": int(time.time()),
        "exp": int(time.time()) + TOKEN_TTL_SECONDS,
    }
    if student_code:
        payload["studentCode"] = student_code
    if email:
        payload["email"] = email
    if name:
        payload["name"] = name

    body = _b64encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    sig = hmac.new(
        API_SHARED_SECRET.encode("utf-8"),
        body.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return f"{body}.{sig}"


def decode_access_token(token: str) -> Dict[str, Any]:
    try:
        body, sig = token.rsplit(".", 1)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail="Invalid token format") from exc

    expected = hmac.new(
        API_SHARED_SECRET.encode("utf-8"),
        body.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    if not hmac.compare_digest(expected, sig):
        raise HTTPException(status_code=401, detail="Invalid or tampered token")

    try:
        payload = json.loads(_b64decode(body).decode("utf-8"))
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Corrupt token payload") from exc

    if int(payload.get("exp", 0)) < int(time.time()):
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")

    return payload


def _extract_bearer(authorization: Optional[str]) -> Optional[str]:
    if not authorization:
        return None
    parts = authorization.strip().split(" ", 1)
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1].strip()
    return None


def require_auth(
    authorization: Optional[str] = Header(None),
    x_airborne_token: Optional[str] = Header(None),
) -> Dict[str, Any]:
    token = _extract_bearer(authorization) or x_airborne_token
    if not token:
        if os.environ.get("ENV") == "development":
            return {"role": "dev", "uid": "dev", "studentCode": "AA-CPL-2026-084"}
        raise HTTPException(status_code=401, detail="Missing Authorization bearer token")
    return decode_access_token(token)


def require_student(claims: Dict[str, Any] = None) -> Dict[str, Any]:
    # Used as Depends(require_student) after wrapping
    raise NotImplementedError


def get_student_claims(
    authorization: Optional[str] = Header(None),
    x_airborne_token: Optional[str] = Header(None),
) -> Dict[str, Any]:
    claims = require_auth(authorization, x_airborne_token)
    if claims.get("role") not in ("student", "admin", "dev"):
        raise HTTPException(status_code=403, detail="Cadet or admin clearance required")
    return claims


def get_admin_claims(
    authorization: Optional[str] = Header(None),
    x_airborne_token: Optional[str] = Header(None),
) -> Dict[str, Any]:
    claims = require_auth(authorization, x_airborne_token)
    if claims.get("role") not in ("admin", "dev"):
        raise HTTPException(status_code=403, detail="Academy admin clearance required")
    return claims


def assert_student_access(claims: Dict[str, Any], student_code: str) -> None:
    """Admins can access any cadet; students only themselves."""
    if claims.get("role") in ("admin", "dev"):
        return
    own = (claims.get("studentCode") or "").strip().upper()
    if own != (student_code or "").strip().upper():
        raise HTTPException(status_code=403, detail="Cross-cadet access denied")
