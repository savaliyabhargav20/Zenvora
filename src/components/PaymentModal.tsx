import React, { useState } from 'react';
import { 
  X, 
  Banknote, 
  QrCode, 
  CreditCard, 
  Users, 
  CheckCircle2, 
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
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#000000', '#555555', '#aaaaaa', '#ffffff'],
        });
      } catch {
        // ignore
      }
      onCompletePayment(selectedMethod, selectedMethod === 'cash' ? tenderedAmount : bill.total);
    }, 600);
  };

  const handleSendPDF = async () => {
    if (!postPayPhone.trim()) return;
    try {
      await sendBillPDFToMobile(bill, postPayPhone);
      setSentPdfSuccess(`PDF Bill sent to +${postPayPhone.replace(/[^0-9]/g, '')}!`);
    } catch {
      setSentPdfSuccess('PDF downloaded locally.');
    }
  };

  const handleSendEmailPDF = async () => {
    if (!postPayEmail.trim()) return;
    try {
      await sendBillPDFToEmail(bill, postPayEmail);
      setSentPdfSuccess(`PDF Bill dispatched to ${postPayEmail}!`);
    } catch {
      setSentPdfSuccess('PDF downloaded locally.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white border border-zinc-300 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-zinc-950 flex flex-col">
        {/* Header */}
        <div className="bg-zinc-50 p-4 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-black text-white font-black shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-black text-base tracking-wide text-zinc-950 uppercase">
                Checkout &amp; Payment
              </h3>
              <p className="text-xs text-zinc-500">Total Payable: <strong className="text-zinc-950 font-mono">₹{bill.total.toFixed(2)}</strong></p>
            </div>
          </div>
          <button
            id="btn-close-payment-modal"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-black transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4">
          {isSuccess ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 bg-zinc-100 border-2 border-black text-black rounded-2xl mx-auto flex items-center justify-center shadow-md animate-bounce">
                <CheckCircle2 className="w-8 h-8 text-black" />
              </div>
              <div>
                <h4 className="text-lg font-black text-zinc-950 uppercase">Payment Completed!</h4>
                <p className="text-xs text-zinc-600 mt-1">
                  Bill <strong>{bill.billNumber}</strong> marked as Paid via {selectedMethod.toUpperCase()}
                </p>
              </div>

              <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 space-y-3 text-left">
                {/* Mobile Dispatch */}
                <div>
                  <label className="text-[11px] font-bold text-zinc-900 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                    <Phone className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Send PDF Bill to Mobile</span>
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      id="input-post-payment-phone"
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={postPayPhone}
                      onChange={(e) => setPostPayPhone(e.target.value)}
                      className="flex-1 bg-white border border-zinc-300 rounded-lg px-2.5 py-1.5 text-xs text-zinc-950 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-black placeholder-zinc-400"
                    />
                    <button
                      id="btn-post-payment-send-pdf"
                      onClick={handleSendPDF}
                      disabled={!postPayPhone.trim()}
                      className="flex items-center gap-1 px-3 py-1.5 bg-black hover:bg-zinc-800 text-white font-bold text-xs rounded-lg transition disabled:opacity-40"
                    >
                      <Send className="w-3 h-3" />
                      <span>Send PDF</span>
                    </button>
                  </div>
                </div>

                {/* Email Dispatch */}
                <div className="pt-2.5 border-t border-zinc-200">
                  <label className="text-[11px] font-bold text-zinc-900 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                    <Mail className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Send PDF Bill to Email</span>
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      id="input-post-payment-email"
                      type="email"
                      placeholder="customer@example.com"
                      value={postPayEmail}
                      onChange={(e) => setPostPayEmail(e.target.value)}
                      className="flex-1 bg-white border border-zinc-300 rounded-lg px-2.5 py-1.5 text-xs text-zinc-950 font-mono font-medium focus:outline-none focus:ring-1 focus:ring-black placeholder-zinc-400"
                    />
                    <button
                      id="btn-post-payment-send-email-pdf"
                      onClick={handleSendEmailPDF}
                      disabled={!postPayEmail.trim()}
                      className="flex items-center gap-1 px-3 py-1.5 bg-black hover:bg-zinc-800 text-white font-bold text-xs rounded-lg transition disabled:opacity-40"
                    >
                      <Send className="w-3 h-3" />
                      <span>Email PDF</span>
                    </button>
                  </div>
                </div>

                {sentPdfSuccess && (
                  <p className="text-[11px] text-black font-semibold flex items-center gap-1 pt-1">
                    <FileCheck className="w-3.5 h-3.5 text-black" /> {sentPdfSuccess}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  id="btn-modal-print"
                  onClick={() => { window.print(); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-bold rounded-xl border border-zinc-300 transition shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Bill</span>
                </button>
                <button
                  id="btn-modal-pdf"
                  onClick={() => { generateBillPDF(bill); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>

              <button
                id="btn-modal-done"
                onClick={onClose}
                className="w-full py-2.5 bg-black hover:bg-zinc-800 text-white font-bold text-xs rounded-xl uppercase tracking-wider transition shadow-xs"
              >
                Close &amp; Start Next Order
              </button>
            </div>
          ) : (
            <>
              {/* Payment Method Selector */}
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  id="pay-method-upi"
                  onClick={() => setSelectedMethod('upi')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition ${
                    selectedMethod === 'upi'
                      ? 'bg-black text-white border-black font-bold shadow-xs'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  <span className="text-[11px]">UPI QR</span>
                </button>

                <button
                  id="pay-method-cash"
                  onClick={() => setSelectedMethod('cash')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition ${
                    selectedMethod === 'cash'
                      ? 'bg-black text-white border-black font-bold shadow-xs'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                  <span className="text-[11px]">Cash</span>
                </button>

                <button
                  id="pay-method-card"
                  onClick={() => setSelectedMethod('card')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition ${
                    selectedMethod === 'card'
                      ? 'bg-black text-white border-black font-bold shadow-xs'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-[11px]">Card</span>
                </button>

                <button
                  id="pay-method-split"
                  onClick={() => setSelectedMethod('split')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition ${
                    selectedMethod === 'split'
                      ? 'bg-black text-white border-black font-bold shadow-xs'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span className="text-[11px]">Split</span>
                </button>
              </div>

              {/* Method Specific UI */}
              {selectedMethod === 'upi' && (
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 text-center space-y-3">
                  <div className="text-xs text-zinc-600 font-medium">
                    Scan via PhonePe, Google Pay, Paytm or BHIM
                  </div>
                  {/* QR Code */}
                  <div className="w-40 h-40 bg-white p-2 rounded-2xl mx-auto flex flex-col items-center justify-center shadow-md border border-zinc-300">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=restaurant@bank%26pn=Zenvora%26am=${bill.total.toFixed(2)}%26cu=INR`}
                      alt="UPI QR Code"
                      className="w-36 h-36 object-contain"
                    />
                  </div>
                  <div className="text-xs font-mono font-bold text-zinc-950">
                    UPI ID: zenvora@bank
                  </div>
                </div>
              )}

              {selectedMethod === 'cash' && (
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-800 mb-1">
                      Cash Tendered / Received:
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="input-cash-tendered"
                        type="number"
                        min={bill.total}
                        value={tenderedAmount}
                        onChange={(e) => setTenderedAmount(parseFloat(e.target.value) || 0)}
                        className="flex-1 bg-white border border-zinc-300 rounded-xl px-3 py-2 text-base font-mono font-bold text-zinc-950 focus:outline-none focus:ring-1 focus:ring-black"
                      />
                      <div className="flex gap-1">
                        {[500, 1000, 2000].map((amt) => (
                          <button
                            key={amt}
                            onClick={() => setTenderedAmount(amt)}
                            className="px-2 py-1 bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-bold rounded-xl border border-zinc-300"
                          >
                            ₹{amt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl flex items-center justify-between border border-zinc-200">
                    <span className="text-xs text-zinc-700 font-semibold">Change to Return:</span>
                    <span className="text-base font-mono font-extrabold text-zinc-950">
                      ₹{changeDue.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {selectedMethod === 'card' && (
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-2 text-xs text-zinc-700">
                  <div className="p-3 bg-white rounded-xl border border-zinc-200 flex items-center justify-between">
                    <span>Card POS Swipe Terminal</span>
                    <span className="font-bold text-zinc-950">POS-01 (Connected)</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 text-center">
                    Swipe or tap customer card on EDC terminal to capture ₹{bill.total.toFixed(2)}
                  </p>
                </div>
              )}

              {selectedMethod === 'split' && (
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-800">Number of Guests:</span>
                    <div className="flex items-center gap-2">
                      {[2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setSplitCount(n)}
                          className={`w-8 h-8 rounded-xl font-bold text-xs transition border ${
                            splitCount === n 
                              ? 'bg-black text-white border-black font-black' 
                              : 'bg-white border-zinc-300 text-zinc-800 hover:bg-zinc-100'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl flex justify-between items-center text-xs border border-zinc-200">
                    <span className="font-semibold text-zinc-700">Per Person Amount:</span>
                    <span className="text-base font-mono font-extrabold text-zinc-950">
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
                className="w-full py-3 bg-black hover:bg-zinc-800 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 disabled:opacity-40 transition transform active:scale-95"
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
