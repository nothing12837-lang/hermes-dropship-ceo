'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import Link from 'next/link';
import Image from 'next/image';

type AuthMode = 'signin' | 'signup' | 'forgot' | 'reset';

export function LoginClient() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || searchParams.get('next') || '/profile';

  useEffect(() => {
    // Check if URL indicates password reset mode
    if (searchParams.get('mode') === 'reset' || typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
      setMode('reset');
    }

    // Listen for PASSWORD_RECOVERY auth state event from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('reset');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMsg(null);
    setLoading(true);

    const origin = typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://www.rareember.shop';

    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push(redirectTarget);
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data.session) {
          router.push(redirectTarget);
        } else {
          setMsg('Account created! Please check your email to confirm or sign in directly.');
        }
      } else if (mode === 'forgot') {
        if (!email) {
          throw new Error('Please enter your email address to receive a password reset link.');
        }
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${origin}/login?mode=reset`,
        });
        if (error) throw error;
        setMsg('✅ Password reset link sent! Please check your email inbox to set a new password.');
      } else if (mode === 'reset') {
        if (!newPassword || newPassword.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        if (newPassword !== confirmPassword) {
          throw new Error('Passwords do not match. Please re-enter.');
        }
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (error) throw error;
        setMsg('🎉 Password updated successfully! Redirecting...');
        setTimeout(() => {
          router.push(redirectTarget);
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpLogin = async () => {
    if (!email) {
      setError('Please enter your email address to receive an instant OTP / Magic Link.');
      return;
    }
    setError(null);
    setMsg(null);
    setLoading(true);
    try {
      const origin = typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : 'https://www.rareember.shop';

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${origin}${redirectTarget}`,
        },
      });
      if (error) throw error;
      setMsg('OTP / Magic link sent! Please check your email inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP link');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const origin = typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : 'https://www.rareember.shop';
      const target = redirectTarget && redirectTarget.startsWith('/') ? redirectTarget : '/profile';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}${target}`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Google sign-in error');
    }
  };

  return (
    <main className="min-h-screen bg-[#FFF9F1] flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <Link href="/" className="inline-flex flex-col items-center no-underline mb-1">
          <Image src="/flame-icon.png" alt="RareEmber" width={44} height={44} className="object-contain mb-2" priority />
          <span className="font-display text-3xl tracking-tight text-neutral-950">
            rareember<span className="text-[#FF4D24]">.</span>
          </span>
        </Link>
        <p className="text-xs text-neutral-500 font-medium">Curated Living • Global & Domestic Logistics</p>
      </div>

      <div className="w-full max-w-[420px] bg-white/90 backdrop-blur-2xl rounded-3xl p-7 sm:p-9 border border-black/[0.06] shadow-xl">
        {redirectTarget.includes('/checkout') && (
          <div className="mb-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-3">
            <span className="text-xl">🔐</span>
            <div>
              <p className="text-xs font-bold text-amber-950">Account required to complete order</p>
              <p className="text-[11px] text-amber-800 mt-0.5">Please sign in or create an account to proceed with your checkout.</p>
            </div>
          </div>
        )}

        {/* Apple Segmented Switcher (Visible in signin & signup modes) */}
        {(mode === 'signin' || mode === 'signup') && (
          <div className="flex rounded-full bg-neutral-100 p-1 mb-6 border border-black/[0.04]">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
                setMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all cursor-pointer border-none ${
                mode === 'signin' ? 'bg-white text-neutral-950 shadow-xs' : 'text-neutral-500 hover:text-neutral-800 bg-transparent'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
                setMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all cursor-pointer border-none ${
                mode === 'signup' ? 'bg-white text-neutral-950 shadow-xs' : 'text-neutral-500 hover:text-neutral-800 bg-transparent'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-xl font-black text-neutral-950 tracking-tight">
            {mode === 'signin' && 'Welcome back'}
            {mode === 'signup' && 'Join RareEmber'}
            {mode === 'forgot' && 'Reset Your Password'}
            {mode === 'reset' && 'Create New Password'}
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            {mode === 'signin' && 'Access your orders, tracked deliveries, and saved items.'}
            {mode === 'signup' && 'Create an account to track shipments and save addresses.'}
            {mode === 'forgot' && 'Enter your email address to receive a secure password reset link.'}
            {mode === 'reset' && 'Choose a secure new password for your account.'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold mb-4 leading-relaxed">
            {error}
          </div>
        )}

        {msg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-4 leading-relaxed">
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode !== 'reset' && (
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                className="w-full px-4 py-3 rounded-2xl border border-black/[0.08] bg-[#FFF9F1]/50 text-sm font-medium text-neutral-950 outline-none focus:border-[#FF4D24] focus:bg-white transition-all"
              />
            </div>
          )}

          {(mode === 'signin' || mode === 'signup') && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-neutral-700">Password</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                      setMsg(null);
                    }}
                    className="text-[11px] font-bold text-[#FF4D24] hover:underline bg-transparent border-none p-0 cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-2xl border border-black/[0.08] bg-[#FFF9F1]/50 text-sm font-medium text-neutral-950 outline-none focus:border-[#FF4D24] focus:bg-white transition-all"
              />
            </div>
          )}

          {mode === 'reset' && (
            <>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-2xl border border-black/[0.08] bg-[#FFF9F1]/50 text-sm font-medium text-neutral-950 outline-none focus:border-[#FF4D24] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-2xl border border-black/[0.08] bg-[#FFF9F1]/50 text-sm font-medium text-neutral-950 outline-none focus:border-[#FF4D24] focus:bg-white transition-all"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-[#1d1d1f] hover:bg-black text-white text-xs font-bold transition-all cursor-pointer border-none shadow-xs mt-1 disabled:opacity-50"
          >
            {loading
              ? 'Processing...'
              : mode === 'signin'
              ? 'Sign in to Account'
              : mode === 'signup'
              ? 'Create Free Account'
              : mode === 'forgot'
              ? 'Send Reset Link'
              : 'Save New Password'}
          </button>

          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
                setMsg(null);
              }}
              className="text-xs font-bold text-neutral-600 hover:text-neutral-950 text-center py-2 bg-transparent border-none cursor-pointer transition-colors"
            >
              ← Back to Sign In
            </button>
          )}
        </form>

        {(mode === 'signin' || mode === 'signup') && (
          <>
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-black/[0.06]" />
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-black/[0.06]" />
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleOtpLogin}
                disabled={loading}
                className="w-full py-3 rounded-full border border-black/[0.08] bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all disabled:opacity-50"
              >
                <span>✉️</span> Send Instant Magic Link
              </button>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3 rounded-full border border-black/[0.08] bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-bold flex items-center justify-center gap-2.5 cursor-pointer shadow-xs transition-all disabled:opacity-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>
            </div>
          </>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/shop"
            className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 no-underline transition-colors"
          >
            ← Return to store
          </Link>
        </div>
      </div>
    </main>
  );
}
