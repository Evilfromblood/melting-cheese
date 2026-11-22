import { Order } from '@/types';

export function formatWhatsAppOrderMessage(order: Partial<Order> & { orderIdDisplay?: string }): string {
  const restaurantPhone = process.env.NEXT_PUBLIC_RESTAURANT_PHONE || '918090485140';
  const orderId = order.order_number ? `#${order.order_number}` : order.orderIdDisplay || 'Direct Order';

  const itemsList = (order.items || []).map((item) => {
    let customText = '';
    if (item.customization) {
      const parts = [];
      if (item.customization.crust) parts.push(item.customization.crust);
      if (item.customization.extraCheese) parts.push('+ Extra Cheese');
      if (parts.length > 0) {
        customText = ` (${parts.join(', ')})`;
      }
    }
    return `• ${item.quantity}x ${item.name}${customText} - ₹${item.totalPrice}`;
  }).join('\n');

  let freeItemLine = '';
  if (order.free_item) {
    freeItemLine = `\n🎁 *Free Perk:* ${order.free_item}\n`;
  }

  let gpsLine = '';
  if (order.gps_link) {
    gpsLine = `*GPS Pin:* ${order.gps_link}\n`;
  }

  const discountLine = order.discount && order.discount > 0 
    ? `*Discount (DIRECT50):* -₹${order.discount}\n` 
    : '';

  const message = 
`🧀 *NEW ORDER - MELTING CHEESE* 🧀
----------------------------------------
*Order Number:* ${orderId}
*Customer Name:* ${order.customer_name || 'Valued Customer'}
*Phone:* ${order.customer_phone || ''}
*Delivery Address:* ${order.delivery_address || ''}
${gpsLine}
*Items Ordered:*
${itemsList}
${freeItemLine}
*Subtotal:* ₹${order.subtotal || 0}
${discountLine}*Grand Total:* ₹${order.total || 0}
*Payment Mode:* ${order.payment_method || 'UPI'}
*Payment Status:* ${order.payment_status || 'PENDING'}
----------------------------------------
Please confirm and start preparing my order! 🙏`;

  return `https://wa.me/${restaurantPhone}?text=${encodeURIComponent(message)}`;
}
