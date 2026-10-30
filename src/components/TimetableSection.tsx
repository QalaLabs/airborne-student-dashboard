import React, { useState } from 'react';
import { 
  MapPin, 
  User, 
  CheckCircle2, 
  Download, 
  Video, 
  Filter, 
  AlertCircle, 
  Printer 
} from 'lucide-react';
import { TimetableSession } from '../types/dashboard';

interface TimetableSectionProps {
  sessions: TimetableSession[];
  onMarkAttendance: (sessionId: string) => void;
  todaySessionMarked: boolean;
}

export const TimetableSection: React.FC<TimetableSectionProps> = ({
  sessions,
  onMarkAttendance,
  todaySessionMarked,
}) => {
  const [selectedDay, setSelectedDay] = useState<string>('Friday'); // Default Friday (Today)
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');

  const days = ['All Days', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const filteredSessions = sessions.filter(session => {
    const dayMatch = selectedDay === 'All Days' || session.day === selectedDay;
    const subjectMatch = selectedSubject === 'ALL' || session.subjectCode === selectedSubject;
    return dayMatch && subjectMatch;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Timetable Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#00274C] text-[#D8A027] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-flight-mono">
              Batch Delta-26
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Dwarka Campus Ground Schedule
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-[#00274C] font-brand-primary mt-1">
            Flight Cadet Timetable & Briefings
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Theory classes run Mon–Fri 08:30 AM to 01:30 PM. Simulator briefings and practicals on Saturdays.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-[#F5F6F8] hover:bg-slate-200 text-[#00274C] text-xs font-bold font-brand-primary transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Timetable</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs by Day & Subject */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        {/* Day Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {days.map((day) => {
            const isSelected = selectedDay === day;
            const isTodayDay = day === 'Friday';
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`
                  px-4 py-2 rounded-xl text-xs font-bold font-brand-primary whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer
                  ${isSelected 
                    ? 'bg-[#00274C] text-white shadow-md' 
                    : 'bg-[#F5F6F8] text-slate-700 hover:bg-slate-200 hover:text-[#00274C]'}
                `}
              >
                <span>{day}</span>
                {isTodayDay && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${isSelected ? 'bg-[#DB241E] text-white' : 'bg-[#DB241E]/10 text-[#DB241E]'}`}>
                    TODAY
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 text-xs">
          <span className="text-[#8A9BB0] font-bold text-[11px] uppercase mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Filter:
          </span>
          {[
            { code: 'ALL', label: 'All Subjects' },
            { code: 'NAV', label: 'Air Navigation' },
            { code: 'MET', label: 'Meteorology' },
            { code: 'REG', label: 'Air Regulations' },
            { code: 'TECH', label: 'Technical General' },
            { code: 'RTR', label: 'Radio Telephony' },
            { code: 'SIM', label: 'Simulator' },
          ].map((sub) => (
            <button
              key={sub.code}
              onClick={() => setSelectedSubject(sub.code)}
              className={`
                px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer
                ${selectedSubject === sub.code 
                  ? 'bg-[#DB241E] text-white font-bold' 
                  : 'bg-[#F5F6F8] text-slate-600 hover:bg-slate-200'}
              `}
            >
              {sub.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h4 className="text-base font-bold text-[#00274C] font-brand-primary">
              No sessions scheduled for this filter
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Select another day or reset the subject filter to view scheduled lectures.
            </p>
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isMarked = session.attendanceMarked || (session.isToday && todaySessionMarked);
            return (
              <div 
                key={session.id}
                className={`
                  bg-white rounded-2xl p-5 md:p-6 border transition-all duration-200 shadow-sm hover:shadow-md
                  ${session.status === 'in-progress' 
                    ? 'border-[#00274C] ring-2 ring-[#00274C]/10' 
                    : 'border-slate-200'}
                `}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Time & Subject Badge */}
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-[#00274C] text-white shrink-0 shadow-inner">
                      <span className="text-[11px] font-black text-[#D8A027] font-flight-mono uppercase tracking-wider">
                        {session.subjectCode}
                      </span>
                      <span className="text-xs font-extrabold font-brand-primary mt-0.5">
                        {session.startTime.split(' ')[0]}
                      </span>
                      <span className="text-[9px] text-slate-300 uppercase">
                        {session.startTime.split(' ')[1]}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-[#DB241E] uppercase tracking-wider font-flight-mono">
                          {session.day} • {session.startTime} - {session.endTime}
                        </span>

                        {session.status === 'in-progress' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#DB241E] text-white uppercase tracking-wider animate-pulse">
                            Live In-Progress
                          </span>
                        )}
                        {session.status === 'completed' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Completed
                          </span>
                        )}
                        {session.status === 'upcoming' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F5F6F8] text-slate-700 border border-slate-200">
                            Upcoming
                          </span>
                        )}
                      </div>

                      <h3 className="text-base md:text-lg font-bold text-[#00274C] font-brand-primary">
                        {session.subjectName}
                      </h3>

                      <p className="text-xs md:text-sm font-medium text-slate-700 leading-relaxed">
                        <span className="font-bold text-slate-900">Topic:</span> {session.topic}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-semibold text-[#00274C]">
                          <User className="w-3.5 h-3.5 text-[#DB241E]" />
                          {session.instructorName} ({session.instructorRank})
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-[#00274C]" />
                          {session.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Attendance Status & Handout Action */}
                  <div className="flex flex-wrap lg:flex-col items-start lg:items-end justify-between lg:justify-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    {/* Attendance Pill or Mark Action */}
                    {isMarked ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <div>
                          <span>Attendance Marked</span>
                          {session.attendanceTime && (
                            <span className="block text-[10px] text-emerald-600 font-flight-mono">
                              Logged at {session.attendanceTime}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : session.isToday ? (
                      <button
                        onClick={() => onMarkAttendance(session.id)}
                        className="px-4 py-2 rounded-xl bg-[#DB241E] hover:bg-[#b81d18] text-white text-xs font-bold font-brand-primary transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark Present Now</span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        Attendance opens on class day
                      </span>
                    )}

                    {/* Resources */}
                    <div className="flex items-center gap-2">
                      {session.handoutAvailable && (
                        <button 
                          onClick={() => alert(`Downloading study notes & question bank for ${session.subjectName}`)}
                          className="px-3 py-1.5 rounded-lg bg-[#F5F6F8] hover:bg-slate-200 text-[#00274C] text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3 text-[#DB241E]" />
                          <span>Handout PDF</span>
                        </button>
                      )}

                      {session.onlineLink && (
                        <a
                          href={session.onlineLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-[#00274C]/10 hover:bg-[#00274C]/20 text-[#00274C] text-[11px] font-bold transition-colors flex items-center gap-1"
                        >
                          <Video className="w-3 h-3" />
                          <span>Virtual Briefing</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DGCA Attendance Policy Alert Card */}
      <div className="p-4 rounded-xl bg-white border border-[#D8A027]/40 text-[#212121] text-xs flex items-start gap-3 shadow-xs">
        <AlertCircle className="w-5 h-5 text-[#D8A027] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-[#00274C] font-brand-primary">
            DGCA Civil Aviation Requirements (CAR) Compliance Note
          </h4>
          <p className="leading-relaxed text-slate-700">
            A minimum of 80% physical classroom attendance is mandatory to validate ground school hours for your DGCA Commercial Pilot License (CPL) application. Failure to maintain 80% will delay flight academy batch clearance and requires mandatory makeup classes.
          </p>
        </div>
      </div>
    </div>
  );
};
