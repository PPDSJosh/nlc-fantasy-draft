'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useGameStore, getSnapshot } from '@/lib/store/gameStore';
import type { GameSnapshot, Prediction, RemoteGameStatePayload, RemotePredictionPayload } from '@/lib/store/gameStore';
import type { Chef } from '@/lib/data/chefs';
import { writeGameState, writePrediction, isSyncing, fetchInitialState } from '@/lib/supabase/sync';
import { getSupabase } from '@/lib/supabase/client';
import { useSyncStatus } from '@/lib/hooks/useSyncStatus';
import { toast } from '@/components/ui/Toast';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

function shallowEqualSnapshot(a: GameSnapshot, b: GameSnapshot): boolean {
  if (
    a.currentEpisode !== b.currentEpisode ||
    a.phase !== b.phase ||
    a.currentPick !== b.currentPick ||
    a.seasonEpisode !== b.seasonEpisode
  ) return false;

  return (
    JSON.stringify(a.chefs) === JSON.stringify(b.chefs) &&
    JSON.stringify(a.draftOrder) === JSON.stringify(b.draftOrder) &&
    JSON.stringify(a.draftHistory) === JSON.stringify(b.draftHistory) &&
    JSON.stringify(a.episodes) === JSON.stringify(b.episodes)
  );
}

// ── Opponent name helper ─────────────────────────────────────────────
function opponentName(myPlayer: 'josh' | 'wife'): string {
  return myPlayer === 'josh' ? 'Jazzy' : 'Josh';
}

// ── Chef name lookup ─────────────────────────────────────────────────
function chefName(chefs: Chef[], id: string): string {
  const c = chefs.find((ch) => ch.id === id);
  return c ? `${c.firstName} ${c.lastName}` : id;
}

// ── Diff game state and fire toasts ──────────────────────────────────
function diffAndToast(
  prev: RemoteGameStatePayload | null,
  next: RemoteGameStatePayload,
  myPlayer: 'josh' | 'wife'
) {
  const name = opponentName(myPlayer);
  const variant = 'opponent' as const;

  if (!prev) return;

  // Phase change
  if (prev.phase !== next.phase) {
    if (next.phase === 'draft') {
      toast({ title: 'Draft started', variant: 'info' });
    } else if (next.phase === 'season') {
      toast({ title: 'Season started', variant: 'info' });
    }
    return; // Phase change is the primary event, skip granular diffs
  }

  // Draft pick: draftHistory grew
  if (next.draftHistory.length > prev.draftHistory.length) {
    const newChefId = next.draftHistory[next.draftHistory.length - 1];
    toast({ title: `${name} drafted ${chefName(next.chefs, newChefId)}`, variant });
    return;
  }

  // Chef eliminated (pre-draft): status changed to eliminated
  const prevChefMap = new Map(prev.chefs.map((c) => [c.id, c]));
  for (const chef of next.chefs) {
    const pc = prevChefMap.get(chef.id);
    if (!pc) continue;
    if (pc.status === 'active' && chef.status === 'eliminated') {
      toast({ title: `${name} eliminated ${chef.firstName} ${chef.lastName}`, variant });
      return;
    }
    if (pc.status === 'eliminated' && chef.status === 'active') {
      toast({ title: `${name} restored ${chef.firstName} ${chef.lastName}`, variant });
      return;
    }
  }

  // Episode scored: episodes array grew or an episode gained scored=true
  if (next.episodes.length > prev.episodes.length) {
    const newEp = next.episodes[next.episodes.length - 1];
    toast({ title: `${name} scored Episode ${newEp.episodeNumber}`, variant });
    return;
  }
  for (const ep of next.episodes) {
    const prevEp = prev.episodes.find((e) => e.episodeNumber === ep.episodeNumber);
    if (prevEp && !prevEp.scored && ep.scored) {
      toast({ title: `${name} scored Episode ${ep.episodeNumber}`, variant });
      return;
    }
  }

  // Episode advanced
  if (next.seasonEpisode !== prev.seasonEpisode) {
    toast({ title: `Advanced to Episode ${next.seasonEpisode}`, variant: 'info' });
    return;
  }

  // Current episode advanced (pre-draft)
  if (next.currentEpisode !== prev.currentEpisode) {
    toast({ title: `Advanced to Episode ${next.currentEpisode}`, variant: 'info' });
  }
}

