'use client';

import { useMemo } from 'react';
import { useGameStore } from '@/lib/store/gameStore';
import { calculatePoints } from '@/lib/data/scoring';
import CountUp from '@/components/ui/CountUp';
import Image from 'next/image';
import Link from 'next/link';

export default function DashboardPage() {
  const { chefs, episodes, predictions, seasonEpisode } = useGameStore();

  const stats = useMemo(() => {
    let joshSeasonTotal = 0;
    let jazzySeasonTotal = 0;
    let joshWins = 0;
    let jazzyWins = 0;

    const episodeScores: {
      episodeNumber: number;
      joshScore: number;
      jazzyScore: number;
      joshCumulative: number;
      jazzyCumulative: number;
    }[] = [];

    const chefTotalPoints: Record<string, { chefId: string; firstName: string; lastName: string; owner: string; imageUrl: string; totalPoints: number }> = {};

    for (const chef of chefs) {
      if (chef.owner !== 'undrafted') {
        chefTotalPoints[chef.id] = {
          chefId: chef.id,
          firstName: chef.firstName,
          lastName: chef.lastName,
          owner: chef.owner,
          imageUrl: chef.imageUrl,
          totalPoints: 0,
        };
      }
    }

    const sortedEpisodes = [...episodes].sort(
      (a, b) => a.episodeNumber - b.episodeNumber
    );

    for (const ep of sortedEpisodes) {
      let joshEpScore = 0;
      let jazzyEpScore = 0;
      let wildcardScore = 0;

      for (const result of ep.results) {
        const chef = chefs.find((c) => c.id === result.chefId);
        if (!chef) continue;

        const pts = calculatePoints(result);
        if (chefTotalPoints[chef.id]) {
          chefTotalPoints[chef.id].totalPoints += pts;
        }

        if (chef.owner === 'josh') joshEpScore += pts;
        else if (chef.owner === 'wife') jazzyEpScore += pts;
        else if (chef.owner === 'wildcard') wildcardScore += pts;
      }

      const joshPred = predictions.find(
        (p) => p.episodeNumber === ep.episodeNumber && p.player === 'josh'
      );
      const jazzyPred = predictions.find(
        (p) => p.episodeNumber === ep.episodeNumber && p.player === 'wife'
      );

      if (joshPred?.correct === true) joshEpScore += 3;
      else if (joshPred?.correct === false) joshEpScore -= 2;

      if (jazzyPred?.correct === true) jazzyEpScore += 3;
      else if (jazzyPred?.correct === false) jazzyEpScore -= 2;

      if (joshEpScore <= jazzyEpScore) {
        joshEpScore += wildcardScore;
      } else {
        jazzyEpScore += wildcardScore;
      }

      joshSeasonTotal += joshEpScore;
      jazzySeasonTotal += jazzyEpScore;

      if (joshEpScore > jazzyEpScore) joshWins++;
      else if (jazzyEpScore > joshEpScore) jazzyWins++;

      episodeScores.push({
        episodeNumber: ep.episodeNumber,
        joshScore: joshEpScore,
        jazzyScore: jazzyEpScore,
        joshCumulative: joshSeasonTotal,
        jazzyCumulative: jazzySeasonTotal,
      });
    }

    const topPerformers = Object.values(chefTotalPoints)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 10);

    return {
      joshSeasonTotal,
      jazzySeasonTotal,
      joshWins,
      jazzyWins,
      episodeScores,
      topPerformers,
    };
  }, [chefs, episodes, predictions]);

  return (
    <div className="min-h-screen bg-cream">
      {/* Dark Hero */}
      <div className="bg-ink px-4 py-20 text-center">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
          Season Dashboard
        </p>
        <h1 className="mt-4 font-display text-5xl font-bold text-white sm:text-6xl">
          The Scoreboard
        </h1>
        <p className="mt-3 text-sm text-white/30">
          {episodes.length} episode{episodes.length !== 1 ? 's' : ''} scored
        </p>

        {/* Season Totals */}
        <div className="mx-auto mt-12 grid max-w-md grid-cols-2 gap-6">
          <div className="rounded-2xl border border-josh/30 bg-josh/10 p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-josh">Josh</p>
            <p className="mt-2 font-display text-5xl font-bold text-white"><CountUp value={stats.joshSeasonTotal} /></p>
            <p className="mt-1 font-mono text-xs text-josh/60">{stats.joshWins} wins</p>
          </div>
          <div className="rounded-2xl border border-jazzy/30 bg-jazzy/10 p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-jazzy">Jazzy</p>
            <p className="mt-2 font-display text-5xl font-bold text-white"><CountUp value={stats.jazzySeasonTotal} /></p>
            <p className="mt-1 font-mono text-xs text-jazzy/60">{stats.jazzyWins} wins</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10">
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
            <div className="mb-8 overflow-hidden rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
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
        <div className="mb-8 overflow-hidden rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.15em] text-warm-gray">Top Performers</h2>
          {stats.topPerformers.length === 0 ? (
            <p className="text-sm text-stone">No episodes scored yet</p>
          ) : (
            <div className="flex flex-col gap-2">
              {stats.topPerformers.map((perf, i) => (
                <div
                  key={perf.chefId}
                  className="flex items-center justify-between rounded-xl border border-stone-light/30 px-3 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-charcoal/5 font-mono text-[10px] font-bold text-warm-gray">
                      {i + 1}
                    </span>
                    <div className="relative h-8 w-8 overflow-hidden rounded-full shadow-sm">
                      <Image src={perf.imageUrl} alt={perf.firstName} fill className="object-cover object-top" sizes="32px" />
                    </div>
                    <span className="font-display text-sm font-semibold text-charcoal">
                      {perf.firstName} {perf.lastName}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
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
                    className={`font-mono text-sm font-bold ${
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

        {/* Episode History */}
        <div className="mb-8 overflow-hidden rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.15em] text-warm-gray">Episode History</h2>
          {stats.episodeScores.length === 0 ? (
            <p className="text-sm text-stone">No episodes scored yet</p>
          ) : (
            <div className="flex flex-col gap-2">
              {stats.episodeScores.map((ep) => (
                <Link
                  key={ep.episodeNumber}
                  href={`/episode/${ep.episodeNumber}`}
                  className="flex items-center justify-between rounded-xl border border-stone-light/30 px-4 py-3 transition-all hover:bg-cream-dark hover:shadow-sm"
                >
                  <span className="font-display text-sm font-semibold text-charcoal">
                    Episode {ep.episodeNumber}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm font-bold text-josh">
                      {ep.joshScore > 0 ? '+' : ''}{ep.joshScore}
                    </span>
                    <span className="font-mono text-sm font-bold text-jazzy">
                      {ep.jazzyScore > 0 ? '+' : ''}{ep.jazzyScore}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-warm-gray">
                      {ep.joshScore > ep.jazzyScore
                        ? 'Josh'
                        : ep.jazzyScore > ep.joshScore
                        ? 'Jazzy'
                        : 'Tie'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center gap-3">
          <Link
            href={`/episode/${seasonEpisode}`}
            className="rounded-xl bg-ink px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-charcoal hover:shadow-xl"
          >
            Score Episode {seasonEpisode}
          </Link>
          <Link
            href="/"
            className="rounded-xl bg-white px-6 py-2.5 text-sm font-medium text-charcoal shadow-md transition-all hover:shadow-lg"
          >
            View All Chefs
          </Link>
        </div>
      </div>
    </div>
  );
}
