# 프론트엔드 API 연동 작업 보드

## 목표

Vue 화면과 API client에 남아 있는 mock, stub, 임시 fallback을 제거하고 `backend/develop`이 제공하는 실제 API로 연결한다.

이 문서는 고정 담당자를 배정하지 않는다. 여러 작업자가 병렬로 진행할 수 있도록 작업 ID, 상태, 작업 브랜치 또는 PR, 검증 결과만 기록한다.

## 전제

- `frontend/`와 `backend/`는 각각 별도 submodule repo이며 기준 브랜치는 `develop`이다.
- 백엔드 API 구현은 완료된 상태로 본다.
- 실제 연동 기준은 실행 중인 백엔드의 `/v3/api-docs`, backend controller와 DTO다.
- `.agent/contracts/openapi.yaml`이 실제 코드와 다르면 차이를 기록하고 별도 계약 문서 작업으로 수정한다.
- 프론트에서 필요한 동작이 백엔드에 없다고 판단되면 임의로 backend 기능을 추가하지 않고 먼저 계약 차이를 확인한다.
- 제품 코드 변경은 `.agent/docs/process/domain_development_policy.md`의 설명, 수용 기준, test-first 순서를 따른다.

## 상태 규칙

| 상태 | 의미 |
| :--- | :--- |
| `TODO` | 시작하지 않았고 선행 조건이 충족된 작업 |
| `IN_PROGRESS` | 작업 브랜치 또는 PR에서 구현 중인 작업 |
| `BLOCKED` | 제품 결정, 계약 확인 또는 다른 작업 완료가 필요한 상태 |
| `VERIFY` | 구현과 관련 테스트는 끝났지만 전체 검증 또는 merge가 남은 상태 |
| `DONE` | frontend `develop` 반영, 테스트, build와 문서 갱신까지 끝난 상태 |

상태를 `IN_PROGRESS`로 바꿀 때 사람 이름 대신 작업 브랜치 또는 draft PR을 기록한다. 브랜치나 PR이 없으면 시작된 작업으로 보지 않는다.

## 진행 기록 방법

1. 아래 작업표에서 작업 ID와 범위를 확인한다.
2. 작업 시작 시 상태를 `IN_PROGRESS`로 바꾸고 브랜치/PR 칸을 기록한다.
3. 해당 브랜치의 `.agent/branch-ledger/branches/<currentBranchKey>/`에 같은 작업 ID를 기록한다.
4. 범위 또는 API 계약이 바뀌면 결정 기록에 이유를 남긴다.
5. 테스트가 끝나면 `VERIFY`, `develop` 반영과 전체 검증이 끝나면 `DONE`으로 바꾼다.
6. 완료된 작업의 명령과 결과는 검증 로그에 누적한다.

## 완료 기준

각 작업은 다음 조건을 모두 만족해야 `DONE`이다.

- production 코드가 `frontend/src/mocks/`를 import하지 않는다.
- API client가 hard-coded 성공 응답이나 빈 배열을 반환하지 않는다.
- backend 경로, HTTP method, request와 response DTO가 일치한다.
- loading, empty, error, retry와 권한 상태를 화면에서 처리한다.
- API 또는 component 테스트를 먼저 작성하고 실패를 확인한다.
- 주요 사용자 흐름 테스트가 통과한다.
- `npm test -- --run`과 `npm run build`가 통과한다.
- 필요한 경우 `/v3/api-docs`, `.agent/contracts/openapi.yaml`과 실제 호출 차이를 기록한다.
- UI inventory와 관련 문서를 갱신한다.
- frontend `develop` 반영 후 orchestration repo의 submodule pointer를 갱신한다.

## 현재 기준선

2026-06-22 기준 확인 결과다.

- 프론트 개발 서버의 `/api/v1` proxy가 backend `8080`에 정상 연결된다.
- production 코드의 실제 HTTP 호출은 backend 공개 경로와 대부분 일치한다.
- 사용되지 않는 `aiApi.generateRouteDraft()`만 backend에 없는 `/trips/{tripId}/ai/route-draft`를 참조한다.
- `HomePage`, `RecordPage`, `RoutePage`, `MyPage`, `UserProfileModal`에 mock 또는 임시 fallback이 남아 있다.
- `ai.api.ts`, `notification.api.ts`, `media.api.ts`에 hard-coded 응답 또는 mock adapter가 남아 있다.
- frontend 전체 테스트 106개와 production build가 통과한 상태에서 이 보드를 시작한다.
- follow method와 follower/following 목록 연동 변경은 세 repo의 `develop` 반영까지 완료됐다.

## 전체 작업표

