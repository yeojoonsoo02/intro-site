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

test('케이스 스터디는 서버 HTML에 본문과 자기 canonical을 싣는다', async ({ request }) => {
  // 브라우저가 아니라 원본 HTML을 본다 — 크롤러·링크 미리보기가 받는 것과 같은 응답.
  const res = await request.get('/portfolio/yeojoonsoo02-db');
  expect(res.status()).toBe(200);
  const html = await res.text();
  expect(html).toMatch(/<h1[\s>]/);
  expect(html).toMatch(/<link rel="canonical" href="[^"]*\/portfolio\/yeojoonsoo02-db"/);
});

test('존재하지 않는 프로젝트 id는 404이고 안내 문구와 목록 링크를 보여준다', async ({ page }) => {
  const res = await page.goto('/portfolio/this-project-does-not-exist');
  expect(res?.status()).toBe(404);
  await expect(page.getByText(/찾을 수 없습니다|not found/i)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('link', { name: /전체 프로젝트|all projects/i })).toBeVisible();
});

test('포트폴리오 데이터가 없는 언어는 영어판으로 채워진다', async ({ request }) => {
  const res = await request.get('/api/portfolio?lang=es');
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.projects.length).toBeGreaterThan(0);
});

test.describe('영어 사용자', () => {
  test.use({ locale: 'en-US' });

  test('포트폴리오에서 언어를 바꿔도 없는 주소(/ja/portfolio)로 가지 않는다', async ({ page }) => {
    await page.goto('/portfolio');
    await page.getByRole('button', { name: 'menu' }).click();
    // 설정 묶음을 펼친 뒤 언어 버튼을 누른다.
    await page.locator('button', { hasText: /^(설정|Settings)$/ }).click();
    await page.getByRole('button', { name: 'JA', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
    expect(new URL(page.url()).pathname).toBe('/portfolio');
  });
});
