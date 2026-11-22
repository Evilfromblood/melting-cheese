'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
  const phone = process.env.NEXT_PUBLIC_RESTAURANT_PHONE || '918090485140';
  const message = encodeURIComponent('Hi Melting Cheese, I have a question about my order');
  const url = `https://wa.me/${phone}?text=${message}`;

  return (
    <div className="fixed bottom-5 left-4 sm:bottom-6 sm:left-6 z-40 group">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp Business"
        className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300"
      >
        {/* Radar Pulse Effect */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-40 animate-ping pointer-events-none" />

        {/* WhatsApp Icon */}
        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 fill-white text-[#25D366] relative z-10" />

        {/* Subtle Online Dot */}
        <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-300 border-2 border-stone-900 rounded-full z-20" />
      </a>

      {/* Floating Tooltip Pill on Hover / Desktop */}
      <div className="absolute left-16 top-1/2 -translate-y-1/2 hidden sm:group-hover:flex items-center gap-1.5 px-3 py-1.5 bg-stone-900/95 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs font-bold shadow-xl whitespace-nowrap pointer-events-none animate-in fade-in slide-in-from-left-2 duration-150">
        <span>WhatsApp Business</span>
        <span className="text-[10px] text-stone-400 font-normal">• Fast Reply</span>
      </div>
    </div>
  );
};
