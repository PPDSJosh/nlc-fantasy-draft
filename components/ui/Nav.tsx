'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGameStore } from '@/lib/store/gameStore';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function Nav() {
  const pathname = usePathname();
  const { phase, resetGame, undo, redo, _past, _future } = useGameStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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
  ];

  return (
    <nav className="sticky top-0 z-40 border-b border-white/5 bg-ink/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
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
          <span className="rounded-full bg-white/5 px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-widest text-white/30">
            {phase}
          </span>
          <button
            onClick={handleReset}
            className="text-[10px] font-medium uppercase tracking-wider text-white/20 transition-colors hover:text-danger"
          >
            Reset
          </button>
        </div>
      </div>
      {/* Mobile nav */}
      <div className="flex items-center justify-center gap-1 border-t border-white/5 px-2 py-2 sm:hidden">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-lg px-3 py-1.5 text-xs transition-all ${
              pathname === link.href
                ? 'bg-white/10 font-semibold text-white'
                : 'text-white/40 hover:text-white/80'
            }`}
          >
            {link.label}
          </Link>
        ))}
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
