'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { InferenceSession } from 'onnxruntime-web';
import { detectFormat, scanMetadata, sourceTypeLabel, type ScanResult } from './scanMetadata';
import { readC2pa, type C2paSummary } from './c2pa';
import { MODEL, loadDetector, scoreImage } from './detector';
import { formatBytes, recompress } from './compress';
import { decide, pctText, type Verdict } from './verdict';
import { CheckTable, CompareTable, Range, ScoreBar, VerdictCard, type CheckRow, type CompareRow } from './DemoParts';

// "이거 AI야?" 웹 데모. 고른 그림은 이 브라우저 안에서만 읽는다(서버 업로드 없음).
//   1단계 표시 확인: 바이트 스캐너(scanMetadata) + C2PA 상자가 있으면 공식 판독기(c2pa-web, Wasm)
//   2단계 내용 판별: Community Forensics ViT(onnxruntime-web, Wasm) — 사용자가 누를 때만 모델(약 83MB)을 받는다
//   압축 실험: 캔버스로 줄이고 JPEG로 다시 저장 → 같은 검사를 다시 돌려 무엇이 사라지고 점수가 어떻게 바뀌는지 보여 준다

const MAX_BYTES = 40 * 1024 * 1024;
const ACCEPT = 'image/jpeg,image/png,image/webp';
const PREF_KEY = 'aicheck:autoModel';
/** 처음 열면 미리 넣어 두는 견본: 로컬 오픈소스 모델(FLUX.2 klein 4B, mflux)로 만든 원본 PNG. 생성 프로그램이 XMP·EXIF에 이름을 남겼다. */
const SAMPLE = { url: '/portfolio/ai-check/sample-flux2-klein.png', name: 'sample-flux2-klein.png' };

interface Loaded {
  name: string;
  type: string;
  bytes: number;
  url: string;
  bitmap: ImageBitmap;
  scan: ScanResult;
  blob: Blob;
}

type C2paState =
  | { state: 'skipped' }
  | { state: 'loading' }
  | { state: 'done'; summary: C2paSummary | null }
  | { state: 'error'; message: string };

type ModelState =
  | { state: 'off' }
  | { state: 'loading'; loaded: number; total: number }
  | { state: 'ready'; session: InferenceSession }
  | { state: 'error'; message: string };

interface Scored {
  key: string;
  value: number;
}

interface CompressedView {
  url: string;
  bitmap: ImageBitmap;
  bytes: number;
  width: number;
  height: number;
  scan: ScanResult;
  quality: number;
  maxEdge: number;
}

const PRESETS: { label: string; quality: number; maxEdge: number }[] = [
  { label: '가볍게 (1080px · 85)', quality: 85, maxEdge: 1080 },
  { label: '보통 (1080px · 70)', quality: 70, maxEdge: 1080 },
  { label: '세게 (720px · 50)', quality: 50, maxEdge: 720 },
];

function readPref(): boolean {
  try {
    return window.localStorage.getItem(PREF_KEY) === '1';
  } catch {
    return false;
  }
}

function writePref(on: boolean): void {
  try {
    if (on) window.localStorage.setItem(PREF_KEY, '1');
    else window.localStorage.removeItem(PREF_KEY);
  } catch {
    // 저장이 막혀 있어도 데모는 돈다
  }
}

function yesNo(v: boolean, yes: string, no: string): string {
  return v ? yes : no;
}

