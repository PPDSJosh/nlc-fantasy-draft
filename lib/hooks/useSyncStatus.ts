import { create } from 'zustand';

interface SyncStatus {
  connected: boolean;
  lastSyncedAt: string | null;
  opponentOnline: boolean;

  setConnected: (connected: boolean) => void;
  setLastSyncedAt: (ts: string) => void;
  setOpponentOnline: (online: boolean) => void;
}

export const useSyncStatus = create<SyncStatus>((set) => ({
  connected: false,
  lastSyncedAt: null,
  opponentOnline: false,

  setConnected: (connected) => set({ connected }),
  setLastSyncedAt: (ts) => set({ lastSyncedAt: ts }),
  setOpponentOnline: (online) => set({ opponentOnline: online }),
}));
