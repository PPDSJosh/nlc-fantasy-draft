'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { useGameStore } from '@/lib/store/gameStore';
import { useAuth } from '@/components/auth/AuthProvider';
import { useSyncStatus } from '@/lib/hooks/useSyncStatus';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function Nav() {
  const pathname = usePathname();
  const { phase, resetGame, undo, redo, _past, _future } = useGameStore();
  const { user, logout } = useAuth();
  const { connected, lastSyncedAt, opponentOnline } = useSyncStatus();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const savedRef = useRef<HTMLSpanElement>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusDotRef = useRef<HTMLSpanElement>(null);
  const prevConnectedRef = useRef(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Pulse animation when first connecting
  useEffect(() => {
    if (connected && !prevConnectedRef.current && statusDotRef.current) {
      gsap.fromTo(
        statusDotRef.current,
        { scale: 1 },
        { scale: 1.5, duration: 0.3, yoyo: true, repeat: 1, ease: 'power2.out' }
      );
    }
    prevConnectedRef.current = connected;
  }, [connected]);

  // "Saved" indicator on lastSyncedAt change
  useEffect(() => {
    if (!lastSyncedAt) return;

    setShowSaved(true);

    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);

    // Fade in
    if (savedRef.current) {
      gsap.fromTo(savedRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    }

    savedTimerRef.current = setTimeout(() => {
      if (savedRef.current) {
        gsap.to(savedRef.current, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => setShowSaved(false),
        });
      }
    }, 2000);
  }, [lastSyncedAt]);

  // Don't show nav on login page
  if (pathname === '/login') return null;

  function handleReset() {
    setShowResetConfirm(true);
  }

  function confirmReset() {
    resetGame();
    window.location.href = '/';
  }

  const links = [
    { href: '/', label: 'Chefs' },
    { href: '/pre-draft', label: 'Pre-Draft' },
    { href: '/draft', label: 'Draft' },
    { href: '/dashboard', label: 'Dashboard' },
    ...(phase === 'season' ? [{ href: '/live', label: 'Live' }] : []),
  ];

  const opponentDisplayName = user?.player === 'josh' ? 'Jazzy' : 'Josh';

  return (
    <nav className="sticky top-0 z-40 border-b border-white/5 bg-ink/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between overflow-x-auto px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-baseline gap-1">
            <span className="font-display text-xl font-bold text-white">NLC</span>
            <span className="font-display text-sm font-bold text-gold">S5</span>
          </Link>
          <div className="hidden items-center gap-1 sm:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-1.5 text-sm transition-all ${
                  pathname === link.href
                    ? 'bg-white/10 font-semibold text-white'
                    : 'text-white/40 hover:text-white/80'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <button
            onClick={undo}
            disabled={_past.length === 0}
            className="rounded-md px-2 py-1 text-xs text-white/30 transition-colors hover:text-white/70 disabled:opacity-20 disabled:hover:text-white/30"
            title="Undo (⌘Z)"
          >
            ↩
          </button>
          <button
            onClick={redo}
            disabled={_future.length === 0}
            className="rounded-md px-2 py-1 text-xs text-white/30 transition-colors hover:text-white/70 disabled:opacity-20 disabled:hover:text-white/30"
            title="Redo (⌘⇧Z)"
          >
            ↪
          </button>
          <span className="mx-1 h-4 w-px bg-white/10" />

          {/* Sync status dot + "Saved" */}
          <span className="flex items-center gap-1.5">
            <span
              ref={statusDotRef}
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                connected ? 'bg-success' : 'bg-danger'
              }`}
              title={connected ? 'Connected' : 'Offline'}
            />
            {showSaved && (
              <span
                ref={savedRef}
                className="font-mono text-[10px] text-white/60"
                style={{ opacity: 0 }}
              >
                Saved
              </span>
            )}
          </span>

          <span className="rounded-full bg-white/5 px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-widest text-white/30">
            {phase}
          </span>

          {/* Current user indicator + opponent presence */}
          {user && (
            <>
              <span className="mx-1 h-4 w-px bg-white/10" />
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white ${
                user.player === 'josh' ? 'bg-josh/80' : 'bg-jazzy/80'
              }`}>
                {user.displayName}
              </span>
              <span className="flex items-center gap-1">
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full ${
                    opponentOnline ? 'bg-success' : 'bg-white/20'
                  }`}
                  title={opponentOnline ? `${opponentDisplayName} is online` : `${opponentDisplayName} is offline`}
                />
                <span className="text-[10px] text-white/60">{opponentDisplayName}</span>
              </span>
              <button
                onClick={logout}
                className="text-[10px] font-medium uppercase tracking-wider text-white/20 transition-colors hover:text-white/60"
              >
                Logout
              </button>
            </>
          )}

          <span className="mx-1 h-4 w-px bg-white/10" />
          <button
            onClick={handleReset}
            className="text-[10px] font-medium uppercase tracking-wider text-white/20 transition-colors hover:text-danger"
          >
            Reset
          </button>
        </div>
      </div>
      {/* Mobile nav */}
      <div className="flex items-center justify-center gap-0.5 overflow-x-auto border-t border-white/5 px-1 py-1.5 sm:hidden">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-lg px-2.5 py-1.5 text-[11px] transition-all ${
              pathname === link.href
                ? 'bg-white/10 font-semibold text-white'
                : 'text-white/40 hover:text-white/80'
            }`}
          >
            {link.label}
          </Link>
        ))}
        {/* Mobile user indicator */}
        {user && (
          <>
            <span className="mx-0.5 h-3 w-px bg-white/10" />
            <span className={`rounded-full px-2 py-1 text-[10px] font-bold text-white ${
              user.player === 'josh' ? 'bg-josh/80' : 'bg-jazzy/80'
            }`}>
              {user.displayName}
            </span>
            <button
              onClick={logout}
              className="rounded-lg px-2 py-1.5 text-[10px] text-white/30"
            >
              Out
            </button>
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset Game"
        message="This will erase all draft picks, scores, and predictions. This cannot be undone."
        confirmLabel="Reset Everything"
        cancelLabel="Keep Playing"
        destructive
        onConfirm={confirmReset}
        onCancel={() => setShowResetConfirm(false)}
      />
    </nav>
  );
}
