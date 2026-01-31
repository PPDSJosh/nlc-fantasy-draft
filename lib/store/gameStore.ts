import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Chef, CHEFS } from '../data/chefs';
import { EpisodeResult } from '../data/scoring';

// Snake draft order: Josh picks 1, Jazzy picks 2-3, Josh picks 4-5, etc.
const SNAKE_ORDER: ('josh' | 'wife')[] = [
  'josh', 'wife', 'wife', 'josh', 'josh', 'wife', 'wife',
  'josh', 'josh', 'wife', 'wife', 'josh', 'josh', 'wife'
];

export interface EpisodeData {
  episodeNumber: number;
  results: EpisodeResult[];
  scored: boolean;
}

export interface Prediction {
  episodeNumber: number;
  player: 'josh' | 'wife';
  chefId: string | null;
  locked: boolean;
  lockedAt: string | null;
  correct: boolean | null;
}

interface GameSnapshot {
  chefs: Chef[];
  currentEpisode: number;
  phase: 'pre-draft' | 'draft' | 'season';
  draftOrder: ('josh' | 'wife')[];
  currentPick: number;
  draftHistory: string[];
  episodes: EpisodeData[];
  seasonEpisode: number;
  predictions: Prediction[];
}

interface GameState extends GameSnapshot {
  // Undo/redo (excluded from persistence)
  _past: GameSnapshot[];
  _future: GameSnapshot[];

  // Actions
  eliminateChef: (chefId: string, episode: number) => void;
  restoreChef: (chefId: string) => void;
  advanceEpisode: () => void;
  startDraft: () => void;

  // Draft actions
  draftChef: (chefId: string) => void;
  undoLastPick: () => void;
  finalizeDraft: () => void;

  // Episode actions
  saveEpisode: (episodeNumber: number, results: EpisodeResult[]) => void;
  advanceSeasonEpisode: () => void;

  // Season elimination toggle
  toggleChefStatus: (chefId: string) => void;

  // Prediction actions
  lockPrediction: (episodeNumber: number, player: 'josh' | 'wife', chefId: string | null) => void;
  resolvePredictions: (episodeNumber: number, survivedChefIds: string[]) => void;

  // Undo/redo
  undo: () => void;
  redo: () => void;

  // Game management
  resetGame: () => void;
}

function getSnapshot(state: GameState): GameSnapshot {
  return {
    chefs: state.chefs,
    currentEpisode: state.currentEpisode,
    phase: state.phase,
    draftOrder: state.draftOrder,
    currentPick: state.currentPick,
    draftHistory: state.draftHistory,
    episodes: state.episodes,
    seasonEpisode: state.seasonEpisode,
    predictions: state.predictions,
  };
}

