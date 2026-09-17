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
  if (!meals || meals.length === 0) return '오늘 식사: 기록 없음'
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

// 기록일을 함께 넘긴다 — 수면 기록이 며칠씩 밀려 있는데 "어젯밤"으로 넘겨
// 보름 전 기록을 어젯밤 일처럼 답한 적이 있다.
function formatSleep(sleep: SleepData | null): string {
  if (!sleep) return '수면: 기록 없음'
  const date = formatDate(sleep.sleepEnd || sleep.date)
  const bedtime = formatKST(sleep.sleepStart)
  const wakeup = formatKST(sleep.sleepEnd)
  const stages = [
    `깊은수면 ${formatMinutes(sleep.deep)}`,
    `REM ${formatMinutes(sleep.rem)}`,
    `코어 ${formatMinutes(sleep.core)}`,
    sleep.awake ? `깬 시간 ${formatMinutes(sleep.awake)}` : '',
  ].filter(Boolean)
  return `수면(가장 최근 기록, ${date} 아침 기상): ${bedtime} 취침 → ${wakeup} 기상, 총 ${formatMinutes(sleep.totalSleep)} (${stages.join(', ')})`
}

function formatLocation(location: LocationData | null): string[] {
  const lines = [`현재 위치: ${location?.current?.name || '기록 없음'}`]
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
  if (!mood) return '기분: 기록 없음'
  const moodStr = mood.note ? `${mood.value} (${mood.note})` : mood.value
  return `기분: ${moodStr}`
}

function formatSchedule(schedule: ScheduleEntry[] | null): string {
  if (!schedule || schedule.length === 0) return '일정: 없음'
  return `일정: ${schedule.map((s) => s.title).join(', ')}`
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
    formatSleep(data.sleep),
    formatWeather(data.weather),
    formatMood(data.mood),
    formatSchedule(data.schedule),
  ].join('\n')
}
