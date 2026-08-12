import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth, FieldValue } from '@/lib/firebaseAdmin';
import { checkRateLimit } from '@/lib/rateLimit';

// 댓글을 서버 경유로 읽고 쓴다. 브라우저가 Firestore에 직접 붙던 구조는
// googleapis가 차단된 망에서 목록조차 뜨지 않았다.
//
// ⚠️ Admin SDK는 Firestore Rules를 우회한다. rules가 강제하던 검증을
// 여기서 빠짐없이 다시 해야 한다. 아래가 rules와의 대응이다.
//   - create: 인증 필요            → verifyIdToken
//   - text 1~999자                 → MIN/MAX_TEXT_LENGTH
//   - 필드는 text/author/createdAt → 서버가 문서를 직접 구성(클라이언트 페이로드 미사용)
//   - author == 토큰의 표시 이름   → 토큰에서 직접 파생(클라이언트 값 무시, rules보다 강함)
//   - delete: 관리자 이메일만      → ADMIN_EMAIL 대조
//   - update: 금지                 → 핸들러 없음

const ADMIN_EMAIL = 'yeojoonsoo02@gmail.com';
const MAX_TEXT_LENGTH = 1000;
const MAX_LIST = 100;
const RATE_LIMIT_READ = 120;
const RATE_LIMIT_WRITE = 10;

interface DecodedUser {
  uid: string;
  email: string;
  name: string;
}

async function verify(req: NextRequest): Promise<DecodedUser | null> {
  if (!adminAuth) return null;
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7).trim() : '';
  if (!token) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return {
      uid: decoded.uid,
      email: decoded.email ?? '',
      name: typeof decoded.name === 'string' ? decoded.name : '',
    };
  } catch {
    return null;
  }
}

function clientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const rate = await checkRateLimit(`cmt_${clientIp(req)}`, false, RATE_LIMIT_READ);
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  if (!adminDb) return NextResponse.json({ comments: [] });

  try {
    const snap = await adminDb
      .collection('comments')
      .orderBy('createdAt', 'desc')
      .limit(MAX_LIST)
      .get();

    const comments = snap.docs.map((d) => {
      const data = d.data();
      const created = data.createdAt;
      return {
        id: d.id,
        text: String(data.text ?? ''),
        author: String(data.author ?? ''),
        // Timestamp는 JSON으로 못 나가므로 밀리초로 내린다.
        createdAt: created?.toMillis ? created.toMillis() : null,
      };
    });

    return NextResponse.json(
      { comments },
      // 새 댓글이 너무 늦게 보이지 않도록 짧게만 캐시한다.
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' } },
    );
  } catch (err) {
    console.error('[comments] list error', err);
    return NextResponse.json({ error: 'Failed to load comments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const user = await verify(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rate = await checkRateLimit(`cmtw_${user.uid}`, false, RATE_LIMIT_WRITE);
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  if (!text) return NextResponse.json({ error: 'Empty comment' }, { status: 400 });
  if (text.length >= MAX_TEXT_LENGTH) {
    return NextResponse.json({ error: 'Comment too long' }, { status: 400 });
  }

  if (!adminDb) return NextResponse.json({ error: 'Unavailable' }, { status: 503 });

  try {
    // 작성자는 토큰에서만 가져온다. 클라이언트가 보낸 이름은 쓰지 않는다(사칭 차단).
    // 표시 이름이 없는 계정은 빈 값 — 이메일을 공개 컬렉션에 남기지 않는다.
    const ref = await adminDb.collection('comments').add({
      text,
      author: user.name,
      createdAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ id: ref.id, author: user.name });
  } catch (err) {
    console.error('[comments] create error', err);
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const user = await verify(req);
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const id = req.nextUrl.searchParams.get('id');
  if (!id || id.includes('/')) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  if (!adminDb) return NextResponse.json({ error: 'Unavailable' }, { status: 503 });

  try {
    await adminDb.collection('comments').doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[comments] delete error', err);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