// ── Prediction visibility filter ─────────────────────────────────────
function filterPredictionVisibility(
  remotePred: RemotePredictionPayload,
  myPlayer: 'josh' | 'wife'
): RemotePredictionPayload {
  // Only filter opponent's predictions
  if (remotePred.player === myPlayer) return remotePred;

  // Not locked -- pass through as-is
  if (!remotePred.locked) return remotePred;

  // Check if episode is scored -- always reveal after scoring
  const { episodes, predictions } = useGameStore.getState();
  const ep = episodes.find((e) => e.episodeNumber === remotePred.episodeNumber);
  if (ep?.scored) return remotePred;

  // Check if current player has locked their prediction for this episode
  const myPred = predictions.find(
    (p) => p.episodeNumber === remotePred.episodeNumber && p.player === myPlayer
  );

  if (myPred?.locked) {
    // Both locked -- reveal
    return remotePred;
  }

  // Opponent locked, we haven't -- hide chefId
  return { ...remotePred, chefId: 'hidden' };
}

export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const prevSnapshotRef = useRef<GameSnapshot | null>(null);
  const prevPredictionsRef = useRef<string>('');
  const hydratedRef = useRef(false);
  const prevRemoteStateRef = useRef<RemoteGameStatePayload | null>(null);
  const hiddenAtRef = useRef<number | null>(null);

  // Stable reference to fetchAndMerge for visibility change handler
  const fetchAndMerge = useCallback(async () => {
    if (!user) return;
    try {
      const { gameState, predictions } = await fetchInitialState();
      if (gameState) {
        useGameStore.getState().mergeRemoteState(gameState);
      }
      if (predictions.length > 0) {
        const filtered = predictions.map((p) => filterPredictionVisibility(p, user.player));
        useGameStore.getState().mergeRemotePredictions(filtered);
      }
    } catch (err) {
      console.error('[sync] refetch failed:', err);
    }
  }, [user]);

  // ── Initial hydration + seed ──────────────────────────────────────
  useEffect(() => {
    if (!user || hydratedRef.current) return;

    async function hydrate() {
      try {
        const { gameState, predictions } = await fetchInitialState();

        if (gameState) {
          useGameStore.getState().mergeRemoteState(gameState);
          prevRemoteStateRef.current = gameState;
        } else {
          // Seed: singleton row doesn't exist yet -- write current local state
          const snapshot = getSnapshot(useGameStore.getState());
          writeGameState(snapshot, user!.player);
        }

        if (predictions.length > 0) {
          const filtered = predictions.map((p) => filterPredictionVisibility(p, user!.player));
          useGameStore.getState().mergeRemotePredictions(filtered);
        }
      } catch (err) {
        console.error('[sync] hydration failed:', err);
      }

      hydratedRef.current = true;
    }

    hydrate();
  }, [user]);

  // ── Write path: subscribe to Zustand changes ───────────────────
  useEffect(() => {
    if (!user) return;

    const unsub = useGameStore.subscribe((state) => {
      if (isSyncing()) return;

      const snapshot = getSnapshot(state);
      const prev = prevSnapshotRef.current;

      if (!prev || !shallowEqualSnapshot(prev, snapshot)) {
        writeGameState(snapshot, user.player);
      }
      prevSnapshotRef.current = snapshot;

      const predJson = JSON.stringify(state.predictions);
      if (predJson !== prevPredictionsRef.current) {
        const prevPreds: Prediction[] = prevPredictionsRef.current
          ? JSON.parse(prevPredictionsRef.current)
          : [];

        for (const pred of state.predictions) {
          const prevPred = prevPreds.find(
            (p) => p.episodeNumber === pred.episodeNumber && p.player === pred.player
          );
          if (!prevPred || JSON.stringify(prevPred) !== JSON.stringify(pred)) {
            writePrediction(pred);
          }
        }

        prevPredictionsRef.current = predJson;
      }
    });

    return unsub;
  }, [user]);

  // ── Realtime subscriptions + Presence ─────────────────────────────
  useEffect(() => {
    if (!user) return;

    const { setConnected, setOpponentOnline } = useSyncStatus.getState();

    // ── Data sync channel ────────────────────────────────────────────
    const sb = getSupabase();
    const syncChannel = sb
      .channel('sync')
      .on<Record<string, unknown>>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_state' },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          if (isSyncing()) return;

          const d = payload.new as Record<string, unknown> | undefined;
          if (!d) return;

          // Skip echo-back
          if (d.updated_by === user.player) return;

          const remote: RemoteGameStatePayload = {
            chefs: d.chefs as RemoteGameStatePayload['chefs'],
            currentEpisode: d.current_episode as number,
            phase: d.phase as RemoteGameStatePayload['phase'],
            draftOrder: d.draft_order as RemoteGameStatePayload['draftOrder'],
            currentPick: d.current_pick as number,
            draftHistory: d.draft_history as string[],
            episodes: d.episodes as RemoteGameStatePayload['episodes'],
            seasonEpisode: d.season_episode as number,
            updatedAt: d.updated_at as string,
            updatedBy: d.updated_by as string | null,
          };

          // Fire opponent action toasts
          diffAndToast(prevRemoteStateRef.current, remote, user.player);
          prevRemoteStateRef.current = remote;

          useGameStore.getState().mergeRemoteState(remote);
        }
      )
      .on<Record<string, unknown>>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'predictions' },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          if (isSyncing()) return;

          const d = payload.new as Record<string, unknown> | undefined;
          if (!d) return;

          // Skip our own writes
          if (d.player === user.player) return;

          const remotePred: RemotePredictionPayload = {
            episodeNumber: d.episode_number as number,
            player: d.player as 'josh' | 'wife',
            chefId: d.chef_id as string | null,
            locked: d.locked as boolean,
            lockedAt: d.locked_at as string | null,
            correct: d.correct as boolean | null,
          };

          // Prediction toast
          if (remotePred.locked) {
            toast({
              title: `${opponentName(user.player)} locked their prediction for Episode ${remotePred.episodeNumber}`,
              variant: 'opponent',
            });
          }

          // Apply visibility filtering
          const filtered = filterPredictionVisibility(remotePred, user.player);
          useGameStore.getState().mergeRemotePredictions([filtered]);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnected(true);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setConnected(false);
        }
      });

    // ── Presence channel ─────────────────────────────────────────────
    const presenceChannel = sb
      .channel('presence')
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const allPresences = Object.values(state).flat();
        const opponentPlayer = user.player === 'josh' ? 'wife' : 'josh';
        const opponentPresent = allPresences.some(
          (p) => (p as Record<string, unknown>).player === opponentPlayer
        );
        setOpponentOnline(opponentPresent);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ player: user.player });
        }
      });

    return () => {
      sb.removeChannel(syncChannel);
      sb.removeChannel(presenceChannel);
    };
  }, [user]);

  // ── Visibility change: refetch on tab foreground ──────────────────
  useEffect(() => {
    if (!user) return;

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        hiddenAtRef.current = Date.now();
      } else if (document.visibilityState === 'visible') {
        const hiddenFor = hiddenAtRef.current
          ? Date.now() - hiddenAtRef.current
          : Infinity;
        hiddenAtRef.current = null;

        // Skip if hidden for less than 5 seconds
        if (hiddenFor < 5000) return;

        fetchAndMerge();
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, fetchAndMerge]);

  return <>{children}</>;
}