function pushHistory(state: GameState): Pick<GameState, '_past' | '_future'> {
  return {
    _past: [...state._past.slice(-49), getSnapshot(state)],
    _future: [],
  };
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      chefs: CHEFS,
      currentEpisode: 1,
      phase: 'pre-draft',

      draftOrder: SNAKE_ORDER,
      currentPick: 0,
      draftHistory: [],

      episodes: [],
      seasonEpisode: 4,

      predictions: [],

      _past: [],
      _future: [],

      eliminateChef: (chefId, episode) => set((state) => ({
        ...pushHistory(state),
        chefs: state.chefs.map((chef) =>
          chef.id === chefId
            ? { ...chef, status: 'eliminated' as const, eliminatedEpisode: episode, eliminatedPreDraft: true }
            : chef
        ),
      })),

      restoreChef: (chefId) => set((state) => ({
        ...pushHistory(state),
        chefs: state.chefs.map((chef) =>
          chef.id === chefId
            ? { ...chef, status: 'active' as const, eliminatedEpisode: null, eliminatedPreDraft: false }
            : chef
        ),
      })),

      advanceEpisode: () => set((state) => ({
        ...pushHistory(state),
        currentEpisode: Math.min(state.currentEpisode + 1, 3),
      })),

      startDraft: () => set((state) => ({
        ...pushHistory(state),
        phase: 'draft',
      })),

      draftChef: (chefId) => set((state) => {
        if (state.currentPick >= 14) return state;
        const owner = state.draftOrder[state.currentPick];
        return {
          ...pushHistory(state),
          chefs: state.chefs.map((chef) =>
            chef.id === chefId ? { ...chef, owner } : chef
          ),
          currentPick: state.currentPick + 1,
          draftHistory: [...state.draftHistory, chefId],
        };
      }),

      undoLastPick: () => set((state) => {
        if (state.currentPick <= 0 || state.draftHistory.length === 0) return state;
        const lastDraftedId = state.draftHistory[state.draftHistory.length - 1];

        return {
          ...pushHistory(state),
          chefs: state.chefs.map((chef) =>
            chef.id === lastDraftedId
              ? { ...chef, owner: 'undrafted' as const }
              : chef
          ),
          currentPick: state.currentPick - 1,
          draftHistory: state.draftHistory.slice(0, -1),
        };
      }),

      finalizeDraft: () => set((state) => {
        const remaining = state.chefs.filter(
          (c) => c.owner === 'undrafted' && c.status === 'active'
        );
        if (remaining.length === 1) {
          return {
            ...pushHistory(state),
            chefs: state.chefs.map((chef) =>
              chef.id === remaining[0].id
                ? { ...chef, owner: 'wildcard' as const }
                : chef
            ),
            phase: 'season' as const,
          };
        }
        return { ...pushHistory(state), phase: 'season' as const };
      }),

      toggleChefStatus: (chefId) => set((state) => {
        const chef = state.chefs.find((c) => c.id === chefId);
        if (!chef) return state;

        if (chef.status === 'active') {
          return {
            ...pushHistory(state),
            chefs: state.chefs.map((c) =>
              c.id === chefId
                ? { ...c, status: 'eliminated' as const, eliminatedEpisode: state.seasonEpisode }
                : c
            ),
          };
        } else {
          return {
            ...pushHistory(state),
            chefs: state.chefs.map((c) =>
              c.id === chefId
                ? { ...c, status: 'active' as const, eliminatedEpisode: null }
                : c
            ),
          };
        }
      }),

      saveEpisode: (episodeNumber, results) => set((state) => {
        const eliminatedIds = results
          .filter((r) => r.eliminated)
          .map((r) => r.chefId);

        const updatedChefs = state.chefs.map((chef) => {
          if (eliminatedIds.includes(chef.id)) {
            return {
              ...chef,
              status: 'eliminated' as const,
              eliminatedEpisode: episodeNumber,
            };
          }
          return chef;
        });

        const existing = state.episodes.findIndex(
          (e) => e.episodeNumber === episodeNumber
        );
        const updatedEpisodes = [...state.episodes];
        const episodeData: EpisodeData = {
          episodeNumber,
          results,
          scored: true,
        };

        if (existing >= 0) {
          updatedEpisodes[existing] = episodeData;
        } else {
          updatedEpisodes.push(episodeData);
        }

        return {
          ...pushHistory(state),
          chefs: updatedChefs,
          episodes: updatedEpisodes,
        };
      }),

      advanceSeasonEpisode: () => set((state) => ({
        ...pushHistory(state),
        seasonEpisode: state.seasonEpisode + 1,
      })),

      lockPrediction: (episodeNumber, player, chefId) => set((state) => {
        const existing = state.predictions.findIndex(
          (p) => p.episodeNumber === episodeNumber && p.player === player
        );
        const prediction: Prediction = {
          episodeNumber,
          player,
          chefId,
          locked: true,
          lockedAt: new Date().toISOString(),
          correct: null,
        };

        const updated = [...state.predictions];
        if (existing >= 0) {
          if (state.predictions[existing].locked) return state;
          updated[existing] = prediction;
        } else {
          updated.push(prediction);
        }

        return { ...pushHistory(state), predictions: updated };
      }),

      resolvePredictions: (episodeNumber, survivedChefIds) => set((state) => ({
        ...pushHistory(state),
        predictions: state.predictions.map((p) => {
          if (p.episodeNumber !== episodeNumber) return p;
          if (!p.chefId) return { ...p, correct: null };
          return {
            ...p,
            correct: survivedChefIds.includes(p.chefId),
          };
        }),
      })),

      undo: () => set((state) => {
        if (state._past.length === 0) return state;
        const previous = state._past[state._past.length - 1];
        return {
          ...previous,
          _past: state._past.slice(0, -1),
          _future: [getSnapshot(state), ...state._future.slice(0, 49)],
        };
      }),

      redo: () => set((state) => {
        if (state._future.length === 0) return state;
        const next = state._future[0];
        return {
          ...next,
          _past: [...state._past, getSnapshot(state)],
          _future: state._future.slice(1),
        };
      }),

      resetGame: () => set({
        chefs: CHEFS,
        currentEpisode: 1,
        phase: 'pre-draft',
        draftOrder: SNAKE_ORDER,
        currentPick: 0,
        draftHistory: [],
        episodes: [],
        seasonEpisode: 4,
        predictions: [],
        _past: [],
        _future: [],
      }),
    }),
    {
      name: 'nlc-fantasy-game',
      partialize: (state) => {
        // Exclude undo/redo history from persistence
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _past, _future, ...rest } = state;
        return rest;
      },
    }
  )
);
