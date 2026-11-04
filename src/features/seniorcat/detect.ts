import type { DetectedVisit, Elim, LevelShift, Sample } from './types';

// 무게 신호 → 방문(들어옴·머묾·나감)과 모래 무게 변화.
// 상태 기계: 쉬는 중 → (모래보다 1kg 이상 무거워짐) 방문 중 → (다시 모래 무게 근처로 내려와 안정) 쉬는 중.
// 고양이가 안에 있는 동안 소변이 고양이에서 모래로 옮겨 가도 총무게는 같으므로,
// 배설량은 "나온 뒤 안정된 모래 무게 − 들어가기 전 모래 무게"로 잰다.

/** 이만큼 무거워지면 고양이가 들어온 것(새끼 고양이는 대상이 아니다) */
export const ENTER_G = 1000;
/** 모래 무게에서 이 안쪽으로 내려오면 나간 것 */
const EXIT_G = 250;
/** 배설 없음으로 보는 모래 무게 변화(차낸 모래·잡음 포함) */
export const NONE_G = 6;
/** 소변 자세로 보는 "가만히 있는" 최소 시간 */
const STILL_URINE_S = 16;
/** 가만히 있다고 보는 흔들림(앞뒤 3초 중앙값과의 차이) */
const STILL_TOL_G = 30;
/** 청소·보충으로 보는 모래 무게 변화 */
const SHIFT_G = 60;

