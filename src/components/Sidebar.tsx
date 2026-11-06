import React from 'react';
import { 
  LayoutDashboard, 
  CalendarClock, 
  Users, 
  BookOpen, 
  CreditCard, 
  Compass, 
  CheckSquare, 
  Phone, 
  X,
  Activity,
  Clock,
  LogOut,
  ArrowLeft,
  KeyRound,
  Headset,
  Award
} from 'lucide-react';
import { TabType, StudentProfile, AuthUser } from '../types/dashboard';
import { AirborneLogo } from './AirborneLogo';

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
    { id: 'batches', label: 'My Batch', icon: Users, badge: 'Max 25', badgeColor: 'bg-[#D8A027]' },
    { id: 'courses', label: 'Ground Courses', icon: BookOpen, badge: 'DGCA', badgeColor: 'bg-[#00274C]' },
    { id: 'certificates', label: 'Certificates & Endorsements', icon: Award, badge: 'DGCA', badgeColor: 'bg-[#D8A027]' },
    { id: 'attendance', label: 'Mark Attendance', icon: CheckSquare, badge: `${student.attendanceRate}%`, badgeColor: student.attendanceRate >= 80 ? 'bg-emerald-600' : 'bg-[#DB241E]' },
    { id: 'chatbot', label: 'AeroBot', icon: Headset, badge: 'On', badgeColor: '' },
    { id: 'fees', label: 'Fees & Accounts', icon: CreditCard, badge: student.pendingFee > 0 ? `Due ₹${(student.pendingFee / 1000).toFixed(0)}k` : 'Clear', badgeColor: 'bg-[#D8A027]' },
    { id: 'other-courses', label: 'Explore More Ratings', icon: Compass, badge: 'New', badgeColor: 'bg-[#00274C]' },
  ];

  // Navigation Items for Admin View
  const adminNavItems: { id: TabType; label: string; icon: any; badge?: string; badgeColor?: string }[] = [
    { id: 'admin-overview', label: 'Operations Command', icon: Activity },
    { id: 'admin-cadets', label: 'Cadets Flight Roster', icon: Users, badge: 'Roster', badgeColor: 'bg-[#00274C]' },
    { id: 'admin-bridge', label: 'Admin OS & Provisioning', icon: KeyRound, badge: 'Connected', badgeColor: 'bg-[#D8A027]' },
    { id: 'admin-timetable', label: 'Ground Timetable', icon: CalendarClock, badge: 'Dwarka', badgeColor: 'bg-emerald-600' },
    { id: 'admin-fees', label: 'Fee Collection Ledger', icon: CreditCard, badge: 'Ledger', badgeColor: 'bg-[#D8A027]' },
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
        fixed top-0 bottom-0 left-0 z-50 lg:static
        w-64 xl:w-72 shrink-0 self-stretch bg-white text-[#212121]
        border-r border-slate-200 shadow-xl lg:shadow-none
        flex flex-col min-h-0 lg:h-full lg:overflow-hidden
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
        <div className="py-4 px-3 flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <div className="px-3 pb-2 text-[12px] font-medium text-slate-500 font-brand-primary">
            {isAdmin && !isAdminPreviewingStudent ? 'Operations' : 'Cadet deck'}
          </div>
          <div className="flex flex-col gap-1">

          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`
                  w-full flex items-center justify-between h-9 px-3 rounded-lg
                  text-[13px] font-medium font-brand-primary transition-colors duration-150 cursor-pointer text-left
                  ${isActive 
                    ? 'bg-[#00274C] text-white' 
                    : 'text-slate-700 hover:bg-[#F5F6F8] hover:text-[#00274C]'
                  }
                `}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-4 h-4 flex items-center justify-center shrink-0">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[11px] font-flight-mono shrink-0 ml-2 tabular-nums ${isActive ? 'text-white/70' : 'text-slate-400'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          </div>

          <div className="mt-6 px-3 pt-4 border-t border-slate-200">
            <p className="text-[12px] text-slate-500">Chief mentor</p>
            <p className="mt-1 text-[13px] font-medium text-[#00274C]">Capt. Navrang Singh</p>
            <a
              href="tel:+919953777320"
              className="mt-2 flex items-center gap-2 text-[12px] text-slate-500 hover:text-[#00274C]"
            >
              <Phone className="w-4 h-4" />
              +91 9953-777-320
            </a>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="mt-4 h-9 w-full rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[13px] font-medium font-brand-primary flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
