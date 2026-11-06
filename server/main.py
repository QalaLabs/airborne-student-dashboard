import os
import logging
from pathlib import Path
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Header, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

logger = logging.getLogger("airborne.api")

from server.config import (
    PORT, 
    GCR_CHATBOT_SERVICE_URL, 
    INTERNAL_RAG_SHARED_SECRET, 
    API_SHARED_SECRET,
    ADMIN_PANEL_URL,
    ORG_ID
)
from server.webhooks import verify_hmac_signature, dispatch_event_to_admin_os
from server.db import (
    init_db, 
    get_student_dashboard_from_admin_db,
    mark_attendance_in_admin_db,
    record_fee_payment_in_admin_db,
    record_chat_interaction_in_admin_db,
    record_quiz_attempt_in_admin_db,
    record_lecture_progress_in_admin_db,
    record_student_activity,
    get_student_activities_from_admin_db,
    get_student_scoped_context,
    authenticate_user,
    get_admin_dashboard_summary,
    admin_record_student_payment,
    submit_leave_request,
    admin_review_leave_request,
    admin_mark_attendance,
    get_pending_leave_requests,
    probe_database,
    provision_student_portal_access,
    get_student_provision_status,
    get_live_lms_courses_and_chapters,
    get_live_questions_for_practice,
    submit_live_quiz_attempt,
    get_live_student_certificates,
)
from server.auth import get_student_claims, get_admin_claims, assert_student_access
from server.bot_service import answer_as_aerobot

