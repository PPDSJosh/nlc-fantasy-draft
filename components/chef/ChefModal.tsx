'use client';

import Image from 'next/image';
import { Chef } from '@/lib/data/chefs';
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
  wife: { label: "Wife's Team", color: 'text-wife' },
  wildcard: { label: 'Wildcard', color: 'text-gold' },
  undrafted: { label: 'Undrafted', color: 'text-warm-gray' },
};

interface ChefModalProps {
  chef: Chef | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChefModal({ chef, isOpen, onClose }: ChefModalProps) {
  if (!chef) return null;

  const isEliminated = chef.status === 'eliminated';
  const ownerInfo = OWNER_LABELS[chef.owner];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col">
        {/* Hero image */}
        <div
          className={`relative aspect-[4/3] w-full overflow-hidden ${
            isEliminated ? 'grayscale' : ''
          }`}
        >
          <Image
            src={chef.imageUrl}
            alt={`${chef.firstName} ${chef.lastName}`}
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 512px"
            priority
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />

          {/* Name overlay on image */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h2 className="font-display text-3xl font-bold text-white drop-shadow-lg">
              {chef.firstName} {chef.lastName}
            </h2>
          </div>

          {isEliminated && (
            <div className="absolute left-4 top-4">
              <span className="rounded-sm bg-danger px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                Eliminated
                {chef.eliminatedEpisode !== null && ` — EP ${chef.eliminatedEpisode}`}
              </span>
            </div>
          )}
        </div>

        {/* Info section */}
        <div className="flex flex-col gap-4 p-5">
          {/* Type + Status row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className={`rounded-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white ${TYPE_COLORS[chef.type]}`}
              >
                {TYPE_LABELS[chef.type]}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  isEliminated ? 'bg-danger' : 'bg-success'
                }`}
              />
              <span className="text-xs font-medium text-warm-gray">
                {isEliminated ? 'Eliminated' : 'Active'}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-stone-light" />

          {/* Team info */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-warm-gray">
              Team
            </span>
            <span className={`text-sm font-bold ${ownerInfo.color}`}>
              {ownerInfo.label}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
