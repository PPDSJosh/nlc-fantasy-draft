'use client';

import { useGameStore } from '@/lib/store/gameStore';
import ChefCard from '@/components/chef/ChefCard';
import { Chef } from '@/lib/data/chefs';
import { useRouter } from 'next/navigation';

export default function PreDraftPage() {
  const router = useRouter();
  const { chefs, currentEpisode, eliminateChef, restoreChef, advanceEpisode, startDraft } =
    useGameStore();

  const eliminatedCount = chefs.filter((c) => c.status === 'eliminated').length;
  const remainingCount = chefs.length - eliminatedCount;

  const eliminatedThisEpisode = chefs.filter(
    (c) => c.eliminatedEpisode === currentEpisode
  ).length;

  const canAdvance = currentEpisode < 3 && eliminatedThisEpisode >= 3;
  const canStartDraft = eliminatedCount === 9 && currentEpisode >= 3;

  function handleChefClick(chef: Chef) {
    if (chef.status === 'eliminated') {
      restoreChef(chef.id);
    } else {
      eliminateChef(chef.id, currentEpisode);
    }
  }

  function handleStartDraft() {
    startDraft();
    router.push('/draft');
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Dark header */}
      <div className="bg-ink px-4 py-12 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
          Episode {currentEpisode} of 3
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
          Pre-Draft Eliminations
        </h1>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <span className="text-danger">
            <span className="font-mono font-bold">{eliminatedCount}</span> eliminated
          </span>
          <span className="h-4 w-px bg-white/20" />
          <span className="text-success">
            <span className="font-mono font-bold">{remainingCount}</span> remaining
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Actions */}
        <div className="mb-8 flex justify-center gap-3">
          {currentEpisode < 3 && (
            <button
              onClick={advanceEpisode}
              disabled={!canAdvance}
              className={`rounded-lg px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-all ${
                canAdvance
                  ? 'bg-white text-charcoal shadow-md hover:shadow-lg'
                  : 'cursor-not-allowed bg-stone-light text-warm-gray'
              }`}
            >
              Advance to Episode {currentEpisode + 1}
            </button>
          )}
          {currentEpisode >= 3 && (
            <button
              onClick={handleStartDraft}
              disabled={!canStartDraft}
              className={`rounded-lg px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-all ${
                canStartDraft
                  ? 'bg-ink text-white shadow-lg hover:bg-charcoal hover:shadow-xl'
                  : 'cursor-not-allowed bg-stone-light text-warm-gray'
              }`}
            >
              Start Draft
            </button>
          )}
        </div>

        <p className="mb-6 text-center text-xs text-warm-gray">
          Tap an active chef to eliminate. Tap an eliminated chef to restore.
        </p>

        {/* Chef Grid */}
        <div className="grid grid-cols-3 gap-3 sm:gap-5 lg:grid-cols-6">
          {chefs.map((chef) => (
            <ChefCard
              key={chef.id}
              chef={chef}
              onClick={handleChefClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
