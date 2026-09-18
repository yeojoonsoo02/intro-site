# intro-site

개인 소개 사이트. 다국어 랜딩 + 포트폴리오/여정 + **Gemini 챗봇(RAG)** + 방문자 수 집계.

> `README.md`는 `create-next-app` 기본 템플릿에 Firebase·Gemini 문단만 덧댄 상태다. **구조 파악은 README가 아니라 이 문서를 본다.**

## 1. 스택

Next.js **16 App Router** (`src/app/`) · React 18 · TypeScript · Tailwind
Firebase (Auth + Firestore) · Google Generative AI(Gemini) · react-i18next(리소스 번들, 플러그인 없음)
Vercel 배포 (GitHub Actions `deploy.yml` — main push 시 type-check → lint → build → deploy)

**Firebase는 Auth와 Firestore만 쓴다.** 브라우저의 Firestore 클라이언트 SDK는 이제 쓰지 않는다 — 읽기는 전부 서버 API(`/api/profile`, `/api/portfolio`)나 서버 컴포넌트(Admin SDK)를 거친다(googleapis가 차단된 망 대응). `firebase.json`에 `firestore.rules`만 있고 Hosting 설정은 없다 — 호스팅은 Vercel이다.

**콘텐츠 편집 경로는 Firebase 콘솔 또는 서비스 계정 스크립트뿐이다.** 관리자 편집 UI(/admin)는 2026-09에 제거했고, `firestore.rules`는 `profiles`·`portfolio`의 클라이언트 쓰기를 전면 차단한다. 관리자 이메일로 로그인해도 브라우저에서 쓸 수 없는 게 정상이다.

⚠️ **Firestore 규칙은 Vercel 파이프라인이 배포하지 않고, firebase CLI도 쓰지 못한다**(이 머신의 CLI 계정에 프로젝트 권한이 없어 엉뚱한 프로젝트로 갈 수 있다). `.env.local`의 서비스 계정으로 Rules REST API(룰셋 생성 → `releases/cloud.firestore` 전환)를 호출한다. 대상 프로젝트는 **`intro-site-e88aa`**(`.firebaserc`, 지우지 말 것).

## 2. 다국어 — 루트가 한국어다

```
/          한국어 (대표본, 별도 /ko 없음)
/en /ja /zh /es /fr /de /pt /ru
```

`src/middleware.ts`가 브라우저 `Accept-Language`를 보고 해당 로케일로 보낸다. **한국어 선호 사용자는 루트에 머문다.** `/ko`는 루트로 308 통합된다(`next.config.ts`).

**라우트는 두 개뿐이다.** 8개 로케일의 홈은 `app/[lang]/page.tsx`, 소개는 `app/[lang]/about/page.tsx`가 `generateStaticParams`로 만든다. 한국어는 `app/page.tsx`·`app/about/page.tsx`. 언어별로 다른 건 메타데이터·짧은 라벨뿐이라 `app/homePage.tsx`·`app/about/aboutPage.tsx`의 표 하나에 산다.

⚠️ **`app/loading.tsx`를 만들지 말 것.** `[lang]`이 1단계 경로를 전부 받으므로 `/xx` 같은 미지의 경로는 페이지의 `notFound()`로 404가 된다. 루트에 loading.tsx(Suspense 경계)가 있으면 200 셸이 먼저 흘러가 프로덕션에서 소프트 404(200)가 되고, 루트 레이아웃의 `notFound()`는 Next 16에서 허용되지 않는다. 2026-09에 실제로 겪은 문제다.

**홈은 서버 컴포넌트다**(`app/homeData.ts`가 admin SDK로 profiles/main_{lang} + 대표 프로젝트 4개 + 블로그 최근 글을 읽고 10분 캐시). 프로필 카드·/api/profile은 없다.

⚠️ **검색엔진·AI 크롤러는 리디렉트하지 않고 루트에 그대로 둔다** — `middleware.ts` 상단 `BOTS` 정규식이 그 장치다(googlebot·yeti·claudebot·gptbot·perplexitybot 등). 색인 안정성을 위한 의도된 동작이니 "봇 예외 처리가 왜 있지" 하고 지우지 말 것. 새 크롤러 UA를 추가할 일은 있어도 제거할 일은 없다.

**지원 언어의 단일 출처는 `src/lib/site.ts`다**(`LANGS`·경로/hreflang·OG locale·BCP-47). 라우트·sitemap·IndexNow·미들웨어·API 언어 검증·JSON-LD가 전부 여기서 파생된다. 로케일을 추가하면 `site.ts`의 `LANGS`에 넣고, 문자열 표들 — `src/locales/{lang}.json` · `app/homePage.tsx` · `app/about/aboutPage.tsx` · `features/profile/defaultProfiles.ts` · `app/about/factLabels.ts` · `components/seo/schemas/{profilePage,website}.ts` · `components/seo/SEOProfile.tsx` — 를 채우면 타입 오류가 빠진 곳을 알려준다.

