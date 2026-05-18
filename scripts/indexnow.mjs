// Bing IndexNow 즉시 색인 푸시.
// Bing이 받으면 IndexNow 프로토콜에 참여하는 검색엔진(Yandex, Seznam, Naver(검토 중) 등)에도 자동 전파됨.
//
// 첫 실행:
//   1) crypto로 32자 hex 키 자동 생성
//   2) public/<key>.txt 자동 생성 (Vercel 정적 파일로 노출)
//   3) .env.local 의 INDEXNOW_KEY 항목 자동 추가
//   4) 그 다음부터는 sitemap.xml의 모든 URL을 푸시
//
// 사용:
//   npm run indexnow
//
// 배포 후 키 파일이 https://yeojoonsoo02.com/<key>.txt 로 200 응답해야 푸시가 성공합니다.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PUBLIC_DIR = resolve(ROOT, 'public');
const ENV_FILE = resolve(ROOT, '.env.local');

const HOST = 'yeojoonsoo02.com';
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;
const ENDPOINT = 'https://api.indexnow.org/IndexNow';

function readEnvValue(name) {
  if (process.env[name]) return process.env[name];
  if (!existsSync(ENV_FILE)) return null;
  const content = readFileSync(ENV_FILE, 'utf8');
  const match = content.match(new RegExp(`^${name}=(.*)$`, 'm'));
  return match ? match[1].trim().replace(/^["']|["']$/g, '') : null;
}

function persistEnv(name, value) {
  const line = `${name}=${value}`;
  if (!existsSync(ENV_FILE)) {
    writeFileSync(ENV_FILE, `${line}\n`);
    return;
  }
  const content = readFileSync(ENV_FILE, 'utf8');
  if (new RegExp(`^${name}=`, 'm').test(content)) return;
  writeFileSync(ENV_FILE, content.endsWith('\n') ? `${content}${line}\n` : `${content}\n${line}\n`);
}

function ensureKey() {
  let key = readEnvValue('INDEXNOW_KEY');
  if (!key) {
    key = randomBytes(16).toString('hex'); // 32자 hex — IndexNow 스펙 권장 길이
    persistEnv('INDEXNOW_KEY', key);
    console.log(`[indexnow] 새 키 생성 → .env.local 에 INDEXNOW_KEY 추가됨`);
  }
  if (!existsSync(PUBLIC_DIR)) mkdirSync(PUBLIC_DIR, { recursive: true });
  const keyFile = resolve(PUBLIC_DIR, `${key}.txt`);
  if (!existsSync(keyFile)) {
    writeFileSync(keyFile, key);
    console.log(`[indexnow] 키 파일 생성 → public/${key}.txt`);
    console.log(`[indexnow] 배포 후 https://${HOST}/${key}.txt 로 200 응답되어야 합니다.`);
  }
  return key;
}

async function fetchSitemapUrls() {
  const res = await fetch(SITEMAP_URL);
  if (!res.ok) throw new Error(`sitemap fetch 실패: ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function verifyKeyDeployed(key) {
  try {
    const res = await fetch(`https://${HOST}/${key}.txt`);
    if (!res.ok) return false;
    return (await res.text()).trim() === key;
  } catch {
    return false;
  }
}

async function main() {
  const key = ensureKey();

  const deployed = await verifyKeyDeployed(key);
  if (!deployed) {
    console.error(`[indexnow] 키 파일이 아직 배포되지 않았습니다.`);
    console.error(`  → public/${key}.txt 가 https://${HOST}/${key}.txt 로 응답하도록 먼저 배포해주세요.`);
    process.exit(1);
  }

  const urls = await fetchSitemapUrls();
  if (urls.length === 0) {
    console.error('[indexnow] sitemap.xml 에서 URL을 추출하지 못했습니다.');
    process.exit(1);
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key,
      keyLocation: `https://${HOST}/${key}.txt`,
      urlList: urls,
    }),
  });

  const body = await res.text();
  // 200/202 모두 성공 — IndexNow 스펙상 202는 "받음, 검증 중"
  if (res.status === 200 || res.status === 202) {
    console.log(`[indexnow] ✓ ${res.status} — ${urls.length}개 URL 푸시 완료`);
  } else {
    console.error(`[indexnow] ✗ ${res.status}\n${body}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
