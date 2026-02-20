import { supabase } from './client';
import { useSyncStatus } from '@/lib/hooks/useSyncStatus';
import type { GameSnapshot, Prediction, RemoteGameStatePayload, RemotePredictionPayload } from '../store/gameStore';

// ── Echo-back prevention ────────────────────────────────────────────
// When we write to Supabase, the Realtime subscription fires back.
// This flag lets SupabaseProvider skip that echo.
let _isSyncing = false;
export function isSyncing() { return _isSyncing; }

// ── Debounce helper ─────────────────────────────────────────────────
let _gameStateTimer: ReturnType<typeof setTimeout> | null = null;

// ── Write: game_state ───────────────────────────────────────────────
export function writeGameState(snapshot: GameSnapshot, player: string) {
  if (_gameStateTimer) clearTimeout(_gameStateTimer);

  _gameStateTimer = setTimeout(async () => {
    _isSyncing = true;
    try {
      const { error } = await supabase
        .from('game_state')
        .upsert({
          id: 'singleton',
          chefs: snapshot.chefs,
          current_episode: snapshot.currentEpisode,
          phase: snapshot.phase,
          draft_order: snapshot.draftOrder,
          current_pick: snapshot.currentPick,
          draft_history: snapshot.draftHistory,
          episodes: snapshot.episodes,
          season_episode: snapshot.seasonEpisode,
          updated_at: new Date().toISOString(),
          updated_by: player,
        });

      if (error) {
        console.error('[sync] writeGameState error:', error.message);
      } else {
        useSyncStatus.getState().setLastSyncedAt(new Date().toISOString());
      }
    } finally {
      _isSyncing = false;
    }
  }, 100);
}

// ── Write: predictions ──────────────────────────────────────────────
export async function writePrediction(prediction: Prediction) {
  _isSyncing = true;
  try {
    const { error } = await supabase
      .from('predictions')
      .upsert(
        {
          episode_number: prediction.episodeNumber,
          player: prediction.player,
          chef_id: prediction.chefId,
          locked: prediction.locked,
          locked_at: prediction.lockedAt,
          correct: prediction.correct,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'episode_number,player' }
      );

    if (error) {
      console.error('[sync] writePrediction error:', error.message);
    } else {
      useSyncStatus.getState().setLastSyncedAt(new Date().toISOString());
    }
  } finally {
    _isSyncing = false;
  }
}

// ── Read: initial state ─────────────────────────────────────────────
export async function fetchInitialState(): Promise<{
  gameState: RemoteGameStatePayload | null;
  predictions: RemotePredictionPayload[];
}> {
  const [gsResult, predResult] = await Promise.all([
    supabase.from('game_state').select('*').eq('id', 'singleton').single(),
    supabase.from('predictions').select('*').order('episode_number'),
  ]);

  let gameState: RemoteGameStatePayload | null = null;
  if (gsResult.data && !gsResult.error) {
    const d = gsResult.data;
    gameState = {
      chefs: d.chefs,
      currentEpisode: d.current_episode,
      phase: d.phase,
      draftOrder: d.draft_order,
      currentPick: d.current_pick,
      draftHistory: d.draft_history,
      episodes: d.episodes,
      seasonEpisode: d.season_episode,
      updatedAt: d.updated_at,
      updatedBy: d.updated_by,
    };
  }

  const predictions: RemotePredictionPayload[] = (predResult.data ?? []).map((d) => ({
    episodeNumber: d.episode_number,
    player: d.player,
    chefId: d.chef_id,
    locked: d.locked,
    lockedAt: d.locked_at,
    correct: d.correct,
  }));

  return { gameState, predictions };
}
