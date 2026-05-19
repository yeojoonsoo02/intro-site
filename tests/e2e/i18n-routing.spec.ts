import { test, expect } from '@playwright/test';

// 각 언어 prefix가 올바른 html lang 속성을 노출하는지 검증.
// layout.tsx의 detectLang(pathname) 회귀 방지.
const cases: Array<{ path: string; lang: string }> = [
  { path: '/ko', lang: 'ko' },
  { path: '/ja', lang: 'ja' },
  { path: '/en', lang: 'en' },
  { path: '/de', lang: 'de' },
  { path: '/zh', lang: 'zh' },
  { path: '/es', lang: 'es' },
  { path: '/fr', lang: 'fr' },
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

test('루트 / 는 한국어 콘텐츠라 html[lang="ko"]', async ({ page }) => {
  // bot UA로 접속하면 미들웨어가 redirect를 건너뛰고 루트를 그대로 노출.
  await page.setExtraHTTPHeaders({ 'User-Agent': 'Googlebot/2.1' });
  const res = await page.goto('/');
  expect(res?.status()).toBeLessThan(400);
  const htmlLang = await page.locator('html').getAttribute('lang');
  expect(htmlLang).toBe('ko');
});
