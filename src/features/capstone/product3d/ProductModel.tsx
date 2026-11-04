'use client';

/**
 * ProductModel — 선언형 스펙으로 그리는 3D 제품 모델 뷰어 (졸업작품 구상 페이지 공용).
 *
 * - 드래그(손가락은 가로)·화살표 키로 돌리고, "분해 보기"로 부품을 `explode` 방향으로 벌려 이름표를 띄운다.
 *   이름표를 누르거나 Tab으로 오면 그 부품만 강조되고 설명이 아래에 뜬다. 3D 부품을 직접 눌러도 된다.
 * - three.js는 이 컴포넌트가 화면 가까이 왔을 때만 불러온다(next/dynamic, ssr:false). 그 전과 WebGL이 없는
 *   브라우저에서는 `poster` 사진(없으면 제품 이름이 적힌 자리)을 보여 준다. 비율이 고정이라 화면이 밀리지 않는다.
 * - 화면 밖이거나 탭이 숨겨지면 그리기를 멈추고, 언마운트하면 GPU 자원을 전부 푼다.
 * - 동작 줄이기 설정이면 자동 회전·깜빡임이 없고 분해는 바로 바뀐다.
 * - 단위는 cm, 각도는 도. +Y가 위, +Z가 앞(정면). 도형별 size의 뜻은 `types.ts`의 `Part.size`를 본다.
 * - 색: 투명 배경이 기본이라 라이트·다크 둘 다에 얹힌다. 이름표·버튼 색은 사이트 토큰(--surface·--ink·--rule·--accent)을
 *   따르고, 바꾸려면 감싼 요소에 `--p3d-accent`·`--p3d-ink`·`--p3d-chip-bg`·`--p3d-rule`·`--p3d-line`·`--p3d-muted`를 준다.
 *
 * 서버 컴포넌트(page.tsx)에서 그대로 쓸 수 있다 — 스펙은 평범한 객체다.
 *
 * @example
 * ```tsx
 * import ProductModel from '@/features/capstone/product3d/ProductModel';
 * import type { ProductSpec } from '@/features/capstone/product3d/types';
 *
 * const SENSOR: ProductSpec = {
 *   name: '화장실 무게 센서',
 *   parts: [
 *     { id: 'plate', label: '받침판', detail: '화장실을 올려 두는 판', shape: 'roundedBox',
 *       size: [40, 1.2, 30, 0.6], position: [0, 3, 0], color: '#e9e6df', explode: [0, 6, 0] },
 *     { id: 'cell', label: '로드셀 ×4', detail: '네 귀퉁이 무게 센서', shape: 'box',
 *       size: [3, 1.2, 1.2], position: [16, 1.2, 11], color: '#a7adb5', metalness: 0.8, roughness: 0.3, explode: [4, 0, 4] },
 *     { id: 'led', label: '상태 LED', shape: 'sphere', size: [0.3], position: [18, 3.2, 14.5],
 *       color: '#2dd4bf', emissive: '#2dd4bf', pulse: true, explode: [0, 6, 2] },
 *   ],
 *   camera: { azimuth: 35, elevation: 24 },
 * };
 *
 * <ProductModel spec={SENSOR} poster="/images/capstone/sensor.webp" style={{ '--p3d-accent': 'var(--accent)' }} />
 * ```
 */

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import type { ProductSpec } from './types';

export type { Part, ProductSpec, CameraSpec, PartShape, Vec3 } from './types';

const ProductViewer = dynamic(() => import('./ProductViewer'), { ssr: false, loading: () => null });

export interface ProductModelProps {
  spec: ProductSpec;
  /** WebGL 전·없을 때 보여 줄 사진 경로. 없으면 이름이 적힌 자리 표시 */
  poster?: string;
  /** 640px 이상에서의 CSS aspect-ratio, 기본 '4 / 3' */
  aspect?: string;
  /** 640px 미만에서의 CSS aspect-ratio, 기본 '1 / 1' (이름표 자리를 위해 더 높게) */
  mobileAspect?: string;
  /** 손대기 전까지 천천히 돈다. 기본 true */
  autoRotate?: boolean;
  className?: string;
  /** 바깥 figure에 붙는 스타일 — CSS 변수(--p3d-*)를 넘길 때 */
  style?: CSSProperties & Record<`--${string}`, string>;
}

