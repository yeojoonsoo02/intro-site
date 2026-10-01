export interface MealEntry {
  mealType: string
  menu: string
  calories: number | null
}

export interface SleepData {
  date: string
  totalSleep: number
  deep: number
  rem: number
  core: number
  awake?: number
  sleepStart: string
  sleepEnd: string
}

export interface WeatherData {
  temperature: number
  feelsLike: number
  humidity: number
  weatherDesc: string
  pm25: number | null
  pm10: number | null
  uvIndex: number | null
}

export interface LocationHistoryEntry {
  place?: string
  locationName?: string
  recordedAt: string
}

export interface LocationData {
  current: { name: string } | null
  history?: LocationHistoryEntry[]
}

export interface DwellDay {
  date: string
  places: { place: string; minutes: number }[]
}

export interface ScheduleEntry {
  title: string
  start?: string
  end?: string
  allDay?: boolean
  location?: string
  calendarName?: string
  /** 구글 공휴일 달력은 여기에 'Public holiday' / 'Observance'(기념일)를 적어 준다 */
  description?: string
  calendarId?: string
}

export interface TaskEntry {
  title: string
  status?: string
  priority?: string
  dueDate?: string | null
}

/** 날짜별 공부 지표. metric이 app_usage면 value는 앱 이름, minutes는 쓴 시간이다. */
export interface StudyEntry {
  date: string
  subject?: string
  metric: string
  value?: string
  minutes?: number | null
}

export interface MoodEntry {
  value: string
  note?: string
}

export interface ContextResponse {
  success: boolean
  timestamp: string
  data: {
    location: LocationData | null
    meals: MealEntry[] | null
    mood: MoodEntry | null
    dwell?: { days: DwellDay[] } | null
    sleep: SleepData | null
    weather: WeatherData | null
    checkin: unknown
    schedule: ScheduleEntry[] | null
    tasks?: TaskEntry[] | null
    study?: { days: StudyEntry[] } | null
  }
}
