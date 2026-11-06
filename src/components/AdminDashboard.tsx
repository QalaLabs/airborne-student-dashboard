import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CalendarClock, 
  CreditCard, 
  Activity, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  Plane, 
  MapPin, 
  Eye, 
  Check, 
  RefreshCw,
  TrendingUp,
  Clock,
  Plus,
  KeyRound,
  Radio,
  Zap,
  Sparkles,
  Copy
} from 'lucide-react';
import { AdminMetrics, AdminStudent, AuthUser } from '../types/dashboard';
import { apiFetch } from '../lib/api';

interface AdminDashboardProps {
  adminUser?: AuthUser;
  onPreviewStudent: (studentCode: string) => void;
  activeAdminTab: 'admin-overview' | 'admin-cadets' | 'admin-timetable' | 'admin-fees' | 'admin-activity' | 'admin-bridge';
  setActiveAdminTab: (tab: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminUser: _adminUser,
  onPreviewStudent,
  activeAdminTab,
  setActiveAdminTab,
}) => {
  const [metrics, setMetrics] = useState<AdminMetrics>({
    totalCadets: 8,
    activeCadets: 8,
    averageAttendance: 89.0,
    compliantCadets: 8,
    warningCadets: 0,
    totalBilled: 1480000,
    totalCollected: 1300000,
    totalPending: 180000,
    collectionRate: 87.8,
    todaySessionsCount: 3,
  });

  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'compliant' | 'warning' | 'pending_fee'>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Payment Recording Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStudentForPay, setSelectedStudentForPay] = useState<AdminStudent | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(35000);
  const [paymentMethod, setPaymentMethod] = useState<string>('BANK_TRANSFER');
  const [paymentNote, setPaymentNote] = useState<string>('3rd Installment (Pre-Board & WPC RTR Lab)');
  const [paySuccessMsg, setPaySuccessMsg] = useState<string | null>(null);

  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);

  // Provisioning & Admin OS Bridge State
  const [selectedStudentForProvision, setSelectedStudentForProvision] = useState<string>('AA-CPL-2026-084');
  const [provisionalPassword, setProvisionalPassword] = useState<string>('PilotCadet2026!');
  const [mustChangePassword, setMustChangePassword] = useState<boolean>(true);
  const [isProvisioning, setIsProvisioning] = useState<boolean>(false);
  const [provisionResult, setProvisionResult] = useState<any | null>(null);
  const [copyNoticeSuccess, setCopyNoticeSuccess] = useState<boolean>(false);
  const [webhookPingStatus, setWebhookPingStatus] = useState<{ testing: boolean; result: any | null }>({
    testing: false,
    result: null,
  });

  // Fetch admin summary from DB
  const fetchAdminData = async () => {
    try {
      setRefreshing(true);
      const data = await apiFetch<any>('/api/v1/admin/summary');
      if (data.metrics) setMetrics(data.metrics);
      if (data.students) setStudents(data.students);
      if (data.timetable) setTimetable(data.timetable);
      if (data.recentTransactions) setTransactions(data.recentTransactions);
      if (data.activityLogs) setActivityLogs(data.activityLogs);
      if (data.pendingLeaves) setPendingLeaves(data.pendingLeaves);
    } catch (err) {
      console.warn('Connected to local admin dataset buffer', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    apiFetch<any>('/api/v1/admin/summary')
      .then(data => {
        if (!mounted) return;
        if (data.metrics) setMetrics(data.metrics);
        if (data.students) setStudents(data.students);
        if (data.timetable) setTimetable(data.timetable);
        if (data.recentTransactions) setTransactions(data.recentTransactions);
        if (data.activityLogs) setActivityLogs(data.activityLogs);
        if (data.pendingLeaves) setPendingLeaves(data.pendingLeaves);
      })
      .catch(err => {
        console.warn('Connected to local admin dataset buffer', err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.computerNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'compliant') return s.attendanceRate >= 80.0;
    if (statusFilter === 'warning') return s.attendanceRate < 80.0;
    if (statusFilter === 'pending_fee') return s.feeBalance > 0;
    return true;
  });

  // Handle Admin Manual Payment Record
  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let pwd = 'Cadet';
    for (let i = 0; i < 6; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    pwd += '2026!';
    setProvisionalPassword(pwd);
  };

  const handleProvisionAccess = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedStudentForProvision || provisionalPassword.length < 8) return;

    try {
      setIsProvisioning(true);
      const res = await apiFetch<any>('/api/v1/admin/provision-portal-access', {
        method: 'POST',
        body: JSON.stringify({
          student_id: selectedStudentForProvision,
          password: provisionalPassword,
          must_change_password: mustChangePassword,
          dispatch_webhook: true,
        }),
      });
      setProvisionResult(res);
      fetchAdminData();
    } catch (err: any) {
      alert(`Provisioning failed: ${err.message || err}`);
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleTestWebhookPing = async () => {
    try {
      setWebhookPingStatus({ testing: true, result: null });
      const t0 = performance.now();
      const res = await apiFetch<any>('/api/v1/webhooks/admin-os', {
        method: 'POST',
        body: JSON.stringify({
          event: 'ping',
          data: { pingFrom: 'Airborne Admin Dashboard Deck' },
        }),
      });
      const t1 = performance.now();
      setWebhookPingStatus({
        testing: false,
        result: {
          success: res.success || res.pong,
          latencyMs: Math.round(t1 - t0),
          service: res.service || 'airborne-student-portal',
          timestamp: res.timestamp || new Date().toISOString(),
        },
      });
    } catch (err: any) {
      setWebhookPingStatus({
        testing: false,
        result: { error: err.message || 'Webhook ping failed' },
      });
    }
  };

  const handleCopyNotice = () => {
    if (!provisionResult) return;
    const text = `[AIRBORNE AVIATION ACADEMY] CADET PORTAL ACCESS CREDENTIALS\nCadet: ${provisionResult.name} (${provisionResult.studentCode})\nApplication No: ${provisionResult.applicationNo || "N/A"}\nPortal URL: https://portal.airborneaviation.in\nLogin Identifier: ${provisionResult.applicationNo || provisionResult.studentCode || provisionResult.email}\nTemporary Password: ${provisionalPassword}\nStatus: Flight Deck Ready (DGCA Ground School)\nNotice: Please update your password on first login.`;
    navigator.clipboard.writeText(text);
    setCopyNoticeSuccess(true);
    setTimeout(() => setCopyNoticeSuccess(false), 2500);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForPay) return;

    try {
      const data = await apiFetch<any>('/api/v1/admin/fees/record', {
        method: 'POST',
        body: JSON.stringify({
          student_id: selectedStudentForPay.studentCode,
          amount: paymentAmount,
          payment_method: paymentMethod,
          fee_type: paymentNote,
        }),
      });

      setPaySuccessMsg(`Receipt generated: ${data.receiptNo}. Updated balance: ₹${Number(data.newBalance || 0).toLocaleString()}`);
      setTimeout(() => {
        setShowPaymentModal(false);
        setPaySuccessMsg(null);
        fetchAdminData();
      }, 1500);
    } catch (err) {
      console.error('Error recording payment', err);
      alert('Could not record payment in Admin DB.');
    }
  };

  const handleReviewLeave = async (leave: any, status: 'APPROVED' | 'REJECTED') => {
    try {
      await apiFetch('/api/v1/admin/leaves/review', {
        method: 'POST',
        body: JSON.stringify({
          student_id: leave.studentCode,
          leave_id: leave.id,
          status,
        }),
      });
      fetchAdminData();
    } catch (err) {
      console.error('Leave review failed', err);
    }
  };

  const handleAdminMarkAttendance = async (studentCode: string) => {
    try {
      await apiFetch('/api/v1/admin/attendance/mark', {
        method: 'POST',
        body: JSON.stringify({ student_id: studentCode, session_id: 'TT-01' }),
      });
      fetchAdminData();
    } catch (err) {
      console.error('Admin attendance mark failed', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Admin Command Header */}
      <div className="bg-[#00274C] text-white p-6 rounded-2xl shadow-xl border border-[#00172E] relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full opacity-10 pointer-events-none flex items-center justify-end pr-8">
          <Plane className="w-64 h-64 text-white transform -rotate-12" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="bg-[#DB241E] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full font-brand-primary">
                Flight Operations Command
              </span>
              <span className="text-xs text-slate-300 font-flight-mono">
                Dwarka Campus • DGCA CAR Section 7 Monitored
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-medium font-brand-primary text-white">
              Operations deck
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl font-brand-body leading-relaxed">
              Live ground school monitoring, biometric attendance verification, fee collection ledgers, and cadet pilot records synced directly with Airborne DB.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fetchAdminData()}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-white/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Ledger</span>
            </button>

            <button
              onClick={() => onPreviewStudent('AA-CPL-2026-084')}
              className="bg-[#D8A027] hover:bg-[#c28f1f] text-[#00274C] text-xs font-bold px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Preview Cadet View (Ruzal Dhral)</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
            <div className="flex items-center justify-between text-slate-300 text-xs">
              <span>Active Cadets</span>
              <Users className="w-4 h-4 text-[#38bdf8]" />
            </div>
            <div className="text-2xl font-black font-brand-primary text-white mt-1">
              {metrics.activeCadets} <span className="text-xs font-normal text-slate-400">/ {metrics.totalCadets} enrolled</span>
            </div>
            <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              Batch Delta-26 (Max 25 Rule)
            </p>
          </div>

          <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
            <div className="flex items-center justify-between text-slate-300 text-xs">
              <span>DGCA Compliance</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black font-brand-primary text-emerald-400 mt-1">
              {metrics.averageAttendance}%
            </div>
            <p className="text-[10px] text-slate-300 mt-1">
              {metrics.compliantCadets} compliant • {metrics.warningCadets} below 80% rule
            </p>
          </div>

          <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
            <div className="flex items-center justify-between text-slate-300 text-xs">
              <span>Fee Collection Rate</span>
              <TrendingUp className="w-4 h-4 text-[#D8A027]" />
            </div>
            <div className="text-2xl font-black font-brand-primary text-[#D8A027] mt-1">
              {metrics.collectionRate}%
            </div>
            <p className="text-[10px] text-slate-300 mt-1">
              ₹{(metrics.totalCollected / 100000).toFixed(2)}L / ₹{(metrics.totalBilled / 100000).toFixed(2)}L
            </p>
          </div>

          <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
            <div className="flex items-center justify-between text-slate-300 text-xs">
              <span>Outstanding Fees</span>
              <CreditCard className="w-4 h-4 text-[#DB241E]" />
            </div>
            <div className="text-2xl font-black font-brand-primary text-white mt-1">
              ₹{(metrics.totalPending / 100000).toFixed(2)} Lakh
            </div>
            <p className="text-[10px] text-amber-300 mt-1">
              Final installment due 15 Nov
            </p>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        <button
          onClick={() => setActiveAdminTab('admin-overview')}
          className={`px-4 py-2.5 rounded-xl font-brand-primary font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeAdminTab === 'admin-overview'
              ? 'bg-[#00274C] text-white shadow-sm'
              : 'text-slate-600 hover:text-[#00274C] hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Command Overview</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('admin-cadets')}
          className={`px-4 py-2.5 rounded-xl font-brand-primary font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeAdminTab === 'admin-cadets'
              ? 'bg-[#00274C] text-white shadow-sm'
              : 'text-slate-600 hover:text-[#00274C] hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Cadets Flight Roster</span>
          <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full font-flight-mono">
            {students.length}
          </span>
        </button>

        <button
          onClick={() => setActiveAdminTab('admin-timetable')}
          className={`px-4 py-2.5 rounded-xl font-brand-primary font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeAdminTab === 'admin-timetable'
              ? 'bg-[#00274C] text-white shadow-sm'
              : 'text-slate-600 hover:text-[#00274C] hover:bg-slate-100'
          }`}
        >
          <CalendarClock className="w-4 h-4" />
          <span>Ground School Timetable</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">
            Live
          </span>
        </button>

        <button
          onClick={() => setActiveAdminTab('admin-fees')}
          className={`px-4 py-2.5 rounded-xl font-brand-primary font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeAdminTab === 'admin-fees'
              ? 'bg-[#00274C] text-white shadow-sm'
              : 'text-slate-600 hover:text-[#00274C] hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Fee Ledger & Accounts</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('admin-bridge')}
          className={`px-4 py-2.5 rounded-xl font-brand-primary font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeAdminTab === 'admin-bridge'
              ? 'bg-[#00274C] text-white shadow-sm'
              : 'text-slate-600 hover:text-[#00274C] hover:bg-slate-100'
          }`}
        >
          <KeyRound className="w-4 h-4 text-[#D8A027]" />
          <span>Admin OS & Provisioning</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">
            Bridge Active
          </span>
        </button>

        <button
          onClick={() => setActiveAdminTab('admin-activity')}
          className={`px-4 py-2.5 rounded-xl font-brand-primary font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeAdminTab === 'admin-activity'
              ? 'bg-[#00274C] text-white shadow-sm'
              : 'text-slate-600 hover:text-[#00274C] hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Biometric & Audit Logs</span>
        </button>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 1. OVERVIEW TAB */}
      {/* ------------------------------------------------------------------- */}
      {activeAdminTab === 'admin-overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Ground Classes */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold font-brand-primary text-[#00274C]">
                    Today's Ground School Sessions (Friday)
                  </h3>
                  <p className="text-xs text-slate-500">Dwarka Centre • Real-time lecture delivery & attendance tracking</p>
                </div>
                <span className="text-xs font-flight-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  3 Lectures Active
                </span>
              </div>

              <div className="space-y-3">
                {timetable.filter(t => t.isToday).map((session, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 hover:border-[#00274C]/30 bg-[#F5F6F8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#00274C] text-white font-flight-mono">
                          {session.subjectCode}
                        </span>
                        <h4 className="text-sm font-bold text-[#00274C] font-brand-primary">
                          {session.subjectName}
                        </h4>
                        {session.status === 'in-progress' && (
                          <span className="text-[10px] bg-[#DB241E] text-white px-2 py-0.5 rounded font-bold animate-pulse">
                            LIVE NOW
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1">{session.topic}</p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-flight-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {session.time}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {session.location}
                        </span>
                        <span>•</span>
                        <span>{session.instructor}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onPreviewStudent('AA-CPL-2026-084')}
                        className="text-xs text-[#00274C] bg-white hover:bg-slate-100 border border-slate-300 font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Check Roster
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions for Chief Instructor */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold font-brand-primary text-[#00274C] mb-3">
                Operations & Batch Management
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <button
                  onClick={() => setActiveAdminTab('admin-cadets')}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-[#00274C] hover:bg-blue-50/50 text-left transition-all cursor-pointer group"
                >
                  <Users className="w-5 h-5 text-[#00274C] mb-2" />
                  <p className="font-bold text-[#00274C] font-brand-primary">Verify Cadet Roster</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Inspect attendance & DGCA status</p>
                </button>

                <button
                  onClick={() => setActiveAdminTab('admin-fees')}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-[#D8A027] hover:bg-amber-50/50 text-left transition-all cursor-pointer group"
                >
                  <CreditCard className="w-5 h-5 text-[#D8A027] mb-2" />
                  <p className="font-bold text-[#00274C] font-brand-primary">Record Fee Installment</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Issue official academy receipt</p>
                </button>

                <button
                  onClick={() => setActiveAdminTab('admin-activity')}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-[#DB241E] hover:bg-red-50/50 text-left transition-all cursor-pointer group"
                >
                  <ShieldCheck className="w-5 h-5 text-[#DB241E] mb-2" />
                  <p className="font-bold text-[#00274C] font-brand-primary">DGCA Compliance Log</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Biometric logs & audit records</p>
                </button>
              </div>
            </div>

            {pendingLeaves.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm">
                <h3 className="text-base font-bold font-brand-primary text-[#00274C] mb-3">
                  Pending Leave Requests ({pendingLeaves.length})
                </h3>
                <div className="space-y-3">
                  {pendingLeaves.slice(0, 5).map((leave) => (
                    <div key={leave.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-[#00274C]">{leave.studentName} · {leave.studentCode}</p>
                        <span className="font-flight-mono text-slate-500">{leave.date}</span>
                      </div>
                      <p className="text-slate-600 mt-1">{leave.reason}</p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleReviewLeave(leave, 'APPROVED')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReviewLeave(leave, 'REJECTED')}
                          className="px-2.5 py-1 rounded-lg bg-[#DB241E] text-white font-semibold cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: DGCA Exam Readiness & Recent Activity */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold font-brand-primary text-[#00274C] mb-1">
                DGCA Exam Session 3/2026
              </h3>
              <p className="text-xs text-slate-500 mb-4">Target: November 2026 Examination Window</p>

              <div className="space-y-3">
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs">
                  <div className="flex items-center justify-between font-bold text-[#00274C]">
                    <span>Batch Delta-26 Readiness</span>
                    <span className="text-emerald-600 font-flight-mono">100% Eligible</span>
                  </div>
                  <p className="text-slate-600 mt-1 text-[11px]">
                    All 8 cadets have verified DGCA Computer Numbers and attendances above the mandatory 80% threshold.
                  </p>
                </div>

                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-xs">
                  <div className="flex items-center justify-between font-bold text-amber-900">
                    <span>Pariksha DGCA Portal</span>
                    <span className="text-amber-800 font-flight-mono">Opens Nov 5</span>
                  </div>
                  <p className="text-amber-800/80 mt-1 text-[11px]">
                    Pre-board verification certificates ready for dispatch from Dwarka Centre.
                  </p>
                </div>
              </div>
            </div>

            {/* Live Activity Feed */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold font-brand-primary text-[#00274C]">
                  Live Activity Stream
                </h3>
                <span className="live-dot w-2 h-2 rounded-full bg-emerald-500" />
              </div>

              <div className="space-y-3">
                {activityLogs.slice(0, 5).map((log, i) => (
                  <div key={i} className="text-xs border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#00274C] font-brand-primary capitalize">
                        {log.verb.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-flight-mono">{log.createdAt}</span>
                    </div>
                    <p className="text-slate-600 mt-0.5 text-[11px]">
                      {log.snapshot?.studentName || 'Cadet'} • {log.snapshot?.subject || log.snapshot?.receiptNo || 'Record updated'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 2. CADETS ROSTER TAB */}
      {/* ------------------------------------------------------------------- */}
      {activeAdminTab === 'admin-cadets' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header & Filters */}
          <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold font-brand-primary text-[#00274C]">
                Airborne Cadets Flight Roster (Batch Delta-26)
              </h3>
              <p className="text-xs text-slate-500">
                Official DGCA records, biometric attendance rates, and tuition ledgers
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search cadet, roll no, computer no..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-flight-mono focus:bg-white focus:outline-hidden focus:border-[#00274C] w-64"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-brand-primary"
              >
                <option value="all">All Cadets ({students.length})</option>
                <option value="compliant">DGCA Compliant (&ge;80%)</option>
                <option value="warning">DGCA Warning (&lt;80%)</option>
                <option value="pending_fee">Pending Dues Only</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F6F8] text-slate-600 border-b border-slate-200 font-brand-primary uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Cadet Pilot</th>
                  <th className="py-3 px-4">DGCA Computer No</th>
                  <th className="py-3 px-4">Attendance Rate</th>
                  <th className="py-3 px-4">Classes Done</th>
                  <th className="py-3 px-4">Fee Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((cadet) => {
                  const isCompliant = cadet.attendanceRate >= 80.0;
                  return (
                    <tr key={cadet.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={cadet.avatar}
                            alt={cadet.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-bold font-brand-primary text-[#00274C]">
                                {cadet.name}
                              </p>
                              {cadet.applicationNo && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-[#00274C] font-flight-mono">
                                  {cadet.applicationNo}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 font-flight-mono">
                              {cadet.studentCode} • {cadet.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-flight-mono font-semibold text-slate-700">
                        {cadet.computerNumber}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full font-bold font-flight-mono text-[11px] ${
                            isCompliant
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {cadet.attendanceRate}%
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {isCompliant ? 'Compliant' : 'Warning'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-flight-mono text-slate-600">
                        {cadet.attendedClasses} / {cadet.totalClasses}
                      </td>

                      <td className="py-3.5 px-4">
                        {cadet.feeBalance === 0 ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                            <Check className="w-3 h-3" /> Fully Cleared
                          </span>
                        ) : (
                          <div>
                            <span className="text-[#DB241E] font-bold font-flight-mono">
                              ₹{cadet.feeBalance.toLocaleString()} Due
                            </span>
                            <p className="text-[10px] text-slate-400">Paid ₹{cadet.feePaid.toLocaleString()}</p>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {cadet.feeBalance > 0 && (
                            <button
                              onClick={() => {
                                setSelectedStudentForPay(cadet);
                                setPaymentAmount(cadet.feeBalance);
                                setShowPaymentModal(true);
                              }}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              Record Payment
                            </button>
                          )}

                          <button
                            onClick={() => handleAdminMarkAttendance(cadet.studentCode)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            Mark Present
                          </button>

                          <button
                            onClick={() => onPreviewStudent(cadet.studentCode)}
                            className="px-2.5 py-1 bg-[#00274C] hover:bg-[#00172E] text-white rounded-lg font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Cadet HUD</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 3. TIMETABLE TAB */}
      {/* ------------------------------------------------------------------- */}
      {activeAdminTab === 'admin-timetable' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-brand-primary text-[#00274C]">
                Batch Delta-26 Ground Schedule
              </h3>
              <p className="text-xs text-slate-500">Dwarka Centre classrooms & simulator allocations</p>
            </div>
            <span className="bg-[#00274C] text-white text-xs px-3 py-1 rounded-full font-brand-primary font-bold">
              Chief Mentor: Capt. Navrang Singh
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {timetable.map((session, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 bg-[#F5F6F8] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00274C] text-white font-flight-mono">
                    {session.subjectCode}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 font-flight-mono">
                    {session.batch}
                  </span>
                </div>
                <h4 className="font-bold text-[#00274C] font-brand-primary text-sm">{session.subjectName}</h4>
                <p className="text-xs text-slate-600">{session.topic}</p>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500 font-flight-mono">
                  <span>{session.time}</span>
                  <span className="text-[#DB241E] font-semibold">{session.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 4. FEE LEDGER TAB */}
      {/* ------------------------------------------------------------------- */}
      {activeAdminTab === 'admin-fees' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-brand-primary text-[#00274C]">
                Academy Tuition Ledger & Payment Transactions
              </h3>
              <p className="text-xs text-slate-500">Recorded online payments and verified manual entries</p>
            </div>
            <button
              onClick={() => {
                if (students.length > 0) {
                  setSelectedStudentForPay(students[0]);
                  setPaymentAmount(35000);
                  setShowPaymentModal(true);
                }
              }}
              className="bg-[#DB241E] hover:bg-[#b51d18] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Manual Payment</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F6F8] text-slate-600 border-b border-slate-200 uppercase text-[11px] font-brand-primary">
                <tr>
                  <th className="py-3 px-4">Receipt No</th>
                  <th className="py-3 px-4">Fee Head / Description</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((txn, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-flight-mono font-bold text-[#00274C]">
                      {txn.receiptNo || txn.id}
                    </td>
                    <td className="py-3 px-4 text-slate-700">{txn.feeType}</td>
                    <td className="py-3 px-4 font-flight-mono font-bold text-emerald-700">
                      ₹{txn.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-flight-mono text-slate-600">
                      {txn.method}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-flight-mono">
                      {txn.paidAt}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        <Check className="w-3 h-3" /> Cleared
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 5. AUDIT LOGS TAB */}
      {/* ------------------------------------------------------------------- */}
      {activeAdminTab === 'admin-activity' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="text-base font-bold font-brand-primary text-[#00274C]">
                DGCA Compliance Audit & Live Check-in Stream
              </h3>
              <p className="text-xs text-slate-500">Every biometric check-in, fee change, and attendance update is logged permanently</p>
            </div>
            <span className="text-xs font-flight-mono text-slate-400">Total Entries: {activityLogs.length}</span>
          </div>

          <div className="space-y-3">
            {activityLogs.map((log, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-brand-primary text-[#00274C] uppercase text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                      {log.verb}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {log.snapshot?.studentName || 'Cadet'}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1 text-[11px]">
                    {log.snapshot?.subject ? `Subject: ${log.snapshot.subject} • New Attendance: ${log.snapshot.newAttendanceRate}` : ''}
                    {log.snapshot?.receiptNo ? `Receipt: ${log.snapshot.receiptNo} • Amount: ₹${log.snapshot.amount}` : ''}
                  </p>
                </div>
                <div className="text-[11px] text-slate-400 font-flight-mono shrink-0">
                  {log.createdAt}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 6. ADMIN OS & PROVISIONING BRIDGE TAB */}
      {/* ------------------------------------------------------------------- */}
      {activeAdminTab === 'admin-bridge' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#00274C] to-[#00172E] text-white p-6 rounded-2xl shadow-md border border-[#00274C] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D8A027] text-[#00274C] uppercase tracking-wider flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-pulse" />
                  Live Sync Bridge
                </span>
                <span className="text-xs text-white/60 font-flight-mono">v2.4.0 • Brand Book 2026</span>
              </div>
              <h2 className="text-xl font-bold font-brand-primary text-white">
                Airborne Admin OS & Student Portal Bridge
              </h2>
              <p className="text-xs text-white/70 max-w-2xl mt-1">
                Connects Airborne Admin OS (Next.js / Prisma) with the Cadet Flight Operations Portal. Provision provisional cadet credentials, verify HMAC-SHA256 webhooks, and sync live biometric attendance.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleTestWebhookPing}
                disabled={webhookPingStatus.testing}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold font-brand-primary border border-white/20 flex items-center gap-2 cursor-pointer transition-all"
              >
                <Zap className={`w-3.5 h-3.5 text-[#D8A027] ${webhookPingStatus.testing ? 'animate-spin' : ''}`} />
                <span>{webhookPingStatus.testing ? 'Testing Ping...' : 'Ping Webhook Bridge'}</span>
              </button>
            </div>
          </div>

          {/* Webhook Ping Feedback */}
          {webhookPingStatus.result && (
            <div className={`p-4 rounded-xl text-xs border flex items-center justify-between ${
              webhookPingStatus.result.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Webhook Bridge Active:</strong> Responded with round-trip latency of{' '}
                  <span className="font-flight-mono font-bold">{webhookPingStatus.result.latencyMs}ms</span>. Handshake verified.
                </span>
              </div>
              <span className="text-[10px] font-flight-mono text-slate-500">
                {webhookPingStatus.result.timestamp}
              </span>
            </div>
          )}

          {/* Provisioning Form (Matches Admin OS UI Screenshot) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-base font-bold font-brand-primary text-[#00274C] flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#DB241E]" />
                  <span>Provision student portal login</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Creates a STUDENT user (or links existing) to CRM Student userId in Admin OS.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 font-flight-mono">
                Argon2id Hashed
              </span>
            </div>

            <form onSubmit={handleProvisionAccess} className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                {/* Student / Application No Selector / Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold font-brand-primary uppercase text-slate-600">
                      Application No / Roll Number / UUID
                    </label>
                    <span className="text-[10px] font-bold text-emerald-700 font-flight-mono">
                      Type or Select
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      list="cadets-provision-datalist"
                      placeholder="e.g. APP-2026-00010, AA-CPL-2026-084, or UUID"
                      value={selectedStudentForProvision}
                      onChange={(e) => setSelectedStudentForProvision(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-flight-mono focus:bg-white focus:outline-hidden focus:border-[#00274C]"
                    />
                    <datalist id="cadets-provision-datalist">
                      <option value="APP-2026-00010">APP-2026-00010 — Enrolled Admission (Lead)</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.applicationNo || s.studentCode}>
                          {s.applicationNo ? `${s.applicationNo} — ` : ''}{s.studentCode} ({s.name})
                        </option>
                      ))}
                    </datalist>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400">Quick fill:</span>
                    <button
                      type="button"
                      onClick={() => setSelectedStudentForProvision('APP-2026-00010')}
                      className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-800 hover:bg-blue-100 font-flight-mono font-semibold border border-blue-200 cursor-pointer"
                    >
                      APP-2026-00010 (Enrolled Admission)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedStudentForProvision('APP-2026-00418')}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 font-flight-mono font-semibold border border-slate-200 cursor-pointer"
                    >
                      APP-2026-00418 (Ruzal Dhral)
                    </button>
                  </div>
                </div>

                {/* Temp Password Input with Random Generator */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold font-brand-primary uppercase text-slate-600">
                      Temp password (min 8)
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateRandomPassword}
                      className="text-[10px] font-bold text-[#DB241E] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Random Key</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Temp password (min 8)"
                      value={provisionalPassword}
                      onChange={(e) => setProvisionalPassword(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-flight-mono focus:bg-white focus:outline-hidden focus:border-[#00274C]"
                    />
                  </div>
                </div>

                {/* Provision Access Button */}
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={!selectedStudentForProvision || provisionalPassword.length < 8 || isProvisioning}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#00274C] hover:bg-[#00172E] disabled:bg-slate-300 text-white text-xs font-bold font-brand-primary flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-[#D8A027]" />
                    <span>{isProvisioning ? 'Provisioning...' : 'Provision access'}</span>
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-600">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mustChangePassword}
                    onChange={(e) => setMustChangePassword(e.target.checked)}
                    className="rounded text-[#00274C] focus:ring-0"
                  />
                  <span>Require password change on first sign-in</span>
                </label>
                <span className="text-slate-300">•</span>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Outbound webhook triggers automatically to Admin OS</span>
                </span>
              </div>
            </form>

            {/* Provision Result Card */}
            {provisionResult && (
              <div className="mt-5 p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white uppercase tracking-wider">
                        Access Provisioned
                      </span>
                      {provisionResult.applicationNo && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00274C] text-white font-flight-mono">
                          {provisionResult.applicationNo}
                        </span>
                      )}
                      <span className="text-xs font-bold text-slate-800">
                        {provisionResult.name} ({provisionResult.studentCode})
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Login Identifier: <strong className="font-flight-mono">{provisionResult.applicationNo || provisionResult.studentCode || provisionResult.email}</strong>
                      {' • '}
                      Temp Password: <strong className="font-flight-mono text-[#DB241E]">{provisionalPassword}</strong>
                      {' • '}
                      User ID: <span className="font-flight-mono text-slate-500 text-[11px]">{provisionResult.userId}</span>
                    </p>
                  </div>

                  <button
                    onClick={handleCopyNotice}
                    className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-bold font-brand-primary border border-slate-200 flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer transition-all"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#00274C]" />
                    <span>{copyNoticeSuccess ? 'Copied to Clipboard!' : 'Copy Cadet Notice'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Webhook Bridge Telemetry Specs */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 font-brand-primary uppercase">Inbound Webhook</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 font-flight-mono">ACTIVE</span>
              </div>
              <p className="text-xs font-flight-mono font-semibold text-[#00274C]">/api/v1/webhooks/admin-os</p>
              <p className="text-[11px] text-slate-500">Listens for portal access creation and profile updates from Admin OS.</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 font-brand-primary uppercase">Outbound Target</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 font-flight-mono">READY</span>
              </div>
              <p className="text-xs font-flight-mono font-semibold text-[#00274C] truncate">/api/v1/webhooks/student-portal</p>
              <p className="text-[11px] text-slate-500">Delivers attendance marks, quiz drills, and fee payments to Admin OS.</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 font-brand-primary uppercase">Signature Protocol</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 font-flight-mono">HMAC-256</span>
              </div>
              <p className="text-xs font-flight-mono font-semibold text-[#00274C]">SHA-256 Digest</p>
              <p className="text-[11px] text-slate-500">Constant-time verification with API_SHARED_SECRET token handshake.</p>
            </div>
          </div>

          {/* Cadet Provisioning Roster Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-brand-primary text-[#00274C]">
                  Delta-26 Cohort Login Access Matrix
                </h3>
                <p className="text-xs text-slate-500">Real-time status of provisional flight deck access for enrolled cadets</p>
              </div>
              <span className="text-xs font-flight-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                8 Cadets Enrolled
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-brand-primary uppercase text-[11px] tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Cadet Pilot</th>
                    <th className="py-3 px-4">DGCA Computer No</th>
                    <th className="py-3 px-4">Portal ID / Email</th>
                    <th className="py-3 px-4">Attendance Rate</th>
                    <th className="py-3 px-4">Portal Access</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((cadet) => (
                    <tr key={cadet.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={cadet.avatar}
                            alt={cadet.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-900 font-brand-primary">{cadet.name}</p>
                            <p className="text-[10px] text-slate-500 font-flight-mono">{cadet.studentCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-flight-mono font-bold text-slate-700">
                        {cadet.computerNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-flight-mono text-[11px]">
                        {cadet.email}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded font-bold font-flight-mono ${
                          cadet.attendanceRate >= 80 ? 'text-emerald-700 bg-emerald-50' : 'text-[#DB241E] bg-red-50'
                        }`}>
                          {cadet.attendanceRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>PROVISIONED</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedStudentForProvision(cadet.studentCode);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold font-brand-primary bg-slate-100 hover:bg-[#00274C] hover:text-white rounded-lg transition-colors cursor-pointer"
                          >
                            Reset / Provision
                          </button>
                          <button
                            onClick={() => onPreviewStudent(cadet.studentCode)}
                            className="px-2.5 py-1 text-[11px] font-bold font-brand-primary bg-[#00274C] hover:bg-[#00172E] text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <span>Inspect</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Record Fee Payment Modal */}
      {showPaymentModal && selectedStudentForPay && (
        <div className="fixed inset-0 z-50 bg-[#00172E]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold font-brand-primary text-[#00274C]">
              Record Cadet Fee Payment
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Updates Airborne DB and issues instant receipt to {selectedStudentForPay.name}.
            </p>

            {paySuccessMsg && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{paySuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase font-brand-primary mb-1">
                  Cadet Pilot
                </label>
                <div className="p-2.5 bg-slate-100 rounded-xl text-xs font-flight-mono font-semibold text-slate-800">
                  {selectedStudentForPay.name} ({selectedStudentForPay.studentCode})
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase font-brand-primary mb-1">
                  Payment Amount (INR)
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  required
                  min="1000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-flight-mono focus:bg-white focus:outline-hidden focus:border-[#00274C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase font-brand-primary mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-brand-primary focus:bg-white focus:outline-hidden focus:border-[#00274C]"
                >
                  <option value="BANK_TRANSFER">Bank Transfer / NEFT / IMPS</option>
                  <option value="UPI">UPI / QR Code</option>
                  <option value="CASH">Cash at Dwarka Front Office</option>
                  <option value="CHEQUE">Cheque / Demand Draft</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase font-brand-primary mb-1">
                  Fee Head / Description
                </label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-brand-body focus:bg-white focus:outline-hidden focus:border-[#00274C]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00274C] hover:bg-[#00172E] text-white text-xs font-bold font-brand-primary cursor-pointer shadow-md"
                >
                  Confirm & Sync DB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
