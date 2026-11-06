import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ChevronRight, 
  Calendar, 
  ShieldCheck, 
  Video,
  Activity,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { 
  StudentProfile, 
  TimetableSession, 
  BatchInfo, 
  CourseModule, 
  TabType 
} from '../types/dashboard';
import { apiFetch } from '../lib/api';

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

  // Real-time synced activities from Main Admin Database
  const [liveActivities, setLiveActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [copiedMetar, setCopiedMetar] = useState(false);

  const fetchLiveActivities = useCallback(async () => {
    setLoadingActivities(true);
    try {
      const code = student.rollNumber || 'AA-CPL-2026-084';
      const data = await apiFetch<any>(`/api/v1/student/${code}/activities?limit=10`);
      if (data.activities && Array.isArray(data.activities)) {
        setLiveActivities(data.activities);
      }
    } catch (err) {
      console.warn('Could not refresh activities from Admin DB', err);
    } finally {
      setLoadingActivities(false);
    }
  }, [student.rollNumber]);

  useEffect(() => {
    let active = true;
    const code = student.rollNumber || 'AA-CPL-2026-084';
    apiFetch<any>(`/api/v1/student/${code}/activities?limit=10`)
      .then(data => {
        if (active && data.activities && Array.isArray(data.activities)) {
          setLiveActivities(data.activities);
        }
      })
      .catch(err => {
        console.warn('Initial live activity load fallback', err);
      });

    return () => {
      active = false;
    };
  }, [student.rollNumber, todaySessionMarked]);

  const rawMetarString = "VIDP 300600Z 28010KT 5000 HZ NSC 28/14 Q1012 NOSIG";

  const handleCopyMetar = () => {
    navigator.clipboard.writeText(rawMetarString);
    setCopiedMetar(true);
    setTimeout(() => setCopiedMetar(false), 2000);
  };

  // Dynamic calculations
  const isAttendanceCompliant = student.attendanceRate >= 80.0;
  const attDiff = Math.abs(student.attendanceRate - 80.0).toFixed(1);
  const safeMarginClasses = isAttendanceCompliant
    ? Math.max(0, Math.floor(student.attendedClasses - (student.totalClasses * 0.8)))
    : 0;

  const syllabusAvg = courses.length > 0 
    ? Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Hero Pilot Welcome & Flight Readiness Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#00274C] text-white p-6 md:p-8 border border-[#00172E]">
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[12px] font-medium text-slate-300 font-flight-mono">
              {student.batchName}
            </span>
            <span className={`text-[12px] font-medium flex items-center gap-1 ${
              isAttendanceCompliant ? 'text-emerald-300' : 'text-red-300'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              {isAttendanceCompliant ? 'Above 80% DGCA line' : 'Below 80% DGCA line'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-medium font-brand-primary leading-tight text-white">
            {student.name}
          </h1>

          <p className="mt-2 text-sm text-slate-300 leading-relaxed max-w-2xl">
            Dwarka ground school. Five DGCA papers, attendance, and fee ledger.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {!todaySessionMarked ? (
              <button
                onClick={() => onMarkAttendance(activeSession?.id || 'TT-01')}
                className="h-11 px-4 rounded-lg bg-[#DB241E] hover:bg-[#b81d18] text-white text-sm font-medium font-brand-primary transition-colors flex items-center gap-2 cursor-pointer"
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

          </div>
        </div>
      </div>

      {/* 4 Flight Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Metric */}
        <div 
          onClick={() => setActiveTab('attendance')}
          className="bg-white rounded-xl p-5 border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
        >
          <p className="text-[12px] text-slate-500">Attendance</p>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[28px] font-medium font-brand-primary tabular-nums text-[#00274C]">
              {student.attendanceRate}%
            </span>
            <span className="text-[12px] text-slate-500">
              {isAttendanceCompliant ? `+${attDiff} pts vs 80% DGCA` : `-${attDiff} pts vs 80% DGCA`}
            </span>
          </div>

          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden relative">
            {/* 80% marker line */}
            <div className="absolute top-0 bottom-0 left-[80%] w-0.5 bg-slate-400 z-10" title="80% DGCA cutoff" />
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${isAttendanceCompliant ? 'bg-emerald-500' : 'bg-[#DB241E]'}`}
              style={{ width: `${Math.min(100, student.attendanceRate)}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>{student.attendedClasses} / {student.totalClasses} Lectures</span>
            <span className={`font-semibold ${isAttendanceCompliant ? 'text-emerald-600' : 'text-[#DB241E]'}`}>
              {isAttendanceCompliant ? `Buffer: ${safeMarginClasses} sessions` : 'Remediation Required'}
            </span>
          </div>
        </div>

        {/* Syllabus Progress */}
        <div 
          onClick={() => setActiveTab('courses')}
          className="bg-white rounded-xl p-5 border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
        >
          <p className="text-[12px] text-slate-500">DGCA syllabus</p>
          <p className="mt-2 text-[28px] font-medium font-brand-primary tabular-nums text-[#00274C]">{syllabusAvg}%</p>
          <p className="mt-2 text-[12px] text-slate-500">{courses.length} papers</p>
        </div>

        {/* Pending Fee */}
        <div 
          onClick={() => setActiveTab('fees')}
          className="bg-white rounded-xl p-5 border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
        >
          <p className="text-[12px] text-slate-500">Fee due</p>
          <p className="mt-2 text-[28px] font-medium font-brand-primary tabular-nums text-[#00274C]">₹{student.pendingFee.toLocaleString('en-IN')}</p>
          <p className="mt-2 text-[12px] text-slate-500">Paid ₹{student.paidFee.toLocaleString('en-IN')} of ₹{student.totalFee.toLocaleString('en-IN')}</p>
        </div>

        {/* Next Class Briefing */}
        <div 
          onClick={() => setActiveTab('timetable')}
          className="bg-white rounded-xl p-5 border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
        >
          <p className="text-[12px] text-slate-500">Next class</p>
          <p className="mt-2 text-[20px] font-medium text-[#00274C] line-clamp-1">
            {activeSession ? activeSession.subjectName : 'None today'}
          </p>
          <p className="mt-2 text-[12px] font-flight-mono text-slate-500">
            {activeSession ? `${activeSession.startTime}–${activeSession.endTime}` : 'No briefing'}
          </p>
        </div>
      </div>

      {/* METAR Live Airport Weather Bar */}
      <div className="bg-white text-[#00274C] p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="live-dot w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-medium text-[#00274C] font-flight-mono">
                VIDP METAR
              </span>
              <span className="text-[12px] text-slate-500 font-flight-mono">
                VFR
              </span>
            </div>
            <p className="font-flight-mono text-slate-600 text-[12px] mt-1">
              {rawMetarString}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyMetar}
            className="h-8 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors flex items-center gap-2 text-[12px] cursor-pointer"
          >
            {copiedMetar ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedMetar ? 'Copied' : 'Copy METAR'}</span>
          </button>

          <button
            onClick={() => setActiveTab('chatbot')}
            className="px-3 py-1.5 rounded-lg bg-[#DB241E] hover:bg-[#b81d18] text-white font-bold transition-colors text-[11px] cursor-pointer"
          >
            Ask AeroBot to Decode
          </button>
        </div>
      </div>

      {/* Two Column Layout: Today's Timeline & Chief Mentor Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Schedule for Today */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-extrabold text-[#00274C] font-brand-primary">
                  Flight Schedule for Today (Friday)
                </h2>
                <p className="text-xs text-slate-500">
                  Dwarka Centre • Ground School Batch Delta-26
                </p>
              </div>

              <button
                onClick={() => setActiveTab('timetable')}
                className="text-xs font-bold text-[#DB241E] hover:text-[#b81d18] flex items-center gap-1 font-brand-primary transition-colors cursor-pointer"
              >
                View Full Week Schedule
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Timetable Session Cards */}
            <div className="mt-4 space-y-3">
              {todaySessions.map((session) => {
                const isCurrent = session.status === 'in-progress';
                return (
                  <div
                    key={session.id}
                    className={`
                      p-4 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4
                      ${isCurrent 
                        ? 'border-[#00274C] bg-[#00274C]/5 shadow-xs' 
                        : 'border-slate-200 bg-white hover:border-slate-300'}
                    `}
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[12px] font-flight-mono text-slate-500">
                          {session.subjectCode}
                        </span>
                        <h3 className="text-[15px] font-medium text-[#00274C]">
                          {session.subjectName}
                        </h3>
                        {isCurrent && (
                          <span className="text-[12px] text-[#DB241E] font-flight-mono">
                            In progress
                          </span>
                        )}
                        {session.attendanceMarked && (
                          <span className="text-[12px] text-slate-500 font-flight-mono">
                            Checked in
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 font-medium">
                        {session.topic}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-flight-mono pt-0.5">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {session.startTime} – {session.endTime}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {session.location}
                        </span>
                        <span>•</span>
                        <span>{session.instructorName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {session.onlineLink && (
                        <a
                          href={session.onlineLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-[#00274C] hover:bg-[#00172E] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Online</span>
                        </a>
                      )}

                      {isCurrent && !session.attendanceMarked && !todaySessionMarked && (
                        <button
                          onClick={() => onMarkAttendance(session.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#DB241E] hover:bg-[#b81d18] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Check-in Now</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Chief Mentor Desk & Live Sync Log */}
        <div className="space-y-4">
          {/* Chief Mentor Desk */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-3">
            <p className="text-[12px] text-slate-500">Chief mentor</p>
            <h3 className="text-[16px] font-medium text-[#00274C]">{batch.mentorName}</h3>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              80% attendance is the DGCA line. Next mock covers the 1-in-60 rule and altimetry.
            </p>
            <a href={`tel:${batch.mentorPhone}`} className="block text-[13px] font-flight-mono text-[#00274C] hover:underline">
              {batch.mentorPhone}
            </a>
            <button
              onClick={() => setActiveTab('batches')}
              className="h-9 w-full rounded-lg border border-slate-200 hover:bg-slate-50 text-[13px] font-medium text-[#00274C] transition-colors cursor-pointer"
            >
              Batch roadmap
            </button>
          </div>

          {/* Real-time Synced Activity Log against Main Admin Database */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div>
                  <h3 className="text-[13px] font-medium text-[#00274C]">
                    Activity
                  </h3>
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
                  <Activity className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                  <p className="text-xs text-slate-400">Listening for live cadet activity...</p>
                </div>
              ) : (
                liveActivities.map((act) => (
                  <div key={act.id} className="p-2.5 rounded-xl bg-[#F5F6F8] border border-slate-200/80 text-xs">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[11px] font-flight-mono text-slate-500">
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
                      <p className="text-[12px] text-slate-500 mt-1 line-clamp-1">
                        &quot;{act.snapshot.responseSnippet}&quot;
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            <p className="mt-3 pt-3 border-t border-slate-100 text-[12px] font-flight-mono text-slate-500">
              {student.rollNumber}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
