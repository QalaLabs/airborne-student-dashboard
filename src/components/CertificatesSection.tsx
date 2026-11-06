import React, { useState } from 'react';
import { 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  Sparkles, 
  Eye, 
  Printer,
  X
} from 'lucide-react';
import { StudentProfile } from '../types/dashboard';
import { AirborneLogo } from './AirborneLogo';

interface CertificateItem {
  id: string;
  code: string;
  title: string;
  category: 'DGCA Theory Endorsement' | 'Flight Operations Clearance' | 'Medical Assessment' | 'Simulator Rating';
  instructor: string;
  instructorRole: string;
  dateIssued: string;
  validTill: string;
  status: 'ISSUED' | 'IN_PROGRESS' | 'EXPIRING_SOON';
  credentialNo: string;
  hoursOrLectures: string;
  gradeScore?: string;
  description: string;
}

interface CertificatesSectionProps {
  student: StudentProfile;
  certificates?: CertificateItem[];
  onOpenChat?: (prompt: string) => void;
}

export const CertificatesSection: React.FC<CertificatesSectionProps> = ({
  student,
  certificates: propCertificates,
  onOpenChat,
}) => {
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);

  const defaultCertificates: CertificateItem[] = [
    {
      id: 'CERT-01',
      code: 'REG-CPL-END',
      title: 'DGCA Air Regulations Ground School Completion',
      category: 'DGCA Theory Endorsement',
      instructor: 'Capt. S. K. Mehra',
      instructorRole: 'Senior DGCA Ground Instructor',
      dateIssued: '24 Oct 2026',
      validTill: 'Permanent (DGCA Session 3/2026)',
      status: 'ISSUED',
      credentialNo: `AAA-CPL-REG-2026-${student.rollNumber?.slice(-3) || '084'}`,
      hoursOrLectures: '30 / 30 Lectures (100% Attendance)',
      gradeScore: '92% (Mock Cleared)',
      description: 'Official endorsement certifying full ground course completion in ICAO Annexes, Aircraft Act 1934, Indian Aircraft Rules 1937, and Flight Time Duty Limitations per DGCA CAR Section 7.'
    },
    {
      id: 'CERT-02',
      code: 'MET-CPL-END',
      title: 'Aviation Meteorology Advanced Ground Endorsement',
      category: 'DGCA Theory Endorsement',
      instructor: 'Capt. Alok Sharma',
      instructorRole: 'Chief Meteorology Mentor',
      dateIssued: '30 Oct 2026',
      validTill: 'Permanent (DGCA Session 3/2026)',
      status: 'ISSUED',
      credentialNo: `AAA-CPL-MET-2026-${student.rollNumber?.slice(-3) || '084'}`,
      hoursOrLectures: '27 / 30 Lectures (90% Attendance)',
      gradeScore: '89% (Mock Cleared)',
      description: 'Endorsement covering Altimetry, Pressure Systems, Monsoon Dynamics, Jet Streams, CAT (Clear Air Turbulence), and METAR/TAF aeronautical weather decoding.'
    },
    {
      id: 'CERT-03',
      code: 'NAV-CPL-TRK',
      title: 'Air Navigation & Flight Planning Proficiency',
      category: 'DGCA Theory Endorsement',
      instructor: 'Capt. Navrang Singh',
      instructorRole: 'Chief Flight Instructor & Ground School Head',
      dateIssued: 'Pending Final Mock',
      validTill: 'Target Nov 2026',
      status: 'IN_PROGRESS',
      credentialNo: `AAA-CPL-NAV-2026-${student.rollNumber?.slice(-3) || '084'}`,
      hoursOrLectures: '32 / 40 Lectures (80% Progress)',
      gradeScore: '84% (Avg Practice Score)',
      description: 'Practical navigation plotting, 1:1,000,000 WAC aeronautical chart navigation, VOR/DME radial intercepts, and 1-in-60 flight calculations.'
    },
    {
      id: 'CERT-04',
      code: 'RTR-WPC-END',
      title: 'Radio Telephony Restricted (Aeronautical) Clearance',
      category: 'Flight Operations Clearance',
      instructor: 'Capt. Navrang Singh',
      instructorRole: 'Radio Telephony Simulation Director',
      dateIssued: '15 Oct 2026 (Part 1 Cleared)',
      validTill: 'Valid for WPC Exam Dec 2026',
      status: 'IN_PROGRESS',
      credentialNo: `AAA-RTR-WPC-2026-${student.rollNumber?.slice(-3) || '084'}`,
      hoursOrLectures: '11 / 20 Simulation Labs',
      gradeScore: '86% Simulation Score',
      description: 'Proficiency certificate in standard ICAO radiotelephony phraseology, distress Mayday/Pan-Pan procedures, and WPC Part 1 transmission drills.'
    },
    {
      id: 'CERT-05',
      code: 'DGCA-MED-01',
      title: 'DGCA Class 1 Initial / Renewal Medical Assessment',
      category: 'Medical Assessment',
      instructor: 'Dr. (Air Commodore) V. K. Taneja',
      instructorRole: 'DGCA Empaneled Class 1 Medical Examiner',
      dateIssued: '12 Jan 2026',
      validTill: '11 Jan 2027 (Active)',
      status: 'ISSUED',
      credentialNo: `DGCA-MED-CA35-${student.computerNumber || 'C09827341'}`,
      hoursOrLectures: 'Full Class 1 Aeromedical Cleared',
      description: 'Official DGCA Form CA-35 medical fitness clearance certifying fit for commercial pilot license privileges without aeronautical restrictions.'
    },
    {
      id: 'CERT-06',
      code: 'SIM-PFD-A320',
      title: 'A320 Cockpit Orientation & PFD Scan Certification',
      category: 'Simulator Rating',
      instructor: 'Capt. Navrang Singh',
      instructorRole: 'Simulator Training Evaluator',
      dateIssued: '18 Sep 2026',
      validTill: 'Permanent',
      status: 'ISSUED',
      credentialNo: `AAA-SIM-A320-2026-${student.rollNumber?.slice(-3) || '084'}`,
      hoursOrLectures: '12 Hours Synthetic Flight Training (Dwarka Sim Bay)',
      gradeScore: 'Certified Flight Ready',
      description: 'Glass cockpit instrument scan, primary flight display interpretation, flight director tracking, and autopilot cross-cockpit coordination.'
    }
  ];

  const certificates = (propCertificates && propCertificates.length > 0) ? propCertificates : defaultCertificates;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#00274C] to-[#00172E] text-white p-6 sm:p-8 rounded-2xl shadow-md border border-[#00274C] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle aeronautical coordinate grid background */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D8A027] text-[#00274C] uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3 h-3" />
              Verified Credentials
            </span>
            <span className="text-xs text-white/70 font-flight-mono">
              DGCA Compliance • Brand Book 2026
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-brand-primary text-white">
            Certificates & Endorsements
          </h2>
          <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
            Official Airborne Aviation Academy academic records, DGCA ground school endorsements, radiotelephony clearances, and aeromedical certifications for Cadet <strong className="text-white font-semibold">{student.name}</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-1 text-xs font-flight-mono text-white/80">
            <span>Roll No: <strong className="text-white">{student.rollNumber}</strong></span>
            <span>•</span>
            <span>DGCA Computer No: <strong className="text-white">{student.computerNumber}</strong></span>
            {student.applicationNo && (
              <>
                <span>•</span>
                <span>App No: <strong className="text-[#D8A027]">{student.applicationNo}</strong></span>
              </>
            )}
          </div>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
          <button
            onClick={() => onOpenChat && onOpenChat('How do I request my DGCA course completion certificate and exam endorsement?')}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold font-brand-primary border border-white/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D8A027]" />
            <span>Consult AeroBot on Endorsements</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 font-brand-primary uppercase">Total Credentials</span>
          <p className="text-xl font-bold font-flight-mono text-[#00274C] mt-1">{certificates.length}</p>
          <span className="text-[10px] text-slate-500">Documented & Archived</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 font-brand-primary uppercase">DGCA Endorsed</span>
          <p className="text-xl font-bold font-flight-mono text-emerald-700 mt-1">
            {certificates.filter(c => c.status === 'ISSUED').length}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">Fully Validated</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 font-brand-primary uppercase">In Syllabus Progress</span>
          <p className="text-xl font-bold font-flight-mono text-[#D8A027] mt-1">
            {certificates.filter(c => c.status === 'IN_PROGRESS').length}
          </p>
          <span className="text-[10px] text-slate-500">Upcoming Exam Clearance</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 font-brand-primary uppercase">Attendance Eligibility</span>
          <p className="text-xl font-bold font-flight-mono text-emerald-700 mt-1">{student.attendanceRate}%</p>
          <span className="text-[10px] text-emerald-600 font-semibold">&ge; 80% Rule Cleared</span>
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {certificates.map((cert) => {
          const isIssued = cert.status === 'ISSUED';

          return (
            <div 
              key={cert.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-[#00274C]/30 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5 sm:p-6 space-y-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-brand-primary">
                      {cert.category}
                    </span>
                    <h3 className="text-base font-bold font-brand-primary text-[#00274C]">
                      {cert.title}
                    </h3>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-flight-mono shrink-0 flex items-center gap-1 ${
                    isIssued
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-900 border border-amber-200'
                  }`}>
                    {isIssued ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                    <span>{isIssued ? 'ISSUED' : 'IN TRAINING'}</span>
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {cert.description}
                </p>

                {/* Details Meta Grid */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-flight-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-brand-primary">Credential ID</span>
                    <span className="font-bold text-slate-800">{cert.credentialNo}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-brand-primary">Class Progress</span>
                    <span className="font-semibold text-slate-700">{cert.hoursOrLectures}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-brand-primary">Lead Instructor</span>
                    <span className="font-semibold text-slate-700">{cert.instructor}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-brand-primary">Validity / Status</span>
                    <span className={`font-semibold ${isIssued ? 'text-emerald-700' : 'text-amber-800'}`}>
                      {cert.validTill}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="px-5 py-3.5 bg-[#F5F6F8] border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-brand-primary">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>DGCA Verification Key Ready</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCert(cert)}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-[#00274C] border border-slate-200 text-xs font-bold font-brand-primary flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View Certificate</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Certificate Preview Modal */}
      {selectedCert && (
        <div 
          className="fixed inset-0 bg-[#00172E]/70 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCert(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#00274C] text-white px-6 py-4 flex items-center justify-between border-b border-[#00172E]">
              <div className="flex items-center gap-3">
                <AirborneLogo variant="mark-only" theme="light" size="sm" />
                <div>
                  <h3 className="font-bold font-brand-primary text-sm">Official Credential Verification</h3>
                  <p className="text-[11px] text-white/70 font-flight-mono">{selectedCert.credentialNo}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCert(null)}
                className="p-1 rounded-lg text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Certificate Canvas / Card View */}
            <div className="p-6 sm:p-8 space-y-6 bg-radial from-white via-slate-50/50 to-slate-100/30">
              <div className="text-center space-y-2 border-b border-slate-200 pb-5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 font-brand-primary">
                  Airborne Aviation Academy & Flight Deck Operations
                </p>
                <h2 className="text-xl sm:text-2xl font-bold font-brand-primary text-[#00274C]">
                  {selectedCert.title}
                </h2>
                <p className="text-xs text-slate-500 font-flight-mono">
                  Certificate ID: <strong className="text-slate-800">{selectedCert.credentialNo}</strong>
                </p>
              </div>

              <div className="text-center space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed max-w-lg mx-auto">
                <p>This certifies that Cadet Pilot</p>
                <p className="text-lg sm:text-xl font-bold font-brand-primary text-[#00274C]">
                  {student.name}
                </p>
                <p className="text-xs text-slate-500 font-flight-mono">
                  Roll No: {student.rollNumber} • DGCA Computer No: {student.computerNumber} {student.applicationNo ? `• App No: ${student.applicationNo}` : ''}
                </p>
                <p className="pt-2 text-xs text-slate-600">
                  has successfully satisfied all DGCA prescribed curriculum requirements, syllabus attendance mandates, and ground examination competencies.
                </p>
              </div>

              {/* Signatures & Verification Seal */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-brand-primary">Chief Instructor</span>
                  <span className="font-bold text-slate-800 font-brand-primary">{selectedCert.instructor}</span>
                  <span className="text-[10px] text-slate-500 block">{selectedCert.instructorRole}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-brand-primary">Date Issued</span>
                  <span className="font-bold text-slate-800 font-flight-mono">{selectedCert.dateIssued}</span>
                  <span className="text-[10px] text-emerald-700 font-semibold block">{selectedCert.validTill}</span>
                </div>

                <div className="col-span-2 sm:col-span-1 flex items-center sm:justify-end">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-emerald-600" />
                    <div className="text-[10px] leading-tight">
                      <span className="font-bold text-slate-800 block">Verified Digital</span>
                      <span className="text-slate-500 font-flight-mono">SHA-256 Valid</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#F5F6F8] border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-[#00274C] hover:bg-[#00172E] text-white text-xs font-bold font-brand-primary flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
