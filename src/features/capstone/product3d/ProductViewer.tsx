'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Box3, Color, Raycaster, Vector2, Vector3 } from 'three';
import { buildStage, type Stage } from './scene';
import type { ProductSpec } from './types';

// ProductModel이 화면에 들어온 뒤에만 next/dynamic으로 불러오는 실제 뷰어. three.js는 이 청크에만 들어간다.
// 프레임마다 바뀌는 것(카메라·부품 위치·이름표 위치)은 React 상태가 아니라 ref와 DOM 스타일로 직접 고친다.

const DEG = Math.PI / 180;
const EXPLODE_SECONDS = 0.8;
const AUTO_ROTATE_RAD_PER_SEC = 0.22;
const LABEL_GAP = 6;
const LEADER = 26;
const PAD = 10;
const TOP_RESERVE = 64; // 오른쪽 위 버튼 줄
const BOTTOM_RESERVE = 54; // 왼쪽 아래 설명 줄
const NARROW = 560; // 이보다 좁으면 이름표를 오른쪽 한 줄로

export interface ProductViewerProps {
  spec: ProductSpec;
  reducedMotion: boolean;
  autoRotate: boolean;
  onReady: () => void;
  onError: () => void;
}

interface Ctl {
  az: number;
  el: number;
  azGoal: number;
  elGoal: number;
  t: number;
  tGoal: number;
  interacted: boolean;
  selected: string | null;
  dirty: boolean;
  visible: boolean;
  pageVisible: boolean;
  w: number;
  h: number;
  sides: Map<string, 1 | -1>;
  accent: Color;
}

const easeInOut = (x: number): number => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp = (x: number, a: number, b: number): number => Math.min(b, Math.max(a, x));

function readAccent(el: HTMLElement): Color {
  const cs = getComputedStyle(el);
  const raw = cs.getPropertyValue('--p3d-accent').trim() || cs.getPropertyValue('--accent').trim() || '#b5402c';
  try {
    return new Color(raw);
  } catch {
    return new Color('#b5402c');
  }
}

/** 경계 상자가 화면(세로·가로 시야각)에 들어오는 카메라 거리 */
function fitDistance(stage: Stage, which: 'a' | 'e', aspect: number): { dist: number; center: Vector3 } {
  const box = which === 'a' ? stage.boundsAssembled : stage.boundsExploded;
  const center = box.getCenter(new Vector3());
  const size = box.getSize(new Vector3());
  const r = Math.max(size.length() / 2, 0.5);
  const vfov = stage.camera.fov * DEG;
  const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
  const fov = Math.min(vfov, hfov);
  return { dist: (r / Math.sin(fov / 2)) * (which === 'a' ? 1.12 : 0.95), center };
}

