# Next Level Chef Fantasy Draft
## Implementation Guide for Claude Code

---

## ⚠️ CRITICAL: Read Before Writing Any Code

**This document is a CONTRACT, not a suggestion.**

You will implement this spec **section by section, in order**. You do not move to the next section until the current section passes ALL verification checks.

**Rules of Engagement:**

1. **No skipping ahead.** Complete Section 1 before Section 2. No exceptions.
2. **No inventing.** If it's not in the spec, don't add it. If you think something should be added, STOP and ask first.
3. **No "I think this works."** If you're unsure whether code works, test it or ask. Don't ship guesses.
4. **No declaring done until verified.** Each section has verification steps. Run them. All of them.
5. **Compiler passing ≠ done.** TypeScript compiling tells you nothing about runtime behavior.

---

## Implementation Structure

This project uses **Vertical Slices**. Each slice is a complete, testable feature from UI to data layer. You build one slice completely before starting the next.

### Slice Order

| # | Slice | Scope | Est. Complexity |
|---|-------|-------|-----------------|
| 1 | Chef Data & Display | Static data, chef cards, modal | Low |
| 2 | Pre-Draft Tracking | Mark eliminations Episodes 1-3 | Low |
| 3 | Draft Board | Drag-drop draft, team assignment | High |
| 4 | Episode Scoring | Checkbox form, point calculation | Medium |
| 5 | Predictions | Optional prediction entry | Low |
| 6 | Dashboard | Score display, charts, history | Medium |
| 7 | Persistence | Local storage / Supabase | Medium |
| 8 | Polish | Animations, responsive, edge cases | Medium |

**You will complete Slice 1 entirely before touching Slice 2.**

---

## Slice 1: Chef Data & Display

### 1.1 Objective

Display all 24 Season 5 contestants as cards. Clicking a card opens a detail modal.

### 1.2 Files to Create

```
/lib/data/chefs.ts          — Static chef data
/components/chef/ChefCard.tsx    — Card component
/components/chef/ChefModal.tsx   — Modal component
/components/ui/Modal.tsx         — Reusable modal primitive
/app/page.tsx                    — Home page displaying chef grid
```

### 1.3 Data Structure

Create exactly this interface in `/lib/data/chefs.ts`:

