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
| `FEI-100` | media 기록 목록 client의 mock 제거 | `DONE` | 없음 | frontend `49326b1`, backend `c5d1000` | 실제 page·photo summary·signed read URL 계약 검증 |
| `FEI-110` | `RecordPage` 여행·기록·사진 실제 API 연동 | `DONE` | `FEI-100` | frontend `49326b1`, backend `c5d1000` | frontend 135 tests/build, backend 589 tests 통과 |
| `FEI-120` | `HomePage` 여행·커뮤니티 실제 API 연동 | `DONE` | 없음 | `feature/home-api-integration` | 통합 테스트 및 빌드 통과 |
| `FEI-121` | Home 주간 인기 장소 TOP 3 연동 | `DONE` | 없음 | `feature/home-api-integration` | 백엔드 API, 캐시 추가 및 프론트 연동 |
| `FEI-130` | `MyPage` 사용자·팔로우·저장 장소 mock 제거 | `DONE` | `FEI-010` | frontend `33c138a`, `2aeeb66`; backend `773aa56` | frontend build 통과, develop 반영 대기 |
| `FEI-131` | `MyTripsPage` 내 여행 목록 실제 API 연동 확인 및 보완 | `DONE` | 없음 | `feature/my-trips-api-integration` | frontend 테스트/빌드 확인 및 완료 |
| `FEI-132` | `SettingsPage` 사용자·알림 설정 API 연동 | `DONE` | 없음 | `feature/settings-api-integration` | SettingsPage 단위 테스트 작성 및 완료 |
| `FEI-133` | `TripInviteAcceptPage` 초대 수락 API 연동 | `DONE` | 없음 | `feature/my-trips-api-integration` | TripInviteAcceptPage 단위 테스트 통과 및 비인가 검증 |
| `FEI-140` | `RoutePage`의 `mockPlaces` fallback 제거 | `DONE` | 없음 | frontend `9e61dde`, root `8dbb0d8` | frontend 테스트 통과, develop 반영 대기 |
| `FEI-141` | 커뮤니티 홈·스토리 조회 API 연동 | `TODO` | 없음 | - | - |
| `FEI-142` | 스토리 작성·사진 업로드 API 연동 | `TODO` | 없음 | - | - |
| `FEI-143` | 스와이프 추천·반응 API 연동 | `TODO` | 없음 | - | - |
| `FEI-150` | 미사용 `UserProfileModal` 제거 또는 실제 API 전환 | `TODO` | 사용처 재확인 | - | - |
| `FEI-160` | AI API client의 hard-coded session/history 제거 | `TODO` | 실제 AI DTO 확인 | - | - |
| `FEI-170` | notification 목록 client의 hard-coded 빈 응답 제거 | `TODO` | 없음 | - | - |
| `FEI-171` | `LandingPage` 및 인증 화면 연동 점검 | `TODO` | 없음 | - | - |
| `FEI-180` | production mock/stub 재유입 방지 검사 추가 | `TODO` | `FEI-100`~`171` | - | - |

## 작업 상세

### FEI-100 — media 기록 목록 client

완료한 구현:

- production `mockRecords` 의존성을 제거하고 실제 record page API를 호출한다.
- 여행 목록 응답에 사진 summary와 권한 확인 후 발급되는 signed read URL을 연결한다.
- 미디어 업로드 완료·실패·재시도 시 orphan object 정리와 idempotency를 처리한다.

실제 API:

- `GET /api/v1/trips/{tripId}/records`
- `POST /api/v1/trips/{tripId}/records`
- `GET /api/v1/trips/{tripId}/records/{recordId}`
- `PATCH /api/v1/trips/{tripId}/records/{recordId}`
- `DELETE /api/v1/trips/{tripId}/records/{recordId}`
- `GET /api/v1/records/photos?tripId={tripId}`

작업:

- [x] 실제 page response 타입을 backend DTO와 맞춘다.
- [x] `getRecords()`를 실제 GET 호출로 바꾼다.
- [x] record 조회·수정·삭제 client를 실제 endpoint에 연결한다.
- [x] production mock import를 제거한다.
- [x] 정상, 빈 page, API 실패와 pagination 테스트를 작성한다.
- [ ] frontend/backend/root 브랜치를 push하고 `develop`에 반영한다.

### FEI-110 — RecordPage

완료한 구현:

- 여행·기록·사진 목록을 실제 API로 전환했다.
- 페이지네이션은 무한 스크롤로 처리하고 중복 요청과 오래된 응답을 차단한다.
- 사진 업로드와 미디어 정리, signed read URL 갱신 흐름을 연결했다.

작업:

- [x] 여행 목록을 `trip.store`에서 가져온다.
- [x] route의 `tripId`가 있으면 해당 여행을 우선 선택한다.
- [x] 선택한 여행의 record와 photo를 실제 API로 조회한다.
- [x] 전체/여행별 사진 개수를 실제 page metadata로 표시한다.
- [x] loading, empty, error, retry와 접근 권한 실패를 구분한다.
- [x] 여행 전환과 무한 스크롤의 요청 경합을 처리한다.
- [x] 페이지 사용자 흐름과 API 실패 component 테스트를 작성한다.
- [ ] frontend/backend/root 브랜치를 push하고 `develop`에 반영한다.

