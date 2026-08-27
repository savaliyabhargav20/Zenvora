/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { MenuSection } from './components/MenuSection';
import { ReceiptView } from './components/ReceiptView';
import { SendBillModal } from './components/SendBillModal';
import { PaymentModal } from './components/PaymentModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { AddMenuItemModal } from './components/AddMenuItemModal';
import { INITIAL_MENU_ITEMS } from './data/defaultMenu';
import { 
  BillReceipt, 
  Category, 
  MenuItem, 
  OrderItem, 
  OrderType, 
  PaymentMethod, 
  ThemeStyle 
} from './types';
import { sound } from './utils/audio';
import { sendBillPDFToMobile, sendBillPDFToEmail } from './utils/pdfGenerator';

export default function App() {
  // Menu items list (default + custom additions)
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('royal_pos_menu_items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_MENU_ITEMS;
      }
    }
    return INITIAL_MENU_ITEMS;
  });

  // Quantities map: { [itemId]: number }
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Order meta
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [tableNumber, setTableNumber] = useState<string>('T-01');
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [guestEmail, setGuestEmail] = useState<string>('');

  // Tax, discount & tip
  const [taxRate, setTaxRate] = useState<number>(18); // Default 18% matching Python service tax
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [tipAmount, setTipAmount] = useState<number>(0);

  // Active bill reference
  const [billNumber, setBillNumber] = useState<string>(() => `BILL${Math.floor(1000 + Math.random() * 9000)}`);
  const [billDate, setBillDate] = useState<string>(() => new Date().toLocaleDateString('en-GB'));
  const [billTime, setBillTime] = useState<string>(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  // Modals state
  const [isSendModalOpen, setIsSendModalOpen] = useState<boolean>(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState<boolean>(false);
  const [defaultAddCategory, setDefaultAddCategory] = useState<Category>('food');

  // Theme
  const [theme, setTheme] = useState<ThemeStyle>('white-black');

  // Order history
  const [orderHistory, setOrderHistory] = useState<BillReceipt[]>(() => {
    const saved = localStorage.getItem('royal_pos_order_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Save menu items to local storage
  useEffect(() => {
    localStorage.setItem('royal_pos_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);

  // Save order history to local storage
  useEffect(() => {
    localStorage.setItem('royal_pos_order_history', JSON.stringify(orderHistory));
  }, [orderHistory]);

  // Handle quantity changes
  const handleQuantityChange = (itemId: string, qty: number) => {
    setQuantities((prev) => {
      const next = { ...prev };
      if (qty <= 0) {
        delete next[itemId];
      } else {
        next[itemId] = qty;
      }
      return next;
    });
  };

  // Calculate costs by category
  const orderItems: OrderItem[] = useMemo(() => {
    return Object.entries(quantities)
      .map(([id, qty]) => {
        const item = menuItems.find((m) => m.id === id);
        const numericQty = typeof qty === 'number' ? qty : Number(qty);
        if (!item || numericQty <= 0) return null;
        return { item, quantity: numericQty };
      })
      .filter((i): i is OrderItem => i !== null);
  }, [quantities, menuItems]);

  const costOfFood = useMemo(() => {
    return orderItems
      .filter((i) => i.item.category === 'food')
      .reduce((sum, i) => sum + i.quantity * i.item.price, 0);
  }, [orderItems]);

  const costOfDrinks = useMemo(() => {
    return orderItems
      .filter((i) => i.item.category === 'drinks')
      .reduce((sum, i) => sum + i.quantity * i.item.price, 0);
  }, [orderItems]);

  const costOfCakes = useMemo(() => {
    return orderItems
      .filter((i) => i.item.category === 'cakes')
      .reduce((sum, i) => sum + i.quantity * i.item.price, 0);
  }, [orderItems]);

  const costOfCustom = useMemo(() => {
    return orderItems
      .filter((i) => i.item.category === 'custom')
      .reduce((sum, i) => sum + i.quantity * i.item.price, 0);
  }, [orderItems]);

  const subtotal = useMemo(() => {
    return costOfFood + costOfDrinks + costOfCakes + costOfCustom;
  }, [costOfFood, costOfDrinks, costOfCakes, costOfCustom]);

  const discountAmount = useMemo(() => {
    return (subtotal * discountRate) / 100;
  }, [subtotal, discountRate]);

  const taxAmount = useMemo(() => {
    const discountedBase = Math.max(0, subtotal - discountAmount);
    return (discountedBase * taxRate) / 100;
  }, [subtotal, discountAmount, taxRate]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + taxAmount + tipAmount);
  }, [subtotal, discountAmount, taxAmount, tipAmount]);

  // Construct current BillReceipt object
  const currentBill: BillReceipt = useMemo(() => {
    return {
      id: billNumber,
      billNumber,
      date: billDate,
      time: billTime,
      orderType,
      customer: {
        name: guestName,
        phone: guestPhone,
        email: guestEmail,
        tableNumber: orderType === 'dine-in' ? tableNumber : '',
      },
      items: orderItems,
      costOfFood,
      costOfDrinks,
      costOfCakes,
      costOfCustom,
      subtotal,
      taxRate,
      taxAmount,
      discountRate,
      discountAmount,
      tipAmount,
      total: grandTotal,
      paymentMethod: 'upi',
      paymentStatus: 'pending',
    };
  }, [
    billNumber,
    billDate,
    billTime,
    orderType,
    guestName,
    guestPhone,
    guestEmail,
    tableNumber,
    orderItems,
    costOfFood,
    costOfDrinks,
    costOfCakes,
    costOfCustom,
    subtotal,
    taxRate,
    taxAmount,
    discountRate,
    discountAmount,
    tipAmount,
    grandTotal,
  ]);

  // Actions
  const handleGenerateReceipt = () => {
    const newBillNum = `BILL${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    setBillNumber(newBillNum);
    setBillDate(now.toLocaleDateString('en-GB'));
    setBillTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    sound.playCashRegister();
  };

  const handleReset = () => {
    setQuantities({});
    setDiscountRate(0);
    setTipAmount(0);
    setGuestName('');
    const newBillNum = `BILL${Math.floor(1000 + Math.random() * 9000)}`;
    setBillNumber(newBillNum);
    sound.playClick();
  };

  const handleAddCustomItem = (newItem: MenuItem) => {
    setMenuItems((prev) => [newItem, ...prev]);
    // Automatically select 1 quantity
    handleQuantityChange(newItem.id, 1);
  };

  const handleCompletePayment = (method: PaymentMethod) => {
    const completedBill: BillReceipt = {
      ...currentBill,
      paymentMethod: method,
      paymentStatus: 'paid',
    };
    setOrderHistory((prev) => [completedBill, ...prev]);
  };

  const handleViewReceiptFromHistory = (bill: BillReceipt) => {
    setBillNumber(bill.billNumber);
    setBillDate(bill.date);
    setBillTime(bill.time);
    setOrderType(bill.orderType);
    setGuestName(bill.customer.name);
    setTableNumber(bill.customer.tableNumber);
    setTaxRate(bill.taxRate);
    setDiscountRate(bill.discountRate);
    setTipAmount(bill.tipAmount);

    const reconstructedQty: Record<string, number> = {};
    bill.items.forEach((item) => {
      reconstructedQty[item.item.id] = item.quantity;
    });
    setQuantities(reconstructedQty);
  };

  const handleSendPDFToPhone = async (phone: string) => {
    if (!phone.trim() || orderItems.length === 0) return;
    await sendBillPDFToMobile(currentBill, phone);
  };

  const handleSendPDFToEmail = async (email: string) => {
    if (!email.trim() || orderItems.length === 0) return;
    await sendBillPDFToEmail(currentBill, email);
  };

  const themeClasses = useMemo(() => {
    switch (theme) {
      case 'white-black':
        return 'bg-zinc-100 text-zinc-950 selection:bg-zinc-950 selection:text-white';
      case 'black-white':
        return 'bg-zinc-950 text-zinc-100 selection:bg-white selection:text-zinc-950';
      case 'slate':
        return 'bg-slate-900 text-slate-100 selection:bg-white selection:text-slate-950';
      default:
        return 'bg-zinc-100 text-zinc-950 selection:bg-zinc-950 selection:text-white';
    }
  }, [theme]);

  return (
    <div className={`min-h-screen ${themeClasses} flex flex-col font-sans transition-colors duration-200`}>
      {/* Header Bar */}
      <Header
        orderType={orderType}
        setOrderType={setOrderType}
        tableNumber={tableNumber}
        setTableNumber={setTableNumber}
        guestName={guestName}
        setGuestName={setGuestName}
        guestPhone={guestPhone}
        setGuestPhone={setGuestPhone}
        guestEmail={guestEmail}
        setGuestEmail={setGuestEmail}
        onSendPDFToPhone={handleSendPDFToPhone}
        onSendPDFToEmail={handleSendPDFToEmail}
        onReset={handleReset}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenAddItem={() => {
          setDefaultAddCategory('food');
          setIsAddItemModalOpen(true);
        }}
        theme={theme}
        setTheme={setTheme}
        orderCount={orderItems.reduce((s, i) => s + i.quantity, 0)}
      />

      {/* Main Bento Responsive Grid Layout */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-3 sm:p-4 md:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
        {/* Left Side: Multi-Category Menu Grid in One Line (Food, Drinks, Cakes) */}
        <section className="lg:col-span-8 flex flex-col gap-4">
          <MenuSection
            menuItems={menuItems}
            quantities={quantities}
            onQuantityChange={handleQuantityChange}
            onOpenAddItem={(cat) => {
              setDefaultAddCategory(cat || 'food');
              setIsAddItemModalOpen(true);
            }}
            costOfFood={costOfFood}
            costOfDrinks={costOfDrinks}
            costOfCakes={costOfCakes}
            theme={theme}
          />
        </section>

        {/* Right Side: Live Bill Receipt & Billing Breakdown */}
        <section className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
          {/* Billing Cost Breakdown & Live Printable Receipt Preview */}
          <ReceiptView
            bill={currentBill}
            onGenerateReceipt={handleGenerateReceipt}
            onOpenSendModal={() => setIsSendModalOpen(true)}
            onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
            onReset={handleReset}
            taxRate={taxRate}
            setTaxRate={setTaxRate}
            discountRate={discountRate}
            setDiscountRate={setDiscountRate}
            tipAmount={tipAmount}
            setTipAmount={setTipAmount}
            hasItems={orderItems.length > 0}
            theme={theme}
          />
        </section>
      </main>

      {/* Modals */}
      <SendBillModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        bill={currentBill}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        bill={currentBill}
        onCompletePayment={handleCompletePayment}
      />

      <OrderHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={orderHistory}
        onClearHistory={() => setOrderHistory([])}
        onViewReceipt={handleViewReceiptFromHistory}
      />

      <AddMenuItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        onAddItem={handleAddCustomItem}
        defaultCategory={defaultAddCategory}
      />
    </div>
  );
}
