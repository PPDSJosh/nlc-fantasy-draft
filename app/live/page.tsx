'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/store/gameStore';
import { useAuth } from '@/components/auth/AuthProvider';
import { EpisodeResult } from '@/lib/data/scoring';
import PredictionPanel from '@/components/predictions/PredictionPanel';
import ScoringForm from '@/components/scoring/ScoringForm';
import EpisodeRecap from '@/components/live/EpisodeRecap';
import Link from 'next/link';

export default function LivePage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    chefs,
    episodes,
    predictions,
    seasonEpisode,
    phase,
    saveEpisode,
    resolvePredictions,
    advanceSeasonEpisode,
  } = useGameStore();

  const [scoredEpisode, setScoredEpisode] = useState<number | null>(null);
  const scoringRef = useRef<HTMLDivElement>(null);
  const recapRef = useRef<HTMLDivElement>(null);

  // Current episode to work with
  const currentEp = scoredEpisode ?? seasonEpisode;

  // Guard: redirect if not in season
  useEffect(() => {
    if (phase !== 'season') {
      router.push('/dashboard');
    }
  }, [phase, router]);

  if (phase !== 'season') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-warm-gray">Redirecting...</p>
      </div>
    );
  }

  const myPlayer = user?.player ?? 'josh';
  const opponentPlayer = myPlayer === 'josh' ? 'wife' : 'josh';

  // Episode data
  const existingEpisode = episodes.find((e) => e.episodeNumber === currentEp);
  const isAlreadyScored = !!existingEpisode?.scored || scoredEpisode !== null;

  // Predictions
  const myPrediction = predictions.find(
    (p) => p.episodeNumber === currentEp && p.player === myPlayer
  );
  const opponentPrediction = predictions.find(
    (p) => p.episodeNumber === currentEp && p.player === opponentPlayer
  );

  const myPredictionLocked = myPrediction?.locked || false;
  const opponentPredictionLocked = opponentPrediction?.locked || false;
  const bothLocked =
    (myPredictionLocked && opponentPredictionLocked) || isAlreadyScored;

  // Active chefs for scoring (same filter as episode page)
  const activeChefs = chefs
    .filter(
      (c) =>
        c.status === 'active' ||
        (c.status === 'eliminated' && c.eliminatedEpisode === currentEp)
    )
    .filter((c) => !c.eliminatedPreDraft)
    .filter((c) => c.owner !== 'undrafted');

  // Auto-scroll to scoring form when both predictions lock
  const prevBothLockedRef = useRef(bothLocked);
  useEffect(() => {
    if (bothLocked && !prevBothLockedRef.current && scoringRef.current && !isAlreadyScored) {
      setTimeout(() => {
        scoringRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
    prevBothLockedRef.current = bothLocked;
  }, [bothLocked, isAlreadyScored]);

  // Auto-scroll to recap after scoring
  useEffect(() => {
    if (scoredEpisode !== null && recapRef.current) {
      setTimeout(() => {
        recapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [scoredEpisode]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSave = useCallback(
    (results: EpisodeResult[]) => {
      const survivedChefIds = results
        .filter((r) => r.survived && !r.eliminated)
        .map((r) => r.chefId);

      const alreadyScored = episodes.some((e) => e.episodeNumber === currentEp && e.scored);

      resolvePredictions(currentEp, survivedChefIds);
      saveEpisode(currentEp, results);

      // Only advance season episode on first-time scoring
      if (!alreadyScored) {
        advanceSeasonEpisode();
      }

      // Stay on page, show recap
      setScoredEpisode(currentEp);
    },
    [currentEp, episodes, resolvePredictions, saveEpisode, advanceSeasonEpisode]
  );

  function handleNextEpisode() {
    setScoredEpisode(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <div className="bg-ink px-4 py-10 text-center sm:py-12 md:py-14">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
          Episode Night
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-white sm:mt-4 sm:text-4xl md:text-5xl">
          Episode {currentEp}
        </h1>
        <p className="mt-2 text-sm text-white/60 sm:mt-3">
          {isAlreadyScored ? 'Results' : 'Live Mode'}
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Phase 1: Predictions */}
        {!isAlreadyScored && (
          <div className="mb-8">
            <h2 className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-warm-gray">
              Predictions
            </h2>
            <p className="mb-4 text-sm text-warm-gray">
              Predict which of your chefs will survive. +3 if correct, -2 if wrong, 0 if skipped.
            </p>
            <div className="flex flex-col gap-4">
              {/* Your prediction */}
              <PredictionPanel
                episodeNumber={currentEp}
                player={myPlayer}
                onComplete={() => {}}
              />

              {/* Opponent's prediction status */}
              {opponentPredictionLocked ? (
                <div className="rounded-xl border border-gold/30 bg-gold/5 p-4">
                  <p
                    className={`text-[10px] font-bold uppercase tracking-[0.15em] ${
                      opponentPlayer === 'josh' ? 'text-josh' : 'text-jazzy'
                    }`}
                  >
                    {opponentPlayer === 'josh' ? 'Josh' : 'Jazzy'}&apos;s Prediction
                    -- Locked
                  </p>
                  <p className="mt-1 text-sm text-warm-gray">
                    Prediction is sealed. Hidden until scoring.
                  </p>
                </div>
              ) : (
                <div
                  className={`rounded-xl border p-4 ${
                    opponentPlayer === 'josh'
                      ? 'border-josh/20 bg-josh/5'
                      : 'border-jazzy/20 bg-jazzy/5'
                  }`}
                >
                  <p
                    className={`text-[10px] font-bold uppercase tracking-[0.15em] ${
                      opponentPlayer === 'josh' ? 'text-josh' : 'text-jazzy'
                    }`}
                  >
                    {opponentPlayer === 'josh' ? 'Josh' : 'Jazzy'}&apos;s Prediction
                  </p>
                  <p className="mt-1 text-sm text-warm-gray">
                    Waiting for their prediction...
                  </p>
                </div>
              )}
            </div>

            {/* Gate message */}
            {myPredictionLocked && !opponentPredictionLocked && (
              <div className="mt-4 rounded-lg border border-gold/20 bg-gold/5 px-4 py-3 text-center">
                <p className="text-sm text-warm-gray">
                  Your prediction is locked. Waiting for{' '}
                  {opponentPlayer === 'josh' ? 'Josh' : 'Jazzy'} to lock theirs...
                </p>
              </div>
            )}
          </div>
        )}

        {/* Phase 2: Scoring Form */}
        {!isAlreadyScored && (
          <div ref={scoringRef} className="mb-8">
            <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.15em] text-warm-gray">
              Score Episode {currentEp}
            </h2>

            {/* Show both predictions revealed if both locked */}
            {bothLocked && (myPrediction || opponentPrediction) && (
              <div className="mb-6 flex flex-col gap-2">
                <PredictionPanel
                  episodeNumber={currentEp}
                  player="josh"
                  onComplete={() => {}}
                />
                <PredictionPanel
                  episodeNumber={currentEp}
                  player="wife"
                  onComplete={() => {}}
                />
              </div>
            )}

            <ScoringForm
              activeChefs={activeChefs}
              episodeNumber={currentEp}
              existingResults={existingEpisode?.results}
              onSave={handleSave}
              saveButtonText="Save & See Results"
            />
          </div>
        )}

        {/* Phase 3: Episode Recap */}
        {isAlreadyScored && (
          <div ref={recapRef} className="mb-8">
            <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.15em] text-warm-gray">
              Episode {scoredEpisode ?? currentEp} Recap
            </h2>
            <EpisodeRecap episodeNumber={scoredEpisode ?? currentEp} />
          </div>
        )}

        {/* Phase 4: Next Episode CTA */}
        {isAlreadyScored && (
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {scoredEpisode !== null && (
              <button
                onClick={handleNextEpisode}
                className="w-full rounded-xl bg-ink px-6 py-3 text-center text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-charcoal hover:shadow-xl sm:w-auto"
              >
                Ready for Episode {seasonEpisode}
              </button>
            )}
            <Link
              href="/dashboard"
              className="w-full rounded-xl bg-white px-6 py-2.5 text-center text-sm font-medium text-charcoal shadow-md transition-all hover:shadow-lg sm:w-auto"
            >
              Back to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
