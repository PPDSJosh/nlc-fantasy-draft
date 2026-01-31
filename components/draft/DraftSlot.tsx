'use client';

import Image from 'next/image';
import { Chef } from '@/lib/data/chefs';

const TYPE_COLORS: Record<string, string> = {
  pro: 'bg-pro',
  social: 'bg-social',
  home: 'bg-home',
};

interface DraftSlotProps {
  pickNumber: number;
  chef: Chef | null;
  isActive: boolean;
}

export default function DraftSlot({ pickNumber, chef, isActive }: DraftSlotProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-2.5 transition-all ${
        isActive
          ? 'border-gold bg-gold/10 shadow-[0_0_0_1px_var(--gold)]'
          : chef
          ? 'border-stone-light/50 bg-white'
          : 'border-dashed border-stone/30 bg-cream-dark/30'
      }`}
    >
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold ${
        isActive ? 'bg-gold text-ink' : 'bg-charcoal/5 text-warm-gray'
      }`}>
        {pickNumber}
      </span>
      {chef ? (
        <div className="flex items-center gap-2.5">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
            <Image
              src={chef.imageUrl}
              alt={chef.firstName}
              fill
              className="object-cover object-top"
              sizes="36px"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-sm font-semibold text-charcoal">
              {chef.firstName} {chef.lastName}
            </span>
            <span
              className={`w-fit rounded-sm px-1.5 py-0 text-[8px] font-bold uppercase tracking-widest text-white ${TYPE_COLORS[chef.type]}`}
            >
              {chef.type}
            </span>
          </div>
        </div>
      ) : (
        <span className="text-sm italic text-stone">
          {isActive ? 'Waiting for pick...' : 'Empty slot'}
        </span>
      )}
    </div>
  );
}
