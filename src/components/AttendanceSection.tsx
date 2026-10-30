import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AttendanceRecord, StudentProfile } from '../types/dashboard';

interface AttendanceSectionProps {
  student: StudentProfile;
  records: AttendanceRecord[];
  onMarkAttendance: () => void;
  todaySessionMarked: boolean;
}

export const AttendanceSection: React.FC<AttendanceSectionProps> = ({
  student,
  records,
  onMarkAttendance,
  todaySessionMarked,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveReason, setLeaveReason] = useState('DGCA Class 1 Medical Renewal (Air Force Central Medical Establishment - AFCME)');
  const [leaveDate, setLeaveDate] = useState('05 Nov 2026');
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);

  const filteredRecords = filterStatus === 'ALL'
    ? records
    : records.filter(r => r.status === filterStatus);

  const handleLiveCheckIn = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#00274C', '#DB241E', '#10b981', '#D8A027']
    });
    onMarkAttendance();
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLeaveSubmitted(true);
  };

  const subjectAttendance = [
    { subject: 'Air Regulations (CARs)', percentage: 92, status: 'Compliant' },
    { subject: 'Aviation Meteorology', percentage: 90, status: 'Compliant' },
    { subject: 'Technical General', percentage: 88, status: 'Compliant' },
    { subject: 'Air Navigation', percentage: 85, status: 'Compliant' },
    { subject: 'Radio Telephony RTR(A)', percentage: 82, status: 'Compliant' },
  ];

  return (
    <div className="space-y-6">
      {/* Live Check-In Card for Today */}
      <div className={`
        rounded-2xl p-6 md:p-8 border shadow-lg transition-all duration-300 relative overflow-hidden
        ${todaySessionMarked 
          ? 'bg-gradient-to-r from-emerald-950 via-[#00274C] to-[#00172E] text-white border-emerald-500/40' 
          : 'bg-gradient-to-r from-[#00274C] via-[#001E3D] to-[#00172E] text-white border-[#00172E]'}
      `}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider font-brand-primary ${todaySessionMarked ? 'bg-emerald-500 text-white' : 'bg-[#DB241E] text-white'}`}>
                {todaySessionMarked ? 'Attendance Confirmed' : 'Live Check-in Open'}
              </span>
              <span className="bg-white/10 text-slate-200 text-[11px] px-2.5 py-0.5 rounded-full font-flight-mono flex items-center gap-1 border border-white/10">
                <MapPin className="w-3 h-3 text-[#DB241E]" />
                Dwarka Campus (Hall 2A) • GPS Geofenced
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-black font-brand-primary text-white">
              {todaySessionMarked 
                ? 'Check-In Recorded for Friday Session' 
                : 'Today\'s Active Briefing: Air Navigation'}
            </h2>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              {todaySessionMarked 
                ? `Logged at 08:26 AM by Cadet ${student.name}. Your physical presence has been validated for DGCA CAR Section 7 training hours.` 
                : 'Class in-progress with Capt. Navrang Singh (08:30 AM - 10:30 AM). Verify your presence to register official DGCA flight hours.'}
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-300 pt-1">
              <span>Instructor: <strong>Capt. Navrang Singh</strong></span>
              <span>•</span>
              <span>Subject: <strong>Air Navigation (VOR / Intercepts)</strong></span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {!todaySessionMarked ? (
              <button
                onClick={handleLiveCheckIn}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#DB241E] hover:bg-[#b81d18] text-white text-sm font-bold font-brand-primary transition-all shadow-xl hover:shadow-red-600/30 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Mark Present (1-Tap Check-In)</span>
              </button>
            ) : (
              <div className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs sm:text-sm font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Present Today (Verified)</span>
              </div>
            )}

            <button
              onClick={() => {
                setLeaveSubmitted(false);
                setLeaveModalOpen(true);
              }}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold font-brand-primary transition-colors border border-white/15 text-center cursor-pointer"
            >
              Request Leave / Duty Absence
            </button>
          </div>
        </div>
      </div>

      {/* DGCA Compliance Stats & Threshold Meter */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Overall Percentage */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-[#8A9BB0] uppercase tracking-wider font-brand-primary">
              Aggregate Attendance
            </span>
            <div className="mt-2 text-3xl font-extrabold text-[#00274C] font-brand-primary">
              {student.attendanceRate}%
            </div>
            <div className="mt-2 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${student.attendanceRate}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Compliant with DGCA 80% Rule
          </p>
        </div>

        {/* Classes Attended */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-[#8A9BB0] uppercase tracking-wider font-brand-primary">
            Attended Lectures
          </span>
          <div className="mt-2 text-3xl font-extrabold text-emerald-600 font-brand-primary font-flight-mono">
            {student.attendedClasses}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Out of {student.totalClasses} total ground school classes conducted
          </p>
        </div>

        {/* Missed Classes */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-[#8A9BB0] uppercase tracking-wider font-brand-primary">
            Missed / Excused
          </span>
          <div className="mt-2 text-3xl font-extrabold text-[#DB241E] font-brand-primary font-flight-mono">
            {student.totalClasses - student.attendedClasses}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            10 Excused (Sim/Medical) • 4 Absent
          </p>
        </div>

        {/* Buffer Safety Margin */}
        <div className="bg-gradient-to-br from-[#00274C] to-[#00172E] text-white rounded-2xl p-5 shadow-sm border border-[#00172E]">
          <span className="text-xs font-bold text-[#D8A027] uppercase tracking-wider font-brand-primary">
            DGCA Safety Cushion
          </span>
          <div className="mt-2 text-3xl font-extrabold text-white font-brand-primary font-flight-mono">
            +11 Sessions
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Max permitted leaves before falling below the 80% minimum
          </p>
        </div>
      </div>

      {/* Subject-Wise Attendance Breakdown Bars */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#00274C] font-brand-primary">
            Subject-Wise Attendance Breakdown
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            DGCA requires individual 80% attendance compliance across every ground subject
          </p>
        </div>

        <div className="space-y-3.5">
          {subjectAttendance.map((sub, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#00274C] font-brand-primary">
                  {sub.subject}
                </span>
                <span className="font-extrabold text-[#00274C] font-flight-mono">
                  {sub.percentage}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${sub.percentage >= 85 ? 'bg-emerald-500' : 'bg-[#D8A027]'}`}
                  style={{ width: `${sub.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance History Log & Filter Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#00274C] font-brand-primary">
              Recent Attendance Log & Audit Trail
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Biometric check-ins and mentor verified class records
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {['ALL', 'Present', 'Absent', 'Excused'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`
                  px-3 py-1.5 rounded-lg font-bold font-brand-primary transition-colors cursor-pointer
                  ${filterStatus === st ? 'bg-[#00274C] text-white shadow-xs' : 'bg-[#F5F6F8] text-slate-600 hover:bg-slate-200'}
                `}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F6F8] text-[#00274C] font-bold uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Date & Day</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Instructor</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredRecords.map((r) => {
                const isPresent = r.status === 'Present';
                const isAbsent = r.status === 'Absent';
                const isExcused = r.status === 'Excused';
                return (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#00274C] block">{r.date}</span>
                      <span className="text-[10px] text-slate-400">{r.dayOfWeek}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {r.subject}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {r.instructor}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-flight-mono text-[11px]">
                      {r.checkInMethod}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-flight-mono">
                      {r.timestamp || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`
                        inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase
                        ${isPresent ? 'bg-emerald-100 text-emerald-800' : ''}
                        ${isAbsent ? 'bg-red-100 text-red-800' : ''}
                        ${isExcused ? 'bg-[#D8A027]/15 text-[#00274C] border border-[#D8A027]/30' : ''}
                      `}>
                        {isPresent && <CheckCircle2 className="w-3 h-3" />}
                        {isAbsent && <XCircle className="w-3 h-3" />}
                        {isExcused && <Clock className="w-3 h-3 text-[#D8A027]" />}
                        {r.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Application Modal */}
      {leaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#00172E]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#00274C] font-brand-primary">
                Duty Leave / Absence Application
              </h3>
              <button
                onClick={() => setLeaveModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close leave modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!leaveSubmitted ? (
              <form onSubmit={handleLeaveSubmit} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cadet Details</label>
                  <input
                    type="text"
                    disabled
                    value={`${student.name} • ${student.rollNumber} (Batch Delta-26)`}
                    className="w-full p-2.5 bg-[#F5F6F8] border border-slate-200 rounded-xl text-slate-600 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date of Requested Absence</label>
                  <input
                    type="text"
                    value={leaveDate}
                    onChange={(e) => setLeaveDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#00274C]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Reason for Absence</label>
                  <select
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#00274C]"
                  >
                    <option>DGCA Class 1 Medical Renewal (AFCME / IAM)</option>
                    <option>WPC RTR(A) External Examination Slot</option>
                    <option>Flight Training Dual Flying Session (Flying Club)</option>
                    <option>Personal Emergency / Health</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-[#00274C]/5 border border-[#00274C]/20 text-[#00274C] text-[11px] leading-relaxed">
                  Duty leaves approved for official DGCA medicals or flying duties will be counted as Excused and will not compromise your 80% attendance certificate.
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setLeaveModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-[#F5F6F8] text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#00274C] hover:bg-[#00172E] text-white font-bold font-brand-primary cursor-pointer shadow-sm"
                  >
                    Submit to Mentor
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-[#00274C] font-brand-primary">
                  Leave Application Filed
                </h4>
                <p className="text-xs text-slate-600">
                  Transmitted to Capt. Navrang Singh for verification. You will receive an SMS confirmation once approved.
                </p>
                <button
                  onClick={() => setLeaveModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#00274C] text-white text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
