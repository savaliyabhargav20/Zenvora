import React, { useState } from 'react';
import { 
  X, 
  Banknote, 
  QrCode, 
  CreditCard, 
  Users, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Printer,
  Download,
  Phone,
  Mail,
  Send,
  FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BillReceipt, PaymentMethod } from '../types';
import { sound } from '../utils/audio';
import { generateBillPDF, sendBillPDFToMobile, sendBillPDFToEmail } from '../utils/pdfGenerator';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: BillReceipt;
  onCompletePayment: (method: PaymentMethod, receivedAmount?: number) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  bill,
  onCompletePayment,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi');
  const [tenderedAmount, setTenderedAmount] = useState<number>(Math.ceil(bill.total / 100) * 100);
  const [splitCount, setSplitCount] = useState<number>(2);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [postPayPhone, setPostPayPhone] = useState<string>(bill.customer.phone || '');
  const [postPayEmail, setPostPayEmail] = useState<string>(bill.customer.email || '');
  const [sentPdfSuccess, setSentPdfSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const changeDue = Math.max(0, tenderedAmount - bill.total);
  const splitAmount = (bill.total / splitCount).toFixed(2);

  const handlePay = () => {
    sound.playClick();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      sound.playCashRegister();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
      onCompletePayment(selectedMethod, selectedMethod === 'cash' ? tenderedAmount : bill.total);
    }, 800);
  };

  const handleSendPDF = async () => {
    if (!postPayPhone.trim()) return;
    sound.playClick();
    try {
      await sendBillPDFToMobile(bill, postPayPhone);
      setSentPdfSuccess(`PDF Bill sent to +${postPayPhone.replace(/[^0-9]/g, '')}!`);
    } catch {
      setSentPdfSuccess('PDF downloaded locally.');
    }
  };

  const handleSendEmailPDF = async () => {
    if (!postPayEmail.trim()) return;
    sound.playClick();
    try {
      await sendBillPDFToEmail(bill, postPayEmail);
      setSentPdfSuccess(`PDF Bill dispatched to ${postPayEmail}!`);
    } catch {
      setSentPdfSuccess('PDF downloaded locally.');
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-zinc-100 flex flex-col">
        {/* Header */}
        <div className="bg-zinc-950/90 p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400 text-zinc-950 font-black shadow-md shadow-amber-400/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-black text-lg text-zinc-100">
                CHECKOUT &amp; PAYMENT
              </h3>
              <p className="text-xs text-zinc-400">Total Payable: <strong className="text-amber-400">₹{bill.total.toFixed(2)}</strong></p>
            </div>
          </div>
          <button
            id="btn-close-payment-modal"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-750 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4">
          {isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500 text-emerald-400 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-emerald-400 font-serif">Payment Completed!</h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Bill <strong>{bill.billNumber}</strong> marked as Paid via {selectedMethod.toUpperCase()}
                </p>
              </div>

              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-2 text-left">
                {/* Mobile Dispatch */}
                <div>
                  <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>Send PDF Bill to Customer Mobile</span>
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      id="input-post-payment-phone"
                      type="tel"
                      placeholder="Enter mobile number"
                      value={postPayPhone}
                      onChange={(e) => setPostPayPhone(e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-mono focus:outline-none focus:ring-1 focus:ring-amber-400 placeholder-zinc-600"
                    />
                    <button
                      id="btn-post-payment-send-pdf"
                      onClick={handleSendPDF}
                      disabled={!postPayPhone.trim()}
                      className="flex items-center gap-1 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs rounded-lg transition disabled:opacity-40"
                    >
                      <Send className="w-3 h-3" />
                      <span>Send PDF</span>
                    </button>
                  </div>
                </div>

                {/* Email Dispatch */}
                <div className="pt-2 border-t border-zinc-900">
                  <label className="text-[11px] font-bold text-sky-400 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                    <Mail className="w-3.5 h-3.5 text-sky-400" />
                    <span>Send PDF Bill to Customer Email</span>
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      id="input-post-payment-email"
                      type="email"
                      placeholder="customer@example.com"
                      value={postPayEmail}
                      onChange={(e) => setPostPayEmail(e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-xs text-sky-300 font-mono focus:outline-none focus:ring-1 focus:ring-sky-400 placeholder-zinc-600"
                    />
                    <button
                      id="btn-post-payment-send-email-pdf"
                      onClick={handleSendEmailPDF}
                      disabled={!postPayEmail.trim()}
                      className="flex items-center gap-1 px-3 py-1.5 bg-sky-400 hover:bg-sky-300 text-zinc-950 font-bold text-xs rounded-lg transition disabled:opacity-40"
                    >
                      <Send className="w-3 h-3" />
                      <span>Email PDF</span>
                    </button>
                  </div>
                </div>

                {sentPdfSuccess && (
                  <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 pt-1">
                    <FileCheck className="w-3 h-3" /> {sentPdfSuccess}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  id="btn-modal-print"
                  onClick={() => { window.print(); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-750 text-amber-300 text-xs font-bold rounded-xl border border-zinc-700 transition shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Bill</span>
                </button>
                <button
                  id="btn-modal-pdf"
                  onClick={() => { generateBillPDF(bill); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-black rounded-xl transition shadow-md shadow-amber-400/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>

              <button
                id="btn-modal-done"
                onClick={onClose}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl uppercase tracking-wider transition shadow-lg"
              >
                Close &amp; Start Next Order
              </button>
            </div>
          ) : (
            <>
              {/* Payment Method Selector Bento Grid */}
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  id="pay-method-upi"
                  onClick={() => { sound.playClick(); setSelectedMethod('upi'); }}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition ${
                    selectedMethod === 'upi'
                      ? 'bg-amber-400/10 border-amber-400 text-amber-300 font-bold shadow-xs'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  <span className="text-[11px]">UPI QR</span>
                </button>

                <button
                  id="pay-method-cash"
                  onClick={() => { sound.playClick(); setSelectedMethod('cash'); }}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition ${
                    selectedMethod === 'cash'
                      ? 'bg-amber-400/10 border-amber-400 text-amber-300 font-bold shadow-xs'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                  <span className="text-[11px]">Cash</span>
                </button>

                <button
                  id="pay-method-card"
                  onClick={() => { sound.playClick(); setSelectedMethod('card'); }}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition ${
                    selectedMethod === 'card'
                      ? 'bg-amber-400/10 border-amber-400 text-amber-300 font-bold shadow-xs'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-[11px]">Card</span>
                </button>

                <button
                  id="pay-method-split"
                  onClick={() => { sound.playClick(); setSelectedMethod('split'); }}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition ${
                    selectedMethod === 'split'
                      ? 'bg-amber-400/10 border-amber-400 text-amber-300 font-bold shadow-xs'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span className="text-[11px]">Split</span>
                </button>
              </div>

              {/* Method Specific UI */}
              {selectedMethod === 'upi' && (
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-center space-y-3 shadow-inner">
                  <div className="text-xs text-zinc-400 font-medium">
                    Scan via PhonePe, Google Pay, Paytm or BHIM
                  </div>
                  {/* Dynamic QR Code Box */}
                  <div className="w-40 h-40 bg-white p-2 rounded-2xl mx-auto flex flex-col items-center justify-center shadow-lg border border-amber-400/40">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=restaurant@bank%26pn=RoyalDiner%26am=${bill.total.toFixed(2)}%26cu=INR`}
                      alt="UPI QR Code"
                      className="w-36 h-36 object-contain"
                    />
                  </div>
                  <div className="text-xs font-mono font-bold text-amber-400">
                    UPI ID: royaldiner@okhdfcbank
                  </div>
                </div>
              )}

              {selectedMethod === 'cash' && (
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3 shadow-inner">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">
                      Cash Tendered / Received:
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="input-cash-tendered"
                        type="number"
                        min={bill.total}
                        value={tenderedAmount}
                        onChange={(e) => setTenderedAmount(parseFloat(e.target.value) || 0)}
                        className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-lg font-mono font-bold text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                      <div className="flex gap-1">
                        {[500, 1000, 2000].map((amt) => (
                          <button
                            key={amt}
                            onClick={() => setTenderedAmount(amt)}
                            className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl border border-zinc-700"
                          >
                            ₹{amt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-900 p-2.5 rounded-xl flex items-center justify-between border border-zinc-800">
                    <span className="text-xs text-zinc-300 font-semibold">Change to Return:</span>
                    <span className="text-base font-mono font-extrabold text-emerald-400">
                      ₹{changeDue.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {selectedMethod === 'card' && (
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2 text-xs text-zinc-300 shadow-inner">
                  <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-between">
                    <span>Card POS Swipe Terminal</span>
                    <span className="font-bold text-amber-400">POS-01 (Connected)</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 text-center">
                    Swipe or tap customer card on EDC terminal to capture ₹{bill.total.toFixed(2)}
                  </p>
                </div>
              )}

              {selectedMethod === 'split' && (
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300">Number of Guests:</span>
                    <div className="flex items-center gap-2">
                      {[2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setSplitCount(n)}
                          className={`w-8 h-8 rounded-xl font-bold text-xs transition ${
                            splitCount === n ? 'bg-amber-400 text-zinc-950 font-black' : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-900 rounded-xl flex justify-between items-center text-xs border border-zinc-800">
                    <span className="font-semibold text-zinc-300">Per Person Amount:</span>
                    <span className="text-base font-mono font-extrabold text-amber-400">
                      ₹{splitAmount} × {splitCount}
                    </span>
                  </div>
                </div>
              )}

              {/* Confirm Pay Button */}
              <button
                id="btn-confirm-payment"
                onClick={handlePay}
                disabled={isProcessing || (selectedMethod === 'cash' && tenderedAmount < bill.total)}
                className="w-full py-3 bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 transition transform active:scale-95 shadow-emerald-600/20"
              >
                <span>{isProcessing ? 'Processing Transaction...' : `Confirm & Settle ₹${bill.total.toFixed(2)}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
