'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Phone, MessageCircle, ShoppingBag, Clock, MapPin, Shield, User, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export const Header: React.FC = () => {
  const { totalItemsCount, setIsCartOpen } = useCart();
  const supabase = createClient();
  const phone = process.env.NEXT_PUBLIC_RESTAURANT_PHONE || '918090485140';

  const [customerUser, setCustomerUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCustomerUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setCustomerUser(session?.user || null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <header className="sticky top-0 z-30 bg-[#161619]/95 backdrop-blur-md border-b border-stone-800 shadow-lg">
      {/* Top Banner Notice with Promo & WhatsApp Business verification */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 text-xs font-black py-1 px-4 text-center flex flex-wrap items-center justify-center gap-x-4 gap-y-0.5 shadow-sm">
        <span>🧀 PROMO: <span className="bg-stone-950 text-amber-400 px-1.5 py-0.2 rounded font-mono text-[10px]">DIRECT50</span> for ₹50 OFF + FREE Fries on ₹299+</span>
        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-stone-950/90">
          <CheckCircle2 className="w-3.5 h-3.5 fill-stone-950 text-amber-400 inline" />
          <span>WhatsApp Business: +91 8090485140</span>
        </span>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Custom Brand Logo */}
        <div className="flex flex-col">
          <Link href="/" className="group">
            <BrandLogo size="md" showText={true} />
          </Link>

          {/* Delivery & Status badges */}
          <div className="mt-1 flex items-center gap-2 text-[11px] text-stone-300">
            <div className="flex items-center gap-1 text-emerald-400 font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Open</span>
            </div>
            <span className="text-stone-600">•</span>
            <div className="flex items-center gap-1 text-stone-400">
              <Clock className="w-3 h-3" />
              <span>Till 12:00 AM</span>
            </div>
            <span className="text-stone-600">•</span>
            <div className="flex items-center gap-1 text-stone-400">
              <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate max-w-[120px] sm:max-w-none">Sant Ravidas Nagar, Bhadohi</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Customer Auth Button: Login / Account */}
          {customerUser ? (
            <Link
              href="/account"
              className="px-3 py-1.5 rounded-2xl bg-stone-900 border border-amber-500/40 text-amber-400 hover:bg-stone-800 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              title="My Account & Orders"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">My Orders</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-2xl bg-stone-900 border border-stone-800 hover:border-amber-500/50 text-stone-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Customer Login / Sign Up"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Login</span>
            </Link>
          )}

          {/* Quick Call */}
          <a
            href={`tel:+${phone}`}
            className="w-9 h-9 rounded-2xl bg-stone-900 border border-stone-800 hover:border-amber-500/50 flex items-center justify-center text-stone-300 hover:text-white transition-all shadow-sm active:scale-95"
            title="Call Restaurant"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
          </a>

          {/* Quick WhatsApp */}
          <a
            href={`https://wa.me/${phone}?text=${encodeURIComponent("Hi Melting Cheese, I would like to place an order.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-2xl bg-stone-900 border border-stone-800 hover:border-emerald-500/50 flex items-center justify-center text-stone-300 hover:text-white transition-all shadow-sm active:scale-95"
            title="Chat on WhatsApp Business"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
          </a>

          {/* Admin Dashboard */}
          <Link
            href="/admin"
            className="w-9 h-9 rounded-2xl bg-stone-900 border border-stone-800 hover:border-amber-500/50 flex items-center justify-center text-stone-400 hover:text-amber-400 transition-all shadow-sm active:scale-95"
            title="Kitchen Dashboard"
          >
            <Shield className="w-4 h-4" />
          </Link>

          {/* Cart Floating Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black flex items-center gap-2 shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 active:scale-95 transition-all"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="text-sm font-black">{totalItemsCount}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
