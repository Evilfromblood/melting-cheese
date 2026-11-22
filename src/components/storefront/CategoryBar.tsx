'use client';

import React from 'react';
import { Search, X, Sparkles } from 'lucide-react';

interface CategoryBarProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isVegOnly: boolean;
  onToggleVegOnly: () => void;
  categoryCounts: Record<string, number>;
}

const CATEGORY_ICONS: Record<string, string> = {
  All: '✨',
  Pizza: '🍕',
  Burgers: '🍔',
  Snacks: '🍟',
  'Chicken Wings & Strips': '🍗',
  Mocktails: '🍹',
};

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  isVegOnly,
  onToggleVegOnly,
  categoryCounts,
}) => {
  return (
    <div className="sticky top-[108px] z-20 bg-[#121214]/95 backdrop-blur-md pt-3 pb-2.5 border-b border-stone-800/80 shadow-md">
      <div className="max-w-4xl mx-auto px-4 space-y-2.5">
        {/* Search & Veg Filter Row */}
        <div className="flex items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search dishes (e.g. Tandoori Pizza, Makhani Burger...)"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-stone-900 border border-stone-800 rounded-2xl text-xs sm:text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Veg Only Toggle Switch */}
          <button
            onClick={onToggleVegOnly}
            className={`flex items-center gap-2 px-3 py-2 rounded-2xl border text-xs font-bold transition-all shrink-0 shadow-sm ${
              isVegOnly
                ? 'bg-emerald-950/70 border-emerald-500 text-emerald-400 shadow-emerald-950/40'
                : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-300'
            }`}
          >
            <span
              className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                isVegOnly ? 'border-emerald-500 bg-emerald-500/20' : 'border-stone-500'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isVegOnly ? 'bg-emerald-400' : 'bg-transparent'
                }`}
              />
            </span>
            <span>Veg Only</span>
          </button>
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {/* All Items */}
          <button
            onClick={() => onSelectCategory('All')}
            className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shadow-sm ${
              activeCategory === 'All'
                ? 'bg-amber-500 text-stone-950 shadow-amber-500/25 scale-[1.02]'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            <span>{CATEGORY_ICONS['All']}</span>
            <span>All Items</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                activeCategory === 'All'
                  ? 'bg-stone-950 text-amber-400'
                  : 'bg-stone-800 text-stone-400'
              }`}
            >
              {categoryCounts['All'] || 0}
            </span>
          </button>

          {categories.map((cat) => {
            const count = categoryCounts[cat] || 0;
            const isActive = activeCategory === cat;
            const icon = CATEGORY_ICONS[cat] || '🍽️';

            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shadow-sm ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 shadow-amber-500/25 scale-[1.02]'
                    : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                }`}
              >
                <span>{icon}</span>
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isActive
                      ? 'bg-stone-950 text-amber-400'
                      : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