export default function ProductViewer({ spec, reducedMotion, autoRotate, onReady, onError }: ProductViewerProps): JSX.Element {
  const wrapRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const labelEls = useRef(new Map<string, HTMLButtonElement>());
  const lineEls = useRef(new Map<string, SVGPolylineElement>());
  const dotEls = useRef(new Map<string, SVGCircleElement>());
  const stageRef = useRef<Stage | null>(null);
  const startRef = useRef<() => void>(() => {});

  const cam = spec.camera ?? {};
  const az0 = (cam.azimuth ?? 30) * DEG;
  const el0 = (cam.elevation ?? 18) * DEG;
  const zoom = cam.zoom ?? 1;

  const ctl = useRef<Ctl>({
    az: az0,
    el: el0,
    azGoal: az0,
    elGoal: el0,
    t: 0,
    tGoal: 0,
    interacted: false,
    selected: null,
    dirty: true,
    visible: true,
    pageVisible: true,
    w: 1,
    h: 1,
    sides: new Map(),
    accent: new Color('#b5402c'),
  });

  // 설정(동작 줄이기 등)이 바뀌어도 장면을 다시 만들지 않고 루프가 이 값을 읽는다
  const opts = useRef({ reducedMotion, autoRotate });
  useEffect(() => {
    opts.current = { reducedMotion, autoRotate };
    ctl.current.dirty = true;
    startRef.current();
  }, [reducedMotion, autoRotate]);

  const [exploded, setExploded] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const select = useCallback((id: string | null) => {
    const c = ctl.current;
    if (wrapRef.current) c.accent = readAccent(wrapRef.current);
    c.selected = id;
    c.dirty = true;
    setSelected(id);
  }, []);

  // 장면 만들기 · 그리기 루프 · 이벤트 — 마운트 한 번
  useEffect(() => {
    const wrap = wrapRef.current;
    const host = hostRef.current;
    if (!wrap || !host) return;
    const c = ctl.current;
    // 캔버스는 마운트마다 새로 만든다 — dispose()가 컨텍스트를 놓아 버려 같은 캔버스는 다시 못 쓴다(StrictMode 이중 마운트)
    const canvas = document.createElement('canvas');
    canvas.className = 'block w-full h-full';
    host.appendChild(canvas);
    let stage: Stage;
    try {
      stage = buildStage(canvas, spec);
    } catch {
      canvas.remove();
      onError();
      return;
    }
    stageRef.current = stage;
    c.accent = readAccent(wrap);

    const { renderer, camera, nodes } = stage;
    const target = new Vector3();
    const tmp = new Vector3();
    const box = new Box3();
    let raf = 0;
    let last = 0;
    let firstFrame = true;
    let clock = 0;

    // 이름표 크기는 매 프레임 재지 않고 크기가 바뀔 때만 잰다
    const sizes = new Map<string, { w: number; h: number }>();
    let labelRoom = 0; // 좁은 화면에서 오른쪽 이름표 기둥이 차지하는 폭
    const measure = (): void => {
      let widest = 0;
      for (const n of nodes) {
        const el = labelEls.current.get(n.part.id);
        if (!el) continue;
        const sz = { w: el.offsetWidth, h: el.offsetHeight };
        sizes.set(n.part.id, sz);
        if (!n.part.hideLabel) widest = Math.max(widest, sz.w);
      }
      labelRoom = widest + LEADER + PAD + 14;
      c.dirty = true;
    };
    const resize = (): void => {
      const r = wrap.getBoundingClientRect();
      c.w = Math.max(1, r.width);
      c.h = Math.max(1, r.height);
      renderer.setSize(c.w, c.h, false);
      camera.aspect = c.w / c.h;
      camera.updateProjectionMatrix();
      measure();
    };
    resize();
    let alive = true;
    document.fonts?.ready.then(() => {
      if (alive) {
        measure();
        start();
      }
    });

    const layoutLabels = (): void => {
      const show = c.t > 0.55;
      const narrow = c.w < NARROW;
      const fade = clamp((c.t - 0.55) / 0.45, 0, 1);
      type Item = { id: string; ax: number; ay: number; w: number; h: number; side: 1 | -1; y: number };
      const items: Item[] = [];
      // 모델 중심의 화면 x — 이름표를 왼쪽·오른쪽으로 나누는 기준
      tmp.copy(target).project(camera);
      const cx = (tmp.x * 0.5 + 0.5) * c.w;
      // 모델 전체가 화면에서 차지하는 가로 범위 — 이름표 기둥을 그 바깥에 세운다
      let minX = Infinity;
      let maxX = -Infinity;
      if (show) {
        for (const n of nodes) {
          const g = n.mesh.geometry;
          if (!g.boundingBox) g.computeBoundingBox();
          if (!g.boundingBox) continue;
          box.copy(g.boundingBox).applyMatrix4(n.mesh.matrixWorld);
          for (let k = 0; k < 8; k++) {
            tmp.set(k & 1 ? box.max.x : box.min.x, k & 2 ? box.max.y : box.min.y, k & 4 ? box.max.z : box.min.z).project(camera);
            const sx = (tmp.x * 0.5 + 0.5) * c.w;
            if (sx < minX) minX = sx;
            if (sx > maxX) maxX = sx;
          }
        }
      }
      for (const n of nodes) {
        const el = labelEls.current.get(n.part.id);
        if (!el) continue;
        const visible = (show && !n.part.hideLabel) || c.selected === n.part.id;
        el.style.visibility = visible ? 'visible' : 'hidden';
        const line = lineEls.current.get(n.part.id);
        const dot = dotEls.current.get(n.part.id);
        if (!visible) {
          line?.setAttribute('visibility', 'hidden');
          dot?.setAttribute('visibility', 'hidden');
          continue;
        }
        tmp.copy(n.mesh.position).project(camera);
        const ax = (tmp.x * 0.5 + 0.5) * c.w;
        const ay = (-tmp.y * 0.5 + 0.5) * c.h;
        const prev = c.sides.get(n.part.id);
        // 좁은 화면은 전부 오른쪽 한 줄, 넓으면 부품이 있는 쪽 (중심을 18px 넘게 건너야 바꾼다 — 돌릴 때 깜빡임 방지)
        let side: 1 | -1 = narrow ? 1 : (prev ?? (ax >= cx ? 1 : -1));
        if (!narrow && prev && Math.abs(ax - cx) > 18 && Math.sign(ax - cx) !== prev) side = prev === 1 ? -1 : 1;
        c.sides.set(n.part.id, side);
        const sz = sizes.get(n.part.id) ?? { w: el.offsetWidth, h: el.offsetHeight };
        items.push({ id: n.part.id, ax, ay, w: sz.w, h: sz.h, side, y: 0 });
      }
      for (const side of [1, -1] as const) {
        const col = items.filter((i) => i.side === side).sort((a, b) => a.ay - b.ay);
        if (!col.length) continue;
        let y = -Infinity;
        for (const i of col) {
          i.y = Math.max(i.ay - i.h / 2, y);
          y = i.y + i.h + LABEL_GAP;
        }
        // 설명 상자가 떠 있으면 그 위까지만 쓴다
        const caption = captionRef.current;
        const maxBottom = c.h - Math.max(BOTTOM_RESERVE, caption ? caption.offsetHeight + 20 : 0);
        const overflow = col[col.length - 1].y + col[col.length - 1].h - maxBottom;
        if (overflow > 0) for (const i of col) i.y -= overflow;
        let minTop = side === 1 ? TOP_RESERVE : PAD;
        for (const i of col) {
          i.y = Math.max(i.y, minTop);
          minTop = i.y + i.h + LABEL_GAP;
        }
        const widest = Math.max(...col.map((i) => i.w));
        const colX =
          side === 1
            ? clamp(Math.max(maxX + 14, ...col.map((i) => i.ax + LEADER)), PAD, c.w - PAD - widest)
            : clamp(Math.min(minX - 14, ...col.map((i) => i.ax - LEADER)), PAD + widest, c.w - PAD);
        for (const i of col) {
          const el = labelEls.current.get(i.id);
          if (!el) continue;
          const left = side === 1 ? colX : colX - i.w;
          el.style.transform = `translate3d(${left.toFixed(1)}px, ${i.y.toFixed(1)}px, 0)`;
          el.style.opacity = c.selected === i.id ? '1' : String(fade);
          const ly = i.y + i.h / 2;
          const kneeX = side === 1 ? Math.max(i.ax + 6, colX - 10) : Math.min(i.ax - 6, colX + 10);
          const line = lineEls.current.get(i.id);
          const dot = dotEls.current.get(i.id);
          if (line) {
            line.setAttribute('visibility', 'visible');
            line.setAttribute('points', `${i.ax.toFixed(1)},${i.ay.toFixed(1)} ${kneeX.toFixed(1)},${ly.toFixed(1)} ${colX.toFixed(1)},${ly.toFixed(1)}`);
            line.style.opacity = el.style.opacity;
          }
          if (dot) {
            dot.setAttribute('visibility', 'visible');
            dot.setAttribute('cx', i.ax.toFixed(1));
            dot.setAttribute('cy', i.ay.toFixed(1));
            dot.style.opacity = el.style.opacity;
          }
        }
      }
    };

    const frame = (now: number): void => {
      raf = 0;
      if (!c.visible || !c.pageVisible) return;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      clock += dt;
      const { reducedMotion, autoRotate } = opts.current;
      let moving = false;

      // 분해 진행
      if (c.t !== c.tGoal) {
        if (reducedMotion) c.t = c.tGoal;
        else {
          const step = dt / EXPLODE_SECONDS;
          c.t = c.tGoal > c.t ? Math.min(c.tGoal, c.t + step) : Math.max(c.tGoal, c.t - step);
        }
        moving = true;
      }
      const e = easeInOut(c.t);

      // 자동 회전: 조립 상태이고 아직 손대지 않았을 때만
      if (autoRotate && !reducedMotion && !c.interacted && c.tGoal === 0) {
        const d = AUTO_ROTATE_RAD_PER_SEC * dt;
        c.az += d;
        c.azGoal += d;
        moving = true;
      }
      // 목표 각도로 부드럽게 (키보드·처음 각도)
      const k = reducedMotion ? 1 : 1 - Math.exp(-dt * 9);
      if (Math.abs(c.azGoal - c.az) > 1e-4 || Math.abs(c.elGoal - c.el) > 1e-4) {
        c.az += (c.azGoal - c.az) * k;
        c.el += (c.elGoal - c.el) * k;
        moving = true;
      }

      // 하이라이트·흐리기
      for (const n of nodes) {
        const focusGoal = c.selected === n.part.id ? 1 : 0;
        const dimGoal = c.selected && c.selected !== n.part.id ? 1 : 0;
        const kk = reducedMotion ? 1 : 1 - Math.exp(-dt * 12);
        if (Math.abs(n.focus - focusGoal) > 1e-3 || Math.abs(n.dim - dimGoal) > 1e-3) {
          n.focus += (focusGoal - n.focus) * kk;
          n.dim += (dimGoal - n.dim) * kk;
          if (Math.abs(n.focus - focusGoal) <= 1e-3) n.focus = focusGoal;
          if (Math.abs(n.dim - dimGoal) <= 1e-3) n.dim = dimGoal;
          moving = true;
        }
        const m = n.material;
        const opacity = n.baseOpacity * (1 - n.dim * 0.7);
        const transparent = opacity < 0.999;
        if (m.transparent !== transparent) {
          m.transparent = transparent;
          m.depthWrite = !transparent;
          m.needsUpdate = true;
        }
        m.opacity = opacity;
        let intensity = n.baseEmissiveIntensity;
        if (n.part.pulse) {
          intensity = reducedMotion ? n.baseEmissiveIntensity * 0.75 : n.baseEmissiveIntensity * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(clock * 2.6)));
          if (!reducedMotion) moving = true;
        }
        if (n.focus > 0) {
          m.emissive.copy(n.baseEmissive).lerp(c.accent, n.focus);
          m.emissiveIntensity = intensity + (0.55 - intensity) * n.focus * (n.baseEmissiveIntensity > 0 ? 0.3 : 1);
        } else {
          m.emissive.copy(n.baseEmissive);
          m.emissiveIntensity = intensity;
        }
      }

      if (moving || c.dirty || firstFrame) {
        stage.applyExplode(e);
        const a = fitDistance(stage, 'a', camera.aspect);
        const x = fitDistance(stage, 'e', camera.aspect);
        // 좁은 화면의 분해 보기: 모델을 왼쪽으로 밀고 조금 멀리서 봐서 오른쪽에 이름표 기둥 자리를 낸다
        const narrow = c.w < NARROW;
        const room = narrow ? Math.min(labelRoom, c.w * 0.5) : 0;
        const roomFactor = narrow ? 1 + e * (c.w / (c.w - room) - 1) * 0.55 : 1;
        const dist = ((a.dist + (x.dist * (narrow ? 1 : 1.08) - a.dist) * e) * roomFactor) / zoom;
        target.copy(a.center).lerp(x.center, e);
        camera.position.set(
          target.x + dist * Math.cos(c.el) * Math.sin(c.az),
          target.y + dist * Math.sin(c.el),
          target.z + dist * Math.cos(c.el) * Math.cos(c.az),
        );
        camera.near = Math.max(0.1, dist / 50);
        camera.far = dist * 20;
        if (narrow && e > 0) camera.setViewOffset(c.w, c.h, (room / 2) * e, 0, c.w, c.h);
        else camera.clearViewOffset();
        camera.updateProjectionMatrix();
        camera.lookAt(target);
        renderer.render(stage.scene, camera);
        layoutLabels();
        c.dirty = false;
        if (firstFrame) {
          firstFrame = false;
          onReady();
        }
      }
      raf = requestAnimationFrame(frame);
    };

    const start = (): void => {
      if (!raf && c.visible && c.pageVisible) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };
    startRef.current = start;

    const ro = new ResizeObserver(() => {
      resize();
      start();
    });
    ro.observe(wrap);
    const io = new IntersectionObserver((entries) => {
      c.visible = entries.some((en) => en.isIntersecting);
      start();
    });
    io.observe(wrap);
    const onVis = (): void => {
      c.pageVisible = document.visibilityState !== 'hidden';
      start();
    };
    document.addEventListener('visibilitychange', onVis);
    const onLost = (ev: Event): void => {
      ev.preventDefault();
      onError();
    };
    canvas.addEventListener('webglcontextlost', onLost);
    onVis();
    start();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      raf = 0;
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('webglcontextlost', onLost);
      stageRef.current = null;
      stage.dispose();
      canvas.remove();
    };
    // spec·콜백이 바뀌어도 장면을 다시 만들지 않는다 (페이지마다 고정 스펙)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const kick = (): void => {
    ctl.current.dirty = true;
    startRef.current();
  };

  /** 지금 각도에서 가장 가까운 바퀴의 처음 각도 */
  const nearestAz0 = (az: number): number => az - ((((az - az0 + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) + Math.PI;

  const toggleExplode = (): void => {
    const next = !exploded;
    const c = ctl.current;
    setExploded(next);
    c.tGoal = next ? 1 : 0;
    // 자동 회전 중에 분해하면 스펙이 정한 처음 각도로 돌아가서 벌린다 (explode 방향이 그 각도 기준으로 짜여 있다)
    if (next && !c.interacted) {
      c.azGoal = nearestAz0(c.az);
      c.elGoal = el0;
    }
    if (!next) select(null);
    kick();
  };

  const resetView = (): void => {
    const c = ctl.current;
    // 돌던 각도에서 가장 가까운 바퀴의 처음 각도로 부드럽게 돌아간다
    c.azGoal = nearestAz0(c.az);
    c.elGoal = el0;
    c.interacted = false;
    select(null);
    kick();
  };

  // 드래그로 돌리기 (손가락은 가로로만 — 세로 스와이프는 페이지 스크롤로 남긴다)
  const drag = useRef<{ id: number; x: number; y: number; moved: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>): void => {
    if (e.button !== 0) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>): void => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    d.x = e.clientX;
    d.y = e.clientY;
    d.moved += Math.abs(dx) + Math.abs(dy);
    if (d.moved < 4) return;
    const c = ctl.current;
    c.interacted = true;
    c.azGoal -= dx * 0.009;
    c.elGoal = clamp(c.elGoal + dy * 0.007, -10 * DEG, 75 * DEG);
    c.az = c.azGoal;
    c.el = c.elGoal;
    kick();
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>): void => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.id !== e.pointerId || d.moved >= 4) return;
    // 클릭: 누른 부품을 고른다 (빈 곳이면 해제)
    const stage = stageRef.current;
    const wrap = wrapRef.current;
    if (!stage || !wrap) return;
    const r = wrap.getBoundingClientRect();
    const ndc = new Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    const ray = new Raycaster();
    ray.setFromCamera(ndc, stage.camera);
    const hit = ray.intersectObjects(stage.nodes.map((n) => n.mesh), false)[0];
    const id = (hit?.object.userData.partId as string | undefined) ?? null;
    select(id && id !== ctl.current.selected ? id : null);
    kick();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    const c = ctl.current;
    const step = 20 * DEG;
    if (e.key === 'ArrowLeft') c.azGoal += step;
    else if (e.key === 'ArrowRight') c.azGoal -= step;
    else if (e.key === 'ArrowUp') c.elGoal = clamp(c.elGoal + 10 * DEG, -10 * DEG, 75 * DEG);
    else if (e.key === 'ArrowDown') c.elGoal = clamp(c.elGoal - 10 * DEG, -10 * DEG, 75 * DEG);
    else if (e.key === 'Escape' && c.selected) {
      select(null);
      kick();
      return;
    } else return;
    e.preventDefault();
    c.interacted = true;
    kick();
  };

  const selectedPart = spec.parts.find((p) => p.id === selected);
  const btn =
    'inline-flex items-center h-11 px-4 rounded-full text-[12.5px] font-medium border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';
  const btnStyle = {
    background: 'var(--p3d-chip-bg, color-mix(in srgb, var(--surface) 88%, transparent))',
    color: 'var(--p3d-ink, var(--ink))',
    borderColor: 'var(--p3d-rule, var(--rule))',
    outlineColor: 'var(--p3d-accent, var(--accent))',
    backdropFilter: 'blur(6px)',
  } as const;

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <div
        role="img"
        aria-label={`${spec.description ?? spec.name} — 드래그하거나 화살표 키로 돌려 볼 수 있습니다`}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onKeyDown={onKeyDown}
        className="absolute inset-0 rounded-[inherit] cursor-grab active:cursor-grabbing focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2"
        style={{ touchAction: 'pan-y', outlineColor: 'var(--p3d-accent, var(--accent))' }}
      >
        <div ref={hostRef} className="absolute inset-0" />
      </div>

      {/* 버튼 */}
      <div className="absolute right-3 top-3 flex gap-2">
        <button type="button" className={btn} style={btnStyle} aria-pressed={exploded} onClick={toggleExplode}>
          {exploded ? '합치기' : '분해 보기'}
        </button>
        <button type="button" className={btn} style={btnStyle} onClick={resetView}>
          처음 각도
        </button>
      </div>

      {/* 이름표 지시선 */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" aria-hidden="true">
        {spec.parts.map((p) => (
          <g key={p.id}>
            <polyline
              ref={(el) => {
                if (el) lineEls.current.set(p.id, el);
                else lineEls.current.delete(p.id);
              }}
              visibility="hidden"
              fill="none"
              strokeWidth={1}
              style={{ stroke: selected === p.id ? 'var(--p3d-accent, var(--accent))' : 'var(--p3d-line, var(--muted))' }}
            />
            <circle
              ref={(el) => {
                if (el) dotEls.current.set(p.id, el);
                else dotEls.current.delete(p.id);
              }}
              visibility="hidden"
              r={selected === p.id ? 3.5 : 2.5}
              style={{
                fill: selected === p.id ? 'var(--p3d-accent, var(--accent))' : 'var(--p3d-paper, var(--surface))',
                stroke: selected === p.id ? 'var(--p3d-accent, var(--accent))' : 'var(--p3d-line, var(--muted))',
                strokeWidth: 1.25,
              }}
            />
          </g>
        ))}
      </svg>

      {/* 이름표 — 누르거나 Tab으로 오면 그 부품을 강조한다 */}
      <div className="absolute inset-0 pointer-events-none">
        {spec.parts.map((p) => (
          <button
            key={p.id}
            type="button"
            ref={(el) => {
              if (el) labelEls.current.set(p.id, el);
              else labelEls.current.delete(p.id);
            }}
            aria-pressed={selected === p.id}
            onClick={() => {
              // 포커스(onFocus)가 클릭보다 먼저 와서 이미 골라져 있다 — 토글하지 않고 고르기만 한다
              select(p.id);
              kick();
            }}
            onFocus={() => {
              if (ctl.current.selected !== p.id) {
                select(p.id);
                kick();
              }
            }}
            className="absolute left-0 top-0 pointer-events-auto whitespace-nowrap rounded-md border px-2 py-[3px] min-h-[24px] min-w-0 transition-none text-[11.5px] sm:text-[12.5px] leading-[1.35] font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
            style={{
              visibility: 'hidden',
              background: selected === p.id ? 'var(--p3d-accent, var(--accent))' : 'var(--p3d-chip-bg, color-mix(in srgb, var(--surface) 90%, transparent))',
              color: selected === p.id ? 'var(--p3d-accent-ink, var(--accent-contrast, #fff))' : 'var(--p3d-ink, var(--ink))',
              borderColor: selected === p.id ? 'transparent' : 'var(--p3d-rule, var(--rule))',
              outlineColor: 'var(--p3d-accent, var(--accent))',
              backdropFilter: 'blur(6px)',
              willChange: 'transform',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* 설명 줄 */}
      <div ref={captionRef} className="absolute left-3 right-3 bottom-3 pointer-events-none" aria-live="polite">
        {selectedPart ? (
          <p
            className="inline-block max-w-[min(100%,46ch)] rounded-lg border px-3 py-2 text-[13px] leading-[1.5]"
            style={{
              background: 'var(--p3d-chip-bg, color-mix(in srgb, var(--surface) 92%, transparent))',
              borderColor: 'var(--p3d-rule, var(--rule))',
              color: 'var(--p3d-ink, var(--ink))',
              borderLeft: '3px solid var(--p3d-accent, var(--accent))',
              backdropFilter: 'blur(6px)',
            }}
          >
            <strong className="font-semibold">{selectedPart.label}</strong>
            {selectedPart.detail ? <span style={{ color: 'var(--p3d-ink-2, var(--ink-2))' }}> — {selectedPart.detail}</span> : null}
          </p>
        ) : (
          <p className="text-[12px] tracking-[.02em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--p3d-muted, var(--muted))' }}>
            {exploded ? '이름을 누르면 설명이 나와요' : '끌어서 돌려 보기'}
          </p>
        )}
      </div>
    </div>
  );
}
