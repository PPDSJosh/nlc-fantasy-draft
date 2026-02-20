import 'server-only';
import crypto from 'crypto';

export interface User {
  email: string;
  player: 'josh' | 'wife';
  displayName: string;
  passwordHash: string;
}

function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export const USERS: User[] = [
  {
    email: 'josh@ppds.studio',
    player: 'josh',
    displayName: 'Josh',
    passwordHash: sha256('DraftKing25!'),
  },
  {
    email: 'iamjazzybull@gmail.com',
    player: 'wife',
    displayName: 'Jazzy',
    passwordHash: sha256('DraftQueen25!'),
  },
];

export function authenticateUser(email: string, password: string): User | null {
  const user = USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return null;
  if (sha256(password) !== user.passwordHash) return null;
  return user;
}

export function getUserByPlayer(player: string): User | null {
  return USERS.find((u) => u.player === player) ?? null;
}
