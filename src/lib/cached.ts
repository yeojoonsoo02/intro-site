// 서버 메모리 TTL 캐시. 챗봇 컨텍스트·/about 데이터처럼 "외부 호출 결과를 몇 분 들고
// 있다가 갱신"하는 곳이 다섯 군데 있었고 전부 같은 모양이었다: 값 + 만료 시각 +
// 동시 요청 합치기 + 실패 시 직전 값을 짧게 유지. 여기 한 번만 둔다.
//
// 만료 시각으로 관리한다(값의 truthy 여부로 판정하면 빈 문자열·빈 배열 결과가
// 캐시되지 않아 매 요청이 외부로 나간다).

interface CachedOptions {
  /** 정상 결과 유지 시간(ms) */
  ttl: number;
  /** 실패 시 직전 값(없으면 fallback)을 유지하며 재시도를 미루는 시간(ms) */
  errorTtl: number;
  /** 로그에 찍을 이름 */
  name: string;
}

export function cached<T>(load: () => Promise<T>, fallback: T, opts: CachedOptions): () => Promise<T> {
  let value: T = fallback;
  let expiry = 0;
  let inflight: Promise<T> | null = null;

  return async () => {
    if (Date.now() < expiry) return value;
    if (inflight) return inflight;
    inflight = (async () => {
      try {
        value = await load();
        expiry = Date.now() + opts.ttl;
      } catch (err) {
        // 장애 중에 매 요청이 외부로 나가는 것을 막되, 복구는 errorTtl 안에 다시 시도한다.
        console.error(`[${opts.name}] load failed, holding previous value:`, err);
        expiry = Date.now() + opts.errorTtl;
      } finally {
        inflight = null;
      }
      return value;
    })();
    return inflight;
  };
}

/** 키(언어 등)별로 독립된 캐시 항목을 갖는 변형. */
export function cachedByKey<K, T>(
  load: (key: K) => Promise<T>,
  fallback: (key: K) => T,
  opts: CachedOptions,
): (key: K) => Promise<T> {
  const entries = new Map<K, () => Promise<T>>();
  return (key) => {
    let entry = entries.get(key);
    if (!entry) {
      entry = cached(() => load(key), fallback(key), opts);
      entries.set(key, entry);
    }
    return entry();
  };
}
