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

const OWNER_DOTS: Record<string, string> = {
  josh: 'bg-josh',
  wife: 'bg-jazzy',
  wildcard: 'bg-gold',
};

interface ChefCardProps {
  chef: Chef;
  onClick: (chef: Chef) => void;
  size?: 'small' | 'default';
}

export default function ChefCard({ chef, onClick, size = 'default' }: ChefCardProps) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const isEliminated = chef.status === 'eliminated';

  function handleMouseEnter() {
    if (cardRef.current && !isEliminated) {
      gsap.to(cardRef.current, {
        y: -8,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  }

  function handleMouseLeave() {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        y: 0,
        duration: 0.3,
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
      className={`group relative w-full overflow-hidden rounded-2xl ${
        size === 'small' ? 'aspect-square' : 'aspect-[3/4]'
      } cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-shadow hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)]`}
    >
      {/* Full-bleed image */}
      <Image
        src={chef.imageUrl}
        alt={`${chef.firstName} ${chef.lastName}`}
        fill
        className={`object-cover object-top transition-all duration-500 group-hover:scale-[1.06] ${
          isEliminated ? 'brightness-[0.3] grayscale' : 'group-hover:brightness-105'
        }`}
        sizes={size === 'small' ? '120px' : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'}
      />

      {/* Dark gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent ${
        isEliminated ? 'from-black/90' : ''
      }`} />

      {/* Type color line at top */}
      <div className={`absolute left-0 right-0 top-0 h-[3px] ${TYPE_COLORS[chef.type]}`} />

      {/* Owner dot */}
      {chef.owner !== 'undrafted' && OWNER_DOTS[chef.owner] && (
        <div className={`absolute right-3 top-3 h-3 w-3 rounded-full shadow-lg ${OWNER_DOTS[chef.owner]} ring-2 ring-white/30`} />
      )}

      {/* Content at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
        <p className={`font-display font-bold leading-tight text-white drop-shadow-lg ${
          size === 'small' ? 'text-sm' : 'text-lg sm:text-xl'
        }`}>
          {chef.firstName}
        </p>
        {size !== 'small' && (
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
            {TYPE_LABELS[chef.type]}
          </p>
        )}
      </div>

      {/* Eliminated stamp */}
      {isEliminated && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <span className="rounded-sm bg-danger/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white shadow-lg backdrop-blur-sm">
            Eliminated
          </span>
          {chef.eliminatedEpisode !== null && (
            <span className="font-mono text-[10px] text-white/50">
              EP {chef.eliminatedEpisode}
            </span>
          )}
        </div>
      )}
    </button>
  );
}
