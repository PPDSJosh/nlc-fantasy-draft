'use client';

import { useState } from 'react';
import { Chef } from '@/lib/data/chefs';
import { useGameStore } from '@/lib/store/gameStore';
import ChefCard from '@/components/chef/ChefCard';
import ChefModal from '@/components/chef/ChefModal';

type FilterType = 'all' | 'pro' | 'social' | 'home';

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pro', value: 'pro' },
  { label: 'Social', value: 'social' },
  { label: 'Home', value: 'home' },
];

export default function Home() {
  const chefs = useGameStore((s) => s.chefs);
  const [selectedChef, setSelectedChef] = useState<Chef | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredChefs =
    filter === 'all' ? chefs : chefs.filter((c) => c.type === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Next Level Chef Fantasy Draft
          </h1>
          <p className="mt-1 text-lg text-gray-500">Season 5</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex justify-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                filter === f.value
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Chef Grid — 6 columns desktop, 3 mobile */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:grid-cols-6">
          {filteredChefs.map((chef) => (
            <ChefCard
              key={chef.id}
              chef={chef}
              onClick={setSelectedChef}
            />
          ))}
        </div>
      </div>

      {/* Chef Detail Modal */}
      <ChefModal
        chef={selectedChef}
        isOpen={selectedChef !== null}
        onClose={() => setSelectedChef(null)}
      />
    </div>
  );
}