function errorText(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export default function AiCheckDemo(): JSX.Element {
  const [file, setFile] = useState<Loaded | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [c2pa, setC2pa] = useState<C2paState>({ state: 'skipped' });
  const [model, setModel] = useState<ModelState>({ state: 'off' });
  const [autoModel, setAutoModel] = useState(false);
  // 점수는 어느 그림(blob URL)의 점수인지와 같이 둔다 — 그림이 바뀌는 사이에 앞 그림의 점수가 붙지 않게
  const [scoreOrigFor, setScoreOrigFor] = useState<Scored | null>(null);
  const [scoreCompFor, setScoreCompFor] = useState<Scored | null>(null);
  const [quality, setQuality] = useState(70);
  const [maxEdge, setMaxEdge] = useState(1080);
  const [comp, setComp] = useState<CompressedView | null>(null);
  const [compError, setCompError] = useState<string | null>(null);
  const [sample, setSample] = useState(false);
  const fileRef = useRef<Loaded | null>(null);
  const compRef = useRef<CompressedView | null>(null);
  const runId = useRef(0);

  const startModel = useCallback(async () => {
    setModel({ state: 'loading', loaded: 0, total: MODEL.bytes });
    try {
      const session = await loadDetector((loaded, total) => setModel({ state: 'loading', loaded, total }));
      setModel({ state: 'ready', session });
    } catch (e) {
      setModel({ state: 'error', message: errorText(e) });
    }
  }, []);

  // 마운트 때 한 번: 저장해 둔 설정을 읽고, 켜져 있으면 바로 모델을 받는다. 떠날 때 미리보기 URL·비트맵을 정리한다.
  useEffect(() => {
    const on = readPref();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 때 한 번, 브라우저 저장소에서 읽은 설정을 반영
    setAutoModel(on);
    if (on) void startModel();
    return () => {
      if (fileRef.current) {
        URL.revokeObjectURL(fileRef.current.url);
        fileRef.current.bitmap.close();
      }
      if (compRef.current) {
        URL.revokeObjectURL(compRef.current.url);
        compRef.current.bitmap.close();
      }
    };
  }, [startModel]);

  const onFile = useCallback(async (f: File) => {
    setFileError(null);
    if (f.size > MAX_BYTES) {
      setFileError(`파일이 너무 큽니다(${formatBytes(f.size)}). 40MB 이하로 골라 주세요.`);
      return;
    }
    setBusy(true);
    const id = ++runId.current;
    try {
      const buf = new Uint8Array(await f.arrayBuffer());
      const format = detectFormat(buf);
      if (format === 'unknown') {
        setFileError('JPEG·PNG·WebP만 읽습니다. HEIC 같은 형식은 JPEG로 바꿔서 올려 주세요.');
        return;
      }
      let bitmap: ImageBitmap;
      try {
        bitmap = await createImageBitmap(f);
      } catch {
        setFileError('이 브라우저가 그림을 열지 못했습니다. 파일이 깨졌을 수 있습니다.');
        return;
      }
      const scan = await scanMetadata(buf);
      if (id !== runId.current) {
        bitmap.close();
        return;
      }
      const prev = fileRef.current;
      const next: Loaded = { name: f.name, type: f.type, bytes: f.size, url: URL.createObjectURL(f), bitmap, scan, blob: f };
      fileRef.current = next;
      setFile(next);
      // 앞 그림의 압축본은 바로 치운다(새 압축본은 아래 효과가 만든다)
      const prevComp = compRef.current;
      compRef.current = null;
      setComp(null);
      if (prevComp) {
        URL.revokeObjectURL(prevComp.url);
        prevComp.bitmap.close();
      }
      if (prev) {
        URL.revokeObjectURL(prev.url);
        prev.bitmap.close();
      }

      if (scan.c2paBox) {
        setC2pa({ state: 'loading' });
        try {
          const summary = await readC2pa(f);
          if (id === runId.current) setC2pa({ state: 'done', summary });
        } catch (e) {
          if (id === runId.current) setC2pa({ state: 'error', message: errorText(e) });
        }
      } else {
        setC2pa({ state: 'skipped' });
      }
    } finally {
      if (id === runId.current) setBusy(false);
    }
  }, []);

  // 예시 자동 실행: 견본 그림을 받아 1단계(표시 확인)와 압축 실험을 바로 돌린다. 판별 모델(약 83MB)은 받지 않는다 — 버튼으로만.
  useEffect(() => {
    const ctrl = new AbortController();
    void (async () => {
      try {
        const res = await fetch(SAMPLE.url, { signal: ctrl.signal });
        if (!res.ok) return;
        const blob = await res.blob();
        if (ctrl.signal.aborted || fileRef.current) return;
        setSample(true);
        await onFile(new File([blob], SAMPLE.name, { type: 'image/png' }));
      } catch {
        // 견본을 못 받아도 데모는 그대로 쓸 수 있다
      }
    })();
    return () => ctrl.abort();
  }, [onFile]);

  // 압축본 만들기: 파일·설정이 바뀌면 잠깐 기다렸다가 다시 만든다
  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    const t = window.setTimeout(async () => {
      try {
        const out = await recompress(file.bitmap, { quality, maxEdge });
        const scan = await scanMetadata(new Uint8Array(await out.blob.arrayBuffer()));
        if (cancelled) {
          out.bitmap.close();
          return;
        }
        const prev = compRef.current;
        const next: CompressedView = {
          url: URL.createObjectURL(out.blob),
          bitmap: out.bitmap,
          bytes: out.blob.size,
          width: out.width,
          height: out.height,
          scan,
          quality,
          maxEdge,
        };
        compRef.current = next;
        setComp(next);
        setCompError(null);
        if (prev) {
          URL.revokeObjectURL(prev.url);
          prev.bitmap.close();
        }
      } catch (e) {
        if (!cancelled) setCompError(errorText(e));
      }
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [file, quality, maxEdge]);

  const scoreOrig = file && scoreOrigFor?.key === file.url ? scoreOrigFor.value : null;
  const scoreComp = comp && scoreCompFor?.key === comp.url ? scoreCompFor.value : null;

  // 모델이 준비되면 원본·압축본 점수를 매긴다
  useEffect(() => {
    if (model.state !== 'ready' || !file || scoreOrig !== null) return;
    let cancelled = false;
    void (async () => {
      const value = await scoreImage(model.session, file.bitmap, file.bitmap.width, file.bitmap.height);
      if (!cancelled) setScoreOrigFor({ key: file.url, value });
    })().catch((e: unknown) => {
      if (!cancelled) setModel({ state: 'error', message: errorText(e) });
    });
    return () => {
      cancelled = true;
    };
  }, [model, file, scoreOrig]);

  useEffect(() => {
    if (model.state !== 'ready' || !comp || scoreComp !== null) return;
    let cancelled = false;
    void (async () => {
      const value = await scoreImage(model.session, comp.bitmap, comp.width, comp.height);
      if (!cancelled) setScoreCompFor({ key: comp.url, value });
    })().catch((e: unknown) => {
      if (!cancelled) setModel({ state: 'error', message: errorText(e) });
    });
    return () => {
      cancelled = true;
    };
  }, [model, comp, scoreComp]);

  const onInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const f = e.target.files?.[0];
    if (f) {
      setSample(false);
      void onFile(f);
    }
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent<HTMLElement>): void => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setSample(false);
      void onFile(f);
    }
  };

  const toggleAuto = (on: boolean): void => {
    setAutoModel(on);
    writePref(on);
  };

  const c2paSummary = c2pa.state === 'done' ? c2pa.summary : undefined;
  const verdict: Verdict | null = file
    ? decide({ scan: file.scan, c2pa: c2paSummary, score: scoreOrig, width: file.bitmap.width, height: file.bitmap.height })
    : null;
  const compVerdict: Verdict | null = comp ? decide({ scan: comp.scan, c2pa: null, score: scoreComp, width: comp.width, height: comp.height }) : null;

  return (
    <div className="grid gap-12">
      {/* 파일 고르기 */}
      <section aria-labelledby="pick-title" className="grid gap-3">
        <h2 id="pick-title" className="sr-only">
          이미지 고르기
        </h2>
        <input id="aicheck-file" type="file" accept={ACCEPT} onChange={onInput} className="peer sr-only" />
        <label
          htmlFor="aicheck-file"
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className="grid gap-2 place-items-center text-center px-5 py-10 sm:py-12 rounded-[var(--r-lg)] cursor-pointer peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2"
          style={{
            border: `1.5px dashed ${dragging ? 'var(--accent)' : 'var(--ink-2)'}`,
            background: dragging ? 'var(--accent-soft)' : 'var(--surface)',
            outlineColor: 'var(--accent)',
          }}
        >
          <span className="text-[18px] font-semibold" style={{ color: 'var(--ink)' }}>
            {file ? '다른 이미지 고르기' : '이미지를 끌어다 놓거나 눌러서 고르기'}
          </span>
          <span className="text-[14px]" style={{ color: 'var(--muted)' }}>
            JPEG · PNG · WebP, 40MB까지. SNS에서 받은 사본과 원본을 둘 다 넣어 보면 차이가 보입니다.
          </span>
        </label>
        {sample && file?.name === SAMPLE.name && (
          <p className="m-0 text-[13.5px] leading-[1.6] pl-3" style={{ color: 'var(--ink-2)', borderLeft: '2px solid var(--ink-2)' }}>
            예시 자동 실행됨 · 견본 그림을 미리 넣어 표시 확인과 압축 실험을 돌려 두었습니다. 견본은 이 작업용 맥에서 오픈소스 모델(FLUX.2 klein 4B)로
            만든 AI 이미지 원본 PNG입니다. 내 그림을 고르면 바뀝니다. 판별 모델은 아래 버튼을 눌러야 받습니다.
          </p>
        )}
        <p className="text-[13.5px] leading-[1.6] pl-3" style={{ color: 'var(--ink-2)', borderLeft: '2px solid var(--rule)' }}>
          고른 파일은 이 브라우저 안에서만 읽고 <b>어디에도 올리지 않습니다</b>. 처음 쓸 때 판독기와 모델 파일만 내려받습니다(C2PA 판독기 약 9MB ·
          jsDelivr — C2PA 상자가 있을 때만, 판별 모델 약 83MB · Hugging Face와 실행기 약 15MB · 이 사이트 — 누를 때만).
        </p>
        <div aria-live="polite" className="text-[14px]" style={{ color: fileError ? 'var(--danger)' : 'var(--muted)' }}>
          {fileError ?? (busy ? '읽는 중…' : '')}
        </div>
      </section>

      {file && verdict && (
        <div className="grid gap-8 md:grid-cols-[300px_minmax(0,1fr)] md:gap-10">
          <figure className="m-0 grid gap-2 content-start">
            {/* eslint-disable-next-line @next/next/no-img-element -- 브라우저에서 만든 blob: URL이라 next/image 최적화 대상이 아니다 */}
            <img
              src={file.url}
              alt={`고른 이미지: ${file.name}`}
              className="w-full h-auto max-h-[360px] object-contain rounded-[var(--r-md)]"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--rule)' }}
            />
            <figcaption className="meta leading-[1.6] break-all">
              {file.name}
              <br />
              {file.scan.format.toUpperCase()} · {file.bitmap.width}×{file.bitmap.height} · {formatBytes(file.bytes)}
            </figcaption>
          </figure>
          <VerdictCard verdict={verdict} score={scoreOrig} title="판정" />
        </div>
      )}

      {/* 1단계 */}
      <section aria-labelledby="layer1-title" className="lab-step grid gap-4">
        <span className="lab-step-id" aria-hidden="true">
          STEP-01 · 확실한 쪽
        </span>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="layer1-title" className="text-[20px] font-semibold" style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em', color: 'var(--ink)' }}>
            1단계 · 표시 확인
          </h2>
          <span className="meta">확실한 쪽 — 파일이 스스로 밝힌 것</span>
        </div>
        {file ? (
          <CheckTable caption="표시 확인 결과" rows={layer1Rows(file.scan, c2pa)} />
        ) : (
          <p className="text-[15px] leading-[1.7] max-w-[62ch]" style={{ color: 'var(--ink-2)' }}>
            이미지를 고르면 C2PA 출처 정보, IPTC DigitalSourceType(XMP), 만든 프로그램(EXIF·XMP), 생성 프로그램이 PNG에 남기는 설정 글,
            JPEG 저장 품질을 확인합니다.
          </p>
        )}
        <p className="text-[13.5px] leading-[1.65] max-w-[70ch]" style={{ color: 'var(--muted)' }}>
          이 데모가 <b>확인하지 않는 것</b>: 보이지 않는 워터마크(구글 SynthID 탐지기는 공개되지 않았고, Meta Video Seal·Adobe TrustMark는 아직 데모에
          넣지 않음), 화면 속 &ldquo;AI 생성&rdquo; 문구 글자 인식(OCR). C2PA 서명은 형식과 위변조만 검증하고, 서명자가 믿을 만한 곳인지(신뢰 목록)는
          확인하지 않습니다.
        </p>
      </section>

      {/* 2단계 */}
      <section aria-labelledby="layer2-title" className="lab-step grid gap-4">
        <span className="lab-step-id" aria-hidden="true">
          STEP-02 · 확률 쪽
        </span>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="layer2-title" className="text-[20px] font-semibold" style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em', color: 'var(--ink)' }}>
            2단계 · 내용 판별
          </h2>
          <span className="meta">확률 쪽 — 그림 자체를 보는 모델</span>
        </div>
        <dl
          className="m-0 grid gap-x-6 gap-y-1.5 sm:grid-cols-[auto_1fr] py-4 text-[14.5px]"
          style={{ borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}
        >
          <dt className="meta pt-0.5">모델</dt>
          <dd className="m-0" style={{ color: 'var(--ink)' }}>
            {MODEL.name} — {MODEL.paper}
          </dd>
          <dt className="meta pt-0.5">라이선스</dt>
          <dd className="m-0" style={{ color: 'var(--ink)' }}>
            {MODEL.license} · Hugging Face{' '}
            <a className="link-u break-all" href={`https://huggingface.co/${MODEL.repo}`} target="_blank" rel="noopener noreferrer">
              {MODEL.repo}
            </a>
          </dd>
          <dt className="meta pt-0.5">실행</dt>
          <dd className="m-0" style={{ color: 'var(--ink)' }}>
            onnxruntime-web(Wasm) · 이 브라우저의 CPU에서 · {formatBytes(MODEL.bytes)} · 받은 뒤 SHA-256 확인
          </dd>
        </dl>

        <div className="grid gap-3">
          {model.state === 'off' && (
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className="btn btn-primary" onClick={() => void startModel()}>
                모델 받고 판별하기 ({formatBytes(MODEL.bytes)})
              </button>
              <span className="text-[13.5px]" style={{ color: 'var(--muted)' }}>
                모바일 데이터라면 와이파이에서 누르세요.
              </span>
            </div>
          )}
          {model.state === 'loading' && (
            <div className="grid gap-1.5 max-w-[420px]">
              <label htmlFor="model-progress" className="text-[14px]" style={{ color: 'var(--ink-2)' }}>
                모델 받는 중 {formatBytes(model.loaded)} / {formatBytes(model.total)}
              </label>
              <progress id="model-progress" max={model.total} value={model.loaded} className="w-full h-2" style={{ accentColor: 'var(--accent)' }} />
            </div>
          )}
          {model.state === 'error' && (
            <div className="flex flex-wrap items-center gap-3" role="alert">
              <span className="text-[14.5px]" style={{ color: 'var(--danger)' }}>
                모델을 쓰지 못했습니다: {model.message}
              </span>
              <button type="button" className="btn btn-ghost" onClick={() => void startModel()}>
                다시 시도
              </button>
            </div>
          )}
          {model.state === 'ready' && (
            <p className="text-[14px]" style={{ color: 'var(--ok)' }} role="status">
              모델 준비됨 — 이미지를 고르면 바로 점수를 매깁니다.
            </p>
          )}
          <label className="inline-flex items-center gap-2 text-[14px] cursor-pointer" style={{ color: 'var(--ink-2)' }}>
            <input
              type="checkbox"
              checked={autoModel}
              onChange={(e) => toggleAuto(e.target.checked)}
              className="h-4 w-4 min-h-0 p-0 shrink-0 cursor-pointer"
              style={{ accentColor: 'var(--accent)' }}
            />
            다음에 올 때 모델을 자동으로 불러오기 (이 브라우저에만 저장)
          </label>
        </div>

        {file && model.state === 'ready' && (
          <div className="max-w-[520px]">
            <ScoreBar score={scoreOrig} label="원본 · AI일 확률" />
          </div>
        )}
        <p className="text-[13.5px] leading-[1.65] max-w-[70ch]" style={{ color: 'var(--muted)' }}>
          기준값 70%는 데모용으로 정한 값이고 검증 전입니다. 모델은 학습에 없던 생성기나 다시 압축된 사본에서 크게 틀릴 수 있어, 점수가 높아도 &ldquo;의심&rdquo;까지만
          말하고 낮아도 &ldquo;사람이 만들었다&rdquo;고 말하지 않습니다. 근거 문장을 만드는 VLM은 연구 단계라 아직 데모에 없습니다.
        </p>
      </section>

      {/* 압축 실험 */}
      <section aria-labelledby="sim-title" className="lab-step grid gap-5">
        <span className="lab-step-id" aria-hidden="true">
          EXP-01 · 연구 문제를 직접 보기
        </span>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="sim-title" className="text-[20px] font-semibold" style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em', color: 'var(--ink)' }}>
            SNS 압축 실험
          </h2>
          <span className="meta">연구 문제를 직접 보기</span>
        </div>
        <p className="text-[15px] leading-[1.7] max-w-[62ch]" style={{ color: 'var(--ink-2)' }}>
          SNS는 올린 그림을 줄이고 JPEG로 다시 저장합니다. 여기서는 브라우저 캔버스로 같은 일을 해서, 표시와 모델 점수가 어떻게 바뀌는지 봅니다. 실제
          플랫폼의 설정값은 서비스마다 다르고 공개되지 않아, 아래 단추의 숫자는 예시입니다.
        </p>

        <div className="grid gap-8 md:grid-cols-[300px_minmax(0,1fr)] md:gap-10">
          <div className="grid gap-5 content-start">
            <Range id="sim-quality" label="JPEG 품질" value={quality} min={20} max={100} step={1} unit="" onChange={setQuality} />
            <Range id="sim-edge" label="긴 변 최대" value={maxEdge} min={320} max={2048} step={8} unit="px" onChange={setMaxEdge} />
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  className="btn btn-ghost text-[13.5px]"
                  aria-pressed={quality === p.quality && maxEdge === p.maxEdge}
                  onClick={() => {
                    setQuality(p.quality);
                    setMaxEdge(p.maxEdge);
                  }}
                  style={quality === p.quality && maxEdge === p.maxEdge ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : undefined}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {comp && (
              <figure className="m-0 grid gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- 캔버스로 다시 저장한 blob: URL */}
                <img
                  src={comp.url}
                  alt={`압축본 미리보기: 품질 ${comp.quality}, ${comp.width}×${comp.height}`}
                  className="w-full h-auto max-h-[300px] object-contain rounded-[var(--r-md)]"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--rule)' }}
                />
                <figcaption className="meta">
                  압축본 · {comp.width}×{comp.height} · {formatBytes(comp.bytes)}
                </figcaption>
              </figure>
            )}
          </div>

          <div className="grid gap-5 content-start min-w-0">
            {!file && (
              <p className="text-[15px]" style={{ color: 'var(--muted)' }}>
                위에서 이미지를 고르면 여기서 원본과 압축본을 나란히 비교합니다.
              </p>
            )}
            {compError && (
              <p className="text-[14.5px]" style={{ color: 'var(--danger)' }} role="alert">
                압축본을 만들지 못했습니다: {compError}
              </p>
            )}
            {file && comp && (
              <>
                <CompareTable rows={compareRows(file, comp, c2pa, scoreOrig, scoreComp, model.state === 'ready')} />
                {model.state === 'ready' && (
                  <div className="grid gap-3 max-w-[520px]">
                    <ScoreBar score={scoreOrig} label="원본 · AI일 확률" />
                    <ScoreBar score={scoreComp} label="압축본 · AI일 확률" />
                  </div>
                )}
                {compVerdict && verdict && (
                  <p className="text-[15px] leading-[1.7] pl-3" style={{ borderLeft: '2px solid var(--ink-2)', color: 'var(--ink)' }} aria-live="polite">
                    원본 판정 <b>{levelText(verdict, scoreOrig)}</b> → 압축본 판정 <b>{levelText(compVerdict, scoreComp)}</b>
                    {model.state !== 'ready' && ' (모델을 받으면 점수까지 비교합니다)'}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function levelText(v: Verdict, score: number | null): string {
  if (v.level === 'marked') return 'AI 표시 확인됨';
  if (v.level === 'suspect') return `AI 의심 ${score === null ? '' : pctText(score)}`.trim();
  return '판단 어려움';
}

function c2paResult(scan: ScanResult, c2pa: C2paState): CheckRow {
  const base = { where: 'C2PA 출처 정보', how: 'JUMBF·caBX 상자 → 공식 판독기 c2pa-web으로 서명·작업 기록 읽기' };
  if (!scan.c2paBox) return { ...base, result: '없음 — C2PA 상자가 없어 판독기를 부르지 않았습니다', tone: 'none' };
  if (c2pa.state === 'loading') return { ...base, result: '상자 있음 · 판독기로 읽는 중…', tone: 'info' };
  if (c2pa.state === 'error') return { ...base, result: `상자 있음 · 판독기를 쓰지 못함 (${c2pa.message})`, tone: 'info' };
  if (c2pa.state !== 'done' || !c2pa.summary) return { ...base, result: '상자는 있으나 읽을 수 있는 매니페스트가 없음', tone: 'info' };
  const s = c2pa.summary;
  const parts = [
    s.generator ? `만든 도구: ${s.generator}` : null,
    s.issuer ? `서명: ${s.issuer}` : null,
    s.validation ? `검증: ${s.validation === 'Invalid' ? '실패' : '형식·위변조 통과'}` : null,
    s.actions.length ? `작업: ${s.actions.map((a) => a.action.replace(/^c2pa\./, '')).join(', ')}` : null,
    s.aiSource ? `AI 생성 표시: ${s.aiSource} (${sourceTypeLabel(s.aiSource)})` : 'AI 생성 표시 없음',
  ].filter(Boolean);
  return { ...base, result: parts.join(' · '), tone: s.aiSource ? 'mark' : 'info' };
}

function layer1Rows(scan: ScanResult, c2pa: C2paState): CheckRow[] {
  const find = (where: string): string[] => scan.findings.filter((f) => f.where.startsWith(where)).map((f) => f.what);
  const marks = (where: string): boolean => scan.findings.some((f) => f.where.startsWith(where) && f.kind === 'mark');
  const rows: CheckRow[] = [c2paResult(scan, c2pa)];
  rows.push({
    where: 'IPTC DigitalSourceType',
    how: 'XMP 안의 출처 종류 값(trainedAlgorithmicMedia 등)',
    result: scan.digitalSourceType ? find('XMP · IPTC').join(' · ') : scan.hasXmp ? 'XMP는 있으나 값 없음' : '없음 (XMP 없음)',
    tone: marks('XMP · IPTC') ? 'mark' : scan.digitalSourceType ? 'info' : 'none',
  });
  rows.push({
    where: '만든 프로그램',
    how: 'EXIF Software · XMP CreatorTool',
    result: find('EXIF · XMP 소프트웨어').join(' · ') || '없음',
    tone: marks('EXIF · XMP 소프트웨어') ? 'mark' : scan.software ? 'info' : 'none',
  });
  if (scan.format === 'png') {
    rows.push({
      where: '생성 설정 글',
      how: 'PNG tEXt·zTXt·iTXt (SD WebUI·ComfyUI·InvokeAI가 남김)',
      result: find('PNG 글 청크').join(' · ') || '없음',
      tone: marks('PNG 글 청크') ? 'mark' : 'none',
    });
  }
  rows.push({
    where: '카메라 정보',
    how: 'EXIF Make · Model (참고만)',
    result: scan.cameraModel ?? (scan.hasExif ? 'EXIF는 있으나 카메라 정보 없음' : '없음 (EXIF 없음)'),
    tone: scan.cameraModel ? 'info' : 'none',
  });
  if (scan.format === 'jpeg') {
    rows.push({
      where: 'JPEG 저장 품질',
      how: '양자화표로 추정 (IJG 기준)',
      result: find('JPEG 양자화표').join(' · ') || '추정 못 함',
      tone: 'info',
    });
  }
  return rows;
}

function compareRows(
  file: Loaded,
  comp: CompressedView,
  c2pa: C2paState,
  scoreOrig: number | null,
  scoreComp: number | null,
  modelReady: boolean,
): CompareRow[] {
  const a = file.scan;
  const b = comp.scan;
  const aiMark = (s: ScanResult): boolean => s.findings.some((f) => f.kind === 'mark');
  const c2paAi = c2pa.state === 'done' && !!c2pa.summary?.aiSource;
  const rows: CompareRow[] = [
    { what: '해상도', before: `${file.bitmap.width}×${file.bitmap.height}`, after: `${comp.width}×${comp.height}`, changed: comp.width !== file.bitmap.width },
    { what: '용량', before: formatBytes(file.bytes), after: formatBytes(comp.bytes), changed: true },
    {
      what: 'JPEG 품질(추정)',
      before: a.jpegQuality === null ? `${a.format.toUpperCase()} (해당 없음)` : `약 ${a.jpegQuality}`,
      after: b.jpegQuality === null ? '추정 못 함' : `약 ${b.jpegQuality}`,
    },
    { what: 'C2PA 상자', before: yesNo(a.c2paBox, '있음', '없음'), after: yesNo(b.c2paBox, '있음', '없음'), changed: a.c2paBox && !b.c2paBox },
    { what: 'XMP', before: yesNo(a.hasXmp, '있음', '없음'), after: yesNo(b.hasXmp, '있음', '없음'), changed: a.hasXmp && !b.hasXmp },
    { what: 'EXIF', before: yesNo(a.hasExif, '있음', '없음'), after: yesNo(b.hasExif, '있음', '없음'), changed: a.hasExif && !b.hasExif },
    {
      what: 'AI 표시',
      before: yesNo(aiMark(a) || c2paAi, '있음', '없음'),
      after: yesNo(aiMark(b), '있음', '없음'),
      changed: (aiMark(a) || c2paAi) && !aiMark(b),
    },
  ];
  if (modelReady) {
    const pct = (s: number | null): string => (s === null ? '계산 중…' : pctText(s));
    rows.push({
      what: '모델 점수',
      before: pct(scoreOrig),
      after: pct(scoreComp),
      changed: scoreOrig !== null && scoreComp !== null && Math.abs(scoreOrig - scoreComp) >= 0.1,
    });
  }
  return rows;
}
