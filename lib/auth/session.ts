import 'server-only';
import crypto from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'nlc-session';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET environment variable is not set');
  return secret;
}

function sign(payload: string): string {
  const hmac = crypto.createHmac('sha256', getSecret());
  hmac.update(payload);
  return hmac.digest('hex');
}

function createToken(player: string, email: string): string {
  const payload = `${player}:${email}`;
  const signature = sign(payload);
  return `${payload}:${signature}`;
}

function verifyToken(token: string): { player: string; email: string } | null {
  const parts = token.split(':');
  if (parts.length < 3) return null;

  // Last part is signature, everything before the last colon is payload
  const signature = parts[parts.length - 1];
  const payload = parts.slice(0, -1).join(':');
  const [player, ...emailParts] = payload.split(':');
  const email = emailParts.join(':');

  if (!player || !email) return null;

  const expectedSignature = sign(`${player}:${email}`);
  if (signature !== expectedSignature) return null;

  return { player, email };
}

export async function setSessionCookie(player: string, email: string): Promise<void> {
  const token = createToken(player, email);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<{ player: string; email: string } | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie) return null;
  return verifyToken(cookie.value);
}

export function getSessionFromCookieValue(cookieValue: string): { player: string; email: string } | null {
  return verifyToken(cookieValue);
}

export { COOKIE_NAME };
