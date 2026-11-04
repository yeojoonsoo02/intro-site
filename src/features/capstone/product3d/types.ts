// 3D 제품 모델(ProductModel)의 선언형 스펙. 단위는 전부 cm, 각도는 도(°).
// 좌표계: +Y가 위, +Z가 화면 쪽(앞면), +X가 오른쪽. 모든 도형은 자기 중심이 position에 온다.

export type Vec3 = [number, number, number];

export type PartShape = 'box' | 'roundedBox' | 'cylinder' | 'sphere' | 'torus' | 'plane';

export interface Part {
  /** 스펙 안에서 겹치지 않는 id */
  id: string;
  /** 분해 보기에서 부품 옆에 뜨는 짧은 이름 (예: "ESP32-S3 보드") */
  label: string;
  /** 이름을 누르면 아래에 뜨는 한두 문장 설명. 스크린리더 목록에도 들어간다 */
  detail?: string;
  shape: PartShape;
  /**
   * 크기(cm). 도형마다 뜻이 다르다.
   * - box:        [가로 x, 높이 y, 깊이 z]
   * - roundedBox: [가로, 높이, 깊이, 모서리 반지름?] (반지름 기본: 가장 짧은 변의 12%)
   * - cylinder:   [반지름, 높이, 아랫면 반지름?] — 축이 Y(세워진 원기둥). 아랫면 반지름을 다르게 주면 원뿔대
   * - sphere:     [반지름 x, 반지름 y?, 반지름 z?] — 하나만 주면 구, 셋이면 타원체(스피커 돔 등)
   * - torus:      [고리 반지름, 굵기 반지름] — 바닥에 눕힌 고리(축이 Y). LED 링 등
   * - plane:      [가로, 높이] — 앞(+Z)을 보는 얇은 판, 양면. 화면·스티커 등
   */
  size: number[];
  /** 조립 상태에서 부품 중심 위치(cm) */
  position: Vec3;
  /** 회전(도), XYZ 순서 */
  rotation?: Vec3;
  /** CSS 색 문자열 (#rrggbb 권장) */
  color: string;
  /** 0~1, 기본 0.05 */
  metalness?: number;
  /** 0~1, 기본 0.55 */
  roughness?: number;
  /** 스스로 빛나는 색 (LED·화면). 없으면 빛나지 않는다 */
  emissive?: string;
  /** emissive 세기, 기본 1 */
  emissiveIntensity?: number;
  /** 분해 보기에서 조립 위치로부터 움직일 거리(cm). 없으면 제자리 */
  explode?: Vec3;
  /** 빛이 천천히 깜빡인다(LED·레이더). emissive가 없으면 color로 빛난다. 동작 줄이기 설정이면 멈춘다 */
  pulse?: boolean;
  /** 표면 질감: 'fabric'(천 스피커 덮개) · 'brushed'(헤어라인 금속). 없으면 매끈한 면 */
  finish?: 'fabric' | 'brushed';
  /** 0~1, 1 미만이면 반투명 (덮개·유리) */
  opacity?: number;
  /** 분해 보기에서 이름표를 숨긴다(나사·장식처럼 설명할 필요 없는 부품) */
  hideLabel?: boolean;
}

export interface CameraSpec {
  /** 처음 수평 각도(도). 0이면 정면(+Z에서 봄), 양수면 카메라가 오른쪽(+X)으로 돌아 제품의 오른쪽 옆면이 보인다. 기본 30.
   *  분해 보기는 이 각도로 돌아와서 벌린다 — explode 방향은 이 각도에서 잘 보이게 짠다 */
  azimuth?: number;
  /** 처음 올려다/내려다보는 각도(도). 양수면 위에서 내려다본다. 기본 18 */
  elevation?: number;
  /** 세로 시야각(도), 기본 30 */
  fov?: number;
  /** 1보다 크면 더 가까이. 기본 1 (모델이 화면에 꽉 차지 않게 자동으로 맞춘 거리) */
  zoom?: number;
}

export interface ProductSpec {
  /** 제품 이름. 대체 텍스트·포스터에 쓰인다 */
  name: string;
  /** 대체 텍스트(aria-label)를 직접 쓸 때. 없으면 이름과 부품 이름으로 만든다 */
  description?: string;
  /** 배열 순서가 이름표의 Tab 순서다 — 위에서 아래(또는 바깥에서 안)로 적으면 읽기 좋다 */
  parts: Part[];
  camera?: CameraSpec;
  /** 'transparent'(기본)이거나 CSS 색 */
  background?: 'transparent' | string;
}
