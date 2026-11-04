'use client';

import type { Mistake } from './types';

// 가상 기기 데모의 작은 화면 조각들. 상태는 RoommateDemo가 갖고 여기는 그리기만 한다.

export function Toggle({
  id,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}): JSX.Element {
  return (
    <div className="flex items-start gap-3 py-2">
      <input
        id={id}
        type="checkbox"
        role="switch"
        aria-checked={checked}
        aria-describedby={`${id}-hint`}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-5 w-5 min-h-0 shrink-0 p-0 cursor-pointer"
        style={{ accentColor: 'var(--accent)' }}
      />
      <div className="min-w-0">
        <label htmlFor={id} className="block text-[15.5px] font-semibold cursor-pointer" style={{ color: 'var(--ink)' }}>
          {label}
          <span className="ml-2 meta">{checked ? '켜짐' : '꺼짐'}</span>
        </label>
        <p id={`${id}-hint`} className="text-[13.5px] leading-[1.55]" style={{ color: 'var(--muted)' }}>
          {hint}
        </p>
      </div>
    </div>
  );
}

export type Phase = 'idle' | 'speaking' | 'awaiting' | 'listening' | 'thinking';

const PHASE_TEXT: Record<Phase, string> = {
  idle: '대기 중 · 마이크 꺼짐',
  speaking: '말하는 중 · 마이크 꺼짐',
  awaiting: '대답 기다리는 중 · 마이크 꺼짐 (말하기를 누르면 켜짐)',
  listening: '듣는 중 · 마이크 켜짐',
  thinking: '대답 만드는 중 · 마이크 꺼짐',
};

/** 기기 앞면: 마이크 LED(듣는 동안만 켜짐) + 상태 글자. 색만으로 구분하지 않게 글자를 같이 쓴다. */
export function DeviceFace({ phase }: { phase: Phase }): JSX.Element {
  const micOn = phase === 'listening';
  return (
    <div className="flex items-center gap-3" aria-live="polite">
      <span
        aria-hidden="true"
        className={`inline-block h-3.5 w-3.5 rounded-full shrink-0 ${micOn ? 'roommate-led-on' : ''}`}
        style={{
          background: micOn ? 'var(--accent)' : 'transparent',
          border: `2px solid ${micOn ? 'var(--accent)' : 'var(--muted)'}`,
        }}
      />
      <span className="text-[14px] leading-[1.45]" style={{ color: micOn ? 'var(--accent)' : 'var(--ink-2)' }}>
        <span className="sr-only">기기 상태: </span>
        {PHASE_TEXT[phase]}
      </span>
    </div>
  );
}

function dueText(m: Mistake, day: number): string {
  const d = m.dueDay - day;
  if (d <= 0) return '오늘';
  return `${d}일 뒤`;
}

export function MemoryList({ memory, day }: { memory: Mistake[]; day: number }): JSX.Element {
  if (memory.length === 0) {
    return (
      <p className="text-[15px]" style={{ color: 'var(--muted)' }}>
        아직 없습니다. 대화에서 틀린 표현이 나오면 여기 쌓이고, 며칠 뒤 기기가 먼저 다시 묻습니다.
      </p>
    );
  }
  return (
    <ul className="list-none m-0 p-0" style={{ borderTop: '1px solid var(--rule)' }}>
      {memory.map((m) => (
        <li
          key={m.id}
          className="py-3 grid gap-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-4"
          style={{ borderBottom: '1px solid var(--rule)' }}
        >
          <div className="min-w-0">
            <p className="text-[16px] font-semibold" style={{ color: 'var(--ink)' }}>
              {m.right}
              {m.sample && <span className="ml-2 meta">예시</span>}
            </p>
            <p className="text-[14px] leading-[1.55]" style={{ color: 'var(--ink-2)' }}>
              <span className="sr-only">내가 한 말: </span>
              <s style={{ color: 'var(--muted)' }}>{m.wrong}</s>
              {[m.ko, m.hint].filter(Boolean).map((t) => (
                <span key={t}>
                  <span aria-hidden="true"> · </span>
                  {t}
                </span>
              ))}
            </p>
          </div>
          <p className="meta sm:text-right whitespace-nowrap">
            다음 복습 {dueText(m, day)}
            <br className="hidden sm:block" />
            <span className="sm:hidden"> · </span>맞힘 {m.hits}회
          </p>
        </li>
      ))}
    </ul>
  );
}
