import React, { useState } from 'react';
import { 
  Plane, 
  Clock, 
  CheckCircle2, 
  Award, 
  ArrowRight, 
  Phone, 
  ShieldCheck, 
  Filter,
  X
} from 'lucide-react';
import { OtherCourse, StudentProfile } from '../types/dashboard';

interface OtherCoursesSectionProps {
  courses: OtherCourse[];
  student: StudentProfile;
  onOpenChat: (prompt: string) => void;
}

export const OtherCoursesSection: React.FC<OtherCoursesSectionProps> = ({
  courses,
  student,
  onOpenChat: _onOpenChat,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [inquiryCourse, setInquiryCourse] = useState<OtherCourse | null>(null);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [phoneInput, setPhoneInput] = useState('+91 9953-777-320');
  const [notesInput, setNotesInput] = useState('Interested in upcoming batch enrollment details and simulator slots.');

  const categories = ['ALL', 'Airline Prep', 'Type Rating', 'Advanced Rating', 'Specialized'];

  const filteredCourses = selectedCategory === 'ALL' 
    ? courses 
    : courses.filter(c => c.category === selectedCategory);

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySubmitted(true);
  };

  return (
    <div className="space-y-6">
      {/* Academy Catalog Banner */}
      <div className="bg-gradient-to-r from-[#00274C] via-[#001E3D] to-[#00172E] text-white rounded-2xl p-6 md:p-8 shadow-xl border border-[#00172E] relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#DB241E] text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider font-brand-primary">
              Airborne Aviation Academy
            </span>
            <span className="bg-[#D8A027] text-[#00274C] text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              100% Exam Success Rate
            </span>
            <span className="bg-white/10 text-slate-300 text-[11px] px-2.5 py-0.5 rounded-full font-flight-mono border border-white/10">
              "From Dream to Cockpit"
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black font-brand-primary tracking-tight text-white">
            Advance Your Pilot Career & Certifications
          </h1>

          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Expand your aviation credentials. From **A320 Type Rating Prep** and **ATPL Fast-Track** to **Multi-Engine Endorsements** and **DGCA Drone Pilot Licenses**, all taught by senior airline captains.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              DGCA Certified Syllabus
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#D8A027]" />
              Airline Cadet Priority Endorsement
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#DB241E]" />
              Counseling Hotline: +91 9953-777-320
            </span>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[#8A9BB0] font-bold text-xs uppercase mr-2 flex items-center gap-1 shrink-0 font-brand-primary">
          <Filter className="w-3.5 h-3.5" />
          Filter Programs:
        </span>

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`
              px-4 py-2 rounded-xl text-xs font-bold font-brand-primary whitespace-nowrap transition-all cursor-pointer
              ${selectedCategory === cat 
                ? 'bg-[#00274C] text-white shadow-md' 
                : 'bg-[#F5F6F8] text-slate-700 hover:bg-slate-200'}
            `}
          >
            {cat === 'ALL' ? 'All Pilot Ratings' : cat}
          </button>
        ))}
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCourses.map((c) => (
          <div 
            key={c.id}
            className="bg-white rounded-2xl border border-slate-200 hover:border-[#00274C]/30 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden group"
          >
            <div className="p-5 md:p-6 space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider font-flight-mono px-2 py-0.5 rounded bg-[#F5F6F8] text-[#00274C] border border-slate-200">
                  {c.code}
                </span>

                {c.badge && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase bg-[#D8A027]/15 text-[#00274C] border border-[#D8A027]/30">
                    {c.badge}
                  </span>
                )}
              </div>

              <h3 className="text-base font-extrabold text-[#00274C] font-brand-primary group-hover:text-[#DB241E] transition-colors leading-snug">
                {c.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                {c.description}
              </p>

              {/* Course Highlights */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-[#8A9BB0] uppercase tracking-wider font-brand-primary block">
                  Key Training Modules:
                </span>
                <ul className="space-y-1 text-xs text-slate-700">
                  {c.keyHighlights.slice(0, 3).map((hl, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-tight">{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Duration & Flight Hours Info */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {c.duration}
                </span>

                {c.flightSimHours && (
                  <span className="flex items-center gap-1 text-[#DB241E] font-bold font-flight-mono">
                    <Plane className="w-3.5 h-3.5" />
                    {c.flightSimHours}
                  </span>
                )}
              </div>

              <div className="text-[11px] text-slate-500 bg-[#F5F6F8] p-2 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-700">Prerequisite:</span> {c.prerequisite}
              </div>
            </div>

            {/* Bottom Strip: Fee & Enroll Action */}
            <div className="p-4 bg-[#F5F6F8] border-t border-slate-100 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                  Course Fee
                </span>
                <span className="text-lg font-black text-[#00274C] font-flight-mono">
                  ₹{c.fee.toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => {
                  setInquiryCourse(c);
                  setInquirySubmitted(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#00274C] hover:bg-[#DB241E] text-white text-xs font-bold font-brand-primary transition-all shadow-sm flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <span>Request Info</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Counseling / Enrollment Modal */}
      {inquiryCourse && (
        <div className="fixed inset-0 z-50 bg-[#00172E]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-[#DB241E] uppercase font-flight-mono">
                  {inquiryCourse.code} • {inquiryCourse.category}
                </span>
                <h3 className="text-lg font-black text-[#00274C] font-brand-primary mt-0.5">
                  {inquiryCourse.title}
                </h3>
              </div>
              <button
                onClick={() => setInquiryCourse(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close inquiry modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!inquirySubmitted ? (
              <form onSubmit={handleSubmitInquiry} className="mt-4 space-y-4">
                <div className="p-3 bg-[#F5F6F8] rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 block font-brand-primary">Tuition & Sim Fee:</span>
                    <strong className="text-base text-[#00274C] font-flight-mono">₹{inquiryCourse.fee.toLocaleString()}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block font-brand-primary">Batch Starts:</span>
                    <strong className="text-slate-800 font-semibold">{inquiryCourse.intakeMonth}</strong>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 font-brand-primary">Cadet Name</label>
                    <input
                      type="text"
                      disabled
                      value={student.name}
                      className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1 font-brand-primary">Contact Phone</label>
                    <input
                      type="text"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#00274C]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1 font-brand-primary">Questions / Target Timeline</label>
                    <textarea
                      rows={2}
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#00274C]"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#00274C]/5 border border-[#00274C]/20 text-xs text-[#00274C] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#D8A027] shrink-0" />
                  <span>Enrolled Airborne cadets receive priority batch placement and 10% fee adjustment.</span>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setInquiryCourse(null)}
                    className="flex-1 py-2.5 rounded-xl bg-[#F5F6F8] text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#DB241E] hover:bg-[#b81d18] text-white text-xs font-bold font-brand-primary transition-all shadow-md cursor-pointer"
                  >
                    Submit Enrollment Request
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-[#00274C] font-brand-primary">
                  Enrollment Inquiry Transmitted!
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Capt. Navrang Singh and the Dwarka admissions desk have received your request for <strong>{inquiryCourse.title}</strong>. An advisor will contact you at {phoneInput} with syllabus modules and simulator slots.
                </p>
                <div className="pt-3">
                  <button
                    onClick={() => setInquiryCourse(null)}
                    className="px-5 py-2.5 rounded-xl bg-[#00274C] text-white text-xs font-bold font-brand-primary hover:bg-[#00172E] cursor-pointer"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
