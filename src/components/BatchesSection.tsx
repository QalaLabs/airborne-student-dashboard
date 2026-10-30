import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  MessageSquare, 
  Sparkles,
  Search,
  Plane,
  X
} from 'lucide-react';
import { BatchInfo } from '../types/dashboard';

interface BatchesSectionProps {
  batch: BatchInfo;
  onOpenChat: (prompt: string) => void;
}

export const BatchesSection: React.FC<BatchesSectionProps> = ({
  batch,
  onOpenChat,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatchmate, setSelectedBatchmate] = useState<any | null>(null);

  const filteredBatchmates = batch.batchmates.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.callsign.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Batch Overview Header with Small-Batch Cap Highlight */}
      <div className="bg-gradient-to-r from-[#00274C] via-[#001E3D] to-[#00172E] text-white rounded-2xl p-6 md:p-8 shadow-xl border border-[#00172E] relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#DB241E] text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider font-brand-primary">
                Active Enrolled Cohort
              </span>
              <span className="bg-[#D8A027] text-[#00274C] text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Max 25 Students Cap
              </span>
              <span className="bg-white/10 text-slate-300 text-[11px] px-2.5 py-0.5 rounded-full font-flight-mono border border-white/10">
                Dwarka Campus • New Delhi
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black font-brand-primary tracking-tight">
              {batch.name}
            </h1>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              {batch.course} • Targeted for <span className="text-[#D8A027] font-semibold">{batch.targetExamDate}</span>. Intensive theory, daily concept clarity drills, and mock exam simulations under Capt. Navrang Singh.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#D8A027]" />
                Started: {batch.startDate}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#D8A027]" />
                {batch.batchTimings}
              </span>
            </div>
          </div>

          {/* Batch Capacity Gauge */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 text-center min-w-[220px]">
            <span className="text-[11px] uppercase tracking-wider text-slate-300 font-bold font-brand-primary">
              Cohort Strength
            </span>
            <div className="mt-2 text-4xl font-black font-brand-primary text-white">
              {batch.currentStrength} <span className="text-xl text-[#D8A027]">/ {batch.maxStudents}</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              {batch.maxStudents - batch.currentStrength} seats remaining till cohort cap
            </p>

            <div className="mt-3 w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-[#D8A027] h-2 rounded-full transition-all duration-500" 
                style={{ width: `${(batch.currentStrength / batch.maxStudents) * 100}%` }}
              />
            </div>

            <div className="mt-2 text-[10px] text-emerald-300 font-semibold flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              1:1 Mentor Attention Guaranteed
            </div>
          </div>
        </div>
      </div>

      {/* Chief Mentor Spotlight Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00274C] to-[#00172E] text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-[#D8A027]">
              CNS
            </div>
            <span className="absolute -bottom-1 -right-1 bg-[#DB241E] text-white p-1 rounded-full shadow flex items-center justify-center">
              <Plane className="w-3 h-3" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[#00274C] font-brand-primary">
                {batch.mentorName}
              </h3>
              <span className="bg-[#D8A027]/15 text-[#00274C] border border-[#D8A027]/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                Chief Mentor
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-0.5">
              {batch.mentorTitle} • {batch.mentorExperience}
            </p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#DB241E]" />
              Dwarka Campus (Sector-7, Ramphal Chowk)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={`tel:${batch.mentorPhone}`}
            className="px-4 py-2.5 rounded-xl bg-[#00274C] hover:bg-[#00172E] text-white text-xs font-bold font-brand-primary transition-colors flex items-center gap-2 shadow cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-[#D8A027]" />
            <span>Call Mentor ({batch.mentorPhone})</span>
          </a>

          <button
            onClick={() => onOpenChat("Tell me about Capt. Navrang Singh's batch roadmap and advice for DGCA exams")}
            className="px-4 py-2.5 rounded-xl bg-[#F5F6F8] hover:bg-slate-200 text-[#00274C] text-xs font-bold font-brand-primary transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#DB241E]" />
            <span>Consult Flight Advice</span>
          </button>
        </div>
      </div>

      {/* Batch Syllabus Roadmap Phases */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#00274C] font-brand-primary">
              Batch Delta-26 Curriculum Roadmap
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Phased training to cover all 5 DGCA papers + Radio Telephony before exam session
            </p>
          </div>
          <span className="text-xs font-bold text-[#00274C] font-flight-mono">
            Overall Progress: 74%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batch.roadmapPhases.map((phase, idx) => (
            <div 
              key={idx}
              className={`
                p-4 rounded-xl border transition-all
                ${phase.status === 'completed' ? 'border-emerald-200 bg-emerald-50/30' : ''}
                ${phase.status === 'in-progress' ? 'border-[#00274C]/30 bg-[#00274C]/5 shadow-sm' : ''}
                ${phase.status === 'upcoming' ? 'border-slate-200 bg-slate-50/50 opacity-80' : ''}
              `}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className={`
                  font-bold text-[10px] uppercase px-2 py-0.5 rounded
                  ${phase.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : ''}
                  ${phase.status === 'in-progress' ? 'bg-[#00274C] text-white' : ''}
                  ${phase.status === 'upcoming' ? 'bg-slate-200 text-slate-700' : ''}
                `}>
                  {phase.status === 'completed' ? 'Cleared' : phase.status === 'in-progress' ? 'Active' : 'Upcoming'}
                </span>
                <span className="font-black text-[#00274C]">{phase.progress}%</span>
              </div>

              <h4 className="text-xs font-bold text-[#00274C] font-brand-primary">
                {phase.title}
              </h4>

              <div className="mt-2.5 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-1.5 rounded-full ${phase.status === 'completed' ? 'bg-emerald-500' : 'bg-[#DB241E]'}`}
                  style={{ width: `${phase.progress}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>{phase.classesDone} / {phase.totalClasses} Lectures</span>
                <span>{phase.subject}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Batchmates Roster & Study Groups */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#00274C] font-brand-primary flex items-center gap-2">
              <Users className="w-4 h-4 text-[#DB241E]" />
              Batchmates Directory ({batch.currentStrength} Cadets)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Connect with fellow cadets for cross-country flight planning and DGCA mock test reviews
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search cadet or callsign..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00274C]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {filteredBatchmates.map((bm) => (
            <div 
              key={bm.id}
              onClick={() => setSelectedBatchmate(bm)}
              className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-[#00274C]/40 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <img 
                  src={bm.avatar} 
                  alt={bm.name} 
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-[#00274C]/20 group-hover:ring-[#DB241E] transition-all"
                />
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-[#00274C] font-brand-primary truncate">
                    {bm.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {bm.callsign}
                  </p>
                  {bm.role && (
                    <span className="inline-block mt-0.5 text-[9px] font-bold text-[#D8A027] bg-[#D8A027]/10 px-1.5 py-0.2 rounded">
                      {bm.role}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Attn:</span>
                <span className="font-bold text-emerald-700">{bm.attendance}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Batchmate Modal */}
      {selectedBatchmate && (
        <div className="fixed inset-0 z-50 bg-[#00172E]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-[#00274C] font-brand-primary">
                Cadet Profile & Study Connect
              </h4>
              <button 
                onClick={() => setSelectedBatchmate(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close cadet profile modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <img 
                src={selectedBatchmate.avatar} 
                alt={selectedBatchmate.name} 
                className="w-16 h-16 rounded-full object-cover ring-4 ring-[#00274C]/10"
              />
              <div>
                <h3 className="text-base font-bold text-[#00274C] font-brand-primary">
                  {selectedBatchmate.name}
                </h3>
                <p className="text-xs text-slate-500 font-flight-mono">{selectedBatchmate.callsign}</p>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {selectedBatchmate.dgcaStatus}
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-2 text-xs bg-[#F5F6F8] p-3.5 rounded-xl border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Batch:</span>
                <span className="font-bold text-[#00274C]">Delta-26 (Dwarka)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Attendance:</span>
                <span className="font-bold text-emerald-600">{selectedBatchmate.attendance}%</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Study Group:</span>
                <span className="font-bold text-[#00274C]">Flight Plan & Navigation Pod #2</span>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button 
                onClick={() => {
                  alert(`Message sent to ${selectedBatchmate.name} on Airborne Cadet Portal`);
                  setSelectedBatchmate(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#00274C] hover:bg-[#00172E] text-white text-xs font-bold font-brand-primary transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Send Direct Message</span>
              </button>
              <button 
                onClick={() => setSelectedBatchmate(null)}
                className="px-4 py-2.5 rounded-xl bg-[#F5F6F8] text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
