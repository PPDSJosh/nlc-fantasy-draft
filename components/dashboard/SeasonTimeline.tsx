'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Link from 'next/link';
import { EpisodeScore, ChefStat } from '@/lib/hooks/useSeasonStats';

interface SeasonTimelineProps {
  episodeScores: EpisodeScore[];
  chefStats: ChefStat[];
  currentSeasonEpisode: number;
}

interface KeyEvent {
  label: string;
  type: 'elimination' | 'lead_change' | 'prediction';
}

function getKeyEvents(
  ep: EpisodeScore,
  prevEp: EpisodeScore | null,
  chefStats: ChefStat[]
): KeyEvent[] {
  const events: KeyEvent[] = [];

  // Chefs eliminated this episode
  const eliminated = chefStats.filter(
    (c) => c.status === 'eliminated' && c.eliminatedEpisode === ep.episodeNumber
  );
  for (const chef of eliminated.slice(0, 1)) {
    events.push({ label: `${chef.firstName} eliminated`, type: 'elimination' });
  }

  // Lead change: previous episode's cumulative leader differs from this one
  if (prevEp) {
    const prevLeader =
      prevEp.joshCumulative > prevEp.jazzyCumulative
        ? 'josh'
        : prevEp.jazzyCumulative > prevEp.joshCumulative
          ? 'jazzy'
          : 'tied';
    const currLeader =
      ep.joshCumulative > ep.jazzyCumulative
        ? 'josh'
        : ep.jazzyCumulative > ep.joshCumulative
          ? 'jazzy'
          : 'tied';
    if (prevLeader !== currLeader && events.length < 2) {
      events.push({ label: 'Lead changed', type: 'lead_change' });
    }
  }

  return events.slice(0, 2);
}

function winnerColor(winner: 'josh' | 'jazzy' | 'tie'): string {
  if (winner === 'josh') return 'bg-josh';
  if (winner === 'jazzy') return 'bg-jazzy';
  return 'bg-gold';
}

function lineColor(ep: EpisodeScore): string {
  if (ep.joshCumulative > ep.jazzyCumulative) return 'bg-josh/40';
  if (ep.jazzyCumulative > ep.joshCumulative) return 'bg-jazzy/40';
  return 'bg-gold/40';
}

