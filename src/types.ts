export type Category = 'food' | 'drinks' | 'cakes' | 'custom';

export interface MenuItem {
  id: string;
  name: string;
  category: Category;
  price: number;
  icon?: string;
  description?: string;
  isVeg?: boolean;
}

export interface OrderItem {
  item: MenuItem;
  quantity: number;
}

export type OrderType = 'dine-in' | 'takeaway' | 'delivery';

export type PaymentMethod = 'cash' | 'upi' | 'card' | 'split';

export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  tableNumber: string;
}

export interface BillReceipt {
  id: string;
  billNumber: string;
  date: string;
  time: string;
  orderType: OrderType;
  customer: CustomerInfo;
  items: OrderItem[];
  costOfFood: number;
  costOfDrinks: number;
  costOfCakes: number;
  costOfCustom: number;
  subtotal: number;
  taxRate: number; // percentage, e.g. 18
  taxAmount: number;
  discountRate: number; // percentage
  discountAmount: number;
  tipAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'pending';
  notes?: string;
}

export type ThemeStyle = 'white-black' | 'black-white' | 'slate';
