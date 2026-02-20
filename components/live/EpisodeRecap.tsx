'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGameStore, Prediction } from '@/lib/store/gameStore';
import { useSeasonStats } from '@/lib/hooks/useSeasonStats';
import CountUp from '@/components/ui/CountUp';

/** Animated score that shows the sign (+/-) as part of the GSAP tween */
function SignedScore({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prevValue = useRef(0);

  useEffect(() => {
    if (!ref.current) return;
    const obj = { val: prevValue.current };
    gsap.to(obj, {
      val: value,
      duration: 0.8,
      ease: 'power2.out',
      onUpdate: () => {
        if (ref.current) {
          const rounded = Math.round(obj.val);
          ref.current.textContent = (rounded > 0 ? '+' : '') + rounded.toString();
        }
      },
    });
    prevValue.current = value;
  }, [value]);

  return (
    <span ref={ref} className="font-mono tabular-nums">
      {value > 0 ? '+' : ''}{value}
    </span>
  );
}

interface EpisodeRecapProps {
  episodeNumber: number;
}

export default function EpisodeRecap({ episodeNumber }: EpisodeRecapProps) {
  const { chefs, predictions } = useGameStore();
  const stats = useSeasonStats();
  const containerRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  const epScore = stats.episodeScores.find(
    (e) => e.episodeNumber === episodeNumber
  );

  const joshPred = predictions.find(
    (p: Prediction) => p.episodeNumber === episodeNumber && p.player === 'josh'
  );
  const jazzyPred = predictions.find(
    (p: Prediction) => p.episodeNumber === episodeNumber && p.player === 'wife'
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const sections = containerRef.current.querySelectorAll('[data-recap-section]');
    gsap.fromTo(
      sections,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.15,
        ease: 'power2.out',
      }
    );

    if (bannerRef.current) {
      gsap.fromTo(
        bannerRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.4)', delay: 0.3 }
      );
    }
  }, [episodeNumber]);

  if (!epScore) {
    return (
      <div className="rounded-xl bg-white p-6 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <p className="text-sm text-warm-gray">Episode {episodeNumber} has not been scored yet.</p>
      </div>
    );
  }

  const winnerLabel =
    epScore.winner === 'josh'
      ? 'Josh'
      : epScore.winner === 'jazzy'
        ? 'Jazzy'
        : null;

  const winnerColor =
    epScore.winner === 'josh'
      ? 'bg-josh'
      : epScore.winner === 'jazzy'
        ? 'bg-jazzy'
        : 'bg-gold';

  function renderPrediction(pred: Prediction | undefined, playerLabel: string, textColorClass: string) {
    if (!pred || !pred.chefId) {
      return (
        <div className="flex-1 rounded-lg border border-stone-light/30 p-3">
          <p className={`text-[10px] font-bold uppercase tracking-[0.15em] ${textColorClass}`}>
            {playerLabel}
          </p>
          <p className="mt-1 text-sm text-warm-gray">Skipped (0 pts)</p>
        </div>
      );
    }

    const predChef = chefs.find((c) => c.id === pred.chefId);
    const isCorrect = pred.correct === true;

    return (
      <div
        className={`flex-1 rounded-lg border p-3 ${
          isCorrect ? 'border-success/30 bg-success/5' : 'border-danger/30 bg-danger/5'
        }`}
      >
        <p className={`text-[10px] font-bold uppercase tracking-[0.15em] ${textColorClass}`}>
          {playerLabel}
        </p>
        <p className="mt-1 text-sm text-charcoal">
          {predChef ? `${predChef.firstName} ${predChef.lastName}` : 'Unknown'}
        </p>
        <p className={`mt-1 font-mono text-sm font-bold ${isCorrect ? 'text-success' : 'text-danger'}`}>
          {isCorrect ? 'Correct (+3)' : 'Wrong (-2)'}
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-5">
      {/* Point Swing */}
      <div data-recap-section className="grid grid-cols-2 gap-3" style={{ opacity: 0 }}>
        <div className="rounded-xl bg-josh/10 p-5 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-josh">Josh</p>
          <p className="mt-1 font-display text-3xl font-bold text-josh sm:text-4xl">
            <SignedScore value={epScore.joshScore} />
          </p>
        </div>
        <div className="rounded-xl bg-jazzy/10 p-5 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-jazzy">Jazzy</p>
          <p className="mt-1 font-display text-3xl font-bold text-jazzy sm:text-4xl">
            <SignedScore value={epScore.jazzyScore} />
          </p>
        </div>
      </div>

      {/* Episode Winner Banner */}
      <div ref={bannerRef} style={{ opacity: 0 }}>
        <div className={`rounded-xl ${winnerColor} px-6 py-4 text-center shadow-lg`}>
          <p className="font-display text-xl font-bold text-white sm:text-2xl">
            {winnerLabel
              ? `${winnerLabel} wins Episode ${episodeNumber}`
              : `Episode ${episodeNumber} -- Tied`}
          </p>
        </div>
      </div>

      {/* Prediction Results */}
      <div data-recap-section className="flex flex-col gap-2 sm:flex-row sm:gap-3" style={{ opacity: 0 }}>
        {renderPrediction(joshPred, "Josh's Prediction", 'text-josh')}
        {renderPrediction(jazzyPred, "Jazzy's Prediction", 'text-jazzy')}
      </div>

      {/* Updated Season Score */}
      <div data-recap-section className="rounded-xl bg-ink p-5 text-center" style={{ opacity: 0 }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Season Total</p>
        <div className="mt-3 flex items-center justify-center gap-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">Josh</p>
            <p className="font-display text-2xl font-bold text-josh sm:text-3xl">
              <CountUp value={epScore.joshCumulative} />
            </p>
          </div>
          <span className="text-lg text-white/20">vs</span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">Jazzy</p>
            <p className="font-display text-2xl font-bold text-jazzy sm:text-3xl">
              <CountUp value={epScore.jazzyCumulative} />
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm text-white/60">
          {epScore.joshCumulative > epScore.jazzyCumulative
            ? `Josh leads Jazzy by ${epScore.joshCumulative - epScore.jazzyCumulative} point${epScore.joshCumulative - epScore.jazzyCumulative !== 1 ? 's' : ''}`
            : epScore.jazzyCumulative > epScore.joshCumulative
              ? `Jazzy leads Josh by ${epScore.jazzyCumulative - epScore.joshCumulative} point${epScore.jazzyCumulative - epScore.joshCumulative !== 1 ? 's' : ''}`
              : `Tied at ${epScore.joshCumulative}`}
        </p>
      </div>

      {/* Streak Callout (conditional) */}
      {stats.currentStreak.player && stats.currentStreak.count >= 2 && (
        <div data-recap-section className="rounded-xl border border-gold/30 bg-gold/5 p-4 text-center" style={{ opacity: 0 }}>
          <p className="font-mono text-sm font-bold text-gold">
            {stats.currentStreak.player === 'josh' ? 'Josh' : 'Jazzy'} has won {stats.currentStreak.count} in a row
          </p>
        </div>
      )}
    </div>
  );
}
