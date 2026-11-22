'use client';

import React, { useState, useEffect } from 'react';
import { FALLBACK_MENU_ITEMS } from '@/lib/menu-data';
import { createClient } from '@/lib/supabase/client';
import { MenuItem } from '@/types';
import { Check, X, Search, Sparkles, Flame } from 'lucide-react';

export const StockToggleTab: React.FC = () => {
  const supabase = createClient();
  const [items, setItems] = useState<MenuItem[]>(FALLBACK_MENU_ITEMS);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadItems() {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .order('category')
          .order('name');

        if (!error && data && data.length > 0) {
          setItems(data);
        }
      } catch (err) {
        console.warn('Using fallback items for stock management:', err);
      }
    }

    loadItems();
  }, [supabase]);

  const handleToggleStock = async (item: MenuItem) => {
    const newStatus = !item.is_available;
    setUpdatingId(item.id);

    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_available: newStatus } : i))
    );

    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available: newStatus })
        .eq('id', item.id);

      if (error) {
        console.warn('Failed to update stock in Supabase:', error.message);
      }
    } catch (err) {
      console.warn('Failed to update stock status in Supabase:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const categories = ['All', 'Pizza', 'Burgers', 'Snacks', 'Chicken Wings & Strips', 'Mocktails'];

  const filteredItems = items.filter((item) => {
    if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const availableCount = items.filter((i) => i.is_available).length;
  const soldOutCount = items.length - availableCount;

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-[#18181b] border border-stone-800 rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Inventory & Stock Management</span>
            <span className="text-amber-400 font-normal text-xs">(29 Items Total)</span>
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Instantly toggle items In Stock or Sold Out. Changes propagate in realtime to customer menus.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs font-semibold">
            {availableCount} In Stock
          </div>
          {soldOutCount > 0 && (
            <div className="px-3.5 py-1.5 rounded-2xl bg-rose-950/40 border border-rose-800/40 text-rose-400 text-xs font-semibold">
              {soldOutCount} Sold Out
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dish name to toggle stock..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20 font-bold'
                  : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items List Table */}
      <div className="bg-[#18181b] border border-stone-800 rounded-3xl overflow-hidden shadow-lg divide-y divide-stone-800/60">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-3.5 sm:p-4 flex items-center justify-between gap-4 hover:bg-stone-900/50 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Thumbnail */}
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-11 h-11 rounded-xl object-cover shrink-0 border border-stone-800"
                />
              )}

              <div className="min-w-0">
                <div className="font-bold text-sm text-stone-100 flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded border flex items-center justify-center shrink-0 ${
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
                  <span className="truncate">{item.name}</span>
                  {item.badge === 'bestseller' && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold">
                      Bestseller
                    </span>
                  )}
                </div>
                <div className="text-xs text-amber-400 font-semibold mt-0.5 flex items-center gap-2">
                  <span>₹{item.base_price}</span>
                  <span className="text-[10px] text-stone-500 uppercase tracking-wider font-mono">
                    {item.category}
                  </span>
                </div>
              </div>
            </div>

            {/* In Stock / Sold Out Toggle Button */}
            <button
              onClick={() => handleToggleStock(item)}
              disabled={updatingId === item.id}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all shrink-0 ${
                item.is_available
                  ? 'bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-500/40 text-emerald-400'
                  : 'bg-rose-950/40 hover:bg-rose-900/50 border-rose-500/40 text-rose-400'
              }`}
            >
              {item.is_available ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>IN STOCK</span>
                </>
              ) : (
                <>
                  <X className="w-3.5 h-3.5" />
                  <span>SOLD OUT</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
