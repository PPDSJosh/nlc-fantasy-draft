'use client';

import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);
  const isVisible = useRef(false);

  const animateClose = useCallback(
    (callback: () => void) => {
      if (isAnimating.current || !isVisible.current) return;
      isAnimating.current = true;

      const tl = gsap.timeline({
        onComplete: () => {
          isAnimating.current = false;
          isVisible.current = false;
          callback();
        },
      });

      if (panelRef.current) {
        tl.to(panelRef.current, { scale: 0.96, opacity: 0, duration: 0.15, ease: 'power2.in' }, 0);
      }
      if (overlayRef.current) {
        tl.to(overlayRef.current, { opacity: 0, duration: 0.15, ease: 'power2.in' }, 0);
      }
    },
    []
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        animateClose(onCancel);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      isVisible.current = true;

      if (overlayRef.current && panelRef.current) {
        gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power2.out' });
        gsap.fromTo(panelRef.current, { scale: 0.96, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25, ease: 'power2.out', delay: 0.03 });
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, animateClose, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={() => animateClose(onCancel)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm"
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm overflow-hidden rounded-xl bg-cream shadow-[0_25px_60px_rgba(0,0,0,0.4)]"
      >
        <div className="p-6 text-center">
          <h3 className="font-display text-xl font-bold text-charcoal">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-warm-gray">{message}</p>
        </div>
        <div className="flex border-t border-stone-light/30">
          <button
            onClick={() => animateClose(onCancel)}
            className="flex-1 py-3 text-sm font-medium text-warm-gray transition-colors hover:bg-stone-light/20"
          >
            {cancelLabel}
          </button>
          <div className="w-px bg-stone-light/30" />
          <button
            onClick={() => animateClose(onConfirm)}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${
              destructive
                ? 'text-danger hover:bg-danger/5'
                : 'text-charcoal hover:bg-stone-light/20'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
