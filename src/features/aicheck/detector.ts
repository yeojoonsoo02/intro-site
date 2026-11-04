import type { InferenceSession } from 'onnxruntime-web';

// 2단계(내용 판별)의 실제 모델. 브라우저 안에서 onnxruntime-web(Wasm, CPU)으로 돌린다.
//
// 모델: Community Forensics ViT-Small (Park & Owens, CVPR 2025 — 생성기 4,803개 · 270만 장으로 학습)
//   Hugging Face buildborderless/CommunityForensics-DeepfakeDet-ViT, MIT.
//   2026-07 설정·가중치 수정판을 커밋으로 고정한다(그 전 변환본인 onnx-community 저장소는 잘못된 가중치라 쓰지 않는다).
//   FP32판(약 83MB). 받은 뒤 SHA-256을 Hugging Face가 밝힌 값과 비교하고, 다르면 쓰지 않는다.
//   양자화판(int8·uint8·q4, 15~22MB)은 쓰지 않는다: 같은 입력 텐서에서 파이썬 onnxruntime은 사람 사진에 0.9%를 냈는데
//   onnxruntime-web 1.31.1(Wasm)은 int8 75% · uint8 29% · q4 5%를 냈다. FP32는 둘이 소수 넷째 자리까지 같았다(2026-11-04 확인).
// 입력: 짧은 변 440으로 줄이고(비율 유지) 가운데 384×384를 잘라 CLIP 평균·표준편차로 정규화. 출력: 로짓 1개 → 시그모이드 = AI일 확률.

export const MODEL = {
  name: 'Community Forensics ViT-S',
  repo: 'buildborderless/CommunityForensics-DeepfakeDet-ViT',
  revision: 'ac6ee457bea904a373065754107451793b56db00',
  file: 'onnx/model.onnx',
  bytes: 87_442_080,
  sha256: 'a42c7d740fbb345ba9a26d469b22f301d73089ce3c6da993877ed2b6965a8ba1',
  license: 'MIT',
  paper: 'Park & Owens, Community Forensics (CVPR 2025)',
} as const;

const MODEL_URL = `https://huggingface.co/${MODEL.repo}/resolve/${MODEL.revision}/${MODEL.file}`;
const CACHE_NAME = 'aicheck-model-v2';

const SIZE = 384;
const SHORT_EDGE = 440;
const MEAN = [0.48145466, 0.4578275, 0.40821073];
const STD = [0.26862954, 0.26130258, 0.27577711];

type Ort = typeof import('onnxruntime-web/wasm');

let ortPromise: Promise<Ort> | null = null;
let sessionPromise: Promise<InferenceSession> | null = null;

function loadOrt(): Promise<Ort> {
  ortPromise ??= import('onnxruntime-web/wasm').then((ort) => {
    // 교차 출처 격리(COOP/COEP)가 없는 페이지라 SharedArrayBuffer를 못 쓴다 → 스레드 1개.
    // Wasm(약 15MB)은 번들러가 /_next/static/media로 내보낸 같은 출처 파일을 쓴다(외부 CDN 없음).
    ort.env.wasm.numThreads = 1;
    return ort;
  });
  return ortPromise;
}

function hex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf), (x) => x.toString(16).padStart(2, '0')).join('');
}

async function cachedModel(): Promise<ArrayBuffer | null> {
  try {
    if (typeof caches === 'undefined') return null;
    const cache = await caches.open(CACHE_NAME);
    const hit = await cache.match(MODEL_URL);
    return hit ? await hit.arrayBuffer() : null;
  } catch {
    return null;
  }
}

async function storeModel(buf: ArrayBuffer): Promise<void> {
  try {
    if (typeof caches === 'undefined') return;
    const cache = await caches.open(CACHE_NAME);
    await cache.put(MODEL_URL, new Response(buf, { headers: { 'Content-Type': 'application/octet-stream' } }));
  } catch {
    // 저장 공간이 없거나 막혀 있으면 다음에 다시 받는다
  }
}

/** 모델을 받는다(진행률 콜백). 이미 받아 둔 게 있으면 그걸 쓴다. 어느 쪽이든 해시를 확인한다. */
async function fetchModel(onProgress: (loaded: number, total: number) => void): Promise<ArrayBuffer> {
  let buf = await cachedModel();
  let fromCache = true;
  if (!buf) {
    fromCache = false;
    const res = await fetch(MODEL_URL);
    if (!res.ok || !res.body) throw new Error(`모델을 받지 못했습니다 (HTTP ${res.status})`);
    const total = Number(res.headers.get('Content-Length')) || MODEL.bytes;
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let loaded = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.length;
      onProgress(loaded, total);
    }
    const all = new Uint8Array(loaded);
    let o = 0;
    for (const c of chunks) {
      all.set(c, o);
      o += c.length;
    }
    buf = all.buffer;
  } else {
    onProgress(MODEL.bytes, MODEL.bytes);
  }
  const digest = hex(await crypto.subtle.digest('SHA-256', buf));
  if (digest !== MODEL.sha256) {
    if (fromCache) {
      try {
        await caches.delete(CACHE_NAME);
      } catch {
        // 무시
      }
    }
    throw new Error('받은 모델 파일의 해시가 맞지 않아 쓰지 않았습니다');
  }
  if (!fromCache) await storeModel(buf);
  return buf;
}

export function loadDetector(onProgress: (loaded: number, total: number) => void): Promise<InferenceSession> {
  sessionPromise ??= (async () => {
    const [ort, buf] = await Promise.all([loadOrt(), fetchModel(onProgress)]);
    return ort.InferenceSession.create(new Uint8Array(buf), { executionProviders: ['wasm'], graphOptimizationLevel: 'all' });
  })();
  sessionPromise.catch(() => {
    sessionPromise = null;
  });
  return sessionPromise;
}

/** 모델 입력: 짧은 변 440 → 가운데 384 자르기 → CLIP 정규화, NCHW float32 */
function preprocess(source: CanvasImageSource, width: number, height: number): Float32Array {
  const scale = SHORT_EDGE / Math.min(width, height);
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('캔버스를 쓸 수 없습니다');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  // 줄인 그림의 가운데 384×384가 캔버스에 오도록 왼쪽 위를 음수로 민다
  ctx.drawImage(source, -Math.floor((w - SIZE) / 2), -Math.floor((h - SIZE) / 2), w, h);
  const { data } = ctx.getImageData(0, 0, SIZE, SIZE);
  const plane = SIZE * SIZE;
  const out = new Float32Array(3 * plane);
  for (let i = 0; i < plane; i++) {
    for (let c = 0; c < 3; c++) out[c * plane + i] = (data[i * 4 + c] / 255 - MEAN[c]) / STD[c];
  }
  return out;
}

/** AI일 확률(0~1). 같은 세션을 동시에 두 번 돌리지 않도록 한 줄로 세운다. */
let queue: Promise<unknown> = Promise.resolve();

export function scoreImage(session: InferenceSession, source: CanvasImageSource, width: number, height: number): Promise<number> {
  const run = queue.then(async () => {
    const ort = await loadOrt();
    const input = new ort.Tensor('float32', preprocess(source, width, height), [1, 3, SIZE, SIZE]);
    const out = await session.run({ [session.inputNames[0]]: input });
    const logit = Number((out[session.outputNames[0]].data as Float32Array)[0]);
    return 1 / (1 + Math.exp(-logit));
  });
  queue = run.catch(() => undefined);
  return run;
}