app = FastAPI(
    title="Airborne Aviation Academy - Student Dashboard & Airborne Admin DB Sync",
    version="2026.2.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class LoginRequest(BaseModel):
    role: str = "student" # "student" or "admin"
    identifier: str # roll number, email, or student code
    password: Optional[str] = ""

class AdminPaymentRequest(BaseModel):
    student_id: str
    amount: float
    payment_method: str = "BANK_TRANSFER"
    fee_type: Optional[str] = "Office Payment Receipt"

class ChatQueryRequest(BaseModel):
    student_id: str = "AA-CPL-2026-084"
    message: str
    history: Optional[List[dict]] = None

class AttendanceMarkRequest(BaseModel):
    student_id: str = "AA-CPL-2026-084"
    session_id: str = "TT-01"

class FeePayRequest(BaseModel):
    student_id: str = "AA-CPL-2026-084"
    amount: float = 35000.0
    payment_method: str = "UPI"

class QuizSubmitRequest(BaseModel):
    student_id: str = "AA-CPL-2026-084"
    subject: str = "Air Navigation"
    score: int
    max_score: int
    answers: Optional[Dict[str, Any]] = None

class CourseProgressRequest(BaseModel):
    student_id: str = "AA-CPL-2026-084"
    course_name: str
    completed_lectures: int
    total_lectures: int

class ActivityLogRequest(BaseModel):
    student_id: str = "AA-CPL-2026-084"
    verb: str
    activity_type: Optional[str] = "SYSTEM"
    title: str
    notes: Optional[str] = ""
    snapshot: Optional[Dict[str, Any]] = None
    context: Optional[Dict[str, Any]] = None

class LeaveRequestBody(BaseModel):
    student_id: str
    leave_date: str
    reason: str

class AdminLeaveReviewRequest(BaseModel):
    student_id: str
    leave_id: str
    status: str = "APPROVED"

class ProvisionPortalRequest(BaseModel):
    student_id: str
    password: str
    must_change_password: bool = True
    dispatch_webhook: bool = True

class AdminAttendanceRequest(BaseModel):
    student_id: str
    session_id: str = "TT-01"

# Security Dependency for GCR external communication
def verify_bot_auth(
    authorization: Optional[str] = Header(None),
    x_airborne_shared_secret: Optional[str] = Header(None)
):
    valid_bearer = f"Bearer {INTERNAL_RAG_SHARED_SECRET}"
    if authorization == valid_bearer or x_airborne_shared_secret == API_SHARED_SECRET:
        return True
    if os.environ.get("ENV") == "development":
        return True
    raise HTTPException(status_code=401, detail="Unauthorized: Invalid Airborne Bot Shared Secret")

@app.on_event("startup")
def on_startup():
    try:
        init_db()
    except Exception as e:
        logger.error(f"Notice: Initial DB bootstrap exception: {e}")

@app.get("/health")
def health_check():
    db = probe_database()
    return {
        "status": "healthy" if db.get("connected") else "degraded",
        "service": "airborne-student-dashboard",
        "copilot": "AeroBot (Brand Book 2026)",
        "admin_db_connected": bool(db.get("connected")),
        "database": db,
        "admin_panel_url": ADMIN_PANEL_URL,
        "port": PORT
    }

# -----------------------------------------------------------------------------
# 1. PULL FROM MAIN GCR AIRBORNE ADMIN DATABASE
# -----------------------------------------------------------------------------
@app.get("/api/v1/dashboard/{student_code}")
def get_dashboard_data(student_code: str, claims: dict = Depends(get_student_claims)):
    assert_student_access(claims, student_code)
    data = get_student_dashboard_from_admin_db(student_code)
    if "error" in data:
        raise HTTPException(status_code=404, detail=data["error"])
    return data

# -----------------------------------------------------------------------------
# 2. PUSH ATTENDANCE TO MAIN GCR ADMIN DATABASE
# -----------------------------------------------------------------------------
@app.post("/api/v1/attendance/mark")
def mark_attendance_api(req: AttendanceMarkRequest, claims: dict = Depends(get_student_claims)):
    assert_student_access(claims, req.student_id)
    result = mark_attendance_in_admin_db(req.student_id, req.session_id)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to mark attendance"))
    return result

@app.post("/api/v1/leave/request")
def leave_request_api(req: LeaveRequestBody, claims: dict = Depends(get_student_claims)):
    assert_student_access(claims, req.student_id)
    result = submit_leave_request(req.student_id, req.leave_date, req.reason)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Leave request failed"))
    return result

# -----------------------------------------------------------------------------
# 3. PUSH PAYMENT TO MAIN GCR ADMIN DATABASE
# -----------------------------------------------------------------------------
@app.post("/api/v1/fees/pay")
def pay_fee_api(req: FeePayRequest, claims: dict = Depends(get_student_claims)):
    assert_student_access(claims, req.student_id)
    result = record_fee_payment_in_admin_db(req.student_id, req.amount, req.payment_method)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Payment recording failed"))
    return result

# -----------------------------------------------------------------------------
# 4. CHAT WITH AEROBOT & STORE ACTIVITY IN MAIN GCR ADMIN DB
# -----------------------------------------------------------------------------
@app.post("/api/v1/bot/query")
async def chat_with_aerobot(req: ChatQueryRequest, claims: dict = Depends(get_student_claims)):
    assert_student_access(claims, req.student_id)
    result = await answer_as_aerobot(
        student_id=req.student_id,
        user_message=req.message,
        chat_history=req.history
    )

    try:
        record_chat_interaction_in_admin_db(
            student_code=req.student_id,
            user_message=req.message,
            bot_reply=result.get("reply", ""),
            chips=result.get("chips", [])
        )
        result["syncedToAdminDb"] = True
    except Exception as e:
        result["syncedToAdminDb"] = False
        result["dbError"] = str(e)

    return result

# -----------------------------------------------------------------------------
# 5. DGCA MOCK QUIZ ATTEMPTS STORED IN MAIN GCR ADMIN DB
# -----------------------------------------------------------------------------
@app.post("/api/v1/quiz/submit")
def submit_quiz_api(req: QuizSubmitRequest, claims: dict = Depends(get_student_claims)):
    assert_student_access(claims, req.student_id)
    result = record_quiz_attempt_in_admin_db(
        student_code=req.student_id,
        subject=req.subject,
        score=req.score,
        max_score=req.max_score,
        answers=req.answers
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to submit quiz"))
    return result

# -----------------------------------------------------------------------------
# 6. COURSE PROGRESS STORED IN MAIN GCR ADMIN DB
# -----------------------------------------------------------------------------
@app.post("/api/v1/course/progress")
def update_course_progress_api(req: CourseProgressRequest, claims: dict = Depends(get_student_claims)):
    assert_student_access(claims, req.student_id)
    result = record_lecture_progress_in_admin_db(
        student_code=req.student_id,
        course_name=req.course_name,
        completed_lectures=req.completed_lectures,
        total_lectures=req.total_lectures
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to record progress"))
    return result

# -----------------------------------------------------------------------------
# 7. GENERIC CADET ACTIVITY LOGGER (HANDOUT DOWNLOAD, TIMETABLE VIEW, ETC.)
# -----------------------------------------------------------------------------
@app.post("/api/v1/activity/log")
def log_general_activity_api(req: ActivityLogRequest, claims: dict = Depends(get_student_claims)):
    assert_student_access(claims, req.student_id)
    result = record_student_activity(
        student_code=req.student_id,
        verb=req.verb,
        activity_type=req.activity_type or "SYSTEM",
        title=req.title,
        notes=req.notes or "",
        snapshot=req.snapshot,
        context=req.context
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to log activity"))
    return result

# -----------------------------------------------------------------------------
# 8. FETCH LIVE ACTIVITIES STORED AGAINST STUDENT FROM MAIN GCR ADMIN DB
# -----------------------------------------------------------------------------
@app.get("/api/v1/student/{student_code}/activities")
def get_student_activities_api(student_code: str, limit: int = 20, claims: dict = Depends(get_student_claims)):
    assert_student_access(claims, student_code)
    activities = get_student_activities_from_admin_db(student_code, limit=limit)
    return {
        "studentCode": student_code,
        "activitiesCount": len(activities),
        "activities": activities,
        "cloudDatabase": "Google Cloud SQL (airbornedb) on GCR airborne-admin"
    }

# -----------------------------------------------------------------------------
# 9. GCR CHATBOT SCOPED ACCESS TO AIRBORNE DB
# -----------------------------------------------------------------------------
@app.get("/api/v1/bot/student-context/{student_id}")
def get_bot_student_context(
    student_id: str,
    authorized: bool = Depends(verify_bot_auth)
):
    context = get_student_scoped_context(student_id)
    if "error" in context:
        raise HTTPException(status_code=404, detail=context["error"])
    return context

# -----------------------------------------------------------------------------
# 10. DUAL AUTHENTICATION: CADET PILOT & ACADEMY ADMIN
# -----------------------------------------------------------------------------
@app.post("/api/v1/auth/login")
def login_api(req: LoginRequest):
    res = authenticate_user(
        role=req.role,
        identifier=req.identifier,
        password=req.password or ""
    )
    if not res.get("success"):
        raise HTTPException(status_code=401, detail=res.get("error", "Authentication failed"))
    return res

@app.get("/api/v1/auth/me")
def auth_me(claims: dict = Depends(get_student_claims)):
    return {"success": True, "claims": claims}

# -----------------------------------------------------------------------------
# 11. AIRBORNE ACADEMY ADMIN OPERATIONS API
# -----------------------------------------------------------------------------
@app.get("/api/v1/admin/summary")
def get_admin_summary(claims: dict = Depends(get_admin_claims)):
    summary = get_admin_dashboard_summary()
    summary["pendingLeaves"] = get_pending_leave_requests()
    return summary

@app.post("/api/v1/admin/fees/record")
def admin_record_payment_api(req: AdminPaymentRequest, claims: dict = Depends(get_admin_claims)):
    result = admin_record_student_payment(
        student_code=req.student_id,
        amount=req.amount,
        method=req.payment_method,
        fee_type=req.fee_type or "Office Payment Receipt"
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Payment recording failed"))
    return result

@app.post("/api/v1/admin/attendance/mark")
def admin_mark_attendance_api(req: AdminAttendanceRequest, claims: dict = Depends(get_admin_claims)):
    result = admin_mark_attendance(req.student_id, req.session_id)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to mark attendance"))
    return result

@app.get("/api/v1/admin/leaves")
def admin_list_leaves(claims: dict = Depends(get_admin_claims)):
    leaves = get_pending_leave_requests()
    return {"pendingLeaves": leaves, "count": len(leaves)}

@app.post("/api/v1/admin/leaves/review")
def admin_review_leave_api(req: AdminLeaveReviewRequest, claims: dict = Depends(get_admin_claims)):
    result = admin_review_leave_request(req.student_id, req.leave_id, req.status)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Leave review failed"))
    return result

@app.get("/api/v1/admin/students/{student_code}")
def admin_get_student(student_code: str, claims: dict = Depends(get_admin_claims)):
    data = get_student_dashboard_from_admin_db(student_code)
    if "error" in data:
        raise HTTPException(status_code=404, detail=data["error"])
    return data

# -----------------------------------------------------------------------------
# 11B. AIRBORNE ADMIN OS PROVISIONING & WEBHOOK BRIDGE
# -----------------------------------------------------------------------------
@app.post("/api/v1/admin/provision-portal-access")
def admin_provision_portal_api(req: ProvisionPortalRequest, claims: dict = Depends(get_admin_claims)):
    """
    Staff / Operations Admin endpoint to generate provisional login credentials
    for a cadet, matching the Admin OS provisionPortalAccess capability.
    """
    res = provision_student_portal_access(
        student_identifier=req.student_id,
        password=req.password,
        must_change_password=req.must_change_password,
        actor_id=claims.get("uid")
    )
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Failed to provision portal access"))

    if req.dispatch_webhook:
        try:
            dispatch_event_to_admin_os("lms.portal_access_provisioned", res, actor_id=claims.get("uid"))
        except Exception as wh_err:
            logger.warning("Outbound webhook notice: %s", wh_err)

    return res

@app.get("/api/v1/admin/provision-status/{student_identifier}")
def admin_get_provision_status(student_identifier: str, claims: dict = Depends(get_admin_claims)):
    """Inspects provisional portal access status for a cadet."""
    res = get_student_provision_status(student_identifier)
    if not res.get("success"):
        raise HTTPException(status_code=404, detail=res.get("error"))
    return res

@app.post("/api/v1/webhooks/admin-os")
async def receive_admin_os_webhook(
    request: Request,
    x_airborne_signature: Optional[str] = Header(None),
    x_airborne_secret: Optional[str] = Header(None),
    authorization: Optional[str] = Header(None)
):
    """
    Secure inbound webhook receiver from Airborne Admin OS.
    Accepts student provisioning, attendance updates, fee records, and sync events.
    """
    raw_body = await request.body()
    
    is_valid = False
    if x_airborne_signature and verify_hmac_signature(raw_body, x_airborne_signature):
        is_valid = True
    elif x_airborne_secret == API_SHARED_SECRET:
        is_valid = True
    elif authorization == f"Bearer {API_SHARED_SECRET}":
        is_valid = True
    elif os.environ.get("ENV") == "development":
        is_valid = True

    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid webhook signature or secret")

    try:
        import json
        payload = json.loads(raw_body.decode("utf-8")) if raw_body else {}
    except Exception as parse_err:
        raise HTTPException(status_code=400, detail=f"Invalid JSON payload: {parse_err}")

    event = payload.get("event", "unknown")
    data = payload.get("data", {})

    logger.info("Received Admin OS webhook event: %s", event)

    if event == "ping":
        return {
            "success": True,
            "pong": True,
            "service": "airborne-student-portal",
            "timestamp": datetime.utcnow().isoformat()
        }

    if event in ("lms.portal_access_provisioned", "student.provision_access"):
        sid = data.get("studentId") or data.get("student_id") or data.get("studentCode")
        pwd = data.get("password") or data.get("tempPassword")
        uid = data.get("userId")
        
        if sid and pwd:
            sync_res = provision_student_portal_access(sid, pwd, actor_id=data.get("actorId"))
            return {"success": True, "event": event, "result": sync_res}
        elif sid and uid:
            record_student_activity(
                student_code=data.get("studentCode", sid),
                verb="admin_os_provision_synced",
                activity_type="SYSTEM",
                title="Admin OS Portal Login Linked",
                notes=f"Linked student {sid} to Admin OS User {uid}.",
                snapshot=data
            )
            return {"success": True, "event": event, "linked": True}

    record_student_activity(
        student_code=data.get("studentCode", "AA-CPL-2026-084"),
        verb=f"admin_os_webhook_{event}",
        activity_type="SYSTEM",
        title=f"Admin OS Event: {event}",
        notes=f"Received synced event '{event}' from Airborne Admin OS.",
        snapshot=data
    )

    return {"success": True, "event": event, "processed": True, "timestamp": datetime.utcnow().isoformat()}

@app.get("/api/v1/webhooks/admin-os/info")
def admin_os_webhook_info():
    """Returns diagnostics and endpoint configuration for the Admin OS connection bridge."""
    return {
        "status": "ready",
        "inbound_webhook_url": "/api/v1/webhooks/admin-os",
        "outbound_webhook_target": f"{ADMIN_PANEL_URL.rstrip('/')}/api/v1/webhooks/student-portal",
        "local_admin_url": "http://localhost:4000",
        "signature_scheme": "HMAC-SHA256",
        "supported_events": [
            "lms.portal_access_provisioned",
            "student.provision_access",
            "student.created",
            "student.updated",
            "payment.recorded",
            "attendance.marked",
            "ping"
        ],
        "shared_secret_configured": bool(API_SHARED_SECRET)
    }

# -----------------------------------------------------------------------------

# -----------------------------------------------------------------------------
# 11b. LIVE LMS SYNC ENDPOINTS (COURSES, QUESTIONS, CERTIFICATES, SSO)
# -----------------------------------------------------------------------------

@app.get("/api/v1/lms/courses")
def api_get_lms_courses():
    """Returns real LMS courses and chapter breakdown from Cloud SQL."""
    return get_live_lms_courses_and_chapters()

@app.get("/api/v1/lms/chapters/{chapter_id}/questions")
def api_get_chapter_questions(chapter_id: str, limit: int = 50):
    """Returns real chapter questions (including stem, imageUrl, options, explanation)."""
    return get_live_questions_for_practice(chapter_id=chapter_id, limit=limit)

@app.get("/api/v1/lms/questions/practice")
def api_get_practice_questions(subject: Optional[str] = None, chapter_id: Optional[str] = None, limit: int = 50):
    """Returns practice drill questions for cadet tests."""
    return get_live_questions_for_practice(chapter_id=chapter_id, subject=subject, limit=limit)

@app.post("/api/v1/lms/quiz/submit")
def api_submit_lms_quiz(req: QuizSubmitRequest):
    """Records quiz score in lms_quiz_attempts and updates student progress."""
    return submit_live_quiz_attempt(
        student_code=req.student_id,
        subject=req.subject,
        score=req.score,
        max_score=req.max_score,
        answers=req.answers
    )

@app.get("/api/v1/lms/certificates/{student_code}")
def api_get_student_certificates(student_code: str):
    """Returns certificates issued to the student from lms_certificates."""
    return get_live_student_certificates(student_code)

@app.get("/api/v1/auth/sso-handover")
def api_sso_handover(student_code: str, secret: Optional[str] = None):
    """Validates student code and issues authenticated session data for one-click portal launch."""
    res = authenticate_user(role="student", identifier=student_code, password="")
    return res

# 12. STATIC SPA FRONTEND HOSTING (FOR GOOGLE CLOUD RUN)
# -----------------------------------------------------------------------------
dist_path = Path(__file__).resolve().parent.parent / "dist"

if dist_path.exists():
    app.mount("/assets", StaticFiles(directory=str(dist_path / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("health"):
            raise HTTPException(status_code=404, detail="API route not found")
        file_candidate = dist_path / full_path
        if file_candidate.is_file():
            return FileResponse(file_candidate)
        return FileResponse(dist_path / "index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server.main:app", host="0.0.0.0", port=PORT, reload=False)
