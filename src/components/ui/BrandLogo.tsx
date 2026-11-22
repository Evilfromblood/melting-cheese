'use client';

import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  lightText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  lightText = true,
}) => {
  // Size dimensions
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9 sm:w-10 sm:h-10',
    lg: 'w-12 h-12 sm:w-14 sm:h-14',
    xl: 'w-16 h-16 sm:w-20 sm:h-20',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base sm:text-lg',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-2xl sm:text-3xl',
  };

  const subSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px] sm:text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Appetizing Vector Logo Graphic */}
      <div className={`relative ${iconSizes[size]} shrink-0 drop-shadow-md`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transform transition-transform hover:rotate-2 duration-300"
        >
          <defs>
            {/* Crust Gradient */}
            <linearGradient id="crustGrad" x1="10" y1="15" x2="90" y2="25" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>

            {/* Melted Cheese Golden Gradient */}
            <linearGradient id="cheeseGrad" x1="50" y1="20" x2="50" y2="95" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="25%" stopColor="#fde047" />
              <stop offset="60%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>

            {/* Sauce & Pepperoni Red Gradient */}
            <linearGradient id="sauceGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>

            {/* Drip Shadow */}
            <filter id="dripShadow" x="-10%" y="-10%" width="120%" height="130%" filterUnits="userSpaceOnUse">
              <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#78350f" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Pizza Slice Base Crust with curved back */}
          <path
            d="M 12 24 C 36 12, 64 12, 88 24 L 54 90 C 52 94, 48 94, 46 90 Z"
            fill="url(#crustGrad)"
            stroke="#78350f"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Golden Melted Cheese Layer with organic molten drips */}
          <path
            d="M 16 26 
               C 38 18, 62 18, 84 26 
               L 77 44 
               C 74 46, 71 52, 72 58 
               C 73 63, 67 65, 64 61
               C 61 57, 58 59, 57 66
               C 56 75, 49 84, 50 86
               C 49 88, 47 86, 46 80
               C 44 72, 38 68, 36 74
               C 34 79, 29 78, 30 71
               C 31 63, 26 58, 25 50
               Z"
            fill="url(#cheeseGrad)"
            filter="url(#dripShadow)"
          />

          {/* Rich Tomato Sauce Peek Layer */}
          <path
            d="M 20 28 C 38 22, 62 22, 80 28"
            stroke="url(#sauceGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Molten Cheese Holes / Pockets */}
          <circle cx="38" cy="38" r="4.5" fill="#fef9c3" opacity="0.9" />
          <circle cx="39" cy="39" r="3" fill="#ca8a04" opacity="0.35" />

          <circle cx="62" cy="36" r="4" fill="#fef9c3" opacity="0.9" />
          <circle cx="63" cy="37" r="2.5" fill="#ca8a04" opacity="0.35" />

          <circle cx="48" cy="52" r="5" fill="#fef9c3" opacity="0.9" />
          <circle cx="49" cy="53" r="3.2" fill="#ca8a04" opacity="0.35" />

          <circle cx="36" cy="58" r="3" fill="#fef9c3" opacity="0.8" />
          <circle cx="56" cy="68" r="2.5" fill="#fef9c3" opacity="0.8" />

          {/* Spiced Paneer/Topping Cubes */}
          <rect x="44" y="32" width="7" height="6" rx="1.5" fill="#ffffff" stroke="#eab308" strokeWidth="0.8" transform="rotate(12 47 35)" />
          <rect x="58" y="46" width="6.5" height="5.5" rx="1.5" fill="#ffffff" stroke="#eab308" strokeWidth="0.8" transform="rotate(-15 61 48)" />
          <rect x="28" y="44" width="6" height="5" rx="1.5" fill="#ffffff" stroke="#eab308" strokeWidth="0.8" transform="rotate(8 31 46)" />

          {/* Molten Drip Pull - Droplet extending downwards */}
          <path
            d="M 50 86 C 51 91, 52 95, 50 97 C 48 95, 49 91, 50 86 Z"
            fill="#f59e0b"
          />
          <circle cx="50" cy="98" r="1.5" fill="#f59e0b" />

          {/* Steam / Aroma Wisps */}
          <path
            d="M 38 12 C 36 7, 42 5, 40 1"
            stroke="#fbbf24"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.85"
          />
          <path
            d="M 52 14 C 50 9, 56 6, 54 2"
            stroke="#fbbf24"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.85"
          />
          <path
            d="M 64 13 C 62 8, 68 6, 66 3"
            stroke="#fbbf24"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.75"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <div className={`font-black tracking-tight flex items-center gap-1 ${textSizes[size]} ${lightText ? 'text-white' : 'text-stone-900'}`}>
            <span>Melting</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400">
              Cheese
            </span>
          </div>
          <div className={`font-bold tracking-widest uppercase flex items-center gap-1.5 ${subSizes[size]} text-amber-500/90`}>
            <span>Bhadohi</span>
            <span className="text-stone-600 font-normal">•</span>
            <span className="text-[10px] text-stone-400 tracking-normal font-medium">Fresh & Hot</span>
          </div>
        </div>
      )}
    </div>
  );
};
