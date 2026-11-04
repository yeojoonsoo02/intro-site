import Image from 'next/image';
import ChatReveal from './ChatReveal';
import { REVIEW_STEPS, type Line, type SceneData } from './content';
import s from './story.module.css';

// 하루의 한 장면: 큰 시각 + 이 순간이 보여 주는 기술 한 문단 + 기기와 나의 말풍선 (+ 같은 방 사진).

const TONE: Record<SceneData['tone'], string> = {
  morning: s.morning,
  noon: s.noon,
  afternoon: s.afternoon,
  evening: s.evening,
  night: s.night,
};

/** 줄마다 연출 시작 시각(초). 기기 말은 입력 중 점이 먼저 나와서 길다. */
function delays(lines: Line[]): number[] {
  let t = 0;
  return lines.map((l) => {
    const at = t;
    t += l.who === 'device' ? 1.15 : l.who === 'me' ? 0.7 : 0.5;
    return Math.round(at * 100) / 100;
  });
}

/** 기기 얼굴: 둥근 패브릭 몸통 + 윗면 LED 링(연출 때 깜박인다) */
export function DeviceFace({ className }: { className: string }): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 38 38" aria-hidden="true" focusable="false">
      <circle cx="19" cy="19" r="18" style={{ fill: 'var(--card)' }} />
      <ellipse className={s.ledGlow} cx="19" cy="15" rx="13" ry="5.5" />
      <path d="M6.5 16.5 C6.5 27 10 29.5 19 29.5 C28 29.5 31.5 27 31.5 16.5 Z" fill="#3a3d45" />
      <ellipse cx="19" cy="16" rx="12.5" ry="4" fill="#4a4e58" />
      <ellipse className={s.led} cx="19" cy="16" rx="12.5" ry="4" fill="none" strokeWidth="1.6" />
    </svg>
  );
}

function ChatLine({ line, d }: { line: Line; d: number }): JSX.Element {
  const style = { '--d': `${d}s` } as React.CSSProperties;
  switch (line.who) {
    case 'device':
      return (
        <li className={s.dev} style={style}>
          <DeviceFace className={s.avatar} />
          <div className={s.bubbleCell}>
            <span className={s.typing} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <p className={`${s.bubble} m-0`} lang={line.lang}>
              <span className="sr-only">기기: </span>
              {line.text}
            </p>
          </div>
        </li>
      );
    case 'me':
      return (
        <li className={s.me} style={style}>
          <p className={`${s.bubble} m-0`} lang={line.lang}>
            <span className="sr-only">나: </span>
            {line.text}
          </p>
        </li>
      );
    case 'press':
      return (
        <li className={s.press} style={style}>
          <span className={s.pressKey}>
            <span className="sr-only">내가 기기의 버튼을 누름: </span>
            <small aria-hidden="true">버튼</small>
            {line.text}
          </span>
        </li>
      );
    case 'note':
      return (
        <li className={s.note} style={style}>
          {line.text}
        </li>
      );
  }
}

const LAYOUT: Record<SceneData['layout'], { grid: string; time: string }> = {
  photoRight: { grid: s.withPhoto, time: '' },
  compact: { grid: s.compact, time: s.timeSmall },
  word: { grid: '', time: s.timeWord },
  mirror: { grid: s.mirror, time: '' },
  center: { grid: s.center, time: s.timeLarge },
};

export default function Scene({ scene }: { scene: SceneData }): JSX.Element {
  const ds = delays(scene.lines);
  const lay = LAYOUT[scene.layout];
  return (
    <section id={scene.id} aria-labelledby={`${scene.id}-h`} className={`${s.band} ${TONE[scene.tone]} ${s.scene}`}>
      <div className={s.wrap}>
        <div className={`${s.sceneGrid} ${lay.grid}`}>
          <div className={s.sceneText}>
            <h2 id={`${scene.id}-h`} className={s.h2}>
              <span className={`${s.time} ${lay.time}`}>
                <span className={s.part}>{scene.part}</span>
                {scene.time}
              </span>
              <span className={s.sceneTitle}>{scene.title}</span>
            </h2>
            <p className={s.tech}>
              <span className={s.techDot} aria-hidden="true" />
              {scene.tech}
            </p>
            <p className={s.body}>{scene.body}</p>
            {scene.aside && <p className={s.aside}>{scene.aside}</p>}
          </div>

          <div className={s.sceneChat}>
            <ChatReveal className={s.chat} label={`${scene.time} 장면의 대화`}>
              {scene.lines.map((l, i) => (
                <ChatLine key={`${l.who}-${l.text}`} line={l} d={ds[i]} />
              ))}
            </ChatReveal>
            {scene.tone === 'night' && (
              <div className={s.steps}>
                <p className={`${s.mono} m-0`}>맞히면 다음 복습까지 간격이 늘어난다 (데모 기준) · 틀리면 다음 날 다시</p>
                <ol aria-label="복습 간격">
                  {REVIEW_STEPS.map((st, i) => (
                    <li key={st}>
                      {i > 0 && (
                        <span className={s.stepArrow} aria-hidden="true">
                          →
                        </span>
                      )}
                      <span className={s.step}>{st}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {scene.photo && (
            <div className={s.scenePhoto}>
              <figure className={s.photo}>
                <Image
                  src={scene.photo.src}
                  alt={scene.photo.alt}
                  fill
                  sizes="(min-width: 900px) 420px, 100vw"
                  style={{ objectPosition: scene.photo.position ?? '50% 50%' }}
                />
                <span className={s.chip}>AI 이미지 · 로컬 FLUX.2 klein</span>
              </figure>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
