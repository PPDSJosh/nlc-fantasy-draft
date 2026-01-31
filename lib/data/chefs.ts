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
