import { NextRequest, NextResponse } from 'next/server';
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  TASK_MEMBERS,
  createSession,
  isMemberId,
  memberName,
  readSession,
  sameOrigin,
  verifyLogin,
} from '@/lib/task/auth';

export const dynamic = 'force-dynamic';

// GET: 멤버 목록 + 현재 로그인한 사람
export async function GET(req: NextRequest) {
  const me = readSession(req);
  return NextResponse.json(
    { members: TASK_MEMBERS, me: me ? { id: me, name: memberName(me) } : null },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

// POST: 로그인 { member, password }
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const body = (await req.json().catch(() => null)) as { member?: unknown; password?: unknown } | null;
  const member = body?.member;
  const password = body?.password;
  if (!isMemberId(member) || typeof password !== 'string' || !password || password.length > 100) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  const result = await verifyLogin(member, password);
  if (result === 'locked') {
    return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });
  }
  if (result === 'unavailable') {
    return NextResponse.json({ error: 'Login is not available right now.' }, { status: 503 });
  }
  if (result === 'wrong') {
    return NextResponse.json({ error: 'Wrong password.' }, { status: 401 });
  }

  const res = NextResponse.json({ me: { id: member, name: memberName(member) } });
  res.cookies.set(SESSION_COOKIE, createSession(member), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}

// DELETE: 로그아웃
export async function DELETE(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}
