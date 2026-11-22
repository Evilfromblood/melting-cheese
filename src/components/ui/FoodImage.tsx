'use client';

import React, { useState } from 'react';

interface FoodImageProps {
  src?: string | null;
  alt: string;
  category: string;
  className?: string;
  badge?: string;
}

export const FoodImage: React.FC<FoodImageProps> = ({
  src,
  alt,
  category,
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  // If broken or empty URL, render high-quality category illustration
  if (!src || hasError) {
    return (
      <div className={`relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-stone-900 via-[#1e1c18] to-stone-900 border border-stone-800/80 ${className}`}>
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-amber-500/5 backdrop-blur-[1px]" />

        {/* Dynamic Category SVG Graphic */}
        {category === 'Pizza' && (
          <div className="flex flex-col items-center justify-center p-4 text-center z-10">
            <svg viewBox="0 0 80 80" className="w-16 h-16 drop-shadow-lg">
              <path d="M 10 20 C 30 10, 50 10, 70 20 L 42 74 C 41 76, 39 76, 38 74 Z" fill="#d97706" />
              <path d="M 14 22 C 30 15, 50 15, 66 22 L 60 40 C 58 42, 54 48, 55 52 C 54 58, 48 64, 40 70 C 32 62, 26 56, 26 48 L 20 40 Z" fill="#fbbf24" />
              <circle cx="34" cy="32" r="4" fill="#dc2626" />
              <circle cx="48" cy="34" r="3.5" fill="#fef08a" />
              <circle cx="40" cy="48" r="4" fill="#dc2626" />
              <circle cx="32" cy="46" r="3" fill="#ffffff" />
            </svg>
            <span className="text-[11px] font-bold text-amber-400/90 mt-1 uppercase tracking-wider">8&quot; Fresh Pizza</span>
          </div>
        )}

        {category === 'Burgers' && (
          <div className="flex flex-col items-center justify-center p-4 text-center z-10">
            <svg viewBox="0 0 80 80" className="w-16 h-16 drop-shadow-lg">
              {/* Top Bun */}
              <path d="M 15 36 C 15 18, 65 18, 65 36 Z" fill="#d97706" />
              <ellipse cx="40" cy="36" rx="25" ry="3" fill="#b45309" />
              {/* Sesame seeds */}
              <ellipse cx="32" cy="24" rx="1.5" ry="0.8" fill="#fef08a" transform="rotate(-15 32 24)" />
              <ellipse cx="44" cy="22" rx="1.5" ry="0.8" fill="#fef08a" transform="rotate(10 44 22)" />
              <ellipse cx="48" cy="28" rx="1.5" ry="0.8" fill="#fef08a" transform="rotate(-5 48 28)" />
              {/* Lettuce */}
              <path d="M 12 40 C 18 43, 22 38, 28 41 C 34 38, 40 43, 46 39 C 52 42, 58 38, 68 40" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" fill="none" />
              {/* Melted Cheese Slice */}
              <polygon points="16,43 64,43 60,51 44,53 38,47 24,52" fill="#fbbf24" />
              {/* Patty */}
              <rect x="15" y="49" width="50" height="10" rx="4" fill="#78350f" />
              {/* Bottom Bun */}
              <rect x="17" y="58" width="46" height="8" rx="3" fill="#d97706" />
            </svg>
            <span className="text-[11px] font-bold text-amber-400/90 mt-1 uppercase tracking-wider">Grilled Burger</span>
          </div>
        )}

        {category === 'Snacks' && (
          <div className="flex flex-col items-center justify-center p-4 text-center z-10">
            <svg viewBox="0 0 80 80" className="w-16 h-16 drop-shadow-lg">
              {/* Fries Box */}
              <polygon points="20,40 60,40 54,72 26,72" fill="#dc2626" />
              <circle cx="40" cy="56" r="8" fill="#fbbf24" />
              {/* Golden Fries Sticks */}
              <rect x="24" y="16" width="5" height="28" rx="1.5" fill="#fde047" stroke="#ca8a04" strokeWidth="1" transform="rotate(-12 26 30)" />
              <rect x="32" y="12" width="5" height="32" rx="1.5" fill="#fde047" stroke="#ca8a04" strokeWidth="1" transform="rotate(-4 34 28)" />
              <rect x="40" y="10" width="5" height="34" rx="1.5" fill="#fde047" stroke="#ca8a04" strokeWidth="1" transform="rotate(2 42 27)" />
              <rect x="48" y="14" width="5" height="30" rx="1.5" fill="#fde047" stroke="#ca8a04" strokeWidth="1" transform="rotate(10 50 29)" />
              <rect x="54" y="20" width="5" height="24" rx="1.5" fill="#fde047" stroke="#ca8a04" strokeWidth="1" transform="rotate(18 56 32)" />
            </svg>
            <span className="text-[11px] font-bold text-amber-400/90 mt-1 uppercase tracking-wider">Crispy Fries</span>
          </div>
        )}

        {category === 'Chicken Wings & Strips' && (
          <div className="flex flex-col items-center justify-center p-4 text-center z-10">
            <svg viewBox="0 0 80 80" className="w-16 h-16 drop-shadow-lg">
              {/* Crispy Drumstick / Wings */}
              <circle cx="46" cy="34" r="17" fill="#b45309" />
              <path d="M 36 44 L 20 62 C 18 64, 15 64, 14 62 C 13 60, 13 58, 15 56 L 31 38 Z" fill="#fed7aa" />
              <circle cx="16" cy="62" r="3.5" fill="#ffedd5" />
              <circle cx="13" cy="59" r="3.5" fill="#ffedd5" />
              <ellipse cx="48" cy="33" rx="15" ry="14" fill="#d97706" />
              {/* Crisp bits */}
              <circle cx="44" cy="27" r="1.5" fill="#fef08a" />
              <circle cx="53" cy="34" r="1.5" fill="#fef08a" />
              <circle cx="42" cy="38" r="1.5" fill="#fef08a" />
            </svg>
            <span className="text-[11px] font-bold text-amber-400/90 mt-1 uppercase tracking-wider">Crispy Chicken</span>
          </div>
        )}

        {category === 'Mocktails' && (
          <div className="flex flex-col items-center justify-center p-4 text-center z-10">
            <svg viewBox="0 0 80 80" className="w-16 h-16 drop-shadow-lg">
              {/* Highball Glass */}
              <polygon points="24,20 56,20 50,68 30,68" fill="rgba(56, 189, 248, 0.25)" stroke="#38bdf8" strokeWidth="1.5" />
              {/* Colorful Drink Fill */}
              <polygon points="26,30 54,30 49,66 31,66" fill="url(#mocktailGrad)" />
              {/* Straw */}
              <line x1="38" y1="12" x2="48" y2="60" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
              {/* Lemon Wedge */}
              <circle cx="56" cy="20" r="7" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
              <defs>
                <linearGradient id="mocktailGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>
              </defs>
            </svg>
            <span className="text-[11px] font-bold text-sky-400 mt-1 uppercase tracking-wider">Chilled Mocktail</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
};
