'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, MessageCircle, ShoppingBag, Clock, MapPin, Shield, Star, Bike } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const Header: React.FC = () => {
  const { totalItemsCount, setIsCartOpen } = useCart();
  const phone = '918090485140';

  return (
    <header className="sticky top-0 z-30 bg-[#161619]/95 backdrop-blur-md border-b border-stone-800 shadow-lg">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 text-xs font-black py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-sm">
        <span>🧀 PROMO CODE: <span className="bg-stone-950 text-amber-400 px-1.5 py-0.5 rounded font-mono text-[11px]">DIRECT50</span> → ₹50 OFF + FREE Salted Fries on ₹299+</span>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand & Location Info */}
        <div className="flex flex-col">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
              <span className="text-2xl">🧀</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-lg sm:text-xl tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  Melting Cheese
                </h1>
                {/* Rating Badge */}
                <span className="hidden sm:inline-flex items-center gap-0.5 bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 px-1.5 py-0.5 rounded-md text-[10px] font-black">
                  <Star className="w-2.5 h-2.5 fill-emerald-400" />
                  <span>4.8</span>
                </span>
              </div>
              <div className="flex items-center text-[11px] sm:text-xs text-stone-400 gap-1.5">
                <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate max-w-[160px] sm:max-w-none">14, Sant Ravidas Nagar, Bhadohi</span>
              </div>
            </div>
          </Link>

          {/* Delivery & Status badges */}
          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-stone-300">
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
            <div className="flex items-center gap-1 text-amber-400/90 font-medium hidden xs:flex">
              <Bike className="w-3 h-3" />
              <span>25-35 min delivery</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
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
            href={`https://wa.me/${phone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-2xl bg-stone-900 border border-stone-800 hover:border-amber-500/50 flex items-center justify-center text-stone-300 hover:text-white transition-all shadow-sm active:scale-95"
            title="Chat on WhatsApp"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
          </a>

          {/* Admin Login Link */}
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
