import React, { useState, useEffect } from 'react';
import { 
  UtensilsCrossed, 
  Clock, 
  History, 
  PlusCircle, 
  Sparkles,
  ShoppingBag,
  Bike,
  Armchair,
  Phone,
  Mail,
  Send,
  FileCheck
} from 'lucide-react';
import { OrderType, ThemeStyle } from '../types';

interface HeaderProps {
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  tableNumber: string;
  setTableNumber: (t: string) => void;
  guestName: string;
  setGuestName: (n: string) => void;
  guestPhone: string;
  setGuestPhone: (p: string) => void;
  guestEmail: string;
  setGuestEmail: (e: string) => void;
  onSendPDFToPhone?: (phone: string) => void;
  onSendPDFToEmail?: (email: string) => void;
  onReset?: () => void;
  onOpenHistory: () => void;
  onOpenAddItem: () => void;
  theme?: ThemeStyle;
  setTheme?: (t: ThemeStyle) => void;
  orderCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  orderType,
  setOrderType,
  tableNumber,
  setTableNumber,
  guestName,
  setGuestName,
  guestPhone,
  setGuestPhone,
  guestEmail,
  setGuestEmail,
  onSendPDFToPhone,
  onSendPDFToEmail,
  onOpenHistory,
  onOpenAddItem,
  theme = 'white-black',
  orderCount,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [sentToast, setSentToast] = useState<string | null>(null);

  const handleTriggerSendPDF = () => {
    if (!guestPhone.trim()) return;
    if (onSendPDFToPhone) {
      onSendPDFToPhone(guestPhone);
      setSentToast(`PDF sent to +${guestPhone}`);
      setTimeout(() => setSentToast(null), 3000);
    }
  };

