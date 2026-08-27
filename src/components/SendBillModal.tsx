import React, { useState } from 'react';
import { X, Send, CheckCircle2, Copy, Download, AlertCircle, Phone, Mail } from 'lucide-react';
import { BillReceipt } from '../types';
import { generateBillPDF, sendBillPDFToMobile, sendBillPDFToEmail } from '../utils/pdfGenerator';

interface SendBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: BillReceipt;
}

export const SendBillModal: React.FC<SendBillModalProps> = ({
  isOpen,
  onClose,
  bill,
}) => {
  const [phoneNumber, setPhoneNumber] = useState<string>(bill.customer.phone || '');
  const [recipientEmail, setRecipientEmail] = useState<string>(bill.customer.email || '');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const billSummaryText = `
ZENVORA - BILL RECEIPT
--------------------------------------
Receipt Ref: ${bill.billNumber}
Date & Time: ${bill.date} ${bill.time}
Order Type: ${bill.orderType.toUpperCase()}
${bill.customer.name ? `Guest: ${bill.customer.name}\n` : ''}${bill.customer.tableNumber ? `Table: ${bill.customer.tableNumber}\n` : ''}${bill.customer.phone ? `Phone: ${bill.customer.phone}\n` : ''}--------------------------------------
ITEMS ORDERED:
${bill.items.map((i) => `• ${i.item.name} x${i.quantity} = ₹${i.quantity * i.item.price}`).join('\n')}

--------------------------------------
Sub Total: ₹${bill.subtotal.toFixed(2)}
${bill.discountAmount > 0 ? `Discount (${bill.discountRate}%): -₹${bill.discountAmount.toFixed(2)}\n` : ''}Service Tax (${bill.taxRate}%): ₹${bill.taxAmount.toFixed(2)}
${bill.tipAmount > 0 ? `Tip: ₹${bill.tipAmount.toFixed(2)}\n` : ''}TOTAL COST: ₹${bill.total.toFixed(2)}
Payment: ${bill.paymentMethod.toUpperCase()} (${bill.paymentStatus.toUpperCase()})
--------------------------------------
Official PDF Receipt: "${bill.billNumber}_receipt.pdf"
Thank you for dining with us at Zenvora!
`.trim();

  const handleSendMobilePDF = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phoneNumber.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid mobile number.' });
      return;
    }

    setIsSending(true);
    setStatusMessage(null);

    try {
      await sendBillPDFToMobile(bill, phoneNumber);
      setStatusMessage({
        type: 'success',
        text: `✓ Bill PDF successfully generated and dispatched to +${phoneNumber.replace(/[^0-9]/g, '')}!`,
      });
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Failed to dispatch PDF. Please try again or download PDF directly.',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !recipientEmail.includes('@')) {
      setStatusMessage({ type: 'error', text: 'Please provide a valid recipient email address.' });
      return;
    }

    setIsSending(true);
    setStatusMessage(null);

    try {
      await sendBillPDFToEmail(bill, recipientEmail);
      setStatusMessage({
        type: 'success',
        text: `✓ Bill PDF (${bill.billNumber}_receipt.pdf) successfully generated & dispatched to ${recipientEmail}!`,
      });
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Failed to dispatch email. PDF invoice has been downloaded directly.',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(billSummaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white border border-zinc-300 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-zinc-950 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-zinc-50 p-4 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-black text-white font-black shadow-xs">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-black text-base text-zinc-950 tracking-wide uppercase">
                Send Bill PDF
              </h3>
              <p className="text-xs text-zinc-500">Instant Mobile SMS/WhatsApp &amp; Digital Email Dispatch</p>
            </div>
          </div>
          <button
            id="btn-close-send-modal"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-black transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl flex items-start gap-2.5 text-xs font-semibold ${
                statusMessage.type === 'success'
                  ? 'bg-zinc-900 border border-zinc-800 text-white'
                  : 'bg-zinc-100 border border-zinc-300 text-zinc-900'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-black shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Primary Action: Send PDF to Mobile Number */}
          <form onSubmit={handleSendMobilePDF} className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-zinc-950 uppercase tracking-wide flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-zinc-600" />
                <span>Send PDF to Mobile</span>
              </label>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-zinc-600">
                  +91
                </span>
                <input
                  id="input-send-phone-modal"
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded-xl pl-12 pr-3 py-2 text-xs text-zinc-950 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-black placeholder-zinc-400"
                />
              </div>

              <button
                id="btn-dispatch-mobile-pdf"
                type="submit"
                disabled={isSending || !phoneNumber.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase rounded-xl transition disabled:opacity-40 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Sending...' : 'Send PDF'}</span>
              </button>
            </div>
          </form>

          {/* Secondary Action: Email PDF */}
          <form onSubmit={handleSendEmail} className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-3">
            <label className="block text-xs font-black text-zinc-950 uppercase tracking-wide flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-zinc-600" />
              <span>Send PDF to Email</span>
            </label>

            <div className="flex gap-2">
              <input
                id="input-send-email-modal"
                type="email"
                placeholder="customer@example.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="flex-1 bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-950 font-mono font-medium focus:outline-none focus:ring-1 focus:ring-black placeholder-zinc-400"
              />

              <button
                id="btn-dispatch-email-pdf"
                type="submit"
                disabled={isSending || !recipientEmail.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase rounded-xl transition disabled:opacity-40 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Email PDF</span>
              </button>
            </div>
          </form>

          {/* Download and Copy Actions */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              id="btn-copy-bill-text"
              type="button"
              onClick={handleCopyText}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-900 text-xs font-bold transition shadow-xs"
            >
              <Copy className="w-3.5 h-3.5 text-zinc-600" />
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Bill Text'}</span>
            </button>

            <button
              id="btn-download-pdf-direct"
              type="button"
              onClick={() => generateBillPDF(bill)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