```typescript
export interface Chef {
  id: string;
  firstName: string;
  lastName: string;
  type: 'pro' | 'social' | 'home';
  imageUrl: string;
  status: 'active' | 'eliminated';
  eliminatedEpisode: number | null;
  eliminatedPreDraft: boolean;
  owner: 'josh' | 'wife' | 'wildcard' | 'undrafted';
}

export const CHEFS: Chef[] = [
  // PRO CHEFS (8)
  { id: 'machete', firstName: 'Machete', lastName: 'González', type: 'pro', imageUrl: '/images/chefs/machete.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'undrafted' },
  { id: 'kevin', firstName: 'Kevin', lastName: 'Hill', type: 'pro', imageUrl: '/images/chefs/kevin.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'undrafted' },
  { id: 'hunter', firstName: 'Hunter', lastName: 'Gentry', type: 'pro', imageUrl: '/images/chefs/hunter.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'undrafted' },
  { id: 'gabrielle', firstName: 'Gabrielle', lastName: 'Coniglio', type: 'pro', imageUrl: '/images/chefs/gabrielle.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'undrafted' },
  { id: 'darian', firstName: 'Darian', lastName: 'Bryan', type: 'pro', imageUrl: '/images/chefs/darian.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'undrafted' },
  { id: 'connor', firstName: 'Connor', lastName: 'Caine', type: 'pro', imageUrl: '/images/chefs/connor.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'undrafted' },
  { id: 'cole', firstName: 'Cole', lastName: 'Lawson', type: 'pro', imageUrl: '/images/chefs/cole.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'undrafted' },
  { id: 'belinda', firstName: 'Belinda', lastName: 'Vu', type: 'pro', imageUrl: '/images/chefs/belinda.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'undrafted' },
  
  // SOCIAL MEDIA CHEFS (8)
  { id: 'tim', firstName: 'Tim', lastName: 'Laielli', type: 'social', imageUrl: '/images/chefs/tim.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'undrafted' },
  { id: 'miriam', firstName: 'Miriam', lastName: 'Green', type: 'social', imageUrl: '/images/chefs/miriam.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'undrafted' },
  { id: 'matt', firstName: 'Matt', lastName: 'Starcher', type: 'social', imageUrl: '/images/chefs/matt.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'undrafted' },
  { id: 'mareya', firstName: 'Mareya', lastName: 'Ibrahim-Jones', type: 'social', imageUrl: '/images/chefs/mareya.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'undrafted' },
  { id: 'landon', firstName: 'Landon', lastName: 'Bridges', type: 'social', imageUrl: '/images/chefs/landon.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'undrafted' },
  { id: 'henna', firstName: 'Henna', lastName: 'Alvarez', type: 'social', imageUrl: '/images/chefs/henna.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'undrafted' },
  { id: 'christian', firstName: 'Christian', lastName: 'Alquiza', type: 'social', imageUrl: '/images/chefs/christian.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'undrafted' },
  { id: 'andy', firstName: 'Andy', lastName: 'Allo', type: 'social', imageUrl: '/images/chefs/andy.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'undrafted' },
  
  // HOME CHEFS (8)
  { id: 'michael', firstName: 'Michael', lastName: 'Galyean', type: 'home', imageUrl: '/images/chefs/michael.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'undrafted' },
  { id: 'jared', firstName: 'Jared', lastName: 'Veldheer', type: 'home', imageUrl: '/images/chefs/jared.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'undrafted' },
  { id: 'emerson', firstName: 'Emerson', lastName: 'Bartolome', type: 'home', imageUrl: '/images/chefs/emerson.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'undrafted' },
  { id: 'elise', firstName: 'Elise', lastName: 'Jesse', type: 'home', imageUrl: '/images/chefs/elise.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'undrafted' },
  { id: 'earl', firstName: 'Earl', lastName: 'Middleton', type: 'home', imageUrl: '/images/chefs/earl.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'undrafted' },
  { id: 'diana', firstName: 'Diana', lastName: 'Silva Head', type: 'home', imageUrl: '/images/chefs/diana.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'undrafted' },
  { id: 'danielle', firstName: 'Danielle', lastName: 'Kartes', type: 'home', imageUrl: '/images/chefs/danielle.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'undrafted' },
  { id: 'amber', firstName: 'Amber', lastName: 'Kellehan', type: 'home', imageUrl: '/images/chefs/amber.jpg', status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false, owner: 'undrafted' },
];
```

**DO NOT modify this structure.** Copy it exactly.

### 1.4 ChefCard Component Requirements

Location: `/components/chef/ChefCard.tsx`

**Props:**
```typescript
interface ChefCardProps {
  chef: Chef;
  onClick: (chef: Chef) => void;
  size?: 'small' | 'default';
}
```

**Visual Requirements:**
- Displays chef photo (use placeholder gray box if image missing)
- Shows first name below photo
- Shows type badge (PRO / SOCIAL / HOME) with correct color:
  - Pro: `#3A5BA0` (blue)
  - Social: `#9B4A8C` (purple)  
  - Home: `#5A8A4A` (green)
- If `status === 'eliminated'`: grayscale photo, "ELIMINATED" overlay

