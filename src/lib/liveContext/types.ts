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
  }
}
