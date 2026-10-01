import type {
  ContextResponse,
  DwellDay,
  LocationData,
  MealEntry,
  MoodEntry,
  ScheduleEntry,
  SleepData,
  WeatherData,
} from './types'

const MEAL_TYPE_MAP: Record<string, string> = {
  BREAKFAST: '아침',
  LUNCH: '점심',
  DINNER: '저녁',
  SNACK: '간식',
}

function formatKST(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'long',
    day: 'numeric',
  })
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function formatMeals(meals: MealEntry[] | null): string {
  // "기록 없음"만 주면 "아직 안 먹었어"로 지어낸다. 기록이 없을 뿐이라는 걸 적어 준다.
  if (!meals || meals.length === 0) return '오늘 식사: 아직 기록 안 함(안 먹었다는 뜻이 아님 — 먹었는지는 알 수 없음)'
  const grouped = new Map<string, string[]>()
  let totalCal = 0
  for (const m of meals) {
    const type = MEAL_TYPE_MAP[m.mealType] || m.mealType
    if (!grouped.has(type)) grouped.set(type, [])
    grouped.get(type)!.push(m.menu)
    if (m.calories) totalCal += m.calories
  }
  const parts: string[] = []
  for (const [type, menus] of grouped) {
    parts.push(`${type} - ${menus.join(', ')}`)
  }
  const calStr = totalCal > 0 ? ` (총 ${totalCal}kcal)` : ''
  return `오늘 식사: ${parts.join(' / ')}${calStr}`
}

function formatMinutes(total: number): string {
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m}분`
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`
}

/** 한국 날짜 기준으로 두 시각이 며칠 떨어져 있는지(같은 날이면 0). */
function daysApartKST(earlier: Date, later: Date): number {
  const day = (d: Date): number => {
    const [y, m, dd] = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' })
      .format(d)
      .split('-')
      .map(Number)
    return Date.UTC(y, m - 1, dd) / 86_400_000
  }
  return day(later) - day(earlier)
}

// 어젯밤 기록인지 아닌지를 여기서 판정해 적어 준다. 기록일만 넘기고 모델이 오늘 날짜와
// 비교하게 두면 며칠씩 밀린 기록을 어젯밤 일처럼 답한다 — 추론 없이 돌린 평가에서 6번 중 5번
// 그랬다(2026-10). 날짜·개수 계산은 모델에게 시키지 않는다(dateContext와 같은 원칙).
function formatSleep(sleep: SleepData | null, now: Date): string {
  if (!sleep) return '수면: 기록 없음'
  const date = formatDate(sleep.sleepEnd || sleep.date)
  const age = daysApartKST(new Date(sleep.sleepEnd || sleep.date), now)
  const bedtime = formatKST(sleep.sleepStart)
  const wakeup = formatKST(sleep.sleepEnd)
  const stages = [
    `깊은수면 ${formatMinutes(sleep.deep)}`,
    `REM ${formatMinutes(sleep.rem)}`,
    `코어 ${formatMinutes(sleep.core)}`,
    sleep.awake ? `깬 시간 ${formatMinutes(sleep.awake)}` : '',
  ].filter(Boolean)
  const detail = `${bedtime} 취침 → ${wakeup} 기상, 총 ${formatMinutes(sleep.totalSleep)} (${stages.join(', ')})`
  if (age <= 0) return `수면(어젯밤 — 오늘 아침 기상): ${detail}`
  return `수면: 어젯밤 기록은 없음. 마지막 기록은 ${age}일 전(${date} 아침 기상)이라 어젯밤 얘기가 아님 — ${detail}`
}

// 장소 이름은 본인이 플랫폼에 붙인 그대로 넘긴다. "OOO 집"처럼 지인 이름이 들어 있어도 가리지 않는다 —
// 본인 결정이다(2026-10-01: 가렸다가 요청으로 되돌림). 위치 공개와 같은 범주로 본다.
function formatLocation(location: LocationData | null): string[] {
  const current = location?.current?.name
  const lines = [`현재 위치: ${current || '기록 없음'}`]
  const history = (location?.history ?? [])
    .map((h) => ({ place: h.place || h.locationName, at: h.recordedAt }))
    .filter((h): h is { place: string; at: string } => Boolean(h.place && h.at))
  if (history.length > 0) {
    lines.push(`최근 이동 기록: ${history.map((h) => `${formatKST(h.at)} ${h.place}`).join(' / ')}`)
  }
  return lines
}

