import type { NextRequest } from 'next/server';

// 클라이언트 IP 추출(rate limit 키 용도).
//
// `x-forwarded-for`의 가장 왼쪽 값은 클라이언트가 임의로 넣을 수 있다. 그 값을 키로 쓰면
// `X-Forwarded-For: <아무값>` 헤더 하나로 IP당 제한을 매 요청 우회할 수 있다.
// Vercel은 신뢰 가능한 클라이언트 IP를 `x-real-ip`에 넣어주므로 그것을 우선하고,
// 없으면 프록시가 마지막에 덧붙인 값(가장 오른쪽)을 쓴다.
export function getClientIp(req: NextRequest): string {
  const realIp = req.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;

  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded.split(',').map((s) => s.trim()).filter(Boolean);
    const last = parts[parts.length - 1];
    if (last) return last;
  }

  return 'unknown';
}
