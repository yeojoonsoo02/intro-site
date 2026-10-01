import { test, expect } from '@playwright/test';

// /api/gemini 입력 검증 회귀 방지.
// 실제 모델 호출은 검증하지 않고(키·외부 의존), 게이트(빈/과대 입력·봇)만 본다.

// 봇 필터는 UA·Accept와 함께 Origin/Referer도 본다. 하나라도 빠지면 403에서 끝나
// 입력 검증까지 가지 못한다 — 예전 테스트는 그래서 검증 로직을 한 번도 타지 않았다.
const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'application/json',
  Referer: 'http://127.0.0.1:3000/',
};

test.describe('/api/gemini 입력 게이트', () => {
  test('빈 message는 400으로 거부한다', async ({ request }) => {
    const res = await request.post('/api/gemini', {
      data: { message: '' },
      headers: BROWSER_HEADERS,
    });
    expect(res.status()).toBe(400);
  });

  test('공백뿐인 message도 400으로 거부한다', async ({ request }) => {
    const res = await request.post('/api/gemini', {
      data: { message: '   ' },
      headers: BROWSER_HEADERS,
    });
    expect(res.status()).toBe(400);
  });

  test('2000자를 넘는 message는 400으로 거부한다', async ({ request }) => {
    const res = await request.post('/api/gemini', {
      data: { message: 'a'.repeat(5_000) },
      headers: BROWSER_HEADERS,
    });
    expect(res.status()).toBe(400);
  });

  test('JSON이 아닌 본문은 400으로 거부한다', async ({ request }) => {
    const res = await request.post('/api/gemini', {
      data: 'not json',
      headers: { ...BROWSER_HEADERS, 'Content-Type': 'text/plain' },
    });
    expect(res.status()).toBe(400);
  });

  test('명백한 봇 UA는 403으로 거부한다', async ({ request }) => {
    const res = await request.post('/api/gemini', {
      data: { message: '안녕' },
      headers: { 'User-Agent': 'curl/8.0.0' },
    });
    expect(res.status()).toBe(403);
  });

  test('Origin·Referer가 없는 요청은 403으로 거부한다', async ({ request }) => {
    const res = await request.post('/api/gemini', {
      data: { message: '안녕' },
      headers: { 'User-Agent': BROWSER_HEADERS['User-Agent'], Accept: BROWSER_HEADERS.Accept },
    });
    expect(res.status()).toBe(403);
  });
});
