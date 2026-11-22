'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/storefront/Header';
import { CategoryBar } from '@/components/storefront/CategoryBar';
import { MenuItemCard } from '@/components/storefront/MenuItemCard';
import { PizzaCustomizerSheet } from '@/components/storefront/PizzaCustomizerSheet';
import { CartDrawer } from '@/components/storefront/CartDrawer';
import { CheckoutModal } from '@/components/storefront/CheckoutModal';
import { OrderSuccessModal } from '@/components/storefront/OrderSuccessModal';
import { WhatsAppButton } from '@/components/storefront/WhatsAppButton';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { FALLBACK_MENU_ITEMS } from '@/lib/menu-data';
import { createClient } from '@/lib/supabase/client';
import { MenuItem, Order } from '@/types';
import { useCart } from '@/context/CartContext';
import { ArrowRight, CheckCircle2, MessageCircle, MapPin, Phone, Sparkles } from 'lucide-react';

const CATEGORIES = [
  'Pizza',
  'Burgers',
  'Snacks',
  'Chicken Wings & Strips',
  'Mocktails',
];

function PromoUrlListener() {
  const searchParams = useSearchParams();
  const { applyPromo } = useCart();

  useEffect(() => {
    const promo = searchParams.get('promo');
    if (promo && promo.toUpperCase() === 'DIRECT50') {
      applyPromo('DIRECT50');
    }
  }, [searchParams, applyPromo]);

  return null;
}

