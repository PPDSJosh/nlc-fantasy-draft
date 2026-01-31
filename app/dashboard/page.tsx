'use client';

import { useMemo } from 'react';
import { useGameStore } from '@/lib/store/gameStore';
import { calculatePoints } from '@/lib/data/scoring';
import CountUp from '@/components/ui/CountUp';
import Link from 'next/link';

export default function DashboardPage() {
  const { chefs, episodes, predictions, seasonEpisode } = useGameStore();

  const stats = useMemo(() => {
    let joshSeasonTotal = 0;
    let wifeSeasonTotal = 0;
    let joshWins = 0;
    let wifeWins = 0;

    const episodeScores: {
      episodeNumber: number;
      joshScore: number;
      wifeScore: number;
      joshCumulative: number;
      wifeCumulative: number;
    }[] = [];

    const chefTotalPoints: Record<string, { chefId: string; firstName: string; lastName: string; owner: string; totalPoints: number }> = {};

    // Initialize chef totals
    for (const chef of chefs) {
      if (chef.owner !== 'undrafted') {
        chefTotalPoints[chef.id] = {
          chefId: chef.id,
          firstName: chef.firstName,
          lastName: chef.lastName,
          owner: chef.owner,
          totalPoints: 0,
        };
      }
    }

    // Sort episodes by number
    const sortedEpisodes = [...episodes].sort(
      (a, b) => a.episodeNumber - b.episodeNumber
    );

    for (const ep of sortedEpisodes) {
      let joshEpScore = 0;
      let wifeEpScore = 0;
      let wildcardScore = 0;

      for (const result of ep.results) {
        const chef = chefs.find((c) => c.id === result.chefId);
        if (!chef) continue;

        const pts = calculatePoints(result);
        if (chefTotalPoints[chef.id]) {
          chefTotalPoints[chef.id].totalPoints += pts;
        }

        if (chef.owner === 'josh') joshEpScore += pts;
        else if (chef.owner === 'wife') wifeEpScore += pts;
        else if (chef.owner === 'wildcard') wildcardScore += pts;
      }

      // Add prediction bonuses
      const joshPred = predictions.find(
        (p) => p.episodeNumber === ep.episodeNumber && p.player === 'josh'
      );
      const wifePred = predictions.find(
        (p) => p.episodeNumber === ep.episodeNumber && p.player === 'wife'
      );

      if (joshPred?.correct === true) joshEpScore += 3;
      else if (joshPred?.correct === false) joshEpScore -= 2;

      if (wifePred?.correct === true) wifeEpScore += 3;
      else if (wifePred?.correct === false) wifeEpScore -= 2;

      // Wildcard goes to lower-scoring team
      if (joshEpScore <= wifeEpScore) {
        joshEpScore += wildcardScore;
      } else {
        wifeEpScore += wildcardScore;
      }

      joshSeasonTotal += joshEpScore;
      wifeSeasonTotal += wifeEpScore;

      if (joshEpScore > wifeEpScore) joshWins++;
      else if (wifeEpScore > joshEpScore) wifeWins++;

      episodeScores.push({
        episodeNumber: ep.episodeNumber,
        joshScore: joshEpScore,
        wifeScore: wifeEpScore,
        joshCumulative: joshSeasonTotal,
        wifeCumulative: wifeSeasonTotal,
      });
    }

    // Top performers
    const topPerformers = Object.values(chefTotalPoints)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 10);

    return {
      joshSeasonTotal,
      wifeSeasonTotal,
      joshWins,
      wifeWins,
      episodeScores,
      topPerformers,
    };
  }, [chefs, episodes, predictions]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Season Dashboard</h1>
          <p className="mt-1 text-lg text-gray-500">
            {episodes.length} episodes scored
          </p>
        </div>

        {/* Season Totals */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-blue-50 p-6 text-center">
            <p className="text-sm font-medium text-blue-600">Josh</p>
            <p className="text-4xl font-bold text-blue-800"><CountUp value={stats.joshSeasonTotal} /></p>
            <p className="mt-1 text-sm text-blue-500">{stats.joshWins} weekly wins</p>
          </div>
          <div className="rounded-xl bg-pink-50 p-6 text-center">
            <p className="text-sm font-medium text-pink-600">Wife</p>
            <p className="text-4xl font-bold text-pink-800"><CountUp value={stats.wifeSeasonTotal} /></p>
            <p className="mt-1 text-sm text-pink-500">{stats.wifeWins} weekly wins</p>
          </div>
        </div>

        {/* Score Progression Chart (Line Graph) */}
        {stats.episodeScores.length > 0 && (() => {
          const chartW = 600;
          const chartH = 200;
          const padX = 40;
          const padY = 20;
          const plotW = chartW - padX * 2;
          const plotH = chartH - padY * 2;
          const n = stats.episodeScores.length;
          const allVals = stats.episodeScores.flatMap((e) => [e.joshCumulative, e.wifeCumulative]);
          const minVal = Math.min(...allVals, 0);
          const maxVal = Math.max(...allVals, 1);
          const range = maxVal - minVal || 1;

          function x(i: number) { return padX + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW); }
          function y(val: number) { return padY + plotH - ((val - minVal) / range) * plotH; }

          const joshLine = stats.episodeScores.map((ep, i) => `${x(i)},${y(ep.joshCumulative)}`).join(' ');
          const wifeLine = stats.episodeScores.map((ep, i) => `${x(i)},${y(ep.wifeCumulative)}`).join(' ');

          return (
            <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-gray-900">Score Progression</h2>
              <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" preserveAspectRatio="xMidYMid meet">
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                  const yPos = padY + plotH * (1 - frac);
                  const val = Math.round(minVal + range * frac);
                  return (
                    <g key={frac}>
                      <line x1={padX} y1={yPos} x2={chartW - padX} y2={yPos} stroke="#e5e7eb" strokeWidth="1" />
                      <text x={padX - 4} y={yPos + 3} textAnchor="end" fontSize="10" fill="#9ca3af">{val}</text>
                    </g>
                  );
                })}
                {/* Lines */}
                <polyline points={joshLine} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points={wifeLine} fill="none" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {/* Dots + labels */}
                {stats.episodeScores.map((ep, i) => (
                  <g key={ep.episodeNumber}>
                    <circle cx={x(i)} cy={y(ep.joshCumulative)} r="4" fill="#3b82f6" />
                    <circle cx={x(i)} cy={y(ep.wifeCumulative)} r="4" fill="#ec4899" />
                    <text x={x(i)} y={chartH - 4} textAnchor="middle" fontSize="10" fill="#9ca3af">
                      Ep {ep.episodeNumber}
                    </text>
                  </g>
                ))}
              </svg>
              <div className="mt-2 flex justify-center gap-4 text-xs">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-500" /> Josh
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-pink-500" /> Wife
                </span>
              </div>
            </div>
          );
        })()}

        {/* Top Performers */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Top Performers</h2>
          {stats.topPerformers.length === 0 ? (
            <p className="text-sm text-gray-400">No episodes scored yet</p>
          ) : (
            <div className="flex flex-col gap-2">
              {stats.topPerformers.map((perf, i) => (
                <div
                  key={perf.chefId}
                  className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {perf.firstName} {perf.lastName}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        perf.owner === 'josh'
                          ? 'text-blue-600'
                          : perf.owner === 'wife'
                          ? 'text-pink-600'
                          : 'text-amber-600'
                      }`}
                    >
                      ({perf.owner === 'josh' ? 'Josh' : perf.owner === 'wife' ? 'Wife' : 'Wildcard'})
                    </span>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      perf.totalPoints > 0
                        ? 'text-green-600'
                        : perf.totalPoints < 0
                        ? 'text-red-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {perf.totalPoints > 0 ? '+' : ''}{perf.totalPoints} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Episode History */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Episode History</h2>
          {stats.episodeScores.length === 0 ? (
            <p className="text-sm text-gray-400">No episodes scored yet</p>
          ) : (
            <div className="flex flex-col gap-2">
              {stats.episodeScores.map((ep) => (
                <Link
                  key={ep.episodeNumber}
                  href={`/episode/${ep.episodeNumber}`}
                  className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 transition-colors hover:bg-gray-50"
                >
                  <span className="text-sm font-medium text-gray-900">
                    Episode {ep.episodeNumber}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-blue-600">
                      Josh: {ep.joshScore > 0 ? '+' : ''}{ep.joshScore}
                    </span>
                    <span className="text-sm font-bold text-pink-600">
                      Wife: {ep.wifeScore > 0 ? '+' : ''}{ep.wifeScore}
                    </span>
                    <span className="text-xs text-gray-400">
                      {ep.joshScore > ep.wifeScore
                        ? 'Josh wins'
                        : ep.wifeScore > ep.joshScore
                        ? 'Wife wins'
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
            className="rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            Score Episode {seasonEpisode}
          </Link>
          <Link
            href="/"
            className="rounded-full bg-gray-200 px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
          >
            View All Chefs
          </Link>
        </div>
      </div>
    </div>
  );
}
