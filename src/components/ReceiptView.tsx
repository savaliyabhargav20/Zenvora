import React, { useRef, useState } from 'react';
import { 
  Receipt as ReceiptIcon, 
  Printer, 
  Download, 
  Send, 
  CreditCard, 
  Percent, 
  Sparkles,
  HeartHandshake,
  QrCode,
  FileText,
  RotateCcw,
  CheckCircle2,
  Phone,
  Mail,
  FileCheck
} from 'lucide-react';
import { BillReceipt, CustomerInfo, OrderItem, PaymentMethod } from '../types';
import { generateBillPDF, sendBillPDFToMobile, sendBillPDFToEmail } from '../utils/pdfGenerator';
import { sound } from '../utils/audio';

interface ReceiptViewProps {
  bill: BillReceipt;
  onGenerateReceipt: () => void;
  onOpenSendModal: () => void;
  onOpenPaymentModal: () => void;
  onReset: () => void;
  taxRate: number;
  setTaxRate: (r: number) => void;
  discountRate: number;
  setDiscountRate: (d: number) => void;
  tipAmount: number;
  setTipAmount: (t: number) => void;
  hasItems: boolean;
}

export const ReceiptView: React.FC<ReceiptViewProps> = ({
  bill,
  onGenerateReceipt,
  onOpenSendModal,
  onOpenPaymentModal,
  onReset,
  taxRate,
  setTaxRate,
  discountRate,
  setDiscountRate,
  tipAmount,
  setTipAmount,
  hasItems,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [mobileNumber, setMobileNumber] = useState<string>(bill.customer.phone || '');
  const [emailAddress, setEmailAddress] = useState<string>(bill.customer.email || '');
  const [dispatchTab, setDispatchTab] = useState<'mobile' | 'email'>('mobile');
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [isSendingMobile, setIsSendingMobile] = useState<boolean>(false);
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  const handleDownloadPDF = () => {
    sound.playClick();
    generateBillPDF(bill);
  };

  const handleQuickSendPDF = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!mobileNumber.trim() || !hasItems) return;
    setIsSendingMobile(true);
    sound.playCashRegister();

    try {
      await sendBillPDFToMobile(bill, mobileNumber);
      setSendSuccess(`PDF Bill sent to +${mobileNumber.replace(/[^0-9]/g, '')}!`);
      setTimeout(() => setSendSuccess(null), 4000);
    } catch {
      setSendSuccess('Failed to send. PDF downloaded locally.');
      setTimeout(() => setSendSuccess(null), 4000);
    } finally {
      setIsSendingMobile(false);
    }
  };

  const handleQuickSendEmailPDF = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!emailAddress.trim() || !hasItems) return;
    setIsSendingEmail(true);
    sound.playCashRegister();

    try {
      await sendBillPDFToEmail(bill, emailAddress);
      setSendSuccess(`PDF Bill dispatched to ${emailAddress}!`);
      setTimeout(() => setSendSuccess(null), 4000);
    } catch {
      setSendSuccess('Failed to send. PDF downloaded locally.');
      setTimeout(() => setSendSuccess(null), 4000);
    } finally {
      setIsSendingEmail(false);
    }
  };


  return (
    <div className="bg-zinc-900/85 backdrop-blur-md border border-zinc-800/90 rounded-2xl p-4 shadow-xl flex flex-col gap-4 text-zinc-100">
      {/* Cost Summary Matrix (Mirrors CostFrame in Tkinter) */}
      <div className="bg-zinc-950/90 border border-zinc-800/90 rounded-xl p-3.5 shadow-inner">
        <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 mb-2.5 flex items-center justify-between">
          <span>Billing Breakdown</span>
          <span className="text-[10px] text-zinc-500 font-mono">Auto-Calculated</span>
        </h4>

        {/* 3 Categories Summary Bento Tiles */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-rose-400 block truncate">Food</span>
            <span className="text-sm font-extrabold text-zinc-100 font-mono">
              ₹{bill.costOfFood.toFixed(0)}
            </span>
          </div>

          <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-sky-400 block truncate">Drinks</span>
            <span className="text-sm font-extrabold text-zinc-100 font-mono">
              ₹{bill.costOfDrinks.toFixed(0)}
            </span>
          </div>

          <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-purple-400 block truncate">Cakes</span>
            <span className="text-sm font-extrabold text-zinc-100 font-mono">
              ₹{bill.costOfCakes.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Subtotal, Tax, Discount & Tip Controls */}
        <div className="space-y-2 text-xs border-t border-zinc-800/80 pt-2.5">
          <div className="flex items-center justify-between text-zinc-300">
            <span className="font-semibold">Sub Total:</span>
            <span className="font-mono font-bold text-sm text-zinc-100">
              ₹{bill.subtotal.toFixed(2)}
            </span>
          </div>

          {/* Tax Selection / GST Rate */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-zinc-400">
              <span>Service Tax / GST:</span>
              <select
                id="select-tax-rate"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                className="bg-zinc-900 border border-zinc-700 text-amber-400 font-bold rounded-lg px-2 py-0.5 text-xs focus:outline-none"
              >
                <option value={0}>0%</option>
                <option value={5}>5%</option>
                <option value={12}>12%</option>
                <option value={18}>18% (Std)</option>
                <option value={28}>28%</option>
              </select>
            </div>
            <span className="font-mono font-bold text-amber-400">
              +₹{bill.taxAmount.toFixed(2)}
            </span>
          </div>

          {/* Discount Selector */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-zinc-400">
              <span>Discount Coupon:</span>
              <select
                id="select-discount-rate"
                value={discountRate}
                onChange={(e) => setDiscountRate(parseFloat(e.target.value))}
                className="bg-zinc-900 border border-zinc-700 text-emerald-400 font-bold rounded-lg px-2 py-0.5 text-xs focus:outline-none"
              >
                <option value={0}>None</option>
                <option value={5}>5% Off</option>
                <option value={10}>10% Festive</option>
                <option value={15}>15% VIP</option>
                <option value={20}>20% Special</option>
              </select>
            </div>
            <span className="font-mono font-bold text-emerald-400">
              {bill.discountAmount > 0 ? `-₹${bill.discountAmount.toFixed(2)}` : '₹0.00'}
            </span>
          </div>

          {/* Tip / Gratuity */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-zinc-400">
              <span>Gratuity / Tip:</span>
              <div className="flex gap-1">
                {[0, 20, 50, 100].map((tip) => (
                  <button
                    key={tip}
                    onClick={() => { sound.playClick(); setTipAmount(tip); }}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition ${
                      tipAmount === tip ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {tip === 0 ? 'None' : `₹${tip}`}
                  </button>
                ))}
              </div>
            </div>
            <span className="font-mono font-bold text-zinc-200">
              ₹{bill.tipAmount.toFixed(2)}
            </span>
          </div>

          {/* Grand Total */}
          <div className="flex items-center justify-between text-sm bg-zinc-900/90 p-2.5 rounded-xl border border-amber-400/40 mt-2">
            <span className="font-black text-amber-400 uppercase tracking-wide">
              Total Payable:
            </span>
            <span className="font-mono font-black text-lg text-amber-400">
              ₹{bill.total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Direct Mobile / Email PDF Dispatch Widget */}
      <div className="bg-zinc-950/90 border border-amber-400/30 rounded-xl p-3 shadow-inner flex flex-col gap-2">
        <div className="flex items-center justify-between">
          {/* Tab Selector */}
          <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
            <button
              id="tab-dispatch-mobile"
              type="button"
              onClick={() => setDispatchTab('mobile')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold transition ${
                dispatchTab === 'mobile'
                  ? 'bg-amber-400 text-zinc-950 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Phone className="w-3 h-3" />
              <span>Mobile PDF</span>
            </button>
            <button
              id="tab-dispatch-email"
              type="button"
              onClick={() => setDispatchTab('email')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold transition ${
                dispatchTab === 'email'
                  ? 'bg-sky-400 text-zinc-950 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Mail className="w-3 h-3" />
              <span>Email PDF</span>
            </button>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">
            {dispatchTab === 'mobile' ? 'WhatsApp & SMS' : 'Digital Invoice'}
          </span>
        </div>

        {dispatchTab === 'mobile' ? (
          <form onSubmit={handleQuickSendPDF} className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400">
                +91
              </span>
              <input
                id="input-receipt-mobile"
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl pl-10 pr-2 py-1.5 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-amber-400 placeholder-zinc-600"
              />
            </div>

            <button
              id="btn-quick-send-pdf"
              type="submit"
              disabled={!mobileNumber.trim() || !hasItems || isSendingMobile}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wide rounded-xl shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingMobile ? 'Sending...' : 'Send PDF'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleQuickSendEmailPDF} className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <Mail className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-sky-400" />
              <input
                id="input-receipt-email"
                type="email"
                placeholder="customer@example.com"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl pl-8 pr-2 py-1.5 text-xs text-sky-300 font-mono font-medium focus:outline-none focus:ring-1 focus:ring-sky-400 placeholder-zinc-600"
              />
            </div>

            <button
              id="btn-quick-send-email-pdf"
              type="submit"
              disabled={!emailAddress.trim() || !hasItems || isSendingEmail}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-zinc-950 font-black text-xs uppercase tracking-wide rounded-xl shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingEmail ? 'Sending...' : 'Email PDF'}</span>
            </button>
          </form>
        )}

        {sendSuccess && (
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 text-[11px] font-bold animate-fade-in">
            <FileCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{sendSuccess}</span>
          </div>
        )}
      </div>

      {/* Main Action Buttons (Total, Receipt, Save, Send, Reset, Checkout) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <button
          id="btn-generate-receipt"
          onClick={() => { sound.playCashRegister(); onGenerateReceipt(); }}
          disabled={!hasItems}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wide bg-zinc-800/90 hover:bg-zinc-700 text-amber-300 shadow border border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95"
        >
          <ReceiptIcon className="w-4 h-4" />
          <span>Receipt</span>
        </button>

        <button
          id="btn-save-pdf"
          onClick={handleDownloadPDF}
          disabled={!hasItems}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wide bg-zinc-800/90 hover:bg-zinc-700 text-zinc-100 shadow border border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>Save PDF</span>
        </button>

        <button
          id="btn-print-bill"
          onClick={handlePrint}
          disabled={!hasItems}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wide bg-zinc-800/90 hover:bg-zinc-700 text-zinc-100 shadow border border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95"
        >
          <Printer className="w-4 h-4 text-sky-400" />
          <span>Print</span>
        </button>

        <button
          id="btn-send-email-modal"
          onClick={() => { sound.playClick(); onOpenSendModal(); }}
          disabled={!hasItems}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wide bg-zinc-800/90 hover:bg-zinc-700 text-zinc-100 shadow border border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95"
        >
          <Send className="w-4 h-4 text-emerald-400" />
          <span>Send Bill</span>
        </button>

        <button
          id="btn-pay-checkout"
          onClick={() => { sound.playCashRegister(); onOpenPaymentModal(); }}
          disabled={!hasItems}
          className="col-span-2 sm:col-span-2 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 shadow-lg shadow-amber-400/20 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95"
        >
          <CreditCard className="w-4 h-4" />
          <span>Checkout &amp; Pay (₹{bill.total.toFixed(0)})</span>
        </button>
      </div>

      {/* Realistic Thermal Receipt Preview */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-amber-400" /> Live Receipt Preview
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">Ref: {bill.billNumber}</span>
        </div>

        {/* Thermal Paper Container */}
        <div 
          ref={receiptRef}
          id="thermal-receipt-preview"
          className="bg-zinc-100 text-zinc-900 rounded-2xl p-4 font-mono text-[11px] shadow-2xl border-4 border-dashed border-zinc-300 relative overflow-hidden select-text"
        >
          {/* Top Header */}
          <div className="text-center pb-2 border-b border-zinc-400">
            <h3 className="font-black text-sm tracking-wider text-zinc-950 uppercase font-serif">
              ROYAL DINER &amp; CAFE
            </h3>
            <p className="text-[9px] text-zinc-600">Fine Dining • Bakery • Beverages</p>
            <p className="text-[9px] text-zinc-500">GST: 27AABCR1234F1Z8 | +91 98765 43210</p>
          </div>

          {/* Receipt Info */}
          <div className="py-2 border-b border-zinc-400 space-y-0.5 text-[10px]">
            <div className="flex justify-between">
              <span>Receipt Ref:</span>
              <strong className="text-zinc-950">{bill.billNumber}</strong>
            </div>
            <div className="flex justify-between">
              <span>Date / Time:</span>
              <span>{bill.date} {bill.time}</span>
            </div>
            <div className="flex justify-between">
              <span>Order Type:</span>
              <strong className="uppercase">{bill.orderType}</strong>
            </div>
            {(bill.customer.name || bill.customer.tableNumber) && (
              <div className="flex justify-between">
                <span>Guest / Table:</span>
                <span>{bill.customer.name || 'Guest'} {bill.customer.tableNumber ? `[${bill.customer.tableNumber}]` : ''}</span>
              </div>
            )}
          </div>

          {/* Items Header */}
          <div className="py-1.5 border-b border-zinc-400 flex justify-between font-black text-zinc-950 text-[10px]">
            <span className="w-1/2 text-left">Item</span>
            <span className="w-1/6 text-center">Qty</span>
            <span className="w-1/6 text-right">Price</span>
            <span className="w-1/6 text-right">Cost</span>
          </div>

          {/* Itemized Rows */}
          <div className="py-1.5 space-y-1 border-b border-zinc-400 max-h-48 overflow-y-auto custom-scrollbar">
            {bill.items.length === 0 ? (
              <div className="py-4 text-center text-zinc-500 italic">
                * No items selected yet *
              </div>
            ) : (
              bill.items.map((orderItem) => (
                <div key={orderItem.item.id} className="flex justify-between text-[10px] leading-tight">
                  <span className="w-1/2 text-left truncate font-bold text-zinc-900">
                    {orderItem.item.name}
                  </span>
                  <span className="w-1/6 text-center text-zinc-700">
                    {orderItem.quantity}
                  </span>
                  <span className="w-1/6 text-right text-zinc-700">
                    ₹{orderItem.item.price}
                  </span>
                  <span className="w-1/6 text-right font-bold text-zinc-950">
                    ₹{orderItem.quantity * orderItem.item.price}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Category Summary inside Receipt */}
          <div className="py-1.5 space-y-0.5 border-b border-zinc-300 text-[9.5px] text-zinc-700">
            {bill.costOfFood > 0 && (
              <div className="flex justify-between">
                <span>Cost Of Food:</span>
                <span>₹{bill.costOfFood.toFixed(2)}</span>
              </div>
            )}
            {bill.costOfDrinks > 0 && (
              <div className="flex justify-between">
                <span>Cost Of Drinks:</span>
                <span>₹{bill.costOfDrinks.toFixed(2)}</span>
              </div>
            )}
            {bill.costOfCakes > 0 && (
              <div className="flex justify-between">
                <span>Cost Of Cakes:</span>
                <span>₹{bill.costOfCakes.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Totals Breakdown */}
          <div className="py-2 space-y-1 text-[10.5px]">
            <div className="flex justify-between">
              <span>Sub Total:</span>
              <strong className="text-zinc-950">₹{bill.subtotal.toFixed(2)}</strong>
            </div>

            {bill.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-800">
                <span>Discount ({bill.discountRate}%):</span>
                <span>-₹{bill.discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Service Tax / GST ({bill.taxRate}%):</span>
              <span>₹{bill.taxAmount.toFixed(2)}</span>
            </div>

            {bill.tipAmount > 0 && (
              <div className="flex justify-between">
                <span>Tip:</span>
                <span>₹{bill.tipAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="pt-1.5 border-t-2 border-zinc-900 flex justify-between text-xs font-black text-zinc-950">
              <span>TOTAL COST:</span>
              <span>₹{bill.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer & Barcode */}
          <div className="pt-2 border-t border-zinc-400 text-center space-y-1">
            <div className="font-mono text-[9px] tracking-widest text-zinc-600">
              ||| | ||||| || |||||| | ||| |||| |
            </div>
            <p className="text-[9px] italic text-zinc-600">
              * Thank you! Visit again *
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