| ID | 작업 | 상태 | 선행 작업 | 작업 브랜치/PR | 완료 증거 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `FEI-000` | 프론트 proxy와 실제 backend 경로 기준선 확인 | `DONE` | 없음 | `develop` | health, API 경로 대조, E2E 확인 |
| `FEI-010` | follow method와 follower/following 목록 연동 | `DONE` | 없음 | backend PR #2, frontend PR #3, orchestration PR #3 | backend 571, frontend 106 tests 통과 |
| `FEI-100` | media 기록 목록 client의 mock 제거 | `TODO` | 없음 | - | - |
| `FEI-110` | `RecordPage` 여행·기록·사진 실제 API 연동 | `TODO` | `FEI-100` | - | - |
| `FEI-120` | `HomePage` 여행·커뮤니티 실제 API 연동 | `TODO` | 없음 | - | - |
| `FEI-121` | Home의 Super-like TOP 3 데이터 의미와 API 확정 | `BLOCKED` | 제품/API 의미 확인 | - | - |
| `FEI-130` | `MyPage` 사용자·팔로우·저장 장소 mock 제거 | `TODO` | `FEI-010` | - | - |
| `FEI-140` | `RoutePage`의 `mockPlaces` fallback 제거 | `TODO` | 없음 | - | - |
| `FEI-150` | 미사용 `UserProfileModal` 제거 또는 실제 API 전환 | `TODO` | 사용처 재확인 | - | - |
| `FEI-160` | AI API client의 hard-coded session/history 제거 | `TODO` | 실제 AI DTO 확인 | - | - |
| `FEI-170` | notification 목록 client의 hard-coded 빈 응답 제거 | `TODO` | 없음 | - | - |
| `FEI-180` | production mock/stub 재유입 방지 검사 추가 | `TODO` | `FEI-100`~`170` | - | - |
| `FEI-190` | 전체 통합 E2E, build, UI inventory와 계약 차이 정리 | `TODO` | 모든 화면 작업 | - | - |

## 작업 상세

### FEI-100 — media 기록 목록 client

현재 문제:

- `frontend/src/api/media.api.ts`가 `mockRecords`를 production 코드에서 import한다.
- `getRecords()`가 backend를 호출하지 않고 hard-coded page를 반환한다.

실제 API:

- `GET /api/v1/trips/{tripId}/records`
- `POST /api/v1/trips/{tripId}/records`
- `GET /api/v1/trips/{tripId}/records/{recordId}`
- `PATCH /api/v1/trips/{tripId}/records/{recordId}`
- `DELETE /api/v1/trips/{tripId}/records/{recordId}`
- `GET /api/v1/records/photos?tripId={tripId}`

작업:

- [ ] 실제 page response 타입을 backend DTO와 맞춘다.
- [ ] `getRecords()`를 실제 GET 호출로 바꾼다.
- [ ] record 조회·수정·삭제 client가 화면에 필요하면 같은 모듈에 추가한다.
- [ ] mock import를 제거한다.
- [ ] 정상, 빈 page, API 실패와 pagination 테스트를 작성한다.

### FEI-110 — RecordPage

현재 문제:

- `mockTrips`와 `mockRecords`로 여행 선택, 개수와 사진 목록을 구성한다.
- API 실패, 빈 기록과 권한 상태가 실제 사용자 흐름과 연결되지 않는다.

작업:

- [ ] 여행 목록을 `tripApi` 또는 `trip.store`에서 가져온다.
- [ ] route의 `tripId`가 있으면 해당 여행을 우선 선택한다.
- [ ] 선택한 여행의 record와 photo를 실제 API로 조회한다.
- [ ] 전체/여행별 사진 개수를 실제 page metadata로 표시한다.
- [ ] loading, empty, error, retry와 접근 권한 실패를 구분한다.
- [ ] 여행 전환 시 오래된 응답이 현재 화면을 덮지 않도록 요청 경합을 처리한다.
- [ ] 페이지 사용자 흐름과 API 실패 component 테스트를 작성한다.

### FEI-120 — HomePage

현재 문제:

- `mockTrips`, `mockPlaces`, `mockCommunityStories`가 대시보드 데이터를 만든다.
- 카드별 데이터 출처와 실패 범위가 분리되지 않는다.

작업:

- [ ] 내 여행 요약을 `GET /api/v1/trips` 결과로 바꾼다.
- [ ] 커뮤니티 추천 글을 `GET /api/v1/stories` 결과로 바꾼다.
- [ ] 여행과 커뮤니티 영역의 loading, empty, error를 독립 처리한다.
- [ ] 로그인하지 않은 사용자와 인증 만료 상태를 처리한다.
- [ ] 부분 실패 시 성공한 카드까지 숨기지 않는다.
- [ ] 카드 link가 실제 trip/story ID를 사용하도록 검증한다.

### FEI-121 — Home Super-like TOP 3 결정

현재 문제:

- 화면 문구는 전역 Super-like 순위를 의미하지만 현재 backend의 trip 추천, swipe feed와 장소 검색은 서로 다른 의미를 가진다.

