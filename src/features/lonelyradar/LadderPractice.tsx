import { useEffect, useState } from 'react';
import { STAGE_LABEL, ladderAt } from './alerts';
import type { Ladder, Stage } from './types';

// 단계 알림 직접 해 보기. 1초를 1분으로 줄여 돌린다. 'use client'는 RadarDemo가 맡는다.

const STAGES: { stage: Stage; who: string; what: string }[] = [
  { stage: 'self', who: '본인 폰', what: '"괜찮으세요?" 알림과 진동. "괜찮아요"를 누르면 여기서 끝난다.' },
  { stage: 'manager', who: '관리자', what: '임대인·관리사무소에 문자. 문을 두드리거나 전화한다.' },
  { stage: 'contact', who: '비상 연락처', what: '가족·지인에게 연락. 필요하면 119.' },
];

export default function LadderPractice({ ladder }: { ladder: Ladder }): JSX.Element {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [okAt, setOkAt] = useState<number | null>(null);
  const st = ladderAt(elapsed, ladder, okAt);
  const over = st.cancelled || st.done;

  useEffect(() => {
    if (!running || over) return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [running, over]);

  const start = (): void => {
    setElapsed(0);
    setOkAt(null);
    setRunning(true);
  };

  const status = !running
    ? '“알림 울려 보기”를 누르면 레이더가 이상을 본 순간부터 시작합니다. 1초가 1분입니다.'
    : st.cancelled
      ? `${okAt}분 만에 “괜찮아요” — ${st.stages.length > 1 ? '관리자에게 이미 갔지만 거기서 멈췄습니다.' : '관리자에게 가지 않고 끝났습니다.'}`
      : st.done
        ? `${elapsed}분 동안 답이 없어 비상 연락처까지 갔습니다.`
        : `${STAGE_LABEL[st.current]} 단계로 알렸습니다.`;
  // 매초 바뀌는 숫자는 화면 낭독기가 읽지 않게 따로 둔다
  const clock = running && !over ? `${elapsed}분 지남 · 다음 단계까지 ${st.nextInMin}분` : null;

  return (
    <div className="grid gap-4 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:gap-8 items-start">
      <div
        className="rounded-[var(--r-lg)] p-4 grid gap-3"
        style={{ background: 'var(--surface)', border: '1px solid var(--rule)', boxShadow: 'var(--shadow)' }}
        aria-label="본인 폰 화면(흉내)"
        role="group"
      >
        <p className="meta">본인 폰 · 알림</p>
        <p className="text-[16px] font-semibold leading-[1.45]" style={{ color: 'var(--ink)' }}>
          {running && !st.cancelled ? '괜찮으세요?' : st.cancelled ? '확인했어요. 좋은 하루 보내세요.' : '알림 없음'}
        </p>
        <p className="text-[13.5px] leading-[1.55]" style={{ color: 'var(--ink-2)' }}>
          {running && !st.cancelled ? '평소 일어나실 시간이 한참 지났는데 움직임이 없어요. 괜찮으면 아래를 눌러 주세요.' : '영상·소리는 보내지 않습니다. 상태만 봅니다.'}
        </p>
        <button type="button" className="btn btn-primary disabled:opacity-45 disabled:cursor-not-allowed" onClick={() => setOkAt(elapsed)} disabled={!running || over}>
          괜찮아요
        </button>
      </div>

      <div className="grid gap-3 min-w-0">
        <ol className="list-none m-0 p-0 grid gap-2">
          {STAGES.map((s, i) => {
            const reached = running && st.stages.includes(s.stage);
            const now = running && !over && st.current === s.stage;
            const at = i === 0 ? 0 : i === 1 ? ladder.selfWaitMin : ladder.selfWaitMin + ladder.managerWaitMin;
            return (
              <li
                key={s.stage}
                className="pl-4 py-1 grid gap-0.5"
                style={{ borderLeft: now ? '3px solid var(--accent)' : reached ? '3px solid var(--ink-2)' : '1px solid var(--rule)' }}
                aria-current={now ? 'step' : undefined}
              >
                <p className="text-[15.5px] font-semibold" style={{ color: now ? 'var(--accent)' : 'var(--ink)' }}>
                  <span className="meta mr-2">+{at}분</span>
                  {s.who}
                  {reached && !now && <span className="meta ml-2">보냄</span>}
                  {now && <span className="meta ml-2" style={{ color: 'var(--accent)' }}>지금</span>}
                </p>
                <p className="text-[14px] leading-[1.55]" style={{ color: 'var(--ink-2)' }}>
                  {s.what}
                </p>
              </li>
            );
          })}
        </ol>
        <p className="text-[14px] leading-[1.6]" style={{ color: 'var(--ink)' }} role="status" aria-live="polite">
          {status}
        </p>
        {clock && (
          <p className="meta" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {clock}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-ghost" onClick={start}>
            {running ? '처음부터 다시' : '알림 울려 보기'}
          </button>
          {running && !over && (
            <button type="button" className="btn btn-ghost" onClick={() => setElapsed((e) => e + 5)}>
              5분 넘기기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
