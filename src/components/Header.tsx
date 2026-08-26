import React, { useState, useEffect } from 'react';
import { 
  UtensilsCrossed, 
  Clock, 
  Volume2, 
  VolumeX, 
  History, 
  PlusCircle, 
  RotateCcw, 
  Palette,
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
import { sound } from '../utils/audio';

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
  onReset: () => void;
  onOpenHistory: () => void;
  onOpenAddItem: () => void;
  theme: ThemeStyle;
  setTheme: (t: ThemeStyle) => void;
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
  onReset,
  onOpenHistory,
  onOpenAddItem,
  theme,
  setTheme,
  orderCount,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());
  const [sentToast, setSentToast] = useState<string | null>(null);

  const handleTriggerSendPDF = () => {
    if (!guestPhone.trim()) return;
    sound.playClick();
    if (onSendPDFToPhone) {
      onSendPDFToPhone(guestPhone);
      setSentToast(`PDF sent to +${guestPhone}`);
      setTimeout(() => setSentToast(null), 3000);
    }
  };

  const handleTriggerSendEmailPDF = () => {
    if (!guestEmail.trim()) return;
    sound.playClick();
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

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
    if (!next) sound.playClick();
  };

  const getThemeBadge = (t: ThemeStyle) => {
    switch (t) {
      case 'crimson': return 'bg-red-700 text-yellow-300 border-red-800';
      case 'emerald': return 'bg-emerald-700 text-emerald-100 border-emerald-800';
      case 'amber': return 'bg-amber-600 text-amber-50 border-amber-700';
      case 'slate': return 'bg-slate-800 text-cyan-300 border-slate-700';
    }
  };

  return (
    <header className="w-full bg-zinc-900/90 backdrop-blur-md text-zinc-100 border-b border-zinc-800/90 shadow-xl">
      {/* Top Bar with brand & real-time clock */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-amber-400 to-amber-500 text-zinc-950 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-1 ring-amber-300/50">
            <UtensilsCrossed className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-wider text-zinc-100 uppercase font-serif flex items-center gap-2">
                <span>ROYAL DINER</span>
                <span className="text-amber-400">&amp; CAFE</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30">
                <Sparkles className="w-3 h-3 text-amber-400" /> Bento POS
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-medium flex items-center gap-1">
              Billing System &amp; Multi-Category Menu Register
            </p>
          </div>
        </div>

        {/* Live Clock & Quick Controls */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* Clock pill */}
          <div className="flex items-center gap-2 bg-zinc-950/80 px-3 py-1.5 rounded-xl border border-zinc-800 text-xs font-mono text-amber-300 shadow-inner">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{currentDate}</span>
            <span className="text-zinc-600">•</span>
            <span className="font-bold text-zinc-100">{currentTime}</span>
          </div>

          {/* Sound Toggle */}
          <button
            id="btn-toggle-sound"
            onClick={toggleSound}
            title={isMuted ? 'Unmute audio effects' : 'Mute audio effects'}
            className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/60 text-amber-300 transition-colors shadow-xs"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-zinc-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Theme Selector Dropdown */}
          <div className="relative group">
            <button
              id="btn-theme-menu"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/60 text-xs font-semibold text-amber-300 transition-colors shadow-xs"
            >
              <Palette className="w-3.5 h-3.5" />
              <span className="capitalize hidden md:inline">{theme}</span>
            </button>
            <div className="absolute right-0 mt-1 w-32 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-1.5 hidden group-hover:block z-50">
              <div className="text-[10px] uppercase font-bold text-zinc-400 px-2 py-1">Theme</div>
              {(['crimson', 'emerald', 'amber', 'slate'] as ThemeStyle[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded-lg font-medium capitalize flex items-center justify-between ${
                    theme === t ? 'bg-amber-400 text-zinc-950 font-bold' : 'text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  {t}
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    t === 'crimson' ? 'bg-rose-500' : t === 'emerald' ? 'bg-emerald-500' : t === 'amber' ? 'bg-amber-500' : 'bg-slate-500'
                  }`} />
                </button>
              ))}
            </div>
          </div>

          {/* New Item */}
          <button
            id="btn-add-item-header"
            onClick={() => { sound.playClick(); onOpenAddItem(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs rounded-xl shadow-md shadow-amber-400/20 transition transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Add Item</span>
          </button>

          {/* History */}
          <button
            id="btn-order-history"
            onClick={() => { sound.playClick(); onOpenHistory(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 hover:text-white font-semibold text-xs rounded-xl transition shadow-xs"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span>History</span>
          </button>

          {/* Reset */}
          <button
            id="btn-reset-order-header"
            onClick={() => { sound.playClick(); onReset(); }}
            title="Clear all selected items"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 text-xs rounded-xl transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Sub-bar with Order Type (Dine-in, Takeaway, Delivery) and Guest / Table details */}
      <div className="bg-zinc-950/80 border-t border-zinc-800/80 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Order Type Tabs */}
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              id="order-type-dine-in"
              onClick={() => { sound.playClick(); setOrderType('dine-in'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                orderType === 'dine-in'
                  ? 'bg-amber-400 text-zinc-950 shadow-md font-extrabold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <Armchair className="w-3.5 h-3.5" />
              <span>Dine-in</span>
            </button>
            <button
              id="order-type-takeaway"
              onClick={() => { sound.playClick(); setOrderType('takeaway'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                orderType === 'takeaway'
                  ? 'bg-amber-400 text-zinc-950 shadow-md font-extrabold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Takeaway</span>
            </button>
            <button
              id="order-type-delivery"
              onClick={() => { sound.playClick(); setOrderType('delivery'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                orderType === 'delivery'
                  ? 'bg-amber-400 text-zinc-950 shadow-md font-extrabold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Delivery</span>
            </button>
          </div>

          {/* Guest / Table Inputs */}
          <div className="flex items-center flex-wrap gap-2">
            {orderType === 'dine-in' && (
              <div className="flex items-center gap-1.5 bg-zinc-900/90 px-2.5 py-1 rounded-xl border border-zinc-800">
                <span className="text-zinc-400 font-medium">Table #:</span>
                <input
                  id="input-table-number"
                  type="text"
                  placeholder="T-01"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-16 bg-zinc-950 border border-zinc-700/80 rounded-lg px-2 py-0.5 text-amber-400 font-bold focus:outline-none focus:ring-1 focus:ring-amber-400 text-center"
                />
              </div>
            )}

            <div className="flex items-center gap-1.5 bg-zinc-900/90 px-2.5 py-1 rounded-xl border border-zinc-800">
              <span className="text-zinc-400 font-medium">Guest:</span>
              <input
                id="input-guest-name"
                type="text"
                placeholder="Walk-in Guest"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-24 sm:w-32 bg-zinc-950 border border-zinc-700/80 rounded-lg px-2 py-0.5 text-zinc-100 placeholder-zinc-500 font-medium focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            {/* Customer Mobile Number & Send PDF Trigger */}
            <div className="flex items-center gap-1 bg-zinc-900/90 pl-2 pr-1 py-1 rounded-xl border border-zinc-800">
              <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <input
                id="input-guest-phone"
                type="tel"
                placeholder="Mobile # (Send PDF)"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTriggerSendPDF();
                  }
                }}
                className="w-28 sm:w-36 bg-zinc-950 border border-zinc-700/80 rounded-lg px-2 py-0.5 text-amber-300 placeholder-zinc-500 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
              <button
                id="btn-header-send-pdf"
                onClick={handleTriggerSendPDF}
                disabled={!guestPhone.trim() || orderCount === 0}
                title="Send Bill in PDF format to this mobile number"
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs transition disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              >
                <Send className="w-3 h-3" />
                <span>PDF</span>
              </button>
            </div>

            {/* Customer Email & Send PDF Trigger */}
            <div className="flex items-center gap-1 bg-zinc-900/90 pl-2 pr-1 py-1 rounded-xl border border-zinc-800">
              <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <input
                id="input-guest-email"
                type="email"
                placeholder="Email (Send PDF)"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTriggerSendEmailPDF();
                  }
                }}
                className="w-28 sm:w-36 bg-zinc-950 border border-zinc-700/80 rounded-lg px-2 py-0.5 text-sky-300 placeholder-zinc-500 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
              <button
                id="btn-header-send-email-pdf"
                onClick={handleTriggerSendEmailPDF}
                disabled={!guestEmail.trim() || orderCount === 0}
                title="Send Bill in PDF format to this email"
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-400 hover:bg-sky-300 text-zinc-950 font-black text-xs transition disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              >
                <Send className="w-3 h-3" />
                <span>Email PDF</span>
              </button>
            </div>

            {sentToast && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-950/90 border border-emerald-600 text-emerald-300 font-bold text-xs animate-fade-in shadow-md">
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{sentToast}</span>
              </div>
            )}

            {orderCount > 0 && (
              <div className="flex items-center gap-1 bg-amber-400 text-zinc-950 font-black px-2.5 py-1 rounded-xl shadow-md shadow-amber-400/10">
                <span>{orderCount} item{orderCount > 1 ? 's' : ''} in cart</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
