'use client';

import { useRef } from 'react';
import Image from 'next/image';
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

  function getDropTarget(): HTMLDivElement | null {
    if (!currentOwner) return null;
    return currentOwner === 'josh' ? joshDropRef.current : wifeDropRef.current;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Current Pick Indicator */}
      <div className="rounded-xl bg-ink px-6 py-4 text-center">
        {draftComplete ? (
          <span className="font-display text-xl font-bold text-white">Draft Complete</span>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
              Round {roundNumber} of 14
            </span>
            <span className="font-display text-xl font-bold text-white">
              <span className={currentOwner === 'josh' ? 'text-josh' : 'text-wife'}>
                {currentOwner === 'josh' ? "Josh's" : "Wife's"}
              </span>
              {' '}Pick
            </span>
          </div>
        )}
      </div>

      {/* Available Chefs Pool */}
      {!draftComplete && (
        <div>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-warm-gray">
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
        <div className="rounded-xl border-2 border-gold bg-gold-light p-6 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gold">
            Wildcard
          </p>
          <div className="mx-auto mt-3 relative h-16 w-16 overflow-hidden rounded-full bg-stone-light">
            <Image src={availableChefs[0].imageUrl} alt={availableChefs[0].firstName} fill className="object-cover object-top" sizes="64px" />
          </div>
          <p className="mt-3 font-display text-lg font-bold text-charcoal">
            {availableChefs[0].firstName} {availableChefs[0].lastName}
          </p>
          <p className="mt-1 text-xs text-warm-gray">
            Auto-assigned to lower-scoring team each episode
          </p>
        </div>
      )}

      {wildcardChef && (
        <div className="rounded-xl border-2 border-gold bg-gold-light p-6 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gold">
            Wildcard
          </p>
          <div className="mx-auto mt-3 relative h-16 w-16 overflow-hidden rounded-full bg-stone-light">
            <Image src={wildcardChef.imageUrl} alt={wildcardChef.firstName} fill className="object-cover object-top" sizes="64px" />
          </div>
          <p className="mt-3 font-display text-lg font-bold text-charcoal">
            {wildcardChef.firstName} {wildcardChef.lastName}
          </p>
          <p className="mt-1 text-xs text-warm-gray">
            Auto-assigned to lower-scoring team each episode
          </p>
        </div>
      )}

      {/* Team Columns */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Josh's Team */}
        <div ref={joshDropRef} className="rounded-xl border border-stone-light p-4 transition-colors">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-josh">
            <span className="h-3 w-3 rounded-full bg-josh" />
            Josh&apos;s Team
            <span className="ml-auto font-mono text-sm font-medium text-warm-gray">{joshChefs.length}/7</span>
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
        <div ref={wifeDropRef} className="rounded-xl border border-stone-light p-4 transition-colors">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-wife">
            <span className="h-3 w-3 rounded-full bg-wife" />
            Wife&apos;s Team
            <span className="ml-auto font-mono text-sm font-medium text-warm-gray">{wifeChefs.length}/7</span>
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
            className="rounded-lg bg-cream-dark px-5 py-2.5 text-sm font-medium text-warm-gray transition-colors hover:bg-stone-light"
          >
            Undo Last Pick
          </button>
        )}
        {draftComplete && !wildcardChef && (
          <button
            onClick={handleFinalize}
            className="rounded-lg bg-ink px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-charcoal hover:shadow-xl"
          >
            Start Season
          </button>
        )}
        {wildcardChef && (
          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-lg bg-ink px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-charcoal hover:shadow-xl"
          >
            Go to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}
