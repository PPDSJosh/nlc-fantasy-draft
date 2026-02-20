'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthUser {
  player: 'josh' | 'wife';
  email: string;
  displayName: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const PUBLIC_PATHS = ['/login'];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        setUser(data.user ?? null);

        // Redirect to login if not authenticated and not on a public path
        if (!data.user && !PUBLIC_PATHS.includes(pathname)) {
          router.push('/login');
        }
      } catch {
        setUser(null);
        if (!PUBLIC_PATHS.includes(pathname)) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [pathname, router]);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
  }, [router]);

  // Show nothing while checking auth on protected pages
  if (loading && !PUBLIC_PATHS.includes(pathname)) {
    return (
      <AuthContext.Provider value={{ user, loading, logout }}>
        <div className="flex min-h-screen items-center justify-center bg-cream">
          <div className="text-center">
            <p className="font-display text-lg font-bold text-charcoal">Loading...</p>
          </div>
        </div>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
