'use client';

import { Chef } from '@/lib/data/chefs';
import Modal from '@/components/ui/Modal';

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

interface ChefModalProps {
  chef: Chef | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChefModal({ chef, isOpen, onClose }: ChefModalProps) {
  if (!chef) return null;

  const isEliminated = chef.status === 'eliminated';

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="overflow-hidden rounded-xl">
        {/* Large photo area — 16:9 aspect ratio */}
        <div
          className={`relative flex aspect-video w-full items-center justify-center bg-gray-300 ${
            isEliminated ? 'grayscale' : ''
          }`}
        >
          <span className="text-6xl text-gray-500">
            {chef.firstName[0]}
            {chef.lastName[0]}
          </span>
          {isEliminated && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="rounded bg-red-600 px-3 py-1.5 text-sm font-bold uppercase tracking-wider text-white">
                Eliminated
              </span>
            </div>
          )}
        </div>

        {/* Info section */}
        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">
              {chef.firstName} {chef.lastName}
            </h2>
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white"
              style={{ backgroundColor: TYPE_COLORS[chef.type] }}
            >
              {TYPE_LABELS[chef.type]}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Status:</span>
            <span
              className={`text-sm font-semibold ${
                isEliminated ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {isEliminated ? 'Eliminated' : 'Active'}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
