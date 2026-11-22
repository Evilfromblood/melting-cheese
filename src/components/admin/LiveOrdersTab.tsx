'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Bell, Volume2, RefreshCw } from 'lucide-react';
import { Order, OrderStatus, PaymentStatus } from '@/types';
import { OrderCard } from './OrderCard';
import { createClient } from '@/lib/supabase/client';
import { playKitchenChime } from '@/lib/sound';

export const LiveOrdersTab: React.FC = () => {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastChimeTime, setLastChimeTime] = useState<string | null>(null);

  // Fetch real orders from Supabase
  const fetchOrders = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Orders fetch note:', error.message);
      } else if (data) {
        setOrders(data);
      }
    } catch (err) {
      console.warn('Could not fetch orders from Supabase:', err);
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchOrders();

    // Supabase Realtime subscription on `orders` table
    const channel = supabase
      .channel('kitchen:orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const newOrder = payload.new as Order;
          setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);

          // Play Audio Chime
          playKitchenChime();
          setLastChimeTime(new Date().toLocaleTimeString());
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          const updated = payload.new as Order;
          setOrders((prev) =>
            prev.map((o) => (o.id === updated.id ? updated : o))
          );
        }
      )
      .subscribe();

    // 10-second polling fallback to guarantee real-time sync under network fluctuations
    const pollInterval = setInterval(() => {
      fetchOrders(true);
    }, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [supabase, fetchOrders]);

  // Handle status update
  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, order_status: status } : o))
    );

    try {
      await supabase
        .from('orders')
        .update({ order_status: status })
        .eq('id', orderId);
    } catch (err) {
      console.error('Failed to update status in Supabase:', err);
    }
  };

  // Handle payment status toggle
  const handleTogglePaymentStatus = async (
    orderId: string,
    currentStatus: PaymentStatus
  ) => {
    const newStatus: PaymentStatus = currentStatus === 'PAID' ? 'PENDING' : 'PAID';

    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, payment_status: newStatus } : o))
    );

    try {
      await supabase
        .from('orders')
        .update({ payment_status: newStatus })
        .eq('id', orderId);
    } catch (err) {
      console.error('Failed to update payment status in Supabase:', err);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filterStatus === 'ALL') return true;
    return order.order_status === filterStatus;
  });

  const activeCount = orders.filter(
    (o) => o.order_status === 'NEW' || o.order_status === 'PREPARING'
  ).length;

  return (
    <div className="space-y-6">
      {/* Realtime Status Bar */}
      <div className="bg-[#18181b] border border-stone-800 rounded-3xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Bell className="w-5 h-5 animate-pulse-subtle" />
            </div>
            {activeCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </div>
          <div>
            <div className="font-bold text-sm text-white flex items-center gap-2">
              <span>Live Kitchen Order Feed</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div className="text-xs text-stone-400">
              Connected to Supabase Realtime • Auto-refreshing every 10s
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Test Chime Sound button */}
          <button
            onClick={() => {
              playKitchenChime();
              setLastChimeTime(new Date().toLocaleTimeString());
            }}
            className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-300 flex items-center gap-1.5 transition-colors"
            title="Test audio chime"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Chime</span>
          </button>

          {/* Refresh Orders */}
          <button
            onClick={() => fetchOrders(false)}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
            title="Refresh order feed"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {lastChimeTime && (
        <div className="text-[11px] text-amber-400/90 bg-amber-950/30 px-3.5 py-1.5 rounded-xl border border-amber-500/20 flex items-center gap-2">
          <Volume2 className="w-3.5 h-3.5 shrink-0" />
          <span>Kitchen chime active • Last alert triggered at {lastChimeTime}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { key: 'ALL', label: 'All Orders' },
          { key: 'NEW', label: 'New' },
          { key: 'PREPARING', label: 'Preparing' },
          { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
          { key: 'DELIVERED', label: 'Completed' },
          { key: 'CANCELLED', label: 'Cancelled' },
        ].map(({ key, label }) => {
          const count =
            key === 'ALL'
              ? orders.length
              : orders.filter((o) => o.order_status === key).length;
          const isActive = filterStatus === key;
          return (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20 font-bold'
                  : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              <span>{label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? 'bg-amber-600/50 text-stone-950 font-black'
                    : 'bg-stone-800 text-stone-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-[#18181b]/50 border border-stone-800/80 rounded-3xl space-y-3">
          <div className="text-4xl">📋</div>
          <h3 className="font-bold text-base text-stone-200">No {filterStatus.toLowerCase()} orders</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Live orders submitted by customers from the storefront will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onUpdateStatus={handleUpdateStatus}
              onTogglePaymentStatus={handleTogglePaymentStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
};