결정이 필요한 항목:

- [ ] 전체 사용자 기준 인기 장소인지, 현재 사용자 취향인지, 특정 여행방 추천인지 선택한다.
- [ ] 선택한 의미에 대응하는 backend API와 정렬 기준을 기록한다.
- [ ] API 의미가 확정되기 전에는 임의로 다른 endpoint를 연결하지 않는다.

### FEI-130 — MyPage

현재 문제:

- 인증 사용자가 없을 때 `mockUser`를 표시한다.
- follower/following 초기 상태와 일부 profile 데이터가 mock에 의존한다.
- 저장 장소 영역이 실제 API로 연결되지 않았다.

실제 API:

- `GET/PATCH/DELETE /api/v1/me`
- `GET /api/v1/users/{userId}`
- `PUT/DELETE /api/v1/users/{userId}/follow`
- `GET /api/v1/users/{userId}/followers`
- `GET /api/v1/users/{userId}/following`
- `GET /api/v1/me/saved-places`

작업:

- [ ] mock 사용자 fallback을 제거하고 비인증 상태는 로그인 흐름으로 보낸다.
- [ ] follower/following 목록과 count를 실제 page metadata로 처리한다.
- [ ] 저장 장소와 profile media를 실제 API로 조회한다.
- [ ] PUBLIC/PRIVATE profile의 권한 차이를 화면에서 처리한다.
- [ ] follow 요청 중 중복 클릭과 실패 복구를 처리한다.
- [ ] loading, empty, error, 권한과 재시도 테스트를 작성한다.

### FEI-140 — RoutePage

현재 문제:

- itinerary item의 좌표·상세·이미지 fallback을 `mockPlaces`에서 찾는다.
- 실제 place 조회 실패와 mock fallback을 구분할 수 없다.

실제 API:

- `GET /api/v1/trips/{tripId}/itinerary`
- `GET /api/v1/places/{provider}/{externalPlaceId}`
- `GET /api/v1/places/search`
- `GET /api/v1/trips/{tripId}/place-recommendations`

작업:

- [ ] itinerary 응답에 포함된 필드를 우선 사용한다.
- [ ] 추가 상세가 필요할 때 place detail을 ID 기준으로 조회하고 cache한다.
- [ ] `mockPlaces` import와 조회 fallback을 제거한다.
- [ ] 장소가 삭제되었거나 provider 조회가 실패한 상태를 명시적으로 표시한다.
- [ ] 지도 marker, detail panel과 일정 편집의 기존 동작을 회귀 테스트한다.

### FEI-150 — UserProfileModal

현재 문제:

- production component가 community story, follower, following과 tag mock을 사용한다.
- 현재 코드 검색에서는 실제 사용처가 확인되지 않는다.

작업:

- [ ] template, dynamic component와 route를 포함해 실제 사용처를 재확인한다.
- [ ] 미사용이면 component와 관련 dead style/type을 제거한다.
- [ ] 사용 중이면 `UserProfilePage`와 중복 책임을 비교하고 실제 user/social/community API로 전환한다.
- [ ] 같은 사용자 프로필 UI를 두 군데에서 별도로 유지하지 않는다.

### FEI-160 — AI API client

현재 문제:

- session과 history가 hard-coded 성공 응답을 반환한다.
- `generateRouteDraft()`는 backend에 없는 경로를 참조하며 현재 화면 사용처도 없다.

실제 API 후보:

- `GET /api/v1/trips/{tripId}/ai/session`
- `GET/POST /api/v1/trips/{tripId}/ai/messages`
- `POST /api/v1/trips/{tripId}/ai/chat`

작업:

- [ ] backend DTO에 맞춰 session, messages와 chat response type을 수정한다.
- [ ] hard-coded session/history를 실제 GET으로 바꾼다.
- [ ] route draft가 chat tool 결과로 대체되는지 확인한다.
- [ ] 사용되지 않는 잘못된 client 함수는 제거한다.
- [ ] 정상, 빈 history, AI 실패와 재시도 테스트를 작성한다.

### FEI-170 — Notification API client

현재 문제:

- 목록 조회가 항상 빈 page를 반환한다.
- read/read-all만 실제 backend를 호출한다.

작업:

- [ ] `GET /api/v1/notifications`에 pagination parameter를 연결한다.
- [ ] backend page DTO와 frontend type을 맞춘다.
- [ ] 읽음 처리 후 목록과 unread count를 갱신한다.
- [ ] 빈 목록, pagination, 읽음 실패 테스트를 작성한다.

### FEI-180 — mock/stub 재유입 방지

작업:

