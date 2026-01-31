'use client';

import { useRef } from 'react';
import { useGameStore } from '@/lib/store/gameStore';
import AvailableChefs from './AvailableChefs';
import DraftSlot from './DraftSlot';
import { useRouter } from 'next/navigation';

export default function DraftBoard() {
  const router = useRouter();
  const { chefs, currentPick, draftOrder, draftChef, undoLastPick, finalizeDraft } = useGameStore();

  const joshDropRef = useRef<HTMLDivElement>(null);
  const wifeDropRef = useRef<HTMLDivElement>(null);

  const availableChefs = chefs.filter(
    (c) => c.owner === 'undrafted' && c.status === 'active'
  );

  const joshChefs = chefs.filter((c) => c.owner === 'josh');
  const wifeChefs = chefs.filter((c) => c.owner === 'wife');
  const wildcardChef = chefs.find((c) => c.owner === 'wildcard');

  const draftComplete = currentPick >= 14;

  // Build slot arrays: which picks belong to josh and wife
  const joshPicks: number[] = [];
  const wifePicks: number[] = [];
  draftOrder.forEach((owner, i) => {
    if (owner === 'josh') joshPicks.push(i);
    else wifePicks.push(i);
  });

  const currentOwner = currentPick < 14 ? draftOrder[currentPick] : null;
  const roundNumber = currentPick < 14 ? currentPick + 1 : 14;

  function handleDraft(chefId: string) {
    draftChef(chefId);
  }

  function handleFinalize() {
    finalizeDraft();
    router.push('/dashboard');
  }

  // Get the correct drop zone ref for the current pick owner
  function getDropTarget(): HTMLDivElement | null {
    if (!currentOwner) return null;
    return currentOwner === 'josh' ? joshDropRef.current : wifeDropRef.current;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Current Pick Indicator */}
      <div className="rounded-lg bg-gray-900 px-4 py-3 text-center text-white">
        {draftComplete ? (
          <span className="text-lg font-bold">Draft Complete!</span>
        ) : (
          <span className="text-lg font-bold">
            Round {roundNumber} &middot;{' '}
            <span className={currentOwner === 'josh' ? 'text-blue-400' : 'text-pink-400'}>
              {currentOwner === 'josh' ? "Josh's" : "Wife's"} Pick
            </span>
          </span>
        )}
      </div>

      {/* Available Chefs Pool */}
      {!draftComplete && (
        <div>
          <h2 className="mb-3 text-lg font-bold text-gray-900">
            Available Chefs ({availableChefs.length})
          </h2>
          <AvailableChefs
            chefs={availableChefs}
            onDraft={handleDraft}
            disabled={draftComplete}
            getDropTarget={getDropTarget}
          />
        </div>
      )}

      {/* Wildcard */}
      {draftComplete && availableChefs.length === 1 && !wildcardChef && (
        <div className="rounded-lg border-2 border-amber-400 bg-amber-50 p-4 text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-amber-700">
            Wildcard
          </p>
          <p className="mt-1 text-lg font-bold text-gray-900">
            {availableChefs[0].firstName} {availableChefs[0].lastName}
          </p>
          <p className="text-xs text-gray-500">
            Auto-assigned to lower-scoring team each episode
          </p>
        </div>
      )}

      {wildcardChef && (
        <div className="rounded-lg border-2 border-amber-400 bg-amber-50 p-4 text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-amber-700">
            Wildcard
          </p>
          <p className="mt-1 text-lg font-bold text-gray-900">
            {wildcardChef.firstName} {wildcardChef.lastName}
          </p>
          <p className="text-xs text-gray-500">
            Auto-assigned to lower-scoring team each episode
          </p>
        </div>
      )}

      {/* Team Columns */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Josh's Team */}
        <div ref={joshDropRef}>
          <h2 className="mb-3 text-lg font-bold text-blue-700">
            Josh&apos;s Team ({joshChefs.length}/7)
          </h2>
          <div className="flex flex-col gap-2">
            {joshPicks.map((pickIndex, slotIndex) => {
              const isActive = pickIndex === currentPick;
              return (
                <DraftSlot
                  key={pickIndex}
                  pickNumber={slotIndex + 1}
                  chef={joshChefs[slotIndex] || null}
                  isActive={isActive}
                />
              );
            })}
          </div>
        </div>

        {/* Wife's Team */}
        <div ref={wifeDropRef}>
          <h2 className="mb-3 text-lg font-bold text-pink-700">
            Wife&apos;s Team ({wifeChefs.length}/7)
          </h2>
          <div className="flex flex-col gap-2">
            {wifePicks.map((pickIndex, slotIndex) => {
              const isActive = pickIndex === currentPick;
              return (
                <DraftSlot
                  key={pickIndex}
                  pickNumber={slotIndex + 1}
                  chef={wifeChefs[slotIndex] || null}
                  isActive={isActive}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-3">
        {currentPick > 0 && !wildcardChef && (
          <button
            onClick={undoLastPick}
            className="rounded-full bg-gray-200 px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
          >
            Undo Last Pick
          </button>
        )}
        {draftComplete && !wildcardChef && (
          <button
            onClick={handleFinalize}
            className="rounded-full bg-green-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
          >
            Start Season
          </button>
        )}
        {wildcardChef && (
          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-full bg-green-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
          >
            Go to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}
