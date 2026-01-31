'use client';

import { useGameStore } from '@/lib/store/gameStore';
import DraftBoard from '@/components/draft/DraftBoard';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DraftPage() {
  const router = useRouter();
  const phase = useGameStore((s) => s.phase);

  useEffect(() => {
    if (phase === 'season') {
      router.push('/dashboard');
    } else if (phase !== 'draft') {
      router.push('/pre-draft');
    }
  }, [phase, router]);

  if (phase !== 'draft') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-warm-gray">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <div className="bg-ink px-4 py-10 text-center sm:py-12 md:py-14">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
          Snake Draft
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-white sm:mt-4 sm:text-4xl md:text-5xl">
          Fantasy Draft
        </h1>
        <p className="mt-2 text-sm text-white/30 sm:mt-3">14 Picks + 1 Wildcard</p>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10">
        <DraftBoard />
      </div>
    </div>
  );
}