type Phase = 'idle' | 'loading' | 'ready' | 'failed';

const RM_QUERY = '(prefers-reduced-motion: reduce)';
function subscribeRM(cb: () => void): () => void {
  const mq = window.matchMedia(RM_QUERY);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}
const getRM = (): boolean => window.matchMedia(RM_QUERY).matches;
const getRMServer = (): boolean => false;

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl2') ?? c.getContext('webgl')) as WebGLRenderingContext | null;
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export default function ProductModel({
  spec,
  poster,
  aspect = '4 / 3',
  mobileAspect = '1 / 1',
  autoRotate = true,
  className,
  style,
}: ProductModelProps): JSX.Element {
  const boxRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const reducedMotion = useSyncExternalStore(subscribeRM, getRM, getRMServer);

  // 화면 200px 앞까지 오면 그때 three.js 청크를 받는다
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const begin = (): void => setPhase(hasWebGL() ? 'loading' : 'failed');
    if (typeof IntersectionObserver === 'undefined') {
      const id = window.setTimeout(begin, 0);
      return () => window.clearTimeout(id);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          begin();
        }
      },
      { rootMargin: '200px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const label = spec.description ?? `${spec.name} 3D 모델 — 부품 ${spec.parts.length}개: ${spec.parts.map((p) => p.label).join(', ')}`;
  const showViewer = phase === 'loading' || phase === 'ready';
  const transparent = !spec.background || spec.background === 'transparent';

  return (
    <figure className={`relative m-0 ${className ?? ''}`} style={style}>
      <div
        ref={boxRef}
        className="relative w-full overflow-hidden rounded-[14px] select-none aspect-[var(--p3d-ar-sm)] sm:aspect-[var(--p3d-ar)]"
        style={
          {
            '--p3d-ar': aspect,
            '--p3d-ar-sm': mobileAspect,
            background: transparent ? undefined : spec.background,
          } as CSSProperties
        }
      >
        {/* 자리 표시 · 포스터 — 뷰어가 첫 장면을 그리면 사라진다 */}
        <div
          role={phase === 'ready' ? undefined : 'img'}
          aria-label={phase === 'ready' ? undefined : label}
          aria-hidden={phase === 'ready' ? true : undefined}
          className="absolute inset-0 flex items-center justify-center transition-opacity duration-500"
          style={{ opacity: phase === 'ready' ? 0 : 1, pointerEvents: 'none' }}
        >
          {poster ? (
            // eslint-disable-next-line @next/next/no-img-element -- 크기를 모르는 임의 포스터, 컨테이너가 비율을 잡는다
            <img src={poster} alt="" className="absolute inset-0 w-full h-full object-contain" loading="lazy" decoding="async" />
          ) : (
            <div className="relative flex flex-col items-center gap-3 px-6 text-center">
              <span
                aria-hidden="true"
                className="block w-[46%] min-w-[140px] h-[18px] rounded-[50%]"
                style={{ background: 'radial-gradient(closest-side, color-mix(in srgb, var(--ink) 16%, transparent), transparent)' }}
              />
              <span className="text-[15px] font-semibold" style={{ color: 'var(--p3d-ink, var(--ink))' }}>
                {spec.name}
              </span>
              <span className="text-[12px] tracking-[.03em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--p3d-muted, var(--muted))' }}>
                {phase === 'failed' ? '이 브라우저에서는 3D 모델을 볼 수 없어요' : '3D 모델 준비 중'}
              </span>
            </div>
          )}
        </div>

        {showViewer && (
          <div className="absolute inset-0 transition-opacity duration-500" style={{ opacity: phase === 'ready' ? 1 : 0 }}>
            <ProductViewer
              spec={spec}
              reducedMotion={reducedMotion}
              autoRotate={autoRotate}
              onReady={() => setPhase('ready')}
              onError={() => setPhase('failed')}
            />
          </div>
        )}
      </div>

      {/* 스크린리더용 부품 목록 */}
      <figcaption className="sr-only">
        {spec.name} 부품 구성
        <ul>
          {spec.parts.map((p) => (
            <li key={p.id}>
              {p.label}
              {p.detail ? `: ${p.detail}` : ''}
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
