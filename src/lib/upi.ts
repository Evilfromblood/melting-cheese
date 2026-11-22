export interface UpiParams {
  amount: number;
  orderNumber?: number | string;
  note?: string;
}

export function generateUpiLink({ amount, orderNumber, note }: UpiParams): string {
  const upiId = process.env.NEXT_PUBLIC_UPI_ID || 'rhythm8@slc';
  const merchantName = 'Melting Cheese';
  const orderNote = note || (orderNumber ? `Order #${orderNumber}` : 'Melting Cheese Order');

  const params = new URLSearchParams({
    pa: upiId,
    pn: merchantName,
    am: amount.toString(),
    cu: 'INR',
    tn: orderNote,
  });

  return `upi://pay?${params.toString()}`;
}
