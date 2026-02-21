export interface EpisodeResult {
  chefId: string;
  survived: boolean;
  wonChallenge: boolean;
  topKitchen: boolean;
  bottom3: boolean;
  eliminated: boolean;
}

export function calculatePoints(result: EpisodeResult): number {
  if (result.eliminated) {
    return -3; // Eliminated overrides everything
  }

  let points = 0;

  if (result.survived) points += 2;
  if (result.wonChallenge) points += 4;
  if (result.topKitchen) points += 1;
  if (result.bottom3 && result.survived) points -= 1;

  return points;
}

export function validateResult(result: EpisodeResult): string[] {
  const errors: string[] = [];

  if (result.eliminated && result.survived) {
    errors.push('Cannot be both eliminated and survived');
  }
  if (result.wonChallenge && result.bottom3) {
    errors.push('Cannot win challenge and be in bottom 3');
  }

  return errors;
}
