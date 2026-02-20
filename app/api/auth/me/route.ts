import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getUserByPlayer } from '@/lib/auth/users';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  const user = getUserByPlayer(session.player);
  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      player: user.player,
      email: user.email,
      displayName: user.displayName,
    },
  });
}
