'use client';

import { use, useEffect } from 'react';
import { useGameStore } from '@/lib/store/gameStore';
import { useAuth } from '@/components/auth/AuthProvider';
import { EpisodeResult } from '@/lib/data/scoring';
import ScoringForm from '@/components/scoring/ScoringForm';
import PredictionPanel from '@/components/predictions/PredictionPanel';
import { useRouter } from 'next/navigation';

export default function EpisodePage({ params }: { params: Promise<{ num: string }> }) {
  const { num } = use(params);
  const episodeNumber = parseInt(num, 10);
  const router = useRouter();
  const { user } = useAuth();

  const { chefs, episodes, predictions, saveEpisode, resolvePredictions, advanceSeasonEpisode, seasonEpisode, phase } = useGameStore();

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

  // Determine which prediction belongs to the current user vs the opponent
  const myPlayer = user?.player ?? 'josh';
  const opponentPlayer = myPlayer === 'josh' ? 'wife' : 'josh';

  const myPrediction = predictions.find(
    (p) => p.episodeNumber === episodeNumber && p.player === myPlayer
  );
  const opponentPrediction = predictions.find(
    (p) => p.episodeNumber === episodeNumber && p.player === opponentPlayer
  );

  const myPredictionLocked = myPrediction?.locked || false;
  const opponentPredictionLocked = opponentPrediction?.locked || false;

  function handleSave(results: EpisodeResult[]) {
    const survivedChefIds = results
      .filter((r) => r.survived && !r.eliminated)
      .map((r) => r.chefId);
    resolvePredictions(episodeNumber, survivedChefIds);

    const alreadyScored = episodes.some((e) => e.episodeNumber === episodeNumber && e.scored);
    saveEpisode(episodeNumber, results);

    // Only advance season episode on first-time scoring
    if (!alreadyScored) {
      advanceSeasonEpisode();
    }

    router.push('/dashboard');
  }

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
        {/* Already scored warning */}
        {existingEpisode?.scored && (
          <div className="mb-6 rounded-lg border border-gold/30 bg-gold/5 px-4 py-3 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-gold">Already Scored</p>
            <p className="mt-1 text-sm text-warm-gray">
              This episode has been scored. Saving again will overwrite the previous results.
            </p>
          </div>
        )}

        {/* Prediction Phase — only show YOUR prediction if not all locked */}
        {!bothPredictionsLocked && (
          <div className="mb-8">
            <h2 className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-warm-gray">Predictions</h2>
            <p className="mb-4 text-sm text-warm-gray">
              Predict which of your chefs will survive. +3 if correct, -2 if wrong, 0 if skipped.
            </p>
            <div className="flex flex-col gap-4">
              {/* Your prediction — always visible */}
              <PredictionPanel
                episodeNumber={episodeNumber}
                player={myPlayer}
                onComplete={() => {}}
              />

              {/* Opponent's prediction — only show status, not details */}
              {opponentPredictionLocked ? (
                <div className="rounded-xl border border-gold/30 bg-gold/5 p-4">
                  <p className={`text-[10px] font-bold uppercase tracking-[0.15em] ${
                    opponentPlayer === 'josh' ? 'text-josh' : 'text-jazzy'
                  }`}>
                    {opponentPlayer === 'josh' ? "Josh" : "Jazzy"}&apos;s Prediction — Locked
                  </p>
                  <p className="mt-1 text-sm text-warm-gray">Prediction is sealed. Hidden until scoring.</p>
                </div>
              ) : (
                <div className={`rounded-xl border p-4 ${
                  opponentPlayer === 'josh' ? 'border-josh/20 bg-josh/5' : 'border-jazzy/20 bg-jazzy/5'
                }`}>
                  <p className={`text-[10px] font-bold uppercase tracking-[0.15em] ${
                    opponentPlayer === 'josh' ? 'text-josh' : 'text-jazzy'
                  }`}>
                    {opponentPlayer === 'josh' ? "Josh" : "Jazzy"}&apos;s Prediction
                  </p>
                  <p className="mt-1 text-sm text-warm-gray">Waiting for their prediction...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Scoring Form — once both predictions are locked */}
        {bothPredictionsLocked && (
          <>
            {/* Show both predictions revealed */}
            {(joshPrediction || jazzyPrediction) && (
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