  const handleTriggerSendEmailPDF = () => {
    if (!guestEmail.trim()) return;
    if (onSendPDFToEmail) {
      onSendPDFToEmail(guestEmail);
      setSentToast(`PDF sent to ${guestEmail}`);
      setTimeout(() => setSentToast(null), 3000);
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isLight = theme === 'white-black';

  return (
    <header className={`w-full transition-colors duration-200 ${
      isLight 
        ? 'bg-white text-zinc-950 border-b border-zinc-200 shadow-xs' 
        : 'bg-zinc-950 text-zinc-100 border-b border-zinc-800 shadow-xl'
    }`}>
      {/* Top Bar with brand & real-time clock */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md transition-colors ${
            isLight ? 'bg-black text-white' : 'bg-white text-zinc-950 ring-1 ring-zinc-300'
          }`}>
            <UtensilsCrossed className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-xl sm:text-2xl font-black tracking-wider uppercase font-serif ${
                isLight ? 'text-zinc-950' : 'text-zinc-100'
              }`}>
                ZENVORA
              </h1>
              <span className={`hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                isLight ? 'bg-zinc-100 text-zinc-900 border-zinc-300' : 'bg-zinc-900 text-zinc-200 border-zinc-700'
              }`}>
                <Sparkles className="w-3 h-3" /> Dining &amp; Cafe
              </span>
            </div>
            <p className={`text-xs font-medium flex items-center gap-1 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Billing System &amp; Multi-Category Menu Register
            </p>
          </div>
        </div>

        {/* Live Clock & Quick Controls */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* Clock pill */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono shadow-xs ${
            isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-300'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{currentDate}</span>
            <span className="opacity-40">•</span>
            <span className="font-bold">{currentTime}</span>
          </div>

          {/* New Item */}
          <button
            id="btn-add-item-header"
            onClick={() => onOpenAddItem()}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-bold text-xs rounded-xl shadow-sm transition transform active:scale-95 ${
              isLight ? 'bg-black hover:bg-zinc-800 text-white' : 'bg-white hover:bg-zinc-200 text-zinc-950'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Add Item</span>
          </button>

          {/* History */}
          <button
            id="btn-order-history"
            onClick={() => onOpenHistory()}
            className={`flex items-center gap-1.5 px-3 py-1.5 border font-semibold text-xs rounded-xl transition shadow-xs ${
              isLight ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-800' : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>History</span>
          </button>
        </div>
      </div>

      {/* Sub-bar with Order Type (Dine-in, Takeaway, Delivery) and Guest / Table details */}
      <div className={`border-t px-4 sm:px-6 py-2.5 transition-colors ${
        isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/90 border-zinc-800'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Order Type Tabs */}
          <div className={`flex items-center gap-1 p-1 rounded-xl border ${
            isLight ? 'bg-zinc-200/80 border-zinc-300' : 'bg-zinc-950 border-zinc-800'
          }`}>
            <button
              id="order-type-dine-in"
              onClick={() => setOrderType('dine-in')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                orderType === 'dine-in'
                  ? (isLight ? 'bg-black text-white shadow-xs font-black' : 'bg-white text-black shadow-xs font-black')
                  : (isLight ? 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800')
              }`}
            >
              <Armchair className="w-3.5 h-3.5" />
              <span>Dine-in</span>
            </button>
            <button
              id="order-type-takeaway"
              onClick={() => setOrderType('takeaway')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                orderType === 'takeaway'
                  ? (isLight ? 'bg-black text-white shadow-xs font-black' : 'bg-white text-black shadow-xs font-black')
                  : (isLight ? 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800')
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Takeaway</span>
            </button>
            <button
              id="order-type-delivery"
              onClick={() => setOrderType('delivery')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                orderType === 'delivery'
                  ? (isLight ? 'bg-black text-white shadow-xs font-black' : 'bg-white text-black shadow-xs font-black')
                  : (isLight ? 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800')
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Delivery</span>
            </button>
          </div>

          {/* Guest / Table Inputs */}
          <div className="flex items-center flex-wrap gap-2">
            {orderType === 'dine-in' && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border ${
                isLight ? 'bg-white border-zinc-300' : 'bg-zinc-950 border-zinc-800'
              }`}>
                <span className="text-zinc-500 font-medium">Table:</span>
                <input
                  id="input-table-number"
                  type="text"
                  placeholder="T-01"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className={`w-16 rounded-lg px-2 py-0.5 font-bold text-center focus:outline-none focus:ring-1 border ${
                    isLight ? 'bg-zinc-100 border-zinc-300 text-zinc-950 focus:ring-black' : 'bg-zinc-900 border-zinc-700 text-zinc-100 focus:ring-white'
                  }`}
                />
              </div>
            )}

            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border ${
              isLight ? 'bg-white border-zinc-300' : 'bg-zinc-950 border-zinc-800'
            }`}>
              <span className="text-zinc-500 font-medium">Guest:</span>
              <input
                id="input-guest-name"
                type="text"
                placeholder="Walk-in Guest"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className={`w-24 sm:w-32 rounded-lg px-2 py-0.5 font-medium focus:outline-none focus:ring-1 border ${
                  isLight ? 'bg-zinc-100 border-zinc-300 text-zinc-950 placeholder-zinc-400 focus:ring-black' : 'bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:ring-white'
                }`}
              />
            </div>

            {/* Customer Mobile Number & Send PDF Trigger */}
            <div className={`flex items-center gap-1 pl-2 pr-1 py-1 rounded-xl border ${
              isLight ? 'bg-white border-zinc-300' : 'bg-zinc-950 border-zinc-800'
            }`}>
              <Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <input
                id="input-guest-phone"
                type="tel"
                placeholder="Mobile # (PDF)"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTriggerSendPDF();
                  }
                }}
                className={`w-28 sm:w-36 rounded-lg px-2 py-0.5 font-mono text-xs focus:outline-none focus:ring-1 border ${
                  isLight ? 'bg-zinc-100 border-zinc-300 text-zinc-950 placeholder-zinc-400 focus:ring-black' : 'bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:ring-white'
                }`}
              />
              <button
                id="btn-header-send-pdf"
                onClick={handleTriggerSendPDF}
                disabled={!guestPhone.trim() || orderCount === 0}
                title="Send Bill in PDF format to this mobile number"
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg font-bold text-xs transition disabled:opacity-40 disabled:cursor-not-allowed shadow-xs ${
                  isLight ? 'bg-black hover:bg-zinc-800 text-white' : 'bg-white hover:bg-zinc-200 text-black'
                }`}
              >
                <Send className="w-3 h-3" />
                <span>PDF</span>
              </button>
            </div>

            {/* Customer Email & Send PDF Trigger */}
            <div className={`flex items-center gap-1 pl-2 pr-1 py-1 rounded-xl border ${
              isLight ? 'bg-white border-zinc-300' : 'bg-zinc-950 border-zinc-800'
            }`}>
              <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <input
                id="input-guest-email"
                type="email"
                placeholder="Email (PDF)"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTriggerSendEmailPDF();
                  }
                }}
                className={`w-28 sm:w-36 rounded-lg px-2 py-0.5 font-mono text-xs focus:outline-none focus:ring-1 border ${
                  isLight ? 'bg-zinc-100 border-zinc-300 text-zinc-950 placeholder-zinc-400 focus:ring-black' : 'bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:ring-white'
                }`}
              />
              <button
                id="btn-header-send-email-pdf"
                onClick={handleTriggerSendEmailPDF}
                disabled={!guestEmail.trim() || orderCount === 0}
                title="Send Bill in PDF format to this email"
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg font-bold text-xs transition disabled:opacity-40 disabled:cursor-not-allowed shadow-xs ${
                  isLight ? 'bg-zinc-800 hover:bg-black text-white' : 'bg-zinc-200 hover:bg-white text-black'
                }`}
              >
                <Send className="w-3 h-3" />
                <span>Email</span>
              </button>
            </div>

            {sentToast && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-zinc-900 text-white font-bold text-xs animate-fade-in shadow-md border border-zinc-700">
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{sentToast}</span>
              </div>
            )}

            {orderCount > 0 && (
              <div className={`flex items-center gap-1 font-black px-2.5 py-1 rounded-xl shadow-xs ${
                isLight ? 'bg-black text-white' : 'bg-white text-black'
              }`}>
                <span>{orderCount} item{orderCount > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
