'use client';

import { use } from 'react';
import { useGameStore } from '@/lib/store/gameStore';
import { EpisodeResult } from '@/lib/data/scoring';
import ScoringForm from '@/components/scoring/ScoringForm';
import PredictionPanel from '@/components/predictions/PredictionPanel';
import { useRouter } from 'next/navigation';

export default function EpisodePage({ params }: { params: Promise<{ num: string }> }) {
  const { num } = use(params);
  const episodeNumber = parseInt(num, 10);
  const router = useRouter();

  const { chefs, episodes, predictions, saveEpisode, resolvePredictions, advanceSeasonEpisode } = useGameStore();

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
  const wifePrediction = predictions.find(
    (p) => p.episodeNumber === episodeNumber && p.player === 'wife'
  );

  const bothPredictionsLocked =
    (joshPrediction?.locked && wifePrediction?.locked) || !!existingEpisode?.scored;

  function handleSave(results: EpisodeResult[]) {
    const survivedChefIds = results
      .filter((r) => r.survived && !r.eliminated)
      .map((r) => r.chefId);
    resolvePredictions(episodeNumber, survivedChefIds);

    saveEpisode(episodeNumber, results);
    advanceSeasonEpisode();
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-ink px-4 py-12 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
          Score Results
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
          Episode {episodeNumber}
        </h1>
        <p className="mt-2 text-sm text-white/50">
          {activeChefs.length} chefs competing
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Prediction Phase */}
        {!bothPredictionsLocked && (
          <div className="mb-8">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-warm-gray">Predictions</h2>
            <p className="mb-4 text-xs text-warm-gray">
              Each player: predict which of your chefs will survive. +3 if correct, -2 if wrong, 0 if skipped.
            </p>
            <div className="flex flex-col gap-4">
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
          </div>
        )}

        {/* Scoring Form */}
        {bothPredictionsLocked && (
          <>
            {(joshPrediction || wifePrediction) && (
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

            <ScoringForm
              activeChefs={activeChefs}
              episodeNumber={episodeNumber}
              existingResults={existingEpisode?.results}
              onSave={handleSave}
            />
          </>
        )}
      </div>
    </div>
  );
}
