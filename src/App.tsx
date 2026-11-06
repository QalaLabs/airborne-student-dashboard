import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CockpitHudOverview } from './components/CockpitHudOverview';
import { TimetableSection } from './components/TimetableSection';
import { BatchesSection } from './components/BatchesSection';
import { CoursesSection } from './components/CoursesSection';
import { CertificatesSection } from './components/CertificatesSection';
import { AeroBotChat } from './components/AeroBotChat';
import { FeesSection } from './components/FeesSection';
import { OtherCoursesSection } from './components/OtherCoursesSection';
import { AttendanceSection } from './components/AttendanceSection';
import { LoginScreen } from './components/LoginScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { AirborneLogo } from './components/AirborneLogo';
import { AeroBotIcon } from './components/AeroBotIcon';
import { 
  initialBlankStudent, 
  initialCohortBatch, 
  academyCoursesCatalog 
} from './data/coursesCatalog';
import { 
  TabType, 
  AttendanceRecord, 
  AuthUser, 
  CourseModule, 
  FeeHeadBreakdown, 
  TimetableSession, 
  FeeInstallment, 
  BatchInfo, 
  StudentProfile 
} from './types/dashboard';
import { apiFetch } from './lib/api';

export const App: React.FC = () => {
  // Authentication State (supports Cadet Pilot & Academy Admin, including SSO launch)
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ssoCode = params.get('student_code') || params.get('roll_number') || params.get('code');
      const previewRole = params.get('role');
      if (ssoCode) {
        return {
          id: ssoCode,
          name: `Cadet ${ssoCode}`,
          role: (previewRole === 'admin') ? 'admin' : 'student',
          studentCode: ssoCode,
          email: `${ssoCode.toLowerCase()}@cadet.airborne.in`
        };
      }
      const saved = localStorage.getItem('airborne_auth_user') || sessionStorage.getItem('airborne_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Admin cadet inspection mode
  const [adminPreviewStudentCode, setAdminPreviewStudentCode] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const saved = localStorage.getItem('airborne_auth_user') || sessionStorage.getItem('airborne_auth_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u.role === 'admin') return 'admin-overview';
      } catch {}
    }
    return 'overview';
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatPrompt, setChatPrompt] = useState<string | undefined>(undefined);

  // Dynamic Dashboard States for Cadet View (Clean Zero-State Initializers)
  const [student, setStudent] = useState<StudentProfile>(() => {
    if (authUser && authUser.role === 'student') {
      return {
        ...initialBlankStudent,
        id: authUser.id,
        name: authUser.name,
        rollNumber: authUser.studentCode || authUser.id,
        email: authUser.email,
      };
    }
    return initialBlankStudent;
  });
  const [sessions, setSessions] = useState<TimetableSession[]>([]);
  const [courses, setCourses] = useState<CourseModule[]>([]);
  const [installments, setInstallments] = useState<FeeInstallment[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [todaySessionMarked, setTodaySessionMarked] = useState(false);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [batch, setBatch] = useState<BatchInfo>(initialCohortBatch);

  // Dynamic fee breakdown derived strictly from real cadet financial records
  const feeHeads = React.useMemo<FeeHeadBreakdown[]>(() => {
    if (!student.totalFee) return [];
    return [
      {
        title: 'DGCA Ground School Tuition',
        allocatedAmount: Math.round(student.totalFee * 0.65),
        paidAmount: Math.min(Math.round(student.totalFee * 0.65), student.paidFee),
        status: (student.paidFee >= Math.round(student.totalFee * 0.65))
          ? 'Fully Paid'
          : (student.paidFee > 0 ? 'Partially Paid' : 'Pending'),
      },
      {
        title: 'WPC RTR(A) Radio Telephony Simulation Lab',
        allocatedAmount: Math.round(student.totalFee * 0.20),
        paidAmount: Math.max(0, Math.min(Math.round(student.totalFee * 0.20), student.paidFee - Math.round(student.totalFee * 0.65))),
        status: (student.paidFee >= Math.round(student.totalFee * 0.85))
          ? 'Fully Paid'
          : (student.paidFee > Math.round(student.totalFee * 0.65) ? 'Partially Paid' : 'Pending'),
      },
      {
        title: 'Study Kits, Jeppesen Navigation & LMS License',
        allocatedAmount: Math.round(student.totalFee * 0.15),
        paidAmount: Math.max(0, student.paidFee - Math.round(student.totalFee * 0.85)),
        status: (student.paidFee >= student.totalFee)
          ? 'Fully Paid'
          : (student.paidFee > Math.round(student.totalFee * 0.85) ? 'Partially Paid' : 'Pending'),
      },
    ];
  }, [student.totalFee, student.paidFee]);

  // --------------------------------------------------------------------------
  // PULL CADET DATA FROM AIRBORNE ADMIN DATABASE
  // --------------------------------------------------------------------------
  const fetchStudentData = async (studentCode: string) => {
    try {
      const data = await apiFetch<any>(`/api/v1/dashboard/${studentCode}`);
      if (data.student) {
        setStudent(prev => ({
          ...prev,
          ...data.student
        }));
        if (data.student.batchName) {
          setBatch(prev => ({
            ...prev,
            name: data.student.batchName
          }));
        }
      }
      if (data.timetable) {
        setSessions(data.timetable);
      }
      if (data.courses) {
        setCourses(data.courses.map((c: any) => ({
          id: c.id || c.code,
          code: c.code,
          name: c.name,
          instructor: c.instructor || 'Senior Ground Instructor',
          progress: c.progress || 0,
          completedLectures: c.completedLectures || 0,
          totalLectures: c.totalLectures || 30,
          nextMockExam: c.nextMockExam || 'DGCA Mock #1',
          dgcaPassingMarks: 70,
          averageScore: c.averageScore || 0,
          syllabusTopics: c.syllabusTopics || [],
          handoutsCount: c.handoutsCount || 0,
          category: c.category || 'Ground Subject',
        })));
      }
      if (data.transactions) {
        setInstallments(data.transactions);
      }
      if (data.attendanceRecords) {
        setAttendanceRecords(data.attendanceRecords);
      }
      if (data.certificates) {
        setCertificates(data.certificates);
      }
      if (data.batchmates) {
        setBatch(prev => ({
          ...prev,
          currentStrength: data.batchmates.length,
          batchmates: data.batchmates
        }));
      }
      setTodaySessionMarked(Boolean(data.attendanceMarkedToday));
    } catch (err) {
      console.warn('Connected to fallback mock dataset; Airborne Admin DB syncing ready on port.', err);
    }
  };

  // Auth Handlers
  const handleLoginSuccess = (user: AuthUser) => {
    setAuthUser(user);
    setAdminPreviewStudentCode(null);
    if (user.role === 'student' && user.studentCode) {
      localStorage.setItem('airborne_student_id', user.studentCode);
    }
    if (user.role === 'admin') {
      setActiveTab('admin-overview');
    } else {
      setActiveTab('overview');
      fetchStudentData(user.studentCode || user.id);
    }
  };



  useEffect(() => {
    if (!authUser) return;

    const timer = setTimeout(() => {
      if (authUser.role === 'student') {
        const code = authUser.studentCode || authUser.id;
        localStorage.setItem('airborne_student_id', code);
        fetchStudentData(code);
        apiFetch('/api/v1/activity/log', {
          method: 'POST',
          body: JSON.stringify({
            student_id: code,
            verb: 'portal_session_active',
            activity_type: 'SYSTEM',
            title: 'Cadet Dashboard Active Session',
            notes: 'Cadet accessed student flight deck HUD. Live telemetry loaded from Cloud SQL.'
          })
        }).catch(() => {});
      } else if (authUser.role === 'admin' && adminPreviewStudentCode) {
        fetchStudentData(adminPreviewStudentCode);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [authUser, adminPreviewStudentCode]);



  const handleLogout = () => {
    localStorage.removeItem('airborne_auth_user');
    sessionStorage.removeItem('airborne_auth_user');
    setAuthUser(null);
    setAdminPreviewStudentCode(null);
    setActiveTab('overview');
  };

  const handleAdminPreviewStudent = (studentCode: string) => {
    setAdminPreviewStudentCode(studentCode);
    setActiveTab('overview');
    fetchStudentData(studentCode);
  };

  const handleReturnToAdminDeck = () => {
    setAdminPreviewStudentCode(null);
    setActiveTab('admin-overview');
  };

  // Filter today's sessions (Friday)
  const todaySessions = sessions.filter(s => s.isToday);

  // --------------------------------------------------------------------------
  // MARK ATTENDANCE AND PUSH DIRECTLY TO AIRBORNE ADMIN DB
  // --------------------------------------------------------------------------
  const handleMarkAttendance = async (sessionId: string = 'TT-01') => {
    if (todaySessionMarked) return;
    const code = student.rollNumber || authUser?.studentCode || authUser?.id || '';

    try {
      const result = await apiFetch<any>('/api/v1/attendance/mark', {
        method: 'POST',
        body: JSON.stringify({
          student_id: code,
          session_id: sessionId
        })
      });

      setTodaySessionMarked(true);
      setSessions(prev => prev.map(s => {
        if (s.id === sessionId || (s.isToday && s.status === 'in-progress')) {
          return {
            ...s,
            attendanceMarked: true,
            attendanceTime: result.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
        return s;
      }));

      if (typeof result.attendanceRate === 'number') {
        setStudent(prev => ({
          ...prev,
          attendedClasses: result.attendedClasses ?? prev.attendedClasses + 1,
          attendanceRate: result.attendanceRate,
        }));
      }

      await fetchStudentData(code);
    } catch (e) {
      console.warn('Attendance sync failed.', e);
    }
  };

  // --------------------------------------------------------------------------
  // RECORD FEE PAYMENT AND PUSH DIRECTLY TO AIRBORNE ADMIN DB
  // --------------------------------------------------------------------------
  const handlePaymentSuccess = async (paidAmount: number, receiptNum: string, paymentMethod: string = 'UPI') => {
    const code = student.rollNumber || authUser?.studentCode || authUser?.id || '';

    try {
      const result = await apiFetch<any>('/api/v1/fees/pay', {
        method: 'POST',
        body: JSON.stringify({
          student_id: code,
          amount: paidAmount,
          payment_method: paymentMethod
        })
      });

      const serverReceipt = result.receiptNo || receiptNum;
      setStudent(prev => ({
        ...prev,
        paidFee: typeof result.feePaid === 'number' ? result.feePaid : prev.paidFee + paidAmount,
        pendingFee: typeof result.newBalance === 'number' ? result.newBalance : 0,
      }));

      setInstallments(prev => prev.map(inst => {
        if (inst.status === 'pending') {
          return {
            ...inst,
            status: 'paid',
            paidOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            receiptNumber: serverReceipt,
            paymentMode: `Online Payment (${paymentMethod})`,
          };
        }
        return inst;
      }));



      await fetchStudentData(code);
      return serverReceipt;
    } catch (e) {
      console.warn('Payment transaction sync failed.', e);
      throw e;
    }
  };

  // Handler to jump to chat with a pre-filled query
  const handleOpenChat = (prompt: string) => {
    setChatPrompt(prompt);
    setActiveTab('chatbot');
  };

  // If user is not logged in, show the dual login screen
  if (!authUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Determine if viewing as admin or cadet
  const isAdminView = authUser.role === 'admin' && !adminPreviewStudentCode;

  return (
    <div className="h-dvh overflow-hidden bg-[#F5F6F8] text-[#212121] flex flex-col font-brand-body">
      {/* Brand Header */}
      <Header
        student={student}
        currentUser={authUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onQuickAttendance={() => handleMarkAttendance('TT-01')}
        todaySessionMarked={todaySessionMarked}
        isAdminPreviewingStudent={Boolean(adminPreviewStudentCode)}
        onReturnToAdminDeck={handleReturnToAdminDeck}
        onLogout={handleLogout}
      />

      {/* Main Layout Container */}
      <div className="flex-1 min-h-0 flex max-w-[1600px] w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          student={student}
          currentUser={authUser}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          onLogout={handleLogout}
          isAdminPreviewingStudent={Boolean(adminPreviewStudentCode)}
          onReturnToAdminDeck={handleReturnToAdminDeck}
        />

        {/* Dynamic Section Content */}
        <div className="flex-1 min-h-0 overflow-y-auto">
        <main className="p-4 sm:p-6 lg:p-8 max-w-full">
          {/* Admin Command Deck (When logged in as Admin and not in cadet inspection mode) */}
          {isAdminView ? (
            <AdminDashboard
              adminUser={authUser}
              onPreviewStudent={handleAdminPreviewStudent}
              activeAdminTab={activeTab as any}
              setActiveAdminTab={setActiveTab}
            />
          ) : (
            /* Cadet Pilot Dashboard (When logged in as Student, or Admin in inspection mode) */
            <>
              {activeTab === 'overview' && (
                <CockpitHudOverview
                  student={student}
                  todaySessions={todaySessions}
                  batch={batch}
                  courses={courses}
                  setActiveTab={setActiveTab}
                  onMarkAttendance={handleMarkAttendance}
                  todaySessionMarked={todaySessionMarked}
                />
              )}

              {activeTab === 'timetable' && (
                <TimetableSection
                  sessions={sessions}
                  onMarkAttendance={handleMarkAttendance}
                  todaySessionMarked={todaySessionMarked}
                />
              )}

              {activeTab === 'batches' && (
                <BatchesSection
                  batch={batch}
                  currentStudentRollNumber={student.rollNumber || authUser.studentCode || authUser.id}
                  onOpenChat={handleOpenChat}
                />
              )}

              {activeTab === 'courses' && (
                <CoursesSection
                  courses={courses}
                  studentCode={student.rollNumber || authUser?.studentCode || authUser?.id || ''}
                  onOpenChat={handleOpenChat}
                />
              )}

              {activeTab === 'certificates' && (
                <CertificatesSection
                  student={student}
                  certificates={certificates}
                  onOpenChat={handleOpenChat}
                />
              )}

              {activeTab === 'chatbot' && (
                <AeroBotChat
                  student={student}
                  initialPrompt={chatPrompt}
                  onClearInitialPrompt={() => setChatPrompt(undefined)}
                  onMarkAttendance={() => handleMarkAttendance('TT-01')}
                  todaySessionMarked={todaySessionMarked}
                />
              )}

              {activeTab === 'fees' && (
                <FeesSection
                  student={student}
                  installments={installments}
                  feeHeads={feeHeads}
                  onPaymentSuccess={handlePaymentSuccess}
                />
              )}

              {activeTab === 'other-courses' && (
                <OtherCoursesSection
                  courses={academyCoursesCatalog}
                  student={student}
                  onOpenChat={handleOpenChat}
                />
              )}

              {activeTab === 'attendance' && (
                <AttendanceSection
                  student={student}
                  records={attendanceRecords}
                  onMarkAttendance={() => handleMarkAttendance('TT-01')}
                  todaySessionMarked={todaySessionMarked}
                  onLeaveSubmitted={async (leaveDate, reason) => {
                    const code = student.rollNumber || authUser?.studentCode || authUser?.id || '';
                    await apiFetch('/api/v1/leave/request', {
                      method: 'POST',
                      body: JSON.stringify({
                        student_id: code,
                        leave_date: leaveDate,
                        reason,
                      })
                    });
                  }}
                />
              )}
            </>
          )}
        </main>

      <footer className="bg-[#00274C] text-white border-t border-[#00172E] py-6 px-4 sm:px-8 text-xs">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <AirborneLogo variant="full" theme="light" size="sm" showSubtitle={false} />
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="text-slate-300 font-brand-body">From Dream to Cockpit</span>
          </div>

          <div className="text-center md:text-right text-slate-300 text-[11px] space-y-0.5">
            <p>E-549, 2nd Floor, Ramphal Chowk, Sector-7, Dwarka, New Delhi-110075</p>
            <p>
              Counseling: <a href="tel:+919953777320" className="text-[#D8A027] font-semibold hover:underline">+91 9953-777-320</a> | <a href="mailto:info@airborneaviation.in" className="text-slate-200 hover:underline">info@airborneaviation.in</a> | <a href="https://airborneaviation.in" target="_blank" rel="noreferrer" className="text-slate-200 hover:underline">airborneaviation.in</a>
            </p>
            <p className="text-[10px] text-slate-400 pt-1">
              © 2026 Airborne Aviation Private Limited (CIN: U85306DL2026PTC465670)
            </p>
          </div>
        </div>
      </footer>
        </div>
      </div>

      {/* Floating AeroBot Quick Copilot Trigger (Available for cadets) */}
      {!isAdminView && activeTab !== 'chatbot' && (
        <button
          onClick={() => setActiveTab('chatbot')}
          className="fixed bottom-6 right-6 z-50 bg-[#00274C] hover:bg-[#00172E] text-white border border-white/10 px-4 py-2.5 rounded-full flex items-center gap-3 transition-colors cursor-pointer"
          title="Open AeroBot AI Copilot"
        >
          <div className="relative">
            <AeroBotIcon size="md" active={true} theme="gold" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-black font-brand-primary tracking-wide text-white group-hover:text-[#D8A027] transition-colors">
              AeroBot Copilot
            </div>
            <div className="text-[10px] text-slate-300 font-mono">
              24/7 DGCA Ground Mentor
            </div>
          </div>
        </button>
      )}

    </div>
  );
};

export default App;
