'use client';

import { use, useEffect, useCallback } from 'react';
import { useGameStore } from '@/lib/store/gameStore';
import { useAuth } from '@/components/auth/AuthProvider';
import { EpisodeResult } from '@/lib/data/scoring';
import ScoringForm from '@/components/scoring/ScoringForm';
import PredictionPanel from '@/components/predictions/PredictionPanel';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EpisodePage({ params }: { params: Promise<{ num: string }> }) {
  const { num } = use(params);
  const episodeNumber = parseInt(num, 10);
  const router = useRouter();
  const { user } = useAuth();

  const { chefs, episodes, predictions, saveEpisode, resolvePredictions, seasonEpisode, phase } = useGameStore();

  const isInvalidEpisode = isNaN(episodeNumber) || episodeNumber < 1 || episodeNumber > seasonEpisode || phase !== 'season';

  useEffect(() => {
    if (isInvalidEpisode) {
      router.push('/dashboard');
    }
  }, [isInvalidEpisode, router]);

  if (isInvalidEpisode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-warm-gray">Redirecting...</p>
      </div>
    );
  }

  const activeChefs = chefs.filter(
    (c) => c.status === 'active' || (c.status === 'eliminated' && c.eliminatedEpisode === episodeNumber)
  ).filter(
    (c) => !c.eliminatedPreDraft
  ).filter(
    (c) => c.owner !== 'undrafted'
  );

  const existingEpisode = episodes.find((e) => e.episodeNumber === episodeNumber);

  const joshPrediction = predictions.find(
    (p) => p.episodeNumber === episodeNumber && p.player === 'josh'
  );
  const jazzyPrediction = predictions.find(
    (p) => p.episodeNumber === episodeNumber && p.player === 'wife'
  );

  const bothPredictionsLocked =
    (joshPrediction?.locked && jazzyPrediction?.locked) || !!existingEpisode?.scored;

  // Auto-save on every checkbox change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleAutoSave = useCallback(
    (results: EpisodeResult[]) => {
      const survivedChefIds = results
        .filter((r) => r.survived && !r.eliminated)
        .map((r) => r.chefId);
      resolvePredictions(episodeNumber, survivedChefIds);
      saveEpisode(episodeNumber, results);
    },
    [episodeNumber, resolvePredictions, saveEpisode]
  );

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <div className="bg-ink px-4 py-10 text-center sm:py-12 md:py-14">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
          Score Results
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-white sm:mt-4 sm:text-4xl md:text-5xl">
          Episode {episodeNumber}
        </h1>
        <p className="mt-2 text-sm text-white/60 sm:mt-3">
          {activeChefs.length} chefs competing
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Already scored info */}
        {existingEpisode?.scored && (
          <div className="mb-6 rounded-lg border border-gold/30 bg-gold/5 px-4 py-3 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-gold">Previously Scored</p>
            <p className="mt-1 text-sm text-warm-gray">
              Changes auto-save as you make them.
            </p>
          </div>
        )}

        {/* Show both predictions revealed if both locked */}
        {bothPredictionsLocked && (joshPrediction || jazzyPrediction) && (
          <div className="mb-6 flex flex-col gap-2">
            <PredictionPanel
              episodeNumber={episodeNumber}
              player="josh"
              onComplete={() => {}}
            />
            <PredictionPanel
              episodeNumber={episodeNumber}
              player="wife"
              onComplete={() => {}}
            />
          </div>
        )}

        {/* Scoring Form — auto-saves on every change */}
        <ScoringForm
          activeChefs={activeChefs}
          episodeNumber={episodeNumber}
          existingResults={existingEpisode?.results}
          onSave={handleAutoSave}
        />

        {/* Back to dashboard */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/dashboard"
            className="rounded-xl bg-white px-6 py-2.5 text-center text-sm font-medium text-charcoal shadow-md transition-all hover:shadow-lg"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
