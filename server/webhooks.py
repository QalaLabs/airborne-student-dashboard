"""
Airborne Aviation Academy — Admin OS Webhook & Event Integration Bridge
Handles bidirectional webhook dispatch and verification between
Airborne Student Portal and Airborne Admin OS.
"""
from __future__ import annotations

import hmac
import hashlib
import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional
import httpx

from server.config import (
    API_SHARED_SECRET,
    ADMIN_PANEL_URL,
    ORG_ID,
)

logger = logging.getLogger("airborne.webhooks")


def generate_hmac_signature(payload_bytes: bytes, secret: str = API_SHARED_SECRET) -> str:
    """Computes standard HMAC-SHA256 hex digest."""
    return hmac.new(secret.encode("utf-8"), payload_bytes, hashlib.sha256).hexdigest()


def verify_hmac_signature(payload_bytes: bytes, signature: str, secret: str = API_SHARED_SECRET) -> bool:
    """Secure constant-time comparison of HMAC-SHA256 signatures."""
    if not signature:
        return False
    expected = generate_hmac_signature(payload_bytes, secret)
    return hmac.compare_digest(expected.lower(), signature.strip().lower())


def dispatch_event_to_admin_os(
    event_name: str,
    data: Dict[str, Any],
    actor_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Dispatches an event from the Student Portal to Airborne Admin OS.
    Runs with high timeout resilience so student actions never fail if Admin OS is offline.
    """
    payload = {
        "event": event_name,
        "orgId": ORG_ID,
        "actorId": actor_id or "student-portal-agent",
        "data": data,
        "timestamp": datetime.utcnow().isoformat(),
        "source": "airborne-student-portal"
    }

    payload_json = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    signature = generate_hmac_signature(payload_json, API_SHARED_SECRET)

    headers = {
        "Content-Type": "application/json",
        "X-Airborne-Signature": signature,
        "X-Airborne-Secret": API_SHARED_SECRET,
        "User-Agent": "AirborneStudentPortal/1.0",
    }

    # Candidate targets: check local dev server (port 4000) then production cloud run
    candidate_urls = [
        "http://localhost:4000/api/v1/webhooks/student-portal",
        f"{ADMIN_PANEL_URL.rstrip('/')}/api/v1/webhooks/student-portal",
    ]

    dispatch_result = {"event": event_name, "success": False, "attempts": []}

    for target_url in candidate_urls:
        try:
            with httpx.Client(timeout=2.0) as client:
                res = client.post(target_url, content=payload_json, headers=headers)
                dispatch_result["attempts"].append({
                    "url": target_url,
                    "status_code": res.status_code,
                    "response": res.text[:200]
                })
                if res.status_code in (200, 201, 202):
                    dispatch_result["success"] = True
                    dispatch_result["delivered_to"] = target_url
                    logger.info("Webhook %s successfully delivered to Admin OS at %s", event_name, target_url)
                    break
        except Exception as e:
            dispatch_result["attempts"].append({
                "url": target_url,
                "error": str(e)
            })

    return dispatch_result
