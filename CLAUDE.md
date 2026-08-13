# intro-site

개인 소개 사이트. 다국어 랜딩 + 포트폴리오/여정 + **Gemini 챗봇(RAG)** + 방문자·피드백 수집.

> `README.md`는 `create-next-app` 기본 템플릿에 Firebase·Gemini 문단만 덧댄 상태다. **구조 파악은 README가 아니라 이 문서를 본다.**

## 1. 스택

Next.js **16 App Router** (`src/app/`) · React 18 · TypeScript · Tailwind
Firebase (Auth + Firestore) · Google Generative AI(Gemini) · react-i18next
Vercel 배포 (GitHub Actions `deploy.yml` — main push 시 type-check → lint → build → deploy)

**Firebase는 Auth와 Firestore만 쓴다.** `firebase.json`에 `firestore.rules`만 있고 Hosting 설정은 없다 — 호스팅은 Vercel이다. Firebase Hosting으로 배포하려 들지 말 것.

⚠️ **Firestore 규칙은 Vercel 파이프라인이 배포하지 않는다.** `firestore.rules`를 고쳤으면 별도로 `firebase deploy --only firestore:rules`를 쳐야 반영된다. 대상 프로젝트는 `.firebaserc`의 **`intro-site-e88aa`** — 이 파일이 없으면 CLI가 전역 활성 프로젝트(다른 프로젝트일 수 있음)로 배포해버리므로 지우지 말 것. 배포 전 `--dry-run`으로 컴파일 확인.

## 2. 다국어 — 루트가 한국어다

```
/          한국어 (대표본, 별도 /ko 없음)
/en /ja /zh /es /fr /de /pt /ru
```

`src/middleware.ts`가 브라우저 `Accept-Language`를 보고 해당 로케일로 보낸다. **한국어 선호 사용자는 루트에 머문다.**

⚠️ **검색엔진·AI 크롤러는 리디렉트하지 않고 루트에 그대로 둔다** — `middleware.ts` 상단 `BOTS` 정규식이 그 장치다(googlebot·yeti·claudebot·gptbot·perplexitybot 등). 색인 안정성을 위한 의도된 동작이니 "봇 예외 처리가 왜 있지" 하고 지우지 말 것. 새 크롤러 UA를 추가할 일은 있어도 제거할 일은 없다.

로케일을 추가하면 **라우트 디렉토리(`/{lang}/page.tsx` + `/{lang}/about/page.tsx`) · `ROUTE_BY_LANG` 매핑 · `lib/i18n-config.ts` · sitemap/hreflang · `lib/seo-utils.ts` · `api/portfolio`의 `ALLOWED_LANGS` · `api/indexnow`의 `DEFAULT_URLS` · `public/locales/*.json` · `features/profile/defaultProfiles.ts` · `app/about/factLabels.ts`** 를 함께 손봐야 한다. 하나만 고치면 조용히 어긋난다.

**`/about`은 9개 언어 전부 있다.** 본문은 `app/about/AboutContent.tsx` 하나를 공유하고 로케일별 `page.tsx`는 메타데이터만 갖는다. 데이터는 서버에서 Firestore를 직접 읽는다(`aboutData.ts`, 10분 캐시) — 클라이언트에서 읽으면 googleapis가 차단된 망에서 비어버린다. **포트폴리오 데이터는 ko·en·ja·zh에만 있어** 나머지 5개 언어는 기술 스택·자격증만 영어 데이터로 채우고 산문형 섹션(후기·목표·가치관)은 아예 표시하지 않는다 — 없는 내용을 번역해 지어내지 않기 위함이다.

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

## 5. 시크릿

`.env.local`(로컬) / Vercel 환경변수(프로덕션). `.env.example`에 키 이름만 둔다.
`firebaseAdmin.ts`가 쓰는 서비스 계정 키, `GEMINI_API_KEY`, 텔레그램·카카오 웹훅 토큰이 여기 해당한다.

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

**push 전 최소 `type-check` + `lint`** — 실패하면 GitHub Actions가 배포 전에 막는다.

## 7. 커밋

Conventional Commits + 스코프: `feat(chat):`, `fix(seo):`, `chore(chat):`
main push = 프로덕션 배포다. 확인 없이 main에 올리지 않는다.
