import { test, expect } from '@playwright/test';

// 각 언어 prefix가 올바른 html lang 속성을 노출하는지 검증.
// layout.tsx의 detectLang(pathname)과 app/[lang] 라우트 회귀 방지.
const cases: Array<{ path: string; lang: string }> = [
  { path: '/en', lang: 'en' },
  { path: '/ja', lang: 'ja' },
  { path: '/zh', lang: 'zh' },
  { path: '/es', lang: 'es' },
  { path: '/fr', lang: 'fr' },
  { path: '/de', lang: 'de' },
  { path: '/pt', lang: 'pt' },
  { path: '/ru', lang: 'ru' },
];

for (const { path, lang } of cases) {
  test(`${path} → html[lang="${lang}"]`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status(), `${path} should respond 2xx`).toBeLessThan(400);
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe(lang);
  });
}

test.describe('한국어 선호 브라우저', () => {
  // 미들웨어는 Accept-Language를 본다. Desktop Chrome 프로필의 en-US를 컨텍스트 locale로 덮어야
  // (extra header로는 안 됨) "루트=한국어"를 검증할 수 있다.
  test.use({ locale: 'ko-KR' });

  test('/ko 는 루트로 통합되고 루트(ko)에 머문다', async ({ page }) => {
    const res = await page.goto('/ko');
    expect(res?.status()).toBeLessThan(400);
    expect(new URL(page.url()).pathname).toBe('/');
    expect(await page.locator('html').getAttribute('lang')).toBe('ko');
  });
});

test('영어 선호 브라우저는 루트에서 /en 으로 안내된다', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
  await page.goto('/');
  expect(new URL(page.url()).pathname).toBe('/en');
  expect(await page.locator('html').getAttribute('lang')).toBe('en');
});

test.describe('검색엔진 크롤러', () => {
  // Desktop Chrome 프로필이 UA를 지정하므로 extra header가 아니라 컨텍스트 옵션으로 바꿔야 적용된다.
  test.use({ userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' });

  test('봇은 리디렉트 없이 루트(한국어)를 그대로 본다', async ({ page }) => {
    const res = await page.goto('/');
    expect(res?.status()).toBeLessThan(400);
    expect(new URL(page.url()).pathname).toBe('/');
    expect(await page.locator('html').getAttribute('lang')).toBe('ko');
  });
});
