'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Phone, MessageCircle, ShoppingBag, Clock, MapPin, User, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export const Header: React.FC = () => {
  const { totalItemsCount, setIsCartOpen } = useCart();
  const supabase = createClient();
  const phone = process.env.NEXT_PUBLIC_RESTAURANT_PHONE || '918090485140';

  const [customerUser, setCustomerUser] = useState<SupabaseUser | null>(null);
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [closedMessage, setClosedMessage] = useState('Kitchen is currently closed. Opens at 11:00 AM!');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCustomerUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setCustomerUser(session?.user || null);
      }
    );

    // Fetch store settings
    supabase
      .from('store_settings')
      .select('is_open, closed_message')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (data) {
          if (typeof data.is_open === 'boolean') setIsStoreOpen(data.is_open);
          if (data.closed_message) setClosedMessage(data.closed_message);
        }
      });

    // Realtime listener for store_settings
    const channel = supabase
      .channel('public:store_settings_header')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'store_settings' },
        (payload) => {
          if (payload.new && typeof payload.new === 'object') {
            const row = payload.new as { is_open?: boolean; closed_message?: string };
            if (typeof row.is_open === 'boolean') setIsStoreOpen(row.is_open);
            if (row.closed_message) setClosedMessage(row.closed_message);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <header className="sticky top-0 z-30 bg-[#161619]/95 backdrop-blur-md border-b border-stone-800 shadow-lg">
      {/* Top Banner Notice: Promo or Closed Banner */}
      {!isStoreOpen ? (
        <div className="bg-rose-600 text-white text-xs font-bold py-1.5 px-4 text-center shadow-sm flex items-center justify-center gap-2">
          <span>⛔</span>
          <span>{closedMessage}</span>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 text-xs font-black py-1 px-4 text-center flex flex-wrap items-center justify-center gap-x-4 gap-y-0.5 shadow-sm">
          <span>🧀 PROMO: <span className="bg-stone-950 text-amber-400 px-1.5 py-0.2 rounded font-mono text-[10px]">DIRECT50</span> for ₹50 OFF + FREE Fries on ₹299+</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-stone-950/90">
            <CheckCircle2 className="w-3.5 h-3.5 fill-stone-950 text-amber-400 inline" />
            <span>WhatsApp Business: +91 8090485140</span>
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 min-w-0">
        {/* Custom Brand Logo */}
        <div className="min-w-0 flex-1 flex flex-col pr-1">
          <Link href="/" className="group inline-block">
            <BrandLogo size="md" showText={true} />
          </Link>

          {/* Delivery & Status badges */}
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-stone-300 whitespace-nowrap overflow-hidden">
            {isStoreOpen ? (
              <div className="flex items-center gap-1 text-emerald-400 font-semibold shrink-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Open</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-rose-400 font-semibold shrink-0">
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <span>Closed</span>
              </div>
            )}
            <span className="text-stone-600 shrink-0">•</span>
            <div className="flex items-center gap-1 text-stone-400 shrink-0">
              <Clock className="w-3 h-3" />
              <span>Till 12 AM</span>
            </div>
            <span className="hidden sm:inline text-stone-600 shrink-0">•</span>
            <div className="hidden sm:flex items-center gap-1 text-stone-400 min-w-0">
              <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">Sant Ravidas Nagar, Bhadohi</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="shrink-0 flex items-center gap-1.5 sm:gap-2">
          {/* Customer Auth Button: Login / Account */}
          {customerUser ? (
            <Link
              href="/account"
              className="w-8 h-8 sm:w-auto sm:px-3 sm:py-1.5 rounded-2xl bg-stone-900 border border-amber-500/40 text-amber-400 hover:bg-stone-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              title="My Account & Orders"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">My Orders</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="w-8 h-8 sm:w-auto sm:px-3 sm:py-1.5 rounded-2xl bg-stone-900 border border-stone-800 hover:border-amber-500/50 text-stone-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              title="Customer Login / Sign Up"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Login</span>
            </Link>
          )}

          {/* Quick Call */}
          <a
            href={`tel:+${phone}`}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-stone-900 border border-stone-800 hover:border-amber-500/50 flex items-center justify-center text-stone-300 hover:text-white transition-all shadow-sm active:scale-95"
            title="Call Restaurant"
          >
            <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
          </a>

          {/* Quick WhatsApp (desktop - floating button serves mobile) */}
          <a
            href={`https://wa.me/${phone}?text=${encodeURIComponent("Hi Melting Cheese, I would like to place an order.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex w-9 h-9 rounded-2xl bg-stone-900 border border-stone-800 hover:border-emerald-500/50 items-center justify-center text-stone-300 hover:text-white transition-all shadow-sm active:scale-95"
            title="Chat on WhatsApp Business"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
          </a>

          {/* Cart Floating Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 active:scale-95 transition-all shrink-0"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-black">{totalItemsCount}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
