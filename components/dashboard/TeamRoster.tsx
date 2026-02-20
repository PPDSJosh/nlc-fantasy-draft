'use client';

import Image from 'next/image';
import { ChefStat } from '@/lib/hooks/useSeasonStats';

interface TeamRosterProps {
  player: 'josh' | 'wife';
  chefStats: ChefStat[];
  teamTotal: number;
}

export default function TeamRoster({ player, chefStats, teamTotal }: TeamRosterProps) {
  const label = player === 'josh' ? 'Josh' : 'Jazzy';
  const accentColor = player === 'josh' ? 'bg-josh' : 'bg-jazzy';
  const textColor = player === 'josh' ? 'text-josh' : 'text-jazzy';

  const teamChefs = chefStats.filter((c) => c.owner === player);
  const activeChefs = teamChefs
    .filter((c) => c.status === 'active')
    .sort((a, b) => b.totalPoints - a.totalPoints);
  const eliminatedChefs = teamChefs
    .filter((c) => c.status === 'eliminated')
    .sort((a, b) => b.totalPoints - a.totalPoints);

  // MVP: highest-points active chef (or eliminated if no active)
  const allSorted = [...teamChefs].sort((a, b) => b.totalPoints - a.totalPoints);
  const mvpId = allSorted.length > 0 && allSorted[0].totalPoints > 0 ? allSorted[0].chefId : null;

  // Max points for proportional bars
  const maxPoints = Math.max(...teamChefs.map((c) => Math.abs(c.totalPoints)), 1);

  if (teamChefs.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className={`h-1 ${accentColor}`} />
        <div className="p-5">
          <div className="flex items-center justify-between">
            <h3 className={`font-display text-lg font-bold ${textColor}`}>{label}</h3>
            <span className="font-mono text-lg font-bold text-warm-gray">0</span>
          </div>
          <p className="mt-4 text-sm text-warm-gray">No chefs drafted yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      {/* Accent bar */}
      <div className={`h-1 ${accentColor}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className={`font-display text-lg font-bold ${textColor}`}>{label}</h3>
          <span className={`font-mono text-2xl font-bold ${textColor}`}>
            {teamTotal > 0 ? '+' : ''}{teamTotal}
          </span>
        </div>

        {/* Active Chefs */}
        {activeChefs.length > 0 && (
          <div className="mt-4 flex flex-col gap-1.5">
            {activeChefs.map((chef) => (
              <div
                key={chef.chefId}
                className="flex items-center gap-2.5 rounded-lg px-2 py-1.5"
              >
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full shadow-sm">
                  <Image
                    src={chef.imageUrl}
                    alt={chef.firstName}
                    fill
                    className="object-cover object-top"
                    sizes="32px"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-display text-sm font-semibold text-charcoal">
                      {chef.firstName} {chef.lastName}
                    </span>
                    {chef.chefId === mvpId && (
                      <span className="shrink-0 rounded-full bg-gold/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold">
                        MVP
                      </span>
                    )}
                  </div>
                  {/* Point contribution bar */}
                  <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-stone-light/30">
                    <div
                      className={`h-full rounded-full ${chef.totalPoints >= 0 ? 'bg-success/60' : 'bg-danger/60'}`}
                      style={{ width: `${(Math.abs(chef.totalPoints) / maxPoints) * 100}%` }}
                    />
                  </div>
                </div>
                <span
                  className={`shrink-0 font-mono text-sm font-bold ${
                    chef.totalPoints > 0
                      ? 'text-success'
                      : chef.totalPoints < 0
                        ? 'text-danger'
                        : 'text-warm-gray'
                  }`}
                >
                  {chef.totalPoints > 0 ? '+' : ''}{chef.totalPoints}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Eliminated Chefs */}
        {eliminatedChefs.length > 0 && (
          <div className="mt-3 border-t border-stone-light/30 pt-3">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-warm-gray/60">
              Eliminated
            </p>
            <div className="flex flex-col gap-1">
              {eliminatedChefs.map((chef) => (
                <div
                  key={chef.chefId}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-1 opacity-50"
                >
                  <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full shadow-sm grayscale">
                    <Image
                      src={chef.imageUrl}
                      alt={chef.firstName}
                      fill
                      className="object-cover object-top"
                      sizes="28px"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 items-center gap-1.5">
                    <span className="truncate font-display text-sm text-charcoal line-through">
                      {chef.firstName} {chef.lastName}
                    </span>
                    {chef.chefId === mvpId && (
                      <span className="shrink-0 rounded-full bg-gold/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold">
                        MVP
                      </span>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="font-mono text-xs text-warm-gray">
                      {chef.totalPoints > 0 ? '+' : ''}{chef.totalPoints}
                    </span>
                    <p className="text-[9px] text-warm-gray/60">
                      Ep. {chef.eliminatedEpisode}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
