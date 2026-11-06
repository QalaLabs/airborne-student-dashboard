import os
import json
import hmac
import hashlib
from fastapi.testclient import TestClient
from server.main import app
from server.config import API_SHARED_SECRET

def run_tests():
    client = TestClient(app)

    print("Testing 1: /health...")
    r = client.get("/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    data = r.json()
    assert data["status"] in ("healthy", "degraded")
    print("[PASS] Health passed.")

    print("Testing 2: Cadet Login (Ruzal)...")
    login_ruzal = client.post("/api/v1/auth/login", json={"role": "student", "identifier": "AA-CPL-2026-084", "password": "cadet2026"})
    assert login_ruzal.status_code == 200, f"Cadet login failed: {login_ruzal.text}"
    ruzal_data = login_ruzal.json()
    assert ruzal_data["success"] is True
    t_ruzal = ruzal_data["token"]
    print("[PASS] Ruzal login passed.")

    print("Testing 3: Cadet Login (Rohan - Warning Alert Cadet)...")
    login_rohan = client.post("/api/v1/auth/login", json={"role": "student", "identifier": "AA-CPL-2026-091", "password": "cadet2026"})
    assert login_rohan.status_code == 200, f"Rohan login failed: {login_rohan.text}"
    rohan_data = login_rohan.json()
    assert rohan_data["success"] is True
    assert rohan_data["user"]["attendanceRate"] < 80.0
    print("[PASS] Rohan login passed.")

    print("Testing 4: Admin Login...")
    login_admin = client.post("/api/v1/auth/login", json={"role": "admin", "identifier": "admin@airborneaviation.in", "password": "admin2026"})
    assert login_admin.status_code == 200, f"Admin login failed: {login_admin.text}"
    admin_data = login_admin.json()
    assert admin_data["success"] is True
    t_admin = admin_data["token"]
    print("[PASS] Admin login passed.")

    print("Testing 5: Invalid credentials rejection...")
    bad_login = client.post("/api/v1/auth/login", json={"role": "student", "identifier": "AA-CPL-2026-084", "password": "wrong_password"})
    assert bad_login.status_code == 401
    print("[PASS] Bad login rejection passed.")

    print("Testing 6: Cadet Dashboard fetch...")
    dash = client.get("/api/v1/dashboard/AA-CPL-2026-084", headers={"Authorization": f"Bearer {t_ruzal}"})
    assert dash.status_code == 200, f"Dashboard fetch failed: {dash.text}"
    d_data = dash.json()
    assert "student" in d_data
    assert "timetable" in d_data
    print("[PASS] Dashboard fetch passed.")

    print("Testing 7: Attendance Mark API...")
    att = client.post("/api/v1/attendance/mark",
        json={"student_id": "AA-CPL-2026-084", "session_id": "TT-01", "subject": "Air Navigation", "location": "Hall 2A"},
        headers={"Authorization": f"Bearer {t_ruzal}"}
    )
    assert att.status_code == 200, f"Attendance mark failed: {att.text}"
    print("[PASS] Attendance mark passed.")

    print("Testing 8: Fee Payment API...")
    pay = client.post("/api/v1/fees/pay",
        json={"student_id": "AA-CPL-2026-084", "amount": 10000.0, "payment_method": "UPI"},
        headers={"Authorization": f"Bearer {t_ruzal}"}
    )
    assert pay.status_code == 200, f"Payment failed: {pay.text}"
    print("[PASS] Fee payment passed.")

    print("Testing 9: AeroBot Query API...")
    bot = client.post("/api/v1/bot/query",
        json={"student_id": "AA-CPL-2026-084", "message": "What is my fee status?", "history": []},
        headers={"Authorization": f"Bearer {t_ruzal}"}
    )
    assert bot.status_code == 200, f"Bot query failed: {bot.text}"
    assert "AeroBot" in bot.json()["reply"]
    print("[PASS] AeroBot query passed.")

    print("Testing 10: Quiz Submit API...")
    quiz = client.post("/api/v1/quiz/submit",
        json={"student_id": "AA-CPL-2026-084", "subject": "Air Navigation", "score": 5, "max_score": 5},
        headers={"Authorization": f"Bearer {t_ruzal}"}
    )
    assert quiz.status_code == 200, f"Quiz submit failed: {quiz.text}"
    print("[PASS] Quiz submit passed.")

    print("Testing 11: Leave Request API...")
    leave = client.post("/api/v1/leave/request",
        json={"student_id": "AA-CPL-2026-084", "leave_date": "10 Nov 2026", "reason": "Medical Renewal"},
        headers={"Authorization": f"Bearer {t_ruzal}"}
    )
    assert leave.status_code == 200, f"Leave request failed: {leave.text}"
    assert leave.json()["success"] is True
    print("[PASS] Leave request passed.")

    print("Testing 12: Admin Summary...")
    adm_sum = client.get("/api/v1/admin/summary", headers={"Authorization": f"Bearer {t_admin}"})
    assert adm_sum.status_code == 200, f"Admin summary failed: {adm_sum.text}"
    adm_data = adm_sum.json()
    assert adm_data["metrics"]["totalCadets"] >= 8
    assert len(adm_data["students"]) >= 8
    print("[PASS] Admin summary passed.")

    print("Testing 13: Admin Leave Review...")
    leaves_res = client.get("/api/v1/admin/leaves", headers={"Authorization": f"Bearer {t_admin}"})
    assert leaves_res.status_code == 200
    pending_leaves = leaves_res.json()["pendingLeaves"]
    if len(pending_leaves) > 0:
        first_leave = pending_leaves[0]
        rev = client.post("/api/v1/admin/leaves/review",
            json={"student_id": first_leave["studentCode"], "leave_id": first_leave["id"], "status": "APPROVED"},
            headers={"Authorization": f"Bearer {t_admin}"}
        )
        assert rev.status_code == 200, f"Review leave failed: {rev.text}"
        print("[PASS] Admin leave review passed.")

    print("Testing 14: Admin Record Student Payment...")
    admin_pay = client.post("/api/v1/admin/fees/record",
        json={"student_id": "AA-CPL-2026-091", "amount": 25000.0, "payment_method": "BANK_TRANSFER", "fee_type": "Office Cash Receipt"},
        headers={"Authorization": f"Bearer {t_admin}"}
    )
    assert admin_pay.status_code == 200, f"Admin pay failed: {admin_pay.text}"
    print("[PASS] Admin payment record passed.")

    print("Testing 15: Provision Student Portal Login (Tanvi Verma)...")
    prov_res = client.post("/api/v1/admin/provision-portal-access",
        json={"student_id": "AA-CPL-2026-086", "password": "PilotSecure2026!", "dispatch_webhook": False},
        headers={"Authorization": f"Bearer {t_admin}"}
    )
    assert prov_res.status_code == 200, f"Provisioning failed: {prov_res.text}"
    prov_data = prov_res.json()
    assert prov_data["success"] is True
    assert prov_data["studentCode"] == "AA-CPL-2026-086"
    assert "userId" in prov_data

    # Test login with newly provisioned temporary password!
    prov_login = client.post("/api/v1/auth/login",
        json={"role": "student", "identifier": "AA-CPL-2026-086", "password": "PilotSecure2026!"}
    )
    assert prov_login.status_code == 200, f"Login with provisioned password failed: {prov_login.text}"
    assert prov_login.json()["success"] is True
    print("[PASS] Student provisioning & login with provisioned password passed.")

    print("Testing 16: Check Provision Status API...")
    status_res = client.get("/api/v1/admin/provision-status/AA-CPL-2026-086",
        headers={"Authorization": f"Bearer {t_admin}"}
    )
    assert status_res.status_code == 200, f"Provision status failed: {status_res.text}"
    assert status_res.json()["isProvisioned"] is True
    print("[PASS] Provision status inspection passed.")

    print("Testing 17: Admin OS Inbound Webhook (HMAC-SHA256 signature)...")
    wh_payload = {
        "event": "lms.portal_access_provisioned",
        "data": {
            "studentId": "AA-CPL-2026-087",
            "studentCode": "AA-CPL-2026-087",
            "password": "SiddharthAir2026!",
            "email": "siddharth.rao@airborneaviation.in",
            "role": "STUDENT"
        }
    }
    wh_bytes = json.dumps(wh_payload).encode("utf-8")
    sig = hmac.new(API_SHARED_SECRET.encode("utf-8"), wh_bytes, hashlib.sha256).hexdigest()

    wh_res = client.post("/api/v1/webhooks/admin-os",
        content=wh_bytes,
        headers={"Content-Type": "application/json", "X-Airborne-Signature": sig}
    )
    assert wh_res.status_code == 200, f"Inbound webhook failed: {wh_res.text}"
    assert wh_res.json()["success"] is True

    # Test that cadet provisioned via webhook can now log in
    sid_login = client.post("/api/v1/auth/login",
        json={"role": "student", "identifier": "AA-CPL-2026-087", "password": "SiddharthAir2026!"}
    )
    assert sid_login.status_code == 200, f"Login after webhook provision failed: {sid_login.text}"
    print("[PASS] Admin OS Inbound Webhook & synced login passed.")

    print("Testing 18: Admin OS Webhook Diagnostics / Info API...")
    wh_info = client.get("/api/v1/webhooks/admin-os/info")
    assert wh_info.status_code == 200
    info_data = wh_info.json()
    assert info_data["status"] == "ready"
    assert "inbound_webhook_url" in info_data
    print("[PASS] Webhook diagnostics info passed.")

    print("Testing 19: Application Number Admission Enrolled -> Portal Login Provisioning...")
    # Provision by Application Number APP-2026-00010 (from user screenshot)
    prov_app10 = client.post("/api/v1/admin/provision-portal-access",
        json={"student_id": "APP-2026-00010", "password": "PilotEnrolled2026!", "dispatch_webhook": False},
        headers={"Authorization": f"Bearer {t_admin}"}
    )
    assert prov_app10.status_code == 200, f"App No provisioning failed: {prov_app10.text}"
    p_data = prov_app10.json()
    assert p_data["success"] is True
    assert p_data["applicationNo"] == "APP-2026-00010"
    assert "AA-CPL" in p_data["studentCode"]

    # Test Cadet Login directly using Application Number APP-2026-00010!
    app_login = client.post("/api/v1/auth/login",
        json={"role": "student", "identifier": "APP-2026-00010", "password": "PilotEnrolled2026!"}
    )
    assert app_login.status_code == 200, f"Login with Application Number failed: {app_login.text}"
    app_log_data = app_login.json()
    assert app_log_data["success"] is True
    assert app_log_data["user"]["applicationNo"] == "APP-2026-00010"

    # Also test Cadet Login using existing Application Number APP-2026-00418 (Ruzal Dhral)
    ruzal_app_login = client.post("/api/v1/auth/login",
        json={"role": "student", "identifier": "APP-2026-00418", "password": "cadet2026"}
    )
    assert ruzal_app_login.status_code == 200, f"Login with APP-2026-00418 failed: {ruzal_app_login.text}"
    assert ruzal_app_login.json()["user"]["studentCode"] == "AA-CPL-2026-084"

    # Verify provision status query by Application Number
    stat_app = client.get("/api/v1/admin/provision-status/APP-2026-00010",
        headers={"Authorization": f"Bearer {t_admin}"}
    )
    assert stat_app.status_code == 200
    assert stat_app.json()["isProvisioned"] is True
    print("[PASS] Application Number Admission Enrolled -> Portal Login Provisioning & Login passed.")

    print("\nALL 19 PRODUCTION API & APPLICATION NUMBER PORTAL PROVISIONING SUITES PASSED FLAWLESSLY!")

if __name__ == "__main__":
    run_tests()
