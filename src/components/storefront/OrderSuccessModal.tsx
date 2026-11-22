'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, MessageCircle, ExternalLink } from 'lucide-react';
import { Order } from '@/types';
import confetti from 'canvas-confetti';

interface OrderSuccessModalProps {
  order: Partial<Order> | null;
  whatsappUrl: string;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  whatsappUrl,
  onClose,
}) => {
  useEffect(() => {
    if (order) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }
  }, [order]);

  if (!order) return null;

  const displayId = order.order_number 
    ? `#${order.order_number}` 
    : order.id 
      ? `#${order.id.slice(0, 8).toUpperCase()}` 
      : '#DIRECT';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#18181b] border border-stone-800 rounded-3xl p-6 shadow-2xl text-center space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-3xl">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <h2 className="text-xl font-black text-white">Order Placed Successfully!</h2>
          <p className="text-xs text-stone-400 mt-1">
            Order {displayId} • Total: ₹{order.total}
          </p>
        </div>

        <div className="bg-stone-900/80 p-4 rounded-2xl border border-stone-800 text-left text-xs space-y-2 text-stone-300">
          <div className="flex justify-between">
            <span className="text-stone-400">Customer:</span>
            <span className="font-semibold text-white">{order.customer_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Phone:</span>
            <span className="font-mono text-white">{order.customer_phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Delivery Address:</span>
            <span className="font-medium text-white text-right max-w-[200px] truncate">{order.delivery_address}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Payment:</span>
            <span className="font-semibold text-amber-400">{order.payment_method}</span>
          </div>
          {order.free_item && (
            <div className="flex justify-between text-emerald-400 font-bold">
              <span>Promo Reward:</span>
              <span>{order.free_item}</span>
            </div>
          )}
        </div>

        <div className="space-y-2.5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <MessageCircle className="w-4 h-4 fill-stone-950" />
            <span>Open WhatsApp with Kitchen</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs transition-colors"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};
