import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth/users';
import { setSessionCookie } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  let body;
  try {
    const text = await request.text();
    body = JSON.parse(text);
  } catch (e) {
    return NextResponse.json(
      { error: 'Invalid JSON body', detail: String(e) },
      { status: 400 }
    );
  }
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    );
  }

  const user = authenticateUser(email, password);
  if (!user) {
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    );
  }

  await setSessionCookie(user.player, user.email);

  return NextResponse.json({
    player: user.player,
    email: user.email,
    displayName: user.displayName,
  });
}
