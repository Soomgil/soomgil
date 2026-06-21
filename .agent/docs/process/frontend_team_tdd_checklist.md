# Frontend Team TDD Checklist

이 문서는 숨길 frontend 3인 개발의 역할, 파일 소유권, 우선순위와 완료 조건을 정의한다.

백엔드 도메인 담당자는 해당 도메인의 프론트 화면, API client, 상태, 타입과 사용자 흐름도 함께 담당한다. 다만 여러 도메인이 한 화면에 함께 나타나면 페이지 소유자와 도메인 컴포넌트 제공자를 분리한다.

## 문서 범위와 완료 의미

- 이 문서의 TODO가 모두 체크되면 frontend 기능 개발이 완료된 것이다.
- 현재 존재하는 페이지 scaffold, mock data, 버튼, API 함수 선언만으로는 완료 처리하지 않는다.
- 실제 backend API 연동, loading/empty/error/권한 상태, 반응형 UI, 테스트와 접근성 검증까지 끝나야 완료다.
- 서비스 전체 완료는 frontend와 backend 통합, E2E, 배포 설정, smoke test와 최종 QA까지 통과한 상태를 뜻한다.

## 역할 배분 원칙

1. backend 도메인 소유자가 같은 도메인의 frontend 사용자 흐름을 소유한다.
2. 페이지 파일은 한 명만 소유하고, 다른 담당자는 자기 도메인 컴포넌트와 composable을 제공한다.
3. API client와 type은 backend 계약과 같은 담당자가 함께 관리한다.
4. `router`, 공통 HTTP client, layout, 공통 UI와 전역 style은 공통 합의 파일로 취급한다.
5. mock 제거와 실제 API 전환은 도메인 담당자가 수행한다.
6. 화면 구현은 사용자 흐름 설명, 테스트 작성, 실패 확인, 구현, 테스트 통과, 커밋 순서로 진행한다.

## 완료 기준

각 기능은 아래 조건을 모두 만족해야 한다.

- 사용자 흐름과 수용 기준을 설명했다.
- 정상, 실패, 권한, 빈 상태와 경계 조건 테스트를 먼저 작성했다.
- mock이 아닌 실제 backend 계약에 연결했다.
- loading, empty, error, retry 상태를 구현했다.
- 모바일과 데스크톱 주요 viewport를 확인했다.
- 키보드 조작, focus, label과 대체 텍스트를 확인했다.
- component/API/store 테스트가 통과했다.
- 핵심 사용자 흐름의 E2E 또는 통합 테스트가 통과했다.
- `npm run build`와 frontend 전체 테스트가 통과했다.
- 관련 API 계약, page map과 UI inventory를 갱신했다.
- 변경 사항을 담당 frontend 브랜치에 커밋했다.

## 공통 합의 영역

| 영역 | 파일 | 주도 | 규칙 |
| :--- | :--- | :--- | :--- |
| 앱 진입점 | `frontend/src/app/` | 윤정 | plugin과 전역 provider 변경은 별도 합의 PR |
| Router | `frontend/src/router/` | 윤정 | 인증 guard는 윤정, 도메인 route 추가는 페이지 담당자와 합의 |
| HTTP/auth error | `frontend/src/api/http.ts` | 윤정 | token, refresh, Problem Details, 공통 retry 처리 |
| 공통 타입 | `frontend/src/types/api.ts` | 민경철 | pagination과 Problem Details 계약만 배치 |
| 공통 UI | `frontend/src/components/common/` | 민경철 | 도메인 로직을 넣지 않고 변경 전 3명 합의 |
| Layout | `frontend/src/components/layout/` | 윤정 | 인증 사용자 shell과 전역 navigation 담당 |
| 전역 UI 상태 | `frontend/src/stores/ui.store.ts` | 윤정 | modal/toast 등 화면 공통 상태만 배치 |
| 전역 style | `frontend/src/styles/` | 민경철 | 토큰 변경과 대규모 정리는 별도 합의 PR |
| WebSocket transport | `frontend/src/realtime/` | 김지훈 | 연결, 재접속, session ID와 topic transport 제공 |
| OpenAPI 정합성 | `.agent/contracts/openapi.yaml` | 민경철 | 도메인 담당자와 controller/client 경로를 함께 검증 |
| 테스트 기반 | frontend test config | 민경철 | Vitest/Vue Test Utils와 Playwright 기준 통일 |

공통 합의 TODO:

