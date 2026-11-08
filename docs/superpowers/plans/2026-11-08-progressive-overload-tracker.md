# 점진적 과부하 운동 기록 앱 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 아이폰 사파리에서 홈 화면에 추가해 쓰는 웹앱으로, 운동별 세트(무게·횟수)를 기록하면 다음 추천 무게를 계산해 보여준다.

**Architecture:** 빌드 도구 없는 순수 HTML/CSS/JS(ES 모듈). 추천 규칙·저장·검색·타이머는 화면과 분리된 순수 모듈로 만들고 `node --test`로 검증한다. 화면은 해시 라우터 하나와 화면별 모듈로 나눈다. 서비스 워커로 오프라인을 지원한다.

**Tech Stack:** HTML/CSS/JS(ES modules), `localStorage`, Service Worker, Node 26 내장 테스트 러너(`node --test`), GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-11-08-progressive-overload-tracker-design.md`

## Global Constraints
- 프레임워크·번들러·npm 의존성 없음. 런타임은 정적 파일만.
- 앱 화면 언어는 한국어. 운동 이름·부위는 영어(기본) + 한국어 병기. 검색은 영어·한국어 모두.
- 서버·로그인 없음. 기록은 `localStorage`, 백업은 JSON 내보내기/가져오기.
- 오프라인 동작(서비스 워커). 모든 경로는 상대 경로(GitHub Pages 하위 경로 `/health_application/`에서 동작).
- 운동 데이터는 free-exercise-db(Unlicense). 이미지는 운동당 첫 장(`0.jpg`)만 포함.
- 기본값: 목표 12회, 증량 5kg, 기준 3세트, 휴식 90초. 덤벨(`equipment === "dumbbell"`)은 증량 2kg.
- 추천 규칙: W = 마지막 기록의 가장 무거운 무게. 달성 세트 수 = W로 한 세트 중 `reps >= targetReps`인 수. 달성 ≥ `qualifyingSets` → W + `increment`, 아니면 W. 기록 없으면 `null`.
- 단위 kg, 소수 허용.
- 커밋은 사용자가 요청할 때만 한다. 각 태스크 끝은 "체크포인트"로 테스트 통과만 확인한다.
- 셸: PowerShell에서 `node`가 PATH에 없으면 `$env:Path += ";C:\Program Files\nodejs"`, bash에서는 `export PATH="$PATH:/c/Program Files/nodejs"`.

## Review Focus
1. 빈칸·0·음수·NaN 입력된 세트(횟수 비움, 무게 0): 무시하고 저장/계산에 반영하지 않는다. → Task 1, 8
2. 소수 무게 합산(`62.5 + 2.5`, `0.1 + 0.2` 류): 화면에 `65.00000001`이 보이면 안 된다. → Task 1
3. 저장소가 깨졌거나(잘못된 JSON) 접근 불가: 앱은 빈 상태로 정상 기동한다. 잘못된 가져오기 파일은 기존 기록을 덮어쓰지 않는다. → Task 2
4. 같은 날 같은 운동을 두 번 저장: 별도 기록으로 쌓이고 추천은 가장 최근 기록 기준. → Task 2
5. 검색어가 대소문자 혼합·한글·공백뿐이거나 결과가 0건: 오류 없이 빈 목록 표시. → Task 4
6. 탭이 백그라운드로 가거나 폰이 잠겼다 돌아옴: 타이머는 틱 횟수가 아니라 종료 시각 기준이라 시간이 어긋나지 않는다. → Task 5

## File Structure
```
index.html                 앱 껍데기, 모듈 진입
manifest.webmanifest       홈 화면 설치 정보
sw.js                      오프라인 캐시
css/app.css                스타일
icons/icon-192.png, icon-512.png, apple-touch-icon.png
js/recommend.js            추천 규칙 + 기본 설정값 (순수)
js/store.js                localStorage 읽기/쓰기, 백업 (순수, storage 주입)
js/catalog.js              운동 카탈로그 로드, 부위 필터, 검색 (순수 + fetch)
js/timer.js                휴식 타이머 (순수, 시계 주입) + 알림음
js/i18n.js                 부위 한국어 이름
js/app.js                  해시 라우터, 상태 보관
js/screens/today.js, picker.js, session.js, manage.js, history.js
data/exercises.json        변환된 카탈로그
data/ko.json               운동 id → 한국어 이름
img/<id>.jpg               운동당 이미지 1장
scripts/build-data.mjs     free-exercise-db에서 data/·img/ 생성
scripts/make-icons.mjs     PNG 아이콘 생성
tests/*.test.mjs
```

데이터 형태(모든 태스크 공통):
- `Settings`: `{ id: string, name: string, equipment?: string, targetReps: number, increment: number, qualifyingSets: number, restSeconds: number }`
- `SetEntry`: `{ weight: number, reps: number }`
- `Record`: `{ exerciseId: string, date: string /* YYYY-MM-DD */, sets: SetEntry[], savedAt: number }`
- `State`: `{ version: 1, exercises: Settings[], today: { date: string, exerciseIds: string[] }, records: Record[] }`
- `CatalogItem`: `{ id: string, name: string, koName: string, bodyPart: string, equipment: string, image: string }`

---

### Task 1: 추천 규칙

**Files:**
- Create: `js/recommend.js`
- Test: `tests/recommend.test.mjs`

**Interfaces:**
- Produces:
  - `recommendNextWeight(sets: SetEntry[], s: { targetReps: number, increment: number, qualifyingSets: number }): number | null`
  - `defaultSettings(equipment?: string): { targetReps: 12, increment: 5 | 2, qualifyingSets: 3, restSeconds: 90 }`
  - `cleanSets(sets: SetEntry[]): SetEntry[]` — `weight > 0`이고 `reps > 0`인 유한수 세트만 남김.

- [ ] **Step 1: 실패하는 테스트.** `tests/recommend.test.mjs`에 다음을 `node:test`로 작성:
  - 벤치프레스 `[65×12, 65×12, 65×12, 65×9]`, `{12,5,3}` → `70`
  - `[60×12, 60×12, 60×11, 60×10]` → `60` (2세트만 달성)
  - 덤벨 `[16×12,16×12,16×12]`, `{12,2,3}` → `18`
  - 세트마다 무게가 다르면 가장 무거운 무게 기준: `[60×12, 65×12, 65×12, 65×12]` → `70`; `[60×12,60×12,60×12,65×8]` → `65` (W=65에서 달성 0세트라 증량 없음)
  - 빈 배열 / 전부 무효 세트 → `null`
  - 소수: `[62.5×12,62.5×12,62.5×12]`, `increment 2.5` → `65`; `[0.1×12 ×3]`, `increment 0.2` → `0.3`
  - `cleanSets([{weight:60,reps:NaN},{weight:0,reps:10},{weight:-5,reps:5},{weight:60,reps:12}])` → `[{weight:60,reps:12}]`
  - `defaultSettings("dumbbell").increment === 2`, `defaultSettings("barbell").increment === 5`, `defaultSettings().restSeconds === 90`
- [ ] **Step 2: 실패 확인.** Run: `node --test tests/recommend.test.mjs` → FAIL (모듈 없음).
- [ ] **Step 3: `js/recommend.js` 구현.** 위 시그니처대로. 결과는 `Math.round(x * 100) / 100`으로 반올림해 부동소수 찌꺼기를 없앤다.
- [ ] **Step 4: 통과 확인.** Run: `node --test tests/recommend.test.mjs` → 전부 PASS.
- [ ] **체크포인트.**

### Task 2: 저장소와 백업

**Files:**
- Create: `js/store.js`
- Test: `tests/store.test.mjs`

**Interfaces:**
- Consumes: `Settings`, `Record`, `State` 형태 (위).
- Produces:
  - `emptyState(): State`
  - `loadState(storage: { getItem(k): string|null }): State` — 키 `"overload-v1"`. 없음/깨진 JSON/버전 불일치/예외 → `emptyState()`.
  - `saveState(storage: { setItem(k, v): void }, state: State): void`
  - `addRecord(state: State, rec: { exerciseId: string, date: string, sets: SetEntry[] }, now: number): State` — `cleanSets`로 정리, 세트가 비면 `state` 그대로 반환, 아니면 새 State(불변)에 `savedAt: now`로 추가.
  - `lastRecord(state: State, exerciseId: string): Record | null` — `savedAt` 가장 큰 기록.
  - `exportJson(state: State): string`
  - `importJson(text: string): State | null` — 구조 검증 실패 시 `null`.

- [ ] **Step 1: 실패하는 테스트.** 가짜 storage(객체)로:
  - `loadState`: 비어 있음 → `emptyState()`; `"{not json"` → `emptyState()`; `getItem`이 throw → `emptyState()`
  - `saveState` 후 `loadState` 왕복 시 동일
  - `addRecord`: 무효 세트만 있으면 records 길이 불변; 같은 날 같은 운동을 `now=1`, `now=2`로 두 번 추가 → 2건, `lastRecord`는 `savedAt===2`인 것
  - `importJson("garbage")` → `null`; `importJson(exportJson(s))` → `s`와 동일; `records`가 배열이 아닌 JSON → `null`
- [ ] **Step 2: 실패 확인.** Run: `node --test tests/store.test.mjs` → FAIL.
- [ ] **Step 3: `js/store.js` 구현.** 순수 함수 + 주입된 storage만 사용(전역 `localStorage` 직접 참조 금지).
- [ ] **Step 4: 통과 확인.** Run: `node --test tests/store.test.mjs` → PASS.
- [ ] **체크포인트.**

### Task 3: 운동 데이터 빌드 (카탈로그 + 이미지 + 한국어)

**Files:**
- Create: `scripts/build-data.mjs`, `data/exercises.json`, `data/ko.json`, `img/*.jpg`, `js/i18n.js`
- Test: `tests/data.test.mjs`

**Interfaces:**
- Produces:
  - `data/exercises.json`: `CatalogItem[]`. `bodyPart`는 영어 소문자 부위 키 하나(원본 `primaryMuscles[0]`을 쓰고, 값 집합은 `js/i18n.js`가 한국어로 매핑). `image`는 `img/<id>.jpg` 상대경로. `koName`은 `data/ko.json[id]`, 없으면 빈 문자열이 아니라 영어 `name`으로 대체.
  - `js/i18n.js`: `export const BODY_PART_KO: Record<string, string>` — 카탈로그에 등장하는 모든 `bodyPart` 값을 포함. `export function bodyPartLabel(key: string): string` — `"chest"` → `"가슴"` 처럼 반환, 모르는 키는 키 그대로.

- [ ] **Step 1: 실패하는 테스트.** `tests/data.test.mjs`:
  - `data/exercises.json`을 읽어 800개 이상, 모든 항목에 `id,name,koName,bodyPart,equipment,image` 존재, `image` 파일이 실제 존재
  - 모든 `bodyPart` 값이 `BODY_PART_KO`의 키에 있음
  - `koName`이 비어 있는 항목 없음
  - id 중복 없음
- [ ] **Step 2: 실패 확인.** Run: `node --test tests/data.test.mjs` → FAIL.
- [ ] **Step 3: `scripts/build-data.mjs` 구현.** `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json`을 받아 변환하고, 각 운동의 `images[0]`을 `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/<path>`에서 받아 `img/<id>.jpg`로 저장(동시 요청 수 제한, 실패 시 재시도). 실행: `node scripts/build-data.mjs`.
- [ ] **Step 4: 한국어 이름 작성.** `data/ko.json`(`{ "<id>": "<한국어 이름>" }`)을 운동 800여 개 전부에 대해 작성한다. 헬스장에서 쓰는 통용 표현(벤치프레스, 데드리프트, 랫풀다운 등)을 우선하고, 확신이 없으면 직역하되 번역 품질은 사용자가 확인한다. 작성 후 `build-data.mjs`를 다시 실행해 `koName`을 채운다. `i18n.js`의 `BODY_PART_KO`도 이때 완성한다.
- [ ] **Step 5: 통과 확인.** Run: `node --test tests/data.test.mjs` → PASS. 그리고 `img/` 전체 용량을 확인해 사용자에게 보고(30MB 초과 시 `sharp` 없이 가능한 방법인지 사용자와 상의, 임의로 의존성 추가 금지).
- [ ] **체크포인트.**

### Task 4: 카탈로그 필터·검색

**Files:**
- Create: `js/catalog.js`
- Test: `tests/catalog.test.mjs`

**Interfaces:**
- Consumes: `CatalogItem`
- Produces:
  - `loadCatalog(fetchFn: typeof fetch): Promise<CatalogItem[]>` — `data/exercises.json` 상대경로.
  - `filterCatalog(items: CatalogItem[], opts: { bodyPart?: string, query?: string }): CatalogItem[]`
    - `bodyPart` 없음/`"all"` → 전체. `query`는 앞뒤 공백 제거, 소문자화, `name`과 `koName`에 부분 일치. 빈 query → 부위 필터만 적용.
  - `bodyParts(items: CatalogItem[]): string[]` — 등장하는 부위 키 중복 제거, 정렬.

- [ ] **Step 1: 실패하는 테스트.** 작은 가짜 카탈로그(영어/한국어 이름 섞음)로:
  - `query:"BENCH"`(대문자) → `name`에 bench 포함 항목
  - `query:"벤치"` → `koName` 일치 항목
  - `query:"   "` → 부위 필터만 적용한 결과와 동일
  - `query:"zzzz"` → `[]`
  - `bodyPart:"chest", query:"press"` → 둘 다 만족
  - `bodyParts` 중복 없음·정렬됨
- [ ] **Step 2: 실패 확인.** Run: `node --test tests/catalog.test.mjs` → FAIL.
- [ ] **Step 3: `js/catalog.js` 구현.**
- [ ] **Step 4: 통과 확인.** Run: `node --test tests/catalog.test.mjs` → PASS.
- [ ] **체크포인트.**

### Task 5: 휴식 타이머

**Files:**
- Create: `js/timer.js`
- Test: `tests/timer.test.mjs`

**Interfaces:**
- Produces:
  - `createTimer(now: () => number): { start(seconds: number): void, stop(): void, remaining(): number, running(): boolean }`
    - `remaining()`은 종료 시각 − `now()`를 초 단위로 올림, 0 아래로 내려가지 않음. 정지 상태면 0.
  - `beep(): void` — Web Audio로 짧은 소리(브라우저 전용, 테스트 대상 아님).

- [ ] **Step 1: 실패하는 테스트.** 가짜 시계로:
  - `start(90)` 직후 `remaining()===90`, 시계를 30초 전진 → `60`
  - 시계를 5분 한 번에 전진(백그라운드 복귀) → `0`, `running()`는 `false`
  - `stop()` 후 `remaining()===0`
  - `start(90)` 도중 `start(60)` → 60으로 재시작
- [ ] **Step 2: 실패 확인.** Run: `node --test tests/timer.test.mjs` → FAIL.
- [ ] **Step 3: `js/timer.js` 구현.** 틱 카운트가 아니라 `endAt = now() + seconds*1000` 저장 방식.
- [ ] **Step 4: 통과 확인.** Run: `node --test tests/timer.test.mjs` → PASS.
- [ ] **체크포인트.**

### Task 6: 앱 껍데기 + 오늘 운동 + 운동 관리 화면

**Files:**
- Create: `index.html`, `css/app.css`, `js/app.js`, `js/screens/today.js`, `js/screens/manage.js`

**Interfaces:**
- Consumes: Task 1~2의 `recommendNextWeight`, `defaultSettings`, `loadState`, `saveState`, `lastRecord`.
- Produces:
  - `js/app.js`: 해시 라우트 `#/`(오늘), `#/pick`, `#/session/<exerciseId>`, `#/manage`, `#/history`. 전역 상태 `getState(): State`, `setState(next: State): void`(저장 포함), `navigate(hash: string): void`. 새 날짜가 되면 `today`를 비운다.
  - 각 화면 모듈은 `export function render(root: HTMLElement, ctx: { getState, setState, navigate, catalog: CatalogItem[], params: string[] }): void`.
  - 오늘 운동 화면: 운동별 줄에 이름(영어 + 한국어)과 `다음 추천: N kg`(기록 없으면 `기록 없음`). `+ 운동 추가`, `운동 관리`, `기록` 버튼. 줄을 누르면 `#/session/<id>`.
  - 운동 관리 화면: 운동별 `targetReps`, `increment`, `qualifyingSets`, `restSeconds` 수정 입력, 직접 만드는 새 운동(`id: "custom-<timestamp>"`), 백업 내보내기/가져오기 자리(동작은 Task 9).
- 모바일 우선 레이아웃: 아이폰 세로, 터치 영역 44px 이상, `viewport-fit=cover`, 입력칸은 `inputmode="decimal"`.

- [ ] **Step 1: `index.html`, `css/app.css`, `js/app.js` 작성** (라우터와 상태, 한국어 UI 껍데기).
- [ ] **Step 2: 오늘 운동 화면과 운동 관리 화면 작성.**
- [ ] **Step 3: 로컬 서버로 확인.** Run: `node -e "require('http').createServer((q,r)=>require('fs').createReadStream('.'+(q.url==='/'?'/index.html':q.url.split('?')[0])).on('error',()=>{r.statusCode=404;r.end()}).pipe(r)).listen(8080)"` (백그라운드), 브라우저에서 `http://localhost:8080` 열기. 브라우저 개발자 도구 모바일 보기로 화면 2개가 보이고, 새 운동 추가·설정 수정이 새로고침 후에도 남는지 확인.
- [ ] **체크포인트.**

### Task 7: 운동 추가(선택) 화면

**Files:**
- Create: `js/screens/picker.js`

**Interfaces:**
- Consumes: `filterCatalog`, `bodyParts`, `bodyPartLabel`, `defaultSettings`, `ctx.catalog`.
- Produces: `render(root, ctx)` — 상단 검색창, 부위 칩(전체 + `bodyParts` 결과, 한국어 라벨), 이미지(`<img loading="lazy">`) + 영어 이름 + 한국어 이름이 있는 목록. 항목을 누르면 `Settings`가 없을 때 `defaultSettings(equipment)`로 `state.exercises`에 추가하고 `today.exerciseIds`에 넣은 뒤 `#/`로 이동. 이미 오늘 목록에 있으면 중복 추가하지 않는다.
- 800개를 한 번에 그리지 않는다: 최대 60개씩 `더 보기`로 나눠 렌더링.

- [ ] **Step 1: 화면 작성.**
- [ ] **Step 2: 브라우저에서 확인.** 부위 칩 전환, 영어·한국어 검색, 결과 0건 시 "검색 결과가 없습니다" 표시, 같은 운동 두 번 선택 시 목록 1개.
- [ ] **체크포인트.**

### Task 8: 세트 입력 화면 + 휴식 타이머

**Files:**
- Create: `js/screens/session.js`

**Interfaces:**
- Consumes: `recommendNextWeight`, `cleanSets`, `addRecord`, `lastRecord`, `createTimer`, `beep`.
- Produces: `render(root, ctx)` — 상단에 오늘 추천 무게와 지난 기록 요약(`60kg × 12/12/11/10`). 세트 줄마다 무게·횟수 입력(첫 줄의 무게는 추천 무게로 미리 채움, 이후 줄은 앞 줄 무게 복사), 줄마다 `완료` 체크. 완료 체크 시 해당 운동의 `restSeconds`로 타이머 시작, 남은 시간 표시, 0이 되면 `beep()`. `+ 세트`, `저장`. 저장하면 `addRecord(..., date: 오늘, ..., now: Date.now())` 후 `#/`로 이동하고 다음 추천이 갱신돼 보인다. 유효 세트가 하나도 없으면 저장하지 않고 "입력된 세트가 없습니다" 안내.
- 타이머 표시는 `setInterval` 갱신이되 값은 `timer.remaining()`에서 읽는다. 화면을 떠날 때 interval을 정리한다. 화면 꺼짐 방지는 `navigator.wakeLock?.request("screen")`를 시도하고 실패해도 무시.

- [ ] **Step 1: 화면 작성.**
- [ ] **Step 2: 브라우저에서 확인.** 벤치프레스를 60kg로 `12/12/12/9` 저장 → 오늘 운동 줄이 `다음 추천: 65 kg`; 같은 무게로 `12/12/11/10` 저장 → 추천 `60 kg` 유지(사용자 규칙과 일치); 횟수 빈칸 세트는 무시되는지; 완료 체크 시 타이머가 도는지.
- [ ] **체크포인트.**

### Task 9: 기록 화면 + 백업

**Files:**
- Create: `js/screens/history.js`
- Modify: `js/screens/manage.js` (백업 버튼 연결)

**Interfaces:**
- Consumes: `exportJson`, `importJson`, `ctx.getState`, `ctx.setState`.
- Produces:
  - 기록 화면: 날짜 내림차순, 운동 이름 + `무게 × 횟수` 세트 나열.
  - 백업 내보내기: `exportJson(state)`를 `Blob` 다운로드(`overload-backup-YYYY-MM-DD.json`). 아이폰 사파리에서 다운로드가 막히면 공유/복사로 대체할 수 있게 텍스트 영역에도 표시.
  - 가져오기: 파일 선택 → `importJson` 성공 시 확인 대화상자 후 교체, `null`이면 "올바른 백업 파일이 아닙니다" 알림 후 기존 기록 유지.

- [ ] **Step 1: 기록 화면 작성, 관리 화면에 백업 연결.**
- [ ] **Step 2: 브라우저에서 확인.** 기록 2~3개 만든 뒤 내보내기 → 상태 초기화 → 가져오기로 복원, 쓰레기 파일 가져오기 시 기존 데이터 유지.
- [ ] **체크포인트.**

### Task 10: PWA 설치 + 오프라인 + GitHub Pages 배포

**Files:**
- Create: `manifest.webmanifest`, `sw.js`, `scripts/make-icons.mjs`, `icons/icon-192.png`, `icons/icon-512.png`, `icons/apple-touch-icon.png`
- Modify: `index.html` (manifest 링크, `apple-touch-icon`, `apple-mobile-web-app-capable`, 서비스 워커 등록)

**Interfaces:**
- Produces: `sw.js` — 설치 시 앱 셸(html/css/js/manifest/icons)과 `data/exercises.json`을 미리 캐시, `img/*`는 처음 요청될 때 캐시(cache-first). 캐시 이름에 버전 문자열을 두고 활성화 시 옛 캐시 삭제.
- 아이콘은 `scripts/make-icons.mjs`로 의존성 없이 생성(`zlib`로 단색 + 단순 도형 PNG).
- 모든 URL 상대경로(`./`), `manifest`의 `start_url: "./"`, `scope: "./"`.

- [ ] **Step 1: 아이콘 생성 스크립트 작성·실행.** Run: `node scripts/make-icons.mjs` → PNG 3개 생성.
- [ ] **Step 2: manifest, sw.js, 등록 코드 작성.**
- [ ] **Step 3: 오프라인 확인.** 로컬 서버로 한 번 접속 후 개발자 도구에서 Offline으로 바꿔 새로고침해도 앱·운동 목록이 뜨는지.
- [ ] **Step 4: 배포 준비.** GitHub Pages 설정(저장소 Settings → Pages → 브랜치 선택)은 사용자의 GitHub 계정 작업이므로 직접 하지 말고, 사용자에게 필요한 클릭을 안내한다. 푸시·커밋은 사용자가 요청할 때만.
- [ ] **체크포인트.**

### Task 11: 아이폰 실기기 확인 (수동)

- [ ] **Step 1:** 배포된 주소를 아이폰 사파리에서 열고 공유 → "홈 화면에 추가".
- [ ] **Step 2:** 홈 화면 아이콘으로 실행해 다음을 사용자와 함께 확인하고 결과를 그대로 보고한다: 운동 추가·이미지 표시, 벤치프레스 입력→추천 무게 갱신, 타이머 종료 시 소리, 화면 꺼짐 방지 동작 여부, 비행기 모드에서 실행, 한국어 운동 이름 번역 품질. 안 되는 항목(진동 등)은 "안 됨"으로 명시한다.
- [ ] **체크포인트.**
