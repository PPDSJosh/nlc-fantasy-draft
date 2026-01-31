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
      {/* Hero */}
      <div className="bg-ink px-4 py-10 text-center sm:py-14 md:py-16">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
          Episode {currentEpisode} of 3
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-white sm:mt-4 sm:text-4xl md:text-5xl">
          Pre-Draft Eliminations
        </h1>

        <div className="mt-5 flex items-center justify-center gap-6 sm:mt-6 sm:gap-8">
          <div className="text-center">
            <p className="font-mono text-2xl font-bold text-danger sm:text-3xl">{eliminatedCount}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">Eliminated</p>
          </div>
          <div className="h-8 w-px bg-white/10 sm:h-10" />
          <div className="text-center">
            <p className="font-mono text-2xl font-bold text-success sm:text-3xl">{remainingCount}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">Remaining</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Actions */}
        <div className="mb-8 flex justify-center gap-3">
          {currentEpisode < 3 && (
            <button
              onClick={advanceEpisode}
              disabled={!canAdvance}
              className={`rounded-xl px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-all ${
                canAdvance
                  ? 'bg-white text-charcoal shadow-md hover:shadow-lg'
                  : 'cursor-not-allowed bg-stone-light/50 text-warm-gray'
              }`}
            >
              Advance to Episode {currentEpisode + 1}
            </button>
          )}
          {currentEpisode >= 3 && (
            <button
              onClick={handleStartDraft}
              disabled={!canStartDraft}
              className={`rounded-xl px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-all ${
                canStartDraft
                  ? 'bg-ink text-white shadow-lg hover:bg-charcoal hover:shadow-xl'
                  : 'cursor-not-allowed bg-stone-light/50 text-warm-gray'
              }`}
            >
              Start Draft
            </button>
          )}
        </div>

        <p className="mb-8 text-center text-xs text-warm-gray">
          Tap an active chef to eliminate. Tap an eliminated chef to restore.
        </p>

        {/* Chef Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
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
