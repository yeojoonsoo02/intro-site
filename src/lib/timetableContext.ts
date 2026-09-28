import { adminDb } from '@/lib/firebaseAdmin'
import { cached } from '@/lib/cached'

// 이번 학기 주간 시간표 + 온라인 수업을 챗봇 컨텍스트로 준다.
// 정본은 TemuTemu 팀 공간(task.yeojoonsoo02.com)의 Firestore task_timetables/yeojunsu —
// 같은 Firebase 프로젝트라 admin SDK로 바로 읽는다. 날짜별 일정(휴강 등)은 개인 플랫폼 크론이
// 같은 시간표로 Google '수업' 캘린더를 채우고, 그건 liveContext의 일정으로 따로 들어온다.
// 강의실까지 넘기는 건 본인 결정(2026-09-28).

const DOC = 'yeojunsu'
const TTL = 60 * 60 * 1000
const ERROR_TTL = 5 * 60 * 1000
const DAYS = ['월', '화', '수', '목', '금']
// 광운대 2026-2학기: 9/1(화) 개강 ~ 12/21(월) 종강. 매치업 심화는 1~11주차(~11/16)
const SEMESTER = '2026-2학기 (9/1~12/21)'
const COURSE_NOTE: Record<string, string> = {
  인체데이터분석및실습: '11/16까지, 매치업 집중이수제 블렌디드 과목이고 이제부터 대면',
  첨단기술을연결하는스마트에너지네트워크: 'K-MOOC 온라인 강좌, 11주차(~11/16)까지',
  컴퓨터네트워크: '학교 비대면 수업(K-MOOC 아님)',
}
// 학기 중 수업이 없는 공휴일 — Google '대한민국의 휴일' 캘린더에서 '공휴일'로 표시된 날(기념일 제외).
// 플랫폼 sync-timetable 크론도 같은 기준으로 캘린더에 수업을 넣지 않는다.
const DAYS_OFF = '10/5(월, 개천절 대체공휴일), 10/9(금, 한글날), 12/25(금, 크리스마스·종강 뒤)'

interface Klass {
  day: number
  start: string
  end: string
  name: string
  room?: string
  est?: boolean
}

async function load(): Promise<string> {
  if (!adminDb) return ''
  const snap = await adminDb.collection('task_timetables').doc(DOC).get()
  const data = snap.data() as { classes?: Klass[]; online?: string[] } | undefined
  const classes = [...(data?.classes ?? [])].sort((a, b) => a.day - b.day || a.start.localeCompare(b.start))
  const online = data?.online ?? []
  if (classes.length === 0 && online.length === 0) return ''

  const note = (name: string) => (COURSE_NOTE[name] ? ` — ${COURSE_NOTE[name]}` : '')
  const lines = classes.map((c) => {
    const room = c.room ? ` @${c.room}` : ''
    const est = c.est ? ' (시간 추정)' : ''
    return `- ${DAYS[c.day] ?? '?'} ${c.start}~${c.end} ${c.name}${room}${est}${note(c.name)}`
  })
  return [
    `이번 학기 ${SEMESTER} 대면 수업(매주, 공휴일 제외):`,
    ...lines,
    online.length ? `온라인으로만 듣는 수업(정해진 시간 없음): ${online.map((n) => `${n}${note(n)}`).join(', ')}` : '',
    `학기 중 공휴일(수업 없음): ${DAYS_OFF}`,
  ]
    .filter(Boolean)
    .join('\n')
}

export const getTimetableContext = cached(load, '', { ttl: TTL, errorTtl: ERROR_TTL, name: 'timetableContext' })
