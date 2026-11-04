import {
  NeutralToneMapping,
  Box3,
  BoxGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  type BufferGeometry,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  RepeatWrapping,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { Part, ProductSpec, Vec3 } from './types';

// ProductViewer가 쓰는 three.js 장면 조립. React를 모른다 — 만들고(buildStage) 다 쓰면 dispose()로 전부 푼다.

const DEG = Math.PI / 180;

export interface PartNode {
  part: Part;
  mesh: Mesh;
  material: MeshStandardMaterial;
  base: Vector3;
  offset: Vector3;
  baseEmissive: Color;
  baseEmissiveIntensity: number;
  baseOpacity: number;
  /** 하이라이트·흐리기 현재값(0~1) — 프레임마다 목표값으로 다가간다 */
  focus: number;
  dim: number;
}

export interface Stage {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
  nodes: PartNode[];
  shadow: Mesh;
  /** 조립·분해 상태의 경계 상자 (카메라 거리·바닥 그림자 위치를 둘 사이로 보간한다) */
  boundsAssembled: Box3;
  boundsExploded: Box3;
  /** 분해 정도 t(0~1)를 장면에 반영 */
  applyExplode(t: number): void;
  dispose(): void;
}

function geometryFor(part: Part): BufferGeometry {
  const s = part.size;
  const n = (i: number, fallback: number): number => (typeof s[i] === 'number' && Number.isFinite(s[i]) ? s[i] : fallback);
  switch (part.shape) {
    case 'box':
      return new BoxGeometry(n(0, 1), n(1, 1), n(2, 1));
    case 'roundedBox': {
      const w = n(0, 1);
      const h = n(1, 1);
      const d = n(2, 1);
      const r = Math.min(n(3, Math.min(w, h, d) * 0.12), Math.min(w, h, d) / 2 - 1e-3);
      return new RoundedBoxGeometry(w, h, d, 4, Math.max(r, 0.001));
    }
    case 'cylinder': {
      const r = n(0, 1);
      return new CylinderGeometry(r, n(2, r), n(1, 1), 64, 1);
    }
    case 'sphere': {
      const g = new SphereGeometry(1, 48, 32);
      const rx = n(0, 1);
      g.scale(rx, n(1, rx), n(2, rx));
      return g;
    }
    case 'torus': {
      const g = new TorusGeometry(n(0, 1), n(1, 0.1), 20, 96);
      g.rotateX(Math.PI / 2); // 바닥에 눕힌다(축 = Y)
      return g;
    }
    case 'plane':
      return new PlaneGeometry(n(0, 1), n(1, 1));
  }
}

/** 바닥에 깔 부드러운 접지 그림자 (흐린 타원 텍스처 한 장) */
function contactShadowTexture(): CanvasTexture {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  if (g) {
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, 'rgba(0,0,0,0.55)');
    grad.addColorStop(0.35, 'rgba(0,0,0,0.32)');
    grad.addColorStop(0.7, 'rgba(0,0,0,0.08)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
  }
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

/** 질감용 요철 텍스처 (흑백, 128px 반복 타일). 한 타일이 실제 FINISH_TILE_CM 크기다 */
const FINISH_TILE_CM = { fabric: 1.2, brushed: 4 } as const;
function finishTexture(kind: 'fabric' | 'brushed'): CanvasTexture {
  const size = 128;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  if (g) {
    const img = g.createImageData(size, size);
    // 결정적인 의사 난수 (매번 같은 무늬)
    let seed = kind === 'fabric' ? 7 : 13;
    const rnd = (): number => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    const rows = Array.from({ length: size }, () => rnd());
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        let v: number;
        if (kind === 'fabric') {
          // 평직: 8px 칸마다 가로실·세로실이 번갈아 위로 올라온다
          const over = ((x >> 3) + (y >> 3)) & 1;
          const t = over ? Math.sin(((y % 8) / 8) * Math.PI) : Math.sin(((x % 8) / 8) * Math.PI);
          v = 70 + 150 * t + (rnd() - 0.5) * 40;
        } else {
          v = 128 + (rows[y] - 0.5) * 120 + (rnd() - 0.5) * 24;
        }
        const i = (y * size + x) * 4;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = clamp255(v);
        img.data[i + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
  }
  const tex = new CanvasTexture(c);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}
const clamp255 = (v: number): number => Math.max(0, Math.min(255, Math.round(v)));

/** 도형의 UV가 덮는 실제 크기(cm) — 질감 반복 횟수를 정한다 */
function uvSpanCm(part: Part): [number, number] {
  const s = part.size;
  const a = s[0] ?? 1;
  const b = s[1] ?? a;
  switch (part.shape) {
    case 'cylinder':
      return [2 * Math.PI * a, b];
    case 'sphere':
      return [2 * Math.PI * a, Math.PI * b];
    case 'torus':
      return [2 * Math.PI * a, 2 * Math.PI * (s[1] ?? 0.1)];
    case 'box':
    case 'roundedBox': {
      const m = Math.max(a, b, s[2] ?? a);
      return [m, m];
    }
    case 'plane':
      return [a, b];
  }
}

function toV(v: Vec3 | undefined): Vector3 {
  return v ? new Vector3(v[0], v[1], v[2]) : new Vector3();
}

export function buildStage(canvas: HTMLCanvasElement, spec: ProductSpec): Stage {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  const transparent = !spec.background || spec.background === 'transparent';
  renderer.setClearColor(transparent ? 0x000000 : new Color(spec.background), transparent ? 0 : 1);

  const scene = new Scene();

  // 반사용 스튜디오 환경(조명이 아니라 금속·광택면에 비치는 상) — 세기는 낮게
  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envTex = pmrem.fromScene(room, 0.04).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 0.55;
  room.traverse((o) => {
    const m = o as Mesh;
    m.geometry?.dispose();
    const mat = m.material;
    if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
    else mat?.dispose();
  });
  pmrem.dispose();

  // 조명: 하늘/바닥 반구광 + 키(앞 오른쪽 위) + 림(뒤 왼쪽) — 어두운 배경에서도 윤곽이 산다
  const hemi = new HemisphereLight(0xf4f6ff, 0x3a3530, 0.9);
  const key = new DirectionalLight(0xfff4e6, 2.1);
  key.position.set(6, 10, 8);
  const fill = new DirectionalLight(0xdfe8ff, 0.45);
  fill.position.set(-8, 3, 6);
  const rim = new DirectionalLight(0xe8eeff, 1.6);
  rim.position.set(-5, 6, -10);
  scene.add(hemi, key, fill, rim);

  const finishBase: Partial<Record<'fabric' | 'brushed', CanvasTexture>> = {};
  const finishMaps: CanvasTexture[] = [];

  const nodes: PartNode[] = spec.parts.map((part) => {
    const emissiveColor = part.emissive ? new Color(part.emissive) : part.pulse ? new Color(part.color) : new Color(0x000000);
    const opacity = part.opacity ?? 1;
    const material = new MeshStandardMaterial({
      color: new Color(part.color),
      metalness: part.metalness ?? 0.05,
      roughness: part.roughness ?? 0.55,
      emissive: emissiveColor.clone(),
      emissiveIntensity: part.emissive || part.pulse ? (part.emissiveIntensity ?? 1) : 0,
      transparent: opacity < 1,
      opacity,
      depthWrite: opacity >= 1,
      side: part.shape === 'plane' ? DoubleSide : undefined,
    });
    if (part.finish) {
      const base = (finishBase[part.finish] ??= finishTexture(part.finish));
      const map = base.clone();
      const [u, v] = uvSpanCm(part);
      const tile = FINISH_TILE_CM[part.finish];
      map.repeat.set(Math.max(1, Math.round(u / tile)), Math.max(1, Math.round(v / tile)));
      map.needsUpdate = true;
      finishMaps.push(map);
      material.bumpMap = map;
      material.bumpScale = part.finish === 'fabric' ? 1.2 : 0.25;
    }
    const mesh = new Mesh(geometryFor(part), material);
    const base = toV(part.position);
    mesh.position.copy(base);
    if (part.rotation) mesh.rotation.set(part.rotation[0] * DEG, part.rotation[1] * DEG, part.rotation[2] * DEG);
    mesh.userData.partId = part.id;
    if (opacity < 1) mesh.renderOrder = 1;
    scene.add(mesh);
    return {
      part,
      mesh,
      material,
      base,
      offset: toV(part.explode),
      baseEmissive: emissiveColor,
      baseEmissiveIntensity: material.emissiveIntensity,
      baseOpacity: opacity,
      focus: 0,
      dim: 0,
    };
  });

  const measure = (t: number): Box3 => {
    const box = new Box3();
    for (const n of nodes) {
      n.mesh.position.copy(n.base).addScaledVector(n.offset, t);
      n.mesh.updateMatrixWorld(true);
      box.expandByObject(n.mesh);
    }
    return box;
  };
  const boundsExploded = measure(1);
  const boundsAssembled = measure(0);

  // 접지 그림자: 조립 상태 바닥 바로 밑, 발자국의 1.7배 크기
  const sizeA = boundsAssembled.getSize(new Vector3());
  const shadowTex = contactShadowTexture();
  const shadowMat = new MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.85 });
  const shadow = new Mesh(new PlaneGeometry(1, 1), shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  const centerA = boundsAssembled.getCenter(new Vector3());
  shadow.position.set(centerA.x, boundsAssembled.min.y - 0.02, centerA.z);
  const foot = Math.max(sizeA.x, sizeA.z, sizeA.y * 0.5);
  shadow.scale.set(Math.max(sizeA.x, foot * 0.6) * 2, Math.max(sizeA.z, foot * 0.6) * 2, 1);
  shadow.renderOrder = -1;
  scene.add(shadow);

  const camera = new PerspectiveCamera(spec.camera?.fov ?? 30, 1, 0.1, 5000);

  const shadowFloorA = boundsAssembled.min.y - 0.02;
  const shadowFloorE = Math.min(boundsExploded.min.y, boundsAssembled.min.y) - 0.02;

  return {
    renderer,
    scene,
    camera,
    nodes,
    shadow,
    boundsAssembled,
    boundsExploded,
    applyExplode(t: number) {
      for (const n of nodes) n.mesh.position.copy(n.base).addScaledVector(n.offset, t);
      shadow.position.y = shadowFloorA + (shadowFloorE - shadowFloorA) * t;
      shadowMat.opacity = 0.85 - 0.3 * t;
    },
    dispose() {
      for (const n of nodes) {
        n.mesh.geometry.dispose();
        n.material.dispose();
      }
      shadow.geometry.dispose();
      shadowMat.dispose();
      shadowTex.dispose();
      for (const m of finishMaps) m.dispose();
      for (const t of Object.values(finishBase)) t?.dispose();
      envTex.dispose();
      scene.clear();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
