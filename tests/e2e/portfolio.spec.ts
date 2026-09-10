import { test, expect } from '@playwright/test';

// 포트폴리오 목록·케이스 스터디 회귀 방지. 상세 페이지는 로그인 없이 열려야 한다(리뷰어 20초 예산).
test('/portfolio 는 200이고 대표 프로젝트 섹션이 보인다', async ({ page }) => {
  const res = await page.goto('/portfolio');
  expect(res?.status()).toBeLessThan(400);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('#featured')).toBeVisible();
});

test('케이스 스터디는 로그인 없이 열리고 h1을 표시한다', async ({ page }) => {
  const res = await page.goto('/portfolio/yeojoonsoo02-db');
  expect(res?.status()).toBeLessThan(400);
  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible({ timeout: 15_000 });
  await expect(h1).not.toHaveText('');
  await expect(page.getByRole('button', { name: /Google/i })).toHaveCount(0);
});

test('존재하지 않는 프로젝트 id는 안내 문구와 목록 링크를 보여준다', async ({ page }) => {
  await page.goto('/portfolio/this-project-does-not-exist');
  await expect(page.getByText(/찾을 수 없습니다|not found/i)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('link', { name: /전체 프로젝트|all projects/i })).toBeVisible();
});
