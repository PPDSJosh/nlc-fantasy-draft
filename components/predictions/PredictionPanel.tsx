'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useGameStore } from '@/lib/store/gameStore';

interface PredictionPanelProps {
  episodeNumber: number;
  player: 'josh' | 'wife';
  onComplete: () => void;
}

export default function PredictionPanel({ episodeNumber, player, onComplete }: PredictionPanelProps) {
  const { chefs, predictions, lockPrediction } = useGameStore();

  const existingPrediction = predictions.find(
    (p) => p.episodeNumber === episodeNumber && p.player === player
  );

  const [selectedChefId, setSelectedChefId] = useState<string | null>(
    existingPrediction?.chefId || null
  );

  const eligibleChefs = chefs.filter(
    (c) => c.owner === player && c.status === 'active'
  );

  const isLocked = existingPrediction?.locked || false;
  const isResolved = existingPrediction?.correct !== null && existingPrediction?.correct !== undefined;

  const playerLabel = player === 'josh' ? 'Josh' : 'Jazzy';

  const colorClasses = player === 'josh'
    ? { text: 'text-josh', border: 'border-josh/20', bg: 'bg-josh/5', accent: 'bg-josh' }
    : { text: 'text-jazzy', border: 'border-jazzy/20', bg: 'bg-jazzy/5', accent: 'bg-jazzy' };

  function handleLock() {
    lockPrediction(episodeNumber, player, selectedChefId);
    onComplete();
  }

  function handleSkip() {
    lockPrediction(episodeNumber, player, null);
    onComplete();
  }

  // Resolved state
  if (isResolved && existingPrediction) {
    const predChef = chefs.find((c) => c.id === existingPrediction.chefId);
    return (
      <div className={`rounded-xl border p-4 ${
        existingPrediction.correct ? 'border-success/30 bg-success/5' : 'border-danger/30 bg-danger/5'
      }`}>
        <p className={`text-[10px] font-bold uppercase tracking-[0.15em] ${colorClasses.text}`}>
          {playerLabel}&apos;s Prediction
        </p>
        {existingPrediction.chefId ? (
          <>
            <div className="mt-2 flex items-center gap-2">
              {predChef && (
                <div className="relative h-7 w-7 overflow-hidden rounded-full shadow-sm">
                  <Image src={predChef.imageUrl} alt={predChef.firstName} fill className="object-cover object-top" sizes="28px" />
                </div>
              )}
              <p className="text-sm text-charcoal">
                <strong>{predChef?.firstName} {predChef?.lastName}</strong>
              </p>
            </div>
            <p className={`mt-2 font-mono text-sm font-bold ${existingPrediction.correct ? 'text-success' : 'text-danger'}`}>
              {existingPrediction.correct ? '+3 pts' : '-2 pts'}
            </p>
          </>
        ) : (
          <p className="mt-1 text-sm text-warm-gray">Skipped (0 pts)</p>
        )}
      </div>
    );
  }

  // Locked state
  if (isLocked && existingPrediction) {
    const isHidden = existingPrediction.chefId === 'hidden';
    const predChef = isHidden ? null : chefs.find((c) => c.id === existingPrediction.chefId);
    return (
      <div className="rounded-xl border border-gold/30 bg-gold/5 p-4">
        <p className={`text-[10px] font-bold uppercase tracking-[0.15em] ${colorClasses.text}`}>
          {playerLabel}&apos;s Prediction — Locked
        </p>
        {isHidden ? (
          <p className="mt-2 text-sm font-medium text-warm-gray">Prediction sealed — lock yours to reveal</p>
        ) : existingPrediction.chefId ? (
          <div className="mt-2 flex items-center gap-2">
            {predChef && (
              <div className="relative h-7 w-7 overflow-hidden rounded-full shadow-sm">
                <Image src={predChef.imageUrl} alt={predChef.firstName} fill className="object-cover object-top" sizes="28px" />
              </div>
            )}
            <p className="text-sm text-charcoal">
              <strong>{predChef?.firstName} {predChef?.lastName}</strong> will survive
            </p>
          </div>
        ) : (
          <p className="mt-1 text-sm text-warm-gray">Skipped</p>
        )}
        {!isHidden && (
          <p className="mt-2 font-mono text-[10px] text-warm-gray">
            Locked at {new Date(existingPrediction.lockedAt!).toLocaleString()}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-xl border ${colorClasses.border} ${colorClasses.bg} p-4`}>
      <p className={`text-[10px] font-bold uppercase tracking-[0.15em] ${colorClasses.text}`}>
        {playerLabel}&apos;s Prediction
      </p>
      <p className="mt-1 text-xs text-warm-gray">
        Pick one of your chefs you think will survive, or skip.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {eligibleChefs.map((chef) => (
          <button
            key={chef.id}
            onClick={() => setSelectedChefId(chef.id)}
            className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-sm transition-all sm:px-3 ${
              selectedChefId === chef.id
                ? 'border-ink bg-ink text-white shadow-md'
                : 'border-stone-light/50 bg-white text-charcoal hover:border-stone'
            }`}
          >
            <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full shadow-sm sm:h-7 sm:w-7">
              <Image src={chef.imageUrl} alt={chef.firstName} fill className="object-cover object-top" sizes="28px" />
            </div>
            <span className="truncate font-display text-xs sm:text-sm">{chef.firstName}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={handleLock}
          disabled={!selectedChefId}
          className={`flex-1 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all sm:flex-none sm:px-5 sm:py-2 sm:text-sm ${
            selectedChefId
              ? 'bg-ink text-white shadow-md hover:bg-charcoal'
              : 'cursor-not-allowed bg-stone-light text-warm-gray'
          }`}
        >
          Lock Prediction
        </button>
        <button
          onClick={handleSkip}
          className="flex-1 rounded-xl bg-cream-dark px-4 py-2.5 text-xs font-medium text-warm-gray transition-colors hover:bg-stone-light sm:flex-none sm:px-5 sm:py-2 sm:text-sm"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
