import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Chef, CHEFS } from '../data/chefs';
import { EpisodeResult } from '../data/scoring';

// Snake draft order: Josh picks 1, Wife picks 2-3, Josh picks 4-5, etc.
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
  chefId: string | null; // null = skipped
  locked: boolean;
  lockedAt: string | null; // ISO timestamp
  correct: boolean | null; // null = not yet resolved
}

interface GameState {
  chefs: Chef[];
  currentEpisode: number; // 1, 2, or 3 during pre-draft; 4+ during season
  phase: 'pre-draft' | 'draft' | 'season';

  // Draft state
  draftOrder: ('josh' | 'wife')[];
  currentPick: number;
  draftHistory: string[]; // ordered list of drafted chef IDs

  // Episode state
  episodes: EpisodeData[];
  seasonEpisode: number; // Tracks current season episode (starts at 4)

  // Prediction state
  predictions: Prediction[];

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

  // Prediction actions
  lockPrediction: (episodeNumber: number, player: 'josh' | 'wife', chefId: string | null) => void;
  resolvePredictions: (episodeNumber: number, survivedChefIds: string[]) => void;

  // Game management
  resetGame: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      chefs: CHEFS,
      currentEpisode: 1,
      phase: 'pre-draft',

      // Draft state
      draftOrder: SNAKE_ORDER,
      currentPick: 0,
      draftHistory: [],

      // Episode state
      episodes: [],
      seasonEpisode: 4,

      // Prediction state
      predictions: [],

      eliminateChef: (chefId, episode) => set((state) => ({
        chefs: state.chefs.map((chef) =>
          chef.id === chefId
            ? { ...chef, status: 'eliminated' as const, eliminatedEpisode: episode, eliminatedPreDraft: true }
            : chef
        ),
      })),

      restoreChef: (chefId) => set((state) => ({
        chefs: state.chefs.map((chef) =>
          chef.id === chefId
            ? { ...chef, status: 'active' as const, eliminatedEpisode: null, eliminatedPreDraft: false }
            : chef
        ),
      })),

      advanceEpisode: () => set((state) => ({
        currentEpisode: Math.min(state.currentEpisode + 1, 3),
      })),

      startDraft: () => set({ phase: 'draft' }),

      draftChef: (chefId) => set((state) => {
        if (state.currentPick >= 14) return state;
        const owner = state.draftOrder[state.currentPick];
        return {
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
            chefs: state.chefs.map((chef) =>
              chef.id === remaining[0].id
                ? { ...chef, owner: 'wildcard' as const }
                : chef
            ),
            phase: 'season' as const,
          };
        }
        return { phase: 'season' as const };
      }),

      saveEpisode: (episodeNumber, results) => set((state) => {
        // Update chef statuses based on results
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

        // Replace or add episode data
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
          chefs: updatedChefs,
          episodes: updatedEpisodes,
        };
      }),

      advanceSeasonEpisode: () => set((state) => ({
        seasonEpisode: state.seasonEpisode + 1,
      })),

      lockPrediction: (episodeNumber, player, chefId) => set((state) => {
        // Check if prediction already exists for this player/episode
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
          // Don't allow changing locked predictions
          if (state.predictions[existing].locked) return state;
          updated[existing] = prediction;
        } else {
          updated.push(prediction);
        }

        return { predictions: updated };
      }),

      resolvePredictions: (episodeNumber, survivedChefIds) => set((state) => ({
        predictions: state.predictions.map((p) => {
          if (p.episodeNumber !== episodeNumber) return p;
          if (!p.chefId) return { ...p, correct: null }; // skipped
          return {
            ...p,
            correct: survivedChefIds.includes(p.chefId),
          };
        }),
      })),

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
      }),
    }),
    { name: 'nlc-fantasy-game' }
  )
);