export default function StorefrontPage() {
  const {
    totalItemsCount,
    total,
    subtotal,
    inStockSubtotal,
    hasOutOfStockItems,
    promoUnlocked,
    promoTargetRemaining,
    setIsCartOpen,
    toastMessage,
    syncMenuAvailability,
  } = useCart();
  const supabase = createClient();

  const [menuItems, setMenuItems] = useState<MenuItem[]>(FALLBACK_MENU_ITEMS);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isVegOnly, setIsVegOnly] = useState<boolean>(false);

  // Sync cart item availability whenever menu items update
  useEffect(() => {
    if (menuItems.length > 0) {
      syncMenuAvailability(menuItems);
    }
  }, [menuItems, syncMenuAvailability]);

  // Modals state
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [successOrder, setSuccessOrder] = useState<{
    order: Partial<Order>;
    whatsappUrl: string;
  } | null>(null);

  // Load menu from Supabase if available
  useEffect(() => {
    let isMounted = true;

    async function loadMenu() {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .order('category')
          .order('name');

        if (error) {
          console.warn('Supabase menu_items fetch note (using fallback):', error.message);
        } else if (data && data.length > 0 && isMounted) {
          console.log(`Loaded ${data.length} items from Supabase menu_items.`);
          setMenuItems(data);
        }
      } catch (err) {
        console.warn('Using local fallback menu items:', err);
      }
    }

    loadMenu();

    // Listen to realtime stock updates on menu_items
    const channel = supabase
      .channel('public:menu_items')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menu_items' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as MenuItem;
            setMenuItems((prev) =>
              prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
            );
          } else if (payload.eventType === 'INSERT') {
            const newItem = payload.new as MenuItem;
            setMenuItems((prev) => [...prev, newItem]);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Calculate counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: 0 };
    CATEGORIES.forEach((cat) => (counts[cat] = 0));

    menuItems.forEach((item) => {
      if (isVegOnly && item.dietary !== 'veg') return;
      counts['All'] = (counts['All'] || 0) + 1;
      if (counts[item.category] !== undefined) {
        counts[item.category]++;
      }
    });

    return counts;
  }, [menuItems, isVegOnly]);

  // Filtered menu items (In-stock items always sorted to the top)
  const filteredItems = useMemo(() => {
    return menuItems
      .filter((item) => {
        // Category filter
        if (activeCategory !== 'All' && item.category !== activeCategory) {
          return false;
        }
        // Veg filter
        if (isVegOnly && item.dietary !== 'veg') {
          return false;
        }
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const matchCat = item.category.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          if (!matchName && !matchCat && !matchDesc) return false;
        }
        return true;
      })
      .sort((a, b) => Number(b.is_available !== false) - Number(a.is_available !== false));
  }, [menuItems, activeCategory, isVegOnly, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col pb-28 bg-[#121214]">
      <Suspense fallback={null}>
        <PromoUrlListener />
      </Suspense>

      {/* Header */}
      <Header />

      {/* Category & Search Navigation */}
      <CategoryBar
        categories={CATEGORIES}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isVegOnly={isVegOnly}
        onToggleVegOnly={() => setIsVegOnly((prev) => !prev)}
        categoryCounts={categoryCounts}
      />

      {/* Main Menu Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 space-y-3 bg-[#18181b]/50 border border-stone-800 rounded-3xl p-8 max-w-xl mx-auto">
            <div className="text-4xl">🔍</div>
            <h3 className="font-bold text-base text-stone-200">No matching dishes found</h3>
            <p className="text-xs text-stone-400">
              Try modifying your search or clearing the veg-only filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setIsVegOnly(false);
                setActiveCategory('All');
              }}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onCustomize={(i) => setCustomizingItem(i)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Subtle Non-Blocking Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#1e1e24]/95 border border-amber-500/50 text-stone-100 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating WhatsApp Business Support Button */}
      <WhatsAppButton />

      {/* Sticky Bottom Floating Checkout Bar (Swiggy/Zomato style) */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-lg mx-auto animate-in slide-in-from-bottom-4 duration-200 space-y-1.5">
          {/* Live Offer Progress Strip */}
          <div
            onClick={() => setIsCartOpen(true)}
            className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-between shadow-lg backdrop-blur-md border cursor-pointer active:scale-[0.99] transition-all ${
              hasOutOfStockItems
                ? 'bg-rose-950/95 text-rose-300 border-rose-500/50'
                : promoUnlocked
                ? 'bg-emerald-950/95 text-emerald-300 border-emerald-500/50'
                : 'bg-[#18181b]/95 text-amber-300 border-amber-500/35'
            }`}
          >
            {hasOutOfStockItems ? (
              <span className="flex items-center gap-1.5 text-rose-300 font-bold truncate">
                <span>⚠️</span>
                <span>Sold out item in cart — tap to remove</span>
              </span>
            ) : promoUnlocked ? (
              <span className="flex items-center gap-1.5 truncate">
                <span>🎉</span>
                <span>DIRECT50 Unlocked: You saved ₹50 + FREE Fries added!</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 truncate">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>DIRECT50 active! Add ₹{promoTargetRemaining} more for ₹50 OFF + FREE Fries</span>
              </span>
            )}
            <span className="text-[10px] font-mono font-black text-amber-400 shrink-0 ml-1.5">
              ₹{inStockSubtotal}/₹299
            </span>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full p-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black rounded-2xl shadow-2xl shadow-amber-500/30 flex items-center justify-between active:scale-[0.98] transition-all border border-amber-300/40"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-stone-950 text-amber-400 flex items-center justify-center font-black text-sm shadow-inner">
                {totalItemsCount}
              </div>
              <div className="text-left">
                <div className="text-[11px] font-black uppercase tracking-wider text-stone-950/80 leading-none">
                  VIEW CART
                </div>
                <div className="text-base font-black leading-none mt-1 text-stone-950">
                  ₹{total}
                  <span className="text-[10px] font-semibold text-stone-800 ml-1.5">
                    (plus free extras)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-black bg-stone-950 text-amber-400 px-3.5 py-2 rounded-xl shadow-sm">
              <span>Checkout</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-800/80 bg-stone-900/50 py-10 px-4 text-center text-xs text-stone-400 space-y-4">
        <div className="flex justify-center">
          <BrandLogo size="md" showText={true} />
        </div>
        
        <div className="max-w-md mx-auto space-y-1.5 text-stone-400">
          <p className="flex items-center justify-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>14, Sant Ravidas Nagar, Bhadohi, Uttar Pradesh</span>
          </p>
          <p className="flex items-center justify-center gap-2">
            <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <a href="tel:+918090485140" className="hover:text-white font-mono">+91 8090485140</a>
            <span>•</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Business Verified</span>
            </span>
          </p>
          <p className="text-[11px] text-stone-500 pt-1">
            Open Daily till 12:00 AM • Freshly Hand-Stretched Pizzas, Burgers & Fast Food
          </p>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <PizzaCustomizerSheet
        item={customizingItem}
        onClose={() => setCustomizingItem(null)}
      />

      <CartDrawer
        onCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={(order, whatsappUrl) => {
          setSuccessOrder({ order, whatsappUrl });
        }}
      />

      {successOrder && (
        <OrderSuccessModal
          order={successOrder.order}
          whatsappUrl={successOrder.whatsappUrl}
          onClose={() => setSuccessOrder(null)}
        />
      )}
    </div>
  );
}
