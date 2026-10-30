import React, { useState } from 'react';
import { 
  Plane, 
  ShieldCheck, 
  Lock, 
  User, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  CloudSun,
  Award
} from 'lucide-react';
import { AuthUser, UserRole } from '../types/dashboard';
import { AirborneLogo } from './AirborneLogo';

interface LoginScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [identifier, setIdentifier] = useState('AA-CPL-2026-084');
  const [password, setPassword] = useState('cadet2026');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Switch tabs
  const handleSwitchRole = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg(null);
    if (role === 'student') {
      setIdentifier('AA-CPL-2026-084');
      setPassword('cadet2026');
    } else {
      setIdentifier('admin@airborneaviation.in');
      setPassword('admin2026');
    }
  };

  // Quick autofill buttons
  const autofillCadet = () => {
    setSelectedRole('student');
    setIdentifier('AA-CPL-2026-084');
    setPassword('cadet2026');
    setErrorMsg(null);
  };

  const autofillAdmin = () => {
    setSelectedRole('admin');
    setIdentifier('admin@airborneaviation.in');
    setPassword('admin2026');
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedRole,
          identifier: identifier.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.detail || data.error || 'Authentication failed. Please verify credentials.');
      }

      const authUser: AuthUser = {
        ...data.user,
        token: data.token,
        role: data.role,
      };

      if (rememberMe) {
        localStorage.setItem('airborne_auth_user', JSON.stringify(authUser));
      } else {
        sessionStorage.setItem('airborne_auth_user', JSON.stringify(authUser));
      }

      onLoginSuccess(authUser);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to connect to Airborne Admin Server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#00172E] text-white flex flex-col justify-between font-brand-body relative overflow-hidden">
      {/* Background Aeronautical Horizon & Radial Glow */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 20%, #DB241E 0%, transparent 45%),
            radial-gradient(circle at 80% 80%, #00274C 0%, transparent 60%),
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 100% 100%, 48px 48px, 48px 48px'
        }}
      />

      {/* Top METAR Status Ticker */}
      <div className="relative z-10 bg-[#001224] border-b border-white/10 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-300">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex items-center gap-1.5 text-[#D8A027] font-semibold tracking-wider font-flight-mono uppercase">
            <CloudSun className="w-3.5 h-3.5 text-[#38bdf8] animate-pulse" />
            <span>VIDP AIRPORT (DELHI):</span>
          </div>
          <span className="font-flight-mono text-slate-200">
            300600Z 28010KT 5000 HZ NSC 28/14 Q1012 NOSIG • <strong className="text-emerald-400">VFR NORMAL</strong>
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-flight-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-emerald-400 font-semibold">DGCA Live DB Synced</span>
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Dwarka Campus (Sector-7)</span>
        </div>
      </div>

      {/* Main Authentication Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-xl">
          {/* Header Brand Lockup */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center p-3 sm:p-4 rounded-2xl bg-[#00274C]/80 border border-white/15 shadow-2xl backdrop-blur-md mb-3">
              <AirborneLogo 
                variant="full" 
                theme="light" 
                size="lg" 
                showSubtitle={false} 
              />
            </div>

            <p className="text-xs sm:text-sm text-slate-300 italic font-brand-body">
              "From Dream to Cockpit" • DGCA Ground Training Flight Deck Portal
            </p>
          </div>

          {/* Authentication Card */}
          <div className="bg-white text-[#212121] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Dual Login Type Selector Tabs */}
            <div className="grid grid-cols-2 bg-[#F5F6F8] p-1.5 border-b border-slate-200 gap-1.5">
              <button
                type="button"
                onClick={() => handleSwitchRole('student')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-brand-primary font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  selectedRole === 'student'
                    ? 'bg-[#00274C] text-white shadow-md'
                    : 'text-slate-600 hover:text-[#00274C] hover:bg-slate-200/60'
                }`}
              >
                <Plane className={`w-4 h-4 ${selectedRole === 'student' ? 'text-[#DB241E]' : 'text-slate-500'}`} />
                <span>Cadet Pilot Login</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchRole('admin')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-brand-primary font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'bg-[#00274C] text-white shadow-md'
                    : 'text-slate-600 hover:text-[#00274C] hover:bg-slate-200/60'
                }`}
              >
                <ShieldCheck className={`w-4 h-4 ${selectedRole === 'admin' ? 'text-[#D8A027]' : 'text-slate-500'}`} />
                <span>Academy Admin Login</span>
              </button>
            </div>

            {/* Role Header Banner */}
            <div className={`px-6 py-3 border-b text-xs flex items-center justify-between ${
              selectedRole === 'student' 
                ? 'bg-[#00274C]/5 border-slate-200 text-[#00274C]' 
                : 'bg-[#D8A027]/10 border-slate-200 text-[#00274C]'
            }`}>
              <div className="flex items-center gap-2">
                {selectedRole === 'student' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[#00274C]" />
                    <span className="font-semibold">Cadet Pilot Terminal:</span>
                    <span className="text-slate-600">Flight timetable, DGCA progress & accounts</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[#D8A027]" />
                    <span className="font-semibold">Operations Command:</span>
                    <span className="text-slate-600">Batch schedules, cadet roster & fee ledgers</span>
                  </>
                )}
              </div>
              <span className="text-[10px] font-flight-mono uppercase px-2 py-0.5 rounded bg-white font-bold border border-slate-200 shadow-2xs">
                {selectedRole === 'student' ? 'Cadet Access' : 'Staff Clearance'}
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
              {/* Error Message Alert */}
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-[#DB241E] p-3.5 rounded-xl text-xs flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold">Authentication Refused</p>
                    <p className="mt-0.5 text-slate-700">{errorMsg}</p>
                  </div>
                </div>
              )}

              {/* Identifier Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-brand-primary">
                  {selectedRole === 'student' ? 'Cadet Roll No / DGCA Computer No / Email' : 'Academy Administrator Email'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    {selectedRole === 'student' ? <User className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  </div>
                  <input
                    type={selectedRole === 'student' ? 'text' : 'email'}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    placeholder={selectedRole === 'student' ? 'e.g. AA-CPL-2026-084 or ruzal.dhral@airborneacademy.in' : 'e.g. admin@airborneaviation.in'}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-[#212121] font-flight-mono focus:bg-white focus:outline-hidden focus:border-[#00274C] focus:ring-2 focus:ring-[#00274C]/20 transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {selectedRole === 'student' 
                    ? 'Use your DGCA Computer Number, Academy Roll Number, or registered email.'
                    : 'Authorized Airborne Aviation Academy staff and flight operations credentials only.'}
                </p>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-brand-primary">
                    {selectedRole === 'student' ? 'Flight PIN / Password' : 'Admin Security Passphrase'}
                  </label>
                  <span className="text-[11px] text-[#00274C] hover:underline cursor-pointer">
                    Forgot Key?
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-flight-mono focus:bg-white focus:outline-hidden focus:border-[#00274C] focus:ring-2 focus:ring-[#00274C]/20 transition-all"
                  />
                </div>
              </div>

              {/* Remember Me & Trust */}
              <div className="flex items-center justify-between text-xs text-slate-600">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-[#00274C] focus:ring-[#00274C]"
                  />
                  <span>Keep me logged into this terminal</span>
                </label>
                <span className="text-slate-400 font-flight-mono">256-bit Encrypted</span>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 px-6 rounded-xl text-white font-brand-primary font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  selectedRole === 'student'
                    ? 'bg-[#00274C] hover:bg-[#00172E] active:scale-[0.99]'
                    : 'bg-[#DB241E] hover:bg-[#b51d18] active:scale-[0.99]'
                } ${loading ? 'opacity-80 cursor-wait' : ''}`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Flight Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>{selectedRole === 'student' ? 'Access Cadet Flight Deck' : 'Enter Academy Admin Console'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* 1-Click Demo Fill Badges */}
              <div className="pt-3 border-t border-slate-200">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 text-center font-brand-primary">
                  Fast Verification Credentials (1-Click Access)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={autofillCadet}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      selectedRole === 'student'
                        ? 'border-[#00274C] bg-blue-50/80 text-[#00274C]'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#00274C] text-white flex items-center justify-center shrink-0">
                      <Plane className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <p className="font-bold font-brand-primary truncate">Cadet Ruzal Dhral</p>
                      <p className="text-[10px] text-slate-500 font-flight-mono">AA-CPL-2026-084</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={autofillAdmin}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      selectedRole === 'admin'
                        ? 'border-[#DB241E] bg-red-50/80 text-[#DB241E]'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#DB241E] text-white flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <p className="font-bold font-brand-primary truncate">Capt. Navrang Singh</p>
                      <p className="text-[10px] text-slate-500 font-flight-mono">admin@airborneaviation.in</p>
                    </div>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Bottom Trust & Helpstrip */}
          <div className="mt-6 text-center space-y-2">
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                DGCA CAR Section 7 Compliant
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#D8A027]" />
                100% CPL Exam Success Record
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-300" />
                Role-Based Access Control
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Need assistance logging in? Contact Academy Operations:{' '}
              <a href="tel:+919953777320" className="text-[#D8A027] font-semibold hover:underline">
                +91 9953-777-320
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-[#001224] text-slate-400 border-t border-white/10 py-3 px-4 text-center text-xs">
        <p>© 2026 Airborne Aviation Private Limited (CIN: U85306DL2026PTC465670) • Dwarka Campus, Sector-7, New Delhi</p>
      </footer>
    </div>
  );
};
