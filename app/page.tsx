'use client';

import { useState } from 'react';
import { Chef } from '@/lib/data/chefs';
import { useGameStore } from '@/lib/store/gameStore';
import ChefCard from '@/components/chef/ChefCard';
import ChefModal from '@/components/chef/ChefModal';

type FilterType = 'all' | 'pro' | 'social' | 'home';

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'All Chefs', value: 'all' },
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
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <div className="bg-ink px-4 py-20 text-center">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
          Season 5
        </p>
        <h1 className="mt-4 font-display text-5xl font-bold text-white sm:text-6xl lg:text-7xl">
          Next Level Chef
        </h1>
        <p className="mt-3 text-sm tracking-wide text-white/30">
          Fantasy Draft
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Filter Tabs */}
        <div className="mb-10 flex justify-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                filter === f.value
                  ? 'bg-ink text-white shadow-md'
                  : 'bg-transparent text-warm-gray hover:text-charcoal'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Chef Grid — 4 columns for bigger, more dramatic cards */}
        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
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
