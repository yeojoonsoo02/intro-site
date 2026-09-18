import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { TASK_MEMBERS, readSession, sameOrigin } from '@/lib/task/auth';

export const dynamic = 'force-dynamic';

// 시간표: Firestore `task_timetables/{memberId}` = { classes, online, updatedAt }
// 읽기는 공개(팀 링크 공유용), 쓰기는 본인 시간표만.

type Klass = { day: number; start: string; end: string; name: string; room: string; est?: boolean };

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));

function cleanText(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s.length <= max ? s : null;
}

function parseClasses(v: unknown): Klass[] | null {
  if (!Array.isArray(v) || v.length > 40) return null;
  const out: Klass[] = [];
  for (const c of v) {
    if (!c || typeof c !== 'object') return null;
    const { day, start, end, name, room, est } = c as Record<string, unknown>;
    const n = cleanText(name, 40);
    const r = cleanText(room ?? '', 20);
    if (
      !Number.isInteger(day) || (day as number) < 0 || (day as number) > 4 ||
      typeof start !== 'string' || typeof end !== 'string' ||
      !TIME.test(start) || !TIME.test(end) || toMin(start) >= toMin(end) ||
      toMin(start) < 7 * 60 || toMin(end) > 23 * 60 ||
      !n || r === null
    ) return null;
    out.push({ day: day as number, start, end, name: n, room: r, ...(est === true ? { est: true } : {}) });
  }
  return out;
}

function parseOnline(v: unknown): string[] | null {
  if (!Array.isArray(v) || v.length > 10) return null;
  const out: string[] = [];
  for (const s of v) {
    const t = cleanText(s, 60);
    if (!t) return null;
    out.push(t);
  }
  return out;
}

export async function GET() {
  if (!adminDb) return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  const snap = await adminDb.collection('task_timetables').get();
  const byId = new Map(snap.docs.map((d) => [d.id, d.data()]));
  const people = TASK_MEMBERS.map((m) => {
    const d = byId.get(m.id);
    return { id: m.id, name: m.name, classes: (d?.classes as Klass[]) ?? [], online: (d?.online as string[]) ?? [] };
  });
  return NextResponse.json({ people }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function PUT(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const me = readSession(req);
  if (!me) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
  if (!adminDb) return NextResponse.json({ error: 'unavailable' }, { status: 503 });

  const body = (await req.json().catch(() => null)) as { classes?: unknown; online?: unknown } | null;
  const classes = parseClasses(body?.classes);
  const online = parseOnline(body?.online ?? []);
  if (!classes || !online) return NextResponse.json({ error: 'Invalid timetable.' }, { status: 400 });

  await adminDb.collection('task_timetables').doc(me).set({ classes, online, updatedAt: Date.now() });
  return NextResponse.json({ ok: true });
}
