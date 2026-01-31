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

  // Count how many were eliminated in the current episode
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
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Pre-Draft Eliminations
          </h1>
          <p className="mt-1 text-lg text-gray-500">
            Episode {currentEpisode} of 3
          </p>
          <p className="mt-1 text-sm text-gray-400">
            {eliminatedCount} eliminated &middot; {remainingCount} remaining
          </p>
        </div>

        {/* Actions */}
        <div className="mb-6 flex justify-center gap-3">
          {currentEpisode < 3 && (
            <button
              onClick={advanceEpisode}
              disabled={!canAdvance}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                canAdvance
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'cursor-not-allowed bg-gray-100 text-gray-400'
              }`}
            >
              Advance to Episode {currentEpisode + 1}
            </button>
          )}
          {currentEpisode >= 3 && (
            <button
              onClick={handleStartDraft}
              disabled={!canStartDraft}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                canStartDraft
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'cursor-not-allowed bg-gray-200 text-gray-400'
              }`}
            >
              Start Draft
            </button>
          )}
        </div>

        {/* Chef Grid — using ChefCard component */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:grid-cols-6">
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
