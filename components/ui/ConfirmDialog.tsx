'use client';

import { useEffect, useRef } from 'react';

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
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4 backdrop-blur-sm animate-[fadeIn_150ms_ease-out]"
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm overflow-hidden rounded-xl bg-cream shadow-[0_25px_60px_rgba(0,0,0,0.4)] animate-[scaleIn_200ms_ease-out]"
      >
        <div className="p-6 text-center">
          <h3 className="font-display text-xl font-bold text-charcoal">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-warm-gray">{message}</p>
        </div>
        <div className="flex border-t border-stone-light/30">
          <button
            onClick={onCancel}
            className="flex-1 py-3 text-sm font-medium text-warm-gray transition-colors hover:bg-stone-light/20 active:bg-stone-light/30"
          >
            {cancelLabel}
          </button>
          <div className="w-px bg-stone-light/30" />
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 text-sm font-bold transition-colors active:opacity-70 ${
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
