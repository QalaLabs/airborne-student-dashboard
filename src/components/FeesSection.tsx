import React, { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Download, 
  ShieldCheck, 
  ArrowUpRight,
  QrCode,
  Building,
  Smartphone,
  Printer,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  StudentProfile, 
  FeeInstallment, 
  FeeHeadBreakdown 
} from '../types/dashboard';

interface FeesSectionProps {
  student: StudentProfile;
  installments: FeeInstallment[];
  feeHeads: FeeHeadBreakdown[];
  onPaymentSuccess: (paidAmount: number, receiptNum: string) => void;
}

export const FeesSection: React.FC<FeesSectionProps> = ({
  student,
  installments,
  feeHeads,
  onPaymentSuccess,
}) => {
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  const pendingAmount = student.pendingFee;

  const handlePay = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setPayModalOpen(false);

      const generatedReceipt = `AAA-REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      // Fire celebratory confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00274C', '#DB241E', '#D8A027', '#ffffff']
      });

      onPaymentSuccess(pendingAmount, generatedReceipt);
    }, 1800);
  };

  const openReceiptModal = (inst: FeeInstallment) => {
    setSelectedReceipt({
      receiptNo: inst.receiptNumber || 'AAA-REC-2026-0892',
      date: inst.paidOn || '14 Aug 2026',
      amount: inst.amount,
      title: inst.title,
      paymentMode: inst.paymentMode || 'Online Payment',
      studentName: student.name,
      rollNumber: student.rollNumber,
      computerNumber: student.computerNumber,
      batch: student.batchName,
    });
  };

  return (
    <div className="space-y-6">
      {/* Fee Summary Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Fee */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8A9BB0] uppercase tracking-wider font-brand-primary">
              Total Course Package
            </span>
            <div className="p-2 rounded-xl bg-slate-100 text-[#00274C]">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-black text-[#00274C] font-brand-primary font-flight-mono">
              ₹{student.totalFee.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Complete 5 DGCA Ground Papers + RTR(A) + Pre-Board Exam Series
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Includes 18% GST</span>
            <span className="font-semibold text-emerald-600">Tax Invoice Registered</span>
          </div>
        </div>

        {/* Paid to Date */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8A9BB0] uppercase tracking-wider font-brand-primary">
              Fee Paid to Date
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-black text-emerald-600 font-brand-primary font-flight-mono">
              ₹{student.paidFee.toLocaleString()}
            </div>
            <div className="mt-2 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${(student.paidFee / student.totalFee) * 100}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Progress: {((student.paidFee / student.totalFee) * 100).toFixed(0)}% Settled</span>
            <span className="font-semibold text-emerald-600">2 Installments Paid</span>
          </div>
        </div>

        {/* Pending Balance */}
        <div className={`rounded-2xl p-6 border shadow-sm flex flex-col justify-between transition-all ${pendingAmount > 0 ? 'bg-gradient-to-br from-[#00274C] to-[#00172E] text-white border-[#00172E]' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider font-brand-primary ${pendingAmount > 0 ? 'text-[#D8A027]' : 'text-[#8A9BB0]'}`}>
              Pending Fee Balance
            </span>
            <div className={`p-2 rounded-xl ${pendingAmount > 0 ? 'bg-white/10 text-[#D8A027]' : 'bg-emerald-50 text-emerald-600'}`}>
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4">
            <div className={`text-3xl font-black font-brand-primary font-flight-mono ${pendingAmount > 0 ? 'text-[#DB241E] text-white' : 'text-[#00274C]'}`}>
              ₹{pendingAmount.toLocaleString()}
            </div>
            <p className={`text-xs mt-1 ${pendingAmount > 0 ? 'text-slate-300' : 'text-slate-500'}`}>
              {pendingAmount > 0 ? '3rd Installment due on 15th Nov 2026' : 'All account dues cleared for this cohort.'}
            </p>
          </div>

          <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${pendingAmount > 0 ? 'border-white/10' : 'border-slate-100'}`}>
            {pendingAmount > 0 ? (
              <button
                onClick={() => setPayModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-[#DB241E] hover:bg-[#b81d18] text-white font-bold font-brand-primary transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>Pay Pending ₹{pendingAmount.toLocaleString()} Online</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            ) : (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                No outstanding dues
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Fee Breakdown by Training Head */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#00274C] font-brand-primary">
            Curriculum Fee Allocation Breakdown
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent breakdown of classroom ground instruction, question bank subscriptions, and simulator lab allocation
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {feeHeads.map((head, idx) => (
            <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-[#00274C] font-brand-primary">
                  {head.title}
                </span>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 font-flight-mono">
                  <span>Allocated: ₹{head.allocatedAmount.toLocaleString()}</span>
                  <span>•</span>
                  <span className="text-emerald-600">Paid: ₹{head.paidAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`
                  text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider
                  ${head.status === 'Fully Paid' ? 'bg-emerald-100 text-emerald-800' : ''}
                  ${head.status === 'Partially Paid' ? 'bg-[#D8A027]/15 text-[#00274C] border border-[#D8A027]/30' : ''}
                  ${head.status === 'Pending' ? 'bg-red-100 text-red-800' : ''}
                `}>
                  {head.status}
                </span>

                <span className="text-xs font-extrabold text-[#00274C] font-flight-mono w-24 text-right">
                  {head.allocatedAmount === head.paidAmount 
                    ? '₹0 Due' 
                    : `₹${(head.allocatedAmount - head.paidAmount).toLocaleString()} Left`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Installment Schedule & Receipts */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#00274C] font-brand-primary">
            Installment Schedule & Payment Receipts
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Download official GST tax invoices and payment vouchers for training verification
          </p>
        </div>

        <div className="space-y-3">
          {installments.map((inst) => {
            const isPaid = inst.status === 'paid';
            return (
              <div
                key={inst.id}
                className={`
                  p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all
                  ${isPaid ? 'border-emerald-200 bg-emerald-50/20' : 'border-[#D8A027]/30 bg-[#D8A027]/5'}
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0
                    ${isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-[#D8A027]/20 text-[#00274C]'}
                  `}>
                    {isPaid ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5 text-[#D8A027]" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-[#00274C] font-brand-primary">
                        {inst.title}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-[#DB241E] text-white'}`}>
                        {inst.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                      <span>Due: <strong className="text-slate-700">{inst.dueDate}</strong></span>
                      {inst.paidOn && (
                        <>
                          <span>•</span>
                          <span>Cleared on: <strong className="text-emerald-700">{inst.paidOn}</strong></span>
                        </>
                      )}
                      {inst.paymentMode && (
                        <>
                          <span>•</span>
                          <span>Via: {inst.paymentMode}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-sm sm:text-base font-black text-[#00274C] font-flight-mono">
                      ₹{inst.amount.toLocaleString()}
                    </span>
                    {inst.receiptNumber && (
                      <span className="block text-[10px] text-slate-400 font-mono">
                        {inst.receiptNumber}
                      </span>
                    )}
                  </div>

                  {isPaid ? (
                    <button
                      onClick={() => openReceiptModal(inst)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#00274C] text-[#00274C] text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#DB241E]" />
                      <span>Receipt</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setPayModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-[#DB241E] hover:bg-[#b81d18] text-white text-xs font-bold font-brand-primary transition-all shadow-sm cursor-pointer"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Online Payment Modal */}
      {payModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#00172E]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-[#00274C] font-brand-primary">
                  Secure Fee Payment Gateway
                </h3>
              </div>
              <button
                onClick={() => setPayModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close payment modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-[#00274C] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#D8A027] font-bold">
                  Amount to be Paid
                </span>
                <div className="text-2xl font-black font-brand-primary font-flight-mono">
                  ₹{pendingAmount.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-300">
                  Cadet: {student.name} ({student.rollNumber})
                </span>
              </div>
              <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full text-slate-200 font-flight-mono border border-white/10">
                256-Bit Encrypted
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="mt-4 space-y-2">
              <label className="text-xs font-bold text-slate-700 block font-brand-primary">
                Select Payment Mode
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${paymentMethod === 'upi' ? 'border-[#DB241E] bg-red-50 text-[#DB241E] font-bold' : 'border-slate-200 hover:bg-[#F5F6F8] text-slate-700'}`}
                >
                  <Smartphone className="w-5 h-5 mx-auto mb-1 text-current" />
                  <span className="text-xs block font-brand-primary">UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${paymentMethod === 'card' ? 'border-[#DB241E] bg-red-50 text-[#DB241E] font-bold' : 'border-slate-200 hover:bg-[#F5F6F8] text-slate-700'}`}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1 text-current" />
                  <span className="text-xs block font-brand-primary">Debit / Credit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${paymentMethod === 'netbanking' ? 'border-[#DB241E] bg-red-50 text-[#DB241E] font-bold' : 'border-slate-200 hover:bg-[#F5F6F8] text-slate-700'}`}
                >
                  <Building className="w-5 h-5 mx-auto mb-1 text-current" />
                  <span className="text-xs block font-brand-primary">NetBanking</span>
                </button>
              </div>

              {paymentMethod === 'upi' && (
                <div className="mt-3 p-4 bg-[#F5F6F8] rounded-xl border border-slate-200 text-center space-y-2">
                  <div className="w-32 h-32 bg-white p-2 rounded-xl border border-slate-200 mx-auto flex items-center justify-center shadow-xs">
                    <QrCode className="w-28 h-28 text-[#00274C]" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700 font-brand-primary">
                    Scan via Google Pay, PhonePe, Paytm, or BHIM
                  </p>
                  <p className="text-[10px] text-slate-500 font-flight-mono">
                    UPI ID: airborneaviation.cpl@hdfcbank
                  </p>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="mt-3 space-y-2 text-xs">
                  <input
                    type="text"
                    placeholder="Card Number (4000 1234 5678 9010)"
                    defaultValue="4532 •••• •••• 8821"
                    className="w-full p-2.5 bg-[#F5F6F8] border border-slate-200 rounded-xl focus:outline-none focus:border-[#00274C] font-flight-mono"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      defaultValue="08/28"
                      className="p-2.5 bg-[#F5F6F8] border border-slate-200 rounded-xl focus:outline-none focus:border-[#00274C] font-flight-mono"
                    />
                    <input
                      type="password"
                      placeholder="CVV"
                      defaultValue="782"
                      className="p-2.5 bg-[#F5F6F8] border border-slate-200 rounded-xl focus:outline-none focus:border-[#00274C] font-flight-mono"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div className="mt-3 space-y-2 text-xs">
                  <select className="w-full p-2.5 bg-[#F5F6F8] border border-slate-200 rounded-xl focus:outline-none focus:border-[#00274C] font-medium">
                    <option>HDFC Bank (Instant Verification)</option>
                    <option>State Bank of India (SBI)</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                  </select>
                </div>
              )}
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => setPayModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#F5F6F8] text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handlePay}
                disabled={isProcessing}
                className="flex-1 py-2.5 rounded-xl bg-[#DB241E] hover:bg-[#b81d18] disabled:opacity-50 text-white text-xs font-bold font-brand-primary transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying with Bank...</span>
                  </span>
                ) : (
                  <span>Confirm ₹{pendingAmount.toLocaleString()}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-[#00172E]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Academy Printable Receipt */}
            <div className="border border-slate-300 p-6 rounded-xl bg-white space-y-4 text-xs">
              <div className="flex items-start justify-between border-b pb-3 border-slate-200">
                <div>
                  <h3 className="text-base font-black italic tracking-wider text-[#00274C] font-brand-primary">
                    AIRB<span className="text-[#DB241E]">O</span>RNE AVIATION ACADEMY
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Airborne Aviation Private Limited (CIN: U85306DL2026PTC465670)
                  </p>
                  <p className="text-[10px] text-slate-500">
                    E-549, 2nd Floor, Ramphal Chowk, Sector-7, Dwarka, New Delhi-110075
                  </p>
                </div>
                <div className="text-right">
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                    PAID RECEIPT
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1 font-flight-mono">{selectedReceipt.receiptNo}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-600 bg-[#F5F6F8] p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 block font-brand-primary">Cadet Name</span>
                  <strong className="text-slate-800">{selectedReceipt.studentName}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-brand-primary">Roll / Student ID</span>
                  <strong className="text-slate-800 font-flight-mono">{selectedReceipt.rollNumber}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-brand-primary">DGCA Computer No</span>
                  <strong className="text-[#00274C] font-flight-mono">{selectedReceipt.computerNumber}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-brand-primary">Batch</span>
                  <strong className="text-slate-800">{selectedReceipt.batch}</strong>
                </div>
              </div>

              <div className="border-t border-b border-slate-200 py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#00274C] font-brand-primary">{selectedReceipt.title}</p>
                  <p className="text-[10px] text-slate-500">Method: {selectedReceipt.paymentMode} • Date: {selectedReceipt.date}</p>
                </div>
                <div className="text-right text-base font-black text-emerald-700 font-flight-mono">
                  ₹{selectedReceipt.amount.toLocaleString()}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 text-[10px] text-slate-400">
                <span>Computer Generated Official Voucher</span>
                <span className="font-semibold text-slate-700">Capt. Navrang Singh (Chief Mentor)</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-[#F5F6F8] hover:bg-slate-200 text-[#00274C] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Tax Invoice</span>
              </button>

              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 rounded-xl bg-[#00274C] text-white text-xs font-bold hover:bg-[#00172E] cursor-pointer"
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
