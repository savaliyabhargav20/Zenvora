import React, { useState } from 'react';
import { X, Send, Mail, CheckCircle2, MessageSquare, Copy, Download, AlertCircle, Phone, FileCheck, FileText } from 'lucide-react';
import { BillReceipt } from '../types';
import { generateBillPDF, sendBillPDFToMobile, sendBillPDFToEmail } from '../utils/pdfGenerator';
import { sound } from '../utils/audio';

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
🍽️ ROYAL DINER & CAFE - BILL RECEIPT (PDF)
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
Thank you for dining with us! Please visit again.
`.trim();

  const handleSendMobilePDF = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phoneNumber.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid mobile number.' });
      return;
    }

    setIsSending(true);
    setStatusMessage(null);
    sound.playCashRegister();

    try {
      await sendBillPDFToMobile(bill, phoneNumber);
      setStatusMessage({
        type: 'success',
        text: `✓ Bill successfully generated in PDF format and dispatched to +${phoneNumber.replace(/[^0-9]/g, '')}!`,
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
    sound.playCashRegister();

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
    sound.playClick();
    navigator.clipboard.writeText(billSummaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-zinc-100 flex flex-col max-h-[92vh]">
        {/* Header styled with Bento aesthetic */}
        <div className="bg-zinc-950/90 p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400 text-zinc-950 font-black shadow-md shadow-amber-400/20">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-black text-lg text-zinc-100 tracking-wide flex items-center gap-2">
                <span>SEND BILL AS PDF</span>
                <span className="text-[11px] font-mono px-2 py-0.5 bg-amber-400/10 text-amber-300 rounded-full border border-amber-400/30">
                  PDF Format
                </span>
              </h3>
              <p className="text-xs text-zinc-400">Mobile, WhatsApp &amp; Digital Invoice Dispatch</p>
            </div>
          </div>
          <button
            id="btn-close-send-modal"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-750 text-zinc-400 hover:text-white transition"
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
                  ? 'bg-emerald-950/80 border border-emerald-700/80 text-emerald-300'
                  : 'bg-rose-950/80 border border-rose-700/80 text-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Primary Action: Send PDF to Mobile Number */}
          <form onSubmit={handleSendMobilePDF} className="bg-zinc-950 p-4 rounded-xl border border-amber-400/30 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Enter Mobile Number for PDF Bill</span>
              </label>
              <span className="text-[10px] text-zinc-400 font-mono">WhatsApp &amp; SMS</span>
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400">
                +91
              </span>
              <input
                id="input-send-mobile-pdf"
                type="tel"
                required
                placeholder="9876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-12 pr-3 py-2 text-sm text-amber-300 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder-zinc-600"
              />
            </div>

            <button
              id="btn-confirm-send-mobile-pdf"
              type="submit"
              disabled={isSending || !phoneNumber.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 shadow-lg shadow-amber-400/20 disabled:opacity-50 transition transform active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isSending ? 'Generating & Sending PDF...' : 'SEND BILL IN PDF FORMAT'}</span>
            </button>
            <p className="text-[11px] text-zinc-400 text-center flex items-center justify-center gap-1">
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Generates official <strong className="text-zinc-200">.pdf</strong> invoice and sends to customer</span>
            </p>
          </form>

          {/* Secondary Option: Email Dispatch */}
          <form onSubmit={handleSendEmail} className="space-y-3 bg-zinc-950 p-4 rounded-xl border border-sky-400/30">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                <span>Enter Customer Email for PDF Bill</span>
              </label>
              <span className="text-[10px] text-zinc-400 font-mono">Digital PDF Invoice</span>
            </div>
            <div className="flex gap-2">
              <input
                id="input-recipient-email"
                type="email"
                placeholder="customer@example.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-sky-200 font-medium focus:outline-none focus:ring-1 focus:ring-sky-400 placeholder-zinc-600 font-mono"
              />
              <button
                id="btn-confirm-send-email"
                type="submit"
                disabled={isSending || !recipientEmail.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-linear-to-r from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-zinc-950 font-black text-xs uppercase tracking-wide shadow-md transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send PDF</span>
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 text-center flex items-center justify-center gap-1">
              <FileCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Dispatches official PDF invoice directly to customer inbox</span>
            </p>
          </form>

          {/* Bill Details Box (Textarea preview) */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              <span>Bill Summary Preview</span>
            </label>
            <textarea
              id="textarea-send-bill-details"
              readOnly
              rows={4}
              value={billSummaryText}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 font-mono text-[11px] text-zinc-300 select-all leading-relaxed focus:outline-none custom-scrollbar resize-none"
            />
          </div>

          {/* Quick Copy & PDF Download */}
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2 text-xs">
            <button
              id="btn-copy-bill-summary"
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-xl transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
            </button>

            <button
              id="btn-download-pdf-modal"
              onClick={() => { sound.playClick(); generateBillPDF(bill); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-amber-300 rounded-xl transition border border-zinc-700/60"
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

