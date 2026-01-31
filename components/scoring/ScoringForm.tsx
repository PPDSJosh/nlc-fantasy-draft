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

  const teamTotals = useMemo(() => {
    let joshTotal = 0;
    let jazzyTotal = 0;
    let wildcardTotal = 0;

    for (const chef of activeChefs) {
      const r = results[chef.id];
      if (!r) continue;
      const pts = calculatePoints(r);
      if (chef.owner === 'josh') joshTotal += pts;
      else if (chef.owner === 'wife') jazzyTotal += pts;
      else if (chef.owner === 'wildcard') wildcardTotal += pts;
    }

    if (joshTotal <= jazzyTotal) {
      joshTotal += wildcardTotal;
    } else {
      jazzyTotal += wildcardTotal;
    }

    return { joshTotal, jazzyTotal, wildcardTotal };
  }, [results, activeChefs]);

  function handleSave() {
    onSave(allResults);
  }

  const joshChefs = activeChefs.filter((c) => c.owner === 'josh');
  const jazzyChefs = activeChefs.filter((c) => c.owner === 'wife');
  const wildcardChefs = activeChefs.filter((c) => c.owner === 'wildcard');

  return (
    <div className="flex flex-col gap-6">
      {/* Team Totals */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-josh/20 bg-josh/5 p-5 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-josh">Josh&apos;s Team</p>
          <p className="mt-1 font-display text-3xl font-bold text-josh">
            {teamTotals.joshTotal > 0 ? '+' : ''}{teamTotals.joshTotal}
          </p>
        </div>
        <div className="rounded-2xl border border-jazzy/20 bg-jazzy/5 p-5 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-jazzy">Jazzy&apos;s Team</p>
          <p className="mt-1 font-display text-3xl font-bold text-jazzy">
            {teamTotals.jazzyTotal > 0 ? '+' : ''}{teamTotals.jazzyTotal}
          </p>
        </div>
      </div>

      {teamTotals.wildcardTotal !== 0 && (
        <p className="text-center text-xs text-gold">
          Wildcard ({teamTotals.wildcardTotal > 0 ? '+' : ''}{teamTotals.wildcardTotal} pts)
          assigned to {teamTotals.joshTotal <= teamTotals.jazzyTotal ? "Josh's" : "Jazzy's"} team
        </p>
      )}

      {/* Josh's Chefs */}
      <div>
        <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-josh">Josh&apos;s Chefs</h3>
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

      {/* Jazzy's Chefs */}
      <div>
        <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-jazzy">Jazzy&apos;s Chefs</h3>
        <div className="flex flex-col gap-2">
          {jazzyChefs.map((chef) => (
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
          <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-gold">Wildcard</h3>
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
          className={`rounded-xl px-8 py-3 text-sm font-bold uppercase tracking-wider transition-all ${
            hasErrors
              ? 'cursor-not-allowed bg-stone-light text-warm-gray'
              : 'bg-ink text-white shadow-lg hover:bg-charcoal hover:shadow-xl'
          }`}
        >
          Save Episode {episodeNumber}
        </button>
      </div>
    </div>
  );
}