- [ ] 민경철: Vitest/Vue Test Utils unit/component test runner와 명령을 확정한다.
- [ ] 민경철: Playwright E2E 실행 기준과 테스트 계정/seed 정책을 확정한다.
- [ ] 민경철: `package-lock.json`을 `package.json`과 동기화하고 깨끗한 환경의 `npm ci`를 통과시킨다.
- [ ] 윤정: RFC 7807 Problem Details 공통 표시 방식을 확정한다.
- [ ] 윤정: access token refresh와 인증 만료 이동 규칙을 확정한다.
- [ ] 민경철: pagination, infinite scroll과 요청 취소 규칙을 확정한다.
- [ ] 민경철: OpenAPI와 frontend type/client 계약 diff 검증 방식을 확정한다.
- [ ] 민경철: 공통 loading, empty, error, toast와 modal 접근성 기준을 확정한다.
- [ ] 윤정: `429`, `Retry-After`, `RATE_LIMITED`의 안내와 재시도 차단 규칙을 확정한다.
- [ ] 김지훈: WebSocket 연결, 재접속, session ID 교체와 resync 공통 transport 계약을 확정한다.

## 페이지 소유권

| Page/영역 | 주 소유자 | 다른 담당자의 제공물 |
| :--- | :--- | :--- |
| `LandingPage`, `HomePage` | 윤정 | 민경철 추천 요약, 김지훈 여행방 요약 컴포넌트 |
| `LoginPage`, `RegisterPage` | 윤정 | 없음 |
| `MyPage`, `UserProfilePage`, `SettingsPage` | 윤정 | 민경철 팔로우/좋아요 장소 컴포넌트 |
| `CommunityPage`, `FeedPage`, `StoriesPage`, `StoryWritePage` | 윤정 | 민경철 media uploader와 storage 결과 |
| `AdminModerationPage` | 윤정 | 민경철 공통 table/pagination 컴포넌트 |
| `MyTripsPage` | 김지훈 | 없음 |
| `RoutePage` | 김지훈 | 윤정 AI/chat/note/checklist 패널, 민경철 장소 검색/추천 패널 |
| `RecordPage` | 김지훈 | `/trips/:tripId/records`로 이동, 민경철 media uploader와 metadata |
| `SwipePage` | 민경철 | 김지훈 trip access 상태 |
| `NotFoundPage` | 공통 | 윤정이 기본 navigation 흐름 관리 |

`RoutePage.vue`에 모든 코드를 직접 추가하지 않는다. 페이지 조합과 지도 canvas는 김지훈이 소유하고, 윤정과 민경철은 자기 디렉토리의 컴포넌트/composable/API를 제공한다.

## 전체 디렉토리 소유권

| Backend 도메인 | Frontend 영역 | 담당 |
| :--- | :--- | :--- |
| `auth`, `user`, `global/security`, `global/error` | auth/user page, guard, auth store, HTTP 인증/오류 | 윤정 |
| `ai`, `chat`, `planning` | AI/chat/note/checklist 패널과 상태 | 윤정 |
| `community`, `notification`, `ops` | community/notification과 moderation action 운영 화면. 범용 audit log UI는 MVP 제외 | 윤정 |
| `trip` | 내 여행, 여행방 설정, 멤버, 초대, 접근 권한 | 김지훈 |
| `itinerary`, `geo` | 일정 편집, Mapbox 지도, route/drawing, 지역/viewport | 김지훈 |
| `collaboration`, `global/event` | WebSocket, version conflict, undo/redo와 실시간 반영 | 김지훈 |
| `record` | 여행 기록 작성/조회/사진 피드 | 김지훈 |
| `place`, `tourism_source` | 장소 검색/상세/이미지/출처 표시 | 민경철 |
| `preference`, `social` | 태그, swipe, 추천, 팔로우 기반 표시 | 민경철 |
| `media`, `global/storage` | upload URL, 진행 상태, metadata와 재사용 uploader | 민경철 |

## 윤정

주요 소유 파일:

```text
frontend/src/pages/LandingPage.vue
frontend/src/pages/HomePage.vue
frontend/src/pages/LoginPage.vue
frontend/src/pages/RegisterPage.vue
frontend/src/pages/MyPage.vue
frontend/src/pages/UserProfilePage.vue
frontend/src/pages/SettingsPage.vue
frontend/src/pages/CommunityPage.vue
frontend/src/pages/FeedPage.vue
frontend/src/pages/StoriesPage.vue
frontend/src/pages/StoryWritePage.vue
frontend/src/pages/AdminModerationPage.vue
frontend/src/components/community/
frontend/src/components/{auth,user,ai,chat,planning,notification,admin}/
frontend/src/api/{auth,user,ai,chat,planning,community,notification,admin}.api.ts
frontend/src/stores/auth.store.ts
frontend/src/composables/{useAuth,useAi,useChat,usePlanning}.ts
frontend/src/router/guards.ts
frontend/src/types/{auth,user,ai,chat,planning,community,notification,admin}.ts
```

