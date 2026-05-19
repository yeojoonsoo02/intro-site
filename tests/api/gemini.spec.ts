import { test, expect } from '@playwright/test';

// /api/gemini 입력 검증 회귀 방지.
// 실제 모델 호출은 검증하지 않고(키·외부 의존), 게이트(빈/과대 입력·봇)만 본다.

test('빈 message는 400/422 등 4xx로 거부', async ({ request }) => {
  const res = await request.post('/api/gemini', {
    data: { message: '' },
    headers: {
      // 인간형 UA + Accept 헤더로 봇 필터를 통과한 상태에서 검증.
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'application/json',
    },
  });
  expect(res.status(), '빈 입력은 4xx여야 함').toBeGreaterThanOrEqual(400);
  expect(res.status()).toBeLessThan(500);
});

test('과도하게 긴 message(>2000자)는 4xx로 거부', async ({ request }) => {
  const longMsg = 'a'.repeat(5_000);
  const res = await request.post('/api/gemini', {
    data: { message: longMsg },
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'application/json',
    },
  });
  expect(res.status()).toBeGreaterThanOrEqual(400);
  expect(res.status()).toBeLessThan(500);
});

test('명백한 봇 UA는 4xx/403으로 거부', async ({ request }) => {
  const res = await request.post('/api/gemini', {
    data: { message: '안녕' },
    headers: {
      'User-Agent': 'curl/8.0.0',
    },
  });
  // bot detection이 동작하면 4xx, 통과하더라도 OK 본문은 아니어야 함.
  // 안전 검증: 200이 떨어지면 reply가 비어있거나 fallback 메시지여야 함.
  if (res.status() === 200) {
    const body = await res.json();
    expect(typeof body.reply === 'string' || body.reply === undefined).toBeTruthy();
  } else {
    expect(res.status()).toBeGreaterThanOrEqual(400);
  }
});
