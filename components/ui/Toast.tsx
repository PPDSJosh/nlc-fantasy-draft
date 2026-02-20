'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';

// ── Types ────────────────────────────────────────────────────────────
type ToastVariant = 'info' | 'success' | 'opponent';

interface ToastData {
  id: string;
  title: string;
  subtitle?: string;
  variant?: ToastVariant;
  duration?: number;
}

// ── Module-level store ───────────────────────────────────────────────
// Callable from anywhere (SupabaseProvider callbacks, sync.ts, etc.)
type ToastListener = (toasts: ToastData[]) => void;

let _toasts: ToastData[] = [];
let _listener: ToastListener | null = null;
let _idCounter = 0;

function notify() {
  _listener?.([..._toasts]);
}

export function toast(opts: Omit<ToastData, 'id'>) {
  const t: ToastData = {
    id: `toast-${++_idCounter}`,
    variant: 'info',
    duration: 4000,
    ...opts,
  };
  _toasts = [..._toasts.slice(-2), t]; // max 3
  notify();
}

function removeToast(id: string) {
  _toasts = _toasts.filter((t) => t.id !== id);
  notify();
}

// ── Individual Toast ─────────────────────────────────────────────────
function ToastItem({ data, onDone }: { data: ToastData; onDone: (id: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Enter animation
    gsap.fromTo(
      el,
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
    );

    // Auto-dismiss
    timerRef.current = setTimeout(() => {
      gsap.to(el, {
        y: 12,
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => onDone(data.id),
      });
    }, data.duration ?? 4000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [data.id, data.duration, onDone]);

  const accentColor =
    data.variant === 'success'
      ? 'bg-success'
      : data.variant === 'opponent'
        ? 'bg-jazzy'
        : 'bg-gold';

  return (
    <div
      ref={ref}
      className="pointer-events-auto w-72 overflow-hidden rounded-lg border border-white/10 bg-charcoal shadow-xl"
      style={{ opacity: 0 }}
    >
      <div className={`h-0.5 ${accentColor}`} />
      <div className="px-4 py-3">
        <p className="text-sm font-semibold text-white">{data.title}</p>
        {data.subtitle && (
          <p className="mt-0.5 text-sm text-white/60">{data.subtitle}</p>
        )}
      </div>
    </div>
  );
}

// ── Container (rendered once at root) ────────────────────────────────
export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    _listener = setToasts;
    return () => {
      _listener = null;
    };
  }, []);

  const handleDone = useCallback((id: string) => {
    removeToast(id);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} data={t} onDone={handleDone} />
      ))}
    </div>
  );
}
