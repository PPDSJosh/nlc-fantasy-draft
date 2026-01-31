'use client';

import { Chef } from '@/lib/data/chefs';

const TYPE_COLORS: Record<string, string> = {
  pro: '#3A5BA0',
  social: '#9B4A8C',
  home: '#5A8A4A',
};

interface DraftSlotProps {
  pickNumber: number;
  chef: Chef | null;
  isActive: boolean;
}

export default function DraftSlot({ pickNumber, chef, isActive }: DraftSlotProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-2 transition-colors ${
        isActive
          ? 'border-yellow-400 bg-yellow-50'
          : chef
          ? 'border-gray-200 bg-white'
          : 'border-dashed border-gray-300 bg-gray-50'
      }`}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">
        {pickNumber}
      </span>
      {chef ? (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-300 text-xs font-bold text-gray-500">
            {chef.firstName[0]}{chef.lastName[0]}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900">
              {chef.firstName} {chef.lastName}
            </span>
            <span
              className="w-fit rounded-full px-1.5 py-0 text-[9px] font-bold uppercase text-white"
              style={{ backgroundColor: TYPE_COLORS[chef.type] }}
            >
              {chef.type}
            </span>
          </div>
        </div>
      ) : (
        <span className="text-sm text-gray-400">Empty slot</span>
      )}
    </div>
  );
}
