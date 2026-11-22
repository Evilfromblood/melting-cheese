'use client';

import React from 'react';
import Image from 'next/image';
import { Plus, Minus, SlidersHorizontal, Flame, Sparkles, AlertCircle } from 'lucide-react';
import { MenuItem } from '@/types';
import { useCart, MAX_ITEM_QTY } from '@/context/CartContext';

interface MenuItemCardProps {
  item: MenuItem;
  onCustomize: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onCustomize }) => {
  const { items, addItem, updateQuantity, isOrderCapReached } = useCart();

  // Find all cart entries for this item
  const matchingCartItems = items.filter((ci) => ci.item.id === item.id);
  const totalQuantity = matchingCartItems.reduce((sum, ci) => sum + ci.quantity, 0);

  const isPizza = item.category === 'Pizza';
  const isCustomizable = item.customizable || isPizza;
  const isItemAtMax = totalQuantity >= MAX_ITEM_QTY;
  const isAddDisabled = !item.is_available || isItemAtMax || isOrderCapReached;

  const handleAddClick = () => {
    if (isAddDisabled) return;

    if (isCustomizable) {
      onCustomize(item);
    } else {
      addItem(item);
    }
  };

  const handleMinusClick = () => {
    if (matchingCartItems.length === 1 && !matchingCartItems[0].customization) {
      updateQuantity(matchingCartItems[0].cartId, matchingCartItems[0].quantity - 1);
    } else if (isCustomizable) {
      onCustomize(item);
    } else if (matchingCartItems.length > 0) {
      updateQuantity(matchingCartItems[0].cartId, matchingCartItems[0].quantity - 1);
    }
  };

  return (
    <div
      className={`group relative p-3 sm:p-4 rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
        item.is_available
          ? 'bg-[#18181b]/90 border-stone-800/80 hover:border-amber-500/40 hover:bg-[#1c1c20] shadow-md hover:shadow-xl hover:shadow-amber-500/5'
          : 'bg-stone-900/30 border-stone-800/30 opacity-60'
      }`}
    >
      <div>
        {/* Top visual row: Dish Image & Badges */}
        <div className="relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden mb-3 bg-stone-900 border border-stone-800/60">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-stone-900 to-stone-800">
              🧀
            </div>
          )}

          {/* Gradient Overlay for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

          {/* Top Left: Dietary & Category */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
            <span
              className={`w-4 h-4 rounded border flex items-center justify-center bg-black/60 backdrop-blur-md shadow-sm ${
                item.dietary === 'veg'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-rose-500 text-rose-400'
              }`}
              title={item.dietary === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  item.dietary === 'veg' ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
            </span>

            {/* Badges: Bestseller / Chef's Special / Spicy */}
            {item.badge === 'bestseller' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-stone-950 flex items-center gap-1 shadow-md">
                <Flame className="w-3 h-3 fill-stone-950" />
                <span>BESTSELLER</span>
              </span>
            )}
            {item.badge === 'chef-special' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-purple-500 to-indigo-500 text-white flex items-center gap-1 shadow-md">
                <Sparkles className="w-3 h-3" />
                <span>CHEF SPECIAL</span>
              </span>
            )}
            {item.badge === 'spicy' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white flex items-center gap-1 shadow-md">
                <span>🌶️ SPICY</span>
              </span>
            )}
          </div>

          {/* Top Right: Status or Customizable */}
          <div className="absolute top-2.5 right-2.5 z-10">
            {!item.is_available ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-950/90 text-rose-400 border border-rose-800 shadow-md">
                SOLD OUT
              </span>
            ) : isCustomizable ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-900/90 text-amber-400 border border-amber-500/30 backdrop-blur-md flex items-center gap-1 shadow-md">
                <SlidersHorizontal className="w-2.5 h-2.5" />
                <span>Custom</span>
              </span>
            ) : null}
          </div>

          {/* Bottom Left Price on Image */}
          <div className="absolute bottom-2.5 left-2.5 z-10 flex items-baseline gap-1">
            <span className="text-white font-black text-lg drop-shadow-md">₹{item.base_price}</span>
            {isPizza && <span className="text-[10px] text-stone-300 font-medium drop-shadow">/ 8&quot;</span>}
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-1 mb-3">
          <h3 className="font-bold text-sm sm:text-base text-stone-100 group-hover:text-amber-400 transition-colors leading-snug">
            {item.name}
          </h3>
          <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>
      </div>

      {/* Action Stepper Row */}
      <div className="pt-2 border-t border-stone-800/60 flex items-center justify-between gap-2">
        {/* Quantity Warning Tooltip */}
        <div>
          {isItemAtMax ? (
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              Max 15 limit
            </span>
          ) : isOrderCapReached && totalQuantity === 0 ? (
            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
              Order limit (15)
            </span>
          ) : (
            <span className="text-[11px] text-stone-500 font-medium">
              {isCustomizable ? 'Choice of crust & extra cheese' : 'Freshly prepared'}
            </span>
          )}
        </div>

        {/* Interactive Add / Stepper */}
        {totalQuantity > 0 && !isCustomizable ? (
          <div className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/40 rounded-xl p-1 shadow-sm">
            <button
              onClick={handleMinusClick}
              className="w-7 h-7 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-200 flex items-center justify-center transition-colors active:scale-95"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-black text-amber-400 px-1 min-w-[18px] text-center">
              {totalQuantity}
            </span>
            <button
              onClick={handleAddClick}
              disabled={isItemAtMax || isOrderCapReached}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors active:scale-95 ${
                isItemAtMax || isOrderCapReached
                  ? 'bg-stone-800 text-stone-600 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold'
              }`}
              title={isItemAtMax ? 'Maximum limit of 15 reached' : 'Increase quantity'}
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAddClick}
            disabled={isAddDisabled}
            className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shadow-sm ${
              isAddDisabled
                ? 'bg-stone-800/80 text-stone-600 border border-stone-800 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/20 active:scale-95'
            }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>ADD</span>
            {totalQuantity > 0 && isCustomizable && (
              <span className="ml-1 px-1.5 py-0.2 bg-stone-950 text-amber-400 rounded-full text-[10px] font-black">
                {totalQuantity}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
