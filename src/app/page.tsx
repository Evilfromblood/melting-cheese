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
import { FALLBACK_MENU_ITEMS } from '@/lib/menu-data';
import { createClient } from '@/lib/supabase/client';
import { MenuItem, Order } from '@/types';
import { useCart } from '@/context/CartContext';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

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
  const { totalItemsCount, total, setIsCartOpen, toastMessage } = useCart();
  const supabase = createClient();

  const [menuItems, setMenuItems] = useState<MenuItem[]>(FALLBACK_MENU_ITEMS);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isVegOnly, setIsVegOnly] = useState<boolean>(false);

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

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
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
    });
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
      <main className="max-w-4xl mx-auto px-4 py-5 w-full flex-1">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 space-y-3 bg-[#18181b]/50 border border-stone-800 rounded-3xl p-8">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
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

      {/* Sticky Bottom Floating Checkout Bar (Swiggy/Zomato style) */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-lg mx-auto animate-in slide-in-from-bottom-4 duration-200">
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
      <footer className="mt-auto border-t border-stone-800/80 bg-stone-900/40 py-8 text-center text-xs text-stone-500 space-y-2">
        <div className="font-extrabold text-stone-300 flex items-center justify-center gap-1.5">
          <span>🧀 Melting Cheese - Bhadohi</span>
        </div>
        <p>14, Sant Ravidas Nagar, Bhadohi, Uttar Pradesh • Phone: +91 8090485140</p>
        <p className="text-[11px] text-stone-400">Open Daily till 12:00 AM • Freshly Hand-Stretched Pizzas & Fast Food</p>
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