export default function SeasonTimeline({
  episodeScores,
  chefStats,
  currentSeasonEpisode,
}: SeasonTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const nodes = containerRef.current.querySelectorAll('[data-timeline-node]');
    if (nodes.length === 0) return;

    gsap.fromTo(
      nodes,
      { opacity: 0, y: 12 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: 'power2.out',
      }
    );
  }, [episodeScores.length]);

  if (episodeScores.length === 0) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.15em] text-warm-gray">
          Season Timeline
        </h2>
        <p className="text-sm text-stone">No episodes scored yet</p>
      </div>
    );
  }

  // Include current unscored episode as a "pending" node
  const hasUnscored = !episodeScores.find(
    (e) => e.episodeNumber === currentSeasonEpisode
  );

  return (
    <div ref={containerRef} className="rounded-xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.15em] text-warm-gray">
        Season Timeline
      </h2>

      {/* Desktop: horizontal scroll */}
      <div className="hidden sm:block">
        <div
          className="flex items-start gap-0 overflow-x-auto pb-2"
        >
          {episodeScores.map((ep, i) => {
            const prevEp = i > 0 ? episodeScores[i - 1] : null;
            const events = getKeyEvents(ep, prevEp, chefStats);

            return (
              <div key={ep.episodeNumber} className="flex items-start" data-timeline-node style={{ opacity: 0 }}>
                {/* Connecting line (not before first) */}
                {i > 0 && (
                  <div className={`mt-[14px] h-0.5 w-8 shrink-0 ${lineColor(prevEp!)}`} />
                )}

                {/* Node */}
                <Link
                  href={`/episode/${ep.episodeNumber}`}
                  className="group flex w-28 shrink-0 flex-col items-center"
                >
                  {/* Dot */}
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full ${winnerColor(ep.winner)} text-[10px] font-bold text-white shadow-sm transition-transform group-hover:scale-110`}
                  >
                    {ep.episodeNumber}
                  </div>

                  {/* Score */}
                  <p className="mt-1.5 font-mono text-[11px] text-charcoal">
                    <span className="text-josh">{ep.joshScore > 0 ? '+' : ''}{ep.joshScore}</span>
                    <span className="mx-1 text-stone">/</span>
                    <span className="text-jazzy">{ep.jazzyScore > 0 ? '+' : ''}{ep.jazzyScore}</span>
                  </p>

                  {/* Key events */}
                  {events.map((evt, j) => (
                    <p
                      key={j}
                      className={`mt-0.5 text-center text-[9px] leading-tight ${
                        evt.type === 'elimination'
                          ? 'text-danger/70'
                          : evt.type === 'lead_change'
                            ? 'text-gold'
                            : 'text-success/70'
                      }`}
                    >
                      {evt.label}
                    </p>
                  ))}
                </Link>
              </div>
            );
          })}

          {/* Unscored current episode node */}
          {hasUnscored && (
            <div className="flex items-start" data-timeline-node style={{ opacity: 0 }}>
              {episodeScores.length > 0 && (
                <div className="mt-[14px] h-0.5 w-8 shrink-0 bg-stone-light/40" />
              )}
              <Link
                href={`/episode/${currentSeasonEpisode}`}
                className="group flex w-28 shrink-0 flex-col items-center"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-dashed border-stone text-[10px] font-bold text-stone transition-colors group-hover:border-charcoal group-hover:text-charcoal">
                  {currentSeasonEpisode}
                </div>
                <p className="mt-1.5 text-[10px] text-stone">Upcoming</p>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: vertical stack */}
      <div className="flex flex-col gap-0 sm:hidden">
        {episodeScores.map((ep, i) => {
          const prevEp = i > 0 ? episodeScores[i - 1] : null;
          const events = getKeyEvents(ep, prevEp, chefStats);

          return (
            <div key={ep.episodeNumber} data-timeline-node style={{ opacity: 0 }}>
              {/* Vertical connector */}
              {i > 0 && (
                <div className={`ml-[13px] h-4 w-0.5 ${lineColor(prevEp!)}`} />
              )}

              <Link
                href={`/episode/${ep.episodeNumber}`}
                className="group flex items-start gap-3"
              >
                {/* Dot */}
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${winnerColor(ep.winner)} text-[10px] font-bold text-white shadow-sm`}
                >
                  {ep.episodeNumber}
                </div>

                {/* Details */}
                <div className="flex-1 pb-1">
                  <p className="font-mono text-xs text-charcoal">
                    <span className="text-josh">Josh {ep.joshScore > 0 ? '+' : ''}{ep.joshScore}</span>
                    <span className="mx-1.5 text-stone">/</span>
                    <span className="text-jazzy">Jazzy {ep.jazzyScore > 0 ? '+' : ''}{ep.jazzyScore}</span>
                  </p>
                  {events.map((evt, j) => (
                    <p
                      key={j}
                      className={`mt-0.5 text-[10px] ${
                        evt.type === 'elimination'
                          ? 'text-danger/70'
                          : evt.type === 'lead_change'
                            ? 'text-gold'
                            : 'text-success/70'
                      }`}
                    >
                      {evt.label}
                    </p>
                  ))}
                </div>
              </Link>
            </div>
          );
        })}

        {/* Unscored node */}
        {hasUnscored && (
          <div data-timeline-node style={{ opacity: 0 }}>
            {episodeScores.length > 0 && (
              <div className="ml-[13px] h-4 w-0.5 bg-stone-light/40" />
            )}
            <Link
              href={`/episode/${currentSeasonEpisode}`}
              className="group flex items-start gap-3"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-stone text-[10px] font-bold text-stone">
                {currentSeasonEpisode}
              </div>
              <p className="text-sm text-stone">Upcoming</p>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
