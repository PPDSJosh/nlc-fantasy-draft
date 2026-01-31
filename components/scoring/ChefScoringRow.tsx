'use client';

import Image from 'next/image';
import { Chef } from '@/lib/data/chefs';
import { EpisodeResult, calculatePoints, validateResult } from '@/lib/data/scoring';

interface ChefScoringRowProps {
  chef: Chef;
  result: EpisodeResult;
  onChange: (result: EpisodeResult) => void;
}

export default function ChefScoringRow({ chef, result, onChange }: ChefScoringRowProps) {
  const points = calculatePoints(result);
  const errors = validateResult(result);
  const ownerLabel =
    chef.owner === 'josh' ? 'Josh' : chef.owner === 'wife' ? 'Jazzy' : 'Wildcard';
  const ownerColor =
    chef.owner === 'josh'
      ? 'text-josh'
      : chef.owner === 'wife'
      ? 'text-jazzy'
      : 'text-gold';

  function handleCheck(field: keyof EpisodeResult, checked: boolean) {
    const updated = { ...result, [field]: checked };

    if (field === 'eliminated' && checked) {
      updated.survived = false;
    }
    if (field === 'survived' && checked) {
      updated.eliminated = false;
    }
    if (field === 'wonChallenge' && checked) {
      updated.survived = true;
      updated.bottom3 = false;
    }
    if (field === 'bottom3' && checked) {
      updated.wonChallenge = false;
    }

    onChange(updated);
  }

  return (
    <div className={`rounded-xl border p-3 transition-colors ${errors.length > 0 ? 'border-danger/30 bg-danger/5' : 'border-stone-light/50 bg-white'}`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        {/* Chef info + Points (mobile: row with points right-aligned) */}
        <div className="flex items-center gap-2.5">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full shadow-sm">
            <Image
              src={chef.imageUrl}
              alt={chef.firstName}
              fill
              className="object-cover object-top"
              sizes="36px"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-sm font-semibold text-charcoal">
              {chef.firstName} {chef.lastName}
            </span>
            <span className={`text-[10px] font-bold ${ownerColor}`}>
              {ownerLabel}
            </span>
          </div>
          {/* Points — visible on mobile inline, hidden on sm+ */}
          <span
            className={`ml-auto rounded-md px-3 py-1 font-mono text-sm font-bold sm:hidden ${
              points > 0
                ? 'bg-success/10 text-success'
                : points < 0
                ? 'bg-danger/10 text-danger'
                : 'bg-stone-light/50 text-warm-gray'
            }`}
          >
            {points > 0 ? '+' : ''}{points}
          </span>
        </div>

        {/* Checkboxes */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-charcoal">
            <input
              type="checkbox"
              checked={result.survived}
              onChange={(e) => handleCheck('survived', e.target.checked)}
              className="h-4 w-4 rounded border-stone accent-success"
            />
            Survived
          </label>
          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-charcoal">
            <input
              type="checkbox"
              checked={result.wonChallenge}
              onChange={(e) => handleCheck('wonChallenge', e.target.checked)}
              className="h-4 w-4 rounded border-stone accent-gold"
            />
            Won
          </label>
          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-charcoal">
            <input
              type="checkbox"
              checked={result.topKitchen}
              onChange={(e) => handleCheck('topKitchen', e.target.checked)}
              className="h-4 w-4 rounded border-stone accent-pro"
            />
            Top Kitchen
          </label>
          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-charcoal">
            <input
              type="checkbox"
              checked={result.bottom3}
              onChange={(e) => handleCheck('bottom3', e.target.checked)}
              className="h-4 w-4 rounded border-stone accent-social"
            />
            Bottom 3
          </label>
          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-charcoal">
            <input
              type="checkbox"
              checked={result.eliminated}
              onChange={(e) => handleCheck('eliminated', e.target.checked)}
              className="h-4 w-4 rounded border-stone accent-danger"
            />
            Eliminated
          </label>
        </div>

        {/* Points — hidden on mobile, visible on sm+ */}
        <div className="ml-auto hidden sm:block">
          <span
            className={`rounded-md px-3 py-1 font-mono text-sm font-bold ${
              points > 0
                ? 'bg-success/10 text-success'
                : points < 0
                ? 'bg-danger/10 text-danger'
                : 'bg-stone-light/50 text-warm-gray'
            }`}
          >
            {points > 0 ? '+' : ''}{points}
          </span>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="mt-2">
          {errors.map((err, i) => (
            <p key={i} className="text-xs text-danger">{err}</p>
          ))}
        </div>
      )}
    </div>
  );
}