**`/about`은 9개 언어 전부 있다.** 본문은 `app/about/AboutContent.tsx` 하나를 공유한다. 데이터는 서버에서 Firestore를 직접 읽는다(`aboutData.ts`, 10분 캐시) — 클라이언트에서 읽으면 googleapis가 차단된 망에서 비어버린다. **포트폴리오 데이터는 ko·en·ja·zh에만 있어** 나머지 5개 언어는 기술 스택·학력만 영어 데이터로 채우고 산문형 섹션(목표·가치관)은 아예 표시하지 않는다 — 없는 내용을 번역해 지어내지 않기 위함이다.

**i18n.** UI 문자열은 `src/locales/*.json`을 번들에 넣어 i18next `resources`로 준다(런타임 fetch·언어 감지 플러그인 없음). **서버는 요청마다 `createI18n(lang)` 인스턴스를 만든다**(`I18nProvider`가 layout에서 lang을 받음) — 모듈 싱글턴의 언어를 요청마다 바꾸면 동시 요청이 섞이고, 서버가 ko로만 렌더하면 /zh 등에서 하이드레이션이 깨진다(2026-09 실제 발생). 클라이언트는 `<html lang>`과 같은 언어로 시작하는 싱글턴. 언어 변경은 `lib/locale.ts`의 `setLocale(i18n, lang)`으로만(i18next·localStorage·`NEXT_LOCALE` 쿠키·`<html lang>`을 한 번에). 서버 컴포넌트는 같은 사전을 `app/about/labels.ts`로 읽는다.

## 3. Next 16인데 `middleware.ts`를 쓰고 있다

Next 16에서 `middleware.ts`는 deprecated이고 `proxy.ts`로 이름이 바뀌었다(전역 `rules/nextjs.md`). 이 저장소는 아직 `src/middleware.ts`다 — **현재는 동작하지만 다음 메이저에서 깨진다.** 형제 프로젝트 `../Gomath_web`은 이미 `proxy.ts`로 옮겼으니 이관 시 그쪽을 참고한다.

그 외 Next 16 항목도 적용된다: `params`/`searchParams`는 Promise(`await`), `useSearchParams()` 쓰는 컴포넌트는 `<Suspense>` 필수, 캐시는 명시적 opt-in.

React는 아직 **18.3.1**이다(Next 16 + React 18 조합). 19 전용 API를 쓰지 않는다.

## 4. 챗봇 — 두 개의 경로와 살아있는 컨텍스트

`/api/gemini`로 POST. **`GEMINI_API_KEY`가 있으면 서버가 직접 처리하고, 없으면 외부 Cloud Run 서비스로 포워딩한다**(`NEXT_PUBLIC_GEMINI_API_URL`). 챗봇이 "왜 다른 답을 하지" 싶으면 **어느 경로를 타는지부터** 확인한다.

컨텍스트 구성:
- `src/data/knowledge.ts` — 정적 지식 베이스
- `lib/rag.ts` · `chunks.ts` · `embeddings.ts` — 청킹·임베딩·검색
- `lib/blogContext.ts` — **네이버 블로그 RSS를 근황 컨텍스트로 주입** (캐시 TTL 24시간)

블로그 RSS TTL을 줄이면 외부 호출이 늘어난다. 1시간 → 24시간으로 올린 이력이 있으니 되돌리지 말 것.

`lib/rateLimit.ts` 적용 대상이다 — 챗 API는 비용이 나가는 경로다.

**페르소나.** 챗봇은 "준수 정보로 만든 AI 분신"이다 — 1인칭으로 말하되 "AI냐"고 물으면 속이지 않는다. 말투는 긍정적·담백, 1~3문장, 추임새("음")로 시작하지 않음, 문단 나누기·되풀이 맞장구 금지. 2026-09-17 실대화 테스트에서 "음," 남발·취향 모순(매운 거 못 먹는데 짬뽕)·AI 부정을 고친 결과다.

**개인정보 경계.** 실시간 컨텍스트(`lib/liveContext`)는 위치(현재·최근 이동 기록·날짜별 머문 곳)와 수면(기록일·취침/기상·단계)을 **그대로 넘기고**, 할 일 목록과 GPS 좌표는 넘기지 않는다. 챗봇은 위치·수면 시각·집/학교 위치 질문에 답한다 — 2026-09-10에 막았다가 2026-09-16 본인 결정으로 다시 열었다. 생일은 월·일까지 모델에 준다(`lib/dateContext.ts`, 2026-09-17 공개). “개인정보가 새는 버그”로 보고 다시 막지 말 것. 서버 캐시 4곳(live·blog·portfolio·about)은 `lib/cached.ts` 헬퍼를 쓴다.

## 5. 시크릿

