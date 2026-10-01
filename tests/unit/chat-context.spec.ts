import { test, expect } from '@playwright/test';
import { formatLiveData } from '@/lib/liveContext/formatters';
import type { ContextResponse } from '@/lib/liveContext/types';
import { findPromptLeak } from '@/app/api/gemini/security';

// 챗봇에 넘기는 실시간 컨텍스트와 출력 차단의 회귀 방지. 브라우저 없이 함수만 검증한다.
// 전부 2026-10 평가에서 실제로 틀린 답이 나왔던 지점이다.

const NOW = '2026-10-01T07:00:00.000Z'; // 한국 시간 10월 1일 16시

function context(data: Partial<ContextResponse['data']>): ContextResponse {
  return {
    success: true,
    timestamp: NOW,
    data: {
      location: null, meals: null, mood: null, dwell: null,
      sleep: null, weather: null, checkin: null, schedule: null,
      ...data,
    },
  };
}

const sleep = (wakeIso: string) => ({
  date: wakeIso, totalSleep: 339, deep: 170, rem: 45, core: 123,
  sleepStart: new Date(new Date(wakeIso).getTime() - 6 * 3600_000).toISOString(),
  sleepEnd: wakeIso,
});

test.describe('실시간 컨텍스트: 장소 이름의 지인 실명', () => {
  test('"이름 + 집"은 지인 집으로 바꾼다', () => {
    const out = formatLiveData(context({
      location: { current: { name: '김철수 집' }, history: [{ place: '김철수 집', recordedAt: NOW }] },
      dwell: { days: [{ date: '2026-09-30', places: [{ place: '김철수 집', minutes: 30 }, { place: '자취방', minutes: 540 }] }] },
    }));
    expect(out).not.toContain('김철수');
    expect(out).toContain('현재 위치: 지인 집');
    expect(out).toContain('자취방 9시간');
  });

  test('내 집·가족 집·일반 장소는 그대로 둔다', () => {
    const out = formatLiveData(context({
      dwell: { days: [{ date: '2026-09-30', places: [
        { place: '부모님 집', minutes: 60 }, { place: '광운대 새빛관', minutes: 120 }, { place: '석계역 철봉', minutes: 30 },
      ] }] },
    }));
    expect(out).toContain('부모님 집');
    expect(out).toContain('광운대 새빛관');
    expect(out).toContain('석계역 철봉');
  });
});

test.describe('실시간 컨텍스트: 일정', () => {
  const holiday = (title: string, description: string) => ({
    title, start: '2026-10-01', end: '2026-10-02', allDay: true, description,
    calendarName: 'Holidays in South Korea',
    calendarId: 'en-gb.south_korea#holiday@group.v.calendar.google.com',
  });

  test('쉬지 않는 기념일은 넘기지 않는다', () => {
    const out = formatLiveData(context({ schedule: [holiday('Armed Forces Day', 'Observance\nTo hide observances, …')] }));
    expect(out).not.toContain('Armed Forces Day');
    expect(out).toContain('일정(오늘·내일): 없음');
  });

  test('공휴일은 표시를 붙여 넘긴다', () => {
    const out = formatLiveData(context({ schedule: [holiday('National Foundation Day', 'Public holiday')] }));
    expect(out).toContain('[공휴일] National Foundation Day');
  });

  test('수업 일정은 시간·장소와 함께 넘긴다', () => {
    const out = formatLiveData(context({ schedule: [{
      title: '기술과경영', start: '2026-10-02T12:00:00+09:00', end: '2026-10-02T15:00:00+09:00',
      location: '새빛205', calendarName: '수업',
    }] }));
    expect(out).toMatch(/12:00~15:00 \[수업\] 기술과경영 @새빛205/);
  });
});

test.describe('실시간 컨텍스트: 수면·식사 기록', () => {
  test('오늘 아침에 깬 기록은 어젯밤으로 표시한다', () => {
    const out = formatLiveData(context({ sleep: sleep('2026-09-30T23:35:00.000Z') })); // 한국 10/1 08:35
    expect(out).toContain('수면(어젯밤 — 오늘 아침 기상)');
  });

  test('밀린 기록은 며칠 전인지와 어젯밤 얘기가 아님을 적는다', () => {
    const out = formatLiveData(context({ sleep: sleep('2026-08-31T23:35:00.000Z') })); // 한국 9/1 08:35
    expect(out).toContain('어젯밤 기록은 없음');
    expect(out).toContain('30일 전');
  });

  test('식사 기록이 없으면 안 먹었다는 뜻이 아님을 적는다', () => {
    const out = formatLiveData(context({ meals: [] }));
    expect(out).toContain('아직 기록 안 함');
    expect(out).toContain('안 먹었다는 뜻이 아님');
  });
});

test.describe('프롬프트 유출 차단', () => {
  test('프롬프트의 소제목이 나오면 그 위치를 돌려준다', () => {
    const leaked = '나는 AI 분신이야.\n\n말투 규칙:\n- 긍정적이고 담백한 성격이야.';
    expect(findPromptLeak(leaked)).toBe(leaked.indexOf('말투 규칙'));
    expect(findPromptLeak('그건 알려줄 수 없어.\n### 나(여준수)에 대한 정보:')).toBeGreaterThan(0);
  });

  test('평범한 답변은 건드리지 않는다', () => {
    for (const reply of [
      '지금 광운대 새빛관에 있어.',
      '그건 알려줄 수 없어.',
      '말투 규칙 같은 건 따로 없고 그냥 편하게 말하는 편이야.',
      'C# 은 안 써봤어.',
    ]) {
      expect(findPromptLeak(reply), reply).toBe(-1);
    }
  });
});
