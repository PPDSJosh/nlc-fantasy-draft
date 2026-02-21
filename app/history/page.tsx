'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useGameStore } from '@/lib/store/gameStore';
import { useSeasonStats } from '@/lib/hooks/useSeasonStats';
import { calculatePoints } from '@/lib/data/scoring';

export default function HistoryPage() {
  const router = useRouter();
  const { chefs, episodes, seasonEpisode, phase } = useGameStore();
  const stats = useSeasonStats();

  useEffect(() => {
    if (phase !== 'season') {
      router.push('/dashboard');
    }
  }, [phase, router]);

  if (phase !== 'season') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-warm-gray">Redirecting...</p>
      </div>
    );
  }

  // Build episode list: all episodes from 4 up to seasonEpisode
  const episodeNumbers = Array.from(
    { length: seasonEpisode - 3 },
    (_, i) => i + 4
  );

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <div className="bg-ink px-4 py-10 text-center sm:py-12 md:py-14">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
          Scoring History
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-white sm:mt-4 sm:text-4xl md:text-5xl">
          Episode Log
        </h1>
        <p className="mt-2 text-sm text-white/60 sm:mt-3">
          {stats.episodeScores.length} episode{stats.episodeScores.length !== 1 ? 's' : ''} scored
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10">
        {episodeNumbers.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <p className="text-sm text-warm-gray">No episodes available yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {episodeNumbers.map((epNum) => {
              const episodeData = episodes.find((e) => e.episodeNumber === epNum);
              const epScore = stats.episodeScores.find((e) => e.episodeNumber === epNum);
              const isScored = !!episodeData?.scored;
              const isCurrent = epNum === seasonEpisode;

              // Get eliminated chefs for this episode
              const eliminatedThisEp = isScored
                ? chefs.filter(
                    (c) =>
                      c.status === 'eliminated' &&
                      c.eliminatedEpisode === epNum &&
                      !c.eliminatedPreDraft
                  )
                : [];

              // Get individual chef results for breakdown
              const chefResults = episodeData?.results ?? [];

              return (
                <Link
                  key={epNum}
                  href={`/episode/${epNum}`}
                  className="group rounded-xl border border-stone-light/50 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all hover:border-stone-light hover:shadow-md sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: Episode info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-lg font-bold text-charcoal">
                          Episode {epNum}
                        </h3>
                        {isScored ? (
                          <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success">
                            Scored
                          </span>
                        ) : isCurrent ? (
                          <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold">
                            Current
                          </span>
                        ) : (
                          <span className="rounded-full bg-stone-light/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warm-gray">
                            Upcoming
                          </span>
                        )}
                      </div>

                      {/* Scores */}
                      {isScored && epScore && (
                        <div className="mt-2 flex items-center gap-3">
                          <span className="font-mono text-sm font-bold text-josh">
                            Josh {epScore.joshScore > 0 ? '+' : ''}{epScore.joshScore}
                          </span>
                          <span className="text-xs text-stone">vs</span>
                          <span className="font-mono text-sm font-bold text-jazzy">
                            Jazzy {epScore.jazzyScore > 0 ? '+' : ''}{epScore.jazzyScore}
                          </span>
                          <span className={`ml-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                            epScore.winner === 'josh'
                              ? 'bg-josh/10 text-josh'
                              : epScore.winner === 'jazzy'
                                ? 'bg-jazzy/10 text-jazzy'
                                : 'bg-gold/10 text-gold'
                          }`}>
                            {epScore.winner === 'josh' ? 'Josh wins' : epScore.winner === 'jazzy' ? 'Jazzy wins' : 'Tie'}
                          </span>
                        </div>
                      )}

                      {/* Chef breakdown */}
                      {isScored && chefResults.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {chefResults
                            .filter((r) => {
                              const pts = calculatePoints(r);
                              return pts !== 0 || r.eliminated;
                            })
                            .map((r) => {
                              const chef = chefs.find((c) => c.id === r.chefId);
                              if (!chef) return null;
                              const pts = calculatePoints(r);
                              return (
                                <span
                                  key={r.chefId}
                                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                    r.eliminated
                                      ? 'bg-danger/10 text-danger'
                                      : pts > 0
                                        ? 'bg-success/10 text-success'
                                        : 'bg-danger/10 text-danger'
                                  }`}
                                >
                                  {chef.firstName}
                                  {r.eliminated
                                    ? ' OUT'
                                    : ` ${pts > 0 ? '+' : ''}${pts}`}
                                </span>
                              );
                            })}
                        </div>
                      )}

                      {!isScored && (
                        <p className="mt-2 text-sm text-warm-gray">
                          {isCurrent ? 'Tap to score this episode' : 'Not yet scored'}
                        </p>
                      )}
                    </div>

                    {/* Right: eliminated chef avatars */}
                    {eliminatedThisEp.length > 0 && (
                      <div className="flex shrink-0 flex-col items-center gap-1">
                        {eliminatedThisEp.map((chef) => (
                          <div key={chef.id} className="relative h-8 w-8 overflow-hidden rounded-full opacity-50 grayscale">
                            <Image
                              src={chef.imageUrl}
                              alt={chef.firstName}
                              fill
                              className="object-cover object-top"
                              sizes="32px"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Edit hint */}
                  {isScored && (
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-warm-gray/50 transition-colors group-hover:text-charcoal">
                      Tap to edit
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* Back to dashboard */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/dashboard"
            className="rounded-xl bg-white px-6 py-2.5 text-center text-sm font-medium text-charcoal shadow-md transition-all hover:shadow-lg"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
