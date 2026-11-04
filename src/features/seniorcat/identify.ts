import { type CatConfig, type CatId, type DetectedVisit, type Identified } from './types';

// 다묘 가정에서 "누가 다녀갔나"를 체중으로 가린다(연구 질문 1).
// 고양이마다 체중 분포(평균·분산)를 두고, 방문의 추정 체중이 어느 분포에서 나왔을 확률이 큰지 본다.
// - 처음 평균은 보호자가 등록한 체중, 이후엔 확실히 구분된 방문으로 천천히 따라간다(체중이 빠져도 놓치지 않게).
// - 머문 시간도 고양이마다 버릇이 달라 보조 특징으로 쓸 수 있다(선택). 소변 방문만, 충분히 모인 뒤에만 쓴다.
// - 가장 큰 확률이 기준(0.8)보다 낮으면 고양이를 정하지 않고 "구분 어려움"으로 둔다.

export const CONFIDENT = 0.8;
/** 방문마다 체중 추정의 흔들림(먹고 마신 양·자세) — 처음 분산 */
const INIT_SD_G = 70;
const MIN_SD_G = 35;
/** 확실한 방문으로 평균을 따라가는 속도 */
const ALPHA = 0.06;
/** 머문 시간 모델을 쓰기 시작하는 방문 수 */
const STAY_MIN_N = 15;

interface CatModel {
  id: CatId;
  mu: number;
  varG: number;
  n: number;
  logStay: number;
  logStayVar: number;
  stayN: number;
}

const gauss = (x: number, mu: number, v: number): number => Math.exp(-((x - mu) ** 2) / (2 * v)) / Math.sqrt(2 * Math.PI * v);

export interface IdentifyOptions {
  useStay: boolean;
  /** 측정 잡음(g) — 분산에 더한다 */
  noiseG: number;
}

export function emptyProbs(): Record<CatId, number> {
  return { A: 0, B: 0, C: 0 };
}

export function identify(visits: DetectedVisit[], cats: CatConfig[], opts: IdentifyOptions): Identified[] {
  const models: CatModel[] = cats.map((c) => ({ id: c.id, mu: c.weightG, varG: INIT_SD_G ** 2, n: 0, logStay: 0, logStayVar: 0.1, stayN: 0 }));
  const out: Identified[] = [];

  for (const v of visits) {
    const probs = emptyProbs();
    const logStay = Math.log(Math.max(5, v.stayS));
    const like = models.map((m) => {
      const varTotal = m.varG + opts.noiseG ** 2;
      let l = gauss(v.catWeightG, m.mu, varTotal);
      if (opts.useStay && v.elim === 'urine' && m.stayN >= STAY_MIN_N) l *= gauss(logStay, m.logStay, Math.max(0.02, m.logStayVar));
      return l;
    });
    // 어느 고양이와도 4 표준편차 넘게 떨어지면 등록되지 않은 무게(사람 손·다른 동물·물건)
    const unknown = models.every((m) => Math.abs(v.catWeightG - m.mu) > 4 * Math.sqrt(m.varG + opts.noiseG ** 2));
    const sum = like.reduce((a, b) => a + b, 0);
    let bestIdx = -1;
    if (!unknown && sum > 0) {
      models.forEach((m, i) => {
        probs[m.id] = like[i] / sum;
      });
      bestIdx = like.indexOf(Math.max(...like));
    }
    const confidence = bestIdx >= 0 ? probs[models[bestIdx].id] : 0;
    const catId = bestIdx >= 0 && confidence >= CONFIDENT ? models[bestIdx].id : null;

    if (catId) {
      const m = models[bestIdx];
      const r = v.catWeightG - m.mu;
      m.mu += ALPHA * r;
      m.varG = Math.max(MIN_SD_G ** 2, (1 - ALPHA) * m.varG + ALPHA * r * r);
      m.n += 1;
    }
    // 머문 시간은 소변 방문끼리만 비교한다(대변은 원래 길어서 섞으면 오히려 헷갈린다)
    if (catId && v.elim === 'urine') {
      const m = models[bestIdx];
      if (m.stayN === 0) m.logStay = logStay;
      const a = m.stayN < STAY_MIN_N ? 1 / (m.stayN + 1) : 0.05;
      const d = logStay - m.logStay;
      m.logStay += a * d;
      m.logStayVar = m.stayN === 0 ? 0.1 : (1 - a) * m.logStayVar + a * d * d;
      m.stayN += 1;
    }

    out.push({ ...v, probs, catId, bestId: bestIdx >= 0 ? models[bestIdx].id : null, confidence, unknown });
  }
  return out;
}

/** 두 고양이의 등록 체중이 이만큼 가까우면 미리 경고한다(방문마다 흔들림 약 ±70g 가정) */
export function closePairs(cats: CatConfig[], within = 300): [CatConfig, CatConfig][] {
  const pairs: [CatConfig, CatConfig][] = [];
  for (let i = 0; i < cats.length; i++) {
    for (let j = i + 1; j < cats.length; j++) {
      if (Math.abs(cats[i].weightG - cats[j].weightG) < within) pairs.push([cats[i], cats[j]]);
    }
  }
  return pairs;
}
