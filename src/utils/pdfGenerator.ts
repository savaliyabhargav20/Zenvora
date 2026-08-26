import jsPDF from 'jspdf';
import { BillReceipt } from '../types';

export function createBillPDFDoc(bill: BillReceipt, restaurantName = 'ROYAL DINER & CAFE'): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, Math.max(180, 160 + bill.items.length * 7)], // 80mm thermal receipt format
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 10;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(restaurantName, pageWidth / 2, y, { align: 'center' });

  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Fine Dining • Cafe • Bakery', pageWidth / 2, y, { align: 'center' });

  y += 3.5;
  doc.text('GSTIN: 27AABCR1234F1Z8 | Ph: +91 98765 43210', pageWidth / 2, y, { align: 'center' });

  y += 3;
  doc.setLineDashPattern([1, 1], 0);
  doc.line(5, y, pageWidth - 5, y);
  doc.setLineDashPattern([], 0);

  y += 4.5;
  doc.setFontSize(8);
  doc.text(`Receipt Ref: ${bill.billNumber}`, 6, y);
  doc.text(`Date: ${bill.date}`, pageWidth - 6, y, { align: 'right' });

  y += 3.8;
  doc.text(`Time: ${bill.time}`, 6, y);
  doc.text(`Order: ${bill.orderType.toUpperCase()}`, pageWidth - 6, y, { align: 'right' });

  if (bill.customer.name || bill.customer.tableNumber || bill.customer.phone) {
    y += 3.8;
    const details = [
      bill.customer.name ? `Guest: ${bill.customer.name}` : '',
      bill.customer.tableNumber ? `Table: ${bill.customer.tableNumber}` : '',
      bill.customer.phone ? `Mob: ${bill.customer.phone}` : '',
    ].filter(Boolean).join(' | ');
    doc.text(details, 6, y);
  }

  y += 3;
  doc.line(5, y, pageWidth - 5, y);

  // Table Headers
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Item', 6, y);
  doc.text('Qty', 44, y, { align: 'center' });
  doc.text('Price', 56, y, { align: 'right' });
  doc.text('Total', pageWidth - 6, y, { align: 'right' });

  y += 2;
  doc.line(5, y, pageWidth - 5, y);

  // Items
  doc.setFont('helvetica', 'normal');
  bill.items.forEach((orderItem) => {
    y += 4.2;
    const name = orderItem.item.name.length > 18 
      ? orderItem.item.name.substring(0, 16) + '..' 
      : orderItem.item.name;
    const lineTotal = orderItem.quantity * orderItem.item.price;

    doc.text(name, 6, y);
    doc.text(String(orderItem.quantity), 44, y, { align: 'center' });
    doc.text(`₹${orderItem.item.price}`, 56, y, { align: 'right' });
    doc.text(`₹${lineTotal}`, pageWidth - 6, y, { align: 'right' });
  });

  y += 3;
  doc.line(5, y, pageWidth - 5, y);

  // Category breakdown
  y += 4;
  doc.setFontSize(7.5);
  if (bill.costOfFood > 0) {
    doc.text('Cost of Food:', 6, y);
    doc.text(`₹${bill.costOfFood.toFixed(2)}`, pageWidth - 6, y, { align: 'right' });
    y += 3.2;
  }
  if (bill.costOfDrinks > 0) {
    doc.text('Cost of Drinks:', 6, y);
    doc.text(`₹${bill.costOfDrinks.toFixed(2)}`, pageWidth - 6, y, { align: 'right' });
    y += 3.2;
  }
  if (bill.costOfCakes > 0) {
    doc.text('Cost of Cakes:', 6, y);
    doc.text(`₹${bill.costOfCakes.toFixed(2)}`, pageWidth - 6, y, { align: 'right' });
    y += 3.2;
  }

  y += 1;
  doc.line(5, y, pageWidth - 5, y);

  // Subtotal and Totals
  y += 4;
  doc.setFontSize(8);
  doc.text('Sub Total:', 6, y);
  doc.text(`₹${bill.subtotal.toFixed(2)}`, pageWidth - 6, y, { align: 'right' });

  if (bill.discountAmount > 0) {
    y += 3.6;
    doc.text(`Discount (${bill.discountRate}%):`, 6, y);
    doc.text(`-₹${bill.discountAmount.toFixed(2)}`, pageWidth - 6, y, { align: 'right' });
  }

  y += 3.6;
  doc.text(`Service Tax / GST (${bill.taxRate}%):`, 6, y);
  doc.text(`₹${bill.taxAmount.toFixed(2)}`, pageWidth - 6, y, { align: 'right' });

  if (bill.tipAmount > 0) {
    y += 3.6;
    doc.text('Gratuity / Tip:', 6, y);
    doc.text(`₹${bill.tipAmount.toFixed(2)}`, pageWidth - 6, y, { align: 'right' });
  }

  y += 2;
  doc.setLineWidth(0.4);
  doc.line(5, y, pageWidth - 5, y);
  doc.setLineWidth(0.2);

  y += 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('Grand Total:', 6, y);
  doc.text(`₹${bill.total.toFixed(2)}`, pageWidth - 6, y, { align: 'right' });

  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Paid via: ${bill.paymentMethod.toUpperCase()} [${bill.paymentStatus.toUpperCase()}]`, 6, y);

  y += 5;
  doc.setLineDashPattern([1, 1], 0);
  doc.line(5, y, pageWidth - 5, y);
  doc.setLineDashPattern([], 0);

  y += 4.5;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.text('Thank you for dining with us!', pageWidth / 2, y, { align: 'center' });
  y += 3.2;
  doc.text('Please visit again • Have a wonderful day', pageWidth / 2, y, { align: 'center' });

  return doc;
}

export function generateBillPDF(bill: BillReceipt, restaurantName = 'ROYAL DINER & CAFE'): void {
  const doc = createBillPDFDoc(bill, restaurantName);
  doc.save(`${bill.billNumber}_receipt.pdf`);
}

export function getBillPDFBlob(bill: BillReceipt, restaurantName = 'ROYAL DINER & CAFE'): Blob {
  const doc = createBillPDFDoc(bill, restaurantName);
  return doc.output('blob');
}

export async function sendBillPDFToMobile(
  bill: BillReceipt,
  mobileNumber: string,
  onNotification?: (msg: string) => void
): Promise<{ success: boolean; message: string }> {
  // 1. Clean mobile number
  let cleanNumber = mobileNumber.replace(/[^0-9]/g, '');
  if (cleanNumber.length === 10) {
    cleanNumber = `91${cleanNumber}`;
  }

  // 2. Generate and download the official PDF receipt
  generateBillPDF(bill);

  // 3. Prepare formatted message for WhatsApp / SMS
  const itemsText = bill.items
    .map((i) => `• ${i.item.name} x${i.quantity} = ₹${i.quantity * i.item.price}`)
    .join('\n');

  const message = `🍽️ *ROYAL DINER & CAFE - OFFICIAL PDF BILL RECEIPT*
