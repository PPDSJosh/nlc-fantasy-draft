'use client';

import { Chef } from '@/lib/data/chefs';
import { EpisodeResult, calculatePoints, validateResult } from '@/lib/data/scoring';

const TYPE_COLORS: Record<string, string> = {
  pro: '#3A5BA0',
  social: '#9B4A8C',
  home: '#5A8A4A',
};

interface ChefScoringRowProps {
  chef: Chef;
  result: EpisodeResult;
  onChange: (result: EpisodeResult) => void;
}

export default function ChefScoringRow({ chef, result, onChange }: ChefScoringRowProps) {
  const points = calculatePoints(result);
  const errors = validateResult(result);
  const ownerLabel =
    chef.owner === 'josh' ? 'Josh' : chef.owner === 'wife' ? 'Wife' : 'Wildcard';
  const ownerColor =
    chef.owner === 'josh'
      ? 'text-blue-600'
      : chef.owner === 'wife'
      ? 'text-pink-600'
      : 'text-amber-600';

  function handleCheck(field: keyof EpisodeResult, checked: boolean) {
    const updated = { ...result, [field]: checked };

    // Auto-corrections per spec rules
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
    <div className={`rounded-lg border p-3 ${errors.length > 0 ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex flex-wrap items-center gap-3">
        {/* Chef info */}
        <div className="flex items-center gap-2 min-w-[140px]">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: TYPE_COLORS[chef.type] }}
          >
            {chef.firstName[0]}{chef.lastName[0]}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900">
              {chef.firstName} {chef.lastName}
            </span>
            <span className={`text-xs font-medium ${ownerColor}`}>
              {ownerLabel}
            </span>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-1 text-xs">
            <input
              type="checkbox"
              checked={result.survived}
              onChange={(e) => handleCheck('survived', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            Survived
          </label>
          <label className="flex items-center gap-1 text-xs">
            <input
              type="checkbox"
              checked={result.wonChallenge}
              onChange={(e) => handleCheck('wonChallenge', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            Won
          </label>
          <label className="flex items-center gap-1 text-xs">
            <input
              type="checkbox"
              checked={result.topKitchen}
              onChange={(e) => handleCheck('topKitchen', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            Top Kitchen
          </label>
          <label className="flex items-center gap-1 text-xs">
            <input
              type="checkbox"
              checked={result.bottom3}
              onChange={(e) => handleCheck('bottom3', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            Bottom 3
          </label>
          <label className="flex items-center gap-1 text-xs">
            <input
              type="checkbox"
              checked={result.eliminated}
              onChange={(e) => handleCheck('eliminated', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            Eliminated
          </label>
        </div>

        {/* Points */}
        <div className="ml-auto">
          <span
            className={`rounded-full px-3 py-1 text-sm font-bold ${
              points > 0
                ? 'bg-green-100 text-green-700'
                : points < 0
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {points > 0 ? '+' : ''}{points} pts
          </span>
        </div>
      </div>

      {/* Validation errors */}
      {errors.length > 0 && (
        <div className="mt-2">
          {errors.map((err, i) => (
            <p key={i} className="text-xs text-red-600">{err}</p>
          ))}
        </div>
      )}
    </div>
  );
}
