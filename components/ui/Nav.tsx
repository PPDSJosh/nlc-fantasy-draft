'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGameStore } from '@/lib/store/gameStore';

export default function Nav() {
  const pathname = usePathname();
  const { phase, resetGame } = useGameStore();

  function handleReset() {
    if (window.confirm('Reset all game data? This cannot be undone.')) {
      resetGame();
      window.location.href = '/';
    }
  }

  const links = [
    { href: '/', label: 'Chefs' },
    { href: '/pre-draft', label: 'Pre-Draft' },
    { href: '/draft', label: 'Draft' },
    { href: '/dashboard', label: 'Dashboard' },
  ];

  return (
    <nav className="border-b border-stone-light bg-ink">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-display text-lg font-bold tracking-tight text-white">
            NLC
            <span className="text-gold">S5</span>
          </Link>
          <div className="flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-white/15 text-white'
                    : 'text-white/60 hover:text-white/90'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-sm border border-white/20 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-widest text-white/50">
            {phase}
          </span>
          <button
            onClick={handleReset}
            className="text-[11px] font-medium uppercase tracking-wider text-white/30 transition-colors hover:text-danger"
          >
            Reset
          </button>
        </div>
      </div>
    </nav>
  );
}