━━━━━━━━━━━━━━━━━━━━
📄 *Invoice Ref:* ${bill.billNumber}
📅 *Date & Time:* ${bill.date} ${bill.time}
🏷️ *Order Type:* ${bill.orderType.toUpperCase()}
${bill.customer.name ? `👤 *Guest:* ${bill.customer.name}\n` : ''}${bill.customer.tableNumber ? `🪑 *Table:* ${bill.customer.tableNumber}\n` : ''}━━━━━━━━━━━━━━━━━━━━
*ITEMS ORDERED:*
${itemsText}

━━━━━━━━━━━━━━━━━━━━
*Subtotal:* ₹${bill.subtotal.toFixed(2)}
${bill.discountAmount > 0 ? `*Discount (${bill.discountRate}%):* -₹${bill.discountAmount.toFixed(2)}\n` : ''}*Tax / GST (${bill.taxRate}%):* ₹${bill.taxAmount.toFixed(2)}
${bill.tipAmount > 0 ? `*Tip / Gratuity:* ₹${bill.tipAmount.toFixed(2)}\n` : ''}💰 *TOTAL PAYABLE:* ₹${bill.total.toFixed(2)}
💳 *Payment:* ${bill.paymentMethod.toUpperCase()} (${bill.paymentStatus.toUpperCase()})
━━━━━━━━━━━━━━━━━━━━
✅ *Your official PDF receipt "${bill.billNumber}_receipt.pdf" is ready and downloaded!*
Thank you for dining with us! 🙏`;

  // 4. Check Web Share API with PDF file support if available
  const pdfBlob = getBillPDFBlob(bill);
  const pdfFile = new File([pdfBlob], `${bill.billNumber}_receipt.pdf`, { type: 'application/pdf' });

  let sharedViaNative = false;
  if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
    try {
      await navigator.share({
        title: `Bill Receipt ${bill.billNumber}`,
        text: message,
        files: [pdfFile],
      });
      sharedViaNative = true;
    } catch {
      // Fallback to direct WhatsApp web/app link if user cancelled native share
      sharedViaNative = false;
    }
  }

  // 5. Open WhatsApp if not shared via native share or as direct mobile dispatch
  if (!sharedViaNative && cleanNumber) {
    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encoded}`;
    window.open(whatsappUrl, '_blank');
  }

  const successMessage = `PDF Bill (${bill.billNumber}_receipt.pdf) generated & dispatched to mobile +${cleanNumber || mobileNumber}!`;
  if (onNotification) {
    onNotification(successMessage);
  }

  return {
    success: true,
    message: successMessage,
  };
}

