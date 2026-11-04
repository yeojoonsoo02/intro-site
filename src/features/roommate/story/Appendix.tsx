import SystemDiagram from '@/features/roommate/SystemDiagram';
import OpenOnHash from './OpenOnHash';
import s from './story.module.css';

// "밤 이후 — 자세히": 하루 장면에 다 못 담은 설계 노트. 전부 접힌 <details>로 두고, 요약 줄만 읽어도 무엇이 들었는지 알게 쓴다.
// 사실·숫자·상태 표시는 옛 설명 페이지의 것을 그대로 옮겼다(문장만 줄임).

const COMPARE: { what: string; app: string; device: string }[] = [
  { what: '누가 시작', app: '내가 앱을 열어야 시작', device: '정해 둔 시간에 내가 방에 있으면 기기가 먼저 말을 건다' },
  { what: '어디서', app: '폰을 들고 화면을 본다', device: '방 안에서 손 안 쓰고 말로' },
  { what: '듣기 입력', app: '모두에게 같은 교재', device: '내 관심사·수준·지난 실수로 만든 짧은 영어 브리핑' },
  { what: '기억', app: '틀린 표현이 그날로 끝', device: '며칠 뒤 틀린 표현을 다시 묻는다(간격 반복)' },
  { what: '방해', app: '알림·다른 앱이 옆에 있다', device: '영어만 하는 기기라 딴 길이 없다' },
  { what: '타이밍', app: '알림이 아무 때나 온다', device: '방에 있고 바쁘지 않을 때만 말한다' },
];

const HARDWARE: { part: string; why: string }[] = [
  { part: '사람 감지 센서', why: 'mmWave 레이더 또는 PIR. 방에 실제로 있는지 본다.' },
  { part: '버튼 2개 + 마이크 LED', why: '"말하기"·"나중에". 항상 듣지 않는다 — 마이크는 버튼을 누르거나 기기가 물어본 뒤에만 켜지고, 켜진 동안 LED가 켜진다.' },
  { part: '마이크 · 스피커', why: '말로만 주고받는다.' },
  { part: 'ESP32-S3 (또는 STM32WB)', why: '센서·버튼·LED·오디오 전송과 BLE 비콘. 무거운 일은 서버가 해서 기기는 얇게 둔다.' },
];

const RISKS: { risk: string; answer: string }[] = [
  { risk: '귀찮음', answer: '하루 말 거는 횟수 상한, "나중에" 버튼, 거절한 시간대는 덜 말 걸기.' },
  { risk: '사생활', answer: '항상 듣지 않음, 마이크 LED, 녹음은 동의한 경우에만 저장.' },
  { risk: '참가자당 기기 값', answer: 'ESP32-S3 얇은 클라이언트로 부품을 줄인다. 폰 웹앱 모드도 같은 엔진이라 기기 없이도 실험할 수 있다.' },
  { risk: '음성 처리 비용', answer: '받아쓰기·음성 합성은 기기나 브라우저에서 할 수 있는 만큼 하고, LLM만 API로 보낸다.' },
];

const ROADMAP: { step: string; detail: string; now?: boolean }[] = [
  { step: '웹 가상 기기 데모', detail: '센서 토글·먼저 말 걸기·기억과 복습. 이 페이지의 데모.', now: true },
  { step: '폰 웹앱 + 기억 서버', detail: '복습 일정을 서버로 옮기고, 실제 하루 일정으로 말을 건다.' },
  { step: '기기 시제품', detail: 'ESP32-S3에 레이더·버튼·LED·마이크·스피커를 붙인다.' },
  { step: '폰 근접 시험', detail: 'BLE 비콘 감지 지연과 iOS 위치 권한을 실제로 확인한다.' },
  { step: '교차 실험', detail: '20~30명, 앱 모드 2주 · 기기 모드 2주.' },
  { step: '교실·기관판', detail: '여러 학습자를 한 기관이 관리하는 확장판(이후).' },
];

const LABEL = 'text-[12.5px] tracking-[.03em]';
const MONO = { fontFamily: 'var(--font-mono)' } as const;

function Fold({ id, no, title, hint, children }: { id: string; no: string; title: string; hint: string; children: React.ReactNode }): JSX.Element {
  return (
    <details id={id} className={s.fold}>
      <summary>
        <span className={s.foldNo} aria-hidden="true">
          {no}
        </span>
        <span className={s.foldText}>
          <span className={s.foldTitle}>{title}</span>
          <span className={s.foldHint}>{hint}</span>
        </span>
        <span className={s.foldIcon} aria-hidden="true">
          +
        </span>
      </summary>
      <div className={s.foldBody}>{children}</div>
    </details>
  );
}

