import React from 'react';
import { 
  LayoutDashboard, 
  CalendarClock, 
  Users, 
  BookOpen, 
  CreditCard, 
  Compass, 
  CheckSquare, 
  Award, 
  Phone, 
  ShieldCheck, 
  Plane, 
  X,
  Activity,
  Clock,
  LogOut,
  ArrowLeft
} from 'lucide-react';
import { TabType, StudentProfile, AuthUser } from '../types/dashboard';
import { AirborneLogo } from './AirborneLogo';
import { AeroBotIcon } from './AeroBotIcon';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  student: StudentProfile;
  currentUser?: AuthUser | null;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  onLogout?: () => void;
  isAdminPreviewingStudent?: boolean;
  onReturnToAdminDeck?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  student,
  currentUser,
  mobileMenuOpen,
  setMobileMenuOpen,
  onLogout,
  isAdminPreviewingStudent,
  onReturnToAdminDeck,
}) => {
  const isAdmin = currentUser?.role === 'admin';

  // Navigation Items for Student View
  const studentNavItems: { id: TabType; label: string; icon: any; badge?: string; badgeColor?: string }[] = [
    { id: 'overview', label: 'Cockpit HUD', icon: LayoutDashboard },
    { id: 'timetable', label: 'Flight Timetable', icon: CalendarClock, badge: 'Live Today', badgeColor: 'bg-emerald-600' },
    { id: 'batches', label: 'My Batch (Delta-26)', icon: Users, badge: 'Max 25', badgeColor: 'bg-[#D8A027]' },
    { id: 'courses', label: 'Ground Courses', icon: BookOpen, badge: '5 DGCA', badgeColor: 'bg-[#00274C]' },
    { id: 'attendance', label: 'Mark Attendance', icon: CheckSquare, badge: `${student.attendanceRate}%`, badgeColor: student.attendanceRate >= 80 ? 'bg-emerald-600' : 'bg-[#DB241E]' },
    { id: 'chatbot', label: 'AeroBot AI Copilot', icon: AeroBotIcon, badge: 'Active', badgeColor: 'bg-[#DB241E]' },
    { id: 'fees', label: 'Fees & Accounts', icon: CreditCard, badge: 'Due Nov 15', badgeColor: 'bg-[#D8A027]' },
    { id: 'other-courses', label: 'Explore More Ratings', icon: Compass, badge: 'New', badgeColor: 'bg-[#00274C]' },
  ];

  // Navigation Items for Admin View
  const adminNavItems: { id: TabType; label: string; icon: any; badge?: string; badgeColor?: string }[] = [
    { id: 'admin-overview', label: 'Operations Command', icon: Activity },
    { id: 'admin-cadets', label: 'Cadets Flight Roster', icon: Users, badge: '8 Cadets', badgeColor: 'bg-[#00274C]' },
    { id: 'admin-timetable', label: 'Ground Timetable', icon: CalendarClock, badge: 'Dwarka', badgeColor: 'bg-emerald-600' },
    { id: 'admin-fees', label: 'Fee Collection Ledger', icon: CreditCard, badge: '87.8%', badgeColor: 'bg-[#D8A027]' },
    { id: 'admin-activity', label: 'Biometric & Audit Logs', icon: Clock, badge: 'Live', badgeColor: 'bg-[#DB241E]' },
  ];

  const currentNavItems = (isAdmin && !isAdminPreviewingStudent) ? adminNavItems : studentNavItems;

  const handleSelectTab = (tab: TabType) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-[#00172E]/70 backdrop-blur-xs z-40 lg:hidden cursor-pointer"
          aria-hidden="true"
        />
      )}

      {/* Main Aside Navigation */}
      <aside className={`
        fixed lg:static top-0 bottom-0 left-0 z-50
        w-64 xl:w-72 bg-white text-[#212121]
        border-r border-slate-200 shadow-xl lg:shadow-none
        flex flex-col justify-between
        transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Top Header inside mobile sidebar */}
        <div className="lg:hidden p-4 bg-[#00274C] text-white flex items-center justify-between border-b border-[#00172E]">
          <AirborneLogo variant="full" theme="light" size="sm" showSubtitle={false} />
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 rounded-md text-slate-300 hover:text-white cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Admin is previewing cadet, show return button inside sidebar */}
        {isAdminPreviewingStudent && onReturnToAdminDeck && (
          <div className="p-3 bg-amber-50 border-b border-amber-200">
            <button
              onClick={onReturnToAdminDeck}
              className="w-full py-2 px-3 rounded-lg bg-[#00274C] hover:bg-[#00172E] text-white text-xs font-bold font-brand-primary flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Admin Console</span>
            </button>
          </div>
        )}

        {/* Navigation Items List */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold tracking-wider uppercase text-slate-400 font-brand-primary flex items-center justify-between">
            <span>{isAdmin && !isAdminPreviewingStudent ? 'Operations Navigation' : 'Cadet Flight Deck'}</span>
            <span className="text-[10px] font-flight-mono text-emerald-600 font-normal">
              {isAdmin && !isAdminPreviewingStudent ? 'Admin Cleared' : 'Active Batch'}
            </span>
          </div>

          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`
                  w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl
                  text-xs font-bold font-brand-primary transition-all duration-150 cursor-pointer text-left
                  ${isActive 
                    ? 'bg-[#00274C] text-white shadow-md' 
                    : 'text-slate-700 hover:bg-[#F5F6F8] hover:text-[#00274C]'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#D8A027]' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`
                    text-[10px] font-flight-mono font-bold px-2 py-0.5 rounded-full text-white shrink-0 ml-1
                    ${item.badgeColor || 'bg-[#00274C]'}
                  `}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Section: Chief Mentor Info & Logout */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/70 space-y-2.5">
          {/* Chief Mentor Card */}
          <div className="bg-gradient-to-br from-[#00274C] to-[#00172E] text-white rounded-xl p-3.5 shadow-md relative overflow-hidden border border-[#00172E]">
            <Plane className="absolute -right-3 -bottom-3 w-16 h-16 text-white/5 rotate-[-25deg] pointer-events-none" />

            <div className="flex items-start justify-between gap-2 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#D8A027] text-[#00274C] font-black flex items-center justify-center text-xs shadow-inner">
                  CNS
                </div>
                <div>
                  <h4 className="text-xs font-bold font-brand-primary text-white leading-tight">
                    Capt. Navrang Singh
                  </h4>
                  <p className="text-[10px] text-[#D8A027] font-semibold">Chief Mentor & Pilot</p>
                </div>
              </div>

              <span className="text-[9px] bg-white/10 text-slate-200 px-1.5 py-0.5 rounded font-flight-mono border border-white/10">
                15+ Yrs
              </span>
            </div>

            <p className="text-[11px] text-slate-300 mt-2 leading-relaxed italic">
              "Clarity and discipline build great airline pilots."
            </p>

            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px]">
              <a 
                href="tel:+919953777320" 
                className="flex items-center gap-1.5 text-white hover:text-[#D8A027] transition-colors font-semibold"
              >
                <Phone className="w-3 h-3 text-[#DB241E]" />
                <span>+91 9953-777-320</span>
              </a>

              <span className="text-[10px] text-slate-300 font-flight-mono">Dwarka, Delhi</span>
            </div>
          </div>

          {/* Academy Brand Trust Badges */}
          <div className="px-2 flex items-center justify-between text-[10px] text-[#8A9BB0] font-brand-primary">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              DGCA Compliant
            </span>
            <span className="flex items-center gap-1">
              <Award className="w-3 h-3 text-[#D8A027]" />
              100% Pass Rate
            </span>
          </div>

          {/* Sign Out CTA button in Sidebar */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-red-50 text-slate-600 hover:text-[#DB241E] text-xs font-bold font-brand-primary flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out of Terminal</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