`.env.local`(로컬) / Vercel 환경변수(프로덕션). `.env.example`에 키 이름만 둔다.
`firebaseAdmin.ts`가 쓰는 서비스 계정 키, `GEMINI_API_KEY`, 실시간 컨텍스트·카카오 알림 토큰이 여기 해당한다.

> Vercel env 설정 시 `echo` 파이프 금지(개행 포함) → `printf` 사용, 설정 후 `vercel env pull`로 빈 값·`\n` 둘 다 검증 (전역 규칙).

## 6. 명령어

```bash
npm run dev
npm run build
npm run type-check      # tsc --noEmit — CI가 이걸 먼저 돌린다
npm run lint            # eslint src tests
npm run test:e2e        # playwright (최초 1회 test:e2e:install)
npm run indexnow        # 색인 즉시 제출
npm run embeddings:build # 지식 청크 임베딩 사전계산 (GEMINI_API_KEY 필요)
```

⚠️ **`src/data/knowledge.ts`를 고쳤으면 `npm run embeddings:build`를 함께 돌린다.** 청크 임베딩은 빌드 타임에 계산해 `src/data/chunkEmbeddings.generated.ts`에 넣어둔다(콜드스타트마다 임베딩 API를 부르지 않기 위함). 재생성을 잊으면 해시가 어긋난 청크만 런타임에 실시간 임베딩으로 폴백하고 서버 로그에 경고가 남는다 — 동작은 하지만 아끼려던 비용이 다시 나간다.

**push 전 최소 `type-check` + `lint`** — 실패하면 GitHub Actions가 배포 전에 막는다. CI는 Playwright를 돌리지 않으니 라우팅·404를 건드렸으면 `npm run test:e2e`를 로컬에서 직접 돈다.

**포트폴리오는 케이스 스터디 구조다**(2026-09 개편, 근거: 채용 담당자·시니어 조사). `Project`에 summary/status/period/role/context/problem/decisions/highlights/outcome/lessons가 있고 데이터 없는 섹션은 렌더하지 않는다. 대표 4개(featured, order 1~4)는 크게 — 홈은 첫 번째를 5:3으로 크게, 나머지 셋을 옆에 세로로, 나머지는 아카이브 행. **수치·기간·이유를 모르면 비워 둔다 — 지어내지 않는다.** 로그인 게이트는 없앴다(리뷰어의 20초 예산). personalInfo·hobbies는 챗봇용으로만 남아 화면에 없다.

**디자인 시스템**(`globals.css`): 토큰 --paper/--surface/--ink/--muted/--rule/--accent(#b5402c, 유일한 강조색)/--font-serif(Noto Serif KR, 제목만)/--font-sans(Pretendard). 카탈로그 선택은 명조+고딕 혼용·5:3 비대칭·border-left 수작업 디테일 세 가지. 기존 이름(--primary·--foreground 등)은 alias. 그림자는 2층, 다크는 border. Tailwind 기본 파랑·그라디언트·스킬 바·균일 3칸 카드는 넣지 않는다.

**콘텐츠 정본.** 챗봇 정본은 `src/data/knowledge.ts`, 화면 데이터는 Firestore(`portfolio/*_{lang}`, `profiles/main_{lang}`). 영문 표기는 "Junsu Yeo"(이전 표기 Yeojunsu는 alternateName·키워드로만), 직업은 "대학생 개발자", 기술 스택은 세 곳(knowledge·Firestore skills·JSON-LD)이 같은 합집합을 갖는다. 하나를 고치면 셋을 같이 고친다.

## 7. TemuTemu 팀 공간 (task.yeojoonsoo02.com)

같은 Vercel 프로젝트에 붙은 서브도메인. 루트는 `next.config.ts` host 리디렉트로 `public/task.html`로 간다. 페이지는 **정적 HTML**(`public/task*.html` + `task-common.js/css`)이고 API는 `src/app/api/task/*`.

- 로그인: 이름 8명 중 선택 + 개인 비밀번호. 해시는 Firestore `task_members/{id}`(scrypt), 세션은 `TASK_SESSION_SECRET` HMAC 쿠키. 8회 실패 시 15분 잠금. 멤버 목록은 `src/lib/task/auth.ts`
- 시간표: `task_timetables/{id}` — 읽기 공개, 본인만 수정
- 파일: Vercel Blob 스토어 `temutemu-files`(`task/` 경로, 공개 URL) + 목록 `task_files`. 업로드는 브라우저 직접(`/api/task/upload` 토큰), 삭제는 올린 사람만
- 비밀번호 재발급은 서비스 계정으로 `task_members` 문서의 hash/salt를 교체한다(평문은 어디에도 저장하지 않음)

## 8. 커밋

Conventional Commits + 스코프: `feat(chat):`, `fix(seo):`, `chore(chat):`
main push = 프로덕션 배포다. 확인 없이 main에 올리지 않는다.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