**DO NOT add:**
- Drag functionality (that's Slice 3)
- Score display (that's Slice 4)
- Owner indicator (that's Slice 3)

### 1.5 ChefModal Component Requirements

Location: `/components/chef/ChefModal.tsx`

**Props:**
```typescript
interface ChefModalProps {
  chef: Chef | null;
  isOpen: boolean;
  onClose: () => void;
}
```

**Visual Requirements:**
- Large photo at top (16:9 aspect ratio container)
- Type badge
- Full name (firstName + lastName)
- Status (Active / Eliminated)
- Close button (X) in top right
- Click outside to close
- Escape key to close

**DO NOT add:**
- Episode history (that's Slice 4+)
- Points display (that's Slice 4+)
- Team assignment (that's Slice 3)

### 1.6 Home Page Requirements

Location: `/app/page.tsx`

**Layout:**
- Page title: "Next Level Chef Fantasy Draft"
- Subtitle: "Season 5"
- Grid of all 24 chef cards (6 columns desktop, 3 mobile)
- Filter tabs: All | Pro | Social | Home

**State:**
- `selectedChef: Chef | null` — for modal
- `filter: 'all' | 'pro' | 'social' | 'home'`

### 1.7 Verification Checklist — Slice 1

**YOU MUST VERIFY ALL OF THESE BEFORE MOVING TO SLICE 2:**

- [ ] 1.7.1: App compiles with `npm run build` — no errors
- [ ] 1.7.2: Home page loads at localhost:3000
- [ ] 1.7.3: Exactly 24 chef cards are displayed
- [ ] 1.7.4: Each card shows: photo placeholder, first name, type badge
- [ ] 1.7.5: Type badges have correct colors (Pro=blue, Social=purple, Home=green)
- [ ] 1.7.6: Clicking a card opens the modal
- [ ] 1.7.7: Modal displays: large photo area, full name, type badge, status
- [ ] 1.7.8: Modal closes when clicking X
- [ ] 1.7.9: Modal closes when clicking outside
- [ ] 1.7.10: Modal closes when pressing Escape
- [ ] 1.7.11: Filter "Pro" shows exactly 8 cards
- [ ] 1.7.12: Filter "Social" shows exactly 8 cards
- [ ] 1.7.13: Filter "Home" shows exactly 8 cards
- [ ] 1.7.14: Filter "All" shows exactly 24 cards
- [ ] 1.7.15: Mobile responsive — 3 columns on small screens

**Verification method:** Manually test each item. Screenshot if needed.

**DO NOT PROCEED TO SLICE 2 UNTIL ALL 15 CHECKS PASS.**

---

## Slice 2: Pre-Draft Elimination Tracking

### 2.1 Objective

Allow user to mark contestants as eliminated during Episodes 1-3 (before the fantasy draft). Track which episode they were eliminated in.

### 2.2 Files to Create/Modify

```
/lib/store/gameStore.ts     — Zustand store for game state
/app/pre-draft/page.tsx     — Pre-draft elimination UI
/components/chef/ChefCard.tsx — Add eliminated visual state
```

### 2.3 Game Store

Location: `/lib/store/gameStore.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Chef, CHEFS } from '../data/chefs';

interface GameState {
  chefs: Chef[];
  currentEpisode: number; // 1, 2, or 3 during pre-draft
  phase: 'pre-draft' | 'draft' | 'season';
  
  // Actions
  eliminateChef: (chefId: string, episode: number) => void;
  restoreChef: (chefId: string) => void;
  advanceEpisode: () => void;
  startDraft: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      chefs: CHEFS,
      currentEpisode: 1,
      phase: 'pre-draft',
      
      eliminateChef: (chefId, episode) => set((state) => ({
        chefs: state.chefs.map((chef) =>
          chef.id === chefId
            ? { ...chef, status: 'eliminated', eliminatedEpisode: episode, eliminatedPreDraft: true }
            : chef
        ),
      })),
      
      restoreChef: (chefId) => set((state) => ({
        chefs: state.chefs.map((chef) =>
          chef.id === chefId
            ? { ...chef, status: 'active', eliminatedEpisode: null, eliminatedPreDraft: false }
            : chef
        ),
      })),
      
      advanceEpisode: () => set((state) => ({
        currentEpisode: Math.min(state.currentEpisode + 1, 3),
      })),
      
      startDraft: () => set({ phase: 'draft' }),
    }),
    { name: 'nlc-fantasy-game' }
  )
);
```

**Copy this exactly. Do not modify the structure.**

### 2.4 Pre-Draft Page Requirements

Location: `/app/pre-draft/page.tsx`

**Header:**
- "Pre-Draft Eliminations"
- "Episode {currentEpisode} of 3"
- Count: "{eliminated} eliminated · {remaining} remaining"

**Grid:**
- Show all 24 chefs
- Active chefs: normal appearance, click to mark eliminated
- Eliminated chefs: grayscale, "ELIMINATED EP {n}" badge, click to restore

**Actions:**
- "Mark as Eliminated" button per card (or click card)
- "Undo" ability for mistakes
- "Advance to Episode {n+1}" button (disabled until at least 3 eliminated per episode)
- "Start Draft" button (appears after Episode 3, requires exactly 9 eliminated)

**Validation:**
- Cannot start draft unless exactly 9 chefs eliminated
- Cannot start draft unless currentEpisode >= 3

### 2.5 Verification Checklist — Slice 2

- [ ] 2.5.1: Pre-draft page loads at /pre-draft
- [ ] 2.5.2: Shows all 24 chefs
- [ ] 2.5.3: Header shows "Episode 1 of 3" initially
- [ ] 2.5.4: Clicking active chef marks them eliminated
- [ ] 2.5.5: Eliminated chef shows grayscale + episode badge
- [ ] 2.5.6: Clicking eliminated chef restores them
- [ ] 2.5.7: Counter updates correctly (e.g., "3 eliminated · 21 remaining")
- [ ] 2.5.8: "Start Draft" button is disabled with < 9 eliminated
- [ ] 2.5.9: After eliminating 9 chefs, "Start Draft" button enables
- [ ] 2.5.10: Clicking "Start Draft" changes phase to 'draft'
- [ ] 2.5.11: Refreshing page preserves elimination state (localStorage)
- [ ] 2.5.12: Refreshing page preserves current episode (localStorage)

**DO NOT PROCEED TO SLICE 3 UNTIL ALL 12 CHECKS PASS.**

---

## Slice 3: Draft Board

### 3.1 Objective

Snake draft interface. Two players alternate picking from 15 remaining chefs. 7 picks each, 1 wildcard.

### 3.2 Files to Create/Modify

```
/app/draft/page.tsx              — Draft board page
/components/draft/DraftBoard.tsx — Main draft interface
/components/draft/DraftSlot.tsx  — Empty/filled draft slot
/components/draft/AvailableChefs.tsx — Pool of draftable chefs
/lib/store/gameStore.ts          — Add draft actions
```

### 3.3 Store Additions

Add to `gameStore.ts`:

```typescript
interface GameState {
  // ... existing fields
  
  // Draft state
  draftOrder: ('josh' | 'wife')[];  // Snake order for 14 picks
  currentPick: number;              // 0-13
  
  // Actions
  draftChef: (chefId: string) => void;
  undoLastPick: () => void;
  finalizeDraft: () => void;
}

// Snake draft order: Josh picks 1, Wife picks 2-3, Josh picks 4-5, etc.
const SNAKE_ORDER: ('josh' | 'wife')[] = [
  'josh', 'wife', 'wife', 'josh', 'josh', 'wife', 'wife',
  'josh', 'josh', 'wife', 'wife', 'josh', 'josh', 'wife'
];
```

### 3.4 Draft Board Requirements

**Layout:**
- Available Chefs pool (top) — 15 chefs not eliminated pre-draft
- Two columns below: Josh's Team | Wife's Team
- Each column has 7 slots

**Current Pick Indicator:**
- Highlight whose turn it is
- Show "Round {n} · {Player}'s Pick"

**Drag & Drop:**
- Drag chef from pool to team slot
- Only allow drop on correct team's slots (based on current pick)
- Use GSAP Draggable

**OR Click-to-Draft:**
- Click chef in pool → auto-assigns to current picker's next slot

**Snake Order Visual:**
```
Pick 1:  Josh     ←
Pick 2:  Wife     ←
Pick 3:  Wife     
Pick 4:  Josh     
Pick 5:  Josh     
Pick 6:  Wife     
Pick 7:  Wife     
Pick 8:  Josh     
Pick 9:  Josh     
Pick 10: Wife     
Pick 11: Wife     
Pick 12: Josh     
Pick 13: Josh     
Pick 14: Wife     ← Last pick
```

**Wildcard:**
- After 14 picks, 1 chef remains
- Auto-assigned as wildcard
- Displayed separately with amber accent

### 3.5 Verification Checklist — Slice 3

- [ ] 3.5.1: Draft page loads at /draft
- [ ] 3.5.2: Only accessible when phase === 'draft'
- [ ] 3.5.3: Shows exactly 15 available chefs (24 - 9 eliminated)
- [ ] 3.5.4: Josh's team column shows 7 empty slots
- [ ] 3.5.5: Wife's team column shows 7 empty slots
- [ ] 3.5.6: First pick indicator shows "Josh's Pick"
- [ ] 3.5.7: Clicking/dragging chef to Josh's team works for pick 1
- [ ] 3.5.8: After pick 1, indicator shows "Wife's Pick"
- [ ] 3.5.9: Wife gets picks 2 and 3 (snake)
- [ ] 3.5.10: Josh gets picks 4 and 5 (snake)
- [ ] 3.5.11: Cannot drop chef on wrong team's slot
- [ ] 3.5.12: Drafted chef removed from available pool
- [ ] 3.5.13: After 14 picks, 1 chef remains
- [ ] 3.5.14: Remaining chef auto-assigned as wildcard
- [ ] 3.5.15: Wildcard displayed with amber accent
- [ ] 3.5.16: "Undo" button reverts last pick
- [ ] 3.5.17: Draft state persists on refresh
- [ ] 3.5.18: "Start Season" button appears after draft complete
- [ ] 3.5.19: GSAP Draggable animations work smoothly

**DO NOT PROCEED TO SLICE 4 UNTIL ALL 19 CHECKS PASS.**

---

## Slice 4: Episode Scoring

### 4.1 Objective

Enter results for each episode. Calculate points per chef and per team.

### 4.2 Scoring Rules (Reference)

| Event | Points |
|-------|--------|
| Survived | +2 |
| Won Challenge | +4 |
| Top Kitchen | +1 |
| Bottom 3 (but survived) | -1 |
| Eliminated | -3 |

**Rules:**
- Eliminated does NOT stack with Survived (just -3)
- Won Challenge implies Survived
- Bottom 3 cannot combine with Won Challenge

### 4.3 Files to Create/Modify

```
/lib/data/scoring.ts             — Scoring logic (pure functions)
/lib/store/gameStore.ts          — Add episode state
/app/episode/[num]/page.tsx      — Episode scoring page
/components/scoring/ScoringForm.tsx
/components/scoring/ChefScoringRow.tsx
```

### 4.4 Scoring Logic

Location: `/lib/data/scoring.ts`

```typescript
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
  if (result.wonChallenge && !result.survived && !result.eliminated) {
    errors.push('Challenge winner must have survived');
  }
  
  return errors;
}
```

### 4.5 Verification Checklist — Slice 4

- [ ] 4.5.1: Episode page loads at /episode/4 (first scoring episode)
- [ ] 4.5.2: Shows only active chefs (not pre-draft eliminated)
- [ ] 4.5.3: Each chef row has checkboxes: Survived, Won, Top, Bottom 3, Eliminated
- [ ] 4.5.4: Checking "Eliminated" unchecks "Survived" automatically
- [ ] 4.5.5: Checking "Won Challenge" auto-checks "Survived"
- [ ] 4.5.6: Cannot check both "Won Challenge" and "Bottom 3"
- [ ] 4.5.7: Points preview updates in real-time per chef
- [ ] 4.5.8: `calculatePoints({ survived: true })` returns 2
- [ ] 4.5.9: `calculatePoints({ survived: true, wonChallenge: true, topKitchen: true })` returns 7
- [ ] 4.5.10: `calculatePoints({ eliminated: true })` returns -3
- [ ] 4.5.11: `calculatePoints({ survived: true, bottom3: true })` returns 1
- [ ] 4.5.12: Team totals display correctly
- [ ] 4.5.13: Wildcard points go to lower-scoring team
- [ ] 4.5.14: "Save Episode" persists results
- [ ] 4.5.15: Saved episode loads correctly on refresh

**DO NOT PROCEED TO SLICE 5 UNTIL ALL 15 CHECKS PASS.**

---

## Slice 5: Predictions

### 5.1 Objective

Optional prediction before each episode. +3 if correct, -2 if wrong, 0 if skipped.

### 5.2 Requirements

- Prediction entry BEFORE viewing episode results
- Can only predict YOUR OWN drafted chefs
- Cannot predict eliminated chefs
- Lock prediction before episode (timestamp)
- After episode scored, show prediction result

### 5.3 Verification Checklist — Slice 5

- [ ] 5.3.1: Prediction UI appears before episode scoring
- [ ] 5.3.2: Only shows active chefs from your team
- [ ] 5.3.3: Can select one chef or skip
- [ ] 5.3.4: "Lock Prediction" saves choice with timestamp
- [ ] 5.3.5: Cannot change prediction after locking
- [ ] 5.3.6: Correct prediction adds +3 to team total
- [ ] 5.3.7: Incorrect prediction adds -2 to team total
- [ ] 5.3.8: Skipped prediction adds 0
- [ ] 5.3.9: Prediction result shows on episode summary

**DO NOT PROCEED TO SLICE 6 UNTIL ALL 9 CHECKS PASS.**

---

## Slice 6: Dashboard

### 6.1 Objective

Season overview with scores, charts, and history.

### 6.2 Requirements

- Season total per player
- Weekly wins count
- Score progression chart (line graph)
- Top performers list
- Episode-by-episode history

### 6.3 Verification Checklist — Slice 6

- [ ] 6.3.1: Dashboard loads at /dashboard
- [ ] 6.3.2: Shows both players' season totals
- [ ] 6.3.3: Shows weekly wins count
- [ ] 6.3.4: Line chart renders with episode data
- [ ] 6.3.5: Top performers list is sorted by points
- [ ] 6.3.6: Episode history shows all scored episodes
- [ ] 6.3.7: Clicking episode in history shows details

---

## Slice 7: Persistence

### 7.1 Objective

Ensure all game state survives refresh. Optional: Supabase sync.

### 7.2 Verification Checklist — Slice 7

- [ ] 7.2.1: Pre-draft eliminations persist
- [ ] 7.2.2: Draft picks persist
- [ ] 7.2.3: Episode scores persist
- [ ] 7.2.4: Predictions persist
- [ ] 7.2.5: Current phase persists
- [ ] 7.2.6: Can reset game to fresh state
- [ ] 7.2.7: (Optional) Supabase sync working

---

## Slice 8: Polish

### 8.1 Objective

Animations, responsive design, edge cases.

### 8.2 Verification Checklist — Slice 8

- [ ] 8.2.1: GSAP card hover animations
- [ ] 8.2.2: GSAP score count-up animation
- [ ] 8.2.3: GSAP modal open/close
- [ ] 8.2.4: GSAP drag feedback
- [ ] 8.2.5: Mobile layout works (test at 375px width)
- [ ] 8.2.6: Tablet layout works (test at 768px width)
- [ ] 8.2.7: No console errors in production build
- [ ] 8.2.8: Lighthouse accessibility score > 90

---

## Progress Tracker

Copy this to track completion:

```
SLICE 1: Chef Data & Display
[ ] 1.7.1  [ ] 1.7.2  [ ] 1.7.3  [ ] 1.7.4  [ ] 1.7.5
[ ] 1.7.6  [ ] 1.7.7  [ ] 1.7.8  [ ] 1.7.9  [ ] 1.7.10
[ ] 1.7.11 [ ] 1.7.12 [ ] 1.7.13 [ ] 1.7.14 [ ] 1.7.15
Status: NOT STARTED / IN PROGRESS / COMPLETE

SLICE 2: Pre-Draft Tracking
[ ] 2.5.1  [ ] 2.5.2  [ ] 2.5.3  [ ] 2.5.4  [ ] 2.5.5
[ ] 2.5.6  [ ] 2.5.7  [ ] 2.5.8  [ ] 2.5.9  [ ] 2.5.10
[ ] 2.5.11 [ ] 2.5.12
Status: NOT STARTED / IN PROGRESS / COMPLETE

SLICE 3: Draft Board
[ ] 3.5.1  [ ] 3.5.2  [ ] 3.5.3  [ ] 3.5.4  [ ] 3.5.5
[ ] 3.5.6  [ ] 3.5.7  [ ] 3.5.8  [ ] 3.5.9  [ ] 3.5.10
[ ] 3.5.11 [ ] 3.5.12 [ ] 3.5.13 [ ] 3.5.14 [ ] 3.5.15
[ ] 3.5.16 [ ] 3.5.17 [ ] 3.5.18 [ ] 3.5.19
Status: NOT STARTED / IN PROGRESS / COMPLETE

SLICE 4: Episode Scoring
[ ] 4.5.1  [ ] 4.5.2  [ ] 4.5.3  [ ] 4.5.4  [ ] 4.5.5
[ ] 4.5.6  [ ] 4.5.7  [ ] 4.5.8  [ ] 4.5.9  [ ] 4.5.10
[ ] 4.5.11 [ ] 4.5.12 [ ] 4.5.13 [ ] 4.5.14 [ ] 4.5.15
Status: NOT STARTED / IN PROGRESS / COMPLETE

SLICE 5: Predictions
[ ] 5.3.1  [ ] 5.3.2  [ ] 5.3.3  [ ] 5.3.4  [ ] 5.3.5
[ ] 5.3.6  [ ] 5.3.7  [ ] 5.3.8  [ ] 5.3.9
Status: NOT STARTED / IN PROGRESS / COMPLETE

SLICE 6: Dashboard
[ ] 6.3.1  [ ] 6.3.2  [ ] 6.3.3  [ ] 6.3.4  [ ] 6.3.5
[ ] 6.3.6  [ ] 6.3.7
Status: NOT STARTED / IN PROGRESS / COMPLETE

SLICE 7: Persistence
[ ] 7.2.1  [ ] 7.2.2  [ ] 7.2.3  [ ] 7.2.4  [ ] 7.2.5
[ ] 7.2.6  [ ] 7.2.7
Status: NOT STARTED / IN PROGRESS / COMPLETE

SLICE 8: Polish
[ ] 8.2.1  [ ] 8.2.2  [ ] 8.2.3  [ ] 8.2.4  [ ] 8.2.5
[ ] 8.2.6  [ ] 8.2.7  [ ] 8.2.8
Status: NOT STARTED / IN PROGRESS / COMPLETE
```

---

## Final Self-Assessment

Before declaring the project complete, answer these honestly:

1. Did you complete every slice in order? Y/N
2. Did you verify every checkbox in each slice? Y/N
3. Did you add anything not in this spec? If yes, what and why?
4. Did you skip anything in this spec? If yes, what and why?
5. Rate your completion: __/10

**If any answer is concerning, STOP and address it before declaring done.**

---

*Implementation Guide v1.0*
*Companion to UI Spec v1.0*
