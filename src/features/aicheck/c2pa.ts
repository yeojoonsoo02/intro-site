import type { C2pa, Manifest, ManifestStore } from '@contentauth/c2pa-web';
import { isAiSourceType } from './scanMetadata';

// 1단계의 공식 판독기: Content Authenticity Initiative의 @contentauth/c2pa-web(c2pa-rs를 Wasm으로 빌드, MIT).
// 무거워서(Wasm 약 9MB) 파일에 C2PA 상자가 있을 때만 불러온다. 판독은 Web Worker 안에서 돌고 파일은 밖으로 나가지 않는다.
// Wasm은 설치한 패키지와 같은 버전을 jsDelivr에서 받는다(버전이 어긋나면 워커와 Wasm이 맞지 않는다).

const C2PA_WEB_VERSION = '0.15.6';
const WASM_SRC = `https://cdn.jsdelivr.net/npm/@contentauth/c2pa-web@${C2PA_WEB_VERSION}/dist/resources/c2pa_bg.wasm`;

export interface C2paAction {
  action: string;
  digitalSourceType: string | null;
  softwareAgent: string | null;
}

export interface C2paSummary {
  /** 서명한 쪽이 밝힌 생성 도구 (claim_generator_info) */
  generator: string | null;
  /** 서명 인증서 발급자 */
  issuer: string | null;
  signedAt: string | null;
  actions: C2paAction[];
  /** 어느 action이든 AI 생성 DigitalSourceType을 달고 있나 */
  aiSource: string | null;
  /** c2pa-rs 검증 결과: Valid · Trusted · Invalid (신뢰 목록을 주지 않아 Trusted는 나오지 않는다) */
  validation: string | null;
  manifestCount: number;
}

let instance: Promise<C2pa> | null = null;

function load(): Promise<C2pa> {
  instance ??= import('@contentauth/c2pa-web').then(({ createC2pa }) => createC2pa({ wasmSrc: WASM_SRC }));
  // 실패하면 다음 시도에서 다시 받도록 캐시를 비운다
  instance.catch(() => {
    instance = null;
  });
  return instance;
}

function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

function sourceTail(v: unknown): string | null {
  const s = str(v);
  if (!s) return null;
  const i = s.lastIndexOf('/');
  return i >= 0 ? s.slice(i + 1) : s;
}

function actionsOf(m: Manifest): C2paAction[] {
  const out: C2paAction[] = [];
  for (const a of m.assertions ?? []) {
    if (!a.label.startsWith('c2pa.actions')) continue;
    const data = a.data as { actions?: unknown } | null;
    const list = Array.isArray(data?.actions) ? data.actions : [];
    for (const raw of list) {
      if (!raw || typeof raw !== 'object') continue;
      const r = raw as Record<string, unknown>;
      const agent = r.softwareAgent;
      out.push({
        action: str(r.action) ?? '(이름 없음)',
        digitalSourceType: sourceTail(r.digitalSourceType),
        softwareAgent: str(agent) ?? (agent && typeof agent === 'object' ? str((agent as Record<string, unknown>).name) : null),
      });
    }
  }
  return out;
}

function generatorOf(m: Manifest): string | null {
  const info = m.claim_generator_info?.[0];
  if (info) {
    const name = str(info.name);
    const version = str(info.version);
    if (name) return version ? `${name} ${version}` : name;
  }
  return str(m.claim_generator);
}

export function summarize(store: ManifestStore): C2paSummary | null {
  const manifests = store.manifests ?? {};
  const label = store.active_manifest;
  const active = label ? manifests[label] : undefined;
  if (!active) return null;
  const actions = actionsOf(active);
  const aiSource = actions.find((a) => isAiSourceType(a.digitalSourceType))?.digitalSourceType ?? null;
  return {
    generator: generatorOf(active),
    issuer: str(active.signature_info?.issuer),
    signedAt: str(active.signature_info?.time),
    actions,
    aiSource,
    validation: str(store.validation_state),
    manifestCount: Object.keys(manifests).length,
  };
}

/** C2PA 매니페스트를 읽는다. 없으면 null, 판독기를 못 불러오면 예외. */
export async function readC2pa(blob: Blob): Promise<C2paSummary | null> {
  const c2pa = await load();
  const { Reader } = await import('@contentauth/c2pa-web');
  const reader = await Reader.fromBlob(c2pa, blob.type || undefined, blob);
  if (!reader) return null;
  try {
    return summarize(await reader.manifestStore());
  } finally {
    await reader.free();
  }
}
