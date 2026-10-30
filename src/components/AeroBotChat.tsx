import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Trash2, 
  Copy, 
  Check, 
  Clock, 
  ChevronRight,
  Sparkles,
  Radio
} from 'lucide-react';
import { ChatMessage, StudentProfile } from '../types/dashboard';
import { AeroBotIcon } from './AeroBotIcon';

interface AeroBotChatProps {
  student: StudentProfile;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
  onMarkAttendance: () => void;
  todaySessionMarked: boolean;
}

export const AeroBotChat: React.FC<AeroBotChatProps> = ({
  student,
  initialPrompt,
  onClearInitialPrompt,
  onMarkAttendance: _onMarkAttendance,
  todaySessionMarked,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'MSG-01',
      sender: 'assistant',
      text: `Good day Cadet ${student.name.split(' ')[1] || 'Pilot'}. This is **AeroBot**, your official Airborne Aviation AI Flight Deck Copilot & DGCA Ground Training Mentor.\n\nI have direct access to your verified student ledger, class timetable, and DGCA syllabus progress. Ask AeroBot about **Air Navigation formulas**, **METAR weather decoding**, your **attendance compliance**, **pending course fees**, or **today's lecture schedule**.\n\nHow can AeroBot assist your flight preparations today?`,
      timestamp: '08:15 AM',
      suggestions: [
        'Decode METAR VIDP 300600Z',
        'Explain 1 in 60 rule formula',
        'Difference between QNH, QFE & QNE',
        'What are my fee dues?',
        'When is my next class?',
        'Check my DGCA attendance compliance'
      ]
    }
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [backendSource, setBackendSource] = useState<string>('AeroBot Online • Dwarka Flight Ops');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (student?.rollNumber || student?.id) {
      localStorage.setItem('airborne_student_id', student.rollNumber || student.id);
    }
  }, [student?.rollNumber, student?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateLocalFallback = (userQuery: string): { text: string; suggestions?: string[] } => {
    const q = userQuery.toLowerCase();
    const cadetLast = student.name.split(' ')[1] || 'Pilot';

    // Attendance query
    if (q.includes('attendance') || q.includes('absent') || q.includes('present')) {
      const statusText = student.attendanceRate >= 80 
        ? `[STATUS: COMPLIANT] **Safe & DGCA Compliant**: You are at **${student.attendanceRate}%**, which is **+8.5%** above the DGCA mandatory 80% threshold.`
        : `[STATUS: ATTENTION REQUIRED] **Warning**: You are below the 80% DGCA requirement.`;
      
      const markedText = todaySessionMarked 
        ? 'Your attendance for today’s lecture has been **successfully logged**.' 
        : 'You have **not yet checked in** for today’s Air Navigation lecture (08:30 AM).';

      return {
        text: `Good day Cadet ${cadetLast}, this is **AeroBot** reporting your verified DGCA attendance records:\n\n### Attendance Status Report — Cadet ${student.name}\n\n${statusText}\n\n- **Total Classes Held:** ${student.totalClasses}\n- **Classes Attended:** ${student.attendedClasses}\n- **Attendance Rate:** ${student.attendanceRate}%\n- **Buffer Margin:** You can miss up to 11 more sessions before dropping below the 80% cutoff.\n\n**Today's Status:** ${markedText}\n\n*Rule Reference: DGCA Civil Aviation Requirements (CAR) Section 7 mandates a minimum of 80% attendance for CPL exam endorsement.*\n\n---\n**AeroBot** • Flight Deck Copilot & DGCA Ground Mentor  \n*Airborne Aviation Academy — "From Dream to Cockpit"*  \n*Chief Mentor: Capt. Navrang Singh | Dwarka Campus, New Delhi*`,
        suggestions: ['Mark today’s attendance', 'View attendance calendar', 'When is my next class?']
      };
    }

    // Fee query
    if (q.includes('fee') || q.includes('due') || q.includes('pay') || q.includes('pending') || q.includes('balance')) {
      return {
        text: `Cadet ${cadetLast}, **AeroBot** here with your verified account ledger from Airborne Aviation Accounts:\n\n### Fee & Accounts Summary\n\n- **Total Course Fee:** ₹${student.totalFee.toLocaleString()}\n- **Paid to Date:** ₹${student.paidFee.toLocaleString()}\n- **Pending Balance:** **₹${student.pendingFee.toLocaleString()}**\n\n**Next Due Date:** 15th November 2026 (3rd Installment for DGCA Pre-Board and WPC RTR Lab).\n\nYou can pay online securely in the **Fees & Accounts** tab via UPI, NetBanking, or Debit/Credit Card. Instant GST invoice and receipt are generated upon payment.\n\n---\n**AeroBot** • Flight Deck Copilot & DGCA Ground Mentor  \n*Airborne Aviation Academy — "From Dream to Cockpit"*  \n*Chief Mentor: Capt. Navrang Singh | Dwarka Campus, New Delhi*`,
        suggestions: ['Pay ₹35,000 online now', 'Show fee breakdown', 'Download past receipt']
      };
    }

    // Timetable / Next class
    if (q.includes('timetable') || q.includes('class') || q.includes('schedule') || q.includes('next lecture') || q.includes('when')) {
      return {
        text: `Cadet ${cadetLast}, **AeroBot** has pulled today's flight schedule for **${student.batchName}**:\n\n### Today's Schedule (Friday — Dwarka Centre)\n\n1. **08:30 AM – 10:30 AM** • **Air Navigation**\n   - *Topic:* Radio Navigation: VOR Radial Tracking & Intercepts\n   - *Instructor:* Capt. Navrang Singh (Chief Mentor)\n   - *Location:* Dwarka Centre, Hall 2A\n   - *Status:* **In Progress (Live Now)**\n\n2. **10:45 AM – 12:30 PM** • **Aviation Meteorology**\n   - *Topic:* Altimetry & Pressure Systems: QNH vs QFE Corrections\n   - *Instructor:* Capt. Alok Sharma\n   - *Location:* Hall 2A\n\n3. **01:30 PM – 03:00 PM** • **Radio Telephony RTR(A)**\n   - *Topic:* Part 1 Flight Plan Transmission & Pan-Pan Urgency calls\n   - *Instructor:* Capt. Navrang Singh\n   - *Location:* Radio Simulation Lab\n\n---\n**AeroBot** • Flight Deck Copilot & DGCA Ground Mentor  \n*Airborne Aviation Academy — "From Dream to Cockpit"*  \n*Chief Mentor: Capt. Navrang Singh | Dwarka Campus, New Delhi*`,
        suggestions: ['Mark attendance for Air Navigation', 'Download navigation handout', 'Show Saturday simulator slots']
      };
    }

    // METAR Decode
    if (q.includes('metar') || q.includes('vidp') || q.includes('weather') || q.includes('taf')) {
      return {
        text: `Cadet ${cadetLast}, this is **AeroBot** with your meteorological briefing for Indira Gandhi International Airport (VIDP):\n\n### METAR Decoding Analysis: VIDP (Indira Gandhi Int'l, Delhi)\n\n**Raw Cable:** \`VIDP 300600Z 28010KT 5000 HZ NSC 28/14 Q1012 NOSIG\`\n\n| Token | Decoded Meaning | Operational Assessment |\n| :--- | :--- | :--- |\n| **VIDP** | ICAO station identifier | Delhi Airport |\n| **300600Z** | 30th of the month at 06:00 UTC | Observation time |\n| **28010KT** | Wind 280° at 10 Knots | Gentle westerly breeze, runway 28/29 favored |\n| **5000** | Visibility 5,000 meters (5 km) | Standard VFR minimums satisfied (min 5 km) |\n| **HZ** | Haze present | Typical Northern Plains atmospheric condition |\n| **NSC** | Nil Significant Cloud | No clouds below 5,000 ft, no CB clouds |\n| **28/14** | Air Temp: 28°C / Dewpoint: 14°C | Spread 14°C — low risk of immediate fog formation |\n| **Q1012** | QNH 1012 hPa | Regional sea-level altimeter setting |\n| **NOSIG** | No Significant Change | Stable weather expected for next 2 hours |\n\n**Flight Dispatch Verdict:** Visual Flight Rules (VFR) flight operations are fully **NORMAL**.\n\n---\n**AeroBot** • Flight Deck Copilot & DGCA Ground Mentor  \n*Airborne Aviation Academy — "From Dream to Cockpit"*  \n*Chief Mentor: Capt. Navrang Singh | Dwarka Campus, New Delhi*`,
        suggestions: ['Explain QNH vs QFE', 'What is VFR weather minima?', 'Calculate density altitude']
      };
    }

    // 1-in-60 rule
    if (q.includes('1 in 60') || q.includes('drift') || q.includes('navigation formula') || q.includes('track error')) {
      return {
        text: `Cadet ${cadetLast}, this is **AeroBot** with your DGCA Air Navigation formula breakdown:\n\n### The 1 in 60 Rule — Conceptual Clarity (Capt. Navrang's Guide)\n\nThe **1 in 60 rule** is an essential mental air navigation rule: *An arc of 1 Nautical Mile at a distance of 60 Nautical Miles subtends an angle of approximately 1 degree (60 arcminutes).*\n\n#### The Two Core Formulas:\n\n1. **Track Error Angle (TE):**\n   $$\\text{Track Error (degrees)} = \\frac{\\text{Distance Off Track (NM)} \\times 60}{\\text{Distance Flown (NM)}}$$\n\n2. **Closing Angle (CA):**\n   $$\\text{Closing Angle (degrees)} = \\frac{\\text{Distance Off Track (NM)} \\times 60}{\\text{Distance to Go (NM)}}$$\n\n3. **Total Correction to Steer to Destination:**\n   $$\\text{Heading Alteration} = \\text{Track Error} + \\text{Closing Angle}$$\n\n**Example from DGCA CPL Exam:**\n- You fly 40 NM and are 4 NM right of track.\n- Distance to destination is 80 NM.\n- $TE = \\frac{4 \\times 60}{40} = 6^\\circ \\text{ Left}$\n- $CA = \\frac{4 \\times 60}{80} = 3^\\circ \\text{ Left}$\n- **Total alteration:** Steer $6^\\circ + 3^\\circ = 9^\\circ$ to the Left!\n\n---\n**AeroBot** • Flight Deck Copilot & DGCA Ground Mentor  \n*Airborne Aviation Academy — "From Dream to Cockpit"*  \n*Chief Mentor: Capt. Navrang Singh | Dwarka Campus, New Delhi*`,
        suggestions: ['Solve another 1 in 60 problem', 'What is Relative Bearing in ADF?', 'Explain VOR radial intercept']
      };
    }

    // Default Fallback
    return {
      text: `Understood Cadet ${cadetLast}. **AeroBot** is standing by on your flight deck frequency.\n\nRegarding **"${userQuery}"**:\n\n1. **DGCA Precision:** In aviation theory, precision is non-negotiable. Verify all procedures against CARs and aircraft operating limitations.\n2. **Course Materials:** Question banks and lecture slides for Air Navigation, Meteorology, Regulations, and RTR(A) are available in the **Courses** tab.\n3. **Flight Ops Consultation:** Capt. Navrang Singh conducts personal doubt clearance sessions daily at the Dwarka Campus ground briefing hall between 01:30 PM and 03:00 PM.\n\nHow can AeroBot assist your flight preparations next?\n\n---\n**AeroBot** • Flight Deck Copilot & DGCA Ground Mentor  \n*Airborne Aviation Academy — "From Dream to Cockpit"*  \n*Chief Mentor: Capt. Navrang Singh | Dwarka Campus, New Delhi*`,
      suggestions: [
        'Decode METAR VIDP 300600Z',
        'Explain 1 in 60 rule formula',
        'Check my DGCA attendance compliance',
        'What are my fee dues?'
      ]
    };
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMessage: ChatMessage = {
      id: `USER-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    let replyText = '';
    let suggestions: string[] | undefined = undefined;

    try {
      // 1. Call AeroBot directly on the local backend
      const response = await fetch('/api/v1/bot/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: student.rollNumber || student.id || 'AA-CPL-2026-084',
          message: query,
          history: messages.slice(-4).map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        replyText = data.reply;
        setBackendSource('AeroBot Copilot • Main Admin DB Synced');
        suggestions = (data.chips && Array.isArray(data.chips) && data.chips.length > 0) 
          ? data.chips 
          : ['Explain QNH vs QFE', 'Check my fees', 'When is my next class?'];
      } else {
        throw new Error('Backend HTTP error');
      }
    } catch {
      // 2. Fallback to client AeroBot logic
      const fallback = generateLocalFallback(query);
      replyText = fallback.text;
      suggestions = fallback.suggestions;
      setBackendSource('AeroBot Copilot • Standalone Mode');
    }

    const botMessage: ChatMessage = {
      id: `BOT-${Date.now()}`,
      sender: 'assistant',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: suggestions,
    };

    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'MSG-01',
        sender: 'assistant',
        text: `Cockpit frequency reset. **AeroBot** standing by for your flight dispatch and DGCA ground school instructions.\n\n---\n**AeroBot** • Flight Deck Copilot & DGCA Ground Mentor  \n*Airborne Aviation Academy — "From Dream to Cockpit"*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: ['Decode METAR VIDP', 'Explain 1 in 60 rule', 'Show fee status', 'When is my next class?']
      }
    ]);
  };

  useEffect(() => {
    if (initialPrompt) {
      handleSend(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md flex flex-col h-[calc(100vh-170px)] min-h-[580px] overflow-hidden">
      {/* AeroBot Flight Deck Header */}
      <div className="bg-[#00274C] px-4 py-3.5 text-white flex items-center justify-between border-b border-[#00172E]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00172E] to-[#00274C] flex items-center justify-center border border-white/20 shadow-inner">
            <AeroBotIcon size="md" active={true} theme="gold" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold font-brand-primary tracking-wide text-white">
                AeroBot 24/7 AI Copilot
              </h3>
              <span className="bg-[#DB241E] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                DGCA Ground Engine
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-300">
              <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-300">
                <Radio className="w-3 h-3" />
                {backendSource}
              </span>
              <span>•</span>
              <span className="text-slate-300">Cadet: {student.name} ({student.rollNumber})</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearChat}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors cursor-pointer"
            title="Reset Frequency"
            aria-label="Reset Frequency"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50 bg-radar-grid">
        {messages.map((msg) => {
          const isBot = msg.sender === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
            >
              {isBot && (
                <div className="w-8 h-8 rounded-lg bg-[#00274C] flex items-center justify-center shrink-0 mt-1 shadow-sm border border-white/10">
                  <AeroBotIcon size="xs" active={false} theme="gold" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-2xl space-y-2 ${isBot ? 'items-start' : 'items-end'}`}>
                <div
                  className={`
                    p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm
                    ${isBot
                      ? 'bg-white text-[#212121] border border-slate-200 rounded-tl-none'
                      : 'bg-[#00274C] text-white rounded-tr-none shadow-md shadow-[#00274C]/20'}
                  `}
                >
                  <div className="space-y-2 prose-sm">
                    {msg.text.split('\n\n').map((paragraph, pIdx) => {
                      if (paragraph.startsWith('### ')) {
                        return (
                          <h4 key={pIdx} className={`font-brand-primary font-bold text-sm sm:text-base border-b pb-1 mb-2 ${isBot ? 'text-[#00274C] border-slate-200' : 'text-[#D8A027] border-white/20'}`}>
                            {paragraph.replace('### ', '')}
                          </h4>
                        );
                      }
                      if (paragraph.startsWith('|')) {
                        const rows = paragraph.split('\n').filter(r => r.trim());
                        return (
                          <div key={pIdx} className="overflow-x-auto my-2 border border-slate-200 rounded-lg bg-white">
                            <table className="w-full text-left text-xs border-collapse">
                              <tbody>
                                {rows.map((row, rIdx) => {
                                  if (row.includes('---')) return null;
                                  const cols = row.split('|').filter(c => c.trim().length > 0);
                                  const isHeader = rIdx === 0;
                                  return (
                                    <tr key={rIdx} className={isHeader ? 'bg-[#00274C] text-white font-bold' : rIdx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                                      {cols.map((col, cIdx) => (
                                        <td key={cIdx} className="p-2 border-b border-slate-100 font-mono text-[11px]">
                                          {col.trim()}
                                        </td>
                                      ))}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        );
                      }
                      return (
                        <p key={pIdx} className="whitespace-pre-line">
                          {paragraph.split('**').map((chunk, cIdx) => 
                            cIdx % 2 === 1 ? <strong key={cIdx} className={isBot ? 'text-[#00274C] font-bold' : 'text-[#D8A027] font-bold'}>{chunk}</strong> : chunk
                          )}
                        </p>
                      );
                    })}
                  </div>

                  <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[10px] ${isBot ? 'border-slate-100 text-slate-400' : 'border-white/10 text-slate-300'}`}>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {msg.timestamp}
                    </span>

                    {isBot && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="hover:text-[#00274C] flex items-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer"
                        aria-label="Copy message notes"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Notes</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Suggestions / Prompt Chips */}
                {isBot && msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestions.map((suggestion, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSend(suggestion)}
                        className="text-[11px] bg-white border border-[#00274C]/20 hover:border-[#DB241E] text-[#00274C] hover:text-[#DB241E] px-3 py-1 rounded-full font-medium transition-all shadow-2xs hover:shadow-sm flex items-center gap-1 cursor-pointer"
                      >
                        <span>{suggestion}</span>
                        <ChevronRight className="w-3 h-3 opacity-60" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00274C] flex items-center justify-center shrink-0">
              <AeroBotIcon size="xs" active={true} theme="gold" />
            </div>
            <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-[#DB241E] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#00274C] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#D8A027] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-slate-500 font-mono">AeroBot computing flight telemetry...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AeroBot: METAR decode, 1-in-60 formula, attendance status, fee dues..."
              className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#00274C] focus:ring-2 focus:ring-[#00274C]/10 transition-all font-body text-[#212121]"
              disabled={isTyping}
            />
            <Sparkles className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className={`
              p-3 rounded-xl flex items-center justify-center transition-all cursor-pointer
              ${input.trim() && !isTyping
                ? 'bg-[#DB241E] hover:bg-[#b81d18] text-white shadow-md shadow-[#DB241E]/20 active:scale-95'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
            `}
            aria-label="Send query"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[#00274C]">AeroBot Copilot</span>
            <span>•</span>
            <span>Captain to First Officer Ground Briefings</span>
          </div>
          <span className="hidden sm:inline italic text-slate-600">Airborne Aviation Academy — "From Dream to Cockpit"</span>
        </div>
      </div>
    </div>
  );
};