export async function sendBillPDFToEmail(
  bill: BillReceipt,
  email: string,
  onNotification?: (msg: string) => void
): Promise<{ success: boolean; message: string }> {
  // 1. Generate and download the official PDF receipt
  generateBillPDF(bill);

  // 2. Prepare structured email details
  const subject = `Tax Invoice & Bill Receipt #${bill.billNumber} - ROYAL DINER & CAFE`;
  const itemsText = bill.items
    .map((i) => `• ${i.item.name} x${i.quantity} = ₹${(i.quantity * i.item.price).toFixed(2)}`)
    .join('\n');

  const bodyText = `Dear ${bill.customer.name || 'Valued Customer'},

Thank you for dining at ROYAL DINER & CAFE!
Your official digital bill receipt has been generated in PDF format (${bill.billNumber}_receipt.pdf).

INVOICE SUMMARY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Invoice Ref : ${bill.billNumber}
Date & Time : ${bill.date} ${bill.time}
Order Type  : ${bill.orderType.toUpperCase()}
${bill.customer.name ? `Guest Name  : ${bill.customer.name}\n` : ''}${bill.customer.tableNumber ? `Table No.   : ${bill.customer.tableNumber}\n` : ''}${bill.customer.phone ? `Mobile No.  : ${bill.customer.phone}\n` : ''}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ITEMS ORDERED:
${itemsText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subtotal    : ₹${bill.subtotal.toFixed(2)}
${bill.discountAmount > 0 ? `Discount (${bill.discountRate}%) : -₹${bill.discountAmount.toFixed(2)}\n` : ''}GST / Tax (${bill.taxRate}%)  : ₹${bill.taxAmount.toFixed(2)}
${bill.tipAmount > 0 ? `Tip / Gratuity  : ₹${bill.tipAmount.toFixed(2)}\n` : ''}GRAND TOTAL : ₹${bill.total.toFixed(2)}
Payment     : ${bill.paymentMethod.toUpperCase()} (${bill.paymentStatus.toUpperCase()})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your official PDF invoice "${bill.billNumber}_receipt.pdf" is ready for your records.

We look forward to serving you again soon!

Warm regards,
ROYAL DINER & CAFE
GSTIN: 27AABCR1234F1Z8 | Contact: +91 98765 43210`;

  // 3. Check Web Share API with PDF file support
  const pdfBlob = getBillPDFBlob(bill);
  const pdfFile = new File([pdfBlob], `${bill.billNumber}_receipt.pdf`, { type: 'application/pdf' });

  let sharedViaNative = false;
  if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
    try {
      await navigator.share({
        title: subject,
        text: bodyText,
        files: [pdfFile],
      });
      sharedViaNative = true;
    } catch {
      sharedViaNative = false;
    }
  }

  // 4. Open mailto link if not handled by native file share
  if (!sharedViaNative && email.trim()) {
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(bodyText);
    const mailtoUrl = `mailto:${encodeURIComponent(email.trim())}?subject=${encodedSubject}&body=${encodedBody}`;
    window.location.href = mailtoUrl;
  }

  const successMessage = `PDF Bill (${bill.billNumber}_receipt.pdf) generated & dispatched to email ${email}!`;
  if (onNotification) {
    onNotification(successMessage);
  }

  return {
    success: true,
    message: successMessage,
  };
}

