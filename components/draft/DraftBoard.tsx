'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useGameStore } from '@/lib/store/gameStore';
import { useAuth } from '@/components/auth/AuthProvider';
import AvailableChefs from './AvailableChefs';
import DraftSlot from './DraftSlot';
import { useRouter } from 'next/navigation';

export default function DraftBoard() {
  const router = useRouter();
  const { chefs, currentPick, draftOrder, draftChef, undoLastPick, finalizeDraft } = useGameStore();
  const { user } = useAuth();

  const joshDropRef = useRef<HTMLDivElement>(null);
  const jazzyDropRef = useRef<HTMLDivElement>(null);

  const availableChefs = chefs.filter(
    (c) => c.owner === 'undrafted' && c.status === 'active'
  );

  const joshChefs = chefs.filter((c) => c.owner === 'josh');
  const jazzyChefs = chefs.filter((c) => c.owner === 'wife');
  const wildcardChef = chefs.find((c) => c.owner === 'wildcard');

  const draftComplete = currentPick >= 14;

  const joshPicks: number[] = [];
  const jazzyPicks: number[] = [];
  draftOrder.forEach((owner, i) => {
    if (owner === 'josh') joshPicks.push(i);
    else jazzyPicks.push(i);
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
    return currentOwner === 'josh' ? joshDropRef.current : jazzyDropRef.current;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Current Pick Indicator */}
      <div className="overflow-hidden rounded-lg bg-ink p-4 text-center sm:p-6">
        {draftComplete ? (
          <span className="font-display text-2xl font-bold text-white">Draft Complete</span>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
              Round {roundNumber} of 14
            </span>
            <span className="font-display text-2xl font-bold text-white">
              <span className={currentOwner === 'josh' ? 'text-josh' : 'text-jazzy'}>
                {currentOwner === 'josh' ? "Josh's" : "Jazzy's"}
              </span>
              {' '}Pick
            </span>
          </div>
        )}
      </div>

      {/* Available Chefs Pool */}
      {!draftComplete && (
        <div>
          <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.15em] text-warm-gray">
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
        <div className="overflow-hidden rounded-lg border-2 border-gold/30 bg-gold/5 p-6 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
            Wildcard
          </p>
          <div className="mx-auto mt-3 relative h-16 w-16 overflow-hidden rounded-full shadow-lg">
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
        <div className="overflow-hidden rounded-lg border-2 border-gold/30 bg-gold/5 p-6 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
            Wildcard
          </p>
          <div className="mx-auto mt-3 relative h-16 w-16 overflow-hidden rounded-full shadow-lg">
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
        <div ref={joshDropRef} className="rounded-lg border border-josh/20 bg-white p-4 transition-colors">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-josh">
            <span className="h-3 w-3 rounded-full bg-josh" />
            Josh&apos;s Team
            <span className="ml-auto font-mono text-sm text-warm-gray">{joshChefs.length}/7</span>
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

        {/* Jazzy's Team */}
        <div ref={jazzyDropRef} className="rounded-lg border border-jazzy/20 bg-white p-4 transition-colors">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-jazzy">
            <span className="h-3 w-3 rounded-full bg-jazzy" />
            Jazzy&apos;s Team
            <span className="ml-auto font-mono text-sm text-warm-gray">{jazzyChefs.length}/7</span>
          </h2>
          <div className="flex flex-col gap-2">
            {jazzyPicks.map((pickIndex, slotIndex) => {
              const isActive = pickIndex === currentPick;
              return (
                <DraftSlot
                  key={pickIndex}
                  pickNumber={slotIndex + 1}
                  chef={jazzyChefs[slotIndex] || null}
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
            className="rounded-xl bg-cream-dark px-5 py-2.5 text-sm font-medium text-warm-gray transition-colors hover:bg-stone-light"
          >
            Undo Last Pick
          </button>
        )}
        {draftComplete && !wildcardChef && (
          <button
            onClick={handleFinalize}
            className="rounded-xl bg-ink px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-charcoal hover:shadow-xl"
          >
            Start Season
          </button>
        )}
        {wildcardChef && (
          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-xl bg-ink px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-charcoal hover:shadow-xl"
          >
            Go to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}
