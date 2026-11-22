'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, MenuItem, PizzaCustomization } from '@/types';

export const MAX_ITEM_QTY = 15;
export const MAX_ORDER_ITEMS = 15;

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem, customization?: PizzaCustomization) => { success: boolean; message?: string };
  removeItem: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => { success: boolean; message?: string };
  clearCart: () => void;
  promoCode: string;
  isPromoApplied: boolean;
  applyPromo: (code: string) => { success: boolean; message: string };
  removePromo: () => void;
  subtotal: number;
  discount: number;
  freeItem: string | null;
  total: number;
  promoTargetRemaining: number;
  promoUnlocked: boolean;
  totalItemsCount: number;
  isOrderCapReached: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  toastMessage: string | null;
  showToast: (message: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const PROMO_NAME = 'DIRECT50';
const PROMO_THRESHOLD = 299;
const PROMO_DISCOUNT = 50;
const PROMO_FREE_ITEM = '1x FREE Salted Fries';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState<string>('');
  const [isPromoApplied, setIsPromoApplied] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 2400);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Load cart and check URL promo on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('melting_cheese_cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }

      const savedPromo = localStorage.getItem('melting_cheese_promo');
      if (savedPromo === PROMO_NAME) {
        setPromoCode(PROMO_NAME);
        setIsPromoApplied(true);
      }

      // Check URL parameters
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const urlPromo = urlParams.get('promo');
        if (urlPromo && urlPromo.toUpperCase() === PROMO_NAME) {
          setPromoCode(PROMO_NAME);
          setIsPromoApplied(true);
          localStorage.setItem('melting_cheese_promo', PROMO_NAME);
        }
      }
    } catch (e) {
      console.warn('Error reading cart from localStorage', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem('melting_cheese_cart', JSON.stringify(items));
    } catch (e) {
      console.warn('Error saving cart to localStorage', e);
    }
  }, [items, isInitialized]);

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const isOrderCapReached = totalItemsCount >= MAX_ORDER_ITEMS;

  const addItem = (item: MenuItem, customization?: PizzaCustomization): { success: boolean; message?: string } => {
    let unitPrice = item.base_price;
    let cartId = item.id;

    if (customization) {
      if (customization.crust === 'Cheese Burst') {
        unitPrice += 120;
      }
      if (customization.extraCheese) {
        unitPrice += 40;
      }
      cartId = `${item.id}-${customization.crust}-${customization.extraCheese ? 'extraCheese' : 'standard'}`;
    }

    // Check order total cap
    if (totalItemsCount >= MAX_ORDER_ITEMS) {
      showToast(`Order limit of ${MAX_ORDER_ITEMS} items reached!`);
      return { success: false, message: `Maximum order limit of ${MAX_ORDER_ITEMS} items reached!` };
    }

    const existing = items.find((i) => i.cartId === cartId);
    if (existing) {
      if (existing.quantity >= MAX_ITEM_QTY) {
        showToast(`Max limit of ${MAX_ITEM_QTY} reached for this item!`);
        return { success: false, message: `Max limit of ${MAX_ITEM_QTY} reached for this item!` };
      }

      setItems((prev) =>
        prev.map((i) =>
          i.cartId === cartId
            ? { ...i, quantity: i.quantity + 1, totalPrice: (i.quantity + 1) * i.unitPrice }
            : i
        )
      );
      showToast(`Added to cart: ${item.name}`);
      return { success: true };
    }

    setItems((prev) => [
      ...prev,
      {
        cartId,
        item,
        quantity: 1,
        customization,
        unitPrice,
        totalPrice: unitPrice,
      },
    ]);
    showToast(`Added to cart: ${item.name}`);
    return { success: true };
  };

  const removeItem = (cartId: string) => {
    setItems((prev) => prev.filter((i) => i.cartId !== cartId));
  };

  const updateQuantity = (cartId: string, quantity: number): { success: boolean; message?: string } => {
    if (quantity <= 0) {
      removeItem(cartId);
      return { success: true };
    }

    // Check item cap
    if (quantity > MAX_ITEM_QTY) {
      showToast(`Max limit of ${MAX_ITEM_QTY} reached!`);
      return { success: false, message: `Max limit of ${MAX_ITEM_QTY} reached for this item!` };
    }

    // Check order total cap
    const targetItem = items.find((i) => i.cartId === cartId);
    if (!targetItem) return { success: false };

    const diff = quantity - targetItem.quantity;
    if (diff > 0 && totalItemsCount + diff > MAX_ORDER_ITEMS) {
      showToast(`Order limit of ${MAX_ORDER_ITEMS} items reached!`);
      return { success: false, message: `Maximum order limit of ${MAX_ORDER_ITEMS} items reached!` };
    }

    setItems((prev) =>
      prev.map((i) =>
        i.cartId === cartId
          ? { ...i, quantity, totalPrice: quantity * i.unitPrice }
          : i
      )
    );
    return { success: true };
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem('melting_cheese_cart');
    } catch (e) {
      console.warn('Error clearing cart from storage', e);
    }
  };

  const applyPromo = (code: string) => {
    const formatted = code.trim().toUpperCase();
    if (formatted === PROMO_NAME) {
      setPromoCode(PROMO_NAME);
      setIsPromoApplied(true);
      try {
        localStorage.setItem('melting_cheese_promo', PROMO_NAME);
      } catch (e) {
        console.warn('Error saving promo to localStorage', e);
      }
      return { success: true, message: 'DIRECT50 promo code applied!' };
    }
    return { success: false, message: 'Invalid promo code. Use DIRECT50' };
  };

  const removePromo = () => {
    setPromoCode('');
    setIsPromoApplied(false);
    try {
      localStorage.removeItem('melting_cheese_promo');
    } catch (e) {
      console.warn('Error removing promo from localStorage', e);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  // Promo Calculation
  const promoUnlocked = isPromoApplied && subtotal >= PROMO_THRESHOLD;
  const promoTargetRemaining = isPromoApplied ? Math.max(0, PROMO_THRESHOLD - subtotal) : 0;
  const discount = promoUnlocked ? PROMO_DISCOUNT : 0;
  const freeItem = promoUnlocked ? PROMO_FREE_ITEM : null;
  const total = Math.max(0, subtotal - discount);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
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
        isCartOpen,
        setIsCartOpen,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
