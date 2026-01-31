'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { Chef } from '@/lib/data/chefs';
import gsap from 'gsap';

const TYPE_BG: Record<Chef['type'], string> = {
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
      gsap.to(cardRef.current, { y: -6, duration: 0.3, ease: 'power2.out' });
    }
  }

  function handleMouseLeave() {
    if (cardRef.current) {
      gsap.to(cardRef.current, { y: 0, duration: 0.3, ease: 'power2.out' });
    }
  }

  return (
    <button
      ref={cardRef}
      onClick={() => onClick(chef)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative w-full overflow-hidden rounded-lg ${
        size === 'small' ? 'aspect-square' : 'aspect-[3/4]'
      } cursor-pointer shadow-[0_2px_16px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_16px_48px_rgba(0,0,0,0.2)]`}
    >
      {/* Full-bleed image */}
      <Image
        src={chef.imageUrl}
        alt={`${chef.firstName} ${chef.lastName}`}
        fill
        className={`object-cover object-top transition-all duration-500 group-hover:scale-[1.04] ${
          isEliminated ? 'brightness-[0.2] grayscale' : 'group-hover:brightness-110'
        }`}
        sizes={size === 'small' ? '120px' : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'}
      />

      {/* Type badge — solid color, top-left */}
      {size !== 'small' && (
        <div className="absolute left-3 top-3 z-10">
          <span className={`inline-block rounded-[3px] px-2 py-[3px] text-[9px] font-bold uppercase tracking-[0.15em] text-white shadow-sm ${TYPE_BG[chef.type]}`}>
            {TYPE_LABELS[chef.type]}
          </span>
        </div>
      )}

      {/* Owner dot — top-right */}
      {chef.owner !== 'undrafted' && OWNER_DOTS[chef.owner] && (
        <div className={`absolute right-3 top-3 z-10 h-3.5 w-3.5 rounded-full shadow-lg ${OWNER_DOTS[chef.owner]} ring-2 ring-white/40`} />
      )}

      {/* Gradient overlay + Name */}
      <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent ${
        size === 'small' ? 'px-2.5 pb-3 pt-10' : 'px-4 pb-6 pt-24'
      }`}>
        <p className={`font-display font-bold leading-none text-white ${
          size === 'small' ? 'text-sm' : 'text-xl sm:text-2xl'
        }`}>
          {chef.firstName}
        </p>
        {size !== 'small' && (
          <p className="mt-1 text-[11px] font-medium tracking-wide text-white/40">
            {chef.lastName}
          </p>
        )}
      </div>

      {/* Bottom accent bar — type color */}
      <div className={`absolute bottom-0 left-0 right-0 h-[5px] ${TYPE_BG[chef.type]} ${
        isEliminated ? 'opacity-20' : ''
      }`} />

      {/* Eliminated overlay */}
      {isEliminated && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <span className="rounded-[3px] bg-danger/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white shadow-lg backdrop-blur-sm">
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
