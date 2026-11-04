// "이거 AI야?" 감식 보고서 모양의 조각들. 스타일은 lab.css(이 페이지 전용).

interface ExhibitProps {
  id: string;
  /** 머리줄 왼쪽의 사건 번호 (예: "EXH-B · 1단계") */
  code: string;
  /** 머리줄 오른쪽 상태 꼬리표 */
  status?: React.ReactNode;
  title: string;
  className?: string;
  children: React.ReactNode;
}

/** 증거 카드: 사건 번호 머리줄 + 제목 + 본문. 제목은 h2라 문서 개요가 그대로 남는다. */
export function Exhibit({ id, code, status, title, className, children }: ExhibitProps): JSX.Element {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`lab-exh scroll-mt-24 ${className ?? ''}`}>
      <div className="lab-exh-head">
        <span>{code}</span>
        {status}
      </div>
      <div className="lab-exh-body">
        <h2 id={`${id}-title`}>{title}</h2>
        {children}
      </div>
    </section>
  );
}

export function Tag({ tone, children }: { tone?: 'accent' | 'amber'; children: React.ReactNode }): JSX.Element {
  return (
    <span className="lab-tag" data-tone={tone}>
      {children}
    </span>
  );
}

/** 호박색 경고 줄 — 한계·위험에만 쓴다 */
export function Flag({ label = '한계', children }: { label?: string; children: React.ReactNode }): JSX.Element {
  return (
    <p className="lab-flag m-0">
      <b>{label}</b>
      <span>{children}</span>
    </p>
  );
}

/** 접어 둔 자료(기본 닫힘). 표·인용·실험 세부를 여기에 둔다. */
export function More({ label, count, children }: { label: string; count?: string; children: React.ReactNode }): JSX.Element {
  return (
    <details className="lab-more">
      <summary>
        <span>{label}</span>
        {count && <span className="lab-count">{count}</span>}
      </summary>
      <div className="lab-more-body">{children}</div>
    </details>
  );
}

/** 가로로 넘치는 표를 키보드로도 넘길 수 있게 감싼다 */
export function ScrollTable({ label, minWidth, children }: { label: string; minWidth?: number; children: React.ReactNode }): JSX.Element {
  return (
    <div className="lab-scroll" role="region" aria-label={label} tabIndex={0}>
      <table className="lab-table" style={minWidth ? { minWidth } : undefined}>
        {children}
      </table>
    </div>
  );
}

/** 생성 이미지 위 작은 표시 */
export function AiImageChip({ model = 'FLUX.2 klein' }: { model?: string }): JSX.Element {
  return (
    <span className="lab-chip" style={{ right: 8, bottom: 8 }}>
      AI 이미지 · 로컬 {model}
    </span>
  );
}

/** 페이지 끝 각주: 이 페이지의 사진이 생성 이미지임을 밝힌다. */
export function AiImageFootnote(): JSX.Element {
  return (
    <p className="mt-6 text-[13px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
      이 페이지의 사진은 실제 촬영이 아니라, 이 작업용 맥에서 오픈소스 모델(FLUX.2 klein 4B, Apache-2.0)로 만든 AI 이미지입니다. 사람·실제 제품은 나오지
      않습니다.
    </p>
  );
}
