'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface MomentumBarProps {
  joshTotal: number;
  jazzyTotal: number;
}

export default function MomentumBar({ joshTotal, jazzyTotal }: MomentumBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  const total = joshTotal + jazzyTotal;
  // When both are 0 (or equal), bar should be at 50%. Otherwise proportional.
  const joshPct = total === 0 ? 50 : (joshTotal / total) * 100;

  useEffect(() => {
    if (!fillRef.current) return;
    gsap.fromTo(
      fillRef.current,
      { width: '50%' },
      { width: `${joshPct}%`, duration: 1, ease: 'power2.out' }
    );
  }, [joshPct]);

  const isTied = joshTotal === jazzyTotal;

  return (
    <div className="w-full">
      {/* Labels */}
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-xs font-bold text-josh">Josh</span>
        <span className="font-mono text-xs font-bold text-jazzy">Jazzy</span>
      </div>

      {/* Bar track */}
      <div
        ref={barRef}
        className="relative h-3 w-full overflow-hidden rounded-full bg-jazzy/30"
      >
        {/* Josh fill -- from left */}
        <div
          ref={fillRef}
          className={`absolute inset-y-0 left-0 rounded-full ${
            isTied ? 'bg-gold' : 'bg-josh'
          }`}
          style={{ width: '50%' }}
        />

        {/* Center tick mark */}
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/40" />
      </div>

      {/* Narrative */}
      <p className="mt-2 text-center text-sm text-warm-gray">
        {isTied
          ? `Tied at ${joshTotal}`
          : joshTotal > jazzyTotal
            ? `Josh leads by ${joshTotal - jazzyTotal} point${joshTotal - jazzyTotal !== 1 ? 's' : ''}`
            : `Jazzy leads by ${jazzyTotal - joshTotal} point${jazzyTotal - joshTotal !== 1 ? 's' : ''}`}
      </p>
    </div>
  );
}
