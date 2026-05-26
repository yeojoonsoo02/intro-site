export interface MealEntry {
  mealType: string
  menu: string
  calories: number | null
}

export interface SleepData {
  totalSleep: number
  deep: number
  rem: number
  core: number
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

export interface LocationData {
  current: { name: string } | null
}

export interface ScheduleEntry {
  title: string
  start?: string
  end?: string
}

export interface TaskEntry {
  title: string
  status?: string
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
    tasks: TaskEntry[] | null
    sleep: SleepData | null
    weather: WeatherData | null
    checkin: unknown
    schedule: ScheduleEntry[] | null
  }
}
