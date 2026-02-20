'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('Something went wrong. Try again.');
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
          Season 5
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
          Next Level Chef
        </h1>
        <p className="mt-2 text-sm tracking-wide text-white/60">
          Fantasy Draft
        </p>
      </div>

      {/* Login Card */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        <div className="h-[3px] bg-gold" />
        <div className="p-6 sm:p-8">
          <h2 className="text-center font-display text-xl font-bold text-charcoal">
            Sign In
          </h2>
          <p className="mt-1 text-center text-sm text-warm-gray">
            Enter your credentials to play
          </p>

          {error && (
            <div className="mt-4 rounded-lg bg-danger/10 px-4 py-3 text-center text-sm font-medium text-danger">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.15em] text-warm-gray"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full rounded-lg border border-stone-light bg-cream px-4 py-3 text-base text-charcoal placeholder-warm-gray/50 outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.15em] text-warm-gray"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full rounded-lg border border-stone-light bg-cream px-4 py-3 text-base text-charcoal placeholder-warm-gray/50 outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`mt-6 w-full rounded-lg py-3 text-sm font-bold uppercase tracking-wider transition-all ${
              loading
                ? 'cursor-not-allowed bg-stone-light text-warm-gray'
                : 'bg-ink text-white shadow-lg hover:bg-charcoal hover:shadow-xl'
            }`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
      </form>
    </div>
  );
}