const median = (xs: number[]): number => {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/**
 * 가장 긴 "가만히 있는" 구간(초)·그 구간의 평균 무게, 그리고 "멈춤-힘주기" 사슬의 길이.
 * 사슬 = 4초 넘게 가만히 있는 구간이 4초 이내 간격으로 이어진 개수(대변 볼 때의 모양).
 */
export function longestStill(samples: Sample[]): { seconds: number; mean: number; runs: number } {
  const n = samples.length;
  // 앞뒤 3초(7개) 중앙값에서 크게 벗어나지 않으면 "가만히"
  const ok = samples.map((s, i) => Math.abs(s.w - median(samples.slice(Math.max(0, i - 3), i + 4).map((x) => x.w))) < STILL_TOL_G);
  // 잡음 한 번으로 구간이 끊기지 않게, 앞뒤가 가만히인 한 칸은 이어 준다
  for (let i = 1; i < n - 1; i++) if (!ok[i] && ok[i - 1] && ok[i + 1]) ok[i] = true;
  const segs: [number, number][] = [];
  let runStart = -1;
  for (let i = 0; i <= n; i++) {
    if (i < n && ok[i]) {
      if (runStart < 0) runStart = i;
      continue;
    }
    if (runStart >= 0 && i - runStart >= 4) segs.push([runStart, i]);
    runStart = -1;
  }
  let best = { seconds: 0, mean: 0 };
  for (const [a, b] of segs) {
    if (b - a > best.seconds) {
      const seg = samples.slice(a, b).map((x) => x.w);
      best = { seconds: b - a, mean: seg.reduce((x, y) => x + y, 0) / seg.length };
    }
  }
  let runs = 0;
  let chain = 0;
  segs.forEach(([a], k) => {
    chain = k > 0 && a - segs[k - 1][1] <= 4 ? chain + 1 : 1;
    runs = Math.max(runs, chain);
  });
  return { ...best, runs };
}

/**
 * 배설 종류 추정. 무게만으로는 소변과 대변의 양이 겹쳐서 자세(신호 모양)를 같이 본다.
 * 소변: 한 번 길게 가만히 있는다. 대변: 짧게 멈췄다 힘주기를 반복해 "가만히" 구간이 여러 번 끊긴다.
 */
export function classify(deltaG: number, stillS: number, runs: number): Elim {
  if (deltaG < NONE_G) return 'none';
  if (stillS >= STILL_URINE_S && (runs < 3 || stillS >= 30)) return 'urine';
  return 'feces';
}

export interface DetectResult {
  visits: DetectedVisit[];
  shifts: LevelShift[];
}

export function detectVisits(samples: Sample[]): DetectResult {
  const visits: DetectedVisit[] = [];
  const shifts: LevelShift[] = [];
  if (samples.length === 0) return { visits, shifts };

  let base = samples[0].w;
  // 모래 무게가 바뀐 것 같을 때 모아 두는 후보(청소·보충·증발)
  let pending: Sample[] = [];
  let i = 0;

  while (i < samples.length) {
    const s = samples[i];
    const ex = s.w - base;

    if (ex > ENTER_G) {
      // 들어온 시각: 조금 앞으로 돌아가 모래보다 무거워지기 시작한 첫 값
      let j = i;
      while (j > 0 && i - j < 5 && samples[j - 1].w - base > EXIT_G && samples[i].t - samples[j - 1].t < 6) j--;
      const startIdx = j;
      // 나간 시각: 모래 근처로 내려와 8초 동안 다시 올라가지 않은 첫 지점
      let exitIdx = -1;
      for (let k = i; k < samples.length && exitIdx < 0; k++) {
        if (samples[k].w - base >= EXIT_G) continue;
        let back = false;
        let m = k + 1;
        for (; m < samples.length && samples[m].t - samples[k].t <= 8; m++) {
          if (samples[m].w - base >= EXIT_G) back = true;
        }
        if (back) continue;
        if (samples[samples.length - 1].t - samples[k].t < 8) break; // 신호가 끝나 아직 모른다
        exitIdx = k;
      }
      if (exitIdx < 0) break; // 아직 안에 있다(신호 끝)
      // 나간 뒤 안정된 모래 무게: 나가는 순간의 걸음 2초를 빼고 그 뒤 15초의 중앙값
      const after: number[] = [];
      for (let m = exitIdx; m < samples.length && samples[m].t <= samples[exitIdx].t + 17; m++) {
        if (samples[m].t >= samples[exitIdx].t + 2) after.push(samples[m].w);
      }
      const post = after.length > 0 ? median(after) : samples[exitIdx].w;
      const inside = samples.slice(startIdx, exitIdx);
      const still = longestStill(inside.slice(2, -1));
      // 체중: 네 발이 다 올라간 "가만히" 구간이 길면 그 평균, 아니면 위쪽 절반의 중앙값
      let catW: number;
      if (still.seconds >= 8) catW = still.mean - base;
      else {
        const ws = inside.map((x) => x.w - base).sort((a, b) => a - b);
        catW = median(ws.slice(Math.floor(ws.length / 2)));
      }
      const start = samples[startIdx].t;
      const end = samples[exitIdx].t;
      const deltaG = post - base;
      visits.push({
        id: visits.length + 1,
        start,
        end,
        stayS: end - start,
        preG: base,
        postG: post,
        deltaG,
        catWeightG: catW,
        stillS: still.seconds,
        elim: classify(deltaG, still.seconds, still.runs),
      });
      base = post;
      pending = [];
      // 안정 구간을 건너뛴다
      i = exitIdx;
      while (i < samples.length && samples[i].t <= samples[exitIdx].t + 17) i++;
      continue;
    }

    // 쉬는 중: 작은 변화는 천천히 따라가고(증발·습기), 큰 변화가 안정되면 청소·보충으로 본다
    if (Math.abs(ex) <= 15) {
      base += 0.3 * ex;
      pending = [];
    } else {
      pending.push(s);
      const last = pending.slice(-8).map((x) => x.w);
      const span = pending[pending.length - 1].t - pending[0].t;
      const stable = last.length >= 2 && Math.max(...last) - Math.min(...last) < 20;
      // 1초 간격이면 8개, 10분 간격이면 2개가 안정돼야 받아들인다
      if (stable && (last.length >= 8 || (span >= 600 && last.length >= 2))) {
        const level = median(last);
        if (Math.abs(level - base) >= SHIFT_G) shifts.push({ t: pending[0].t, deltaG: level - base });
        base = level;
        pending = [];
      }
    }
    i++;
  }
  return { visits, shifts };
}
