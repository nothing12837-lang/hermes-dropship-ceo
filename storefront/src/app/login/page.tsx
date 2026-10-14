import { Suspense } from 'react';
import { LoginClient } from './LoginClient';

export const metadata = {
  title: 'Sign In | RareEmber',
  description: 'Sign in or create an account to view and protect your orders.',
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#FFF9F1] flex items-center justify-center p-6">
          <div className="w-8 h-8 rounded-full border-2 border-neutral-300 border-t-neutral-900 animate-spin" />
        </main>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
