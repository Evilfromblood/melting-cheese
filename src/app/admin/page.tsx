'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { LiveOrdersTab } from '@/components/admin/LiveOrdersTab';
import { StockToggleTab } from '@/components/admin/StockToggleTab';
import { ChefHat, ShoppingBag, Layers, LogOut, ArrowLeft, Loader2 } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

export default function AdminDashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'stock'>('orders');

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          setUser(session.user);
        } else {
          router.replace('/admin/login');
        }
      } catch (err) {
        console.warn('Auth check error:', err);
        router.replace('/admin/login');
      } finally {
        setIsCheckingAuth(false);
      }
    }

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session && session.user) {
          setUser(session.user);
        } else {
          setUser(null);
          router.replace('/admin/login');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/admin/login');
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#121214] flex flex-col items-center justify-center text-stone-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <span className="text-sm font-semibold">Verifying Kitchen Staff Access...</span>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#121214] text-stone-100 flex flex-col">
      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-30 bg-[#17171a]/95 backdrop-blur-md border-b border-stone-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-9 h-9 rounded-xl bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-400 hover:text-white transition-colors"
              title="View Storefront"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <ChefHat className="w-5 h-5 text-stone-950" />
              </div>
              <div>
                <h1 className="font-extrabold text-base sm:text-lg text-white leading-none">
                  Kitchen Dashboard
                </h1>
                <div className="text-[11px] text-stone-400 mt-1 flex items-center gap-1.5">
                  <span>Melting Cheese • Bhadohi</span>
                  <span className="text-stone-600">•</span>
                  <span className="text-amber-400 font-mono text-[10px]">{user.email}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSignOut}
              className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-rose-950/60 border border-stone-700 hover:border-rose-800 text-stone-300 hover:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="max-w-6xl mx-auto px-4 pt-1 flex gap-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'orders'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Live Orders Feed</span>
          </button>

          <button
            onClick={() => setActiveTab('stock')}
            className={`pb-3 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'stock'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Stock & Inventory (29 items)</span>
          </button>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 w-full flex-1">
        {activeTab === 'orders' ? <LiveOrdersTab /> : <StockToggleTab />}
      </main>
    </div>
  );
}
