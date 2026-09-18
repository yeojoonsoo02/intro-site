import { createHmac, scryptSync, timingSafeEqual } from 'crypto';
import type { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

// TemuTemu 팀 공간(task.yeojoonsoo02.com) 전용 로그인.
// 이름 선택 + 개인 비밀번호. 비밀번호는 Firestore `task_members/{id}`에 scrypt 해시로만 둔다.
// 세션은 HMAC 서명 쿠키(TASK_SESSION_SECRET) — 서버 저장소 없음.

export const TASK_MEMBERS = [
  { id: 'yeojunsu', name: '여준수' },
  { id: 'choiwoojin', name: '최우진' },
  { id: 'parksungjun', name: '박성준' },
  { id: 'parksunyoung', name: '박선영' },
  { id: 'wonsungho', name: '원성호' },
  { id: 'shinchangha', name: '신창하' },
  { id: 'buyeonhoo', name: '부연후' },
  { id: 'jangdoyoung', name: '장도영' },
] as const;

export type TaskMemberId = (typeof TASK_MEMBERS)[number]['id'];

export const SESSION_COOKIE = 'task_s';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30일

const MAX_FAILS = 8;
const LOCK_MS = 15 * 60 * 1000;

export function isMemberId(v: unknown): v is TaskMemberId {
  return typeof v === 'string' && TASK_MEMBERS.some((m) => m.id === v);
}

export function memberName(id: TaskMemberId): string {
  return TASK_MEMBERS.find((m) => m.id === id)!.name;
}

function secret(): string {
  const s = process.env.TASK_SESSION_SECRET;
  if (!s || s.length < 32) throw new Error('TASK_SESSION_SECRET not set');
  return s;
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function createSession(id: TaskMemberId): string {
  const payload = `${id}.${Date.now() + SESSION_MAX_AGE * 1000}`;
  return `${payload}.${sign(payload)}`;
}

export function readSession(req: NextRequest): TaskMemberId | null {
  const raw = req.cookies.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const parts = raw.split('.');
  if (parts.length !== 3) return null;
  const [id, exp, mac] = parts;
  const expected = Buffer.from(sign(`${id}.${exp}`));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  if (!isMemberId(id) || Number(exp) < Date.now()) return null;
  return id;
}

// 쓰기 요청은 같은 출처에서 온 것만 받는다(SameSite=Lax 쿠키에 더한 CSRF 방어).
export function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).host === req.headers.get('host');
  } catch {
    return false;
  }
}

export function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 32).toString('hex');
}

export type LoginResult = 'ok' | 'wrong' | 'locked' | 'unavailable';

export async function verifyLogin(id: TaskMemberId, password: string): Promise<LoginResult> {
  if (!adminDb) return 'unavailable';
  const ref = adminDb.collection('task_members').doc(id);
  const snap = await ref.get();
  const data = snap.data() as
    | { hash?: string; salt?: string; fails?: number; lockUntil?: number }
    | undefined;
  if (!data?.hash || !data.salt) return 'unavailable';
  if ((data.lockUntil ?? 0) > Date.now()) return 'locked';

  const expected = Buffer.from(data.hash, 'hex');
  const given = Buffer.from(hashPassword(password, data.salt), 'hex');
  if (timingSafeEqual(expected, given)) {
    if (data.fails) await ref.update({ fails: 0, lockUntil: 0 });
    return 'ok';
  }

  const fails = (data.fails ?? 0) + 1;
  await ref.update(
    fails >= MAX_FAILS ? { fails: 0, lockUntil: Date.now() + LOCK_MS } : { fails },
  );
  return 'wrong';
}
