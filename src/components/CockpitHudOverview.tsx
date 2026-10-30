import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Users, 
  BookOpen, 
  CreditCard, 
  AlertTriangle, 
  Plane, 
  ChevronRight, 
  Calendar, 
  ShieldCheck, 
  Video,
  Activity,
  Database,
  RefreshCw
} from 'lucide-react';
import { 
  StudentProfile, 
  TimetableSession, 
  BatchInfo, 
  CourseModule, 
  TabType 
} from '../types/dashboard';
import { AeroBotIcon } from './AeroBotIcon';

interface CockpitHudOverviewProps {
  student: StudentProfile;
  todaySessions: TimetableSession[];
  batch: BatchInfo;
  courses: CourseModule[];
  setActiveTab: (tab: TabType) => void;
  onMarkAttendance: (sessionId: string) => void;
  todaySessionMarked: boolean;
}

export const CockpitHudOverview: React.FC<CockpitHudOverviewProps> = ({
  student,
  todaySessions,
  batch,
  courses,
  setActiveTab,
  onMarkAttendance,
  todaySessionMarked,
}) => {
  // Find current or next session
  const activeSession = todaySessions.find(s => s.status === 'in-progress') || todaySessions[0];

  // Real-time synced activities from Main GCR Admin Database
  const [liveActivities, setLiveActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  const fetchLiveActivities = async () => {
    setLoadingActivities(true);
    try {
      const code = student.rollNumber || 'AA-CPL-2026-084';
      const res = await fetch(`/api/v1/student/${code}/activities?limit=10`);
      if (res.ok) {
        const data = await res.json();
        if (data.activities && Array.isArray(data.activities)) {
          setLiveActivities(data.activities);
        }
      }
    } catch (err) {
      console.warn('Could not refresh activities from Admin DB', err);
    } finally {
      setLoadingActivities(false);
    }
  };

  useEffect(() => {
    fetchLiveActivities();
  }, [student.rollNumber, todaySessionMarked]);

  return (
    <div className="space-y-6">
      {/* Hero Pilot Welcome & Flight Readiness Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#00274C] via-[#001E3D] to-[#00172E] text-white p-6 md:p-8 shadow-xl border border-[#00172E]">
        {/* Decorative Radar Lines & Flight Trajectory */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 pointer-events-none flex items-center justify-end pr-10">
          <Plane className="w-80 h-80 text-white rotate-[-15deg] transform translate-x-12" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="bg-[#DB241E] text-white text-[11px] font-bold px-2.5 py-0.8 rounded-full uppercase tracking-wider font-brand-primary">
              Cadet Pilot In-Training
            </span>
            <span className="bg-[#D8A027] text-[#00274C] text-[11px] font-black px-2.5 py-0.8 rounded-full font-brand-primary uppercase tracking-wider">
              100% Exam Success Rate
            </span>
            <span className="bg-white/10 text-slate-200 text-[11px] font-semibold px-2.5 py-0.8 rounded-full font-flight-mono border border-white/10">
              {student.batchName} • Max 25 Cap
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold px-2.5 py-0.8 rounded-full border border-emerald-400/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              DGCA Compliant (80%+ Attn)
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-brand-primary tracking-tight leading-tight text-white">
            Ready for Takeoff, <span className="text-white underline decoration-[#DB241E] decoration-4 underline-offset-4">{student.name}</span>
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            "Shaping aspiring students into airline-ready pilots through mentorship, discipline, and conceptual clarity."
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {!todaySessionMarked ? (
              <button
                onClick={() => onMarkAttendance(activeSession?.id || 'TT-01')}
                className="px-5 py-2.5 rounded-xl bg-[#DB241E] hover:bg-[#b81d18] text-white text-xs sm:text-sm font-bold font-brand-primary transition-all shadow-lg hover:shadow-red-600/30 flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Today's Attendance ({activeSession?.subjectName || 'Current Lecture'})</span>
              </button>
            ) : (
              <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Attendance Logged for Today</span>
              </div>
            )}

            <button
              onClick={() => setActiveTab('timetable')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-semibold font-brand-primary transition-colors border border-white/15 flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#D8A027]" />
              <span>Full Timetable</span>
            </button>

            <button
              onClick={() => setActiveTab('chatbot')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-[#D8A027] hover:text-white text-xs sm:text-sm font-semibold font-brand-primary transition-colors border border-white/15 flex items-center gap-2 cursor-pointer"
            >
              <AeroBotIcon size="xs" active={false} theme="gold" />
              <span>Consult AeroBot</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Flight Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Metric */}
        <div 
          onClick={() => setActiveTab('attendance')}
          className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-[#00274C]/30 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8A9BB0] uppercase tracking-wider font-brand-primary">
              Overall Attendance
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#00274C] font-brand-primary">
              {student.attendanceRate}%
            </span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              +8.5% above DGCA limit
            </span>
          </div>

          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${student.attendanceRate}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>{student.attendedClasses} / {student.totalClasses} Lectures</span>
            <span className="font-semibold text-emerald-600">Safe Margin: 11 Days</span>
          </div>
        </div>

        {/* Syllabus Progress */}
        <div 
          onClick={() => setActiveTab('courses')}
          className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-[#00274C]/30 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8A9BB0] uppercase tracking-wider font-brand-primary">
              DGCA Ground Syllabus
            </span>
            <div className="p-2 rounded-xl bg-slate-100 text-[#00274C] group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#00274C] font-brand-primary">
              74%
            </span>
            <span className="text-xs font-semibold text-[#00274C] bg-slate-100 px-2 py-0.5 rounded">
              5 Subjects Active
            </span>
          </div>

          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-[#00274C] h-2 rounded-full transition-all duration-500" 
              style={{ width: `74%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>Air Regs Cleared (100%)</span>
            <span className="font-semibold text-[#00274C]">Next: Met Mock #4</span>
          </div>
        </div>

        {/* Pending Fee */}
        <div 
          onClick={() => setActiveTab('fees')}
          className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-[#DB241E]/40 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8A9BB0] uppercase tracking-wider font-brand-primary">
              Fee Account Status
            </span>
            <div className="p-2 rounded-xl bg-[#D8A027]/15 text-[#00274C] group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#DB241E] font-brand-primary font-flight-mono">
              ₹{student.pendingFee.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-[#00274C] bg-[#D8A027]/15 border border-[#D8A027]/30 px-2 py-0.5 rounded">
              Due 15 Nov
            </span>
          </div>

          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-[#D8A027] h-2 rounded-full transition-all duration-500" 
              style={{ width: `${(student.paidFee / student.totalFee) * 100}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>Paid: ₹{student.paidFee.toLocaleString()}</span>
            <span className="font-bold text-[#DB241E] group-hover:underline">Pay Dues →</span>
          </div>
        </div>

        {/* Batch Delta-26 */}
        <div 
          onClick={() => setActiveTab('batches')}
          className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-[#00274C]/30 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8A9BB0] uppercase tracking-wider font-brand-primary">
              Cadet Cohort
            </span>
            <div className="p-2 rounded-xl bg-slate-100 text-[#00274C] group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#00274C] font-brand-primary">
              {batch.currentStrength} <span className="text-base text-slate-400 font-normal">/ {batch.maxStudents}</span>
            </span>
            <span className="text-[10px] font-bold text-[#D8A027] bg-[#D8A027]/10 border border-[#D8A027]/30 px-2 py-0.5 rounded uppercase">
              Brand Cap: 25
            </span>
          </div>

          <div className="mt-3 flex -space-x-2 overflow-hidden py-1">
            {batch.batchmates.slice(0, 5).map((bm) => (
              <img
                key={bm.id}
                src={bm.avatar}
                alt={bm.name}
                className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
              />
            ))}
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-[9px] font-bold text-[#00274C] ring-2 ring-white">
              +{batch.currentStrength - 5}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>Dwarka Campus</span>
            <span className="font-semibold text-[#00274C]">Capt. Navrang</span>
          </div>
        </div>
      </div>

      {/* 2-Column Section: Today's Briefing & Schedule + Notice Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Flight & Class Briefings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#00274C] font-brand-primary flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#DB241E]" />
                  Today's Briefing Schedule (Friday)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ground school & flight sim timetable at Dwarka Campus
                </p>
              </div>

              <button 
                onClick={() => setActiveTab('timetable')}
                className="text-xs font-bold text-[#00274C] hover:text-[#DB241E] flex items-center gap-1 transition-colors cursor-pointer"
              >
                View Full Week
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sessions List */}
            <div className="space-y-3">
              {todaySessions.map((session) => {
                const isMarked = session.attendanceMarked || (session.isToday && todaySessionMarked);
                return (
                  <div 
                    key={session.id}
                    className={`
                      p-4 rounded-xl border transition-all
                      ${session.status === 'in-progress' 
                        ? 'border-[#00274C] bg-gradient-to-r from-slate-50 to-white shadow-sm' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'}
                    `}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-[#00274C] text-white shrink-0">
                          <span className="text-[10px] font-bold text-[#D8A027] font-flight-mono uppercase">
                            {session.subjectCode}
                          </span>
                          <span className="text-xs font-black font-brand-primary">
                            {session.startTime.split(' ')[0]}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-[#00274C] font-brand-primary">
                              {session.subjectName}
                            </h4>
                            {session.status === 'in-progress' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DB241E] text-white uppercase tracking-wider animate-pulse">
                                Live In-Progress
                              </span>
                            )}
                            {session.status === 'completed' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Completed
                              </span>
                            )}
                          </div>

                          <p className="text-xs font-medium text-slate-700 mt-0.5">
                            {session.topic}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-500">
                            <span className="font-semibold text-slate-700">
                              Instructor: {session.instructorName}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#DB241E]" />
                              {session.location}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {session.startTime} – {session.endTime}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Attendance & Action Buttons */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        {isMarked ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Attendance Logged
                          </span>
                        ) : (
                          <button
                            onClick={() => onMarkAttendance(session.id)}
                            className="px-3.5 py-1.5 rounded-lg bg-[#DB241E] hover:bg-[#b81d18] text-white text-xs font-bold font-brand-primary transition-all shadow-sm active:scale-95 flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Mark Present
                          </button>
                        )}

                        {session.onlineLink && (
                          <a 
                            href={session.onlineLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-semibold text-[#00274C] hover:text-[#DB241E] flex items-center gap-1"
                          >
                            <Video className="w-3 h-3" />
                            Virtual Stream
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Enrolled Ground Course Progress Bar Overview */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#00274C] font-brand-primary flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#00274C]" />
                  Active Course Breakdown (5 DGCA Papers)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  DGCA passing requirement: 70% in each subject
                </p>
              </div>

              <button 
                onClick={() => setActiveTab('courses')}
                className="text-xs font-bold text-[#00274C] hover:text-[#DB241E] flex items-center gap-1 cursor-pointer"
              >
                View Syllabus
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {courses.slice(0, 4).map((crs) => (
                <div key={crs.id} className="p-3.5 rounded-xl border border-slate-200 bg-[#F5F6F8]/60 hover:bg-white hover:border-[#00274C]/30 transition-all">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#00274C] font-brand-primary truncate max-w-[180px]">
                      {crs.name}
                    </span>
                    <span className="font-black text-[#00274C] font-flight-mono">{crs.progress}%</span>
                  </div>

                  <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-1.5 rounded-full ${crs.progress === 100 ? 'bg-emerald-500' : 'bg-[#DB241E]'}`}
                      style={{ width: `${crs.progress}%` }}
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{crs.completedLectures} / {crs.totalLectures} Lectures</span>
                    <span className="font-semibold text-slate-700">Avg Score: {crs.averageScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Batch Notices & Direct Mentor Connect */}
        <div className="space-y-4">
          {/* Chief Mentor Counseling Box */}
          <div className="bg-gradient-to-br from-[#00274C] to-[#00172E] text-white rounded-2xl p-5 shadow-md border border-[#00172E]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#D8A027] text-[#00274C] font-black flex items-center justify-center text-sm shadow-md shrink-0">
                CNS
              </div>
              <div>
                <h4 className="text-sm font-bold font-brand-primary text-white">
                  Capt. Navrang Singh
                </h4>
                <p className="text-xs text-[#D8A027] font-semibold">Chief Mentor & Airline Pilot</p>
                <p className="text-[11px] text-slate-300 font-flight-mono">15+ Years Flight Experience</p>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 italic leading-relaxed">
              "Honest guidance, zero empty promises. Your DGCA exam session is 4 weeks away. Focus on 1-in-60 rule calculations and altimeter corrections."
            </div>

            <div className="mt-4 flex items-center gap-2">
              <a
                href="tel:+919953777320"
                className="flex-1 py-2 rounded-xl bg-[#DB241E] hover:bg-[#b81d18] text-white text-xs font-bold text-center transition-colors shadow cursor-pointer"
              >
                Call Mentor (+91 9953-777-320)
              </a>
              <button
                onClick={() => setActiveTab('chatbot')}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-[#D8A027] text-xs font-bold transition-colors border border-white/10 cursor-pointer flex items-center gap-1.5"
              >
                <AeroBotIcon size="xs" active={false} theme="gold" />
                <span>Chat</span>
              </button>
            </div>
          </div>

          {/* Batch Notice Board */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#00274C] font-brand-primary flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#DB241E]" />
                Dwarka Centre Notices
              </h3>
              <span className="text-[10px] bg-[#F5F6F8] text-[#00274C] border border-slate-200 px-2 py-0.5 rounded font-flight-mono font-semibold">
                Batch Delta-26
              </span>
            </div>

            <div className="space-y-3">
              {batch.notices.map((n) => (
                <div key={n.id} className="p-3 rounded-xl bg-[#F5F6F8] border border-slate-200 hover:border-slate-300 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`
                      text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider
                      ${n.badge === 'DGCA Circular' ? 'bg-[#00274C] text-white' : ''}
                      ${n.badge === 'Academic' ? 'bg-[#D8A027]/15 text-[#00274C] border border-[#D8A027]/30' : ''}
                      ${n.badge === 'Urgent' ? 'bg-[#DB241E] text-white' : ''}
                    `}>
                      {n.badge}
                    </span>
                    <span className="text-[10px] text-slate-500 font-flight-mono">{n.date}</span>
                  </div>

                  <h5 className="text-xs font-bold text-[#00274C] mt-1.5 font-brand-primary">
                    {n.title}
                  </h5>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    {n.content}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveTab('batches')}
              className="mt-4 w-full py-2 rounded-xl bg-[#F5F6F8] hover:bg-slate-200 text-[#00274C] text-xs font-bold font-brand-primary transition-colors text-center cursor-pointer"
            >
              View Batchmates & Roadmap →
            </button>
          </div>

          {/* Real-time Synced Activity Log against Main Admin Database */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#00274C] text-white">
                  <Database className="w-3.5 h-3.5 text-[#D8A027]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#00274C] font-brand-primary flex items-center gap-1.5">
                    Admin Database Sync Log
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">
                    GCR airborne-admin Cloud SQL
                  </p>
                </div>
              </div>
              <button
                onClick={fetchLiveActivities}
                disabled={loadingActivities}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-[#00274C] transition-colors cursor-pointer"
                title="Refresh Live Activities"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingActivities ? 'animate-spin text-[#DB241E]' : ''}`} />
              </button>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {liveActivities.length === 0 ? (
                <div className="text-center py-6">
                  <Activity className="w-6 h-6 text-slate-300 mx-auto mb-1 animate-pulse" />
                  <p className="text-xs text-slate-400">Listening for live cadet activity...</p>
                </div>
              ) : (
                liveActivities.map((act) => (
                  <div key={act.id} className="p-2.5 rounded-xl bg-[#F5F6F8] border border-slate-200/80 text-xs">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                        act.verb.includes('attendance') 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : act.verb.includes('payment')
                          ? 'bg-amber-100 text-amber-800'
                          : act.verb.includes('chat')
                          ? 'bg-blue-100 text-blue-800'
                          : act.verb.includes('quiz')
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {act.verb.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-flight-mono">
                        {act.occurredAt}
                      </span>
                    </div>
                    <p className="font-semibold text-[#00274C] text-[11px] leading-tight">
                      {act.snapshot?.title || act.snapshot?.query || act.snapshot?.action || 'Cadet interaction recorded'}
                    </p>
                    {act.snapshot?.responseSnippet && (
                      <p className="text-[10px] text-slate-500 mt-1 italic line-clamp-1">
                        &quot;{act.snapshot.responseSnippet}&quot;
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live 2-Way Connected
              </span>
              <span>Cadet: {student.rollNumber}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
