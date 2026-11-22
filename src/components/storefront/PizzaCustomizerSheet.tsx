'use client';

import React, { useState } from 'react';
import { X, Check, Sparkles, AlertCircle } from 'lucide-react';
import { MenuItem, PizzaCustomization } from '@/types';
import { useCart } from '@/context/CartContext';

interface PizzaCustomizerSheetProps {
  item: MenuItem | null;
  onClose: () => void;
}

export const PizzaCustomizerSheet: React.FC<PizzaCustomizerSheetProps> = ({
  item,
  onClose,
}) => {
  const { addItem, isOrderCapReached } = useCart();

  const [crust, setCrust] = useState<'Standard' | 'Cheese Burst'>('Standard');
  const [extraCheese, setExtraCheese] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!item) return null;

  const crustAddon = crust === 'Cheese Burst' ? 120 : 0;
  const cheeseAddon = extraCheese ? 40 : 0;
  const unitPrice = item.base_price + crustAddon + cheeseAddon;

  const handleAddToCart = () => {
    setErrorMessage(null);
    const customization: PizzaCustomization = {
      crust,
      extraCheese,
    };
    const res = addItem(item, customization);
    if (!res.success) {
      setErrorMessage(res.message || 'Cannot add more items');
      return;
    }
    // Closes sheet without auto-opening the cart drawer
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#1a1a1e] border-t sm:border border-stone-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-start justify-between bg-stone-900/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                  item.dietary === 'veg'
                    ? 'border-emerald-600 bg-emerald-950/40'
                    : 'border-rose-600 bg-rose-950/40'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    item.dietary === 'veg' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
              </span>
              <span className="text-xs font-semibold text-stone-400">Customize Your Crust & Cheese</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">{item.name}</h2>
            <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{item.description}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Customization Options Body */}
        <div className="p-5 space-y-6 overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Crust Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-stone-200 flex items-center gap-1.5">
                <span>Select Crust Style</span>
                <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-semibold">
                  Required
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Standard Crust */}
              <button
                type="button"
                onClick={() => setCrust('Standard')}
                className={`p-3.5 rounded-2xl border text-left flex items-start justify-between transition-all ${
                  crust === 'Standard'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-md shadow-amber-500/10'
                    : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                <div>
                  <div className="font-bold text-sm">Standard Crust</div>
                  <div className="text-xs text-stone-400 mt-0.5">Classic hand-stretched crust</div>
                  <div className="text-xs font-semibold mt-1 text-stone-300">+₹0</div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    crust === 'Standard'
                      ? 'border-amber-500 bg-amber-500 text-stone-950'
                      : 'border-stone-600'
                  }`}
                >
                  {crust === 'Standard' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>

              {/* Cheese Burst */}
              <button
                type="button"
                onClick={() => setCrust('Cheese Burst')}
                className={`p-3.5 rounded-2xl border text-left flex items-start justify-between transition-all ${
                  crust === 'Cheese Burst'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-md shadow-amber-500/10'
                    : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                <div>
                  <div className="font-bold text-sm flex items-center gap-1">
                    <span>Cheese Burst</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-xs text-stone-400 mt-0.5">Molten cheese stuffed inside crust</div>
                  <div className="text-xs font-semibold mt-1 text-amber-400">+₹120</div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    crust === 'Cheese Burst'
                      ? 'border-amber-500 bg-amber-500 text-stone-950'
                      : 'border-stone-600'
                  }`}
                >
                  {crust === 'Cheese Burst' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            </div>
          </div>

          {/* Add Extra Cheese Option */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-stone-200">
                Extra Cheese Add-on
              </label>
              <span className="text-xs text-stone-500">Optional</span>
            </div>

            <button
              type="button"
              onClick={() => setExtraCheese(!extraCheese)}
              className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                extraCheese
                  ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-sm'
                  : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🧀</span>
                <div>
                  <div className="font-bold text-sm text-stone-100">Extra Melted Cheese</div>
                  <div className="text-xs text-stone-400">Generous layer of fresh mozzarella</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-amber-400">+₹40</span>
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                    extraCheese
                      ? 'border-amber-500 bg-amber-500 text-stone-950'
                      : 'border-stone-600'
                  }`}
                >
                  {extraCheese && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer with Price & Add to Cart button */}
        <div className="p-4 sm:p-5 bg-stone-900/80 border-t border-stone-800 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-stone-400">Item Total</div>
            <div className="text-2xl font-black text-amber-400">₹{unitPrice}</div>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isOrderCapReached}
            className={`flex-1 max-w-xs py-3 px-6 rounded-2xl font-black text-sm tracking-wide text-center transition-all ${
              isOrderCapReached
                ? 'bg-stone-800 text-stone-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-lg shadow-amber-500/20 active:scale-95'
            }`}
          >
            {isOrderCapReached ? 'Order Cap Reached (15)' : `Add to Order • ₹${unitPrice}`}
          </button>
        </div>
      </div>
    </div>
  );
};
