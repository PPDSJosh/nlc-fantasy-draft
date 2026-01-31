'use client';

import Image from 'next/image';
import { Chef } from '@/lib/data/chefs';
import { useGameStore } from '@/lib/store/gameStore';
import Modal from '@/components/ui/Modal';

const TYPE_BG: Record<Chef['type'], string> = {
  pro: 'bg-pro',
  social: 'bg-social',
  home: 'bg-home',
};

const TYPE_TEXT: Record<Chef['type'], string> = {
  pro: 'text-pro',
  social: 'text-social',
  home: 'text-home',
};

const TYPE_LABELS: Record<Chef['type'], string> = {
  pro: 'Professional Chef',
  social: 'Social Media Chef',
  home: 'Home Cook',
};

const OWNER_LABELS: Record<string, { label: string; color: string }> = {
  josh: { label: "Josh's Team", color: 'text-josh' },
  wife: { label: "Jazzy's Team", color: 'text-jazzy' },
  wildcard: { label: 'Wildcard', color: 'text-gold' },
  undrafted: { label: 'Undrafted', color: 'text-warm-gray' },
};

interface ChefModalProps {
  chef: Chef | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChefModal({ chef, isOpen, onClose }: ChefModalProps) {
  const toggleChefStatus = useGameStore((s) => s.toggleChefStatus);

  if (!chef) return null;

  const isEliminated = chef.status === 'eliminated';
  const ownerInfo = OWNER_LABELS[chef.owner];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <div className="flex flex-col md:flex-row">
        {/* Photo side */}
        <div
          className={`relative aspect-[4/5] w-full overflow-hidden md:aspect-auto md:w-2/5 md:min-h-[420px] ${
            isEliminated ? 'grayscale' : ''
          }`}
        >
          <Image
            src={chef.imageUrl}
            alt={`${chef.firstName} ${chef.lastName}`}
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 400px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-ink/10 md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-ink/5" />

          {/* Type badge */}
          <div className="absolute left-4 top-4 md:bottom-4 md:top-auto">
            <span
              className={`rounded-[3px] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-white shadow-md ${TYPE_BG[chef.type]}`}
            >
              {TYPE_LABELS[chef.type]}
            </span>
          </div>

          {isEliminated && (
            <div className="absolute right-4 top-4 md:bottom-12 md:left-4 md:right-auto md:top-auto">
              <span className="rounded-[3px] bg-danger/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-white shadow-md">
                Eliminated{chef.eliminatedEpisode !== null && ` \u2014 EP ${chef.eliminatedEpisode}`}
              </span>
            </div>
          )}
        </div>

        {/* Content side */}
        <div className="flex flex-1 flex-col justify-center p-5 sm:p-8 md:p-10">
          <h2 className="font-display text-3xl font-bold leading-none text-charcoal sm:text-4xl md:text-5xl">
            {chef.firstName}
          </h2>
          <p className="mt-1 font-display text-lg text-warm-gray sm:text-xl md:text-2xl">
            {chef.lastName}
          </p>

          {/* Gold rule */}
          <div className="mt-6 h-[2px] w-16 bg-gold" />

          {/* Bio */}
          <p className="mt-6 text-sm leading-relaxed text-charcoal/70">
            {chef.bio}
          </p>

          {/* Hometown */}
          <p className="mt-2 text-xs tracking-wide text-warm-gray">
            {chef.hometown}
          </p>

          {/* Thin rule */}
          <div className="mt-6 h-px w-full bg-stone-light/50" />

          {/* Meta grid — 3 columns */}
          <div className="mt-5 grid grid-cols-3 gap-3 sm:mt-6 sm:gap-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-warm-gray">
                Type
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${TYPE_BG[chef.type]}`} />
                <p className={`text-sm font-semibold ${TYPE_TEXT[chef.type]}`}>
                  {chef.type.charAt(0).toUpperCase() + chef.type.slice(1)}
                </p>
              </div>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-warm-gray">
                Team
              </p>
              <p className={`mt-2 text-sm font-semibold ${ownerInfo.color}`}>
                {ownerInfo.label}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-warm-gray">
                Status
              </p>
              <button
                onClick={() => toggleChefStatus(chef.id)}
                className="mt-2 flex items-center gap-2 group/toggle"
              >
                <span
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ${
                    isEliminated ? 'bg-danger/80' : 'bg-success/80'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      isEliminated ? 'translate-x-[18px]' : 'translate-x-[3px]'
                    }`}
                  />
                </span>
                <span className={`text-sm font-medium ${
                  isEliminated ? 'text-danger' : 'text-charcoal'
                }`}>
                  {isEliminated ? 'Out' : 'Active'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
