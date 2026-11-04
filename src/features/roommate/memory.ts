import type { Mistake, Slot } from './types';
import { sampleMemory } from './script';

// 가상 기기의 기억은 이 브라우저의 localStorage에만 둔다(서버에 저장하지 않음).
// 사생활 보호 창·차단된 저장소에서는 접근이 예외를 던질 수 있어 읽기·쓰기를 전부 try/catch로 감싼다.
// 저장이 안 되면 새로고침할 때 기억이 처음으로 돌아갈 뿐 데모는 그대로 돈다.

const KEY = 'english-roommate-demo:v1';

export interface DemoState {
  /** 시뮬레이션 일차. "하루 넘기기"로 늘어난다 */
  day: number;
  memory: Mistake[];
  /** 시간대별 "나중에" 누른 횟수 — 기기가 말 걸 때를 배우는 재료 */
  deferrals: Record<Slot, number>;
  /** 오늘 먼저 말을 건 시간대(`${day}:${slot}`) — 같은 시간대에 두 번 말 걸지 않는다 */
  started: string[];
}

export function initialState(): DemoState {
  return {
    day: 1,
    memory: sampleMemory(),
    deferrals: { morning: 0, noon: 0, evening: 0, night: 0 },
    started: [],
  };
}

function isMistake(v: unknown): v is Mistake {
  if (!v || typeof v !== 'object') return false;
  const m = v as Record<string, unknown>;
  return (
    typeof m.id === 'string' &&
    typeof m.wrong === 'string' &&
    typeof m.right === 'string' &&
    typeof m.ko === 'string' &&
    typeof m.box === 'number' &&
    typeof m.dueDay === 'number' &&
    typeof m.addedDay === 'number'
  );
}

export function loadState(): DemoState {
  const base = initialState();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return base;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return base;
    const p = parsed as Partial<DemoState>;
    return {
      day: typeof p.day === 'number' && p.day >= 1 ? Math.floor(p.day) : base.day,
      memory: Array.isArray(p.memory)
        ? p.memory.filter(isMistake).map((m) => ({ ...m, hits: typeof m.hits === 'number' ? m.hits : 0 })).slice(0, 50)
        : base.memory,
      deferrals: { ...base.deferrals, ...(p.deferrals ?? {}) },
      started: Array.isArray(p.started) ? p.started.filter((s): s is string => typeof s === 'string') : [],
    };
  } catch {
    return base;
  }
}

export function saveState(state: DemoState): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // 저장소를 못 쓰는 환경 — 화면 상태로만 돈다.
  }
}

export function clearState(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // 위와 같음
  }
}

/** 오늘 복습할 차례가 된 표현(오래된 것부터). */
export function dueToday(memory: Mistake[], day: number): Mistake[] {
  return memory.filter((m) => m.dueDay <= day).sort((a, b) => a.dueDay - b.dueDay || a.addedDay - b.addedDay);
}

/** 같은 표현이 이미 있으면 새로 넣지 않는다(정답 기준). */
export function addMistakes(
  memory: Mistake[],
  found: Pick<Mistake, 'wrong' | 'right' | 'ko' | 'hint'>[],
  day: number,
): { memory: Mistake[]; added: number } {
  const known = new Set(memory.map((m) => m.right.toLowerCase()));
  const fresh: Mistake[] = [];
  for (const f of found) {
    const key = f.right.toLowerCase();
    if (known.has(key)) continue;
    known.add(key);
    fresh.push({
      id: `${day}-${Date.now().toString(36)}-${fresh.length}`,
      wrong: f.wrong,
      right: f.right,
      ko: f.ko,
      ...(f.hint ? { hint: f.hint } : {}),
      addedDay: day,
      box: 0,
      dueDay: day + 1,
      hits: 0,
    });
  }
  return { memory: [...fresh, ...memory].slice(0, 50), added: fresh.length };
}
