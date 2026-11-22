'use client';

import React from 'react';
import { X, Trash2, Plus, Minus, Gift, Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useCart, MAX_ITEM_QTY, MAX_ORDER_ITEMS } from '@/context/CartContext';
import confetti from 'canvas-confetti';

interface CartDrawerProps {
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout }) => {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    promoCode,
    isPromoApplied,
    applyPromo,
    removePromo,
    subtotal,
    discount,
    freeItem,
    total,
    promoTargetRemaining,
    promoUnlocked,
    totalItemsCount,
    isOrderCapReached,
  } = useCart();

  if (!isCartOpen) return null;

  const progressPercentage = Math.min(100, Math.round((subtotal / 299) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-[#161619] border-l border-stone-800 text-stone-100 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-900/60">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛒</span>
              <div>
                <h2 className="font-extrabold text-base sm:text-lg">Your Cart</h2>
                <p className="text-xs text-stone-400">
                  {totalItemsCount} / {MAX_ORDER_ITEMS} items selected
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-stone-400 hover:text-rose-400 text-xs flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-stone-800 transition-colors"
                  title="Clear all items"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cart Cap Notice if reached */}
          {isOrderCapReached && (
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-[11px] font-bold text-amber-400 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Maximum order capacity reached ({MAX_ORDER_ITEMS} items cap).</span>
            </div>
          )}

          {/* Cart Items List */}
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-stone-900 flex items-center justify-center text-3xl border border-stone-800">
                🍕
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Your cart is empty</h3>
                <p className="text-xs text-stone-400 max-w-xs mt-1">
                  Explore our crispy burgers, cheese burst pizzas, fries, and cool mocktails!
                </p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors shadow-lg shadow-amber-500/20"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* Offer Progress Card */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  promoUnlocked
                    ? 'bg-emerald-950/40 border-emerald-500/40'
                    : 'bg-amber-500/10 border-amber-500/25'
                }`}
              >
                {promoUnlocked ? (
                  <div className="flex items-center gap-2.5 text-xs font-bold text-emerald-400">
                    <span className="text-base shrink-0">🎉</span>
                    <div className="flex-1">
                      <div className="text-emerald-300 font-extrabold text-xs">
                        🎉 DIRECT50 Unlocked!
                      </div>
                      <div className="text-[11px] text-emerald-400/90 font-medium">
                        You saved ₹50 + FREE Salted Fries added!
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-amber-300">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>DIRECT50 active!</span>
                      </div>
                      <span className="font-mono font-bold text-amber-400 text-[11px]">
                        ₹{subtotal} / ₹299
                      </span>
                    </div>

                    <div className="text-xs text-stone-300 font-medium leading-tight">
                      DIRECT50 active! Add <span className="font-extrabold text-amber-400">₹{promoTargetRemaining}</span> more to unlock <span className="text-white font-bold">₹50 OFF + FREE Salted Fries</span>
                    </div>

                    <div className="w-full bg-stone-800/80 h-2 rounded-full overflow-hidden border border-stone-700/40">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {items.map((cartItem) => {
                  const isItemAtMax = cartItem.quantity >= MAX_ITEM_QTY;
                  const canIncrement = !isItemAtMax && !isOrderCapReached;

                  return (
                    <div
                      key={cartItem.cartId}
                      className="p-3 bg-stone-900/60 border border-stone-800/80 rounded-2xl flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-3 h-3 rounded border flex items-center justify-center shrink-0 ${
                              cartItem.item.dietary === 'veg'
                                ? 'border-emerald-600'
                                : 'border-rose-600'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                cartItem.item.dietary === 'veg'
                                  ? 'bg-emerald-500'
                                  : 'bg-rose-500'
                              }`}
                            />
                          </span>
                          <h4 className="font-bold text-sm text-stone-200 truncate">
                            {cartItem.item.name}
                          </h4>
                        </div>

                        {/* Customization Details */}
                        {cartItem.customization && (
                          <div className="flex flex-wrap gap-1 mt-1 text-[11px] text-amber-400/90">
                            <span className="bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                              {cartItem.customization.crust}
                            </span>
                            {cartItem.customization.extraCheese && (
                              <span className="bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                + Extra Cheese
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-stone-400">
                            ₹{cartItem.unitPrice} each
                          </span>
                          {isItemAtMax && (
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                              Max 15 limit
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls & Total */}
                      <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-stone-100">
                            ₹{cartItem.totalPrice}
                          </span>
                          <button
                            onClick={() => removeItem(cartItem.cartId)}
                            className="text-stone-500 hover:text-rose-400 p-0.5 rounded transition-colors"
                            title="Remove from cart"
                            aria-label="Remove item from cart"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 bg-stone-800 border border-stone-700/60 rounded-xl px-1.5 py-0.5">
                          <button
                            onClick={() => updateQuantity(cartItem.cartId, cartItem.quantity - 1)}
                            className="w-5 h-5 rounded hover:bg-stone-700 flex items-center justify-center text-stone-300 hover:text-rose-400 active:scale-95 transition-transform"
                            title={cartItem.quantity === 1 ? 'Remove item' : 'Decrease quantity'}
                            aria-label="Decrease quantity"
                          >
                            {cartItem.quantity === 1 ? (
                              <Trash2 className="w-3 h-3 text-stone-400 hover:text-rose-400" />
                            ) : (
                              <Minus className="w-3 h-3" />
                            )}
                          </button>
                          <span className="text-xs font-black text-amber-400 px-1">
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(cartItem.cartId, cartItem.quantity + 1)}
                            disabled={!canIncrement}
                            className={`w-5 h-5 rounded flex items-center justify-center transition-transform active:scale-95 ${
                              canIncrement
                                ? 'hover:bg-stone-700 text-stone-300'
                                : 'text-stone-600 cursor-not-allowed'
                            }`}
                            title={isItemAtMax ? 'Item limit 15 reached' : 'Increase quantity'}
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Free Item Indicator */}
                {freeItem && (
                  <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-emerald-400">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold">{freeItem}</div>
                        <div className="text-[10px] text-emerald-500/80">DIRECT50 Special Reward</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider bg-emerald-900/60 px-2 py-0.5 rounded text-emerald-300">
                      FREE
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer & Bill Breakdown */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 bg-stone-900 border-t border-stone-800 space-y-3">
              <div className="space-y-1.5 text-xs text-stone-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-stone-200">₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Promo Discount (DIRECT50)</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                {freeItem && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Free Perk</span>
                    <span>1x Salted Fries (₹0)</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="text-emerald-400 font-semibold">FREE (Bhadohi Direct)</span>
                </div>
                <div className="pt-2 border-t border-stone-800 flex justify-between text-base font-black text-white">
                  <span>To Pay</span>
                  <span className="text-amber-400 text-lg">₹{total}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onCheckout();
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
