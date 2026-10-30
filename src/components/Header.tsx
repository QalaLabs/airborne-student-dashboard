import React, { useState } from 'react';
import { 
  Bell, 
  MapPin, 
  CheckCircle2, 
  Menu, 
  X, 
  PhoneCall, 
  CloudSun,
  LogOut,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { StudentProfile, AuthUser } from '../types/dashboard';
import { AirborneLogo } from './AirborneLogo';

interface HeaderProps {
  student: StudentProfile;
  currentUser?: AuthUser | null;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  onQuickAttendance: () => void;
  todaySessionMarked: boolean;
  isAdminPreviewingStudent?: boolean;
  onReturnToAdminDeck?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  student,
  currentUser,
  activeTab: _activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  onQuickAttendance,
  todaySessionMarked,
  isAdminPreviewingStudent,
  onReturnToAdminDeck,
  onLogout,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'DGCA Session 3/2026 Portal',
      desc: 'Pariksha portal opens 5th Nov. Submit your medical clearance certificate.',
      time: '15m ago',
      unread: true,
    },
    {
      id: 2,
      title: 'Meteorology Mock Exam #4',
      desc: 'Scheduled for Sunday at 10:00 AM (Dwarka Main Hall).',
      time: '2h ago',
      unread: true,
    },
    {
      id: 3,
      title: 'Fee Installment Reminder',
      desc: 'Final installment of ₹35,000 due by 15th Nov 2026.',
      time: '1d ago',
      unread: false,
    }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-[#00274C] text-white border-b border-[#00172E] shadow-lg">
      {/* Admin Preview Warning Banner */}
      {isAdminPreviewingStudent && (
        <div className="bg-[#D8A027] text-[#00274C] px-4 py-2 text-xs font-bold font-brand-primary flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#00274C] animate-bounce" />
            <span>ADMIN PREVIEW: Viewing live Cadet Dashboard for {student.name} ({student.rollNumber})</span>
          </div>
          {onReturnToAdminDeck && (
            <button
              onClick={onReturnToAdminDeck}
              className="bg-[#00274C] hover:bg-[#00172E] text-white text-[11px] font-bold px-3 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Admin Deck</span>
            </button>
          )}
        </div>
      )}

      {/* Top Micro-Bar: METAR & Campus Ticker */}
      <div className="bg-[#00172E] px-4 py-1.5 text-xs border-b border-white/5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 overflow-hidden text-slate-300">
          <div className="flex items-center gap-1.5 text-[#D8A027] font-semibold tracking-wider font-flight-mono uppercase">
            <CloudSun className="w-3.5 h-3.5 animate-pulse text-[#38bdf8]" />
            <span>METAR VIDP (DELHI):</span>
          </div>
          <div className="font-flight-mono text-slate-200 truncate">
            300600Z 28010KT 5000 HZ NSC 28/14 Q1012 NOSIG • <span className="text-emerald-400 font-semibold">VFR NORMAL</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 text-slate-300 text-[11px]">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#DB241E]" />
            Dwarka Sector-7, New Delhi
          </span>
          <a 
            href="tel:+919953777320" 
            className="flex items-center gap-1 text-[#D8A027] hover:underline font-semibold cursor-pointer"
          >
            <PhoneCall className="w-3 h-3" />
            +91 9953-777-320
          </a>
          <span className="bg-[#DB241E]/20 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] border border-[#DB241E]/40 font-brand-primary">
            Batch Cap: Max 25
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="px-4 lg:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand & Academy Title */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/15 text-white cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div 
            onClick={() => {
              if (isAdmin && !isAdminPreviewingStudent) {
                setActiveTab('admin-overview');
              } else {
                setActiveTab('overview');
              }
            }}
            className="cursor-pointer group flex items-center"
          >
            <AirborneLogo 
              variant="full" 
              theme="light" 
              size="md" 
              showSubtitle={true}
            />
          </div>
        </div>

        {/* Right Action Icons & User Strip */}
        <div className="flex items-center gap-3">
          {/* Main GCR Admin DB Live Sync Indicator */}
          <div 
            title="Connected to Cloud SQL PostgreSQL (airbornedb) on GCR airborne-admin"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono cursor-default shadow-inner"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">Main Admin DB Live</span>
          </div>

          {/* Quick Attendance Check-in for cadets */}
          {!isAdmin && (
            <button
              onClick={onQuickAttendance}
              disabled={todaySessionMarked}
              className={`hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold font-brand-primary transition-all shadow-md cursor-pointer ${
                todaySessionMarked
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                  : 'bg-[#DB241E] hover:bg-[#b51d18] text-white active:scale-95'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{todaySessionMarked ? 'Session Marked Present' : 'Quick Check-in (Nav)'}</span>
            </button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/15 text-white transition-colors relative cursor-pointer"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#DB241E] text-white rounded-full text-[10px] font-bold flex items-center justify-center font-flight-mono animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-[#212121] rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="bg-[#00274C] px-4 py-3 text-white flex items-center justify-between border-b border-[#00172E]">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#D8A027]" />
                    <span className="font-bold font-brand-primary text-sm">Briefings & Operations Notices</span>
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllRead} 
                      className="text-[11px] text-slate-300 hover:text-white underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-3.5 hover:bg-[#F5F6F8] transition-colors ${n.unread ? 'bg-slate-50' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-[#00274C] font-brand-primary flex items-center gap-1.5">
                          {n.unread && <span className="w-2 h-2 rounded-full bg-[#DB241E]"></span>}
                          {n.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap font-flight-mono">{n.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="p-2 bg-[#F5F6F8] text-center border-t border-slate-200">
                  <button 
                    onClick={() => {
                      setShowNotifications(false);
                      if (isAdmin && !isAdminPreviewingStudent) {
                        setActiveTab('admin-cadets');
                      } else {
                        setActiveTab('batches');
                      }
                    }}
                    className="text-xs font-bold text-[#00274C] hover:text-[#DB241E] transition-colors cursor-pointer"
                  >
                    View All Notices →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div 
            onClick={() => {
              if (isAdmin && !isAdminPreviewingStudent) {
                setActiveTab('admin-overview');
              } else {
                setActiveTab('overview');
              }
            }}
            className="flex items-center gap-2.5 pl-2 py-1 pr-3 rounded-full bg-white/10 hover:bg-white/15 cursor-pointer border border-white/10 transition-colors"
          >
            <img 
              src={isAdmin && !isAdminPreviewingStudent ? (currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=250&q=80') : student.avatarUrl} 
              alt={currentUser?.name || student.name} 
              className="w-8 h-8 rounded-full object-cover border-2 border-[#D8A027]" 
            />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-white font-brand-primary leading-tight">
                {isAdmin && !isAdminPreviewingStudent ? currentUser?.name : student.name}
              </span>
              <span className="text-[10px] text-[#D8A027] font-semibold font-flight-mono">
                {isAdmin && !isAdminPreviewingStudent ? 'Chief Instructor & Admin' : `${student.rollNumber} • ${student.attendanceRate}% Attn`}
              </span>
            </div>
          </div>

          {/* Sign Out Button */}
          {onLogout && (
            <button
              onClick={() => onLogout()}
              title="Sign out of flight terminal"
              aria-label="Sign out of flight terminal"
              className="p-2 rounded-full bg-white/10 hover:bg-red-500/20 text-slate-300 hover:text-[#DB241E] border border-white/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
