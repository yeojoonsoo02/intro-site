import { NextRequest, NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { readSession, sameOrigin } from '@/lib/task/auth';

export const dynamic = 'force-dynamic';

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

// 브라우저 → Vercel Blob 직접 업로드용 토큰 발급(서버 함수 4.5MB 본문 제한 회피).
// 파일 목록 등록은 업로드 후 /api/task/files POST가 따로 한다.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as HandleUploadBody | null;
  if (!body) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  // 토큰 발급 요청은 로그인한 팀원 브라우저에서만.
  // (upload-completed 콜백은 Vercel이 서명해서 보내므로 handleUpload가 검증한다)
  if (body.type === 'blob.generate-client-token' && (!sameOrigin(req) || !readSession(req))) {
    return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 });
  }

  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith('task/') || pathname.length > 200) throw new Error('bad path');
        return { maximumSizeInBytes: MAX_UPLOAD_BYTES, addRandomSuffix: true };
      },
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'upload failed' }, { status: 400 });
  }
}
