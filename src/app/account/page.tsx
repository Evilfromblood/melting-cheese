'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { useCart } from '@/context/CartContext';
import { Order, CustomerProfile, OrderStatus } from '@/types';
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle2, 
  Truck, 
  ShoppingBag, 
  LogOut, 
  MessageCircle, 
  Navigation, 
  Save, 
  Loader2,
  Package,
  RefreshCw
} from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClient();
  const { addItem, setIsCartOpen } = useCart();

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  // Profile form state
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [defaultAddress, setDefaultAddress] = useState('');
  const [gpsLink, setGpsLink] = useState('');

  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user) {
          router.replace('/login');
          return;
        }

        setUser(session.user);

        // Fetch customer profile
        const { data: profileData } = await supabase
          .from('customer_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
          setFullName(profileData.full_name || '');
          setPhoneNumber(profileData.phone || '');
          setDefaultAddress(profileData.default_address || '');
          setGpsLink(profileData.gps_link || '');
        } else {
          // Defaults from auth metadata
          setFullName(session.user.user_metadata?.full_name || '');
          setPhoneNumber(session.user.user_metadata?.phone || '');
        }

        // Fetch user's orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (!ordersError && ordersData) {
          setOrders(ordersData);
        }
      } catch (err) {
        console.warn('Error loading account data:', err);
      } finally {
        setIsCheckingAuth(false);
      }
    }

    loadUserData();

    // Setup realtime subscription on user's orders
    const channel = supabase
      .channel('customer:orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as Order;
            setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Order;
            setOrders((prev) =>
              prev.map((o) => (o.id === updated.id ? updated : o))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router, supabase]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSavingProfile(true);
    setProfileSavedMsg(false);

    try {
      const updatedProfile = {
        id: user.id,
        full_name: fullName.trim(),
        phone: phoneNumber.trim(),
        default_address: defaultAddress.trim(),
        gps_link: gpsLink.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('customer_profiles')
        .upsert(updatedProfile);

      if (!error) {
        setProfile(updatedProfile);
        setProfileSavedMsg(true);
        setTimeout(() => setProfileSavedMsg(false), 3000);
      }
    } catch (err) {
      console.warn('Could not save profile:', err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  const getStatusStep = (status: OrderStatus) => {
    switch (status) {
      case 'NEW':
        return 1;
      case 'PREPARING':
        return 2;
      case 'OUT_FOR_DELIVERY':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return 1;
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#121214] flex flex-col items-center justify-center text-stone-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <span className="text-sm font-semibold">Loading your Melting Cheese profile...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121214] text-stone-100 flex flex-col pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#161619]/95 backdrop-blur-md border-b border-stone-800">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-9 h-9 rounded-2xl bg-stone-900 border border-stone-800 hover:border-amber-500/40 flex items-center justify-center text-stone-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <BrandLogo size="sm" showText={true} />
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Menu</span>
            </Link>

            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-rose-950/60 border border-stone-800 hover:border-rose-800 text-stone-400 hover:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 w-full space-y-8 flex-1">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-stone-900 via-[#1c1917] to-stone-900 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center text-2xl shrink-0">
              👤
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-white">
                Welcome back, {fullName || user?.email?.split('@')[0] || 'Foodie'}!
              </h1>
              <p className="text-xs text-stone-400 mt-0.5">
                {user?.email} • Bhadohi Member
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active Member Account</span>
          </div>
        </div>

        {/* Live Orders Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-400" />
              <h2 className="text-base sm:text-lg font-black text-white">
                My Orders & Live Tracker
              </h2>
            </div>
            <span className="text-xs text-stone-400 font-medium">
              {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="bg-[#18181b]/60 border border-stone-800 rounded-3xl p-8 text-center space-y-3">
              <div className="text-4xl">🍕</div>
              <h3 className="text-base font-bold text-white">No orders placed yet</h3>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                Your fresh orders will show here with realtime progress updates from the Melting Cheese kitchen.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors"
              >
                <span>Browse Menu & Order</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const step = getStatusStep(order.order_status);
                const isDelivered = order.order_status === 'DELIVERED';
                const isCancelled = order.order_status === 'CANCELLED';

                return (
                  <div
                    key={order.id}
                    className="bg-[#18181b] border border-stone-800 hover:border-stone-700 rounded-3xl p-5 shadow-lg space-y-4 transition-all"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800/80 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-base text-white">
                            #{order.order_number || order.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              order.order_status === 'NEW'
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                : order.order_status === 'PREPARING'
                                ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                                : order.order_status === 'OUT_FOR_DELIVERY'
                                ? 'bg-purple-500/20 text-purple-400 border-purple-500/40 animate-pulse'
                                : order.order_status === 'DELIVERED'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                            }`}
                          >
                            {order.order_status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(order.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-black text-amber-400">₹{order.total}</div>
                        <div className="text-[10px] text-stone-400">{order.payment_method} • {order.payment_status}</div>
                      </div>
                    </div>

                    {/* Live Progress Stepper (if not cancelled) */}
                    {!isCancelled && (
                      <div className="py-2">
                        <div className="relative flex items-center justify-between text-center">
                          {/* Progress Line */}
                          <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1 bg-stone-800 -z-0" />
                          <div
                            className="absolute top-1/2 left-4 -translate-y-1/2 h-1 bg-amber-500 transition-all duration-500 -z-0"
                            style={{
                              width: `${((step - 1) / 3) * 100}%`,
                            }}
                          />

                          {/* Steps */}
                          {[
                            { s: 1, label: 'Received' },
                            { s: 2, label: 'Baking' },
                            { s: 3, label: 'Out for Delivery' },
                            { s: 4, label: 'Delivered' },
                          ].map(({ s, label }) => {
                            const isDone = step >= s;
                            const isCurrent = step === s;

                            return (
                              <div key={s} className="flex flex-col items-center gap-1 z-10">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md ${
                                    isDone
                                      ? 'bg-amber-500 text-stone-950 ring-4 ring-amber-500/20'
                                      : 'bg-stone-800 text-stone-500 border border-stone-700'
                                  }`}
                                >
                                  {s}
                                </div>
                                <span className={`text-[10px] font-bold ${isCurrent ? 'text-amber-400 font-extrabold' : isDone ? 'text-stone-300' : 'text-stone-500'}`}>
                                  {label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Items List */}
                    <div className="bg-stone-900/60 rounded-2xl p-3 border border-stone-800/60 text-xs space-y-1.5 divide-y divide-stone-800/40">
                      {(order.items || []).map((it, idx) => (
                        <div key={idx} className="pt-1.5 first:pt-0 flex items-center justify-between">
                          <span className="text-stone-300 font-medium">
                            <span className="font-bold text-amber-400 mr-1.5">{it.quantity}x</span>
                            {it.name}
                            {it.customization?.crust && (
                              <span className="text-[10px] text-stone-500 ml-1">({it.customization.crust})</span>
                            )}
                          </span>
                          <span className="text-stone-400 font-mono">₹{it.totalPrice}</span>
                        </div>
                      ))}
                      {order.free_item && (
                        <div className="pt-1.5 flex items-center justify-between text-emerald-400 font-semibold">
                          <span>🎁 {order.free_item}</span>
                          <span>FREE</span>
                        </div>
                      )}
                    </div>

                    {/* Delivery & WhatsApp quick action */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-1.5 text-xs text-stone-400">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate max-w-[200px] sm:max-w-xs">{order.delivery_address}</span>
                      </div>

                      <a
                        href={`https://wa.me/918090485140?text=${encodeURIComponent(`Hi Melting Cheese, tracking order #${order.order_number || order.id.slice(0, 8)}.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chat on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Saved Delivery Profile Section */}
        <section className="bg-[#18181b] border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-400" />
                <span>Saved Delivery Address in Bhadohi</span>
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Saved details will automatically pre-fill during checkout for one-tap ordering.
              </p>
            </div>
          </div>

          {profileSavedMsg && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Delivery profile saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Default Bhadohi Delivery Address / Landmark
              </label>
              <textarea
                rows={2}
                required
                placeholder="House/Shop No, Colony, Street, Near Landmark..."
                value={defaultAddress}
                onChange={(e) => setDefaultAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Saved Google Maps GPS Link (Optional)
              </label>
              <div className="relative">
                <Navigation className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="https://maps.google.com/?q=..."
                  value={gpsLink}
                  onChange={(e) => setGpsLink(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingProfile}
              className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              {isSavingProfile ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