function formatDwell(days: DwellDay[] | undefined): string {
  if (!days || days.length === 0) return '최근 머문 곳: 기록 없음'
  const parts = days.map(
    (d) => `${d.date}: ${d.places.map((p) => `${p.place} ${formatMinutes(p.minutes)}`).join(', ')}`,
  )
  return `최근 날짜별 머문 곳:\n${parts.map((p) => `- ${p}`).join('\n')}`
}

function formatWeather(weather: WeatherData | null): string {
  if (!weather) return '날씨: 기록 없음'
  let line = `날씨: ${weather.temperature}°C (체감 ${weather.feelsLike}°C), ${weather.weatherDesc}, 습도 ${weather.humidity}%`
  if (weather.pm25 !== null || weather.pm10 !== null) {
    const parts: string[] = []
    if (weather.pm25 !== null) parts.push(`PM2.5 ${weather.pm25}`)
    if (weather.pm10 !== null) parts.push(`PM10 ${weather.pm10}`)
    line += `, ${parts.join(', ')}`
  }
  return line
}

function formatMood(mood: MoodEntry | null): string {
  if (!mood) return '기분: 기록 안 함(알 수 없음)'
  const moodStr = mood.note ? `${mood.value} (${mood.note})` : mood.value
  return `기분: ${moodStr}`
}

// 캘린더는 오늘·내일치가 온다(플랫폼 /api/external/context). '수업' 캘린더는 플랫폼 크론이
// task.yeojoonsoo02.com 시간표로 채운다 — 제목만 넘기면 몇 시 수업인지 모르니 시간·장소를 붙인다.
//
// 구글 '대한민국의 휴일' 달력의 항목은 내 일정이 아니다. 쉬지 않는 기념일(Observance)까지
// 들어 있어서 그대로 넘기면 "국군의 날이라 수업이 없어"처럼 쉬는 날로 지어낸다(2026-10-01
// 평가에서 실제 발생). 기념일은 빼고, 진짜 공휴일만 표시를 붙여 남긴다.
const isHolidayCalendar = (s: ScheduleEntry): boolean => Boolean(s.calendarId?.includes('#holiday@'))
const isPublicHoliday = (s: ScheduleEntry): boolean => /public holiday/i.test(s.description ?? '')

function scheduleTag(s: ScheduleEntry): string {
  if (s.calendarName === '수업') return '[수업] '
  if (isHolidayCalendar(s)) return '[공휴일] '
  return ''
}

function formatScheduleEntry(s: ScheduleEntry): string {
  const tag = scheduleTag(s)
  const place = s.location ? ` @${s.location}` : ''
  if (!s.start) return `- ${tag}${s.title}${place}`
  const day = new Date(s.start).toLocaleDateString('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  })
  if (s.allDay) return `- ${day} 종일 ${tag}${s.title}${place}`
  const time = s.end ? `${formatKST(s.start)}~${formatKST(s.end)}` : formatKST(s.start)
  return `- ${day} ${time} ${tag}${s.title}${place}`
}

function formatSchedule(schedule: ScheduleEntry[] | null): string {
  const mine = (schedule ?? []).filter((s) => !isHolidayCalendar(s) || isPublicHoliday(s))
  if (mine.length === 0) return '일정(오늘·내일): 없음'
  const sorted = [...mine].sort((a, b) => (a.start ?? '').localeCompare(b.start ?? ''))
  return ['일정(오늘·내일, 캘린더 기준):', ...sorted.map(formatScheduleEntry)].join('\n')
}

// 위치(현재·이동 기록·머문 곳)와 수면 공개는 본인 결정이다(2026-09-16~17).
// 할 일 목록과 GPS 좌표는 넘기지 않는다.
export function formatLiveData(json: ContextResponse): string {
  const { data } = json
  return [
    `# 실시간 정보 (${formatTimestamp(json.timestamp)} KST)`,
    '',
    ...formatLocation(data.location),
    formatDwell(data.dwell?.days),
    formatMeals(data.meals),
    formatSleep(data.sleep, new Date(json.timestamp)),
    formatWeather(data.weather),
    formatMood(data.mood),
    formatSchedule(data.schedule),
  ].join('\n')
}
