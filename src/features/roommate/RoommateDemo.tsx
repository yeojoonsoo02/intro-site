'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SLOTS, SLOT_LABEL, type Mistake, type RoommateReply, type Slot, type Turn } from './types';
import {
  INTERESTS,
  MAX_CHAT_TURNS,
  closingLine,
  findMistakes,
  isCorrect,
  nextDue,
  openingLine,
  quizQuestion,
  scriptedReply,
  type InterestId,
} from './script';
import { addMistakes, clearState, dueToday, initialState, loadState, saveState, type DemoState } from './memory';
import { useSpeech } from './useSpeech';
import { DeviceFace, MemoryList, Toggle, type Phase } from './DemoParts';

// 가상 기기: 센서 토글(레이더·폰 근접·시간대)이 조건을 채우면 기기가 먼저 말을 건다.
// 대화 중 틀린 표현은 기억(localStorage)에 쌓이고, 다음 날 아침·오늘 밤에 기기가 그걸로 먼저 묻는다.

type TriggerMode = 'both' | 'radar' | 'phone' | 'schedule';

const TRIGGERS: { id: TriggerMode; label: string; reason: string }[] = [
  { id: 'both', label: '폰 근접 + 레이더 (기본)', reason: '폰이 가까이 있고(BLE) 레이더가 사람을 감지함' },
  { id: 'radar', label: '레이더만', reason: '레이더가 사람을 감지함 — 누구인지는 모름' },
  { id: 'phone', label: '폰 근접만', reason: '폰이 가까이 있음 — 실제로 방에 있는지는 모름' },
  { id: 'schedule', label: '정해진 시간만', reason: '정해진 시간이 됨 — 사람이 있는지 확인하지 않음' },
];

interface LogEntry {
  id: number;
  who: Turn['who'] | 'note';
  text: string;
}

interface Session {
  id: number;
  slot: Slot;
  kind: 'quiz' | 'chat';
  /** 남은 퀴즈(기억 id) */
  quiz: string[];
  /** 퀴즈가 끝나면 대화로 넘어갈지(아침), 끝낼지(밤) */
  afterQuiz: 'chat' | 'end';
  chatTurns: number;
  saved: number;
}

/** 하루에 먼저 말을 거는 최대 횟수(다시 말 걸기 포함) — 귀찮음 대응 */
const DAILY_CAP = 5;
/** "나중에" 뒤 다시 말 걸 때까지(데모용으로 짧게) */
const RETRY_MS = 20_000;
/** 같은 시간대에 "나중에"가 이만큼 쌓이면 그 시간대엔 먼저 말 걸지 않는다 */
const LEARN_AFTER = 2;

const LISTEN_ERRORS: Record<string, string> = {
  'not-allowed': '마이크 권한이 막혀 있습니다. 아래 칸에 글로 입력해도 됩니다.',
  'service-not-allowed': '이 브라우저에서는 음성 인식을 쓸 수 없습니다. 글로 입력해 주세요.',
  'no-speech': '아무 말도 듣지 못했습니다. 다시 말하기를 누르거나 글로 입력하세요.',
  'audio-capture': '마이크를 찾지 못했습니다. 글로 입력해 주세요.',
  network: '음성 인식 서버에 닿지 못했습니다. 글로 입력해 주세요.',
};

function useSynced<T>(initial: T): [T, (next: T | ((prev: T) => T)) => void, React.MutableRefObject<T>] {
  const [value, setValue] = useState<T>(initial);
  const ref = useRef<T>(initial);
  const set = useCallback((next: T | ((prev: T) => T)) => {
    const v = typeof next === 'function' ? (next as (prev: T) => T)(ref.current) : next;
    ref.current = v;
    setValue(v);
  }, []);
  return [value, set, ref];
}

