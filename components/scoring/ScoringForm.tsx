'use client';

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
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

  // Auto-save: fire onSave on every checkbox change
  const onSaveRef = useRef(onSave);
  useEffect(() => { onSaveRef.current = onSave; }, [onSave]);

  const handleChange = useCallback((chefId: string, result: EpisodeResult) => {
    setResults((prev) => {
      const updated = { ...prev, [chefId]: result };
      // Fire auto-save with the full updated results
      const allUpdated = Object.values(updated);
      const hasValidationErrors = allUpdated.some((r) => validateResult(r).length > 0);
      if (!hasValidationErrors) {
        onSaveRef.current(allUpdated);
      }
      return updated;
    });
  }, []);

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

  const joshChefs = activeChefs.filter((c) => c.owner === 'josh');
  const jazzyChefs = activeChefs.filter((c) => c.owner === 'wife');
  const wildcardChefs = activeChefs.filter((c) => c.owner === 'wildcard');

  return (
    <div className="flex flex-col gap-6">
      {/* Team Totals */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="rounded-lg border border-josh/20 bg-josh/5 p-4 text-center sm:p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-josh">Josh&apos;s Team</p>
          <p className="mt-1 font-display text-2xl font-bold text-josh sm:text-3xl">
            {teamTotals.joshTotal > 0 ? '+' : ''}{teamTotals.joshTotal}
          </p>
        </div>
        <div className="rounded-lg border border-jazzy/20 bg-jazzy/5 p-4 text-center sm:p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-jazzy">Jazzy&apos;s Team</p>
          <p className="mt-1 font-display text-2xl font-bold text-jazzy sm:text-3xl">
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

      {/* Auto-save indicator */}
      {hasErrors && (
        <p className="text-center text-sm text-danger">Fix validation errors above to save.</p>
      )}
    </div>
  );
}
