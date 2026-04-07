import { adminDb, FieldValue } from './firebaseAdmin';

const RATE_LIMIT_MAX_GUEST = 5;
const RATE_LIMIT_MAX_USER = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const DAILY_MAX_REQUESTS = 500;

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

// In-memory fast cache (reduces Firestore reads for rapid repeated requests from same IP)
const localCache = new Map<string, { count: number; resetAt: number }>();
let lastLocalCleanup = Date.now();

function cleanLocalCache(): void {
  const now = Date.now();
  if (now - lastLocalCleanup < 60_000) return;
  for (const [key, val] of localCache) {
    if (now > val.resetAt) localCache.delete(key);
  }
  if (localCache.size > 300) localCache.clear();
  lastLocalCleanup = now;
}

export async function checkRateLimit(ip: string, isLoggedIn: boolean): Promise<RateLimitResult> {
  const max = isLoggedIn ? RATE_LIMIT_MAX_USER : RATE_LIMIT_MAX_GUEST;
  const now = Date.now();

  cleanLocalCache();

  // Fast path: local cache says already over limit
  const cached = localCache.get(ip);
  if (cached && now < cached.resetAt && cached.count >= max) {
    return { allowed: false, remaining: 0 };
  }

  // If Admin SDK not available, fall back to in-memory only
  if (!adminDb) {
    if (!cached || now > cached.resetAt) {
      localCache.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
      return { allowed: true, remaining: max - 1 };
    }
    if (cached.count >= max) {
      return { allowed: false, remaining: 0 };
    }
    cached.count++;
    return { allowed: true, remaining: max - cached.count };
  }

  // Firestore-based: persistent across serverless instances
  const docRef = adminDb.collection('rate_limits').doc(ip.replace(/[/.]/g, '_'));
  try {
    const snap = await docRef.get();
    const data = snap.exists ? snap.data() : null;

    if (!data || now > (data.resetAt ?? 0)) {
      await docRef.set({ count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS, isLoggedIn });
      localCache.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
      return { allowed: true, remaining: max - 1 };
    }

    if (data.count >= max) {
      localCache.set(ip, { count: data.count, resetAt: data.resetAt });
      return { allowed: false, remaining: 0 };
    }

    await docRef.update({ count: FieldValue.increment(1) });
    const newCount = data.count + 1;
    localCache.set(ip, { count: newCount, resetAt: data.resetAt });
    return { allowed: true, remaining: max - newCount };
  } catch (err) {
    console.error('[RateLimit] Firestore error, falling back to local:', err);
    // Fallback to in-memory
    if (!cached || now > cached.resetAt) {
      localCache.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
      return { allowed: true, remaining: max - 1 };
    }
    cached.count++;
    return { allowed: true, remaining: max - cached.count };
  }
}

export async function checkDailyBudget(): Promise<boolean> {
  if (!adminDb) return true;

  const today = new Date().toISOString().slice(0, 10);
  const docRef = adminDb.collection('rate_limits').doc(`daily_${today}`);

  try {
    const snap = await docRef.get();
    const count = snap.exists ? (snap.data()?.count ?? 0) : 0;

    if (count >= DAILY_MAX_REQUESTS) return false;

    await docRef.set({ count: FieldValue.increment(1), date: today }, { merge: true });
    return true;
  } catch (err) {
    console.error('[DailyBudget] Firestore error:', err);
    return true; // fail open
  }
}
