'use client';

import React from 'react';
import { Phone, MapPin, CheckCircle, Clock, Truck, Check, AlertCircle, Banknote, QrCode } from 'lucide-react';
import { Order, OrderStatus, PaymentStatus } from '@/types';

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onTogglePaymentStatus: (orderId: string, currentStatus: PaymentStatus) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onUpdateStatus,
  onTogglePaymentStatus,
}) => {
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'NEW':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'PREPARING':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'OUT_FOR_DELIVERY':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'DELIVERED':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'CANCELLED':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      default:
        return 'bg-stone-800 text-stone-400 border-stone-700';
    }
  };

  const formattedTime = new Date(order.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-[#1a1a1e] border border-stone-800 rounded-3xl p-5 shadow-lg space-y-4 hover:border-stone-700 transition-colors">
      {/* Top Header: Order Number, Time, Status */}
      <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-white">
              #{order.order_number || order.id.slice(0, 5)}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${getStatusColor(
                order.order_status
              )}`}
            >
              {order.order_status.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Placed at {formattedTime}</span>
          </div>
        </div>

        {/* Payment Status Badge / Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTogglePaymentStatus(order.id, order.payment_status)}
            className={`px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
              order.payment_status === 'PAID'
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400'
                : 'bg-amber-950/60 border-amber-500/50 text-amber-400 hover:bg-amber-900/40'
            }`}
            title="Click to toggle Payment Status"
          >
            {order.payment_method === 'UPI' ? (
              <QrCode className="w-3.5 h-3.5" />
            ) : (
              <Banknote className="w-3.5 h-3.5" />
            )}
            <span>
              {order.payment_method}: {order.payment_status}
            </span>
          </button>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-stone-900/60 rounded-2xl p-3.5 border border-stone-800/60 space-y-1.5 text-xs text-stone-300">
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm text-white">{order.customer_name}</span>
          <a
            href={`tel:${order.customer_phone}`}
            className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-mono font-semibold bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20"
          >
            <Phone className="w-3 h-3" />
            <span>{order.customer_phone}</span>
          </a>
        </div>

        <div className="flex items-start gap-1.5 text-stone-400 pt-1">
          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <span className="leading-snug">{order.delivery_address}</span>
        </div>

        {order.gps_link && (
          <div className="pt-1">
            <a
              href={order.gps_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>📍 Open Customer GPS Pin on Google Maps</span>
            </a>
          </div>
        )}
      </div>

      {/* Ordered Items List */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">
          Items Ordered:
        </div>
        <div className="divide-y divide-stone-800/60 bg-stone-900/30 rounded-2xl border border-stone-800/40 overflow-hidden">
          {(order.items || []).map((item, idx) => (
            <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-amber-400 text-sm">{item.quantity}x</span>
                  <span className="font-semibold text-stone-200">{item.name}</span>
                </div>
                {item.customization && (
                  <div className="text-[11px] text-stone-400 pl-5">
                    {item.customization.crust}
                    {item.customization.extraCheese && ' + Extra Cheese'}
                  </div>
                )}
              </div>
              <div className="font-mono text-stone-300 font-medium">₹{item.totalPrice}</div>
            </div>
          ))}

          {order.free_item && (
            <div className="p-2.5 bg-emerald-950/20 flex items-center justify-between text-xs text-emerald-400 font-semibold">
              <span>🎁 {order.free_item}</span>
              <span>FREE</span>
            </div>
          )}
        </div>
      </div>

      {/* Order Bill Summary */}
      <div className="flex items-center justify-between text-xs pt-1 px-1">
        <div className="text-stone-400">
          Subtotal: ₹{order.subtotal} {order.discount > 0 && `• Discount: -₹${order.discount}`}
        </div>
        <div className="text-sm font-black text-amber-400">
          Total: ₹{order.total}
        </div>
      </div>

      {/* Status Transition Action Buttons */}
      <div className="pt-2 border-t border-stone-800/80 flex flex-wrap gap-2">
        {order.order_status === 'NEW' && (
          <button
            onClick={() => onUpdateStatus(order.id, 'PREPARING')}
            className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Accept & Prepare</span>
          </button>
        )}

        {order.order_status === 'PREPARING' && (
          <button
            onClick={() => onUpdateStatus(order.id, 'OUT_FOR_DELIVERY')}
            className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Out for Delivery</span>
          </button>
        )}

        {order.order_status === 'OUT_FOR_DELIVERY' && (
          <button
            onClick={() => onUpdateStatus(order.id, 'DELIVERED')}
            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark as Delivered</span>
          </button>
        )}

        {order.order_status !== 'DELIVERED' && order.order_status !== 'CANCELLED' && (
          <button
            onClick={() => {
              if (confirm('Are you sure you want to cancel this order?')) {
                onUpdateStatus(order.id, 'CANCELLED');
              }
            }}
            className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-rose-950 text-stone-400 hover:text-rose-400 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
        )}

        {order.order_status === 'DELIVERED' && (
          <div className="w-full text-center py-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 rounded-xl">
            ✓ Order Completed & Delivered
          </div>
        )}
      </div>
    </div>
  );
};
