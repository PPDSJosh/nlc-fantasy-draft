'use client';

import { useState } from 'react';
import { Chef } from '@/lib/data/chefs';
import { useGameStore, Prediction } from '@/lib/store/gameStore';

const TYPE_COLORS: Record<string, string> = {
  pro: '#3A5BA0',
  social: '#9B4A8C',
  home: '#5A8A4A',
};

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

  // Only show active chefs owned by this player
  const eligibleChefs = chefs.filter(
    (c) => c.owner === player && c.status === 'active'
  );

  const isLocked = existingPrediction?.locked || false;
  const isResolved = existingPrediction?.correct !== null && existingPrediction?.correct !== undefined;

  const playerLabel = player === 'josh' ? 'Josh' : 'Wife';

  // Static class maps — dynamic template strings break Tailwind JIT
  const colorClasses = player === 'josh'
    ? { text: 'text-blue-700', border: 'border-blue-200', bg: 'bg-blue-50' }
    : { text: 'text-pink-700', border: 'border-pink-200', bg: 'bg-pink-50' };

  function handleLock() {
    lockPrediction(episodeNumber, player, selectedChefId);
    onComplete();
  }

  function handleSkip() {
    lockPrediction(episodeNumber, player, null);
    onComplete();
  }

  // If already resolved, show result
  if (isResolved && existingPrediction) {
    const predChef = chefs.find((c) => c.id === existingPrediction.chefId);
    return (
      <div className={`rounded-lg border p-4 ${
        existingPrediction.correct ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
      }`}>
        <p className={`text-sm font-bold ${colorClasses.text}`}>
          {playerLabel}&apos;s Prediction
        </p>
        {existingPrediction.chefId ? (
          <>
            <p className="mt-1 text-sm text-gray-700">
              Predicted: <strong>{predChef?.firstName} {predChef?.lastName}</strong>
            </p>
            <p className={`mt-1 text-sm font-bold ${existingPrediction.correct ? 'text-green-700' : 'text-red-700'}`}>
              {existingPrediction.correct ? 'Correct! +3 pts' : 'Incorrect. -2 pts'}
            </p>
          </>
        ) : (
          <p className="mt-1 text-sm text-gray-500">Skipped (0 pts)</p>
        )}
      </div>
    );
  }

  // If locked but not yet resolved
  if (isLocked && existingPrediction) {
    const predChef = chefs.find((c) => c.id === existingPrediction.chefId);
    return (
      <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4">
        <p className={`text-sm font-bold ${colorClasses.text}`}>
          {playerLabel}&apos;s Prediction — Locked
        </p>
        {existingPrediction.chefId ? (
          <p className="mt-1 text-sm text-gray-700">
            Predicted: <strong>{predChef?.firstName} {predChef?.lastName}</strong> will survive
          </p>
        ) : (
          <p className="mt-1 text-sm text-gray-500">Skipped</p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          Locked at {new Date(existingPrediction.lockedAt!).toLocaleString()}
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border ${colorClasses.border} ${colorClasses.bg} p-4`}>
      <p className={`text-sm font-bold ${colorClasses.text}`}>
        {playerLabel}&apos;s Prediction
      </p>
      <p className="mt-1 text-xs text-gray-500">
        Pick one of your chefs you think will survive this episode, or skip.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {eligibleChefs.map((chef) => (
          <button
            key={chef.id}
            onClick={() => setSelectedChefId(chef.id)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
              selectedChefId === chef.id
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div
              className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: TYPE_COLORS[chef.type] }}
            >
              {chef.firstName[0]}
            </div>
            {chef.firstName}
          </button>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={handleLock}
          disabled={!selectedChefId}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            selectedChefId
              ? 'bg-gray-900 text-white hover:bg-gray-800'
              : 'cursor-not-allowed bg-gray-200 text-gray-400'
          }`}
        >
          Lock Prediction
        </button>
        <button
          onClick={handleSkip}
          className="rounded-full bg-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-300"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
