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
import { BillReceipt, CustomerInfo, OrderItem, PaymentMethod, ThemeStyle } from '../types';
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
  theme?: ThemeStyle;
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
  theme = 'white-black',
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [mobileNumber, setMobileNumber] = useState<string>(bill.customer.phone || '');
  const [emailAddress, setEmailAddress] = useState<string>(bill.customer.email || '');
  const [dispatchTab, setDispatchTab] = useState<'mobile' | 'email'>('mobile');
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [isSendingMobile, setIsSendingMobile] = useState<boolean>(false);
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);

  const isLight = theme === 'white-black';

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
    <div className={`border rounded-2xl p-4 flex flex-col gap-4 transition-colors duration-200 ${
      isLight ? 'bg-white border-zinc-200 shadow-sm text-zinc-900' : 'bg-zinc-900/90 border-zinc-800 shadow-xl text-zinc-100'
    }`}>
      {/* Cost Summary Matrix */}
      <div className={`border rounded-xl p-3.5 ${
        isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'
      }`}>
        <h4 className="text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center justify-between">
          <span className={isLight ? 'text-zinc-950 font-black' : 'text-zinc-100 font-black'}>Billing Breakdown</span>
          <span className={`text-[10px] font-mono ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Auto-Calculated</span>
        </h4>

        {/* 3 Categories Summary Bento Tiles */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className={`p-2.5 rounded-xl border ${
            isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-100'
          }`}>
            <span className="text-[10px] uppercase font-bold text-zinc-500 block truncate">Food</span>
            <span className="text-sm font-extrabold font-mono">
              ₹{bill.costOfFood.toFixed(0)}
            </span>
          </div>

          <div className={`p-2.5 rounded-xl border ${
            isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-100'
          }`}>
            <span className="text-[10px] uppercase font-bold text-zinc-500 block truncate">Drinks</span>
            <span className="text-sm font-extrabold font-mono">
              ₹{bill.costOfDrinks.toFixed(0)}
            </span>
          </div>

          <div className={`p-2.5 rounded-xl border ${
            isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-100'
          }`}>
            <span className="text-[10px] uppercase font-bold text-zinc-500 block truncate">Cakes</span>
            <span className="text-sm font-extrabold font-mono">
              ₹{bill.costOfCakes.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Subtotal, Tax, Discount & Tip Controls */}
        <div className={`space-y-2 text-xs border-t pt-2.5 ${isLight ? 'border-zinc-200' : 'border-zinc-800'}`}>
          <div className="flex items-center justify-between">
            <span className="font-semibold">Sub Total:</span>
            <span className="font-mono font-bold text-sm">
              ₹{bill.subtotal.toFixed(2)}
            </span>
          </div>

          {/* Tax Selection / GST Rate */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <span className={isLight ? 'text-zinc-600' : 'text-zinc-400'}>Tax / GST:</span>
              <select
                id="select-tax-rate"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                className={`border font-bold rounded-lg px-2 py-0.5 text-xs focus:outline-none ${
                  isLight ? 'bg-white border-zinc-300 text-zinc-950' : 'bg-zinc-900 border-zinc-700 text-zinc-100'
                }`}
              >
                <option value={0}>0%</option>
                <option value={5}>5%</option>
                <option value={12}>12%</option>
                <option value={18}>18% (Std)</option>
                <option value={28}>28%</option>
              </select>
            </div>
            <span className="font-mono font-bold">
              +₹{bill.taxAmount.toFixed(2)}
            </span>
          </div>

          {/* Discount Selector */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <span className={isLight ? 'text-zinc-600' : 'text-zinc-400'}>Discount:</span>
              <select
                id="select-discount-rate"
                value={discountRate}
                onChange={(e) => setDiscountRate(parseFloat(e.target.value))}
                className={`border font-bold rounded-lg px-2 py-0.5 text-xs focus:outline-none ${
                  isLight ? 'bg-white border-zinc-300 text-zinc-950' : 'bg-zinc-900 border-zinc-700 text-zinc-100'
                }`}
              >
                <option value={0}>None</option>
                <option value={5}>5% Off</option>
                <option value={10}>10% Festive</option>
                <option value={15}>15% VIP</option>
                <option value={20}>20% Special</option>
              </select>
            </div>
            <span className="font-mono font-bold">
              {bill.discountAmount > 0 ? `-₹${bill.discountAmount.toFixed(2)}` : '₹0.00'}
            </span>
          </div>

          {/* Tip / Gratuity */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <span className={isLight ? 'text-zinc-600' : 'text-zinc-400'}>Tip:</span>
              <div className="flex gap-1">
                {[0, 20, 50, 100].map((tip) => (
                  <button
                    key={tip}
                    onClick={() => { sound.playClick(); setTipAmount(tip); }}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition border ${
                      tipAmount === tip 
                        ? (isLight ? 'bg-black text-white border-black' : 'bg-white text-black border-white') 
                        : (isLight ? 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100' : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white')
                    }`}
                  >
                    {tip === 0 ? 'None' : `₹${tip}`}
                  </button>
                ))}
              </div>
            </div>
            <span className="font-mono font-bold">
              ₹{bill.tipAmount.toFixed(2)}
            </span>
          </div>

          {/* Grand Total Box */}
          <div className={`flex items-center justify-between text-sm p-3 rounded-xl mt-2.5 transition-colors ${
            isLight ? 'bg-black text-white' : 'bg-white text-zinc-950'
          }`}>
            <span className="font-black uppercase tracking-wide">
              Total Payable:
            </span>
            <span className="font-mono font-black text-lg">
              ₹{bill.total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Direct Mobile / Email PDF Dispatch Widget */}
      <div className={`border rounded-xl p-3 flex flex-col gap-2 ${
        isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'
      }`}>
        <div className="flex items-center justify-between">
          {/* Tab Selector */}
          <div className={`flex items-center gap-1 p-0.5 rounded-lg border ${
            isLight ? 'bg-zinc-200 border-zinc-300' : 'bg-zinc-900 border-zinc-800'
          }`}>
            <button
              id="tab-dispatch-mobile"
              type="button"
              onClick={() => setDispatchTab('mobile')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition ${
                dispatchTab === 'mobile'
                  ? (isLight ? 'bg-black text-white shadow-xs' : 'bg-white text-black shadow-xs')
                  : (isLight ? 'text-zinc-600 hover:text-black' : 'text-zinc-400 hover:text-white')
              }`}
            >
              <Phone className="w-3 h-3" />
              <span>Mobile PDF</span>
            </button>
            <button
              id="tab-dispatch-email"
              type="button"
              onClick={() => setDispatchTab('email')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition ${
                dispatchTab === 'email'
                  ? (isLight ? 'bg-black text-white shadow-xs' : 'bg-white text-black shadow-xs')
                  : (isLight ? 'text-zinc-600 hover:text-black' : 'text-zinc-400 hover:text-white')
              }`}
            >
              <Mail className="w-3 h-3" />
              <span>Email PDF</span>
            </button>
          </div>
          <span className={`text-[10px] font-mono ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
            {dispatchTab === 'mobile' ? 'Instant Digital SMS/PDF' : 'Digital Invoice Email'}
          </span>
        </div>

        {dispatchTab === 'mobile' ? (
          <form onSubmit={handleQuickSendPDF} className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                +91
              </span>
              <input
                id="input-receipt-mobile"
                type="tel"
                placeholder="10-digit mobile number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className={`w-full border rounded-xl pl-10 pr-2 py-1.5 text-xs font-mono font-bold focus:outline-none focus:ring-1 ${
                  isLight 
                    ? 'bg-white border-zinc-300 text-zinc-950 placeholder-zinc-400 focus:ring-black' 
                    : 'bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:ring-white'
                }`}
              />
            </div>

            <button
              id="btn-quick-send-pdf"
              type="submit"
              disabled={!mobileNumber.trim() || !hasItems || isSendingMobile}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-bold text-xs uppercase tracking-wide rounded-xl shadow-xs transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0 ${
                isLight ? 'bg-black hover:bg-zinc-800 text-white' : 'bg-white hover:bg-zinc-200 text-zinc-950'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingMobile ? 'Sending...' : 'Send PDF'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleQuickSendEmailPDF} className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <Mail className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                id="input-receipt-email"
                type="email"
                placeholder="customer@example.com"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className={`w-full border rounded-xl pl-8 pr-2 py-1.5 text-xs font-mono font-medium focus:outline-none focus:ring-1 ${
                  isLight 
                    ? 'bg-white border-zinc-300 text-zinc-950 placeholder-zinc-400 focus:ring-black' 
                    : 'bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:ring-white'
                }`}
              />
            </div>

            <button
              id="btn-quick-send-email-pdf"
              type="submit"
              disabled={!emailAddress.trim() || !hasItems || isSendingEmail}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-bold text-xs uppercase tracking-wide rounded-xl shadow-xs transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0 ${
                isLight ? 'bg-black hover:bg-zinc-800 text-white' : 'bg-white hover:bg-zinc-200 text-zinc-950'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingEmail ? 'Sending...' : 'Email PDF'}</span>
            </button>
          </form>
        )}

        {sendSuccess && (
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-zinc-900 text-white text-[11px] font-bold animate-fade-in border border-zinc-700">
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
          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wide border disabled:opacity-40 disabled:cursor-not-allowed transition transform active:scale-95 ${
            isLight ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-900' : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-100'
          }`}
        >
          <ReceiptIcon className="w-4 h-4" />
          <span>Receipt</span>
        </button>

        <button
          id="btn-save-pdf"
          onClick={handleDownloadPDF}
          disabled={!hasItems}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wide border disabled:opacity-40 disabled:cursor-not-allowed transition transform active:scale-95 ${
            isLight ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-900' : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-100'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Save PDF</span>
        </button>

        <button
          id="btn-print-bill"
          onClick={handlePrint}
          disabled={!hasItems}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wide border disabled:opacity-40 disabled:cursor-not-allowed transition transform active:scale-95 ${
            isLight ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-900' : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-100'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>Print</span>
        </button>

        <button
          id="btn-send-email-modal"
          onClick={() => { sound.playClick(); onOpenSendModal(); }}
          disabled={!hasItems}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wide border disabled:opacity-40 disabled:cursor-not-allowed transition transform active:scale-95 ${
            isLight ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-900' : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-100'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Send Bill</span>
        </button>

        <button
          id="btn-pay-checkout"
          onClick={() => { sound.playCashRegister(); onOpenPaymentModal(); }}
          disabled={!hasItems}
          className={`col-span-2 sm:col-span-2 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition transform active:scale-95 ${
            isLight ? 'bg-black hover:bg-zinc-800 text-white' : 'bg-white hover:bg-zinc-200 text-zinc-950'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Checkout &amp; Pay (₹{bill.total.toFixed(0)})</span>
        </button>
      </div>

      {/* Realistic Thermal Receipt Preview */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-1.5">
          <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${
            isLight ? 'text-zinc-600' : 'text-zinc-400'
          }`}>
            <FileText className="w-3.5 h-3.5" /> Live Receipt Preview
          </span>
          <span className={`text-[10px] font-mono ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Ref: {bill.billNumber}</span>
        </div>

        {/* Thermal Paper Container */}
        <div 
          ref={receiptRef}
          id="thermal-receipt-preview"
          className="bg-white text-zinc-950 rounded-2xl p-4 font-mono text-[11px] shadow-lg border-2 border-dashed border-zinc-300 relative overflow-hidden select-text"
        >
          {/* Top Header */}
          <div className="text-center pb-2 border-b border-zinc-300">
            <h3 className="font-black text-sm tracking-wider text-zinc-950 uppercase font-serif">
              ZENVORA
            </h3>
            <p className="text-[9px] text-zinc-600">Fine Dining • Cafe • Bakery</p>
            <p className="text-[9px] text-zinc-500">GST: 27AABCR1234F1Z8 | +91 98765 43210</p>
          </div>

          {/* Receipt Info */}
          <div className="py-2 border-b border-zinc-300 space-y-0.5 text-[10px]">
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
          <div className="py-1.5 border-b border-zinc-300 flex justify-between font-black text-zinc-950 text-[10px]">
            <span className="w-1/2 text-left">Item</span>
            <span className="w-1/6 text-center">Qty</span>
            <span className="w-1/6 text-right">Price</span>
            <span className="w-1/6 text-right">Cost</span>
          </div>

          {/* Itemized Rows */}
          <div className="py-1.5 space-y-1 border-b border-zinc-300 max-h-48 overflow-y-auto custom-scrollbar">
            {bill.items.length === 0 ? (
              <div className="py-4 text-center text-zinc-400 italic">
                * No items selected yet *
              </div>
            ) : (
              bill.items.map((orderItem) => (
                <div key={orderItem.item.id} className="flex justify-between text-[10px] leading-tight">
                  <span className="w-1/2 text-left truncate font-bold text-zinc-900">
                    {orderItem.item.name}
                  </span>
                  <span className="w-1/6 text-center text-zinc-600">
                    {orderItem.quantity}
                  </span>
                  <span className="w-1/6 text-right text-zinc-600">
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
          <div className="py-1.5 space-y-0.5 border-b border-zinc-200 text-[9.5px] text-zinc-600">
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
              <div className="flex justify-between text-zinc-700">
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

            <div className="pt-1.5 border-t-2 border-zinc-950 flex justify-between text-xs font-black text-zinc-950">
              <span>TOTAL COST:</span>
              <span>₹{bill.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer & Barcode */}
          <div className="pt-2 border-t border-zinc-300 text-center space-y-1">
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
