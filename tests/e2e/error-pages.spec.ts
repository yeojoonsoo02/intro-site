import { test, expect } from '@playwright/test';

// not-found.tsx 회귀 방지 — 존재하지 않는 경로에서 커스텀 404가 노출되어야 함.
test('존재하지 않는 경로는 커스텀 not-found UI 표시', async ({ page }) => {
  const res = await page.goto('/this-route-does-not-exist-xyz');
  expect(res?.status()).toBe(404);

  await expect(page.getByRole('heading', { name: /페이지를 찾을 수 없습니다/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /홈으로 돌아가기/ })).toBeVisible();
});

test('404 페이지의 robots 메타는 noindex', async ({ page }) => {
  const res = await page.goto('/another-missing-path-zzz');
  expect(res?.status()).toBe(404);
  // Next가 404에 자동으로 붙이는 noindex와 not-found.tsx metadata의 noindex,nofollow 두 개가 있다.
  // 둘 다 noindex여야 한다.
  const robots = await page
    .locator('meta[name="robots"]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('content')?.toLowerCase() ?? ''));
  expect(robots.length).toBeGreaterThan(0);
  for (const content of robots) expect(content).toContain('noindex');
});
