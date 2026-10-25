'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { getCanonicalSiteUrl } from '@/lib/canonical';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err?.message || 'Unable to update password. Please request a new reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <Link href="/" className="inline-flex flex-col items-center no-underline mb-1">
          <Image src="/flame-icon.png" alt="Rare Ember" width={44} height={44} className="object-contain mb-2" priority />
          <span className="font-display text-2xl sm:text-3xl tracking-tight text-[#0D0D0F] font-black">
            rare ember<span className="text-[#E04F33]">.</span>
          </span>
        </Link>
        <p className="text-xs text-neutral-500 font-medium">Archival Streetwear & Logistics Hub</p>
      </div>

      <div className="w-full max-w-md bg-white border border-neutral-200/80 rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl font-black text-[#0D0D0F] tracking-tight">Set New Password</h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1">
            Enter and confirm your new secure password below.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
              ✓
            </div>
            <h2 className="text-lg font-bold text-neutral-900 mb-1">Password Updated!</h2>
            <p className="text-xs text-neutral-600 mb-4">
              Your password has been changed successfully. Redirecting you to sign in...
            </p>
            <Link
              href="/login"
              className="inline-block px-5 py-2.5 bg-[#0D0D0F] text-white text-xs font-bold rounded-xl no-underline hover:bg-neutral-800 transition-colors"
            >
              Sign In Now →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                New Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#0D0D0F] text-sm text-neutral-900 placeholder:text-neutral-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#0D0D0F] text-sm text-neutral-900 placeholder:text-neutral-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#0D0D0F] hover:bg-neutral-800 text-white font-bold text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center"
            >
              {loading ? 'Updating Password...' : 'Update Password & Sign In'}
            </button>

            <div className="text-center pt-3 border-t border-neutral-100">
              <Link href="/login" className="text-xs font-medium text-neutral-500 hover:text-neutral-800 no-underline">
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
