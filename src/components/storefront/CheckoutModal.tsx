'use client';

import React, { useState } from 'react';
import { X, Navigation, Smartphone, Banknote, QrCode, ArrowRight, Loader2, Check, AlertTriangle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useCart } from '@/context/CartContext';
import { generateUpiLink } from '@/lib/upi';
import { formatWhatsAppOrderMessage } from '@/lib/whatsapp';
import { createClient } from '@/lib/supabase/client';
import { Order, OrderItemSummary, PaymentMethod } from '@/types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Partial<Order>, whatsappUrl: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { items, subtotal, discount, freeItem, total, clearCart } = useCart();
  const supabase = createClient();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gpsLink, setGpsLink] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // Generate UPI deep link & QR payload
  const upiDeepLink = generateUpiLink({
    amount: total,
    note: `Melting Cheese ${name ? `for ${name}` : 'Order'}`,
  });

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const link = `https://maps.google.com/?q=${latitude},${longitude}`;
        setGpsLink(link);
        setIsGettingLocation(false);
        setLocationSuccess(true);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        alert('Could not access current location. Please ensure location permissions are enabled.');
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit phone number.');
      return;
    }

    if (!address.trim()) {
      setErrorMessage('Please enter your delivery address in Bhadohi.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems: OrderItemSummary[] = items.map((ci) => ({
        name: ci.item.name,
        category: ci.item.category,
        dietary: ci.item.dietary,
        quantity: ci.quantity,
        unitPrice: ci.unitPrice,
        totalPrice: ci.totalPrice,
        customization: ci.customization
          ? {
              crust: ci.customization.crust,
              extraCheese: ci.customization.extraCheese,
            }
          : undefined,
      }));

      // Generate client UUID for idempotent direct insert without chaining .select()
      const orderId = crypto.randomUUID();

      const newOrderPayload = {
        id: orderId,
        customer_name: name.trim(),
        customer_phone: cleanPhone,
        delivery_address: address.trim(),
        gps_link: gpsLink || null,
        items: orderItems,
        subtotal,
        discount,
        free_item: freeItem || null,
        total,
        payment_method: paymentMethod,
        payment_status: 'PENDING' as const,
        order_status: 'NEW' as const,
      };

      // Insert directly into Supabase orders table without .select()
      // to avoid anon SELECT RLS policy violation
      const { error } = await supabase
        .from('orders')
        .insert([newOrderPayload]);

      if (error) {
        const serializedError = JSON.stringify(error, Object.getOwnPropertyNames(error));
        console.error('Supabase orders.insert ERROR:', serializedError);
        setErrorMessage(`Failed to record order: ${error.message || 'Database error'}. Please try again or contact us directly.`);
        setIsSubmitting(false);
        return;
      }

      console.log('Order successfully inserted into Supabase orders table with id:', orderId);

      const savedOrder: Partial<Order> = {
        ...newOrderPayload,
        id: orderId,
        created_at: new Date().toISOString(),
      };

      // Format WhatsApp Message & link
      const whatsappUrl = formatWhatsAppOrderMessage({
        ...savedOrder,
        orderIdDisplay: `#${orderId.slice(0, 8).toUpperCase()}`,
      });

      // Clear local cart
      clearCart();

      // Open WhatsApp handoff
      if (typeof window !== 'undefined') {
        window.open(whatsappUrl, '_blank');
      }

      // Inform parent
      onOrderSuccess(savedOrder, whatsappUrl);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to place order. Please try again.';
      console.error('Unexpected order submission error:', err);
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#18181b] border border-stone-800 rounded-3xl shadow-2xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-900/60">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Checkout Order</span>
              <span className="text-amber-400 font-black">• ₹{total}</span>
            </h2>
            <p className="text-xs text-stone-400">Direct delivery in Bhadohi, UP</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmitOrder} className="p-5 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Customer Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              1. Delivery Details
            </h3>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Your Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                WhatsApp / Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Delivery Address & Landmark (Bhadohi) <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="House/Shop No, Colony, Street, Near Landmark..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            {/* Attach GPS Pin Button */}
            <div>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isGettingLocation}
                className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  locationSuccess
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400'
                    : 'bg-stone-900 hover:bg-stone-800/80 border-stone-800 text-stone-300'
                }`}
              >
                {isGettingLocation ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Fetching GPS coordinates...</span>
                  </>
                ) : locationSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>GPS Pin Attached for Rider!</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3.5 h-3.5 text-amber-400" />
                    <span>Attach Exact GPS Pin (Optional)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3 pt-2 border-t border-stone-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              2. Payment Method
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  paymentMethod === 'UPI'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-sm'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold">UPI / QR Code</span>
                </div>
                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${paymentMethod === 'UPI' ? 'border-amber-500 bg-amber-500' : 'border-stone-600'}`}>
                  {paymentMethod === 'UPI' && <span className="w-1.5 h-1.5 rounded-full bg-stone-950" />}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  paymentMethod === 'COD'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-sm'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold">Cash On Delivery</span>
                </div>
                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${paymentMethod === 'COD' ? 'border-amber-500 bg-amber-500' : 'border-stone-600'}`}>
                  {paymentMethod === 'COD' && <span className="w-1.5 h-1.5 rounded-full bg-stone-950" />}
                </span>
              </button>
            </div>

            {/* UPI QR Display & Direct Intent Button */}
            {paymentMethod === 'UPI' && (
              <div className="p-4 bg-stone-900/90 rounded-2xl border border-stone-800 flex flex-col items-center text-center space-y-3">
                <div className="bg-white p-3 rounded-2xl shadow-md">
                  <QRCodeSVG
                    value={upiDeepLink}
                    size={160}
                    level="M"
                    includeMargin={false}
                  />
                </div>

                <div>
                  <div className="text-xs font-bold text-stone-200">
                    Scan with GPay, PhonePe, or Paytm
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    UPI ID: <span className="text-amber-400 font-mono">rhythm8@slc</span> • Amount: ₹{total}
                  </div>
                </div>

                {/* Mobile Pay via UPI App Intent Button */}
                <a
                  href={upiDeepLink}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors sm:hidden"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Pay via UPI App (GPay / PhonePe / Paytm)</span>
                </a>
              </div>
            )}
          </div>

          {/* Submit Order Button */}
          <div className="pt-3 border-t border-stone-800">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-stone-950 font-black text-sm tracking-wide shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Recording Order in Kitchen...</span>
                </>
              ) : (
                <>
                  <span>Place Order & Send on WhatsApp</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[11px] text-stone-400 text-center mt-2">
              Orders are recorded directly in the kitchen database and handoff to WhatsApp.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
