import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { TASK_MEMBERS, readSession, sameOrigin } from '@/lib/task/auth';

export const dynamic = 'force-dynamic';

// 접속 중 표시: 로그인한 팀원이 페이지를 보고 있는 동안 브라우저가 25초마다 heartbeat를 보낸다.
// Firestore `task_presence/{id}` = { lastSeen }. 70초 안에 신호가 있으면 접속 중.
const ONLINE_WINDOW_MS = 70 * 1000;

export async function GET() {
  if (!adminDb) return NextResponse.json({ online: [] });
  const snap = await adminDb.collection('task_presence').get();
  const now = Date.now();
  const valid = new Set<string>(TASK_MEMBERS.map((m) => m.id));
  const online = snap.docs
    .filter((d) => valid.has(d.id) && now - ((d.data().lastSeen as number) ?? 0) < ONLINE_WINDOW_MS)
    .map((d) => d.id);
  return NextResponse.json({ online }, { headers: { 'Cache-Control': 'no-store' } });
}

// heartbeat { tab, away?: true } — 탭을 숨기거나 닫으면 away로 즉시 오프라인 처리.
// away는 마지막으로 heartbeat를 보낸 그 탭일 때만 반영한다: 페이지를 옮길 때
// 이전 페이지의 away 비콘이 새 페이지의 heartbeat보다 늦게 도착해도 오프라인이 되지 않게.
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const me = readSession(req);
  if (!me) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 });
  if (!adminDb) return NextResponse.json({ ok: false });
  const body = (await req.json().catch(() => null)) as { tab?: unknown; away?: unknown } | null;
  const tab = typeof body?.tab === 'string' ? body.tab.slice(0, 32) : '';
  const ref = adminDb.collection('task_presence').doc(me);
  if (body?.away === true) {
    await adminDb.runTransaction(async (tx) => {
      const cur = await tx.get(ref);
      if (cur.data()?.tab === tab) tx.set(ref, { lastSeen: 0, tab });
    });
  } else {
    await ref.set({ lastSeen: Date.now(), tab });
  }
  return NextResponse.json({ ok: true });
}
