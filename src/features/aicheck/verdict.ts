import type { C2paSummary } from './c2pa';
import { sourceTypeLabel, type ScanResult } from './scanMetadata';

// 결과 3단계. "가짜"·"사람이 만든 것"이라고 단정하는 말은 어디에도 쓰지 않는다.
//   marked  AI 표시 확인됨 — 파일 안에 AI로 만들었다는 표시가 있다(C2PA·IPTC·생성 프로그램 기록)
//   suspect AI 의심 N%   — 표시는 없지만 내용 판별 모델 점수가 기준 이상
//   unsure  판단 어려움   — 그 밖의 모든 경우(점수가 낮아도 "사람이 만들었다"는 뜻이 아니다)

export type Level = 'marked' | 'suspect' | 'unsure';

/** 데모 기준값. 검증 데이터로 정한 값이 아니다 — 연구에서 SNS 사본으로 다시 정한다. */
export const SUSPECT_AT = 0.7;

export interface Verdict {
  level: Level;
  headline: string;
  reasons: string[];
  cautions: string[];
}

export interface Evidence {
  scan: ScanResult;
  /** undefined = 아직 안 읽음/못 읽음, null = 매니페스트 없음 */
  c2pa: C2paSummary | null | undefined;
  /** 내용 판별 모델 점수(0~1). 모델을 안 돌렸으면 null */
  score: number | null;
  width: number;
  height: number;
}

/** 점수 표시. 모델은 확신할 수 없으므로 0%·100%로 보이지 않게 양 끝을 "미만·이상"으로 쓴다. */
export function pctText(score: number): string {
  const p = Math.round(score * 100);
  if (p < 1) return '1% 미만';
  if (p > 99) return '99% 이상';
  return `${p}%`;
}

export const LEVEL_LABEL: Record<Level, string> = {
  marked: 'AI 표시 확인됨',
  suspect: 'AI 의심',
  unsure: '판단 어려움',
};

export function decide(e: Evidence): Verdict {
  const reasons: string[] = [];
  const cautions: string[] = [];

  const c2paAi = e.c2pa?.aiSource ?? null;
  if (c2paAi) reasons.push(`C2PA 출처 정보의 작업 기록에 "${c2paAi}"(${sourceTypeLabel(c2paAi)})가 있음${e.c2pa?.generator ? ` · 만든 도구: ${e.c2pa.generator}` : ''}`);
  for (const f of e.scan.findings) if (f.kind === 'mark') reasons.push(`${f.where}: ${f.what}`);

  if (e.c2pa && e.c2pa.validation === 'Invalid') cautions.push('C2PA 서명 검증이 실패했습니다 — 파일이 서명 뒤에 바뀌었을 수 있습니다.');

  if (reasons.length > 0) {
    if (!c2paAi) cautions.push('C2PA 서명이 없는 표시(XMP·EXIF·PNG 글)는 누구나 써넣거나 지울 수 있습니다. 반대 방향(사람이 찍은 사진에 AI 표시)도 가능합니다.');
    return { level: 'marked', headline: '파일 안에 AI로 만들었다는 표시가 있습니다.', reasons, cautions };
  }

  // 표시 없음 → 내용 판별
  const notes: string[] = ['AI 표시(C2PA·IPTC·생성 프로그램 기록)를 찾지 못했습니다. 표시가 없다고 사람이 만든 것은 아닙니다 — SNS는 업로드 때 메타데이터를 지우는 경우가 많습니다.'];
  if (e.scan.jpegQuality !== null && e.scan.jpegQuality < 90) {
    cautions.push(`JPEG 저장 품질이 약 ${e.scan.jpegQuality}(추정)입니다. 다시 압축된 사본에서는 판별 모델 정확도가 크게 떨어집니다(아래 압축 실험).`);
  }
  if (Math.min(e.width, e.height) < 440) cautions.push(`그림이 작습니다(${e.width}×${e.height}). 모델 입력(384px)에 맞추려고 키우면서 흔적이 흐려질 수 있습니다.`);

  if (e.score === null) {
    return {
      level: 'unsure',
      headline: '표시가 없고, 내용 판별은 아직 하지 않았습니다.',
      reasons: [...notes, '아래 "내용 판별"에서 모델을 돌리면 점수와 근거가 붙습니다.'],
      cautions,
    };
  }

  const pct = pctText(e.score);
  if (e.score >= SUSPECT_AT) {
    return {
      level: 'suspect',
      headline: `표시는 없지만, 판별 모델이 본 AI일 확률은 ${pct}입니다.`,
      reasons: [...notes, `판별 모델 점수 ${pct} (기준 ${Math.round(SUSPECT_AT * 100)}% 이상 — 데모 기준값, 검증 전)`],
      cautions: [...cautions, '모델은 틀릴 수 있습니다. 이 결과만으로 누군가를 "가짜"라고 말하지 마세요.'],
    };
  }
  return {
    level: 'unsure',
    headline: `표시가 없고, 판별 모델 점수(${pct})도 기준 아래입니다.`,
    reasons: [
      ...notes,
      `판별 모델 점수 ${pct} — 낮은 점수는 "AI 흔적을 못 찾았다"는 뜻이지 "사람이 만들었다"는 뜻이 아닙니다. 학습에 없던 생성기나 압축된 사본은 낮게 나오기 쉽습니다.`,
    ],
    cautions,
  };
}
