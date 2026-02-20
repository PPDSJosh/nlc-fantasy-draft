import { Page } from '@playwright/test';

export const BREAKPOINTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'small-desktop', width: 1024, height: 768 },
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'large-desktop', width: 1920, height: 1080 },
  { name: 'ultrawide', width: 2560, height: 1440 },
] as const;

/** Log in as Josh via the API and get the session cookie */
export async function loginAsJosh(page: Page) {
  const response = await page.request.post('/api/auth/login', {
    data: {
      email: 'josh@ppds.studio',
      password: 'DraftKing25!',
    },
  });
  // The response sets the cookie. Now apply it by navigating.
  const cookies = response.headers()['set-cookie'];
  if (cookies) {
    // Parse and set cookie on the browser context
    const cookieParts = cookies.split(';')[0].split('=');
    await page.context().addCookies([{
      name: cookieParts[0],
      value: cookieParts.slice(1).join('='),
      domain: 'localhost',
      path: '/',
    }]);
  }
  return response;
}

/** Seed game state into localStorage so the app is in season phase with scored episodes */
export async function seedSeasonState(page: Page) {
  await page.addInitScript(() => {
    // Seed a game state that's in season phase with 2 scored episodes
    const gameState = {
      state: {
        chefs: [
          // Josh's team (3 active + 1 eliminated)
          { id: 'machete', firstName: 'Machete', lastName: 'Gonzalez', type: 'pro', bio: '', hometown: '', imageUrl: '/images/chefs/machete.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'josh' },
          { id: 'kevin', firstName: 'Kevin', lastName: 'Hill', type: 'pro', bio: '', hometown: '', imageUrl: '/images/chefs/kevin.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'josh' },
          { id: 'hunter', firstName: 'Hunter', lastName: 'Gentry', type: 'pro', bio: '', hometown: '', imageUrl: '/images/chefs/hunter.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'josh' },
          { id: 'gabrielle', firstName: 'Gabrielle', lastName: 'Coniglio', type: 'pro', bio: '', hometown: '', imageUrl: '/images/chefs/gabrielle.jpg', status: 'eliminated', eliminatedEpisode: 4, eliminatedPreDraft: false, owner: 'josh' },
          // Extra josh chefs for full team
          { id: 'tim', firstName: 'Tim', lastName: 'Laielli', type: 'social', bio: '', hometown: '', imageUrl: '/images/chefs/tim.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'josh' },
          { id: 'miriam', firstName: 'Miriam', lastName: 'Green', type: 'social', bio: '', hometown: '', imageUrl: '/images/chefs/miriam.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'josh' },
          { id: 'michael', firstName: 'Michael', lastName: 'Galyean', type: 'home', bio: '', hometown: '', imageUrl: '/images/chefs/michael.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'josh' },
          // Jazzy's team (3 active + 1 eliminated)
          { id: 'darian', firstName: 'Darian', lastName: 'Bryan', type: 'pro', bio: '', hometown: '', imageUrl: '/images/chefs/darian.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'wife' },
          { id: 'connor', firstName: 'Connor', lastName: 'Caine', type: 'pro', bio: '', hometown: '', imageUrl: '/images/chefs/connor.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'wife' },
          { id: 'cole', firstName: 'Cole', lastName: 'Lawson', type: 'pro', bio: '', hometown: '', imageUrl: '/images/chefs/cole.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'wife' },
          { id: 'belinda', firstName: 'Belinda', lastName: 'Vu', type: 'pro', bio: '', hometown: '', imageUrl: '/images/chefs/belinda.jpg', status: 'eliminated', eliminatedEpisode: 5, eliminatedPreDraft: false, owner: 'wife' },
          // Extra wife chefs
          { id: 'matt', firstName: 'Matt', lastName: 'Starcher', type: 'social', bio: '', hometown: '', imageUrl: '/images/chefs/matt.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'wife' },
          { id: 'mareya', firstName: 'Mareya', lastName: 'Ibrahim-Jones', type: 'social', bio: '', hometown: '', imageUrl: '/images/chefs/mareya.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'wife' },
          { id: 'jared', firstName: 'Jared', lastName: 'Veldheer', type: 'home', bio: '', hometown: '', imageUrl: '/images/chefs/jared.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'wife' },
          // Wildcard
          { id: 'landon', firstName: 'Landon', lastName: 'Bridges', type: 'social', bio: '', hometown: '', imageUrl: '/images/chefs/landon.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'wildcard' },
          // Pre-draft eliminated (not displayed)
          { id: 'henna', firstName: 'Henna', lastName: 'Alvarez', type: 'social', bio: '', hometown: '', imageUrl: '/images/chefs/henna.jpg', status: 'eliminated', eliminatedEpisode: 1, eliminatedPreDraft: true, owner: 'undrafted' },
          { id: 'christian', firstName: 'Christian', lastName: 'Alquiza', type: 'social', bio: '', hometown: '', imageUrl: '/images/chefs/christian.jpg', status: 'eliminated', eliminatedEpisode: 2, eliminatedPreDraft: true, owner: 'undrafted' },
          { id: 'andy', firstName: 'Andy', lastName: 'Allo', type: 'social', bio: '', hometown: '', imageUrl: '/images/chefs/andy.jpg', status: 'eliminated', eliminatedEpisode: 3, eliminatedPreDraft: true, owner: 'undrafted' },
          // Remaining chefs (undrafted / pre-draft eliminated)
          { id: 'emerson', firstName: 'Emerson', lastName: 'Bartolome', type: 'home', bio: '', hometown: '', imageUrl: '/images/chefs/emerson.jpg', status: 'eliminated', eliminatedEpisode: 1, eliminatedPreDraft: true, owner: 'undrafted' },
          { id: 'elise', firstName: 'Elise', lastName: 'Jesse', type: 'home', bio: '', hometown: '', imageUrl: '/images/chefs/elise.jpg', status: 'eliminated', eliminatedEpisode: 2, eliminatedPreDraft: true, owner: 'undrafted' },
          { id: 'earl', firstName: 'Earl', lastName: 'Middleton', type: 'home', bio: '', hometown: '', imageUrl: '/images/chefs/earl.jpg', status: 'eliminated', eliminatedEpisode: 2, eliminatedPreDraft: true, owner: 'undrafted' },
          { id: 'diana', firstName: 'Diana', lastName: 'Silva Head', type: 'home', bio: '', hometown: '', imageUrl: '/images/chefs/diana.jpg', status: 'eliminated', eliminatedEpisode: 3, eliminatedPreDraft: true, owner: 'undrafted' },
          { id: 'danielle', firstName: 'Danielle', lastName: 'Kartes', type: 'home', bio: '', hometown: '', imageUrl: '/images/chefs/danielle.jpg', status: 'eliminated', eliminatedEpisode: 1, eliminatedPreDraft: true, owner: 'undrafted' },
          { id: 'amber', firstName: 'Amber', lastName: 'Kellehan', type: 'home', bio: '', hometown: '', imageUrl: '/images/chefs/amber.jpg', status: 'eliminated', eliminatedEpisode: 3, eliminatedPreDraft: true, owner: 'undrafted' },
        ],
        currentEpisode: 3,
        phase: 'season',
        draftOrder: ['josh','wife','wife','josh','josh','wife','wife','josh','josh','wife','wife','josh','josh','wife'],
        currentPick: 14,
        draftHistory: ['machete','darian','connor','kevin','hunter','cole','belinda','gabrielle','tim','matt','miriam','mareya','michael','jared'],
        episodes: [
          {
            episodeNumber: 4,
            scored: true,
            results: [
              { chefId: 'machete', survived: true, wonChallenge: true, topKitchen: true, bottom3: false, eliminated: false },
              { chefId: 'kevin', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'hunter', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'gabrielle', survived: false, wonChallenge: false, topKitchen: false, bottom3: true, eliminated: true },
              { chefId: 'tim', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'miriam', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'michael', survived: true, wonChallenge: false, topKitchen: false, bottom3: true, eliminated: false },
              { chefId: 'darian', survived: true, wonChallenge: false, topKitchen: true, bottom3: false, eliminated: false },
              { chefId: 'connor', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'cole', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'belinda', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'matt', survived: true, wonChallenge: false, topKitchen: false, bottom3: true, eliminated: false },
              { chefId: 'mareya', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'jared', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'landon', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
            ],
          },
          {
            episodeNumber: 5,
            scored: true,
            results: [
              { chefId: 'machete', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'kevin', survived: true, wonChallenge: false, topKitchen: true, bottom3: false, eliminated: false },
              { chefId: 'hunter', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'tim', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'miriam', survived: true, wonChallenge: true, topKitchen: true, bottom3: false, eliminated: false },
              { chefId: 'michael', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'darian', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'connor', survived: true, wonChallenge: false, topKitchen: false, bottom3: true, eliminated: false },
              { chefId: 'cole', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'belinda', survived: false, wonChallenge: false, topKitchen: false, bottom3: true, eliminated: true },
              { chefId: 'matt', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'mareya', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'jared', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'landon', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
            ],
          },
        ],
        seasonEpisode: 6,
        predictions: [
          { episodeNumber: 4, player: 'josh', chefId: 'machete', locked: true, lockedAt: '2026-02-18T20:00:00Z', correct: true },
          { episodeNumber: 4, player: 'wife', chefId: 'darian', locked: true, lockedAt: '2026-02-18T20:01:00Z', correct: true },
          { episodeNumber: 5, player: 'josh', chefId: 'kevin', locked: true, lockedAt: '2026-02-18T21:00:00Z', correct: true },
          { episodeNumber: 5, player: 'wife', chefId: 'belinda', locked: true, lockedAt: '2026-02-18T21:01:00Z', correct: false },
        ],
      },
      version: 0,
    };
    localStorage.setItem('nlc-fantasy-game', JSON.stringify(gameState));
  });
}

/** Seed game state with episodes 4, 5, AND 6 scored (for testing recap display) */
export async function seedScoredEpisode6State(page: Page) {
  await page.addInitScript(() => {
    const gameState = {
      state: {
        chefs: [
          { id: 'machete', firstName: 'Machete', lastName: 'Gonzalez', type: 'pro', bio: '', hometown: '', imageUrl: '/images/chefs/machete.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'josh' },
          { id: 'kevin', firstName: 'Kevin', lastName: 'Hill', type: 'pro', bio: '', hometown: '', imageUrl: '/images/chefs/kevin.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'josh' },
          { id: 'hunter', firstName: 'Hunter', lastName: 'Gentry', type: 'pro', bio: '', hometown: '', imageUrl: '/images/chefs/hunter.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'josh' },
          { id: 'gabrielle', firstName: 'Gabrielle', lastName: 'Coniglio', type: 'pro', bio: '', hometown: '', imageUrl: '/images/chefs/gabrielle.jpg', status: 'eliminated', eliminatedEpisode: 4, eliminatedPreDraft: false, owner: 'josh' },
          { id: 'tim', firstName: 'Tim', lastName: 'Laielli', type: 'social', bio: '', hometown: '', imageUrl: '/images/chefs/tim.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'josh' },
          { id: 'miriam', firstName: 'Miriam', lastName: 'Green', type: 'social', bio: '', hometown: '', imageUrl: '/images/chefs/miriam.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'josh' },
          { id: 'michael', firstName: 'Michael', lastName: 'Galyean', type: 'home', bio: '', hometown: '', imageUrl: '/images/chefs/michael.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'josh' },
          { id: 'darian', firstName: 'Darian', lastName: 'Bryan', type: 'pro', bio: '', hometown: '', imageUrl: '/images/chefs/darian.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'wife' },
          { id: 'connor', firstName: 'Connor', lastName: 'Caine', type: 'pro', bio: '', hometown: '', imageUrl: '/images/chefs/connor.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'wife' },
          { id: 'cole', firstName: 'Cole', lastName: 'Lawson', type: 'pro', bio: '', hometown: '', imageUrl: '/images/chefs/cole.jpg', status: 'eliminated', eliminatedEpisode: 6, eliminatedPreDraft: false, owner: 'wife' },
          { id: 'belinda', firstName: 'Belinda', lastName: 'Vu', type: 'pro', bio: '', hometown: '', imageUrl: '/images/chefs/belinda.jpg', status: 'eliminated', eliminatedEpisode: 5, eliminatedPreDraft: false, owner: 'wife' },
          { id: 'matt', firstName: 'Matt', lastName: 'Starcher', type: 'social', bio: '', hometown: '', imageUrl: '/images/chefs/matt.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'wife' },
          { id: 'mareya', firstName: 'Mareya', lastName: 'Ibrahim-Jones', type: 'social', bio: '', hometown: '', imageUrl: '/images/chefs/mareya.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'wife' },
          { id: 'jared', firstName: 'Jared', lastName: 'Veldheer', type: 'home', bio: '', hometown: '', imageUrl: '/images/chefs/jared.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'wife' },
          { id: 'landon', firstName: 'Landon', lastName: 'Bridges', type: 'social', bio: '', hometown: '', imageUrl: '/images/chefs/landon.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'wildcard' },
        ],
        currentEpisode: 3,
        phase: 'season',
        draftOrder: ['josh','wife','wife','josh','josh','wife','wife','josh','josh','wife','wife','josh','josh','wife'],
        currentPick: 14,
        draftHistory: ['machete','darian','connor','kevin','hunter','cole','belinda','gabrielle','tim','matt','miriam','mareya','michael','jared'],
        episodes: [
          {
            episodeNumber: 4,
            scored: true,
            results: [
              { chefId: 'machete', survived: true, wonChallenge: true, topKitchen: true, bottom3: false, eliminated: false },
              { chefId: 'kevin', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'hunter', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'gabrielle', survived: false, wonChallenge: false, topKitchen: false, bottom3: true, eliminated: true },
              { chefId: 'tim', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'miriam', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'michael', survived: true, wonChallenge: false, topKitchen: false, bottom3: true, eliminated: false },
              { chefId: 'darian', survived: true, wonChallenge: false, topKitchen: true, bottom3: false, eliminated: false },
              { chefId: 'connor', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'cole', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'belinda', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'matt', survived: true, wonChallenge: false, topKitchen: false, bottom3: true, eliminated: false },
              { chefId: 'mareya', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'jared', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'landon', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
            ],
          },
          {
            episodeNumber: 5,
            scored: true,
            results: [
              { chefId: 'machete', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'kevin', survived: true, wonChallenge: false, topKitchen: true, bottom3: false, eliminated: false },
              { chefId: 'hunter', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'tim', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'miriam', survived: true, wonChallenge: true, topKitchen: true, bottom3: false, eliminated: false },
              { chefId: 'michael', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'darian', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'connor', survived: true, wonChallenge: false, topKitchen: false, bottom3: true, eliminated: false },
              { chefId: 'cole', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'belinda', survived: false, wonChallenge: false, topKitchen: false, bottom3: true, eliminated: true },
              { chefId: 'matt', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'mareya', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'jared', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'landon', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
            ],
          },
          {
            episodeNumber: 6,
            scored: true,
            results: [
              { chefId: 'machete', survived: true, wonChallenge: true, topKitchen: true, bottom3: false, eliminated: false },
              { chefId: 'kevin', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'hunter', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'tim', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'miriam', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'michael', survived: true, wonChallenge: false, topKitchen: false, bottom3: true, eliminated: false },
              { chefId: 'darian', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'connor', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'cole', survived: false, wonChallenge: false, topKitchen: false, bottom3: true, eliminated: true },
              { chefId: 'matt', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'mareya', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'jared', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
              { chefId: 'landon', survived: true, wonChallenge: false, topKitchen: false, bottom3: false, eliminated: false },
            ],
          },
        ],
        seasonEpisode: 6,
        predictions: [
          { episodeNumber: 4, player: 'josh', chefId: 'machete', locked: true, lockedAt: '2026-02-18T20:00:00Z', correct: true },
          { episodeNumber: 4, player: 'wife', chefId: 'darian', locked: true, lockedAt: '2026-02-18T20:01:00Z', correct: true },
          { episodeNumber: 5, player: 'josh', chefId: 'kevin', locked: true, lockedAt: '2026-02-18T21:00:00Z', correct: true },
          { episodeNumber: 5, player: 'wife', chefId: 'belinda', locked: true, lockedAt: '2026-02-18T21:01:00Z', correct: false },
          { episodeNumber: 6, player: 'josh', chefId: 'machete', locked: true, lockedAt: '2026-02-20T20:00:00Z', correct: true },
          { episodeNumber: 6, player: 'wife', chefId: 'cole', locked: true, lockedAt: '2026-02-20T20:01:00Z', correct: false },
        ],
      },
      version: 0,
    };
    localStorage.setItem('nlc-fantasy-game', JSON.stringify(gameState));
  });
}

/** Seed game state that's in season phase ready for a NEW episode (not yet scored) */
export async function seedUnscoredEpisodeState(page: Page) {
  await page.addInitScript(() => {
    const gameState = {
      state: {
        chefs: [
          { id: 'machete', firstName: 'Machete', lastName: 'Gonzalez', type: 'pro', bio: '', hometown: '', imageUrl: '/images/chefs/machete.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'josh' },
          { id: 'kevin', firstName: 'Kevin', lastName: 'Hill', type: 'pro', bio: '', hometown: '', imageUrl: '/images/chefs/kevin.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'josh' },
          { id: 'hunter', firstName: 'Hunter', lastName: 'Gentry', type: 'pro', bio: '', hometown: '', imageUrl: '/images/chefs/hunter.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'josh' },
          { id: 'tim', firstName: 'Tim', lastName: 'Laielli', type: 'social', bio: '', hometown: '', imageUrl: '/images/chefs/tim.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'josh' },
          { id: 'darian', firstName: 'Darian', lastName: 'Bryan', type: 'pro', bio: '', hometown: '', imageUrl: '/images/chefs/darian.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'wife' },
          { id: 'connor', firstName: 'Connor', lastName: 'Caine', type: 'pro', bio: '', hometown: '', imageUrl: '/images/chefs/connor.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'wife' },
          { id: 'cole', firstName: 'Cole', lastName: 'Lawson', type: 'pro', bio: '', hometown: '', imageUrl: '/images/chefs/cole.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'wife' },
          { id: 'matt', firstName: 'Matt', lastName: 'Starcher', type: 'social', bio: '', hometown: '', imageUrl: '/images/chefs/matt.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'wife' },
          { id: 'landon', firstName: 'Landon', lastName: 'Bridges', type: 'social', bio: '', hometown: '', imageUrl: '/images/chefs/landon.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'wildcard' },
        ],
        currentEpisode: 3,
        phase: 'season',
        draftOrder: ['josh','wife','wife','josh','josh','wife','wife','josh','josh','wife','wife','josh','josh','wife'],
        currentPick: 14,
        draftHistory: [],
        episodes: [],
        seasonEpisode: 4,
        predictions: [],
      },
      version: 0,
    };
    localStorage.setItem('nlc-fantasy-game', JSON.stringify(gameState));
  });
}
