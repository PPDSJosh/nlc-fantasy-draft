'use client';

import { useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Chef } from '@/lib/data/chefs';
import gsap from 'gsap';
import { Draggable } from 'gsap/dist/Draggable';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(Draggable);
}

const TYPE_COLORS: Record<string, string> = {
  pro: 'bg-pro',
  social: 'bg-social',
  home: 'bg-home',
};

interface AvailableChefsProps {
  chefs: Chef[];
  onDraft: (chefId: string) => void;
  disabled: boolean;
  getDropTarget: () => HTMLDivElement | null;
}

function DraftableChef({
  chef,
  onDraft,
  disabled,
  getDropTarget,
}: {
  chef: Chef;
  onDraft: (chefId: string) => void;
  disabled: boolean;
  getDropTarget: () => HTMLDivElement | null;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const draggableRef = useRef<Draggable[]>([]);

  const setupDraggable = useCallback(() => {
    if (!btnRef.current || disabled) return;

    draggableRef.current.forEach((d) => d.kill());

    draggableRef.current = Draggable.create(btnRef.current, {
      type: 'x,y',
      zIndexBoost: true,
      onDragStart() {
        gsap.to(btnRef.current, { scale: 1.1, boxShadow: '0 12px 30px rgba(0,0,0,0.2)', duration: 0.15 });
      },
      onDrag() {
        const dropTarget = getDropTarget();
        if (!dropTarget || !btnRef.current) return;
        if (this.hitTest(dropTarget, '20%')) {
          gsap.to(dropTarget, { borderColor: 'var(--gold)', backgroundColor: 'var(--gold-light)', duration: 0.15, overwrite: true });
        } else {
          gsap.to(dropTarget, { borderColor: '', backgroundColor: '', duration: 0.15, overwrite: true });
        }
      },
      onDragEnd() {
        const dropTarget = getDropTarget();
        if (dropTarget && this.hitTest(dropTarget, '20%')) {
          gsap.to(dropTarget, { borderColor: '', backgroundColor: '', duration: 0.15 });
          gsap.to(btnRef.current, {
            scale: 0,
            opacity: 0,
            duration: 0.2,
            ease: 'power2.in',
            onComplete: () => {
              onDraft(chef.id);
            },
          });
        } else {
          if (dropTarget) {
            gsap.to(dropTarget, { borderColor: '', backgroundColor: '', duration: 0.15 });
          }
          gsap.to(btnRef.current, {
            x: 0,
            y: 0,
            scale: 1,
            boxShadow: '',
            duration: 0.3,
            ease: 'power2.out',
          });
        }
      },
    });
  }, [chef.id, disabled, getDropTarget, onDraft]);

  useEffect(() => {
    setupDraggable();
    return () => {
      draggableRef.current.forEach((d) => d.kill());
    };
  }, [setupDraggable]);

  function handleClick() {
    if (btnRef.current) {
      gsap.to(btnRef.current, {
        scale: 0.9,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
      });
    }
    onDraft(chef.id);
  }

  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      disabled={disabled}
      className="group flex flex-col items-center gap-1.5 rounded-xl p-2 transition-all hover:bg-white/60 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <div className="relative h-14 w-14 overflow-hidden rounded-full shadow-md">
        <Image
          src={chef.imageUrl}
          alt={chef.firstName}
          fill
          className="object-cover object-top transition-transform duration-300 group-hover:scale-110"
          sizes="56px"
        />
        <div className={`absolute bottom-0 left-0 right-0 h-[2px] ${TYPE_COLORS[chef.type]}`} />
      </div>
      <span className="font-display text-xs font-semibold text-charcoal">
        {chef.firstName}
      </span>
    </button>
  );
}

export default function AvailableChefs({ chefs, onDraft, disabled, getDropTarget }: AvailableChefsProps) {
  return (
    <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5 sm:gap-2">
      {chefs.map((chef) => (
        <DraftableChef
          key={chef.id}
          chef={chef}
          onDraft={onDraft}
          disabled={disabled}
          getDropTarget={getDropTarget}
        />
      ))}
    </div>
  );
}