- [ ] test와 story fixture를 제외한 production 코드의 `@/mocks` import를 검사한다.
- [ ] API client의 TODO hard-coded response를 검사 가능한 규칙으로 만든다.
- [ ] 허용 예외가 필요하면 파일과 이유를 명시한다.
- [ ] 검사를 `.agent` harness 또는 frontend test command에 연결한다.

### FEI-190 — 전체 통합 검증

작업:

- [ ] 가입, 로그인과 인증 만료 흐름을 확인한다.
- [ ] 여행 조회, 일정, 기록과 사진 흐름을 확인한다.
- [ ] community, profile, follow와 저장 장소 흐름을 확인한다.
- [ ] mock import와 hard-coded API response가 없는지 확인한다.
- [ ] frontend 전체 test와 build를 실행한다.
- [ ] backend health와 frontend proxy health를 확인한다.
- [ ] SPA route smoke와 주요 viewport를 확인한다.
- [ ] UI inventory와 계약 차이 문서를 갱신한다.

## 병렬 진행 경계

다음 묶음은 서로 다른 파일을 중심으로 하므로 병렬 진행할 수 있다.

- `FEI-100` → `FEI-110`: media client와 RecordPage
- `FEI-120`: HomePage의 여행·community 영역
- `FEI-130`: MyPage와 social surface
- `FEI-140`: RoutePage와 place detail
- `FEI-160`: AI client
- `FEI-170`: notification client

다음 파일은 공통 충돌 가능성이 높으므로 기능 작업과 분리한다.

- `frontend/src/api/http.ts`
- `frontend/src/router/`
- `frontend/src/types/api.ts`
- `frontend/src/styles/`
- `.agent/contracts/openapi.yaml`
- orchestration repo의 frontend submodule pointer

## 권장 진행 순서

1. `FEI-100` media client
2. `FEI-110` RecordPage
3. `FEI-120` HomePage의 여행·community 영역
4. `FEI-130` MyPage
5. `FEI-140` RoutePage
6. `FEI-150`, `FEI-160`, `FEI-170` legacy/stub 정리
7. `FEI-121` 제품 결정 반영
8. `FEI-180`, `FEI-190` 자동 검사와 전체 통합 검증

RecordPage를 먼저 권장하는 이유는 필요한 trip, record와 media API가 이미 존재하고 mock 경계가 명확해 독립적으로 완료하기 쉽기 때문이다.

## 결정 기록

| 날짜 | 결정 | 이유 |
| :--- | :--- | :--- |
| 2026-06-22 | 기존 개인별 frontend 역할 문서를 제거한다. | 현재 단계는 신규 구현 배정보다 mock 제거와 API 연동 진행 관리가 중요하다. |
| 2026-06-22 | 작업마다 고정 담당자를 배정하지 않는다. | 여러 작업자가 상황에 따라 작업을 가져갈 수 있게 하고 개인 중심 문서가 낡는 문제를 방지한다. |
| 2026-06-22 | 사람 대신 작업 브랜치/PR을 기록한다. | 중복 작업과 merge 충돌을 예방하면서 담당자 명단을 유지하지 않기 위해서다. |
| 2026-06-22 | backend 구현과 runtime OpenAPI를 실제 연동 기준으로 사용한다. | 현재 root OpenAPI 초안에는 과거 경로가 남아 있어 실행 코드와 차이가 있다. |

## 진행 로그

| 날짜 | 작업 ID | 상태 변경 | 브랜치/PR | 결과 또는 다음 단계 |
| :--- | :--- | :--- | :--- | :--- |
| 2026-06-21 | `FEI-000` | `DONE` | `develop` | frontend proxy와 backend health, 실제 경로 대조 완료 |
| 2026-06-22 | `FEI-010` | `DONE` | backend PR #2, frontend PR #3, orchestration PR #3 | 세 repo `develop` 반영과 작업 브랜치 삭제 완료 |
| 2026-06-22 | 문서 구조 | `DONE` | `develop` | 개인별 역할표를 작업 ID 기반 활성 workboard로 교체 |

## 검증 로그

| 날짜 | 범위 | 명령/검증 | 결과 |
| :--- | :--- | :--- | :--- |
| 2026-06-21 | frontend | `npm test -- --run` | 106 tests 통과 |
| 2026-06-21 | frontend | `npm run build` | 통과 |
| 2026-06-21 | backend | Gradle 전체 test report | 571 tests, failure 0 |
| 2026-06-21 | 연결 | frontend proxy를 통한 가입→인증→로그인→follow→목록 조회 | 통과 |
| 2026-06-22 | 하네스 | `npm --prefix .agent run harness:check` | 18개 SPA route smoke 포함 통과 |

## 완료 후 처리

- 모든 작업이 `DONE`이면 이 문서를 `.agent/docs/exec-plans/completed/`로 이동한다.
- 반복 가능한 mock/stub 검사는 하네스에 유지한다.
- 남은 제품 결정은 별도 active 실행 계획으로 분리한다.
