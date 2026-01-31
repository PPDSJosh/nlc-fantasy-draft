'use client';

import { useRef } from 'react';
import { Chef } from '@/lib/data/chefs';
import gsap from 'gsap';

const TYPE_COLORS: Record<Chef['type'], string> = {
  pro: '#3A5BA0',
  social: '#9B4A8C',
  home: '#5A8A4A',
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
  const imageSize = size === 'small' ? 'h-24' : 'h-36';

  function handleMouseEnter() {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        scale: 1.05,
        y: -4,
        duration: 0.2,
        ease: 'power2.out',
      });
    }
  }

  function handleMouseLeave() {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        scale: 1,
        y: 0,
        duration: 0.2,
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
      className={`group flex w-full flex-col items-center overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md ${
        isEliminated ? 'opacity-75' : ''
      }`}
    >
      <div className={`relative w-full ${imageSize} bg-gray-300`}>
        {isEliminated && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/50">
            <span className="rounded bg-red-600 px-2 py-1 text-xs font-bold uppercase tracking-wider text-white">
              Eliminated
            </span>
            {chef.eliminatedEpisode !== null && (
              <span className="mt-1 text-[10px] font-semibold text-white">
                EP {chef.eliminatedEpisode}
              </span>
            )}
          </div>
        )}
        <div
          className={`flex h-full w-full items-center justify-center text-3xl text-gray-500 ${
            isEliminated ? 'grayscale' : ''
          }`}
        >
          {chef.firstName[0]}
          {chef.lastName[0]}
        </div>
      </div>
      <div className="flex w-full flex-col items-center gap-1 p-2">
        <span className="text-sm font-semibold text-gray-900">
          {chef.firstName}
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
          style={{ backgroundColor: TYPE_COLORS[chef.type] }}
        >
          {TYPE_LABELS[chef.type]}
        </span>
      </div>
    </button>
  );
}
