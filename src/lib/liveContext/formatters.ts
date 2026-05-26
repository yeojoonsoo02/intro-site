import type {
  ContextResponse,
  MealEntry,
  MoodEntry,
  ScheduleEntry,
  SleepData,
  TaskEntry,
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

function formatSleep(sleep: SleepData | null): string {
  if (!sleep) return '수면: 기록 없음'
  const hours = Math.floor(sleep.totalSleep / 60)
  const mins = sleep.totalSleep % 60
  const deepH = Math.floor(sleep.deep / 60)
  const deepM = sleep.deep % 60
  const bedtime = formatKST(sleep.sleepStart)
  const wakeup = formatKST(sleep.sleepEnd)
  const durStr = mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`
  const deepStr = deepM > 0 ? `${deepH}시간 ${deepM}분` : `${deepH}시간`
  return `수면: 어젯밤 ${bedtime} 취침 → ${wakeup} 기상 (${durStr}, 깊은수면 ${deepStr})`
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

function formatTasks(tasks: TaskEntry[] | null): string {
  if (!tasks || tasks.length === 0) return '할 일: 없음'
  return `할 일: ${tasks.map((t) => t.title).join(', ')}`
}

function formatSchedule(schedule: ScheduleEntry[] | null): string {
  if (!schedule || schedule.length === 0) return '일정: 없음'
  return `일정: ${schedule.map((s) => s.title).join(', ')}`
}

export function formatLiveData(json: ContextResponse): string {
  const { data } = json
  const locName = data.location?.current?.name
  return [
    `# 실시간 정보 (${formatTimestamp(json.timestamp)} KST)`,
    '',
    `현재 위치: ${locName || '기록 없음'}`,
    formatMeals(data.meals),
    formatSleep(data.sleep),
    formatWeather(data.weather),
    formatMood(data.mood),
    formatTasks(data.tasks),
    formatSchedule(data.schedule),
  ].join('\n')
}
