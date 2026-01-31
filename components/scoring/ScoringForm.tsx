'use client';

import { useState, useMemo } from 'react';
import { Chef } from '@/lib/data/chefs';
import { EpisodeResult, calculatePoints, validateResult } from '@/lib/data/scoring';
import ChefScoringRow from './ChefScoringRow';

interface ScoringFormProps {
  activeChefs: Chef[];
  episodeNumber: number;
  existingResults?: EpisodeResult[];
  onSave: (results: EpisodeResult[]) => void;
}

export default function ScoringForm({
  activeChefs,
  episodeNumber,
  existingResults,
  onSave,
}: ScoringFormProps) {
  const [results, setResults] = useState<Record<string, EpisodeResult>>(() => {
    const initial: Record<string, EpisodeResult> = {};
    for (const chef of activeChefs) {
      const existing = existingResults?.find((r) => r.chefId === chef.id);
      initial[chef.id] = existing || {
        chefId: chef.id,
        survived: false,
        wonChallenge: false,
        topKitchen: false,
        bottom3: false,
        eliminated: false,
      };
    }
    return initial;
  });

  function handleChange(chefId: string, result: EpisodeResult) {
    setResults((prev) => ({ ...prev, [chefId]: result }));
  }

  const allResults = Object.values(results);
  const hasErrors = allResults.some((r) => validateResult(r).length > 0);

  // Team totals
  const teamTotals = useMemo(() => {
    let joshTotal = 0;
    let wifeTotal = 0;
    let wildcardTotal = 0;

    for (const chef of activeChefs) {
      const r = results[chef.id];
      if (!r) continue;
      const pts = calculatePoints(r);
      if (chef.owner === 'josh') joshTotal += pts;
      else if (chef.owner === 'wife') wifeTotal += pts;
      else if (chef.owner === 'wildcard') wildcardTotal += pts;
    }

    // Wildcard points go to lower-scoring team
    if (joshTotal <= wifeTotal) {
      joshTotal += wildcardTotal;
    } else {
      wifeTotal += wildcardTotal;
    }

    return { joshTotal, wifeTotal, wildcardTotal };
  }, [results, activeChefs]);

  function handleSave() {
    onSave(allResults);
  }

  // Group chefs by owner
  const joshChefs = activeChefs.filter((c) => c.owner === 'josh');
  const wifeChefs = activeChefs.filter((c) => c.owner === 'wife');
  const wildcardChefs = activeChefs.filter((c) => c.owner === 'wildcard');

  return (
    <div className="flex flex-col gap-6">
      {/* Team Totals Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-blue-50 p-4 text-center">
          <p className="text-sm font-medium text-blue-600">Josh&apos;s Team</p>
          <p className="text-2xl font-bold text-blue-800">
            {teamTotals.joshTotal > 0 ? '+' : ''}{teamTotals.joshTotal} pts
          </p>
        </div>
        <div className="rounded-lg bg-pink-50 p-4 text-center">
          <p className="text-sm font-medium text-pink-600">Wife&apos;s Team</p>
          <p className="text-2xl font-bold text-pink-800">
            {teamTotals.wifeTotal > 0 ? '+' : ''}{teamTotals.wifeTotal} pts
          </p>
        </div>
      </div>

      {teamTotals.wildcardTotal !== 0 && (
        <p className="text-center text-xs text-amber-600">
          Wildcard ({teamTotals.wildcardTotal > 0 ? '+' : ''}{teamTotals.wildcardTotal} pts)
          assigned to {teamTotals.joshTotal <= teamTotals.wifeTotal ? "Josh's" : "Wife's"} team
        </p>
      )}

      {/* Josh's Chefs */}
      <div>
        <h3 className="mb-2 text-sm font-bold text-blue-700">Josh&apos;s Chefs</h3>
        <div className="flex flex-col gap-2">
          {joshChefs.map((chef) => (
            <ChefScoringRow
              key={chef.id}
              chef={chef}
              result={results[chef.id]}
              onChange={(r) => handleChange(chef.id, r)}
            />
          ))}
        </div>
      </div>

      {/* Wife's Chefs */}
      <div>
        <h3 className="mb-2 text-sm font-bold text-pink-700">Wife&apos;s Chefs</h3>
        <div className="flex flex-col gap-2">
          {wifeChefs.map((chef) => (
            <ChefScoringRow
              key={chef.id}
              chef={chef}
              result={results[chef.id]}
              onChange={(r) => handleChange(chef.id, r)}
            />
          ))}
        </div>
      </div>

      {/* Wildcard */}
      {wildcardChefs.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-bold text-amber-700">Wildcard</h3>
          <div className="flex flex-col gap-2">
            {wildcardChefs.map((chef) => (
              <ChefScoringRow
                key={chef.id}
                chef={chef}
                result={results[chef.id]}
                onChange={(r) => handleChange(chef.id, r)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSave}
          disabled={hasErrors}
          className={`rounded-full px-6 py-3 text-sm font-bold transition-colors ${
            hasErrors
              ? 'cursor-not-allowed bg-gray-200 text-gray-400'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          Save Episode {episodeNumber}
        </button>
      </div>
    </div>
  );
}
