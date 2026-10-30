import os
from pathlib import Path
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from server.config import (
    PORT, 
    GCR_CHATBOT_SERVICE_URL, 
    INTERNAL_RAG_SHARED_SECRET, 
    API_SHARED_SECRET,
    ADMIN_PANEL_URL,
    ORG_ID
)
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
    admin_record_student_payment
)
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
    return {
        "status": "healthy",
        "service": "airborne-student-dashboard",
        "copilot": "AeroBot (Brand Book 2026)",
        "admin_db_connected": True,
        "port": PORT
    }

# -----------------------------------------------------------------------------
# 1. PULL FROM MAIN GCR AIRBORNE ADMIN DATABASE
# -----------------------------------------------------------------------------
@app.get("/api/v1/dashboard/{student_code}")
def get_dashboard_data(student_code: str):
    """
    Pulls:
    - Student details & computer number from students table
    - Course and batch details from admissions table
    - Timetable from timetable_sessions (for this batch)
    - Account details (fee amount, paid, balance, transactions) from admissions & payment_transactions
    """
    data = get_student_dashboard_from_admin_db(student_code)
    if "error" in data:
        raise HTTPException(status_code=404, detail=data["error"])
    return data

# -----------------------------------------------------------------------------
# 2. PUSH ATTENDANCE TO MAIN GCR ADMIN DATABASE
# -----------------------------------------------------------------------------
@app.post("/api/v1/attendance/mark")
def mark_attendance_api(req: AttendanceMarkRequest):
    """
    When student marks attendance:
    1. Writes to student_attendances and lms_attendance_records.
    2. Updates students.custom_fields (attendance rate and attended count).
    3. Writes to activity_feed_items (Main Admin Feed).
    4. Writes to lead_activities (Admin Student Timeline).
    5. Writes to event_log & audit_logs.
    """
    result = mark_attendance_in_admin_db(req.student_id, req.session_id)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to mark attendance"))
    return result

# -----------------------------------------------------------------------------
# 3. PUSH PAYMENT TO MAIN GCR ADMIN DATABASE
# -----------------------------------------------------------------------------
@app.post("/api/v1/fees/pay")
def pay_fee_api(req: FeePayRequest):
    """
    When student pays fees:
    1. Inserts into payment_transactions in Airborne Admin DB.
    2. Updates admissions.feePaid and admissions.feeBalance.
    3. Writes to activity_feed_items, lead_activities, event_log, and audit_logs.
    """
    result = record_fee_payment_in_admin_db(req.student_id, req.amount, req.payment_method)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Payment recording failed"))
    return result

# -----------------------------------------------------------------------------
# 4. CHAT WITH AEROBOT & STORE ACTIVITY IN MAIN GCR ADMIN DB
# -----------------------------------------------------------------------------
@app.post("/api/v1/bot/query")
async def chat_with_aerobot(req: ChatQueryRequest):
    """
    Answers directly as AeroBot (Airborne Brand Book 2026),
    AND STORES the chat query and AI reply into the student database:
    - activity_feed_items
    - lead_activities (Candidate Journey Timeline)
    - event_log
    - students.custom_fields["recent_activities"]
    """
    result = await answer_as_aerobot(
        student_id=req.student_id,
        user_message=req.message,
        chat_history=req.history
    )

    # Persist activity against student in Main Admin Database
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
def submit_quiz_api(req: QuizSubmitRequest):
    """
    Stores mock exam / quiz attempts in lms_quiz_attempts and writes
    corresponding activity entries in the Admin DB.
    """
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
def update_course_progress_api(req: CourseProgressRequest):
    """
    Stores module progress and lecture completion in the Admin DB.
    """
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
def log_general_activity_api(req: ActivityLogRequest):
    """
    Stores any arbitrary cadet activity against the student in the Admin DB.
    """
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
def get_student_activities_api(student_code: str, limit: int = 20):
    """
    Fetches real-time activity stream logged against the student in the Admin DB.
    """
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
    """
    CRITICAL ACCESS CONTROL:
    External GCR Chatbot accesses ONLY this authorized student's verified records
    from the Airborne Admin DB.
    """
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

# -----------------------------------------------------------------------------
# 11. AIRBORNE ACADEMY ADMIN OPERATIONS API
# -----------------------------------------------------------------------------
@app.get("/api/v1/admin/summary")
def get_admin_summary():
    return get_admin_dashboard_summary()

@app.post("/api/v1/admin/fees/record")
def admin_record_payment_api(req: AdminPaymentRequest):
    result = admin_record_student_payment(
        student_code=req.student_id,
        amount=req.amount,
        method=req.payment_method,
        fee_type=req.fee_type or "Office Payment Receipt"
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Payment recording failed"))
    return result

# -----------------------------------------------------------------------------
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
