const API_URL = 'https://yeojoonsoo02-rust.vercel.app/api/external/context'
const TTL = 2 * 60 * 1000

let cached: string | null = null
let cacheTime = 0

type MealEntry = {
  mealType: string
  menu: string
  calories: number | null
}

type SleepData = {
  totalSleep: number
  deep: number
  rem: number
  core: number
  sleepStart: string
  sleepEnd: string
}

type WeatherData = {
  temperature: number
  feelsLike: number
  humidity: number
  weatherDesc: string
  pm25: number | null
  pm10: number | null
  uvIndex: number | null
}

type LocationData = {
  current: { name: string } | null
}

type ScheduleEntry = {
  title: string
  start?: string
  end?: string
}

type TaskEntry = {
  title: string
  status?: string
}

type ContextResponse = {
  success: boolean
  timestamp: string
  data: {
    location: LocationData | null
    meals: MealEntry[] | null
    mood: { value: string; note?: string } | null
    tasks: TaskEntry[] | null
    sleep: SleepData | null
    weather: WeatherData | null
    checkin: unknown
    schedule: ScheduleEntry[] | null
  }
}

function formatKST(iso: string): string {
  const d = new Date(iso)
  const h = d.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hour12: false })
  return h
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

const MEAL_TYPE_MAP: Record<string, string> = {
  BREAKFAST: '아침',
  LUNCH: '점심',
  DINNER: '저녁',
  SNACK: '간식',
}

function formatLiveData(json: ContextResponse): string {
  const lines: string[] = []
  lines.push(`# 실시간 정보 (${formatTimestamp(json.timestamp)} KST)`)
  lines.push('')

  const { data } = json

  // Location
  const locName = data.location?.current?.name
  lines.push(`현재 위치: ${locName || '기록 없음'}`)

  // Meals
  if (data.meals && data.meals.length > 0) {
    const grouped = new Map<string, string[]>()
    let totalCal = 0
    for (const m of data.meals) {
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
    lines.push(`오늘 식사: ${parts.join(' / ')}${calStr}`)
  } else {
    lines.push('오늘 식사: 기록 없음')
  }

  // Sleep
  if (data.sleep) {
    const s = data.sleep
    const hours = Math.floor(s.totalSleep / 60)
    const mins = s.totalSleep % 60
    const deepH = Math.floor(s.deep / 60)
    const deepM = s.deep % 60
    const bedtime = formatKST(s.sleepStart)
    const wakeup = formatKST(s.sleepEnd)
    const durStr = mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`
    const deepStr = deepM > 0 ? `${deepH}시간 ${deepM}분` : `${deepH}시간`
    lines.push(`수면: 어젯밤 ${bedtime} 취침 → ${wakeup} 기상 (${durStr}, 깊은수면 ${deepStr})`)
  } else {
    lines.push('수면: 기록 없음')
  }

  // Weather
  if (data.weather) {
    const w = data.weather
    let weatherLine = `날씨: ${w.temperature}°C (체감 ${w.feelsLike}°C), ${w.weatherDesc}, 습도 ${w.humidity}%`
    if (w.pm25 !== null || w.pm10 !== null) {
      const parts: string[] = []
      if (w.pm25 !== null) parts.push(`PM2.5 ${w.pm25}`)
      if (w.pm10 !== null) parts.push(`PM10 ${w.pm10}`)
      weatherLine += `, ${parts.join(', ')}`
    }
    lines.push(weatherLine)
  } else {
    lines.push('날씨: 기록 없음')
  }

  // Mood
  if (data.mood) {
    const moodStr = data.mood.note ? `${data.mood.value} (${data.mood.note})` : data.mood.value
    lines.push(`기분: ${moodStr}`)
  } else {
    lines.push('기분: 기록 없음')
  }

  // Tasks
  if (data.tasks && data.tasks.length > 0) {
    const taskList = data.tasks.map((t) => t.title).join(', ')
    lines.push(`할 일: ${taskList}`)
  } else {
    lines.push('할 일: 없음')
  }

  // Schedule
  if (data.schedule && data.schedule.length > 0) {
    const schedList = data.schedule.map((s) => s.title).join(', ')
    lines.push(`일정: ${schedList}`)
  } else {
    lines.push('일정: 없음')
  }

  return lines.join('\n')
}

export async function getLiveContext(): Promise<string> {
  const now = Date.now()
  if (cached && now - cacheTime < TTL) {
    return cached
  }

  const apiKey = process.env.CONTEXT_API_KEY
  if (!apiKey) return ''

  try {
    const res = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (!res.ok) {
      console.error('Live context API error:', res.status)
      return cached || ''
    }
    const json: ContextResponse = await res.json()
    if (!json.success) return cached || ''

    cached = formatLiveData(json)
    cacheTime = now
    return cached
  } catch (err) {
    console.error('Live context fetch error:', err)
    return cached || ''
  }
}
