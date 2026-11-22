'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Mail, Lock, User, Phone, ArrowRight, Loader2, ArrowLeft, ShoppingBag } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/account';
  const supabase = createClient();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (error) {
          setErrorMsg(error.message);
        } else if (data.session) {
          router.push(redirectPath);
          router.refresh();
        }
      } else {
        // Sign Up
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: {
              full_name: fullName.trim(),
              phone: phone.trim(),
            },
          },
        });

        if (error) {
          setErrorMsg(error.message);
        } else if (data.user) {
          // Create customer_profiles row
          try {
            await supabase.from('customer_profiles').upsert({
              id: data.user.id,
              full_name: fullName.trim(),
              phone: phone.trim() || null,
            });
          } catch {
            // Profile can be populated later
          }

          if (data.session) {
            router.push(redirectPath);
            router.refresh();
          } else {
            setSuccessMsg('Account created successfully! You can now log in.');
            setMode('signin');
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-dvh bg-[#121214] flex flex-col items-center pt-6 sm:pt-14 pb-24 px-4 overflow-y-auto">
      <div className="w-full max-w-md bg-[#18181b] border border-stone-800 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-5 sm:space-y-6">
        {/* Navigation back */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </Link>

          <Link
            href="/"
            className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <ShoppingBag className="w-3 h-3" />
            <span>Continue as Guest</span>
          </Link>
        </div>

        {/* Brand Logo Header */}
        <div className="text-center flex flex-col items-center space-y-1.5">
          <BrandLogo size="md" />
          <p className="text-xs text-stone-400 mt-0.5">
            {mode === 'signin'
              ? 'Sign in to track orders & auto-fill saved address'
              : 'Create an account to save Bhadohi address & track orders'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-2xl bg-stone-900 p-1 border border-stone-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 rounded-xl transition-all ${
              mode === 'signin'
                ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 rounded-xl transition-all ${
              mode === 'signup'
                ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-xs">
            {successMsg}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Mobile Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="10-digit phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{mode === 'signin' ? 'Signing In...' : 'Creating Account...'}</span>
              </>
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In' : 'Create Customer Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Note on Guest checkout */}
        <div className="text-center pt-2 border-t border-stone-800 text-[11px] text-stone-400">
          <span>Don&apos;t want an account? </span>
          <Link href="/" className="text-amber-400 font-semibold hover:underline">
            Order freely as Guest →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#121214] flex items-center justify-center text-amber-400">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
