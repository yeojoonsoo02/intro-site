// 지식 청크 임베딩을 빌드 타임에 미리 계산해 src/data/chunkEmbeddings.generated.json 으로 저장한다.
//
// 왜: 서버리스는 인스턴스가 새로 뜰 때마다 청크 전체를 순차 임베딩했다(콜드스타트마다 API 호출 N회).
// 미리 계산해 두면 런타임 호출이 0회가 되고 첫 응답도 그만큼 빨라진다.
//
// 실행: npm run embeddings:build   (GEMINI_API_KEY 필요)
// knowledge.ts를 고쳤으면 다시 돌릴 것 — 해시가 달라지면 런타임이 그 청크만 실시간 임베딩으로 폴백한다.

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'src/data/chunkEmbeddings.generated.ts');
const MODEL = 'gemini-embedding-001';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY가 없습니다. `node --env-file=.env.local` 로 실행하세요.');
  process.exit(1);
}

// knowledge.ts에서 KNOWLEDGE 템플릿 리터럴만 뽑아낸다(TS 파서 없이).
function readKnowledge() {
  const src = fs.readFileSync(path.join(ROOT, 'src/data/knowledge.ts'), 'utf8');
  const m = /export const KNOWLEDGE = `([\s\S]*?)`\s*$/m.exec(src);
  if (!m) throw new Error('knowledge.ts에서 KNOWLEDGE 리터럴을 찾지 못했습니다.');
  return m[1];
}

// chunks.ts의 splitKnowledge와 동일한 규칙으로 나눈다(로직이 바뀌면 양쪽을 함께 고칠 것).
const ID_MAP = {
  '기본 정보': 'basic',
  '학력': 'education',
  '관심사': 'interests',
  '가치관과 마인드셋': 'values',
  '꿈과 목표': 'goals',
  '소개': 'intro',
  '기술 스택': 'skills',
  '프로젝트': 'projects',
  '경력': 'experience',
  '수상 및 성과': 'awards',
  '자격증': 'certifications',
  '연락 및 협업': 'contact',
};

function splitKnowledge(knowledge) {
  return knowledge
    .trim()
    .split(/^# /m)
    .filter(Boolean)
    .map((section) => {
      const newline = section.indexOf('\n');
      const title = newline === -1 ? section.trim() : section.slice(0, newline).trim();
      const text = section.trim();
      return { id: ID_MAP[title] || title.toLowerCase().replace(/\s+/g, '-'), text };
    });
}

const hash = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 16);

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: MODEL });

const chunks = splitKnowledge(readKnowledge());
console.log(`청크 ${chunks.length}개 임베딩 중...`);

// 네트워크가 간헐적으로 끊겨 한 청크만 실패해도 전체가 날아간다. 짧게 재시도한다.
async function embedWithRetry(text, attempts = 4) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await model.embedContent(text);
      return res.embedding.values;
    } catch (err) {
      lastErr = err;
      const wait = 1000 * 2 ** i;
      console.warn(`  재시도 ${i + 1}/${attempts - 1} (${wait}ms 후) — ${err.message}`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw lastErr;
}

const out = { model: MODEL, generatedFrom: 'src/data/knowledge.ts', chunks: [] };
for (const chunk of chunks) {
  const vector = await embedWithRetry(chunk.text);
  out.chunks.push({ id: chunk.id, hash: hash(chunk.text), vector });
  console.log(`  ${chunk.id.padEnd(16)} ${vector.length}차원`);
}

// JSON이 아니라 타입이 명시된 .ts로 내보낸다 — JSON import는 tsc가 거대한 리터럴 타입을
// 추론하려 들어 타입체크가 느려진다. 명시 타입을 주면 그 비용이 사라진다.
const banner = `// 이 파일은 \`npm run embeddings:build\`가 생성합니다. 직접 편집하지 마세요.
// knowledge.ts를 수정했다면 다시 생성해야 합니다(해시 불일치 시 런타임이 실시간 임베딩으로 폴백).

export interface PrecomputedChunk {
  id: string;
  hash: string;
  vector: number[];
}

export interface PrecomputedEmbeddings {
  model: string;
  generatedFrom: string;
  chunks: PrecomputedChunk[];
}

export const PRECOMPUTED_EMBEDDINGS: PrecomputedEmbeddings = `;

fs.writeFileSync(OUT, `${banner}${JSON.stringify(out)};\n`, 'utf8');
const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
console.log(`\n저장: ${path.relative(ROOT, OUT)} (${kb}KB, ${out.chunks.length}개)`);
