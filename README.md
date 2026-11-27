# 웹 트래픽 대시보드

[dashboard-react-next](https://github.com/0plan/dashboard-react-next)는 데모 계정으로 로그인해 최근 7일 또는 30일의 방문 수와 모바일·PC 비중을 보는 앱입니다. 영어 이름은 **Web Traffic Dashboard**입니다. 데이터베이스나 외부 분석 서비스 없이 로컬 샘플 데이터로 동작합니다.

## 로컬 실행

검증 환경: **Node.js 22.23.1**, **pnpm 10.34.9**. Next.js 16.4.6 App Router, React/React DOM 19.3.1, TypeScript 5.8.3, Tailwind CSS 4.3.5, shadcn/ui를 사용합니다.

```bash
pnpm install --frozen-lockfile
pnpm dev --hostname 127.0.0.1 --port 3000
```

[http://localhost:3000](http://localhost:3000)을 엽니다. 데모 이메일은 `demo@example.com`, 비밀번호는 `traffic-demo`이며 폼에 미리 입력되어 있습니다.

**프로덕션 실행:** 개발 서버를 종료한 뒤 같은 저장소에서 다음을 실행합니다.

```bash
pnpm build
pnpm start --hostname 127.0.0.1 --port 3000
```

기본 빌드 산출물은 `.next/`입니다. `next start`에는 `.next/`의 운영 빌드(`BUILD_ID`, `server/`, `static/` 포함), `public/`, `next.config.mjs`, `package.json`, 설치된 운영 의존성이 필요합니다. 이미 빌드된 파일과 `pnpm-lock.yaml`을 받은 경우 `pnpm install --prod --frozen-lockfile` 후 위의 `pnpm start` 명령만 실행하면 됩니다. 정적 파일 서버만으로는 로그인과 요청별 SSR이 동작하지 않습니다. 브라우저가 localhost 밖의 운영 서버에 접속할 때는 HTTPS를 사용합니다.

## 인증·언어·테마

1024px 이상에서는 사이드바를 접어 아이콘만 남길 수 있고, 작은 화면에서는 **메뉴 열기**로 서랍을 엽니다. 상위 메뉴를 펼치면 아래의 독립 화면으로 이동합니다.

| 상위 메뉴 | 하위 메뉴 | 할 수 있는 일 |
| --- | --- | --- |
| 회원 관리 | 회원 목록 · 가입 현황 | 이름·이메일 검색, 이용 정지·재개, 가입 월별 집계 |
| 매출 관리 | 주문 내역 · 매출 요약 | 주문 검색, 입금 확인, 결제 완료 주문의 월별 매출 조회 |
| 사이트 관리 | 기본 설정 · 공지 관리 | 사이트 이름·문의 이메일 저장, 공지 게시·초안 전환 |

관리 개요에서 입금 대기·정지 회원·미게시 공지 수를 누르면 해당 조건의 목록으로 이동합니다. 변경은 현재 데모 세션에만 적용되며 로그아웃하면 초기화됩니다.

방문 보고서 안의 **개요·차트·일별 내역**은 같은 기간을 사용합니다. 최초 HTML에는 실제 데이터가 들어 있습니다. JavaScript가 켜져 있으면 새 기간을 요청하는 동안 숫자·차트·표 행 자리에 각각 스켈레톤을 표시하며, 꺼져 있어도 조회 폼과 탐색 링크가 작동합니다.

- `/`는 서버에서 세션을 확인해 `/login` 또는 `/dashboard`로 보냅니다. 대시보드 지표와 SVG 차트 두 개가 초기 HTML에 포함됩니다. JavaScript 없이도 로그인·로그아웃, 기간 선택, 언어 전환이 동작합니다.
- `next-common.demo-session`은 `HttpOnly`, `SameSite=Lax`, 운영 환경에서는 `Secure`인 세션 쿠키입니다. 무작위 ID만 저장하고 서버가 유효성을 확인합니다. 세션은 단일 Node 프로세스 메모리에서 최대 8시간 유지되며 로그아웃하면 즉시 폐기되고 재시작하면 사라집니다.
- `next-common.language`는 1년간 유지되며 기본값은 `ko`입니다. 언어를 바꿔도 현재 기간과 404 경로·쿼리를 보존합니다. 라이트·다크 전환은 JavaScript로 동작하고 기존 `localStorage` 키 `theme`를 사용합니다.

## 방문 지표

[`lib/traffic.json`](./lib/traffic.json)의 2026년 9월 샘플 30일 중 마지막 7일(기본) 또는 30일을 집계합니다. 일평균은 반올림한 값입니다.

| 기간 | 총 방문 | 일평균 | 일 최고 | 모바일 | PC |
| --- | ---: | ---: | --- | ---: | ---: |
| 7일 (9/24–9/30) | 10,489 | 1,498 | 9/29 · 1,790 | 6,192 | 4,297 |
| 30일 (9/1–9/30) | 36,639 | 1,221 | 9/29 · 1,790 | 21,532 | 15,107 |

## 페이지와 번역 추가

[`locales/ko`](./locales/ko)와 [`locales/en`](./locales/en)의 `common.json`은 공용 메뉴와 앱명(`appName`), `login.json`, `dashboard.json`, `not-found.json`은 각 화면의 문구입니다. 앱명은 헤더·푸터·페이지 제목이 함께 사용합니다.

1. 예를 들어 `/billing`를 추가한다면 양쪽 언어 폴더에 `billing.json`을 만들고 각각 `{"title":"설정"}`, `{"title":"Settings"}`처럼 같은 키를 넣습니다. `{{count}}` 같은 치환자도 양쪽에서 일치해야 합니다.
2. [`lib/i18n.ts`](./lib/i18n.ts)의 `Messages`에 `billing: typeof import("@/locales/ko/billing.json");`을 추가합니다.
3. `app/(traffic)/billing/page.tsx`를 서버 컴포넌트로 만들고 `const t = await getMessages("billing")`로 문구를 읽습니다. `generateMetadata()`에서 `{ title: t.title }`을 반환하면 루트 레이아웃이 앱명을 붙입니다. 보호할 페이지는 대시보드처럼 `await hasDemoSession()`을 먼저 확인합니다.
4. `pnpm check:i18n`으로 언어별 파일·키·치환자와 빈 번역을 검사합니다. 빌드에서도 같은 검사가 실행됩니다.

## 검증과 의존성 감사

```bash
pnpm lint
pnpm typecheck
pnpm check:i18n
pnpm build
npm_config_registry=https://registry.npmjs.org pnpm audit
npm_config_registry=https://registry.npmjs.org pnpm audit --prod
```

`pnpm start`로 서버를 띄운 상태에서 다른 터미널에서 `PORT=3000 pnpm check:traffic`을 실행합니다. 실제 HTTP 응답으로 인증 리다이렉트, 로그인 실패·성공, 지표와 SVG, 한국어·영어 404, 앱명, 로그아웃 후 기존 쿠키 거부를 확인합니다.

린트는 [Next.js가 지원하는 ESLint 10](https://nextjs.org/docs/app/api-reference/config/eslint)과 `core-web-vitals` 규칙을 사용합니다. Next 설정에 포함된 `eslint-plugin-react`, `eslint-plugin-import`, `eslint-plugin-jsx-a11y`는 아직 ESLint 9까지만 peer로 선언해 의존성을 다시 해석할 때 경고가 날 수 있습니다.

## 같은 대시보드의 다른 구현

- [dashboard-react-vite](https://github.com/0plan/dashboard-react-vite) — React + Vite
- [dashboard-vue-vite](https://github.com/0plan/dashboard-vue-vite) — Vue + Vite
- [dashboard-vue-nuxt](https://github.com/0plan/dashboard-vue-nuxt) — Vue + Nuxt
