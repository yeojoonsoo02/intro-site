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

test.describe('실시간 컨텍스트: 장소 이름', () => {
  // 지인 이름이 든 장소 이름도 가리지 않는다 — 본인 결정(2026-10-01).
  test('플랫폼에 붙인 이름 그대로 넘긴다', () => {
    const out = formatLiveData(context({
      location: { current: { name: '김철수 집' }, history: [{ place: '김철수 집', recordedAt: NOW }] },
      dwell: { days: [{ date: '2026-09-30', places: [{ place: '김철수 집', minutes: 30 }, { place: '자취방', minutes: 540 }] }] },
    }));
    expect(out).toContain('현재 위치: 김철수 집');
    expect(out).toContain('김철수 집 30분');
    expect(out).toContain('- 2026-09-30(수, 어제): 김철수 집 30분, 자취방 9시간');
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
    expect(out).toContain('- 오늘(10월 1일 (목)): 일정 없음, 수업 없음');
  });

  test('공휴일은 표시를 붙이고 이름을 한국어로 바꿔 넘긴다', () => {
    const out = formatLiveData(context({ schedule: [holiday('National Foundation Day', 'Public holiday')] }));
    expect(out).toContain('[공휴일] 개천절');
    expect(out).not.toContain('대체공휴일');
  });

  test('모르는 공휴일 이름은 그대로 둔다', () => {
    const out = formatLiveData(context({ schedule: [holiday('Election Day', 'Public holiday')] }));
    expect(out).toContain('[공휴일] Election Day');
  });

  test('수업 일정은 시간·장소와 함께 넘긴다', () => {
    const out = formatLiveData(context({ schedule: [{
      title: '기술과경영', start: '2026-10-02T12:00:00+09:00', end: '2026-10-02T15:00:00+09:00',
      location: '새빛205', calendarName: '수업',
    }] }));
    expect(out).toContain('- 오늘(10월 1일 (목)): 일정 없음, 수업 없음');
    expect(out).toContain('- 내일(10월 2일 (금)): 12:00~15:00 [수업] 기술과경영 @새빛205');
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

test.describe('실시간 컨텍스트: 할 일·공부 기록', () => {
  test('안 끝낸 할 일을 넘긴다', () => {
    const out = formatLiveData(context({ tasks: [
      { title: '15분 독서', status: 'TODO' },
      { title: '블로그 글 작성', status: 'TODO', dueDate: '2026-10-03T00:00:00+09:00' },
      { title: '끝낸 일', status: 'DONE' },
    ] }));
    expect(out).toContain('할 일 목록(아직 안 끝낸 것): 15분 독서, 블로그 글 작성(기한 10월 3일)');
    expect(out).not.toContain('끝낸 일');
  });

  test('공부 기록은 날짜별 앱 사용 시간만 넘긴다', () => {
    const out = formatLiveData(context({ study: { days: [
      { date: '2026-09-30', metric: 'app_usage', value: '말해보카', minutes: 87 },
      { date: '2026-09-30', metric: 'duolingo_total_xp', value: '888', minutes: null },
      { date: '2026-09-29', metric: 'app_usage', value: '말해보카', minutes: 71 },
    ] } }));
    // 요일과 어제·그저께는 코드가 붙인다(모델이 날짜를 요일로 옮기다 틀린다).
    expect(out).toContain('- 2026-09-30(수, 어제): 말해보카 1시간 27분');
    expect(out).toContain('- 2026-09-29(화, 그저께): 말해보카 1시간 11분');
    expect(out).not.toContain('888');
  });

  test('GPS 좌표는 넘기지 않는다', () => {
    const location = { current: { name: '자취방', latitude: 37.123456, longitude: 127.654321 }, history: [] };
    const out = formatLiveData(context({ location }));
    expect(out).toContain('현재 위치: 자취방');
    expect(out).not.toMatch(/37\.123|127\.654/);
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
