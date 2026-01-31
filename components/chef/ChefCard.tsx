'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { Chef } from '@/lib/data/chefs';
import gsap from 'gsap';

const TYPE_COLORS: Record<Chef['type'], string> = {
  pro: 'bg-pro',
  social: 'bg-social',
  home: 'bg-home',
};

const TYPE_LABELS: Record<Chef['type'], string> = {
  pro: 'PRO',
  social: 'SOCIAL',
  home: 'HOME',
};

interface ChefCardProps {
  chef: Chef;
  onClick: (chef: Chef) => void;
  size?: 'small' | 'default';
}

export default function ChefCard({ chef, onClick, size = 'default' }: ChefCardProps) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const isEliminated = chef.status === 'eliminated';
  const imageHeight = size === 'small' ? 'h-28' : 'h-44';

  function handleMouseEnter() {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        scale: 1.03,
        y: -6,
        duration: 0.25,
        ease: 'power2.out',
      });
    }
  }

  function handleMouseLeave() {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        scale: 1,
        y: 0,
        duration: 0.25,
        ease: 'power2.out',
      });
    }
  }

  return (
    <button
      ref={cardRef}
      onClick={() => onClick(chef)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group flex w-full flex-col overflow-hidden rounded-xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] ${
        isEliminated ? 'opacity-80' : ''
      }`}
    >
      {/* Type color stripe */}
      <div className={`h-1 w-full ${TYPE_COLORS[chef.type]}`} />

      {/* Photo */}
      <div className={`relative w-full ${imageHeight} overflow-hidden bg-stone-light`}>
        <Image
          src={chef.imageUrl}
          alt={`${chef.firstName} ${chef.lastName}`}
          fill
          className={`object-cover object-top transition-transform duration-300 group-hover:scale-105 ${
            isEliminated ? 'grayscale' : ''
          }`}
          sizes="(max-width: 640px) 33vw, 16vw"
        />
        {isEliminated && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-ink/50">
            <span className="rounded-sm bg-danger px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              Eliminated
            </span>
            {chef.eliminatedEpisode !== null && (
              <span className="mt-1 text-[10px] font-semibold text-white/80">
                EP {chef.eliminatedEpisode}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex w-full flex-col items-center gap-1.5 p-3">
        <span className="font-display text-sm font-semibold text-charcoal">
          {chef.firstName}
        </span>
        <span
          className={`rounded-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white ${TYPE_COLORS[chef.type]}`}
        >
          {TYPE_LABELS[chef.type]}
        </span>
      </div>
    </button>
  );
}