export default function RoommateDemo(): JSX.Element {
  const speech = useSpeech();
  const [demo, setDemo, demoRef] = useSynced<DemoState>(initialState());
  const [session, setSession, sessionRef] = useSynced<Session | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [log, setLog, logRef] = useSynced<LogEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [llm, setLlm] = useState(false);

  const [radar, setRadar] = useState(false);
  const [phone, setPhone] = useState(false);
  const [slot, setSlot] = useState<Slot>('morning');
  const [trigger, setTrigger] = useState<TriggerMode>('both');
  const [interest, setInterest] = useState<InterestId>('coding');
  const [soundOn, setSoundOn] = useState(true);
  const [draft, setDraft] = useState('');
  const [retryKey, setRetryKey] = useState<string | null>(null);
  const [retryWaiting, setRetryWaiting] = useState(false);

  const counter = useRef(0);
  // 소리는 방문자가 데모를 한 번 누르거나 키를 친 뒤부터 낸다(브라우저가 사용자 동작 없는 재생을 막고, 갑자기 소리가 나면 놀란다)
  const userActed = useRef(false);
  const [showcase, setShowcase] = useState(false);
  const showcaseDone = useRef(false);
  const logId = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const logBoxRef = useRef<HTMLOListElement>(null);

  // 기억은 마운트 뒤에 읽는다(서버 HTML과 첫 화면을 맞추기 위해).
  useEffect(() => {
    setDemo(loadState());
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 때 한 번, 저장소에서 읽은 뒤 저장을 켠다
    setLoaded(true);
  }, [setDemo]);

  useEffect(() => {
    if (loaded) saveState(demo);
  }, [demo, loaded]);

  // 서버에 LLM 키가 있는지만 묻는다. 실패하면 대본 모드.
  useEffect(() => {
    const ctrl = new AbortController();
    fetch('/api/roommate', { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { llm?: boolean } | null) => setLlm(Boolean(j?.llm)))
      .catch(() => setLlm(false));
    return () => ctrl.abort();
  }, []);

  useEffect(() => {
    const box = logBoxRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [log]);

  const note = useCallback(
    (text: string) => setLog((l) => [...l, { id: ++logId.current, who: 'note' as const, text }].slice(-60)),
    [setLog],
  );

  const endSession = useCallback(() => {
    counter.current++;
    setSession(null);
    setPhase('idle');
  }, [setSession]);

  const { speak, cancelSpeech, stopListening } = speech;

  /** 기기가 한 줄 말한다. 다 말하면 대답을 기다린다(마이크는 꺼진 채). end면 세션을 닫는다. */
  const say = useCallback(
    async (text: string, id: number, end = false) => {
      setLog((l) => [...l, { id: ++logId.current, who: 'device' as const, text }].slice(-60));
      if (soundOn && speech.canSpeak && userActed.current) {
        setPhase('speaking');
        await speak(text);
      }
      if (counter.current !== id) return;
      if (end) {
        endSession();
        note('대화 끝 — 기기가 다시 조용해집니다.');
      } else {
        setPhase('awaiting');
      }
    },
    [soundOn, speech.canSpeak, speak, endSession, note, setLog],
  );

  const startSession = useCallback(
    (s: Slot, reason: string, manual: boolean) => {
      const id = ++counter.current;
      const d = demoRef.current;
      const key = `${d.day}:${s}`;
      if (!manual) {
        setDemo((prev) => ({ ...prev, started: [...prev.started, key] }));
        setRetryKey(null);
      }

      let quiz: Mistake[] = [];
      if (s === 'morning') quiz = dueToday(d.memory, d.day).slice(0, 1);
      if (s === 'night') {
        const today = d.memory.filter((m) => m.addedDay === d.day);
        quiz = (today.length > 0 ? today : dueToday(d.memory, d.day)).slice(0, 3);
      }

      const next: Session = {
        id,
        slot: s,
        kind: quiz.length > 0 ? 'quiz' : 'chat',
        quiz: quiz.map((m) => m.id),
        afterQuiz: s === 'morning' ? 'chat' : 'end',
        chatTurns: 0,
        saved: 0,
      };
      setSession(next);
      note(`${manual ? '직접 시작' : '먼저 말 걸기'} — ${SLOT_LABEL[s].name} ${SLOT_LABEL[s].time} · ${reason}`);
      const nothingTonight = s === 'night' && quiz.length === 0;
      void say(openingLine(s, interest, quiz[0] ?? null), id, nothingTonight);
    },
    [demoRef, setDemo, setSession, note, say, interest],
  );

  // 조건이 맞으면 먼저 말을 건다.
  const conditionMet =
    trigger === 'both' ? radar && phone : trigger === 'radar' ? radar : trigger === 'phone' ? phone : true;
  const slotKey = `${demo.day}:${slot}`;
  const startsToday = demo.started.filter((k) => k.startsWith(`${demo.day}:`)).length;
  const learnedQuiet = demo.deferrals[slot] >= LEARN_AFTER;
  const alreadyTalked = demo.started.includes(slotKey) && retryKey !== slotKey;
  const waitingRetry = retryKey === slotKey && retryWaiting;

  useEffect(() => {
    if (!loaded || session || phase !== 'idle' || !conditionMet) return;
    if (alreadyTalked || learnedQuiet || startsToday >= DAILY_CAP || waitingRetry) return;
    const reason = TRIGGERS.find((t) => t.id === trigger)?.reason ?? '';
    // 센서(가상) 상태가 바뀐 결과로 기기가 말을 시작한다 — 위 조건들이 한 번만 통과시킨다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    startSession(slot, retryKey === slotKey ? `다시 말 걸기 · ${reason}` : reason, false);
  }, [
    loaded, session, phase, conditionMet, alreadyTalked, learnedQuiet, startsToday, waitingRetry,
    retryKey, slotKey, trigger, slot, startSession,
  ]);

  // 예시 자동 실행: 처음 열면 레이더·폰 근접을 켜 둔다 → 위 효과가 기기의 첫마디를 글로 띄운다.
  // 오늘 이 시간대엔 이미 말을 걸었거나(기억이 남은 재방문) 상한에 닿았으면 직접 시작으로 한 번 보여 준다.
  useEffect(() => {
    if (!loaded || showcaseDone.current) return;
    showcaseDone.current = true;
    const d = demoRef.current;
    const blocked =
      d.started.includes(`${d.day}:${slot}`) ||
      d.deferrals[slot] >= LEARN_AFTER ||
      d.started.filter((k) => k.startsWith(`${d.day}:`)).length >= DAILY_CAP;
    setRadar(true);
    setPhone(true);
    setShowcase(true);
    if (blocked) startSession(slot, '예시 자동 실행', true);
  }, [loaded, demoRef, slot, startSession]);

  /** 시간대·날짜가 바뀌면 진행 중인 대화를 끊는다(바꾸는 핸들러에서 부른다). */
  function interrupt(): void {
    if (!sessionRef.current) return;
    cancelSpeech();
    stopListening();
    endSession();
  }

  function changeSlot(s: Slot): void {
    if (s === slot) return;
    interrupt();
    setSlot(s);
  }

  useEffect(() => () => cancelSpeech(), [cancelSpeech]);

  const history = (): Turn[] =>
    logRef.current
      .filter((e): e is LogEntry & { who: Turn['who'] } => e.who !== 'note')
      .slice(-6)
      .map((e) => ({ who: e.who, text: e.text }));

  async function chatReply(text: string): Promise<RoommateReply> {
    if (llm) {
      try {
        const res = await fetch('/api/roommate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text.slice(0, 300), slot, history: history().slice(0, -1) }),
          signal: AbortSignal.timeout(20_000),
        });
        if (res.ok) return (await res.json()) as RoommateReply;
        note(res.status === 429 ? 'LLM 사용 한도에 닿아 이번 답은 대본으로 합니다.' : 'LLM 응답 실패 — 이번 답은 대본으로 합니다.');
      } catch {
        note('LLM 응답 실패 — 이번 답은 대본으로 합니다.');
      }
    }
    const mistakes = findMistakes(text);
    const turns = sessionRef.current?.chatTurns ?? 0;
    return { reply: scriptedReply(turns, mistakes), mistakes };
  }

  async function handleAnswer(raw: string): Promise<void> {
    const text = raw.trim().slice(0, 300);
    if (!text) return;
    let s = sessionRef.current;
    if (!s) {
      s = { id: ++counter.current, slot, kind: 'chat', quiz: [], afterQuiz: 'end', chatTurns: 0, saved: 0 };
      setSession(s);
      note(`직접 시작 — ${SLOT_LABEL[slot].name} 대화`);
    }
    const id = s.id;
    setLog((l) => [...l, { id: ++logId.current, who: 'me' as const, text }].slice(-60));

    if (s.kind === 'quiz') {
      const d = demoRef.current;
      const item = d.memory.find((m) => m.id === s.quiz[0]);
      const rest = s.quiz.slice(1);
      let line = '';
      if (item) {
        const ok = isCorrect(text, item.right);
        const box = ok ? item.box + 1 : 0;
        setDemo((prev) => ({
          ...prev,
          memory: prev.memory.map((m) =>
            m.id === item.id ? { ...m, box, hits: m.hits + (ok ? 1 : 0), dueDay: ok ? nextDue(box, prev.day) : prev.day + 1 } : m,
          ),
        }));
        line = ok ? `Exactly! "${item.right}."` : `Close! We say "${item.right}." I'll ask you again tomorrow.`;
      }
      const nextItem = rest.length > 0 ? d.memory.find((m) => m.id === rest[0]) : undefined;
      if (nextItem) {
        setSession({ ...s, quiz: rest });
        await say(`${line} Next: ${quizQuestion(nextItem)}`, id);
      } else if (s.afterQuiz === 'chat') {
        setSession({ ...s, quiz: [], kind: 'chat' });
        await say(`${line} So, what's your plan for today?`, id);
      } else {
        await say(`${line} That's all for today. Good night!`, id, true);
      }
      return;
    }

    setPhase('thinking');
    const { reply, mistakes } = await chatReply(text);
    if (counter.current !== id) return;
    const { memory, added } = addMistakes(demoRef.current.memory, mistakes, demoRef.current.day);
    if (added > 0) {
      setDemo((prev) => ({ ...prev, memory }));
      note(`기억에 추가: ${mistakes.slice(0, added).map((m) => `"${m.wrong}" → "${m.right}"`).join(', ')} — 내일부터 다시 묻습니다.`);
    }
    const turns = s.chatTurns + 1;
    const saved = s.saved + added;
    if (turns >= MAX_CHAT_TURNS) {
      await say(`${reply} ${closingLine(saved)}`, id, true);
    } else {
      setSession({ ...s, chatTurns: turns, saved });
      await say(reply, id);
    }
  }

  async function onTalk(): Promise<void> {
    if (phase === 'listening') {
      stopListening();
      return;
    }
    if (!sessionRef.current) {
      startSession(slot, '말하기 버튼', true);
      return;
    }
    cancelSpeech();
    if (!speech.canListen) {
      setPhase('awaiting');
      inputRef.current?.focus();
      note('이 브라우저에는 음성 인식이 없어 글로 입력합니다.');
      return;
    }
    const id = sessionRef.current.id;
    setPhase('listening');
    const r = await speech.listen();
    if (counter.current !== id) return;
    if (r.text) {
      await handleAnswer(r.text);
    } else {
      setPhase('awaiting');
      note(LISTEN_ERRORS[r.error ?? ''] ?? `음성 인식 실패(${r.error ?? '알 수 없음'}) — 글로 입력해도 됩니다.`);
    }
  }

  function onLater(): void {
    const s = sessionRef.current;
    if (!s) return;
    cancelSpeech();
    stopListening();
    endSession();
    const count = demoRef.current.deferrals[s.slot] + 1;
    setDemo((prev) => ({ ...prev, deferrals: { ...prev.deferrals, [s.slot]: count } }));
    if (count >= LEARN_AFTER) {
      note(
        `${SLOT_LABEL[s.slot].name}에 "나중에"가 ${count}번 — 이 시간대엔 이제 먼저 말 걸지 않습니다. 말하기 버튼으로는 언제든 시작할 수 있습니다.`,
      );
      return;
    }
    note('알겠어요. 데모에선 20초 뒤, 아직 조건이 맞으면 다시 말을 겁니다(실제 기기는 몇십 분 뒤 · 추정).');
    setRetryKey(`${demoRef.current.day}:${s.slot}`);
    setRetryWaiting(true);
  }

  // "나중에" 뒤 다시 말 걸 시각에 한 번 깨운다.
  useEffect(() => {
    if (!retryWaiting) return;
    const t = window.setTimeout(() => setRetryWaiting(false), RETRY_MS);
    return () => window.clearTimeout(t);
  }, [retryWaiting]);

  function nextDay(): void {
    interrupt();
    setDemo((prev) => ({ ...prev, day: prev.day + 1 }));
    setRetryKey(null);
    setRetryWaiting(false);
    note(`하루가 지났습니다 → ${demoRef.current.day}일째. 복습할 차례가 된 표현은 아침에 다시 묻습니다.`);
  }

  function resetAll(): void {
    cancelSpeech();
    stopListening();
    endSession();
    clearState();
    setDemo(initialState());
    setLog([]);
    setRetryKey(null);
    setRetryWaiting(false);
  }

  function onSubmit(e: React.FormEvent): void {
    e.preventDefault();
    const text = draft;
    setDraft('');
    cancelSpeech();
    void handleAnswer(text);
  }

  const status = !conditionMet
    ? trigger === 'both'
      ? `조건 안 됨 — ${!radar && !phone ? '레이더·폰 둘 다' : !radar ? '레이더 감지' : '폰 근접'}가 꺼져 있어 기다립니다.`
      : '조건 안 됨 — 기다립니다.'
    : session
      ? '대화 중'
      : learnedQuiet
        ? `${SLOT_LABEL[slot].name}엔 "나중에"가 잦아 먼저 말 걸지 않습니다(배운 결과).`
        : startsToday >= DAILY_CAP
          ? `오늘은 이미 ${startsToday}번 말을 걸었습니다(하루 상한 ${DAILY_CAP}번).`
          : waitingRetry
            ? '"나중에" — 잠시 뒤 다시 말을 겁니다.'
            : alreadyTalked
              ? `오늘 ${SLOT_LABEL[slot].name}엔 이미 말을 걸었습니다. 다른 시간대를 고르거나 하루를 넘겨 보세요.`
              : '조건 충족';
  const due = dueToday(demo.memory, demo.day).length;
  const busy = phase === 'thinking';
  const lastDeviceLine = [...log].reverse().find((e) => e.who === 'device')?.text ?? '';

  const markActed = (): void => {
    userActed.current = true;
  };

  return (
    <div className="grid gap-10 md:grid-cols-[300px_minmax(0,1fr)] md:gap-12" onPointerDownCapture={markActed} onKeyDownCapture={markActed}>
      {showcase && (
        <p className="md:col-span-2 m-0 text-[13.5px] leading-[1.6] pl-3" style={{ color: 'var(--ink-2)', borderLeft: '3px solid var(--accent)' }}>
          예시 자동 실행됨 · 레이더와 폰 근접을 켜 둔 상태로 시작해 기기가 먼저 말을 걸었습니다
          {lastDeviceLine && (
            <>
              : <q lang="en" className="font-semibold" style={{ color: 'var(--ink)' }}>{lastDeviceLine}</q>
            </>
          )}
          . 소리는 화면을 한 번 누른 뒤부터 나옵니다.{' '}
          <button
            type="button"
            className="link-u font-semibold"
            style={{ color: 'var(--accent)' }}
            onClick={() => {
              interrupt();
              setRadar(false);
              setPhone(false);
              setShowcase(false);
            }}
          >
            센서 끄고 직접 해 보기
          </button>
        </p>
      )}
      {/* 왼쪽: 센서 시뮬레이션 + 기기 */}
      <div className="grid gap-8 content-start">
        <fieldset className="m-0 p-0 border-0 min-w-0">
          <legend className="meta mb-2">센서 (시뮬레이션)</legend>
          <Toggle id="sense-radar" label="사람 감지 (레이더)" hint="방에 실제로 사람이 있는지" checked={radar} onChange={setRadar} />
          <Toggle id="sense-phone" label="폰 근접 (BLE)" hint="내 폰이 기기 근처에 들어왔는지 — 누가 왔는지" checked={phone} onChange={setPhone} />
        </fieldset>

        <fieldset className="m-0 p-0 border-0 min-w-0">
          <legend className="meta mb-2">시간대</legend>
          <div className="grid grid-cols-4 gap-1.5">
            {SLOTS.map((s) => (
              <label key={s} className="relative block">
                <input
                  type="radio"
                  name="slot"
                  value={s}
                  checked={slot === s}
                  onChange={() => changeSlot(s)}
                  className="peer sr-only"
                />
                <span
                  className="flex flex-col items-center justify-center min-h-[52px] rounded-[var(--r-md)] text-[14px] font-semibold cursor-pointer peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2"
                  style={{
                    border: `1px solid ${slot === s ? 'var(--accent)' : 'var(--rule)'}`,
                    background: slot === s ? 'var(--accent-soft)' : 'var(--surface)',
                    color: slot === s ? 'var(--accent)' : 'var(--ink)',
                    outlineColor: 'var(--accent)',
                  }}
                >
                  {SLOT_LABEL[s].name}
                  <span className="meta" style={{ fontSize: '11.5px' }}>{SLOT_LABEL[s].time}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* 가상 기기 — 좁은 화면에선 대화 목록이 아래로 밀리므로 기기가 방금 한 말을 여기에도 보여 준다 */}
        <section
          aria-labelledby="device-title"
          className="p-5 rounded-[var(--r-lg)] grid gap-4"
          style={{ background: 'var(--surface)', border: '1px solid var(--rule)', boxShadow: 'var(--shadow)' }}
        >
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="device-title" className="text-[17px] font-semibold" style={{ color: 'var(--ink)' }}>
              가상 기기
            </h2>
            <span className="meta">{demo.day}일째</span>
          </div>
          <DeviceFace phase={phase} />
          {lastDeviceLine && session && (
            <p
              lang="en"
              aria-hidden="true"
              className="text-[15px] leading-[1.55] px-3 py-2 rounded-[var(--r-md)]"
              style={{ background: 'var(--surface-2)', color: 'var(--ink)', borderLeft: '3px solid var(--accent)' }}
            >
              {lastDeviceLine}
            </p>
          )}
          <p className="text-[13.5px] leading-[1.55] pl-3" style={{ color: 'var(--ink-2)', borderLeft: '2px solid var(--rule)' }} role="status">
            {status}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => void onTalk()}
              disabled={busy}
              aria-pressed={phase === 'listening'}
            >
              {phase === 'listening' ? '그만 듣기' : '말하기'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onLater} disabled={!session}>
              나중에
            </button>
          </div>
          <Toggle
            id="sound"
            label="소리로 읽기"
            hint={speech.canSpeak ? '기기의 말을 브라우저 음성으로 읽습니다' : '이 브라우저는 음성 출력을 지원하지 않습니다'}
            checked={soundOn && speech.canSpeak}
            onChange={setSoundOn}
          />
        </section>

        <div className="grid gap-3">
          <label className="grid gap-1">
            <span className="meta">먼저 말 거는 조건</span>
            <select value={trigger} onChange={(e) => setTrigger(e.target.value as TriggerMode)}>
              {TRIGGERS.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="meta">관심사 (점심 브리핑)</span>
            <select value={interest} onChange={(e) => setInterest(e.target.value as InterestId)}>
              {INTERESTS.map((i) => (
                <option key={i.id} value={i.id}>{i.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-2">
          <p className="meta">시뮬레이션</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-ghost" onClick={nextDay}>
              하루 넘기기
            </button>
            <button type="button" className="btn btn-ghost" onClick={resetAll}>
              처음부터
            </button>
          </div>
        </div>
      </div>

      {/* 오른쪽: 대화 + 기억 */}
      <div className="grid gap-10 content-start min-w-0">
        <section aria-labelledby="talk-title" className="grid gap-3 min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 id="talk-title" className="text-[20px] font-semibold" style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em', color: 'var(--ink)' }}>
              대화
            </h2>
            <span className="meta" style={{ color: llm ? 'var(--accent)' : 'var(--muted)' }}>
              {llm ? 'LLM 모드 · Claude Haiku' : '대본 모드 · LLM 키 없음'}
            </span>
          </div>
          <ol
            ref={logBoxRef}
            aria-live="polite"
            aria-label="기기와의 대화"
            className="list-none m-0 p-4 grid gap-3 content-start overflow-y-auto scrollbar-thin rounded-[var(--r-lg)] h-[360px] sm:h-[420px]"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--rule)' }}
          >
            {log.length === 0 && (
              <li className="text-[15px] leading-[1.65]" style={{ color: 'var(--muted)' }}>
                왼쪽에서 <b>사람 감지</b>와 <b>폰 근접</b>을 켜 보세요. 기기가 먼저 말을 겁니다. 아침에는 어제 틀린 표현(&ldquo;I&apos;m running
                late&rdquo;)부터 묻습니다.
              </li>
            )}
            {log.map((e) =>
              e.who === 'note' ? (
                <li key={e.id} className="meta leading-[1.6]">
                  {e.text}
                </li>
              ) : (
                <li
                  key={e.id}
                  lang={e.who === 'device' ? 'en' : undefined}
                  className={`max-w-[88%] px-4 py-2.5 text-[15.5px] leading-[1.55] ${e.who === 'me' ? 'justify-self-end rounded-[18px_18px_6px_18px] font-semibold' : 'justify-self-start rounded-[18px_18px_18px_6px]'}`}
                  style={
                    e.who === 'device'
                      ? { background: 'var(--surface)', color: 'var(--ink)', border: '1px solid var(--rule)', fontFamily: 'var(--font-bubble, inherit)' }
                      : { background: 'var(--accent)', color: 'var(--accent-contrast)', fontFamily: 'var(--font-bubble, inherit)' }
                  }
                >
                  <span className="sr-only">{e.who === 'device' ? '기기: ' : '나: '}</span>
                  {e.text}
                </li>
              ),
            )}
          </ol>
          <form onSubmit={onSubmit} className="flex gap-2">
            <label htmlFor="answer" className="sr-only">
              영어로 대답 입력
            </label>
            <input
              id="answer"
              ref={inputRef}
              lang="en"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={300}
              autoComplete="off"
              placeholder="영어로 입력 (예: I'm boring today)"
              className="flex-1 min-w-0"
            />
            <button type="submit" className="btn btn-primary shrink-0" disabled={busy || !draft.trim()}>
              보내기
            </button>
          </form>
          {!speech.canListen && loaded && (
            <p className="text-[13.5px]" style={{ color: 'var(--muted)' }}>
              이 브라우저는 음성 인식을 지원하지 않아 글로만 대답합니다(크롬·엣지·사파리에서는 말로도 됩니다).
            </p>
          )}
        </section>

        <section aria-labelledby="memory-title" className="grid gap-3 min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 id="memory-title" className="text-[20px] font-semibold" style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em', color: 'var(--ink)' }}>
              기억 — 다시 물을 표현
            </h2>
            <span className="meta">
              {demo.memory.length}개 · 오늘 복습 {due}개
            </span>
          </div>
          <p className="text-[14px] leading-[1.6]" style={{ color: 'var(--ink-2)' }}>
            맞히면 간격이 1 → 2 → 4 → 7일로 늘고, 틀리면 다음 날 다시 묻습니다. 이 기억은 이 브라우저에만 저장됩니다.
          </p>
          <MemoryList memory={demo.memory} day={demo.day} />
        </section>
      </div>
    </div>
  );
}
