'use client';

import Image from 'next/image';
import { Chef } from '@/lib/data/chefs';
import { useGameStore } from '@/lib/store/gameStore';
import Modal from '@/components/ui/Modal';

const TYPE_COLORS: Record<Chef['type'], string> = {
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
  const phase = useGameStore((s) => s.phase);

  if (!chef) return null;

  const isEliminated = chef.status === 'eliminated';
  const ownerInfo = OWNER_LABELS[chef.owner];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <div className="flex flex-col md:flex-row">
        {/* Photo side */}
        <div
          className={`relative aspect-[3/4] w-full overflow-hidden md:aspect-auto md:w-2/5 md:min-h-[480px] ${
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
          <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-ink/5" />

          {/* Type badge */}
          <div className="absolute left-4 top-4 md:top-auto md:bottom-4">
            <span
              className={`rounded-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-md ${TYPE_COLORS[chef.type]}`}
            >
              {TYPE_LABELS[chef.type]}
            </span>
          </div>

          {isEliminated && (
            <div className="absolute right-4 top-4 md:left-4 md:right-auto md:top-auto md:bottom-12">
              <span className="rounded-sm bg-danger/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-md">
                Eliminated{chef.eliminatedEpisode !== null && ` \u2014 EP ${chef.eliminatedEpisode}`}
              </span>
            </div>
          )}
        </div>

        {/* Content side */}
        <div className="flex flex-1 flex-col justify-center p-6 sm:p-8 md:p-10">
          <h2 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">
            {chef.firstName}
          </h2>
          <p className="font-display text-xl text-warm-gray sm:text-2xl">
            {chef.lastName}
          </p>

          {/* Decorative divider */}
          <div className="mt-5 h-[2px] w-12 bg-gold" />

          {/* Bio */}
          <p className="mt-5 text-sm leading-relaxed text-charcoal/70">
            {chef.bio}
          </p>

          {/* Hometown */}
          <p className="mt-3 text-xs text-warm-gray">
            {chef.hometown}
          </p>

          {/* Meta grid */}
          <div className="mt-8 grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-warm-gray">
                Type
              </p>
              <p className={`mt-1.5 text-sm font-semibold ${TYPE_TEXT[chef.type]}`}>
                {TYPE_LABELS[chef.type]}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-warm-gray">
                Team
              </p>
              <p className={`mt-1.5 text-sm font-semibold ${ownerInfo.color}`}>
                {ownerInfo.label}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-warm-gray">
                Status
              </p>
              <button
                onClick={() => toggleChefStatus(chef.id)}
                className="mt-1.5 flex items-center gap-2.5 group/toggle"
              >
                {/* Toggle track */}
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
                <span className={`text-sm font-medium transition-colors ${
                  isEliminated
                    ? 'text-danger group-hover/toggle:text-danger/70'
                    : 'text-charcoal group-hover/toggle:text-charcoal/70'
                }`}>
                  {isEliminated ? 'Eliminated' : 'Active'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
