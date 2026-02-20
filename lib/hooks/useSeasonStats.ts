import { useMemo } from 'react';
import { useGameStore } from '@/lib/store/gameStore';
import { calculatePoints } from '@/lib/data/scoring';

export interface EpisodeScore {
  episodeNumber: number;
  joshScore: number;
  jazzyScore: number;
  joshCumulative: number;
  jazzyCumulative: number;
  winner: 'josh' | 'jazzy' | 'tie';
}

export interface ChefStat {
  chefId: string;
  firstName: string;
  lastName: string;
  owner: string;
  imageUrl: string;
  status: string;
  eliminatedEpisode: number | null;
  totalPoints: number;
}

export interface SeasonStats {
  joshSeasonTotal: number;
  jazzySeasonTotal: number;
  joshWins: number;
  jazzyWins: number;
  ties: number;
  leader: 'josh' | 'jazzy' | 'tied';
  leadMargin: number;
  currentStreak: { player: 'josh' | 'jazzy' | null; count: number };
  episodeScores: EpisodeScore[];
  chefStats: ChefStat[];
  topPerformers: ChefStat[];
}

export function useSeasonStats(): SeasonStats {
  const { chefs, episodes, predictions } = useGameStore();

  return useMemo(() => {
    let joshSeasonTotal = 0;
    let jazzySeasonTotal = 0;
    let joshWins = 0;
    let jazzyWins = 0;
    let ties = 0;

    const episodeScores: EpisodeScore[] = [];

    const chefPointsMap: Record<string, number> = {};
    for (const chef of chefs) {
      if (chef.owner !== 'undrafted') {
        chefPointsMap[chef.id] = 0;
      }
    }

    const sortedEpisodes = [...episodes].sort(
      (a, b) => a.episodeNumber - b.episodeNumber
    );

    for (const ep of sortedEpisodes) {
      let joshEpScore = 0;
      let jazzyEpScore = 0;
      let wildcardScore = 0;

      for (const result of ep.results) {
        const chef = chefs.find((c) => c.id === result.chefId);
        if (!chef) continue;

        const pts = calculatePoints(result);
        if (chefPointsMap[chef.id] !== undefined) {
          chefPointsMap[chef.id] += pts;
        }

        if (chef.owner === 'josh') joshEpScore += pts;
        else if (chef.owner === 'wife') jazzyEpScore += pts;
        else if (chef.owner === 'wildcard') wildcardScore += pts;
      }

      const joshPred = predictions.find(
        (p) => p.episodeNumber === ep.episodeNumber && p.player === 'josh'
      );
      const jazzyPred = predictions.find(
        (p) => p.episodeNumber === ep.episodeNumber && p.player === 'wife'
      );

      if (joshPred?.correct === true) joshEpScore += 3;
      else if (joshPred?.correct === false) joshEpScore -= 2;

      if (jazzyPred?.correct === true) jazzyEpScore += 3;
      else if (jazzyPred?.correct === false) jazzyEpScore -= 2;

      // Wildcard points go to the player with the lower or equal episode score
      if (joshEpScore <= jazzyEpScore) {
        joshEpScore += wildcardScore;
      } else {
        jazzyEpScore += wildcardScore;
      }

      joshSeasonTotal += joshEpScore;
      jazzySeasonTotal += jazzyEpScore;

      let winner: 'josh' | 'jazzy' | 'tie';
      if (joshEpScore > jazzyEpScore) {
        joshWins++;
        winner = 'josh';
      } else if (jazzyEpScore > joshEpScore) {
        jazzyWins++;
        winner = 'jazzy';
      } else {
        ties++;
        winner = 'tie';
      }

      episodeScores.push({
        episodeNumber: ep.episodeNumber,
        joshScore: joshEpScore,
        jazzyScore: jazzyEpScore,
        joshCumulative: joshSeasonTotal,
        jazzyCumulative: jazzySeasonTotal,
        winner,
      });
    }

    // Leader + margin
    const leader: 'josh' | 'jazzy' | 'tied' =
      joshSeasonTotal > jazzySeasonTotal
        ? 'josh'
        : jazzySeasonTotal > joshSeasonTotal
          ? 'jazzy'
          : 'tied';
    const leadMargin = Math.abs(joshSeasonTotal - jazzySeasonTotal);

    // Current streak -- consecutive episode wins by the same player (from most recent)
    let currentStreak: { player: 'josh' | 'jazzy' | null; count: number } = {
      player: null,
      count: 0,
    };
    for (let i = episodeScores.length - 1; i >= 0; i--) {
      const w = episodeScores[i].winner;
      if (w === 'tie') break;
      if (currentStreak.player === null) {
        currentStreak = { player: w, count: 1 };
      } else if (w === currentStreak.player) {
        currentStreak.count++;
      } else {
        break;
      }
    }

    // Chef stats with status and elimination info
    const chefStats: ChefStat[] = chefs
      .filter((c) => c.owner !== 'undrafted')
      .map((c) => ({
        chefId: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        owner: c.owner,
        imageUrl: c.imageUrl,
        status: c.status,
        eliminatedEpisode: c.eliminatedEpisode,
        totalPoints: chefPointsMap[c.id] ?? 0,
      }));

    // Top performers sorted by total points descending, top 10
    const topPerformers = [...chefStats]
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 10);

    return {
      joshSeasonTotal,
      jazzySeasonTotal,
      joshWins,
      jazzyWins,
      ties,
      leader,
      leadMargin,
      currentStreak,
      episodeScores,
      chefStats,
      topPerformers,
    };
  }, [chefs, episodes, predictions]);
}
