'use client';

import { useGameStore } from '@/lib/store/gameStore';
import DraftBoard from '@/components/draft/DraftBoard';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DraftPage() {
  const router = useRouter();
  const phase = useGameStore((s) => s.phase);

  useEffect(() => {
    if (phase !== 'draft' && phase !== 'season') {
      router.push('/pre-draft');
    }
  }, [phase, router]);

  if (phase !== 'draft' && phase !== 'season') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-warm-gray">Redirecting to pre-draft...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <div className="bg-ink px-4 py-14 text-center">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
          Snake Draft
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold text-white sm:text-5xl">
          Fantasy Draft
        </h1>
        <p className="mt-3 text-sm text-white/30">14 Picks + 1 Wildcard</p>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10">
        <DraftBoard />
      </div>
    </div>
  );
}