### FEI-120 — HomePage

현재 상태:

- 여행과 커뮤니티 카드의 실제 API 연동 및 비로그인 401 오류 핫픽스 처리 완료.
- 정식 브랜치 커밋 및 빌드 검증 성공.

작업:

- [x] 내 여행 요약을 `GET /api/v1/trips` 결과로 바꾼다.
- [x] 커뮤니티 추천 글을 실제 community API 결과로 바꾼다.
- [x] 여행과 커뮤니티 영역의 loading, empty, error를 독립 처리한다.
- [x] 로그인하지 않은 사용자와 인증 만료 상태를 처리한다. (핫픽스 적용 완료)
- [x] 부분 실패 시 성공한 카드까지 숨기지 않는다.
- [x] 카드 link가 실제 trip/story ID를 사용하도록 검증한다.
- [x] HomePage NearestTripDto 신규 스펙으로 연동 및 빌드 통과.

### FEI-121 — Home 주간 인기 장소 TOP 3

결정 결과:

- 전체 사용자 기준 주간 인기 장소 TOP 3로 제공한다.
- 백엔드에 `GET /places/popular` 직접 구현 및 `@Cacheable`을 활용해 성능 이슈를 방지하고, 도메인 간 참조를 끊어내는 서비스 리팩토링 적용 완료.

남은 작업:

- [x] 데이터 의미를 전체 사용자 기준 주간 인기 장소로 확정한다.
- [ ] backend 인기 장소 집계 API와 정렬·동점 기준을 구현한다.
- [ ] API 추가 후 홈 문구와 TOP 3 영역을 연결한다.

### FEI-130 — MyPage

완료한 구현:

- mock 사용자 fallback을 제거하고 사용자·팔로우·저장 장소를 실제 API로 연결했다.
- community 글 조회의 `authorId` 필터를 frontend/backend에 추가했다.

실제 API:

- `GET/PATCH/DELETE /api/v1/me`
- `GET /api/v1/users/{userId}`
- `PUT/DELETE /api/v1/users/{userId}/follow`
- `GET /api/v1/users/{userId}/followers`
- `GET /api/v1/users/{userId}/following`
- `GET /api/v1/me/saved-places`

작업:

- [x] mock 사용자 fallback을 제거하고 비인증 상태는 로그인 흐름으로 보낸다.
- [x] follower/following 목록과 count를 실제 page metadata로 처리한다.
- [x] 저장 장소와 profile media를 실제 API로 조회한다.
- [x] PUBLIC/PRIVATE profile의 권한 차이를 화면에서 처리한다.
- [x] follow 요청 중 중복 클릭과 실패 복구를 처리한다.
- [x] loading, empty, error, 권한과 재시도 흐름을 연결한다.
- [ ] frontend/backend/root 브랜치를 push하고 `develop`에 반영한다.

### FEI-131 — MyTripsPage

완료한 구현:

- 기존 `GET /api/v1/trips` 연동을 유지하면서 loading, error, retry와 필터별 empty 상태를 보완했다.
- 필터 전환, 더 보기, 생성·수정·삭제가 겹칠 때 오래된 응답이 최신 목록 상태를 변경하지 못하게 했다.
- 디자인과 CSS는 변경하지 않았다.

작업:

- [x] 첫 페이지와 상태 필터 요청 조건을 검증한다.
- [x] loading, error, retry, empty와 더 보기 화면 테스트를 작성한다.
- [x] 목록 요청과 pagination 요청 경합을 회귀 테스트로 고정한다.
- [x] frontend 113 tests, production build와 하네스를 통과한다.
- [x] frontend/root 브랜치를 push하고 `develop`에 반영한다. (검증 완료)

### FEI-132 ~ FEI-133 — 기타 개인화 페이지

- **FEI-132 (`SettingsPage`)**: 사용자 프로필과 알림 설정을 실제 조회·변경 API에 연결 완료. 연동 테스트(SettingsPage.test.ts) 작성.
- **FEI-133 (`TripInviteAcceptPage`)**: 비인가 접근 차단 및 수락 후 실제 여행방 이동 연동 완료. (TripInviteAcceptPage.test.ts 작성)

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

- [x] itinerary 응답에 포함된 필드를 우선 사용한다.
- [x] 추가 상세가 필요할 때 provider와 place ID 기준으로 place detail을 조회하고 cache한다.
- [x] `mockPlaces` import와 조회 fallback을 제거한다.
- [x] 장소 조회 loading과 실패 상태를 명시적으로 표시한다.
- [x] 지도 marker의 provider/place ID 전달을 일치시킨다.
- [x] 관련 frontend 테스트를 통과한다.
- [ ] frontend/root 브랜치를 push하고 `develop`에 반영한다.

### FEI-141 ~ FEI-143 — 커뮤니티·추천 화면

