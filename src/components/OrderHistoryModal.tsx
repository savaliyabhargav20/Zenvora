import React, { useState } from 'react';
import { 
  X, 
  History, 
  Search, 
  Download, 
  Trash2, 
  FileSpreadsheet,
  Eye
} from 'lucide-react';
import { BillReceipt } from '../types';
import { generateBillPDF } from '../utils/pdfGenerator';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: BillReceipt[];
  onClearHistory: () => void;
  onViewReceipt: (bill: BillReceipt) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  onViewReceipt,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!isOpen) return null;

  const totalRevenue = history.reduce((sum, b) => sum + b.total, 0);
  const totalItemsSold = history.reduce((sum, b) => sum + b.items.reduce((s, i) => s + i.quantity, 0), 0);
  const avgOrderValue = history.length > 0 ? (totalRevenue / history.length) : 0;

  const filteredHistory = history.filter((b) => {
    const term = searchTerm.toLowerCase();
    return (
      b.billNumber.toLowerCase().includes(term) ||
      b.date.toLowerCase().includes(term) ||
      b.customer.name.toLowerCase().includes(term) ||
      b.customer.tableNumber.toLowerCase().includes(term)
    );
  });

  const exportToCSV = () => {
    if (history.length === 0) return;

    const headers = ['Bill Number', 'Date', 'Time', 'Order Type', 'Customer', 'Table', 'Items Count', 'Subtotal', 'Tax', 'Discount', 'Tip', 'Total', 'Payment Method', 'Status'];
    const rows = history.map((b) => [
      b.billNumber,
      b.date,
      b.time,
      b.orderType,
      `"${b.customer.name || 'Walk-in'}"`,
      `"${b.customer.tableNumber || 'N/A'}"`,
      b.items.reduce((sum, i) => sum + i.quantity, 0),
      b.subtotal.toFixed(2),
      b.taxAmount.toFixed(2),
      b.discountAmount.toFixed(2),
      b.tipAmount.toFixed(2),
      b.total.toFixed(2),
      b.paymentMethod,
      b.paymentStatus,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sales_register_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white border border-zinc-300 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden text-zinc-950 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-zinc-50 p-4 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-black text-white font-black shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-black text-base text-zinc-950 uppercase tracking-wide">
                Sales Register &amp; Order History
              </h3>
              <p className="text-xs text-zinc-500">Past Invoices, Analytics &amp; CSV Export</p>
            </div>
          </div>
          <button
            id="btn-close-history-modal"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-black transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="p-4 bg-zinc-50 border-b border-zinc-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-xs">
            <span className="text-[11px] text-zinc-500 font-bold block">Total Revenue</span>
            <span className="text-lg font-black text-zinc-950 font-mono">
              ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-xs">
            <span className="text-[11px] text-zinc-500 font-bold block">Total Orders</span>
            <span className="text-lg font-black text-zinc-950 font-mono">
              {history.length}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-xs">
            <span className="text-[11px] text-zinc-500 font-bold block">Items Sold</span>
            <span className="text-lg font-black text-zinc-950 font-mono">
              {totalItemsSold}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-xs">
            <span className="text-[11px] text-zinc-500 font-bold block">Avg Ticket Size</span>
            <span className="text-lg font-black text-zinc-950 font-mono">
              ₹{avgOrderValue.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="p-4 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              id="input-search-history"
              type="text"
              placeholder="Search by Bill #, Table, Guest name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-zinc-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-export-csv"
              onClick={exportToCSV}
              disabled={history.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-zinc-800 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            {history.length > 0 && (
              <button
                id="btn-clear-history"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all order history?')) {
                    onClearHistory();
                  }
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-700 text-xs font-semibold rounded-xl transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
          {filteredHistory.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 text-xs">
              No saved orders in register yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 uppercase text-[10px] font-bold">
                    <th className="py-2.5 px-3">Bill Ref</th>
                    <th className="py-2.5 px-3">Date / Time</th>
                    <th className="py-2.5 px-3">Guest / Table</th>
                    <th className="py-2.5 px-3">Items</th>
                    <th className="py-2.5 px-3">Payment</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                    <th className="py-2.5 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 font-medium">
                  {filteredHistory.map((bill) => (
                    <tr key={bill.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-zinc-950">
                        {bill.billNumber}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-700">
                        {bill.date} <span className="text-zinc-500">{bill.time}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-zinc-900 font-semibold">{bill.customer.name || 'Walk-in'}</span>
                        {bill.customer.tableNumber && (
                          <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-100 text-zinc-900 font-mono border border-zinc-200">
                            {bill.customer.tableNumber}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-600">
                        {bill.items.reduce((s, i) => s + i.quantity, 0)} items
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-zinc-100 text-zinc-900 border border-zinc-300">
                          {bill.paymentMethod}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-zinc-950 text-sm">
                        ₹{bill.total.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            id={`btn-view-${bill.id}`}
                            onClick={() => { onViewReceipt(bill); onClose(); }}
                            title="View & Load in Preview"
                            className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition border border-zinc-200"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-pdf-${bill.id}`}
                            onClick={() => generateBillPDF(bill)}
                            title="Download PDF"
                            className="p-1.5 rounded-lg bg-black hover:bg-zinc-800 text-white transition shadow-xs"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
