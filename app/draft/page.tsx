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
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Redirecting to pre-draft...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Fantasy Draft</h1>
          <p className="mt-1 text-lg text-gray-500">Snake Draft — 14 Picks + 1 Wildcard</p>
        </div>
        <DraftBoard />
      </div>
    </div>
  );
}