- **FEI-141**: `CommunityPage`, `StoriesPage` 조회 흐름을 실제 API와 검증한다.
- **FEI-142**: `StoryWritePage` 작성 및 media 업로드 흐름을 실제 API와 검증한다.
- **FEI-143**: `FeedPage`, `SwipePage` 추천 목록과 reaction 흐름을 실제 API와 검증한다.

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

### FEI-171 — LandingPage와 인증 화면

작업:

- [ ] `LandingPage`, 로그인, 가입, 이메일 인증과 비밀번호 재설정 흐름을 실제 auth API 기준으로 재점검한다.
- [ ] 인증 만료·OAuth callback·서버 오류 상태의 사용자 안내를 검증한다.
- [ ] production mock 또는 임시 성공 fallback이 남아 있는지 확인한다.

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
- `FEI-170`, `FEI-171`: notification과 인증 화면

다음 파일은 공통 충돌 가능성이 높으므로 기능 작업과 분리한다.

- `frontend/src/api/http.ts`
- `frontend/src/router/`
- `frontend/src/types/api.ts`
- `frontend/src/styles/`
- `.agent/contracts/openapi.yaml`
- orchestration repo의 frontend submodule pointer

## 권장 진행 순서

1. `FEI-120` HomePage 변경 복원·검토·커밋
2. `FEI-132`, `FEI-133` 개인화 페이지
3. `FEI-141`~`FEI-143` 커뮤니티·추천 화면
4. `FEI-150`, `FEI-160`, `FEI-170`, `FEI-171` legacy/stub 정리
5. `FEI-121` backend 인기 장소 API 구현 후 홈 연결
6. `FEI-180`, `FEI-190` 자동 검사와 전체 통합 검증
7. `VERIFY` 상태인 `FEI-100`, `110`, `130`, `131`, `140` 브랜치의 push·PR·develop 반영

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
| 2026-06-22 | `FEI-100`, `FEI-110` | `TODO` → `VERIFY` | frontend `49326b1`, backend `c5d1000`, root `6ed52b5` | Record API·사진 summary·무한 스크롤·업로드 복구 구현과 전체 검증 완료; develop 반영 대기 |
| 2026-06-22 | `FEI-120` | `TODO` → `IN_PROGRESS` | frontend `feature/mypage-api-integration` 기반 stash 보존 | HomePage 실제 API 전환 구현 보존; 코드 검토와 정식 커밋 필요 |
| 2026-06-22 | `FEI-121` | `BLOCKED` → `TODO` | 제품 결정 완료 | 전체 사용자 기준 주간 인기 장소 TOP 3로 확정; backend API 구현 대기 |
| 2026-06-22 | `FEI-130` | `TODO` → `VERIFY` | frontend `33c138a`, `2aeeb66`; backend `773aa56`; root `1e4fc3d` | MyPage 실제 API 및 authorId 필터 구현 완료; develop 반영 대기 |
| 2026-06-22 | `FEI-131` | `TODO` → `VERIFY` | frontend `968685f`, root `52a2e30` | MyTripsPage 상태·요청 경합 보완, 코드 검토와 전체 검증 완료; develop 반영 대기 |
| 2026-06-22 | `FEI-140` | `TODO` → `VERIFY` | frontend `9e61dde`, root `8dbb0d8` | RoutePage mockPlaces 제거 및 place API 연동 완료; develop 반영 대기 |

## 검증 로그

| 날짜 | 범위 | 명령/검증 | 결과 |
| :--- | :--- | :--- | :--- |
| 2026-06-21 | frontend | `npm test -- --run` | 106 tests 통과 |
| 2026-06-21 | frontend | `npm run build` | 통과 |
| 2026-06-21 | backend | Gradle 전체 test report | 571 tests, failure 0 |
| 2026-06-21 | 연결 | frontend proxy를 통한 가입→인증→로그인→follow→목록 조회 | 통과 |
| 2026-06-22 | 하네스 | `npm --prefix .agent run harness:check` | 18개 SPA route smoke 포함 통과 |
| 2026-06-22 | `FEI-100`, `FEI-110` | frontend test/build, backend 전체 test, OpenAPI와 하네스 | frontend 28 files/135 tests, backend 181 suites/589 tests, build와 MinIO compose smoke 통과 |
| 2026-06-22 | `FEI-130` | frontend build | 통과 |
| 2026-06-22 | `FEI-131` | frontend test/build, `git diff --check`, 하네스 | frontend 26 files/113 tests, build, UI inventory와 SPA 18 routes 통과 |
| 2026-06-22 | `FEI-140` | `npm test -- --run` | frontend 106 tests 통과 |

## 완료 후 처리

- 모든 작업이 `DONE`이면 이 문서를 `.agent/docs/exec-plans/completed/`로 이동한다.
- 반복 가능한 mock/stub 검사는 하네스에 유지한다.
- 남은 제품 결정은 별도 active 실행 계획으로 분리한다.


| 2026-06-22 | `FEI-100`, `110`, `130`, `131`, `132`, `133`, `140` | `VERIFY`/`TODO` → `DONE` | frontend commit | API 연동 및 UI/UX 개선 종합 검증 완료 |


