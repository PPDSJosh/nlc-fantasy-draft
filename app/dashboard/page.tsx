'use client';

import { useGameStore } from '@/lib/store/gameStore';
import { useSeasonStats } from '@/lib/hooks/useSeasonStats';
import CountUp from '@/components/ui/CountUp';
import MomentumBar from '@/components/dashboard/MomentumBar';
import TeamRoster from '@/components/dashboard/TeamRoster';
import SeasonTimeline from '@/components/dashboard/SeasonTimeline';
import Image from 'next/image';
import Link from 'next/link';

export default function DashboardPage() {
  const { seasonEpisode } = useGameStore();
  const stats = useSeasonStats();

  // Compute team totals for roster cards (josh and wife totals including wildcard allocation)
  // The season totals from the hook include prediction bonuses + wildcard allocation per episode,
  // which is the right number for the hero. For roster cards we pass the season total.
  const joshTeamChefs = stats.chefStats.filter((c) => c.owner === 'josh');
  const jazzyTeamChefs = stats.chefStats.filter((c) => c.owner === 'wife');
  const joshRosterTotal = joshTeamChefs.reduce((sum, c) => sum + c.totalPoints, 0);
  const jazzyRosterTotal = jazzyTeamChefs.reduce((sum, c) => sum + c.totalPoints, 0);

  return (
    <div className="min-h-screen bg-cream">
      {/* Dark Hero -- Rivalry Head-to-Head */}
      <div className="bg-ink px-4 py-12 text-center sm:py-16 md:py-20">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
          Season Dashboard
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-white sm:mt-4 sm:text-5xl md:text-6xl">
          The Rivalry
        </h1>

        {/* Season Totals -- bigger, bolder */}
        <div className="mx-auto mt-8 grid max-w-lg grid-cols-2 gap-3 sm:mt-12 sm:gap-5">
          <div className="rounded-xl bg-josh p-5 sm:p-7">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Josh</p>
            <p className="mt-1 font-display text-4xl font-bold text-white sm:mt-2 sm:text-5xl md:text-6xl">
              <CountUp value={stats.joshSeasonTotal} />
            </p>
            <p className="mt-1 font-mono text-xs text-white/60">{stats.joshWins} win{stats.joshWins !== 1 ? 's' : ''}</p>
          </div>
          <div className="rounded-xl bg-jazzy p-5 sm:p-7">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Jazzy</p>
            <p className="mt-1 font-display text-4xl font-bold text-white sm:mt-2 sm:text-5xl md:text-6xl">
              <CountUp value={stats.jazzySeasonTotal} />
            </p>
            <p className="mt-1 font-mono text-xs text-white/60">{stats.jazzyWins} win{stats.jazzyWins !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Momentum Bar */}
        <div className="mx-auto mt-8 max-w-lg">
          <MomentumBar joshTotal={stats.joshSeasonTotal} jazzyTotal={stats.jazzySeasonTotal} />
        </div>

        {/* Streak callout */}
        {stats.currentStreak.player && stats.currentStreak.count >= 2 && (
          <div className="mx-auto mt-4 inline-block rounded-full bg-white/10 px-4 py-1.5">
            <p className="font-mono text-xs font-bold text-white/80">
              {stats.currentStreak.player === 'josh' ? 'Josh' : 'Jazzy'}: {stats.currentStreak.count}-episode streak
            </p>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Team Rosters */}
        <div className="mb-8">
          <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.15em] text-warm-gray">
            Team Rosters
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <TeamRoster player="josh" chefStats={stats.chefStats} teamTotal={joshRosterTotal} />
            <TeamRoster player="wife" chefStats={stats.chefStats} teamTotal={jazzyRosterTotal} />
          </div>
        </div>

        {/* Season Timeline */}
        <div className="mb-8">
          <SeasonTimeline
            episodeScores={stats.episodeScores}
            chefStats={stats.chefStats}
            currentSeasonEpisode={seasonEpisode}
          />
        </div>

        {/* Score Progression Chart */}
        {stats.episodeScores.length > 0 && (() => {
          const chartW = 600;
          const chartH = 220;
          const padX = 44;
          const padY = 24;
          const plotW = chartW - padX * 2;
          const plotH = chartH - padY * 2;
          const n = stats.episodeScores.length;
          const allVals = stats.episodeScores.flatMap((e) => [e.joshCumulative, e.jazzyCumulative]);
          const minVal = Math.min(...allVals, 0);
          const maxVal = Math.max(...allVals, 1);
          const range = maxVal - minVal || 1;

          function x(i: number) { return padX + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW); }
          function y(val: number) { return padY + plotH - ((val - minVal) / range) * plotH; }

          const joshLine = stats.episodeScores.map((ep, i) => `${x(i)},${y(ep.joshCumulative)}`).join(' ');
          const jazzyLine = stats.episodeScores.map((ep, i) => `${x(i)},${y(ep.jazzyCumulative)}`).join(' ');

          return (
            <div className="mb-8 overflow-hidden rounded-xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.15em] text-warm-gray">Score Progression</h2>
              <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" preserveAspectRatio="xMidYMid meet">
                {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                  const yPos = padY + plotH * (1 - frac);
                  const val = Math.round(minVal + range * frac);
                  return (
                    <g key={frac}>
                      <line x1={padX} y1={yPos} x2={chartW - padX} y2={yPos} stroke="var(--stone-light)" strokeWidth="1" />
                      <text x={padX - 6} y={yPos + 3} textAnchor="end" fontSize="10" fill="var(--warm-gray)" fontFamily="var(--font-geist-mono)">{val}</text>
                    </g>
                  );
                })}
                <polyline points={joshLine} fill="none" stroke="var(--josh)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points={jazzyLine} fill="none" stroke="var(--jazzy)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {stats.episodeScores.map((ep, i) => (
                  <g key={ep.episodeNumber}>
                    <circle cx={x(i)} cy={y(ep.joshCumulative)} r="4" fill="var(--josh)" />
                    <circle cx={x(i)} cy={y(ep.jazzyCumulative)} r="4" fill="var(--jazzy)" />
                    <text x={x(i)} y={chartH - 4} textAnchor="middle" fontSize="10" fill="var(--warm-gray)" fontFamily="var(--font-geist-mono)">
                      Ep {ep.episodeNumber}
                    </text>
                  </g>
                ))}
              </svg>
              <div className="mt-3 flex justify-center gap-6 text-xs text-warm-gray">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-josh" /> Josh
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-jazzy" /> Jazzy
                </span>
              </div>
            </div>
          );
        })()}

        {/* Top Performers */}
        <div className="mb-8 overflow-hidden rounded-xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.15em] text-warm-gray">Top Performers</h2>
          {stats.topPerformers.length === 0 ? (
            <p className="text-sm text-stone">No episodes scored yet</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {stats.topPerformers.map((perf, i) => (
                <div
                  key={perf.chefId}
                  className="flex items-center justify-between rounded-lg border border-stone-light/30 px-2.5 py-2 sm:px-3 sm:py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center font-mono text-[10px] font-bold text-warm-gray sm:h-6 sm:w-6 sm:text-[11px]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full shadow-sm sm:h-8 sm:w-8">
                      <Image src={perf.imageUrl} alt={perf.firstName} fill className="object-cover object-top" sizes="32px" />
                    </div>
                    <span className="truncate font-display text-xs font-semibold text-charcoal sm:text-sm">
                      {perf.firstName} {perf.lastName}
                    </span>
                    <span
                      className={`shrink-0 text-[8px] font-bold uppercase tracking-wider sm:text-[9px] ${
                        perf.owner === 'josh'
                          ? 'text-josh'
                          : perf.owner === 'wife'
                            ? 'text-jazzy'
                            : 'text-gold'
                      }`}
                    >
                      {perf.owner === 'josh' ? 'Josh' : perf.owner === 'wife' ? 'Jazzy' : 'WC'}
                    </span>
                  </div>
                  <span
                    className={`shrink-0 font-mono text-xs font-bold sm:text-sm ${
                      perf.totalPoints > 0
                        ? 'text-success'
                        : perf.totalPoints < 0
                          ? 'text-danger'
                          : 'text-warm-gray'
                    }`}
                  >
                    {perf.totalPoints > 0 ? '+' : ''}{perf.totalPoints}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/live`}
            className="w-full rounded-xl bg-ink px-6 py-2.5 text-center text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-charcoal hover:shadow-xl sm:w-auto"
          >
            Episode Night Mode
          </Link>
          <Link
            href={`/episode/${seasonEpisode}`}
            className="w-full rounded-xl bg-white px-6 py-2.5 text-center text-sm font-bold uppercase tracking-wider text-charcoal shadow-md transition-all hover:shadow-lg sm:w-auto"
          >
            Score Episode {seasonEpisode}
          </Link>
          <Link
            href="/"
            className="w-full rounded-xl bg-white px-6 py-2.5 text-center text-sm font-medium text-charcoal shadow-md transition-all hover:shadow-lg sm:w-auto"
          >
            View All Chefs
          </Link>
        </div>
      </div>
    </div>
  );
}
