'use client';

import { useState } from 'react';
import { Chef } from '@/lib/data/chefs';
import { useGameStore } from '@/lib/store/gameStore';
import ChefCard from '@/components/chef/ChefCard';
import ChefModal from '@/components/chef/ChefModal';

type FilterType = 'all' | 'pro' | 'social' | 'home';

const FILTERS: { label: string; value: FilterType; color: string }[] = [
  { label: 'All', value: 'all', color: 'bg-ink text-white' },
  { label: 'Pro', value: 'pro', color: 'bg-pro text-white' },
  { label: 'Social', value: 'social', color: 'bg-social text-white' },
  { label: 'Home', value: 'home', color: 'bg-home text-white' },
];

export default function Home() {
  const chefs = useGameStore((s) => s.chefs);
  const [selectedChef, setSelectedChef] = useState<Chef | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredChefs =
    filter === 'all' ? chefs : chefs.filter((c) => c.type === filter);

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Header */}
      <div className="bg-ink px-4 py-16 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
          Season 5
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
          Next Level Chef
        </h1>
        <p className="mt-2 text-sm text-white/50">Fantasy Draft</p>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Filter Tabs */}
        <div className="mb-8 flex justify-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                filter === f.value
                  ? f.color + ' shadow-md'
                  : 'bg-white text-warm-gray hover:bg-cream-dark'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Chef Grid */}
        <div className="grid grid-cols-3 gap-3 sm:gap-5 lg:grid-cols-6">
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
