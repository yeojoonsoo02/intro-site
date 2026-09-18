import { NextRequest, NextResponse } from 'next/server';
import { del, head } from '@vercel/blob';
import { adminDb } from '@/lib/firebaseAdmin';
import { memberName, readSession, sameOrigin } from '@/lib/task/auth';

export const dynamic = 'force-dynamic';

// 팀 공유 파일 목록: Firestore `task_files` = { name, url, size, uploader, createdAt }
// 파일 본체는 Vercel Blob(`task/` 경로). 목록 읽기는 공개, 등록·삭제는 로그인한 팀원.

export async function GET() {
  if (!adminDb) return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  const snap = await adminDb.collection('task_files').orderBy('createdAt', 'desc').limit(200).get();
  const files = snap.docs.map((d) => {
    const f = d.data();
    return { id: d.id, name: f.name, url: f.url, size: f.size, uploader: f.uploader, uploaderName: memberName(f.uploader), createdAt: f.createdAt };
  });
  return NextResponse.json({ files }, { headers: { 'Cache-Control': 'no-store' } });
}

// 업로드 완료 후 목록에 등록 { url, name }
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const me = readSession(req);
  if (!me) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
  if (!adminDb) return NextResponse.json({ error: 'unavailable' }, { status: 503 });

  const body = (await req.json().catch(() => null)) as { url?: unknown; name?: unknown } | null;
  const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 120) : '';
  if (typeof body?.url !== 'string' || !name) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  // head()는 이 프로젝트 스토어의 토큰으로만 성공한다 — 남의 URL을 목록에 끼워 넣는 것을 막는다.
  let meta;
  try {
    meta = await head(body.url);
  } catch {
    return NextResponse.json({ error: 'File not found.' }, { status: 400 });
  }
  if (!meta.pathname.startsWith('task/')) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  const ref = await adminDb.collection('task_files').add({
    name, url: meta.url, size: meta.size, uploader: me, createdAt: Date.now(),
  });
  return NextResponse.json({ id: ref.id });
}

// 삭제 ?id= — 올린 사람만
export async function DELETE(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const me = readSession(req);
  if (!me) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
  if (!adminDb) return NextResponse.json({ error: 'unavailable' }, { status: 503 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id || id.length > 64) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const ref = adminDb.collection('task_files').doc(id);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  if (snap.data()!.uploader !== me) {
    return NextResponse.json({ error: 'Only the uploader can delete this file.' }, { status: 403 });
  }

  await del(snap.data()!.url as string).catch(() => {});
  await ref.delete();
  return NextResponse.json({ ok: true });
}