윤정 TODO:

- [ ] 로그인, 회원가입, access/refresh token rotation과 로그아웃 실제 API 연동
- [ ] 이메일 인증, 재발송 cooldown과 비밀번호 재설정 흐름
- [ ] 필수 약관 동의, 버전 변경 시 재동의와 가입 완료 차단 흐름
- [ ] Kakao/Google authorization URL, callback와 소셜 가입 보완 화면
- [ ] 로그인 후 명시적 소셜 계정 연결과 provider 충돌 오류 처리
- [ ] guest/auth route guard와 인증 만료 복구 흐름
- [ ] 사용자 profile, avatar, settings 조회/수정
- [ ] 로그인 세션/기기 조회, 개별 해제와 전체 로그아웃
- [ ] 계정 삭제 예약, 활성 여행방 소유자 차단과 취소 가능 상태 표시
- [ ] 공통 Problem Details, validation error와 권한 오류 표시
- [ ] AI session/message와 tool 실행 상태 UI
- [ ] 여행방 chat 메시지와 실시간 수신 UI
- [ ] 여행방/일차 note와 checklist 패널
- [ ] community feed, 공개 범위, immutable snapshot과 UNLISTED 공유 흐름
- [ ] story 작성 preview, source trip version 충돌과 private media 제외 처리
- [ ] comment/1단계 reply, like, retrip와 삭제 tombstone 처리
- [ ] API 기반 신고 사유, 신고 제출과 사용자 상태 표시
- [ ] 관리자 신고 큐, 숨김/복구/삭제와 moderation action 이력 화면
- [ ] 범용 `ops.audit_logs`는 MVP 화면과 client에서 제외
- [ ] 여행방 초대 notification 목록과 이동/처리
- [ ] Home/Landing의 실제 데이터 및 인증 상태 연결

의존 규칙:

- `RoutePage`에는 직접 대규모 수정하지 않고 AI/chat/planning 컴포넌트를 김지훈에게 제공한다.
- story 작성의 파일 업로드는 민경철의 media uploader를 사용한다.
- trip 초대 수락 후 이동은 김지훈의 trip API/store 결과를 사용한다.

## 김지훈

주요 소유 파일:

```text
frontend/src/pages/MyTripsPage.vue
frontend/src/pages/RoutePage.vue
frontend/src/pages/RecordPage.vue
frontend/src/components/trip/
frontend/src/components/{itinerary,map,collaboration,record}/
frontend/src/api/{trip,itinerary,record,geo,collaboration}.api.ts
frontend/src/realtime/
frontend/src/stores/trip.store.ts
frontend/src/composables/{useItinerary,useTripCollaboration}.ts
frontend/src/types/{trip,itinerary,record,geo,collaboration}.ts
```

김지훈 TODO:

- [ ] 여행방 목록, 생성, 수정, 삭제와 실제 API 연동
- [ ] 여행방 멤버, 직접/링크 초대 코드, 수락, 취소와 권한 UI
- [ ] 초대 링크 딥링크, 로그인 후 복귀와 만료/취소/중복 수락 처리
- [ ] 일정 day/item 생성, 수정, 삭제와 일차 미정 처리
- [ ] 일정 drag/drop 재정렬과 version conflict 복구
- [ ] Kakao mock 지도를 Mapbox 기반 지도 adapter로 교체
- [ ] viewport 이동, 법정동 검색과 coordinate 단순화 연동
- [ ] 자유 drawing canvas, 펜/색상/굵기, 지우개와 표시 toggle
- [ ] 저장 전 drawing preview의 로컬 undo/redo
- [ ] drawing preview를 STOMP로 송수신하고 좌표를 throttle/downsample
- [ ] drawing 저장/수정/삭제와 Mapbox map matching 연동
- [ ] route segment 표시, 갱신, 삭제와 실패/재시도 UI
- [ ] STOMP 연결, 서버 session ID 전달과 trip topic 구독
- [ ] 연결 종료 시 undo/redo 비활성화, 지수 backoff 재접속과 새 session ID 교체
- [ ] missed event 발생 시 최신 일정 resync, 중복/역순 event 방어
- [ ] 협업 event 반영, 서버 undo/redo와 version 충돌 처리
- [ ] 기록 route를 `/trips/:tripId/records`로 변경하고 여행방 context를 명시
- [ ] 여행 기록 entry CRUD, 일정 참조, 여행방 사진과 전역 사진 피드 연동