function Decision({ what, children }: { what: string; children: React.ReactNode }): JSX.Element {
  return (
    <div className="grid gap-1">
      <h3 className="text-[16.5px] font-semibold m-0" style={{ color: 'var(--ink)' }}>
        {what}
      </h3>
      <p className="text-[15.5px] leading-[1.7] max-w-[62ch] m-0" style={{ color: 'var(--ink-2)' }}>
        {children}
      </p>
    </div>
  );
}

function Question({ no, title, children }: { no: string; title: string; children: React.ReactNode }): JSX.Element {
  return (
    <div className="pl-4 grid gap-1" style={{ borderLeft: '2px solid var(--rule)' }}>
      <p className={`${LABEL} m-0`} style={{ ...MONO, color: 'var(--accent)' }}>
        연구 질문 {no}
      </p>
      <h3 className="text-[16.5px] font-semibold leading-[1.5] m-0" style={{ color: 'var(--ink)' }}>
        {title}
      </h3>
      <p className="text-[15.5px] leading-[1.7] max-w-[62ch] m-0" style={{ color: 'var(--ink-2)' }}>
        {children}
      </p>
    </div>
  );
}

export default function Appendix(): JSX.Element {
  return (
    <section id="after-night" aria-labelledby="after-night-h" className={`${s.band} ${s.appendix}`}>
      <OpenOnHash />
      <div className={`${s.wrap} ${s.appendixInner}`}>
        <div className={s.appendixHead}>
          <h2 id="after-night-h" className={s.appendixTitle}>
            밤 이후 <span>—</span> 자세히
          </h2>
          <p className={s.appendixLead}>
            기기가 잠든 뒤의 설계 노트. 폰 앱과의 비교, 구성도, 부품, 실험 설계, 위험, 로드맵, 출처를 접어 두었습니다. 필요한 칸만 펼쳐 보세요.
          </p>
        </div>

        <div className={s.folds}>
          <Fold id="problem" no="01" title="대상과 문제" hint="혼자 사는 20~30대 영어 학습자 · 앱을 더 이상 열지 않는 문제">
            <div className="grid gap-4">
              <p className={s.p}>
                언어 앱이 실패하는 건 기능이 모자라서라기보다, 사람이 앱을 더 이상 열지 않아서라고 본다. 이 프로젝트의 출발 가설이다. 그래서 기능을
                더하는 대신 &ldquo;누가 먼저 시작하나&rdquo;를 바꾼다.
              </p>
              <p className={s.p}>
                대상은 <b>혼자 사는 20~30대 영어 학습자</b>다. 집에서 영어로 말 걸어 줄 사람이 없다. 1인 가구는 전체 가구의 약 35%다(2023, 기사
                인용). 학원·학교처럼 여러 학습자를 관리하는 교실판은 이후 확장으로 둔다.
              </p>
            </div>
          </Fold>

          <Fold id="compare" no="02" title="폰 앱과 다른 점" hint="누가 시작 · 어디서 · 듣기 입력 · 기억 · 방해 · 타이밍 — 6가지 비교표">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[15px] leading-[1.6]">
                <caption className="sr-only">폰 영어 앱과 이 기기의 비교</caption>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--ink-2)' }}>
                    <th scope="col" className={`text-left font-normal py-2 pr-3 w-[22%] ${LABEL}`} style={{ ...MONO, color: 'var(--muted)' }}>
                      항목
                    </th>
                    <th scope="col" className={`text-left font-normal py-2 pr-3 w-[33%] ${LABEL}`} style={{ ...MONO, color: 'var(--muted)' }}>
                      폰 앱
                    </th>
                    <th scope="col" className={`text-left font-normal py-2 ${LABEL}`} style={{ ...MONO, color: 'var(--accent)' }}>
                      이 기기
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map((r) => (
                    <tr key={r.what} style={{ borderBottom: '1px solid var(--rule)' }}>
                      <th scope="row" className="text-left align-top py-3 pr-3 font-semibold" style={{ color: 'var(--ink)' }}>
                        {r.what}
                      </th>
                      <td className="align-top py-3 pr-3" style={{ color: 'var(--muted)' }}>
                        {r.app}
                      </td>
                      <td className="align-top py-3" style={{ color: 'var(--ink)' }}>
                        {r.device}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={`${s.p} mt-4`} style={{ color: 'var(--ink-2)' }}>
              핵심 기술은 <b>기억</b>이다. 대화에서 틀린 표현을 모아 두고, 며칠 간격을 늘려 가며 기기가 먼저 다시 묻는다.
            </p>
          </Fold>

          <Fold id="system" no="03" title="시스템 구성" hint="구성도 · LLM은 클라우드 API로(확정) · 기기 안 LLM은 쓰지 않는다 외 결정 4개">
            <SystemDiagram />
            <div className="grid gap-5 mt-8">
              <Decision what="LLM은 클라우드 API로 (확정)">
                받아쓰기·음성 합성은 기기나 브라우저에서 할 수 있는 만큼 하고, 대화 문장만 API로 보낸다. Claude Haiku 5.5(100만 토큰당 입력 $0.10 ·
                출력 $0.50) 기준으로 한 달 3시간쯤 쓰는 학생 한 명에 약 200원이다(추정).
              </Decision>
              <Decision what="기기 안 LLM은 쓰지 않는다">
                전부 기기 안에서 돌리는 방식은 대화 품질이 모자라 뺐다. 로컬 통화 연습 시제품(받아쓰기 → gemma4 → Kokoro 음성, 맥에서 평균 1.1초, 합성
                음성으로 잰 값)으로 음성 파이프라인 자체는 확인했다.
              </Decision>
              <Decision what="개인 ChatGPT·Claude 구독은 끌어 쓰지 않는다">구독 계정의 토큰을 뽑아 쓰는 방식은 약관 위반이라 하지 않는다.</Decision>
              <Decision what="기기에 묶이지 않는다">
                폰 웹앱·노트북·전용 기기가 같은 엔진을 쓴다. 실험에서 &ldquo;앱 모드&rdquo;와 &ldquo;기기 모드&rdquo;를 같은 대화 품질로 비교할 수
                있다.
              </Decision>
            </div>
          </Fold>

          <Fold id="hardware" no="04" title="하드웨어" hint="레이더 · 버튼 2개 + 마이크 LED · 마이크·스피커 · ESP32-S3 — 폰 근접은 이렇게 안다">
            <dl className="m-0 grid gap-4">
              {HARDWARE.map((h) => (
                <div key={h.part} className="pl-4" style={{ borderLeft: '2px solid var(--rule)' }}>
                  <dt className="text-[16.5px] font-semibold" style={{ color: 'var(--ink)' }}>
                    {h.part}
                  </dt>
                  <dd className="m-0 text-[15.5px] leading-[1.7]" style={{ color: 'var(--ink-2)' }}>
                    {h.why}
                  </dd>
                </div>
              ))}
            </dl>
            <h3 className="mt-8 mb-3 text-[17px] font-semibold" style={{ color: 'var(--ink)' }}>
              폰 근접은 이렇게 안다
            </h3>
            <ol className="m-0 pl-5 grid gap-2 text-[15.5px] leading-[1.7] max-w-[62ch] list-decimal" style={{ color: 'var(--ink)' }}>
              <li>기기가 BLE 비콘을 낸다.</li>
              <li>폰 앱이 비콘 영역에 들어온 걸 감지해 서버에 알린다.</li>
              <li>서버가 기기에 묻고, 기기가 레이더로 실제로 방에 있는지 확인한다.</li>
              <li>둘 다 맞으면 기기가 먼저 말을 건다.</li>
            </ol>
            <ul className="mt-4 m-0 p-0 list-none grid gap-2 max-w-[62ch]">
              <li className="pl-4 text-[15px] leading-[1.65]" style={{ borderLeft: '3px solid var(--accent)', color: 'var(--ink)' }}>
                iOS는 백그라운드 비콘 감지에 &ldquo;항상 허용&rdquo; 위치 권한이 필요할 것으로 본다(확인 필요).
              </li>
              <li className="pl-4 text-[15px] leading-[1.65]" style={{ borderLeft: '3px solid var(--accent)', color: 'var(--ink)' }}>
                감지 지연은 몇 초에서 몇십 초로 본다(추정). 그래서 &ldquo;문을 열자마자&rdquo;가 아니라 &ldquo;자리에 앉았을 때&rdquo; 말 걸도록
                설계한다.
              </li>
            </ul>
          </Fold>

          <Fold id="research" no="05" title="연구 질문과 실험 설계" hint="교차 설계 20~30명 · 앱 모드 2주 vs 기기 모드 2주 · 질문 3개">
            <div className="grid gap-6">
              <Question no="1 · 핵심" title="먼저 말 거는 기기가, 내가 여는 앱보다 더 자주·더 오래 쓰이나?">
                교차 설계. 참가자 20~30명이 앱 모드 2주, 기기 모드 2주를 쓰고 순서는 무작위로 정한다. 하루 말한 시간(분), 계속 쓰는 비율, 기기가 말
                걸었을 때 응답한 비율을 잰다.
              </Question>
              <Question no="2" title="어떤 신호로 말 거는 게 제일 나은가?">
                정해진 시간만 · 레이더만 · 폰 근접만 · 폰+레이더를 비교한다. 응답률과 잘못 말 건 횟수(사람이 없거나 바쁠 때)를 잰다.
              </Question>
              <Question no="3 · 보조" title="말하기 실력이 달라지나?">
                전후 말하기 점수 변화를 본다. 4주·소수 참가자라 예비 근거로만 말한다.
              </Question>
            </div>
            <p className={`${s.p} mt-6`} style={{ color: 'var(--ink-2)' }}>
              앞선 근거: 챗봇 언어 학습 메타분석에서 효과 크기 g≈0.53(Kim, 2023). 다만 대부분 작은 표본·짧은 기간 연구였고, 한국 학습자 대상 무작위
              대조 연구는 찾지 못했다.
            </p>
          </Fold>

          <Fold id="risks" no="06" title="위험과 대응" hint="귀찮음 · 사생활 · 참가자당 기기 값 · 음성 처리 비용">
            <dl className="m-0 grid gap-0" style={{ borderTop: '1px solid var(--rule)' }}>
              {RISKS.map((r) => (
                <div key={r.risk} className="grid gap-1 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6 py-4" style={{ borderBottom: '1px solid var(--rule)' }}>
                  <dt className="text-[16px] font-semibold" style={{ color: 'var(--ink)' }}>
                    {r.risk}
                  </dt>
                  <dd className="m-0 text-[15.5px] leading-[1.7]" style={{ color: 'var(--ink-2)' }}>
                    {r.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </Fold>

          <Fold id="roadmap" no="07" title="로드맵" hint="6단계 · 지금은 웹 가상 기기 데모 → 폰 웹앱 → 기기 시제품 → 교차 실험">
            <ol className="list-none m-0 p-0 grid gap-4">
              {ROADMAP.map((r, i) => (
                <li key={r.step} className="pl-4 grid gap-0.5" style={{ borderLeft: r.now ? '3px solid var(--accent)' : '2px solid var(--rule)' }}>
                  <p className="text-[16.5px] font-semibold m-0" style={{ color: 'var(--ink)' }}>
                    <span className="mr-2 text-[13px]" style={{ ...MONO, color: r.now ? 'var(--accent)' : 'var(--muted)' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {r.step}
                    {r.now && (
                      <span className="ml-2 text-[12.5px]" style={{ ...MONO, color: 'var(--accent)' }}>
                        지금
                      </span>
                    )}
                  </p>
                  <p className="text-[15.5px] leading-[1.65] m-0" style={{ color: 'var(--ink-2)' }}>
                    {r.detail}
                  </p>
                </li>
              ))}
            </ol>
          </Fold>

          <Fold id="sources" no="08" title="숫자와 출처" hint="g≈0.53(Kim, 2023) · 1인 가구 약 35% · 약 200원 · 1.1초 · 사진">
            <ul className="m-0 p-0 list-none grid gap-3 max-w-[66ch] text-[15.5px] leading-[1.65]">
              <li>
                <b>효과 크기 g≈0.53</b> — 챗봇 언어 학습 메타분석(Kim, 2023). 대부분 작은 표본·짧은 기간 연구.
              </li>
              <li>
                <b>1인 가구 약 35%</b> — 전체 가구 중 비율(2023, 기사 인용).
              </li>
              <li>
                <b>약 200원</b> — 학생 1명이 한 달 3시간쯤 쓸 때 대화 API 비용. 추정 · Claude Haiku 5.5 가격 기준(100만 토큰당 입력 $0.10 · 출력 $0.50).
              </li>
              <li>
                <b>1.1초</b> — 로컬 음성 파이프라인 평균 응답(받아쓰기 → gemma4 → Kokoro). 맥 시제품 · 합성 음성으로 잰 값.
              </li>
              <li>
                <b>4가지</b> — 먼저 말 거는 신호 비교(정해진 시간 · 레이더 · 폰 근접 · 폰+레이더). 연구 질문 2 · 계획.
              </li>
              <li>
                <b>사진</b> — 실제 촬영이 아니라 이 작업용 맥에서 오픈소스 모델(FLUX.2 klein 4B, Apache-2.0)로 만든 AI 이미지. 사람·실제 제품은 나오지 않는다.
              </li>
            </ul>
          </Fold>
        </div>
      </div>
    </section>
  );
}
