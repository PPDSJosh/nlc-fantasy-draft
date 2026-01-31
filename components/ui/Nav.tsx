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
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
        <div className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
            {phase}
          </span>
          <button
            onClick={handleReset}
            className="rounded-md px-2 py-1 text-xs text-red-500 transition-colors hover:bg-red-50"
          >
            Reset
          </button>
        </div>
      </div>
    </nav>
  );
}
