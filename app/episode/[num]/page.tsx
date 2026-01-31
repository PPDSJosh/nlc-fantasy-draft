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

  // Check if predictions are locked for this episode
  const joshPrediction = predictions.find(
    (p) => p.episodeNumber === episodeNumber && p.player === 'josh'
  );
  const wifePrediction = predictions.find(
    (p) => p.episodeNumber === episodeNumber && p.player === 'wife'
  );

  // Derive prediction completion from store state (no stale closure)
  const bothPredictionsLocked =
    (joshPrediction?.locked && wifePrediction?.locked) || !!existingEpisode?.scored;

  function handleSave(results: EpisodeResult[]) {
    // Resolve predictions based on results
    const survivedChefIds = results
      .filter((r) => r.survived && !r.eliminated)
      .map((r) => r.chefId);
    resolvePredictions(episodeNumber, survivedChefIds);

    saveEpisode(episodeNumber, results);
    advanceSeasonEpisode();
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Episode {episodeNumber}</h1>
          <p className="mt-1 text-lg text-gray-500">Score Results</p>
          <p className="mt-1 text-sm text-gray-400">
            {activeChefs.length} chefs competing
          </p>
        </div>

        {/* Prediction Phase — shown before scoring */}
        {!bothPredictionsLocked && (
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Predictions</h2>
            <p className="mb-4 text-sm text-gray-500">
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

        {/* Scoring Form — shown after predictions locked */}
        {bothPredictionsLocked && (
          <>
            {/* Show locked predictions summary */}
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