의존 규칙:

- 추천/장소 패널은 민경철 컴포넌트와 query client를 사용한다.
- AI/chat/note/checklist는 윤정 컴포넌트를 `RoutePage`에 조합한다.
- record 파일 업로드는 민경철 media uploader 결과만 받아 record 연결 API를 호출한다.
- 실제 JWT/principal 연동은 윤정의 auth store와 HTTP client를 사용한다.

## 민경철

주요 소유 파일:

```text
frontend/src/pages/SwipePage.vue
frontend/src/components/swipe/
frontend/src/components/{place,preference,social,media}/
frontend/src/api/{place,swipe,preference,recommendation,social,media}.api.ts
frontend/src/composables/useSwipe.ts
frontend/src/types/{place,swipe,preference,recommendation,social,media}.ts
```

민경철 TODO:

- [ ] 장소 검색, 상세와 viewport 후보 실제 API 연동
- [ ] 관광지 일반 이미지와 수상작 이미지/출처 표시
- [ ] 고정 태그 whitelist와 preference 초기 설정 UI
- [ ] swipe feed loading/empty/error와 카드 interaction
- [ ] LIKE/DISLIKE/SUPER_LIKE 저장 및 중복 요청 방지
- [ ] 사용자 preference projection 요약 UI
- [ ] 지도 추천 패널과 참여자 태그 기반 정렬/필터
- [ ] SUPER_LIKE/거리/viewport 추천 상태 표시
- [ ] follow/unfollow, follower/following 목록과 공개 profile social surface
- [ ] 저장/좋아요 장소 목록과 profile 연동
- [ ] upload URL 발급, 진행률, 실패 재시도와 metadata 확정
- [ ] community/record/profile에서 재사용할 media uploader 제공

의존 규칙:

- `RoutePage`는 직접 소유하지 않고 장소 검색/추천 패널을 김지훈에게 제공한다.
- `MyPage`는 직접 소유하지 않고 social/liked-place 컴포넌트를 윤정에게 제공한다.
- swipe와 추천 요청의 trip 접근 실패는 김지훈의 trip access 상태를 사용한다.

## 권장 작업 순서

1. 공통 test runner, HTTP error, auth refresh와 OpenAPI 검증 기준 확정
2. 각 담당자의 API client/type을 실제 backend 계약에 맞춤
3. 윤정 auth/user, 김지훈 trip, 민경철 place/swipe의 독립 흐름 완성
4. 김지훈 `RoutePage` 조합 경계와 Mapbox 지도 기반 완성
5. 윤정 AI/chat/planning, 민경철 추천/place 패널을 `RoutePage`에 통합
6. record/community에 민경철 media uploader 통합
7. WebSocket 협업, version conflict와 복합 E2E 검증
8. 전체 build/test, 반응형/접근성, smoke test와 최종 QA

## Merge Conflict 방지 규칙

- [ ] 한 Page 파일의 주 소유자는 한 명만 둔다.
- [ ] 다른 담당자의 Page에 필요한 기능은 자기 도메인 컴포넌트로 제공한다.
- [ ] `RoutePage.vue`, `MyPage.vue`, `HomePage.vue`를 동시에 수정하지 않는다.
- [ ] `http.ts`, router, app shell, 전역 style 변경은 별도 합의 PR로 분리한다.
- [ ] API client와 type은 같은 도메인 담당자가 함께 변경한다.
- [ ] OpenAPI 변경은 backend controller와 frontend client 영향을 함께 기록한다.
- [ ] frontend submodule PR이 merge된 뒤 orchestration pointer를 별도 갱신한다.

## 기능 카드 템플릿

```text
## [담당자] 기능명

소유 Page/컴포넌트:
Backend API:
의존 컴포넌트:

이해/설명:
- [ ] 사용자 흐름 설명
- [ ] 수용 기준 설명
- [ ] 실패/권한/경계 조건 설명
- [ ] OK 받음

테스트:
- [ ] component/API/store 테스트 작성
- [ ] loading/empty/error/권한 테스트 작성
- [ ] 테스트 실패 확인

구현:
- [ ] 실제 API/type 연결
- [ ] 상태와 사용자 interaction 구현
- [ ] 반응형/접근성 구현

검증:
- [ ] 관련 테스트 통과
- [ ] build 통과
- [ ] 주요 viewport 시각 검증
- [ ] E2E 또는 통합 테스트 통과
- [ ] 문서/인벤토리 갱신
- [ ] 커밋
```
