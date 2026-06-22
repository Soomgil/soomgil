# 숨길 백엔드 API 명세 초안

작성일: 2026-06-09  
상태: OpenAPI 3.1 협의 초안

## 작성 범위와 근거

이 문서는 프론트엔드 구현 상태가 아니라 현재 레포에 있는 기획/계약 문서를 기준으로 작성했다. `frontend/`와 `backend/`는 현재 제품 코드가 사실상 비어 있는 submodule 포인터 상태이므로, 프론트엔드 라우트 문서는 화면 연결을 위한 보조 자료로만 사용했다.

확정 근거:

- `README.md`: 서비스 한 줄 설명, orchestration repo 구조, backend contract 위치.
- `.agent/docs/product-specs/service_requirements.md`: V1 서비스 요구사항, 스와이프/추천/일정/지도/커뮤니티/AI/기록/알림/협업 규칙.
- `.agent/contracts/backend_contract_decisions.md`: 백엔드 계약 결정, REST/Problem Details/권한/데이터 정책.
- `.agent/contracts/schema.dbml`: PostgreSQL 기준 V1 데이터 모델.
- `.agent/docs/product-specs/functional_spec.md`: 사용자 유형, 화면 범위, 백엔드 필요 기능.
- `.agent/docs/frontend/page_map.md`: 화면/라우트 보조 자료. 확정 API 근거가 아니라 관련 화면 매핑에만 사용.

브랜치 ledger:

- `npm --prefix .agent run branch:status` 기준 현재 ledger key는 `detached-unknown`이다.
- `.agent/branch-ledger/branches/detached-unknown/`가 없으므로 브랜치별 ledger는 참고하지 않았다.

표기 규칙:

- **확정**: 위 문서에서 직접 확인되는 내용.
- **설계상 추론**: 문서의 도메인/DBML을 바탕으로 API 형태로 구체화한 내용.
- **확인 필요**: PM/디자인/백엔드/프론트엔드 협의 전 임의 확정하지 않은 내용.

## 1. 서비스 도메인 요약

### 주요 사용자 역할

| 역할 | 설명 | 근거 |
| :--- | :--- | :--- |
| 비회원/게스트 | 공개 커뮤니티 글 조회, 로그인/회원가입 진입 | `.agent/docs/frontend/page_map.md` |
| 일반 사용자 | 스와이프 취향 수집, 여행방 생성/참여, 커뮤니티 탐색 | `.agent/docs/product-specs/functional_spec.md` |
| 여행방 소유자 | `trip.trips.owner_user_id` 사용자. 설정, 초대, 삭제 권한 보유 | `.agent/contracts/backend_contract_decisions.md` |
| 여행방 MEMBER | `trip.trip_members.role=MEMBER`인 active 멤버. 일정 편집, 기록 업로드, 채팅, AI 사용 가능 | `.agent/contracts/backend_contract_decisions.md` |
| 게시글 작성자 | 여행방 snapshot을 공개/비공개 링크 게시글로 발행 | `.agent/docs/product-specs/service_requirements.md` |
| MODERATOR/ADMIN/SUPER_ADMIN | 신고 처리, 콘텐츠 숨김/복구/삭제, 운영 감사 | `.agent/contracts/backend_contract_decisions.md` |

확인 필요:

- OWNER 이관은 MVP 제외. MEMBER 자진 탈퇴, 소유자 계정 삭제 시 처리 정책.
- 게스트에게 공개 커뮤니티 상세의 어느 범위까지 노출할지.

### 핵심 리소스

| 도메인 | 리소스 | 설명 |
| :--- | :--- | :--- |
| Auth | User, UserEmailAddress, UserProfile, UserSettings, AuthProvider, Session, PolicyDocument, SecurityEvent, Role | 이메일/비밀번호와 Kakao/Google 소셜 로그인, 약관 동의, 세션/보안 이벤트, 운영 RBAC |
| Social | Follow | 앱 내부 directed follow edge |
| Geo | LegalRegion | 법정동코드 10자리 기반 지역 |
| Trip | Trip, TripRegion, TripMember, TripInvite | 여행방, 다중 지역, 멤버십, 초대 |
| Place/Preference | PlaceRef, SwipeReaction, SwipeEvent, PreferenceTag, SavedPlace | 관광공사 장소 참조, 스와이프 기반 선호도 projection |
| Itinerary | ItineraryDay, ItineraryItem, RouteSegment, MapDrawing | 일차/일차 미정, 장소 아이템, Mapbox snapped route, 저장된 도형 |
| Collaboration | CollaborationCommand, UndoRedoSession | REST 저장 + STOMP broadcast + 버전 충돌 처리 |
| Planning | Note, Checklist, ChecklistItem, MemberChecklistStatus | 여행방/일차 scope 단일 메모와 체크리스트 |
| Chat | TripChatMessage | 여행방 전체 텍스트 채팅 |
| AI | AiChatSession, AiChatMessage, AiToolCall | trip당 공유 AI 세션과 제한된 tool calling |
| Record | TripRecordEntry, TripRecordMedia | 여행방 멤버용 사적 여행 기록 |
| Community | Post, SnapshotDay/Item/Route, Comment, Like, Retrip, Report | 여행방 snapshot 공개 공유, 댓글, 좋아요, 리트립, 신고 |
| Media | MediaFile, UploadUrl | S3 호환 object storage 파일 metadata |
| Notification | Notification | MVP 직접 초대 인앱 알림 |

### 주요 유스케이스

- 사용자는 전역 스와이프 feed에서 `LIKE`, `NOPE`, `SUPER_LIKE`로 취향 데이터를 쌓는다.
- 사용자는 `SUPER_LIKE`한 장소만 저장할 수 있다.
- 여행방 멤버는 누적 스와이프 선호도를 바탕으로 viewport 안 추천 장소를 받고, 추천 카드를 일정에 바로 추가한다.
- 여행방 멤버는 일정, route segment, 지도 도형, 메모, 체크리스트를 협업 편집한다.
- 지도 선 그리기는 Mapbox Map Matching으로 `DRIVING`/`WALKING` snapped route를 생성한다.
- 협업 write는 `baseVersion` 충돌 검사를 통과해야 하며 성공 시 `itineraryVersion`이 증가하고 WebSocket/STOMP로 broadcast된다.
- 같은 WebSocket 세션 안에서 본인이 수행한 최근 협업 command는 undo/redo 가능하다.
- 여행방에는 공유 AI agent session이 하나 있고, AI는 일정 편집/미정 장소 배치/장소 탐색/메모/체크리스트 도구만 실행한다.
- 완성된 여행방은 게시 시점 snapshot으로 커뮤니티에 발행되고, 리트립하면 snapshot 전체가 새 여행방으로 복제된다.
- 여행 기록은 여행방 멤버에게만 보이는 사적 기록이며, 공개 공유는 커뮤니티 게시글 발행을 통해 수행한다.

### 상태값과 비즈니스 규칙

| 상태/enum | 값 | 규칙 |
| :--- | :--- | :--- |
| UserStatus | `ACTIVE`, `SUSPENDED`, `PENDING_DELETION`, `DELETED` | 계정 삭제는 예약 상태를 거친 뒤 soft delete/purge 정책을 적용 |
| TripStatus | `ACTIVE`, `ARCHIVED`, `DELETED` | 소유자만 설정/삭제 가능으로 설계 |
| TripMemberRole | `MEMBER` | MVP `trip_members.role`에는 MEMBER만 저장. OWNER 표시는 `ownerUserId`에서 파생 |
| TripMemberStatus | `ACTIVE`, `LEFT`, `REMOVED` | 제거/탈퇴 이력 보존 |
| InviteStatus | `PENDING`, `ACCEPTED`, `REVOKED`, `EXPIRED` | 초대 링크/코드 지원 |
| ItineraryDayGroupType | `DAY`, `UNSCHEDULED` | trip당 `UNSCHEDULED` 최대 1개 |
| ItineraryItemType | `PLACE`, `CUSTOM_PLACE` | 외부 장소는 `provider + externalPlaceId`, 커스텀 장소는 item 안에 저장 |
| PlaceSourceStatus | `AVAILABLE`, `DELETED`, `UNKNOWN` | 외부 원본 불가 시 snapshot/item에서 상태 표시 |
| SwipeReaction | `LIKE`, `NOPE`, `SUPER_LIKE` | V1 선호도 추론의 유일 입력 |
| RouteMode | `DRIVING`, `WALKING` | Mapbox `mapbox/driving`, `mapbox/walking`으로 변환 |
| RouteMatchStatus | `PENDING`, `SUCCEEDED`, `FAILED` | 실패 시 snapped route 저장하지 않음 |
| DrawingType | `FREEHAND`, `LINE`, `POLYGON`, `MARKER`, `TEXT` | 저장된 도형만 영구 저장 |
| CollaborationSource | `USER`, `AI_TOOL`, `UNDO`, `REDO` | undo/redo도 version 증가 및 broadcast |
| NoteScope/ChecklistScope | `TRIP`, `DAY` | scope별 단일 문서/리스트 |
| AiRole | `SYSTEM`, `USER`, `ASSISTANT`, `TOOL` | 사용자 UI에는 tool JSON 노출하지 않음 |
| AiToolPolicy | `READ`, `REVERSIBLE_WRITE`, `BLOCKED_HIGH_RISK` | 위험한 write는 V1 registry 제외 |
| PostVisibility | `PUBLIC`, `UNLISTED` | `PRIVATE`는 MVP 제외 |
| ModerationStatus | `VISIBLE`, `HIDDEN`, `DELETED` | 신고 즉시 자동 숨김 없음 |
| ReportStatus | `OPEN`, `REVIEWING`, `RESOLVED`, `REJECTED` | 중복 신고 방지 |
| RecordVisibility | `TRIP_MEMBERS` | 공개는 community post로 처리 |

## 2. API 설계 원칙

### Base URL

- Production: `https://api.soomgil.example.com/api/v1`
- Local: `http://localhost:8080/api/v1`
- `soomgil.example.com`은 placeholder이며 실제 도메인은 확인 필요.

### API versioning

- URI versioning: `/api/v1`
- breaking change는 `/api/v2`로 분리한다.
- enum 값 추가, nullable optional 필드 추가, 새 endpoint 추가는 V1 compatible change로 본다.

### 인증 방식

- REST: `Authorization: Bearer {accessToken}`
- 토큰 갱신: refresh token 기반 `POST /auth/refresh`
- 소셜 로그인: Kakao/Google provider code 또는 authorization code 교환 endpoint가 필요하나, redirect/callback 방식은 확인 필요.
- WebSocket/STOMP: handshake 시 Bearer token 전달. 구체 헤더/쿼리 전달 방식은 확인 필요.

### 권한 규칙

- 공개: 회원가입/로그인, 공개 커뮤니티 목록/상세, 법정동 검색 일부.
- 로그인 사용자: 내 정보, 스와이프, 저장 장소, 내 여행방 목록, 커뮤니티 반응/댓글/신고.
- 여행방 active member: 여행방 상세, 일정/지도/메모/체크리스트/채팅/AI/기록 접근.
- 여행방 소유자(`ownerUserId`): 여행방 설정 변경, 초대 생성/취소, 멤버 제거, 여행방 삭제.
- ADMIN/MODERATOR: 신고 큐, moderation action.

### 공통 헤더

| 헤더 | 방향 | 필수 | 설명 |
| :--- | :--- | :--- | :--- |
| `Authorization` | request | 인증 endpoint 제외 필수 | Bearer access token |
| `Content-Type` | request | body 있는 요청 필수 | `application/json` 또는 upload 관련 content type |
| `Accept` | request | 권장 | `application/json`, 에러는 `application/problem+json` |
| `X-Request-Id` | request/response | 권장 | 클라이언트 추적 ID. 없으면 서버 생성 |
| `Idempotency-Key` | request | 생성/외부 호출성 POST 권장 | 중복 생성 방지. invite, publish, upload-url, route match, retrip 등에 적용 |
| `X-Soomgil-WebSocket-Session-Id` | request | 협업 write 권장 | undo/redo stack 귀속을 위한 활성 WebSocket 세션 ID |

### 공통 응답 포맷

- 성공 응답은 wrapper 없이 HTTP-native JSON을 반환한다.
- 단건: 리소스 object.
- 목록: 아래 형태의 page 또는 offset metadata를 포함한 object.

```json
{
  "items": [],
  "page": {
    "page": 0,
    "size": 20,
    "totalElements": 0,
    "totalPages": 0,
    "sort": ["createdAt,desc"]
  }
}
```

### 공통 에러 포맷

RFC7807 Problem Details를 사용한다.

```json
{
  "type": "https://api.soomgil.example.com/problems/version-conflict",
  "title": "Version conflict",
  "status": 409,
  "detail": "baseVersion 12 does not match current itineraryVersion 13.",
  "instance": "/api/v1/trips/3fa85f64-5717-4562-b3fc-2c963f66afa6/itinerary/items",
  "code": "ITINERARY_VERSION_CONFLICT",
  "requestId": "req_01JZ0000000000000000000000",
  "fields": [
    {
      "name": "baseVersion",
      "reason": "Expected 13."
    }
  ]
}
```

대표 status:

- `400 Bad Request`: JSON 파싱/파라미터 오류.
- `401 Unauthorized`: 인증 없음/만료.
- `403 Forbidden`: 권한 없음.
- `404 Not Found`: 리소스 없음 또는 접근 불가 리소스 은닉.
- `409 Conflict`: version conflict, 중복 신고/좋아요/초대 등 상태 충돌.
- `422 Unprocessable Entity`: business rule 위반. 예: SUPER_LIKE하지 않은 장소 저장.
- `429 Too Many Requests`: rate limit.
- `502 Bad Gateway`: Mapbox/KTO 등 upstream 실패.

### 페이지네이션/정렬/필터 규칙

- 기본 목록: `page`, `size`, `sort=field,asc|desc`
- 기본 `size`: 20, 최대 100.
- 채팅/AI message 목록은 MVP에서 `offset`, `limit` 기반 무한스크롤을 사용한다. 정렬은 `createdAt,desc`, `id,desc`로 고정하고 cursor는 사용하지 않는다.
- 필터는 도메인별 query parameter로 명시한다. 예: `status`, `visibility`, `tripId`, `scopeType`, `bbox`, `tab`.
- 정렬 가능한 필드는 endpoint별로 whitelist를 둔다.

### 실시간 협업 방식

REST만으로는 지도 드로잉 preview, 일정 동시 편집, 채팅, AI tool write 결과 반영에 부족하므로 STOMP over WebSocket을 병행한다.

제안 endpoint/channel:

- Handshake: `GET /ws`
- Subscribe: `/topic/trips/{tripId}/itinerary`
- Subscribe: `/topic/trips/{tripId}/map-drawings`
- Subscribe: `/topic/trips/{tripId}/route-matching`
- Subscribe: `/topic/trips/{tripId}/chat`
- Subscribe: `/topic/trips/{tripId}/ai`
- Send preview: `/app/trips/{tripId}/map-drawing-preview`

확인 필요:

- STOMP destination naming, auth handshake 방식, preview stroke payload 크기 제한.

## 3. Endpoint 목록

아래 endpoint는 백엔드/프론트엔드 협의를 위한 V1 초안이다. request/response schema 이름은 `.agent/contracts/openapi.yaml`의 `components.schemas`와 맞춘다.

### Auth / Me

#### POST `/auth/register`

- 설명: 이메일/비밀번호 계정 생성. `auth.users` 계정 anchor, primary email, profile, settings, password credential, 필수 약관 동의를 함께 생성한다.
- 인증/권한: 공개.
- Path parameters: 없음.
- Query parameters: 없음.
- Request body schema: `RegisterRequest`.
- Response body schema: `AuthTokenResponse`.
- 성공 응답 예시: `201 {"accessToken":"...","refreshToken":"...","user":{"id":"...","primaryEmail":"minji@example.com","profile":{"displayName":"민지"}}}`
- 실패 응답 예시: `409 ProblemDetails(code=EMAIL_ALREADY_USED)`.
- 관련 유스케이스 또는 화면: `/register`.
- 근거 문서 또는 코드 경로: `.agent/contracts/backend_contract_decisions.md`, `.agent/contracts/schema.dbml`, `.agent/docs/frontend/page_map.md`.
- 확인 필요 사항: 이메일 인증을 가입 완료 전 필수로 할지, 필수 약관 미동의 시 가입을 차단할지.

#### POST `/auth/email-verification-requests`

- 설명: 이메일 인증 메일 발송을 요청한다. raw token은 저장하지 않고 hash만 저장한다.
- 인증/권한: 공개. 로그인 사용자 primary email 재인증에도 재사용 가능.
- Path parameters: 없음.
- Query parameters: 없음.
- Request body schema: `EmailVerificationRequest`.
- Response body schema: 없음, `202 Accepted`.
- 성공 응답 예시: `202`.
- 실패 응답 예시: `429 ProblemDetails(code=EMAIL_VERIFICATION_RATE_LIMITED)`.
- 관련 유스케이스 또는 화면: 회원가입 직후 이메일 인증, 설정의 이메일 재인증.
- 근거 문서 또는 코드 경로: `auth.user_email_addresses`, `auth.user_email_verification_tokens`.
- 확인 필요 사항: 인증 메일 재발송 cooldown, token TTL, 미인증 사용자 기능 제한.

#### POST `/auth/email-verifications`

- 설명: 이메일 인증 token을 검증하고 primary email의 `verifiedAt`을 기록한다.
- 인증/권한: 공개.
- Path parameters: 없음.
- Query parameters: 없음.
- Request body schema: `VerifyEmailRequest`.
- Response body schema: `User`.
- 성공 응답 예시: `200 {"id":"...","primaryEmailVerifiedAt":"2026-06-10T00:00:00Z"}`
- 실패 응답 예시: `422 ProblemDetails(code=EMAIL_VERIFICATION_TOKEN_INVALID)`.
- 관련 유스케이스 또는 화면: 이메일 인증 landing.
- 근거 문서 또는 코드 경로: `auth.user_email_verification_tokens`.
- 확인 필요 사항: token 사용 후 자동 로그인 여부.

#### POST `/auth/login`

- 설명: 이메일/비밀번호 로그인.
- 인증/권한: 공개.
- Path parameters: 없음.
- Query parameters: 없음.
- Request body schema: `LoginRequest`.
- Response body schema: `AuthTokenResponse`.
- 성공 응답 예시: `200 {"accessToken":"...","refreshToken":"...","user":{"id":"...","displayName":"민지"}}`
- 실패 응답 예시: `401 ProblemDetails(code=INVALID_CREDENTIALS)`.
- 관련 화면: `/login`.
- 근거: `.agent/docs/api/api_spec.md`, `.agent/contracts/backend_contract_decisions.md`.
- 확인 필요: 계정 잠금/rate limit 기준.

#### POST `/auth/password-reset-requests`

- 설명: 비밀번호 재설정 메일 발송을 요청한다.
- 인증/권한: 공개.
- Path parameters: 없음.
- Query parameters: 없음.
- Request body schema: `PasswordResetRequest`.
- Response body schema: 없음, `202 Accepted`.
- 성공 응답 예시: `202`.
- 실패 응답 예시: 계정 존재 여부를 노출하지 않기 위해 일반적으로 `202`를 유지하고 rate limit만 `429`로 반환.
- 관련 화면: 로그인/비밀번호 찾기.
- 근거: `auth.user_password_reset_tokens`, `auth.user_security_events`.
- 확인 필요: reset token TTL, 발송 채널, 보안 이벤트 노출 범위.

#### POST `/auth/password-resets`

- 설명: 비밀번호 재설정 token으로 새 비밀번호를 설정한다.
- 인증/권한: 공개.
- Path parameters: 없음.
- Query parameters: 없음.
- Request body schema: `ResetPasswordRequest`.
- Response body schema: 없음, `204 No Content`.
- 성공 응답 예시: `204`.
- 실패 응답 예시: `422 ProblemDetails(code=PASSWORD_RESET_TOKEN_INVALID)`.
- 관련 화면: 비밀번호 재설정.
- 근거: `auth.user_password_credentials`, `auth.user_password_reset_tokens`.
- 확인 필요: 재설정 성공 시 기존 세션 전체 revoke 여부.

#### GET `/auth/policy-documents`

- 설명: 가입/설정에서 표시할 약관/정책 문서 목록을 조회한다.
- 인증/권한: 공개.
- Path parameters: 없음.
- Query parameters: `requiredOnly`, `languageCode`.
- Request body schema: 없음.
- Response body schema: `PolicyDocument[]`.
- 성공 응답 예시: `200 [{"id":"...","policyCode":"TERMS_OF_SERVICE","version":"2026-06","isRequired":true}]`
- 실패 응답 예시: `400 ProblemDetails(code=INVALID_LANGUAGE_CODE)`.
- 관련 화면: `/register`, `/settings`.
- 근거: `auth.policy_documents`, `auth.user_policy_acceptances`.
- 확인 필요: 약관 강제 재동의 flow와 retired policy 노출 여부.

#### GET `/auth/oauth/{provider}/authorization-url`

- 설명: 소셜 로그인 authorization URL을 발급한다.
- 인증/권한: 공개.
- Path parameters: `provider=KAKAO|GOOGLE`.
- Query parameters: `redirectUri`, `state`.
- Request body schema: 없음.
- Response body schema: `OAuthAuthorizationUrlResponse`.
- 성공 응답 예시: `200 {"authorizationUrl":"https://...","state":"..."}`
- 실패 응답 예시: `422 ProblemDetails(code=UNSUPPORTED_AUTH_PROVIDER)`.
- 관련 화면: `/login`, `/register`.
- 근거: `.agent/contracts/backend_contract_decisions.md`, `auth.auth_providers`.
- 확인 필요: 프론트가 URL 생성을 직접 할지, 서버가 생성할지.

#### POST `/auth/oauth/{provider}/callback`

- 설명: Kakao/Google authorization code를 서버에서 교환해 로그인/가입 처리한다.
- 인증/권한: 공개.
- Path parameters: `provider=KAKAO|GOOGLE`.
- Query parameters: 없음.
- Request body schema: `OAuthCallbackRequest`.
- Response body schema: `AuthTokenResponse`.
- 성공 응답 예시: `200 {"accessToken":"...","refreshToken":"...","user":{"id":"..."}}`
- 실패 응답 예시: `401 ProblemDetails(code=OAUTH_EXCHANGE_FAILED)`.
- 관련 화면: OAuth redirect/callback.
- 근거: `.agent/contracts/backend_contract_decisions.md`, `auth.user_auth_identities`.
- 확인 필요: 신규 소셜 계정 가입 시 displayName/약관 동의 보완 흐름.

#### POST `/auth/refresh`

- 설명: refresh token으로 access token 재발급.
- 인증/권한: refresh token 필요.
- Path parameters: 없음.
- Query parameters: 없음.
- Request body schema: `RefreshTokenRequest`.
- Response body schema: `AuthTokenResponse`.
- 성공 응답 예시: `200 {"accessToken":"...","refreshToken":"..."}`
- 실패 응답 예시: `401 ProblemDetails(code=REFRESH_TOKEN_EXPIRED)`.
- 관련 화면: 전역 auth client.
- 근거: `auth.user_sessions` in `.agent/contracts/schema.dbml`.
- 확인 필요: refresh token rotation과 revoke 정책.

#### POST `/auth/logout`

- 설명: 현재 refresh session revoke.
- 인증/권한: 로그인 사용자.
- Path parameters: 없음.
- Query parameters: 없음.
- Request body schema: `LogoutRequest`.
- Response body schema: 없음, `204 No Content`.
- 성공 응답 예시: `204`.
- 실패 응답 예시: `401 ProblemDetails(code=UNAUTHORIZED)`.
- 관련 화면: `/settings`, 전역 auth.
- 근거: `.agent/docs/api/api_spec.md`, `auth.user_sessions`.
- 확인 필요: 전체 기기 로그아웃 지원 여부.

#### GET `/me`

- 설명: 현재 로그인 사용자 프로필 조회.
- 인증/권한: 로그인 사용자.
- Path parameters: 없음.
- Query parameters: 없음.
- Request body schema: 없음.
- Response body schema: `User`.
- 성공 응답 예시: `200 {"id":"...","email":"minji@example.com","displayName":"민지","status":"ACTIVE"}`
- 실패 응답 예시: `401 ProblemDetails(code=UNAUTHORIZED)`.
- 관련 화면: `/mypage`, `/settings`.
- 근거: `.agent/docs/api/api_spec.md`, `auth.users`.
- 확인 필요: 프로필에 follow count, trip count를 포함할지.

#### PATCH `/me`

- 설명: 현재 사용자 프로필 수정. DBML의 `auth.user_profiles`에 대응한다.
- 인증/권한: 로그인 사용자.
- Path parameters: 없음.
- Query parameters: 없음.
- Request body schema: `UpdateMeRequest`.
- Response body schema: `User`.
- 성공 응답 예시: `200 {"id":"...","displayName":"민지","profileImageUrl":"https://..."}`
- 실패 응답 예시: `422 ProblemDetails(code=INVALID_PROFILE_IMAGE)`.
- 관련 화면: `/mypage`, `/settings`.
- 근거: `auth.users`, `media.media_files`.
- 확인 필요: display name 중복 허용 여부, 프로필 이미지 업로드 플로우, bio 노출 범위.

#### DELETE `/me`

- 설명: 계정 삭제를 예약한다. 즉시 hard delete가 아니라 `PENDING_DELETION` 상태와 삭제 예정 시각을 기록한다. 요청자가 `ownerUserId`인 활성 여행방이 있으면 MVP에서는 OWNER 이관이 없으므로 삭제 예약을 차단한다.
- 인증/권한: 로그인 사용자.
- Path parameters: 없음.
- Query parameters: 없음.
- Request body schema: 없음.
- Response body schema: 없음, `202 Accepted`.
- 성공 응답 예시: `202`.
- 실패 응답 예시: `409 ProblemDetails(code=ACCOUNT_DELETION_BLOCKED_BY_ACTIVE_OWNER_TRIP)`.
- 관련 화면: `/settings`.
- 근거: `auth.users.status`, `deletion_requested_at`, `deletion_scheduled_at`.
- 확정: 소유자인 활성 여행방이 있으면 삭제 예약을 차단하고, 사용자가 해당 여행방을 삭제 또는 보존 정책에 맞게 정리하도록 요구한다.

#### GET `/me/settings`

- 설명: 현재 사용자 설정을 조회한다.
- 인증/권한: 로그인 사용자.
- Path parameters: 없음.
- Query parameters: 없음.
- Request body schema: 없음.
- Response body schema: `UserSettings`.
- 성공 응답 예시: `200 {"displayLanguage":"ko","timezone":"Asia/Seoul","marketingEmailOptIn":false}`
- 실패 응답 예시: `401 ProblemDetails(code=UNAUTHORIZED)`.
- 관련 화면: `/settings`.
- 근거: `auth.user_settings`.
- 확인 필요: 설정 값 변경 이력을 별도 저장할지.

#### PATCH `/me/settings`

- 설명: 표시 언어, timezone, 마케팅 이메일 수신, 여행방 초대 이메일 수신 설정을 수정한다.
- 인증/권한: 로그인 사용자.
- Path parameters: 없음.
- Query parameters: 없음.
- Request body schema: `UpdateUserSettingsRequest`.
- Response body schema: `UserSettings`.
- 성공 응답 예시: `200 {"displayLanguage":"ko","timezone":"Asia/Seoul","tripInviteEmailOptIn":true}`
- 실패 응답 예시: `422 ProblemDetails(code=INVALID_TIMEZONE)`.
- 관련 화면: `/settings`.
- 근거: `auth.user_settings`.
- 확인 필요: 마케팅 동의를 `policy_acceptances`와 함께 관리할지.

#### GET `/me/sessions`

- 설명: 내 refresh session 목록을 조회한다.
- 인증/권한: 로그인 사용자.
- Path parameters: 없음.
- Query parameters: `page`, `size`.
- Request body schema: 없음.
- Response body schema: `PagedUserSession`.
- 성공 응답 예시: `200 {"items":[{"id":"...","deviceName":"Chrome on Windows","expiresAt":"..."}]}`
- 실패 응답 예시: `401 ProblemDetails(code=UNAUTHORIZED)`.
- 관련 화면: `/settings`.
- 근거: `auth.user_sessions`.
- 확인 필요: IP/user agent hash를 사용자에게 역변환 표시하지 않고 device label만 저장할지.

#### DELETE `/me/sessions/{sessionId}`

- 설명: 특정 로그인 세션을 revoke한다.
- 인증/권한: 로그인 사용자. 본인 세션만 가능.
- Path parameters: `sessionId`.
- Query parameters: 없음.
- Request body schema: 없음.
- Response body schema: 없음, `204 No Content`.
- 성공 응답 예시: `204`.
- 실패 응답 예시: `404 ProblemDetails(code=SESSION_NOT_FOUND)`.
- 관련 화면: `/settings`.
- 근거: `auth.user_sessions.revoked_at`, `revoked_by_user_id`, `revocation_reason`.
- 확인 필요: 현재 세션 revoke 시 즉시 로그아웃 UX.

#### GET `/me/security-events`

- 설명: 내 계정 보안 이벤트를 조회한다.
- 인증/권한: 로그인 사용자.
- Path parameters: 없음.
- Query parameters: `page`, `size`.
- Request body schema: 없음.
- Response body schema: `PagedSecurityEvent`.
- 성공 응답 예시: `200 {"items":[{"eventType":"LOGIN_SUCCESS","success":true,"createdAt":"..."}]}`
- 실패 응답 예시: `401 ProblemDetails(code=UNAUTHORIZED)`.
- 관련 화면: `/settings`.
- 근거: `auth.user_security_events`.
- 확인 필요: 실패 사유와 위치/IP 정보를 어느 수준까지 사용자에게 보여줄지.

### Social / Users / Regions

#### GET `/users`

- 설명: 직접 초대/팔로우를 위한 사용자 검색.
- 인증/권한: 로그인 사용자.
- Path parameters: 없음.
- Query parameters: `q`, `page`, `size`.
- Request body schema: 없음.
- Response body schema: `PagedUserSummary`.
- 성공 응답 예시: `200 {"items":[{"id":"...","displayName":"현우"}],"page":{"page":0,"size":20}}`
- 실패 응답 예시: `401 ProblemDetails(code=UNAUTHORIZED)`.
- 관련 화면: 여행방 초대, 팔로우 UI.
- 근거: `trip.trip_invites.invitee_user_id`, `social.user_follows`.
- 확인 필요: 이메일 검색 허용 여부와 privacy 제한.

#### GET `/users/{userId}`

- 설명: 사용자 프로필 조회. `PRIVATE` 프로필은 승인된 follower에게만 전체 프로필을 반환한다.
- 인증/권한: 로그인 사용자. 미승인 사용자는 제한된 summary만 조회한다.
- Path parameters: `userId`.
- Query parameters: 없음.
- Request body schema: 없음.
- Response body schema: `UserPublicProfile`.
- 성공 응답 예시: `200 {"id":"...","displayName":"현우","profileImageUrl":"https://...","profileVisibility":"PRIVATE","followStatus":"ACTIVE"}`
- 실패 응답 예시: `404 ProblemDetails(code=USER_NOT_FOUND)`.
- 관련 화면: 팔로우/커뮤니티 작성자 프로필.
- 근거: `auth.users`, `social.user_follows`.
- 확정: 비회원 공개 프로필 조회와 block account는 MVP에서 제공하지 않는다. private account는 follow request 승인 기반으로 제공한다.

#### PUT `/users/{userId}/follow`

- 설명: 대상 사용자를 팔로우한다. 공개 프로필은 즉시 `ACTIVE`, 비공개 프로필은 `PENDING` follow request가 된다.
- 인증/권한: 로그인 사용자.
- Path parameters: `userId`.
- Query parameters: 없음.
- Request body schema: 없음.
- Response body schema: `Follow`.
- 성공 응답 예시: `200 {"followerUserId":"...","followingUserId":"...","status":"PENDING"}`
- 실패 응답 예시: `422 ProblemDetails(code=CANNOT_FOLLOW_SELF)`.
- 관련 화면: 커뮤니티/프로필.
- 근거: `.agent/contracts/backend_contract_decisions.md`, `social.user_follows`.
- 확정: self-follow는 차단한다. private profile follow request는 MVP에 포함하고, block은 제외한다.

#### GET `/me/follow-requests`

- 설명: 내 비공개 프로필에 들어온 대기 중 follow 요청 목록.
- 인증/권한: 로그인 사용자.
- Path parameters: 없음.
- Query parameters: `page`, `size`.
- Request body schema: 없음.
- Response body schema: `PagedFollowRequest`.
- 성공 응답 예시: `200 {"items":[{"follower":{"id":"...","displayName":"민지"},"status":"PENDING"}]}`
- 실패 응답 예시: `401 ProblemDetails(code=UNAUTHORIZED)`.
- 관련 화면: 프로필/팔로우 요청 관리.
- 근거: `social.user_follows.status=PENDING`.

#### PUT `/me/follow-requests/{userId}/accept`

- 설명: 내 비공개 프로필에 들어온 follow 요청을 승인한다.
- 인증/권한: 로그인 사용자.
- Path parameters: `userId` (요청자 user id).
- Query parameters: 없음.
- Request body schema: 없음.
- Response body schema: `Follow`.
- 성공 응답 예시: `200 {"followerUserId":"...","followingUserId":"...","status":"ACTIVE"}`
- 실패 응답 예시: `404 ProblemDetails(code=FOLLOW_REQUEST_NOT_FOUND)`.
- 관련 화면: 프로필/팔로우 요청 관리.
- 근거: `social.user_follows.status`.

#### DELETE `/me/follow-requests/{userId}`

- 설명: 내 비공개 프로필에 들어온 follow 요청을 거절한다.
- 인증/권한: 로그인 사용자.
- Path parameters: `userId` (요청자 user id).
- Query parameters: 없음.
- Request body schema: 없음.
- Response body schema: 없음, `204 No Content`.
- 성공 응답 예시: `204`.
- 실패 응답 예시: `404 ProblemDetails(code=FOLLOW_REQUEST_NOT_FOUND)`.
- 관련 화면: 프로필/팔로우 요청 관리.
- 근거: `social.user_follows.status`.

#### DELETE `/users/{userId}/follow`

- 설명: 대상 사용자 팔로우를 취소한다.
- 인증/권한: 로그인 사용자.
- Path parameters: `userId`.
- Query parameters: 없음.
- Request body schema: 없음.
- Response body schema: 없음, `204 No Content`.
- 성공 응답 예시: `204`.
- 실패 응답 예시: `404 ProblemDetails(code=FOLLOW_NOT_FOUND)`.
- 관련 화면: 커뮤니티/프로필.
- 근거: `social.user_follows`.
- 확인 필요: 삭제를 hard delete 대신 soft delete로 유지할지.

#### GET `/legal-regions`

- 설명: 법정동 지역 검색/트리 조회.
- 인증/권한: 공개 또는 로그인 사용자. 공개 여부 확인 필요.
- Path parameters: 없음.
- Query parameters: `q`, `level`, `parentCode`, `isActive`, `page`, `size`.
- Request body schema: 없음.
- Response body schema: `PagedLegalRegion`.
- 성공 응답 예시: `200 {"items":[{"code":"1100000000","fullName":"서울특별시","level":"SIDO"}]}`
- 실패 응답 예시: `400 ProblemDetails(code=INVALID_REGION_LEVEL)`.
- 관련 화면: 여행방 생성/지역 선택.
- 근거: `.agent/docs/product-specs/service_requirements.md`, `geo.legal_regions`.
- 확인 필요: 행정구역 sync/admin endpoint 공개 범위.

### Trips / Members / Invites

#### GET `/trips`

- 설명: 내 여행방 목록 조회.
- 인증/권한: 로그인 사용자.
- Path parameters: 없음.
- Query parameters: `status`, `role`, `page`, `size`, `sort`.
- Request body schema: 없음.
- Response body schema: `PagedTripSummary`.
- 성공 응답 예시: `200 {"items":[{"id":"...","title":"부산 주말","myRole":"OWNER"}]}`
- 실패 응답 예시: `401 ProblemDetails(code=UNAUTHORIZED)`.
- 관련 화면: `/my-trips`, `/home`.
- 근거: `.agent/docs/product-specs/functional_spec.md`, `trip.trips`, `trip.trip_members`.
- 확인 필요: archived trip 노출 기본값.

#### POST `/trips`

- 설명: 새 여행방 생성. 생성자는 `trip.ownerUserId`가 되며, 협업 멤버십 row는 `role=MEMBER`로 등록된다.
- 인증/권한: 로그인 사용자.
- Path parameters: 없음.
- Query parameters: 없음.
- Request body schema: `CreateTripRequest`.
- Response body schema: `TripDetail`.
- 성공 응답 예시: `201 {"id":"...","title":"부산 주말","itineraryVersion":0,"myRole":"OWNER"}`
- 실패 응답 예시: `422 ProblemDetails(code=INVALID_REGION_CODE)`.
- 관련 화면: `/my-trips`, `/home`.
- 근거: `trip.trips`, `trip.trip_regions`, `trip.trip_members`.
- 확인 필요: 기본 `UNSCHEDULED` day 자동 생성 여부.

#### GET `/trips/{tripId}`

- 설명: 여행방 상세, 지역, 멤버 요약 조회.
- 인증/권한: active trip member.
- Path parameters: `tripId`.
- Query parameters: 없음.
- Request body schema: 없음.
- Response body schema: `TripDetail`.
- 성공 응답 예시: `200 {"id":"...","title":"부산 주말","members":[{"role":"MEMBER","accessRole":"OWNER"}]}`
- 실패 응답 예시: `403 ProblemDetails(code=TRIP_MEMBER_REQUIRED)`.
- 관련 화면: `/trips/:tripId/route`, `/trips/:tripId/swipe`.
- 근거: `trip.trips`, `trip.trip_members`.
- 확인 필요: 초대 링크 진입 전 preview 응답 필요 여부.

#### PATCH `/trips/{tripId}`

- 설명: 여행방 제목, 대표 목적지, 지역, 상태 수정.
- 인증/권한: `ownerUserId` 사용자. 단, 제목 수정 MEMBER 허용 여부는 확인 필요.
- Path parameters: `tripId`.
- Query parameters: 없음.
- Request body schema: `UpdateTripRequest`.
- Response body schema: `TripDetail`.
- 성공 응답 예시: `200 {"id":"...","title":"부산 미식 여행"}`
- 실패 응답 예시: `403 ProblemDetails(code=TRIP_OWNER_REQUIRED)`.
- 관련 화면: 여행방 설정.
- 근거: `.agent/contracts/backend_contract_decisions.md`, `trip.trips`.
- 확인 필요: MEMBER가 어떤 설정을 수정할 수 있는지.

#### DELETE `/trips/{tripId}`

- 설명: 여행방 soft delete.
- 인증/권한: `ownerUserId` 사용자.
- Path parameters: `tripId`.
- Query parameters: 없음.
- Request body schema: 없음.
- Response body schema: 없음, `204 No Content`.
- 성공 응답 예시: `204`.
- 실패 응답 예시: `403 ProblemDetails(code=TRIP_OWNER_REQUIRED)`.
- 관련 화면: 여행방 설정.
- 근거: `trip.trips.status`, `deleted_at`.
- 확인 필요: 게시된 community post snapshot은 유지.

#### GET `/trips/{tripId}/members`

- 설명: 여행방 멤버 목록 조회.
- 인증/권한: active trip member.
- Path parameters: `tripId`.
- Query parameters: `status`.
- Request body schema: 없음.
- Response body schema: `TripMember[]`.
- 성공 응답 예시: `200 [{"user":{"id":"...","displayName":"민지"},"role":"MEMBER","accessRole":"OWNER"}]`
- 실패 응답 예시: `403 ProblemDetails(code=TRIP_MEMBER_REQUIRED)`.
- 관련 화면: 여행방 설정, route 협업 화면.
- 근거: `trip.trip_members`.
- 확인 필요: LEFT/REMOVED 멤버 이력 노출 여부.

#### POST `/trips/{tripId}/invites`

- 설명: 초대 링크/코드 또는 직접 사용자 초대를 생성한다.
- 인증/권한: `ownerUserId` 사용자.
- Path parameters: `tripId`.
- Query parameters: 없음.
- Request body schema: `CreateTripInviteRequest`.
- Response body schema: `TripInvite`.
- 성공 응답 예시: `201 {"id":"...","inviteCode":"ABCD1234","status":"PENDING"}`
- 실패 응답 예시: `403 ProblemDetails(code=TRIP_OWNER_REQUIRED)`.
- 관련 화면: 여행방 초대.
- 근거: `.agent/contracts/backend_contract_decisions.md`, `trip.trip_invites`, `notification.notifications`.
- 확인 필요: 만료 기본값, 초대 코드 길이, 직접 초대 알림 문구.

#### POST `/trip-invites/{inviteCode}/accept`

- 설명: 초대 코드/링크로 여행방에 참여한다.
- 인증/권한: 로그인 사용자.
- Path parameters: `inviteCode`.
- Query parameters: 없음.
- Request body schema: `AcceptTripInviteRequest`.
- Response body schema: `TripDetail`.
- 성공 응답 예시: `200 {"id":"...","myRole":"MEMBER"}`
- 실패 응답 예시: `409 ProblemDetails(code=INVITE_ALREADY_ACCEPTED)`.
- 관련 화면: 초대 링크 landing, `/my-trips`.
- 근거: `trip.trip_invites`, `trip.trip_members`.
- 확인 필요: token hash 검증을 path code만으로 할지 query token을 함께 받을지.

#### DELETE `/trips/{tripId}/members/{userId}`

- 설명: 멤버 제거 또는 내 여행방 나가기.
- 인증/권한: `ownerUserId` 사용자가 MEMBER 제거. 본인 나가기는 MEMBER 허용 여부 확인 필요. MVP에서 소유자 이관은 제공하지 않는다.
- Path parameters: `tripId`, `userId`.
- Query parameters: 없음.
- Request body schema: 없음.
- Response body schema: 없음, `204 No Content`.
- 성공 응답 예시: `204`.
- 실패 응답 예시: `422 ProblemDetails(code=CANNOT_REMOVE_TRIP_OWNER)`.
- 관련 화면: 여행방 설정.
- 근거: `trip.trip_members.status`.
- 확인 필요: MEMBER 자진 탈퇴 허용 여부, 소유자 계정 삭제 시 여행방 삭제/보존 정책.

### Places / Swipe / Preference

#### GET `/places/search`

- 설명: 외부 장소 후보 검색. 관광공사 데이터랩 기반으로 설계하되 백엔드는 마스터 상세를 저장하지 않는다.
- 인증/권한: 로그인 사용자 권장. 공개 여부 확인 필요.
- Path parameters: 없음.
- Query parameters: `q`, `bbox`, `legalRegionCode`, `category`, `page`, `size`.
- Request body schema: 없음.
- Response body schema: `PagedPlaceSummary`.
- 성공 응답 예시: `200 {"items":[{"provider":"KTO","externalPlaceId":"126508","name":"성심당"}]}`
- 실패 응답 예시: `502 ProblemDetails(code=PLACE_PROVIDER_UNAVAILABLE)`.
- 관련 화면: route 추가 패널, AI search tool.
- 근거: `.agent/contracts/backend_contract_decisions.md`.
- 확인 필요: KTO API 구체 파라미터, 캐시 TTL, provider 장애 fallback.

#### GET `/places/{provider}/{externalPlaceId}`

- 설명: 외부 장소 상세 조회와 내부 enrichment 요약 조회.
- 인증/권한: 로그인 사용자 권장.
- Path parameters: `provider`, `externalPlaceId`.
- Query parameters: 없음.
- Request body schema: 없음.
- Response body schema: `PlaceDetail`.
- 성공 응답 예시: `200 {"provider":"KTO","externalPlaceId":"126508","name":"성심당","sourceStatus":"AVAILABLE"}`
- 실패 응답 예시: `404 ProblemDetails(code=PLACE_NOT_FOUND)`.
- 관련 화면: 장소 상세, 일정 추가.
- 근거: `preference.place_tag_enrichments`, 일정 item place ref.
- 확인 필요: 상세 조회를 선호도 추론에 반영하지 않는다는 정책 유지.

#### GET `/swipe/feed`

- 설명: 전역 개인 선호도 수집용 스와이프 후보 feed.
- 인증/권한: 로그인 사용자.
- Path parameters: 없음.
- Query parameters: `legalRegionCode`, `category`, `limit`, `excludeRecent`, `seed`.
- Request body schema: 없음.
- Response body schema: `SwipeFeedResponse`.
- 성공 응답 예시: `200 {"items":[{"place":{"provider":"KTO","externalPlaceId":"..."}, "likedByFollowees":[{"id":"..."}]}]}`
- 실패 응답 예시: `401 ProblemDetails(code=UNAUTHORIZED)`.
- 관련 화면: `/trips/:tripId/swipe` 보조 매핑. API는 여행방 종속이 아닌 전역 feed로 설계.
- 근거: `.agent/docs/product-specs/service_requirements.md`.
- 확정: 화면 route의 `tripId`를 API에 전달하지 않고, MVP 선호도는 사용자 개인 전역 기준으로만 저장/계산한다.

#### PUT `/places/{provider}/{externalPlaceId}/swipe-reaction`

- 설명: 현재 사용자의 최종 스와이프 반응을 upsert하고 이벤트 로그를 누적한다.
- 인증/권한: 로그인 사용자.
- Path parameters: `provider`, `externalPlaceId`.
- Query parameters: 없음.
- Request body schema: `SwipeReactionRequest`.
- Response body schema: `SwipeReactionResponse`.
- 성공 응답 예시: `200 {"reaction":"SUPER_LIKE","savedPlaceEligible":true}`
- 실패 응답 예시: `422 ProblemDetails(code=UNSUPPORTED_REACTION)`.
- 관련 화면: `/trips/:tripId/swipe`.
- 근거: `preference.user_place_reactions`, `preference.user_swipe_events`.
- 확인 필요: swipe event idempotency key 적용 여부.

#### GET `/me/saved-places`

- 설명: 내가 저장한 장소 목록 조회.
- 인증/권한: 로그인 사용자.
- Path parameters: 없음.
- Query parameters: `page`, `size`, `sort`.
- Request body schema: 없음.
- Response body schema: `PagedSavedPlace`.
- 성공 응답 예시: `200 {"items":[{"place":{"provider":"KTO","externalPlaceId":"..."}}]}`
- 실패 응답 예시: `401 ProblemDetails(code=UNAUTHORIZED)`.
- 관련 화면: `/mypage`, route 추가 패널.
- 근거: `preference.user_saved_places`.
- 확인 필요: 저장 장소 화면의 정렬/필터.

#### PUT `/places/{provider}/{externalPlaceId}/save`

- 설명: `SUPER_LIKE`한 장소를 저장한다.
- 인증/권한: 로그인 사용자.
- Path parameters: `provider`, `externalPlaceId`.
- Query parameters: 없음.
- Request body schema: 없음.
- Response body schema: `SavedPlace`.
- 성공 응답 예시: `200 {"id":"...","place":{"provider":"KTO","externalPlaceId":"..."}}`
- 실패 응답 예시: `422 ProblemDetails(code=SUPER_LIKE_REQUIRED)`.
- 관련 화면: 스와이프/장소 상세.
- 근거: `.agent/docs/product-specs/service_requirements.md`, `preference.user_saved_places`.
- 확인 필요: `SUPER_LIKE` 취소 시 저장 자동 해제 여부.

#### DELETE `/places/{provider}/{externalPlaceId}/save`

- 설명: 저장 장소를 해제한다.
- 인증/권한: 로그인 사용자.
- Path parameters: `provider`, `externalPlaceId`.
- Query parameters: 없음.
- Request body schema: 없음.
- Response body schema: 없음, `204 No Content`.
- 성공 응답 예시: `204`.
- 실패 응답 예시: `404 ProblemDetails(code=SAVED_PLACE_NOT_FOUND)`.
- 관련 화면: 저장 장소 목록.
- 근거: `preference.user_saved_places.deleted_at`.
- 확인 필요: soft delete 후 재저장 처리.

#### GET `/trips/{tripId}/place-recommendations`

- 설명: 경로 설계 좌측 추가 패널의 추천 장소 목록.
- 인증/권한: active trip member.
- Path parameters: `tripId`.
- Query parameters: `bbox` required, `centerLat`, `centerLng`, `tab=BASIC|SUPER_LIKE`, `page`, `size`.
- Request body schema: 없음.
- Response body schema: `PagedPlaceRecommendation`.
- 성공 응답 예시: `200 {"items":[{"place":{"name":"성심당"},"matchedMembers":[{"id":"...","displayName":"민지"}]}]}`
- 실패 응답 예시: `403 ProblemDetails(code=TRIP_MEMBER_REQUIRED)`.
- 관련 화면: `/trips/:tripId/route`.
- 근거: `.agent/docs/product-specs/service_requirements.md`.
- 확정: 추천 후보는 요청 `bbox` 안의 장소로 제한한다. 지도 이동만으로 자동 갱신하지 않고, 검색 실행 또는 수동 새로고침 버튼 클릭 시 현재 지도 `bbox`로 호출한다. raw/normalized score는 반환하지 않는다.

### Itinerary / Routes / Map Drawings / Collaboration

#### GET `/trips/{tripId}/itinerary`

- 설명: 일정 day, item, route segment, map drawing 요약 조회.
- 인증/권한: active trip member.
- Path parameters: `tripId`.
- Query parameters: 없음.
- Request body schema: 없음.
- Response body schema: `Itinerary`.
- 성공 응답 예시: `200 {"tripId":"...","itineraryVersion":12,"days":[{"groupType":"UNSCHEDULED"}]}`
- 실패 응답 예시: `403 ProblemDetails(code=TRIP_MEMBER_REQUIRED)`.
- 관련 화면: `/trips/:tripId/route`.
- 근거: `itinerary.*`, `.agent/contracts/backend_contract_decisions.md`.
- 확인 필요: 대형 일정에서 drawing/route lazy load 필요 여부.

#### POST `/trips/{tripId}/itinerary/days`

- 설명: 실제 day 또는 `UNSCHEDULED` 그룹 생성.
- 인증/권한: active trip member.
- Path parameters: `tripId`.
- Query parameters: 없음.
- Request body schema: `CreateItineraryDayRequest` with `baseVersion`.
- Response body schema: `ItineraryMutationResponse`.
- 성공 응답 예시: `201 {"itineraryVersion":13,"day":{"id":"...","groupType":"DAY","dayNumber":1}}`
- 실패 응답 예시: `409 ProblemDetails(code=ITINERARY_VERSION_CONFLICT)`.
- 관련 화면: route 일정 편집.
- 근거: `itinerary.itinerary_days`.
- 확인 필요: trip 생성 시 day 자동 생성 정책.

#### PATCH `/trips/{tripId}/itinerary/days/{dayId}`

- 설명: day 제목/date/sort order 수정.
- 인증/권한: active trip member.
- Path parameters: `tripId`, `dayId`.
- Query parameters: 없음.
- Request body schema: `UpdateItineraryDayRequest` with `baseVersion`.
- Response body schema: `ItineraryMutationResponse`.
- 성공 응답 예시: `200 {"itineraryVersion":14,"day":{"id":"...","title":"1일차"}}`
- 실패 응답 예시: `422 ProblemDetails(code=UNSCHEDULED_DATE_NOT_ALLOWED)`.
- 관련 화면: route 일정 편집.
- 근거: `itinerary.itinerary_days`.
- 확인 필요: day 삭제/재정렬 UX.

#### DELETE `/trips/{tripId}/itinerary/days/{dayId}`

- 설명: day 삭제. 포함 item 처리 정책 필요.
- 인증/권한: active trip member.
- Path parameters: `tripId`, `dayId`.
- Query parameters: 없음.
- Request body schema: `VersionedCommandRequest`.
- Response body schema: `ItineraryMutationResponse`.
- 성공 응답 예시: `200 {"itineraryVersion":15}`
- 실패 응답 예시: `422 ProblemDetails(code=DAY_HAS_ITEMS)`.
- 관련 화면: route 일정 편집.
- 근거: `itinerary.itinerary_days`.
- 확인 필요: day 삭제 시 item을 `UNSCHEDULED`로 이동할지 차단할지.

#### POST `/trips/{tripId}/itinerary/items`

- 설명: 외부 장소 또는 custom place를 일정 item으로 추가한다.
- 인증/권한: active trip member.
- Path parameters: `tripId`.
- Query parameters: 없음.
- Request body schema: `CreateItineraryItemRequest` with `baseVersion`.
- Response body schema: `ItineraryMutationResponse`.
- 성공 응답 예시: `201 {"itineraryVersion":16,"item":{"placeName":"성심당","sortOrder":0}}`
- 실패 응답 예시: `409 ProblemDetails(code=ITINERARY_VERSION_CONFLICT)`.
- 관련 화면: route 추천/검색 패널, AI tool write.
- 근거: `itinerary.itinerary_items`.
- 확인 필요: duplicate place 허용 여부.

#### PATCH `/trips/{tripId}/itinerary/items/{itemId}`

- 설명: item day 이동, 순서, 표시 정보 수정.
- 인증/권한: active trip member.
- Path parameters: `tripId`, `itemId`.
- Query parameters: 없음.
- Request body schema: `UpdateItineraryItemRequest` with `baseVersion`.
- Response body schema: `ItineraryMutationResponse`.
- 성공 응답 예시: `200 {"itineraryVersion":17,"item":{"id":"...","sortOrder":2}}`
- 실패 응답 예시: `409 ProblemDetails(code=ITINERARY_VERSION_CONFLICT)`.
- 관련 화면: route drag/drop.
- 근거: `itinerary.itinerary_items`, 협업 version 정책.
- 확정: active route segment로 연결된 item을 단독 이동하지 않는다. 연결을 끊고 이동해야 하면 먼저 `DELETE /trips/{tripId}/routes/{routeId}`로 route를 명시적으로 삭제한다.

#### DELETE `/trips/{tripId}/itinerary/items/{itemId}`

- 설명: 일정 item soft delete.
- 인증/권한: active trip member.
- Path parameters: `tripId`, `itemId`.
- Query parameters: 없음.
- Request body schema: `VersionedCommandRequest`.
- Response body schema: `ItineraryMutationResponse`.
- 성공 응답 예시: `200 {"itineraryVersion":18}`
- 실패 응답 예시: `404 ProblemDetails(code=ITINERARY_ITEM_NOT_FOUND)`.
- 관련 화면: route 일정 편집.
- 근거: `itinerary.itinerary_items.deleted_at`.
- 확인 필요: AI tool은 V1에서 삭제를 수행하지 않는 정책 유지.

#### PUT `/trips/{tripId}/itinerary/reorder`

- 설명: 여행방 active day/item 전체 순서 snapshot으로 day/item 순서를 일괄 재정렬한다.
- 인증/권한: active trip member.
- Path parameters: `tripId`.
- Query parameters: 없음.
- Request body schema: `ReorderItineraryRequest` with `baseVersion`.
- Response body schema: `ItineraryMutationResponse`.
- 성공 응답 예시: `200 {"itineraryVersion":19,"days":[...]}`
- 실패 응답 예시: `409 ProblemDetails(code=ITINERARY_VERSION_CONFLICT)`, `422 ProblemDetails(code=ROUTE_CONNECTION_LOCKED)`.
- 관련 화면: route drag/drop, AI 재배치.
- 근거: `.agent/docs/product-specs/service_requirements.md`.
- 확정: 부분 delta가 아니라 여행방 전체 active 일정 snapshot을 전송한다. 커스텀 route가 있는 연결 item들은 UI에서 묶음으로 함께 이동하며, route 연결을 깨는 snapshot은 서버가 거절한다.

#### POST `/trips/{tripId}/routes/map-match`

- 설명: 드로잉 stroke를 Mapbox Map Matching으로 보정해 route segment를 생성/갱신한다.
- 인증/권한: active trip member.
- Path parameters: `tripId`.
- Query parameters: 없음.
- Request body schema: `MapMatchRouteRequest` with `baseVersion`.
- Response body schema: `MapMatchRouteResponse`.
- 성공 응답 예시: `201 {"itineraryVersion":20,"route":{"mode":"WALKING","confidence":0.91}}`
- 실패 응답 예시: `422 ProblemDetails(code=ROUTE_MATCH_FAILED)`.
- 관련 화면: `/trips/:tripId/route`.
- 근거: Mapbox 결정 in `.agent/docs/product-specs/service_requirements.md`.
- 확인 필요: 2~100 좌표 제한을 프론트/백 어디서 단순화할지.

#### PATCH `/trips/{tripId}/routes/{routeId}`

- 설명: route segment mode/geometry 재보정 결과 저장.
- 인증/권한: active trip member.
- Path parameters: `tripId`, `routeId`.
- Query parameters: 없음.
- Request body schema: `UpdateRouteRequest` with `baseVersion`.
- Response body schema: `ItineraryMutationResponse`.
- 성공 응답 예시: `200 {"itineraryVersion":21,"route":{"id":"...","mode":"DRIVING"}}`
- 실패 응답 예시: `409 ProblemDetails(code=ITINERARY_VERSION_CONFLICT)`.
- 관련 화면: route segment 편집.
- 근거: `itinerary.trip_routes`.
- 확인 필요: route 직접 PATCH를 허용할지 map-match endpoint만 사용할지.

#### DELETE `/trips/{tripId}/routes/{routeId}`

- 설명: route segment soft delete.
- 인증/권한: active trip member.
- Path parameters: `tripId`, `routeId`.
- Query parameters: 없음.
- Request body schema: `VersionedCommandRequest`.
- Response body schema: `ItineraryMutationResponse`.
- 성공 응답 예시: `200 {"itineraryVersion":22}`
- 실패 응답 예시: `404 ProblemDetails(code=ROUTE_NOT_FOUND)`.
- 관련 화면: route segment 삭제.
- 근거: `itinerary.trip_routes.deleted_at`.
- 확정: item reorder는 route를 자동 삭제하지 않는다. 사용자가 연결을 끊고 item을 따로 이동하려면 이 endpoint로 route를 명시적으로 삭제한 뒤 reorder한다.

#### POST `/trips/{tripId}/map-drawings`

- 설명: 명시적으로 저장한 지도 도형/그림 생성.
- 인증/권한: active trip member.
- Path parameters: `tripId`.
- Query parameters: 없음.
- Request body schema: `CreateMapDrawingRequest` with `baseVersion`.
- Response body schema: `ItineraryMutationResponse`.
- 성공 응답 예시: `201 {"itineraryVersion":23,"drawing":{"drawingType":"POLYGON"}}`
- 실패 응답 예시: `422 ProblemDetails(code=INVALID_GEOJSON)`.
- 관련 화면: 지도 드로잉.
- 근거: `itinerary.map_drawings`.
- 확인 필요: style JSON whitelist.

#### PATCH `/trips/{tripId}/map-drawings/{drawingId}`

- 설명: 저장된 지도 도형 수정.
- 인증/권한: active trip member.
- Path parameters: `tripId`, `drawingId`.
- Query parameters: 없음.
- Request body schema: `UpdateMapDrawingRequest` with `baseVersion`.
- Response body schema: `ItineraryMutationResponse`.
- 성공 응답 예시: `200 {"itineraryVersion":24,"drawing":{"id":"...","version":2}}`
- 실패 응답 예시: `409 ProblemDetails(code=DRAWING_VERSION_CONFLICT)`.
- 관련 화면: 지도 드로잉.
- 근거: `itinerary.map_drawings.version`.
- 확인 필요: drawing 자체 version과 trip itineraryVersion 동시 사용 방식.

#### DELETE `/trips/{tripId}/map-drawings/{drawingId}`

- 설명: 저장된 지도 도형 soft delete.
- 인증/권한: active trip member.
- Path parameters: `tripId`, `drawingId`.
- Query parameters: 없음.
- Request body schema: `VersionedCommandRequest`.
- Response body schema: `ItineraryMutationResponse`.
- 성공 응답 예시: `200 {"itineraryVersion":25}`
- 실패 응답 예시: `404 ProblemDetails(code=MAP_DRAWING_NOT_FOUND)`.
- 관련 화면: 지도 드로잉.
- 근거: `itinerary.map_drawings.deleted_at`.
- 확인 필요: AI tool registry에서 drawing 삭제 제외 유지.

#### POST `/trips/{tripId}/collaboration/undo`

- 설명: 현재 WebSocket 세션에서 본인이 실행한 마지막 undo 가능 command를 되돌린다.
- 인증/권한: active trip member + session owner.
- Path parameters: `tripId`.
- Query parameters: 없음.
- Request body schema: `UndoRedoRequest` with `baseVersion`.
- Response body schema: `CollaborationActionResponse`.
- 성공 응답 예시: `200 {"itineraryVersion":26,"undoAvailable":true,"redoAvailable":true}`
- 실패 응답 예시: `409 ProblemDetails(code=UNDO_CONFLICT)`.
- 관련 화면: route/planning 공통 undo.
- 근거: `.agent/docs/product-specs/service_requirements.md`.
- 확인 필요: session id 헤더 필수화.

#### POST `/trips/{tripId}/collaboration/redo`

- 설명: 현재 WebSocket 세션에서 직전 undo command를 다시 적용한다.
- 인증/권한: active trip member + session owner.
- Path parameters: `tripId`.
- Query parameters: 없음.
- Request body schema: `UndoRedoRequest` with `baseVersion`.
- Response body schema: `CollaborationActionResponse`.
- 성공 응답 예시: `200 {"itineraryVersion":27,"undoAvailable":true,"redoAvailable":false}`
- 실패 응답 예시: `409 ProblemDetails(code=REDO_CONFLICT)`.
- 관련 화면: route/planning 공통 redo.
- 근거: `.agent/docs/product-specs/service_requirements.md`.
- 확인 필요: redo stack 초기화 이벤트 payload.

### Notes / Checklists

#### GET `/trips/{tripId}/notes`

- 설명: 여행방 전체 및 day scope 메모 조회.
- 인증/권한: active trip member.
- Path parameters: `tripId`.
- Query parameters: `scopeType`, `itineraryDayId`.
- Request body schema: 없음.
- Response body schema: `Note[]`.
- 성공 응답 예시: `200 [{"scopeType":"TRIP","content":"비 오면 실내 위주"}]`
- 실패 응답 예시: `403 ProblemDetails(code=TRIP_MEMBER_REQUIRED)`.
- 관련 화면: route/AI planning panel.
- 근거: `planning.trip_notes`.
- 확인 필요: soft deleted note 노출 여부.

#### PUT `/trips/{tripId}/notes`

- 설명: scope별 단일 메모 upsert.
- 인증/권한: active trip member.
- Path parameters: `tripId`.
- Query parameters: 없음.
- Request body schema: `UpsertNoteRequest` with `baseVersion`.
- Response body schema: `PlanningMutationResponse`.
- 성공 응답 예시: `200 {"itineraryVersion":28,"note":{"scopeType":"DAY","version":3}}`
- 실패 응답 예시: `409 ProblemDetails(code=ITINERARY_VERSION_CONFLICT)`.
- 관련 화면: route/AI note tool.
- 근거: MVP 메모 규칙 in `.agent/docs/product-specs/service_requirements.md`.
- 확인 필요: 메모 변경이 itineraryVersion에 포함되는지 별도 planningVersion을 둘지. 현재 문서는 협업 write로 version 증가를 요구한다.

#### DELETE `/trips/{tripId}/notes/{noteId}`

- 설명: 메모 soft delete.
- 인증/권한: active trip member.
- Path parameters: `tripId`, `noteId`.
- Query parameters: 없음.
- Request body schema: `VersionedCommandRequest`.
- Response body schema: `PlanningMutationResponse`.
- 성공 응답 예시: `200 {"itineraryVersion":29}`
- 실패 응답 예시: `404 ProblemDetails(code=NOTE_NOT_FOUND)`.
- 관련 화면: route/planning panel.
- 근거: `planning.trip_notes.deleted_at`.
- 확인 필요: AI tool에서는 삭제 제외.

#### GET `/trips/{tripId}/checklists`

- 설명: 여행방 전체 및 day scope 체크리스트 조회.
- 인증/권한: active trip member.
- Path parameters: `tripId`.
- Query parameters: `scopeType`, `itineraryDayId`.
- Request body schema: 없음.
- Response body schema: `Checklist[]`.
- 성공 응답 예시: `200 [{"scopeType":"TRIP","items":[{"content":"우산 챙기기","memberStatuses":[]}]}]`
- 실패 응답 예시: `403 ProblemDetails(code=TRIP_MEMBER_REQUIRED)`.
- 관련 화면: planning panel, AI checklist tool.
- 근거: `planning.checklists`, `planning.checklist_items`.
- 확인 필요: 신규 멤버 status materialization 시점.

#### PUT `/trips/{tripId}/checklists`

- 설명: scope별 단일 체크리스트 upsert.
- 인증/권한: active trip member.
- Path parameters: `tripId`.
- Query parameters: 없음.
- Request body schema: `UpsertChecklistRequest` with `baseVersion`.
- Response body schema: `PlanningMutationResponse`.
- 성공 응답 예시: `200 {"itineraryVersion":30,"checklist":{"scopeType":"TRIP"}}`
- 실패 응답 예시: `409 ProblemDetails(code=ITINERARY_VERSION_CONFLICT)`.
- 관련 화면: planning panel.
- 근거: `.agent/docs/product-specs/service_requirements.md`.
- 확인 필요: title 기본값.

#### POST `/trips/{tripId}/checklists/{checklistId}/items`

- 설명: 체크리스트 항목 생성.
- 인증/권한: active trip member.
- Path parameters: `tripId`, `checklistId`.
- Query parameters: 없음.
- Request body schema: `CreateChecklistItemRequest` with `baseVersion`.
- Response body schema: `PlanningMutationResponse`.
- 성공 응답 예시: `201 {"itineraryVersion":31,"item":{"content":"여권 챙기기"}}`
- 실패 응답 예시: `422 ProblemDetails(code=CHECKLIST_SCOPE_MISMATCH)`.
- 관련 화면: planning panel, AI checklist tool.
- 근거: `planning.checklist_items`.
- 확인 필요: 항목 최대 길이/개수 제한.

#### PATCH `/trips/{tripId}/checklists/{checklistId}/items/{itemId}`

- 설명: 체크리스트 항목 내용/순서 수정.
- 인증/권한: active trip member.
- Path parameters: `tripId`, `checklistId`, `itemId`.
- Query parameters: 없음.
- Request body schema: `UpdateChecklistItemRequest` with `baseVersion`.
- Response body schema: `PlanningMutationResponse`.
- 성공 응답 예시: `200 {"itineraryVersion":32,"item":{"id":"...","content":"우산 챙기기"}}`
- 실패 응답 예시: `409 ProblemDetails(code=ITINERARY_VERSION_CONFLICT)`.
- 관련 화면: planning panel.
- 근거: `planning.checklist_items`.
- 확인 필요: content blank 허용 여부.

#### DELETE `/trips/{tripId}/checklists/{checklistId}/items/{itemId}`

- 설명: 체크리스트 항목 soft delete.
- 인증/권한: active trip member.
- Path parameters: `tripId`, `checklistId`, `itemId`.
- Query parameters: 없음.
- Request body schema: `VersionedCommandRequest`.
- Response body schema: `PlanningMutationResponse`.
- 성공 응답 예시: `200 {"itineraryVersion":33}`
- 실패 응답 예시: `404 ProblemDetails(code=CHECKLIST_ITEM_NOT_FOUND)`.
- 관련 화면: planning panel.
- 근거: `planning.checklist_items.deleted_at`.
- 확인 필요: 삭제는 AI tool registry 제외 유지.

#### PUT `/trips/{tripId}/checklists/{checklistId}/items/reorder`

- 설명: 체크리스트 항목 순서 일괄 변경.
- 인증/권한: active trip member.
- Path parameters: `tripId`, `checklistId`.
- Query parameters: 없음.
- Request body schema: `ReorderChecklistItemsRequest` with `baseVersion`.
- Response body schema: `PlanningMutationResponse`.
- 성공 응답 예시: `200 {"itineraryVersion":34,"checklist":{"id":"..."}}`
- 실패 응답 예시: `409 ProblemDetails(code=ITINERARY_VERSION_CONFLICT)`.
- 관련 화면: planning panel.
- 근거: `planning.checklist_items.sort_order`.
- 확인 필요: drag/drop payload 확정.

#### PUT `/trips/{tripId}/checklists/{checklistId}/items/{itemId}/member-statuses/{userId}`

- 설명: 현재 사용자의 체크리스트 항목 완료 상태 변경.
- 인증/권한: active trip member. MVP에서는 본인 상태만 수정 가능하며 `userId`가 현재 사용자와 다르면 거절한다.
- Path parameters: `tripId`, `checklistId`, `itemId`, `userId`.
- Query parameters: 없음.
- Request body schema: `UpdateChecklistMemberStatusRequest` with `baseVersion`.
- Response body schema: `PlanningMutationResponse`.
- 성공 응답 예시: `200 {"itineraryVersion":35,"memberStatus":{"userId":"...","isCompleted":true}}`
- 실패 응답 예시: `403 ProblemDetails(code=CHECKLIST_STATUS_FORBIDDEN)`.
- 관련 화면: planning panel.
- 근거: `planning.checklist_item_member_statuses`.
- 확정: 타인 상태 대리 수정은 MVP에서 제외한다. `updated_by_user_id`에는 실제 변경 actor를 기록한다.

### Chat / AI

#### GET `/trips/{tripId}/chat/messages`

- 설명: 여행방 전체 텍스트 채팅 메시지 조회.
- 인증/권한: active trip member.
- Path parameters: `tripId`.
- Query parameters: `offset`, `limit`.
- Request body schema: 없음.
- Response body schema: `PagedTripChatMessage`.
- 성공 응답 예시: `200 {"items":[{"id":"...","content":"내일 10시에 만나요"}],"page":{"offset":0,"limit":20,"nextOffset":20,"hasMore":true,"sort":["createdAt,desc","id,desc"]}}`
- 실패 응답 예시: `403 ProblemDetails(code=TRIP_MEMBER_REQUIRED)`.
- 관련 화면: route 내 사용자 소통 UI.
- 근거: `.agent/docs/product-specs/service_requirements.md`, `chat.trip_chat_messages`.
- 확정: cursor 없이 offset 기반 무한스크롤을 사용한다. 정렬은 `createdAt DESC, id DESC`로 고정한다.

#### POST `/trips/{tripId}/chat/messages`

- 설명: 채팅 메시지를 저장하고 STOMP broadcast한다.
- 인증/권한: active trip member.
- Path parameters: `tripId`.
- Query parameters: 없음.
- Request body schema: `CreateTripChatMessageRequest`.
- Response body schema: `TripChatMessage`.
- 성공 응답 예시: `201 {"id":"...","content":"내일 10시에 만나요","sender":{"id":"..."}}`
- 실패 응답 예시: `422 ProblemDetails(code=CHAT_MESSAGE_EMPTY)`.
- 관련 화면: route 내 사용자 소통 UI.
- 근거: `chat.trip_chat_messages`.
- 확인 필요: 메시지 길이 제한.

#### DELETE `/trips/{tripId}/chat/messages/{messageId}`

- 설명: 본인이 보낸 채팅 메시지를 soft delete한다.
- 인증/권한: active trip member + sender.
- Path parameters: `tripId`, `messageId`.
- Query parameters: 없음.
- Request body schema: 없음.
- Response body schema: 없음, `204 No Content`.
- 성공 응답 예시: `204`.
- 실패 응답 예시: `403 ProblemDetails(code=CHAT_MESSAGE_OWNER_REQUIRED)`.
- 관련 화면: route 내 사용자 소통 UI.
- 근거: `chat.trip_chat_messages.deleted_at`.
- 확인 필요: tombstone text는 서버/클라이언트 중 어디서 결정할지.

#### GET `/trips/{tripId}/ai/session`

- 설명: trip당 공유 AI session 조회 또는 lazy 생성.
- 인증/권한: active trip member.
- Path parameters: `tripId`.
- Query parameters: 없음.
- Request body schema: 없음.
- Response body schema: `AiChatSession`.
- 성공 응답 예시: `200 {"id":"...","tripId":"...","status":"ACTIVE"}`
- 실패 응답 예시: `403 ProblemDetails(code=TRIP_MEMBER_REQUIRED)`.
- 관련 화면: AI 챗봇 패널.
- 근거: `ai.ai_chat_sessions`, `.agent/docs/product-specs/service_requirements.md`.
- 확인 필요: GET에서 생성할지 별도 POST를 둘지.

#### GET `/trips/{tripId}/ai/messages`

- 설명: 공유 AI 대화 메시지 조회.
- 인증/권한: active trip member.
- Path parameters: `tripId`.
- Query parameters: `offset`, `limit`.
- Request body schema: 없음.
- Response body schema: `PagedAiChatMessage`.
- 성공 응답 예시: `200 {"items":[{"role":"USER","content":"비 오는 날 갈 곳 찾아줘"}],"page":{"offset":0,"limit":20,"nextOffset":20,"hasMore":true,"sort":["createdAt,desc","id,desc"]}}`
- 실패 응답 예시: `403 ProblemDetails(code=TRIP_MEMBER_REQUIRED)`.
- 관련 화면: AI 챗봇 패널.
- 근거: `ai.ai_chat_messages`.
- 확인 필요: 오래된 대화 summary 노출 여부.

#### POST `/trips/{tripId}/ai/messages`

- 설명: AI 사용자 메시지를 저장하고, 필요한 read/search 또는 reversible write tool 실행 결과를 assistant message로 반환한다. message/tool 상태 변화는 `/topic/trips/{tripId}/ai`로 broadcast한다.
- 인증/권한: active trip member.
- Path parameters: `tripId`.
- Query parameters: 없음.
- Request body schema: `CreateAiMessageRequest` with optional `baseVersion`.
- Response body schema: `AiMessageResponse`.
- 성공 응답 예시: `201 {"message":{"role":"ASSISTANT","content":"성심당을 일차 미정에 추가했어요."},"toolCalls":[{"status":"SUCCEEDED"}]}`
- 실패 응답 예시: `409 ProblemDetails(code=ITINERARY_VERSION_CONFLICT)`.
- 관련 화면: AI 챗봇 패널.
- 근거: AI Tool Calling 요구사항.
- 확정: REST 요청으로 시작하고 WebSocket으로 message/tool 상태를 broadcast한다. 토큰 단위 streaming은 MVP에서 제공하지 않는다.

### Records / Media

#### GET `/records/photos`

- 설명: 현재 사용자가 참여 중인 모든 여행방의 기록 사진을 한 번에 모아 조회한다.
- 인증/권한: 로그인 사용자. active member인 여행방 기록 사진만 반환한다.
- Path parameters: 없음.
- Query parameters: `page`, `size`, `sort`.
- Request body schema: 없음.
- Response body schema: `PagedTripRecordPhoto`.
- 성공 응답 예시: `200 {"items":[{"tripId":"...","tripTitle":"부산 여행","recordId":"...","media":{"id":"...","mimeType":"image/jpeg"}}]}`
- 실패 응답 예시: `401 ProblemDetails(code=UNAUTHORIZED)`.
- 관련 화면: `/record` 전체 사진 모아보기.
- 근거: `record.trip_record_entries`, `record.trip_record_media`, `media.media_files`.
- 확정: 기록 생성/수정/삭제는 trip scoped API를 사용하고, 이 endpoint는 전체 참여 여행방 사진 조회 전용이다.
- 확정: 비공개 `TRIP_RECORD` media는 권한 확인 후 30분 만료 `servingUrl`을 반환하며 DB의 `publicUrl`은 null로 유지한다.

#### GET `/records/photos/{mediaFileId}/read-url`

- 설명: 화면에 표시 중인 여행 기록 사진 URL이 만료되거나 로드에 실패했을 때 해당 사진의 읽기 URL만 다시 조회한다.
- 인증/권한: 로그인 사용자. 사진이 활성 기록에 연결되어 있고, 사용자가 해당 여행의 소유자 또는 active member여야 한다.
- Path parameters: `mediaFileId`.
- Query parameters / Request body: 없음.
- Response body schema: `TripRecordPhotoReadUrl` (`mediaFileId`, `url`, `expiresAt`).
- 실패 응답 예시: 접근할 수 없거나 존재하지 않는 사진은 정보 노출을 막기 위해 `404 ProblemDetails(code=RESOURCE_NOT_FOUND)`로 동일하게 반환한다.
- 확정: client는 이미지 로드 실패 URL별로 한 번만 재발급을 요청하며, 새로 발급된 URL이 나중에 만료되면 다시 요청할 수 있다.

#### POST `/records/photo-summaries`

- 설명: 요청한 여러 여행방의 기록 사진 개수와 대표 사진을 한 번의 집계 요청으로 조회한다.
- 인증/권한: 로그인 사용자. 요청한 모든 여행방의 소유자 또는 active member여야 한다.
- Path parameters: 없음.
- Query parameters: 없음.
- Request body schema: `TripRecordPhotoSummaryRequest`. `tripIds`는 1개 이상 100개 이하이다.
- Response body schema: `TripRecordPhotoSummaryResponse`.
- 성공 응답 예시: `200 {"items":[{"tripId":"...","photoCount":12,"coverMediaFileId":"...","coverUrl":"https://storage.example.com/signed","coverUrlExpiresAt":"2026-06-22T04:30:00Z"},{"tripId":"...","photoCount":0,"coverMediaFileId":null,"coverUrl":null,"coverUrlExpiresAt":null}]}`
- 실패 응답 예시: `403 ProblemDetails(code=FORBIDDEN)`.
- 관련 화면: `/record` 여행 선택 카드의 사진 개수와 대표 사진.
- 근거: 여행별 사진 목록을 반복 호출하는 N+1 요청을 제거하고, 요청 여행을 한 SQL query로 집계한다.
- 확정: 접근할 수 없는 여행이 하나라도 포함되면 전체 요청을 거부한다. 100개를 초과하면 client가 여러 요청으로 나눈다.
- 확정: 대표 사진 `coverUrl`도 공개 URL이 없으면 30분 만료 signed read URL로 반환한다.
- 확정: 대표 사진의 ID, URL, 만료 시각은 동일한 사진 행에서 선택한다.

#### GET `/trips/{tripId}/records/photos`

- 설명: 선택한 여행방의 기록에 연결된 사진을 조회한다.
- 인증/권한: active trip member.
- Path parameters: `tripId`.
- Query parameters: `page`, `size`, `sort`.
- Request body schema: 없음.
- Response body schema: `PagedTripRecordPhoto`.
- 성공 응답 예시: `200 {"items":[{"tripId":"...","recordId":"...","media":{"id":"...","mimeType":"image/jpeg"}}]}`
- 실패 응답 예시: `403 ProblemDetails(code=TRIP_MEMBER_REQUIRED)`.
- 관련 화면: `/record` 여행별 사진 필터, 여행기 작성 사진 선택.
- 근거: `record.trip_record_entries`, `record.trip_record_media`, `media.media_files`.
- 확정: 전역 사진 모아보기와 여행별 사진 조회는 각각 전역 endpoint와 trip scoped endpoint를 사용한다.
- 확정: `TripRecordPhoto.media.servingUrl`은 30분 동안 유효하며, client는 `servingUrl`을 `publicUrl`보다 우선 사용한다.

#### GET `/trips/{tripId}/records`

- 설명: 여행방 사적 기록 목록 조회.
- 인증/권한: active trip member.
- Path parameters: `tripId`.
- Query parameters: `itineraryDayId`, `itineraryItemId`, `page`, `size`, `sort`.
- Request body schema: 없음.
- Response body schema: `PagedTripRecordEntry`.
- 성공 응답 예시: `200 {"items":[{"id":"...","title":"해운대 밤 산책"}]}`
- 실패 응답 예시: `403 ProblemDetails(code=TRIP_MEMBER_REQUIRED)`.
- 관련 화면: `/record`.
- 근거: `.agent/docs/product-specs/service_requirements.md`, `record.trip_record_entries`.
- 확정: `/record`는 여행방별 선택 조회를 제공한다. 전체 사진 모아보기는 `GET /records/photos`를 사용한다.

#### POST `/trips/{tripId}/records`

- 설명: 여행 기록 엔트리 생성.
- 인증/권한: active trip member.
- Path parameters: `tripId`.
- Request headers: 선택 `Idempotency-Key`(8~128자). 같은 사용자·여행·key와 같은 요청은 기존 기록을 반환하고, 다른 요청에 key를 재사용하면 `409 CONFLICT`를 반환한다.
- Query parameters: 없음.
- Request body schema: `CreateTripRecordRequest`.
- Response body schema: `TripRecordEntry`.
- 성공 응답 예시: `201 {"id":"...","media":[{"id":"..."}],"visibility":"TRIP_MEMBERS"}`
- 실패 응답 예시: `422 ProblemDetails(code=MEDIA_NOT_OWNED)`.
- 관련 화면: `/record`.
- 근거: `record.trip_record_entries`, `record.trip_record_media`.
- 확정: client는 생성 응답을 확인하지 못한 네트워크 오류 또는 5xx에서 같은 `Idempotency-Key`로 한 번 재시도한다.
- 확인 필요: 동영상 지원 mime/size 제한.

#### PATCH `/trips/{tripId}/records/{recordId}`

- 설명: 기록 제목/caption/연결 day/item 수정.
- 인증/권한: active trip member + uploader 또는 여행방 소유자 여부 확인 필요.
- Path parameters: `tripId`, `recordId`.
- Query parameters: 없음.
- Request body schema: `UpdateTripRecordRequest`.
- Response body schema: `TripRecordEntry`.
- 성공 응답 예시: `200 {"id":"...","caption":"비 오는 바다"}`
- 실패 응답 예시: `403 ProblemDetails(code=RECORD_OWNER_REQUIRED)`.
- 관련 화면: `/record`.
- 근거: `record.trip_record_entries`.
- 확인 필요: 멤버가 서로의 기록을 수정할 수 있는지.

#### DELETE `/trips/{tripId}/records/{recordId}`

- 설명: 여행 기록 soft delete.
- 인증/권한: uploader 또는 여행방 소유자 여부 확인 필요.
- Path parameters: `tripId`, `recordId`.
- Query parameters: 없음.
- Request body schema: 없음.
- Response body schema: 없음, `204 No Content`.
- 성공 응답 예시: `204`.
- 실패 응답 예시: `403 ProblemDetails(code=RECORD_OWNER_REQUIRED)`.
- 관련 화면: `/record`.
- 근거: `record.trip_record_entries.deleted_at`.
- 확인 필요: 연결 media retention.

#### POST `/media/upload-urls`

- 설명: S3 호환 object storage 직접 업로드용 signed URL 발급. purpose별 mime/size allowlist를 검증한 뒤 제한 시간 있는 URL과 object key를 반환한다. 백엔드 proxy upload는 MVP에서 제공하지 않는다.
- 인증/권한: 로그인 사용자.
- Path parameters: 없음.
- Query parameters: 없음.
- Request body schema: `CreateUploadUrlRequest`.
- Response body schema: `UploadUrlResponse`.
- 성공 응답 예시: `201 {"uploadUrl":"https://storage...","objectKey":"media/..." }`
- 실패 응답 예시: `422 ProblemDetails(code=UNSUPPORTED_MEDIA_TYPE)`, `422 ProblemDetails(code=MEDIA_SIZE_LIMIT_EXCEEDED)`.
- 관련 화면: 프로필, 기록, 커뮤니티 작성.
- 근거: `.agent/contracts/backend_contract_decisions.md`, `media.media_files`.
- 확정: signed URL 직접 업로드를 기본으로 한다. multipart upload와 이미지 처리 pipeline은 MVP 이후 또는 별도 운영 요구가 생길 때 확장한다.
- 확정: URL 발급 시 upload intent를 저장한다. 24시간 안에 `/media/files` 등록까지 완료되지 않은 object는 정리 작업이 물리 삭제한다.

#### POST `/media/files`

- 설명: 업로드 완료 후 media metadata를 확정 등록한다. 서버는 object 존재 여부, byte size, mime sniffing 결과, linked resource 권한을 검증한 뒤 `ACTIVE` metadata를 생성한다.
- 인증/권한: 로그인 사용자.
- Path parameters: 없음.
- Query parameters: 없음.
- Request body schema: `CreateMediaFileRequest`.
- Response body schema: `MediaFile`.
- 성공 응답 예시: `201 {"id":"...","mimeType":"image/jpeg","status":"ACTIVE"}`
- 실패 응답 예시: `422 ProblemDetails(code=OBJECT_NOT_FOUND)`, `422 ProblemDetails(code=MEDIA_METADATA_MISMATCH)`, `403 ProblemDetails(code=MEDIA_LINK_FORBIDDEN)`.
- 관련 화면: 프로필, 기록, 커뮤니티 작성.
- 근거: `media.media_files`.
- 확정: 백엔드 proxy upload는 MVP에서 병행하지 않는다.
- 확정: object key는 로그인 사용자의 만료되지 않은 upload intent와 일치해야 하며, 등록 완료 시 intent를 `COMPLETED`로 전환한다.

#### DELETE `/media/files/{mediaFileId}`

- 설명: media file soft delete 및 purge 예약. `DELETED` 상태로 전환하고 `purge_after_at` 이후 object storage에서 물리 삭제한다.
- 인증/권한: owner 또는 연결 리소스 권한자.
- Path parameters: `mediaFileId`.
- Query parameters: 없음.
- Request body schema: 없음.
- Response body schema: 없음, `204 No Content`.
- 성공 응답 예시: `204`.
- 실패 응답 예시: `403 ProblemDetails(code=MEDIA_OWNER_REQUIRED)`.
- 관련 화면: 프로필, 기록, 커뮤니티 작성.
- 근거: `media.media_files.status`, `purge_after_at`.
- 확정: 삭제 후 7일 보존 기간이 지나면 정기 정리 작업이 object를 삭제하고 metadata를 `PURGED`로 전환한다. 등록은 완료됐지만 어떤 리소스에도 24시간 동안 연결되지 않은 media도 같은 작업에서 정리한다.
- 확인 필요: 이미 게시글/기록에 연결된 media 삭제 제한.

### Community / Reports / Notifications / Admin

#### GET `/community/posts`

- 설명: 커뮤니티 게시글 목록/feed 조회.
- 인증/권한: 공개. 로그인 시 liked/retripped 여부 포함 가능.
- Path parameters: 없음.
- Query parameters: `visibility`, `hashtag`, `q`, `page`, `size`, `sort`. 공개 목록/feed/search는 `UNLISTED`를 제외한다.
- Request body schema: 없음.
- Response body schema: `PagedCommunityPostSummary`.
- 성공 응답 예시: `200 {"items":[{"id":"...","title":"부산 2박 3일","visibility":"PUBLIC"}]}`
- 실패 응답 예시: `400 ProblemDetails(code=INVALID_SORT)`.
- 관련 화면: `/community`, `/community/feed`, `/community/stories`.
- 근거: `.agent/docs/product-specs/functional_spec.md`, `community.posts`.
- 확인 필요: `/feed`와 `/stories`를 같은 API 필터로 처리할지.

#### POST `/community/posts`

- 설명: 프론트엔드에서 동적으로 미리보기한 내용을 기준으로 여행방 snapshot을 커뮤니티 게시글로 발행한다. 서버는 발행 시점에 권한, media 소유권, source trip version을 검증한다.
- 인증/권한: source trip active member.
- Path parameters: 없음.
- Query parameters: 없음.
- Request body schema: `CreateCommunityPostRequest` with `baseVersion`.
- Response body schema: `CommunityPostDetail`.
- 성공 응답 예시: `201 {"id":"...","sourceTripId":"...","visibility":"UNLISTED","snapshotVersion":1,"shareToken":"raw-token-once","shareUrl":"https://soomgil.example.com/community/posts/...?..."}`
- 실패 응답 예시: `403 ProblemDetails(code=TRIP_MEMBER_REQUIRED)`, `409 ProblemDetails(code=SOURCE_TRIP_VERSION_CONFLICT)`.
- 관련 화면: `/community/story-write`.
- 근거: 커뮤니티 snapshot 요구사항, `community.posts`.
- 확정: 별도 서버 preview endpoint는 두지 않는다. 발행 전 미리보기는 프론트엔드가 현재 itinerary/media/hashtag 상태로 동적으로 제공하고, 서버는 publish validation만 수행한다. snapshot은 발행 후 immutable이다.

#### GET `/community/posts/{postId}`

- 설명: 커뮤니티 게시글 상세와 immutable snapshot 조회.
- 인증/권한: `PUBLIC` 공개. `UNLISTED`는 작성자 또는 유효한 `shareToken`을 가진 사용자만 접근. 삭제/숨김은 권한자만.
- Path parameters: `postId`.
- Query parameters: `shareToken` (`UNLISTED` 비작성자 접근 시 필수).
- Request body schema: 없음.
- Response body schema: `CommunityPostDetail`.
- 성공 응답 예시: `200 {"id":"...","snapshot":{"days":[...]}}`
- 실패 응답 예시: `404 ProblemDetails(code=POST_NOT_FOUND)`, `403 ProblemDetails(code=INVALID_SHARE_TOKEN)`.
- 관련 화면: 커뮤니티 상세.
- 근거: `community.post_snapshot_*`.
- 확정: `UNLISTED`는 `postId`만으로 접근하지 않고 `shareToken`을 요구한다. raw token은 생성/재발급 응답에서만 반환하고 DB에는 hash만 저장한다.

#### PATCH `/community/posts/{postId}`

- 설명: 게시글 title/summary/visibility/media/hashtags 수정. 기존 snapshot은 재발행하지 않는다.
- 인증/권한: published_by user. 여행방 소유자/MEMBER 권한은 게시 후 무관.
- Path parameters: `postId`.
- Query parameters: 없음.
- Request body schema: `UpdateCommunityPostRequest`.
- Response body schema: `CommunityPostDetail`.
- 성공 응답 예시: `200 {"id":"...","title":"부산 맛집 루트"}`
- 실패 응답 예시: `403 ProblemDetails(code=POST_AUTHOR_REQUIRED)`.
- 관련 화면: 게시글 수정.
- 근거: `community.posts.updated_at`.
- 확정: snapshot 재발행/갱신은 MVP에서 제공하지 않는다.

#### POST `/community/posts/{postId}/share-token/rotate`

- 설명: `UNLISTED` 게시글 공유 토큰을 재발급한다. 새 raw token은 응답에서 한 번만 반환하고 DB에는 hash만 저장한다. 기존 공유 링크는 즉시 무효화된다.
- 인증/권한: published_by user.
- Path parameters: `postId`.
- Query parameters: 없음.
- Request body schema: 없음.
- Response body schema: `CommunityPostShareTokenResponse`.
- 성공 응답 예시: `200 {"postId":"...","shareToken":"raw-token-once","shareUrl":"https://soomgil.example.com/community/posts/...?...","rotatedAt":"2026-06-11T00:00:00Z"}`
- 실패 응답 예시: `403 ProblemDetails(code=POST_AUTHOR_REQUIRED)`.
- 관련 화면: 게시글 수정/공유 링크 관리.
- 근거: `community.posts.share_token_hash`, `share_token_rotated_at`.
- 확인 필요: 공유 링크 UI에서 복사 직후 token을 다시 볼 수 없다는 안내 문구.

#### DELETE `/community/posts/{postId}`

- 설명: 게시글 soft delete.
- 인증/권한: published_by user 또는 moderator/admin.
- Path parameters: `postId`.
- Query parameters: 없음.
- Request body schema: 없음.
- Response body schema: 없음, `204 No Content`.
- 성공 응답 예시: `204`.
- 실패 응답 예시: `403 ProblemDetails(code=POST_AUTHOR_REQUIRED)`.
- 관련 화면: 커뮤니티 상세/마이페이지.
- 근거: `community.posts.deleted_at`.
- 확인 필요: 삭제된 게시글의 리트립 이력 유지 정책.

#### PUT `/community/posts/{postId}/like`

- 설명: 게시글 좋아요를 idempotent하게 생성한다.
- 인증/권한: 로그인 사용자.
- Path parameters: `postId`.
- Query parameters: 없음.
- Request body schema: 없음.
- Response body schema: `CommunityPostReactionSummary`.
- 성공 응답 예시: `200 {"postId":"...","liked":true,"likeCount":12}`
- 실패 응답 예시: `404 ProblemDetails(code=POST_NOT_FOUND)`.
- 관련 화면: 커뮤니티 feed/detail.
- 근거: `community.post_likes`, 좋아요 1회 규칙.
- 확인 필요: "토글" UI를 PUT/DELETE로 분리할지 단일 toggle endpoint로 둘지.

#### DELETE `/community/posts/{postId}/like`

- 설명: 게시글 좋아요 취소.
- 인증/권한: 로그인 사용자.
- Path parameters: `postId`.
- Query parameters: 없음.
- Request body schema: 없음.
- Response body schema: `CommunityPostReactionSummary`.
- 성공 응답 예시: `200 {"postId":"...","liked":false,"likeCount":11}`
- 실패 응답 예시: `404 ProblemDetails(code=POST_NOT_FOUND)`.
- 관련 화면: 커뮤니티 feed/detail.
- 근거: `community.post_likes`.
- 확인 필요: 취소 idempotency 응답.

#### POST `/community/posts/{postId}/retrip`

- 설명: 게시글 snapshot 전체를 새 여행방으로 가져온다.
- 인증/권한: 로그인 사용자.
- Path parameters: `postId`.
- Query parameters: 없음.
- Request body schema: `RetripRequest`.
- Response body schema: `TripDetail`.
- 성공 응답 예시: `201 {"id":"...","retrippedFromPostId":"...","myRole":"OWNER"}`
- 실패 응답 예시: `422 ProblemDetails(code=POST_SNAPSHOT_UNAVAILABLE)`.
- 관련 화면: 커뮤니티 상세.
- 근거: 리트립 요구사항, `community.post_retrips`, `trip.trips.retripped_from_post_id`.
- 확인 필요: 같은 사용자의 같은 post 반복 리트립 허용 여부.

#### GET `/community/posts/{postId}/comments`

- 설명: 댓글/1단계 대댓글 조회.
- 인증/권한: 게시글 접근 가능 사용자.
- Path parameters: `postId`.
- Query parameters: `page`, `size`, `sort`.
- Request body schema: 없음.
- Response body schema: `PagedCommunityComment`.
- 성공 응답 예시: `200 {"items":[{"id":"...","depth":0,"content":"좋아요"}]}`
- 실패 응답 예시: `404 ProblemDetails(code=POST_NOT_FOUND)`.
- 관련 화면: 커뮤니티 상세.
- 근거: `community.post_comments`.
- 확인 필요: root 댓글별 reply preview 개수.

#### POST `/community/posts/{postId}/comments`

- 설명: 댓글 또는 1단계 대댓글 작성.
- 인증/권한: 로그인 사용자.
- Path parameters: `postId`.
- Query parameters: 없음.
- Request body schema: `CreateCommunityCommentRequest`.
- Response body schema: `CommunityComment`.
- 성공 응답 예시: `201 {"id":"...","depth":1,"content":"저도 가봤어요"}`
- 실패 응답 예시: `422 ProblemDetails(code=COMMENT_DEPTH_LIMIT_EXCEEDED)`.
- 관련 화면: 커뮤니티 상세.
- 근거: 댓글 1단계 대댓글 규칙.
- 확인 필요: 댓글 길이 제한.

#### DELETE `/community/comments/{commentId}`

- 설명: 댓글/대댓글 soft delete. 작성자와 게시글 발행자가 가능.
- 인증/권한: comment author 또는 post publisher.
- Path parameters: `commentId`.
- Query parameters: 없음.
- Request body schema: 없음.
- Response body schema: 없음, `204 No Content`.
- 성공 응답 예시: `204`.
- 실패 응답 예시: `403 ProblemDetails(code=COMMENT_DELETE_FORBIDDEN)`.
- 관련 화면: 커뮤니티 상세.
- 근거: `.agent/docs/product-specs/service_requirements.md`.
- 확인 필요: moderator delete와 user delete의 tombstone 구분.

#### GET `/community/report-reasons`

- 설명: 활성 신고 사유 목록 조회.
- 인증/권한: 공개 또는 로그인 사용자.
- Path parameters: 없음.
- Query parameters: 없음.
- Request body schema: 없음.
- Response body schema: `ReportReason[]`.
- 성공 응답 예시: `200 [{"code":"SPAM","displayName":"스팸"}]`
- 실패 응답 예시: 없음.
- 관련 화면: 신고 dialog.
- 근거: `community.report_reasons`.
- 확정: MVP에서는 active reason 조회만 제공하고 관리자 사유 CRUD는 제공하지 않는다.

#### POST `/community/reports`

- 설명: 게시글/댓글/대댓글 신고 생성.
- 인증/권한: 로그인 사용자.
- Path parameters: 없음.
- Query parameters: 없음.
- Request body schema: `CreateContentReportRequest`.
- Response body schema: `ContentReport`.
- 성공 응답 예시: `201 {"id":"...","targetType":"POST","status":"OPEN"}`
- 실패 응답 예시: `409 ProblemDetails(code=DUPLICATE_REPORT)`.
- 관련 화면: 커뮤니티 상세.
- 근거: 신고 요구사항, `community.content_reports`.
- 확정: 신고 사유는 `GET /community/report-reasons`에서 조회한 active code만 허용한다.

#### GET `/notifications`

- 설명: 내 인앱 알림 목록. MVP 알림 type은 직접 여행방 초대 `TRIP_INVITE`만 제공한다.
- 인증/권한: 로그인 사용자.
- Path parameters: 없음.
- Query parameters: `unreadOnly`, `page`, `size`.
- Request body schema: 없음.
- Response body schema: `PagedNotification`.
- 성공 응답 예시: `200 {"items":[{"type":"TRIP_INVITE","payload":{"tripId":"...","inviteId":"...","inviteCode":"ABC123"},"readAt":null}]}`
- 실패 응답 예시: `401 ProblemDetails(code=UNAUTHORIZED)`.
- 관련 화면: `/home`, `/mypage`.
- 근거: MVP 알림 요구사항, `notification.notifications`.
- 확정: 일정/AI/채팅/댓글/좋아요 알림은 MVP에서 생성하지 않는다. 초대 알림 payload는 `tripId`, `inviteId`, `inviteCode`를 포함한다.

#### PATCH `/notifications/{notificationId}/read`

- 설명: 알림 단건 읽음 처리.
- 인증/권한: 알림 수신자.
- Path parameters: `notificationId`.
- Query parameters: 없음.
- Request body schema: 없음.
- Response body schema: `Notification`.
- 성공 응답 예시: `200 {"id":"...","readAt":"2026-06-09T10:00:00Z"}`
- 실패 응답 예시: `404 ProblemDetails(code=NOTIFICATION_NOT_FOUND)`.
- 관련 화면: 알림 UI.
- 근거: `notification.notifications.read_at`.
- 확정: MVP에서는 읽음 되돌리기를 제공하지 않는다.

#### PATCH `/notifications/read-all`

- 설명: 내 모든 알림 읽음 처리.
- 인증/권한: 로그인 사용자.
- Path parameters: 없음.
- Query parameters: 없음.
- Request body schema: 없음.
- Response body schema: `BulkUpdateResult`.
- 성공 응답 예시: `200 {"updatedCount":3}`
- 실패 응답 예시: `401 ProblemDetails(code=UNAUTHORIZED)`.
- 관련 화면: 알림 UI.
- 근거: `notification.notifications`.
- 확정: MVP에서는 모든 직접 초대 알림 읽음 처리만 제공한다.

#### GET `/admin/reports`

- 설명: 신고 큐 조회.
- 인증/권한: `MODERATOR`, `ADMIN`, `SUPER_ADMIN`.
- Path parameters: 없음.
- Query parameters: `status`, `targetType`, `page`, `size`, `sort`.
- Request body schema: 없음.
- Response body schema: `PagedContentReport`.
- 성공 응답 예시: `200 {"items":[{"id":"...","status":"OPEN"}]}`
- 실패 응답 예시: `403 ProblemDetails(code=MODERATOR_REQUIRED)`.
- 관련 화면: 관리자 콘솔.
- 근거: 운영/관리자 요구사항.
- 확인 필요: 관리자 콘솔 범위.

#### POST `/admin/reports/{reportId}/resolve`

- 설명: 신고 처리 상태를 확정한다.
- 인증/권한: `MODERATOR`, `ADMIN`, `SUPER_ADMIN`.
- Path parameters: `reportId`.
- Query parameters: 없음.
- Request body schema: `ResolveReportRequest`.
- Response body schema: `ContentReport`.
- 성공 응답 예시: `200 {"id":"...","status":"RESOLVED","resolvedAt":"..."}`
- 실패 응답 예시: `409 ProblemDetails(code=REPORT_ALREADY_RESOLVED)`.
- 관련 화면: 관리자 콘솔.
- 근거: `community.content_reports`.
- 확인 필요: 처리와 moderation action을 하나의 transaction으로 묶을지.

#### GET `/admin/moderation-actions`

- 설명: 콘텐츠 moderation action 이력 조회.
- 인증/권한: `MODERATOR`, `ADMIN`, `SUPER_ADMIN`.
- Path parameters: 없음.
- Query parameters: `targetType`, `targetId`, `page`, `size`, `sort`.
- Request body schema: 없음.
- Response body schema: `PagedModerationAction`.
- 성공 응답 예시: `200 {"items":[{"targetType":"POST","action":"HIDE"}]}`
- 실패 응답 예시: `403 ProblemDetails(code=MODERATOR_REQUIRED)`.
- 관련 화면: 관리자 콘솔.
- 근거: `community.moderation_actions`.
- 확정: 범용 `ops.audit_logs` 조회 API는 MVP에서 제공하지 않는다.

#### POST `/admin/moderation-actions`

- 설명: 게시글/댓글 숨김, 복구, 삭제 moderation action 실행.
- 인증/권한: `MODERATOR`, `ADMIN`, `SUPER_ADMIN`.
- Path parameters: 없음.
- Query parameters: 없음.
- Request body schema: `CreateModerationActionRequest`.
- Response body schema: `ModerationAction`.
- 성공 응답 예시: `201 {"id":"...","targetType":"POST","action":"HIDE"}`
- 실패 응답 예시: `403 ProblemDetails(code=MODERATOR_REQUIRED)`.
- 관련 화면: 관리자 콘솔.
- 근거: `community.moderation_actions`, `ops.audit_logs`.
- 확정: 자동 숨김은 적용하지 않는다. moderation action은 운영자가 명시적으로 실행한 콘텐츠 처리 이력으로 남긴다.

## 4. 데이터 모델

### 주요 entity schema

| Entity | 주요 필드 | 생성/수정/삭제 정책 |
| :--- | :--- | :--- |
| User | `id`, `status`, `statusReason`, `deletionRequestedAt`, `deletionScheduledAt` | 계정 생명주기 anchor. 삭제 예약 시 `PENDING_DELETION`을 거쳐 soft delete |
| UserEmailAddress | `userId`, `email`, `normalizedEmail`, `isPrimary`, `verifiedAt` | 로그인 식별자와 이메일 인증 상태. raw verification token은 저장하지 않음 |
| UserProfile | `userId`, `displayName`, `profileImageUrl`, `profileMediaFileId`, `bio` | `PATCH /me`로 수정하는 표시 프로필 |
| UserSettings | `userId`, `displayLanguage`, `timezone`, `marketingEmailOptIn`, `tripInviteEmailOptIn` | `GET/PATCH /me/settings`로 관리 |
| UserPasswordCredential | `userId`, `passwordHash`, `passwordAlgorithm`, `failedLoginCount`, `lockedUntil` | raw password 미저장, 로그인 실패 잠금 정책 반영 |
| UserAuthIdentity | `userId`, `provider`, `providerSubject`, `providerEmailVerified`, `linkedAt` | Kakao/Google 등 외부 소셜 로그인 identity. OAuth token은 저장하지 않음 |
| UserSession | `userId`, `refreshTokenHash`, `refreshTokenFamilyId`, `refreshTokenVersion`, `revokedAt` | refresh token rotation과 session revoke 기준 |
| PolicyDocument/UserPolicyAcceptance | `policyCode`, `version`, `isRequired`, `acceptedAt` | 가입/설정의 필수/선택 약관 동의 이력 |
| UserSecurityEvent | `userId`, `eventType`, `success`, `failureReason`, `createdAt` | 로그인/비밀번호/세션 보안 이벤트 감사 |
| Follow | `followerUserId`, `followingUserId`, `status` | self-follow 금지, directed edge |
| MediaFile | `id`, `ownerUserId`, `objectKey`, `mimeType`, `status` | signed URL 후 metadata 등록, soft delete 후 purge |
| LegalRegion | `code`, `fullName`, `level`, `parentCode`, `isActive` | 원천 sync 관리, trip은 code 참조 |
| Trip | `id`, `ownerUserId`, `title`, `displayDestination`, `status`, `itineraryVersion` | 생성자가 `ownerUserId`, 설정/삭제는 소유자만 가능 |
| TripMember | `tripId`, `userId`, `role`, `status` | MVP role은 `MEMBER`만 저장. active member만 협업 가능 |
| TripInvite | `tripId`, `inviteCode`, `inviteTokenHash`, `status`, `expiresAt` | 소유자 생성, direct invite는 알림 생성 |
| PlaceRef | `provider`, `externalPlaceId`, `sourceStatus` | 장소 master는 저장하지 않고 외부 ref 사용 |
| SwipeReaction | `userId`, `provider`, `externalPlaceId`, `reaction` | 최종 상태 upsert, event log 누적 |
| PreferenceTagWeight | `userId`, `tagId`, `rawScore`, `normalizedScore` | swipe event 발생 시 projection 갱신 |
| SavedPlace | `userId`, `provider`, `externalPlaceId` | SUPER_LIKE한 장소만 저장 가능 |
| ItineraryDay | `tripId`, `groupType`, `dayNumber`, `date`, `sortOrder` | `UNSCHEDULED`는 trip당 1개 |
| ItineraryItem | `tripId`, `itineraryDayId`, `sortOrder`, `itemType`, `placeName`, `provider`, `externalPlaceId` | soft delete, route stale 처리 필요 |
| RouteSegment | `originItineraryItemId`, `destinationItineraryItemId`, `mode`, `geometry`, `confidence` | Mapbox 성공 결과만 저장 |
| MapDrawing | `tripId`, `itineraryDayId`, `drawingType`, `geometry`, `style`, `version` | 저장된 도형만 영구 저장 |
| Note | `tripId`, `scopeType`, `itineraryDayId`, `content`, `version` | scope별 단일 문서, soft delete |
| Checklist | `tripId`, `scopeType`, `itineraryDayId`, `title`, `version` | scope별 단일 리스트 |
| ChecklistItem | `checklistId`, `sortOrder`, `content` | soft delete |
| ChecklistMemberStatus | `checklistItemId`, `userId`, `isCompleted`, `completedAt` | 멤버별 완료 상태 |
| TripChatMessage | `tripId`, `senderUserId`, `content`, `deletedAt` | 수정 없음, sender만 삭제 |
| AiChatSession | `tripId`, `status`, `summary` | trip당 active/shared session 하나 |
| AiToolCall | `toolName`, `executionPolicy`, `arguments`, `status`, `versionBefore/After` | 감사 로그, undo/redo 소유권은 요청자 세션 |
| TripRecordEntry | `tripId`, `itineraryDayId`, `itineraryItemId`, `uploadedByUserId`, `visibility` | trip member만 생성, soft delete |
| CommunityPost | `sourceTripId`, `publishedByUserId`, `visibility`, `shareTokenHash`, `snapshot`, `counts`, `moderationStatus` | snapshot immutable 유지, `UNLISTED`는 share token hash 검증 |
| CommunityComment | `postId`, `parentCommentId`, `depth`, `content`, `moderationStatus` | 1단계 대댓글까지, tombstone soft delete |
| ContentReport | `reporterUserId`, `targetType`, `targetId`, `reason`, `status` | 동일 사용자/대상 중복 신고 금지 |
| Notification | `recipientUserId`, `type`, `payload`, `readAt` | MVP는 직접 trip invite 알림만 생성 |

### enum/status 정의

OpenAPI component enum과 DBML status text가 일치해야 한다. PostgreSQL enum은 쓰지 않고 code-managed row 또는 varchar status를 사용한다는 계약을 따른다.

중요 enum:

- `AuthProviderCode`: `LOCAL`, `KAKAO`, `GOOGLE`. `NAVER`, `APPLE`은 데이터 추가 확장 후보.
- `PlaceProvider`: `KTO`, future provider.
- `SwipeReaction`: `LIKE`, `NOPE`, `SUPER_LIKE`.
- `RecommendationTab`: `BASIC`, `SUPER_LIKE`.
- `RouteMode`: `DRIVING`, `WALKING`.
- `CommunityTargetType`: `POST`, `POST_COMMENT`.
- `ReportReasonCode`: `SPAM`, `INAPPROPRIATE`, `HARASSMENT_OR_HATE`, `RIGHTS_VIOLATION`, `OTHER`.

### 관계 설명

- User 1:N Trip(owner), TripMember, Follow, SwipeReaction, SavedPlace, RecordEntry, CommunityPost.
- Trip 1:N TripRegion, TripMember, TripInvite, ItineraryDay, ItineraryItem, RouteSegment, MapDrawing, Note, Checklist, ChatMessage, RecordEntry.
- ItineraryDay 1:N ItineraryItem. `UNSCHEDULED`도 day table의 특수 group으로 표현한다.
- RouteSegment는 day가 아니라 origin/destination ItineraryItem 사이의 segment다.
- CommunityPost는 source Trip을 참조하지만 표시 데이터는 게시 시점 snapshot을 별도로 저장한다.
- TripRecordEntry는 Trip에 속하고 선택적으로 day/item과 연결된다.
- ChecklistItem completion은 item 자체가 아니라 `ChecklistMemberStatus`로 멤버별 관리한다.

### 생성/수정/삭제 정책

- 사용자 콘텐츠는 기본 soft delete. 로그/이벤트는 retention 후 purge.
- 외부 노출 ID는 UUID, 내부 event/audit는 bigserial 허용.
- 협업 write는 `baseVersion`과 active WebSocket session context를 받는다.
- undo/redo는 DB rollback이 아니라 보상 command다.
- idempotency가 필요한 생성성/외부 호출성 endpoint는 `Idempotency-Key`를 권장 또는 필수로 둔다.
- 파일은 object storage에 직접 업로드하고 DB에는 metadata를 저장하는 흐름을 기본으로 한다.

## 5. OpenAPI 3.1 초안

OpenAPI YAML은 별도 파일 [.agent/contracts/openapi.yaml](../../contracts/openapi.yaml)에 저장했다. 미확정 사항은 schema/operation description에 `TODO` 또는 `확인 필요`로 남겼다.

```yaml
openapi: 3.1.0
info:
  title: Soomgil Backend API
  version: 0.1.0
  description: 숨길 V1 백엔드 REST API 협의 초안. 전체 원문은 .agent/contracts/openapi.yaml 참조.
servers:
  - url: https://api.soomgil.example.com/api/v1
  - url: http://localhost:8080/api/v1
```

## 6. 누락/질문 목록과 Best Practice 제안

이 섹션은 API 명세 확정 전에 PM/디자인/백엔드/프론트엔드가 결정해야 할 항목이다. 최신 `.agent/contracts/schema.dbml`에서 이미 구조로 확정한 내용은 “필드 필요 여부”가 아니라 “정책과 API 동작 확정” 질문으로 좁혔다.

각 문항은 아래 형식으로 정리한다.

- 문제 상세: 결정하지 않으면 생기는 API/DB/UX/운영 리스크를 설명한다.
- 4지 선다 선택지: PM/디자인/백엔드/프론트엔드가 선택할 수 있는 정책안을 A-D로 제시한다.
- Best practice: 현재 DBML과 MVP 범위를 기준으로 권장안을 명시한다.
- API/DBML 반영 지점: 선택 결과가 반영될 endpoint, schema, table을 명시한다.

DBML 최신 반영 요약:

- 인증은 `auth.user_email_addresses.verified_at`, token hash 테이블, `auth.user_sessions.refresh_token_family_id/version`, 약관 문서/수락 이력, 보안 이벤트까지 모델링되어 있다.
- 여행방 소유자는 `trip.trips.owner_user_id`로 판단한다. MVP `trip.trip_members.role`에는 `MEMBER`만 저장한다.
- 초대는 링크/코드 초대와 기존 사용자 직접 초대를 모두 지원하고, 직접 초대 알림은 `notification.notifications`로 모델링되어 있다.
- route는 day 소유가 아니라 `origin_itinerary_item_id`와 `destination_itinerary_item_id` 사이의 snapped segment로 확정되어 있다.
- 메모/체크리스트/지도 도형은 각 리소스 `version`을 갖고, 전체 협업 동기화 기준은 `trip.trips.itinerary_version` 및 `collab.collaboration_command_events`로 남아 있다.
- 장소 선호도는 `preference_tags`, 장소 tag enrichment, swipe event, current reaction, 사용자 tag weight projection으로 구체화되어 있다.
- 커뮤니티는 immutable `snapshot` JSON과 normalized snapshot table, post media, hashtag, report reason, moderation action을 모두 가진다. `UNLISTED` 접근은 raw `shareToken`과 DB의 `share_token_hash`로 검증한다.

### P0: API 확정 전 반드시 결정

#### P0-1. 인증/계정 생명주기: 이메일 인증, password policy, refresh token rotation, 약관

문제 상세: DBML은 이메일 인증 token, 비밀번호 reset token, refresh session family, 약관 수락, 보안 이벤트를 이미 갖고 있다. 정책이 느슨하면 탈취된 refresh token 재사용, 미인증 이메일 악용, 약관 미동의 계정 생성, reset token 재사용 같은 보안 문제가 생긴다. 반대로 가입 초기에 모든 인증을 강제하면 MVP 전환율과 소셜 가입 UX가 나빠질 수 있다.

| 선택 | 정책안 | 장점 | 리스크 |
| :--- | :--- | :--- | :--- |
| A | 이메일 인증 완료 전 계정 활성화 불가, refresh rotation 필수, 강한 password policy 필수 | 보안 기준이 가장 명확함 | 가입 이탈률 증가, 소셜 보완 flow 복잡 |
| B | 가입은 허용하되 민감 기능은 이메일 인증 후 허용, refresh rotation 필수, 필수 약관 미동의 차단 | 보안과 MVP UX 균형 | 기능별 인증 gate 정의 필요 |
| C | 이메일 인증은 선택, refresh token은 고정 장기 token, 약관은 사후 동의 | 구현이 빠름 | 계정 탈취/약관 감사/스팸 리스크 큼 |
| D | 소셜 로그인만 신뢰하고 이메일/비밀번호 보안 정책을 최소화 | 인증 flow 단순 | LOCAL 계정과 보안 이벤트 모델을 제대로 활용하지 못함 |

선택 결과: **A**. 이메일 인증 완료 전에는 계정 활성화를 완료하지 않는다.

Best practice: 선택된 **A**를 따른다. 이메일 인증 완료 전 계정 활성화를 막고, refresh token은 rotation과 family revoke를 적용한다. 필수 약관은 가입 완료 조건으로 두고, 강제 재동의는 별도 policy acceptance flow로 처리한다.

API/DBML 반영 지점: `auth.user_email_addresses`, `auth.user_email_verification_tokens`, `auth.user_password_credentials`, `auth.user_password_reset_tokens`, `auth.user_sessions`, `auth.policy_documents`, `auth.user_policy_acceptances`, `auth.user_security_events`, `POST /auth/register`, `POST /auth/refresh`, `POST /auth/logout`, `GET /me/sessions`, `GET /me/security-events`.

결정 후 반영: 인증/재설정 token TTL과 재발송 cooldown, access/refresh token TTL, 전체 기기 로그아웃, 계정 삭제 예약 중 로그인 허용 여부.

#### P0-2. OAuth/계정 연결: Kakao/Google callback, provider identity 충돌, 소셜 가입 보완

문제 상세: `auth.auth_providers`와 `auth.user_auth_identities`는 provider subject 중복 방지와 provider profile 저장을 전제로 한다. callback 책임이 프론트와 백엔드 사이에서 애매하면 provider secret 노출, state 검증 누락, 같은 이메일의 LOCAL/소셜 계정 중복 생성이 발생한다. 신규 소셜 가입에서 약관/프로필 보완이 빠지면 계정은 생성됐지만 서비스 이용 조건을 만족하지 않는 중간 상태가 늘어난다.

| 선택 | 정책안 | 장점 | 리스크 |
| :--- | :--- | :--- | :--- |
| A | 프론트가 authorization URL과 token exchange를 모두 처리 | 프론트 구현 자유도 높음 | client secret/state/provider 오류 처리가 취약 |
| B | 백엔드가 authorization URL 생성과 callback code exchange를 담당, 계정 연결은 명시적 flow 사용 | secret 보호, 감사/중복 방지 용이 | 보완 가입 화면과 state 저장 구현 필요 |
| C | provider email이 같으면 LOCAL 계정과 자동 병합 | 사용자 마찰 감소 | 이메일 소유 검증/계정 탈취 리스크 |
| D | 소셜 가입은 별도 계정으로만 만들고 계정 연결을 지원하지 않음 | 구현 단순 | 중복 계정과 고객지원 이슈 증가 |

선택 결과: **B**.

Best practice: 선택된 **B**를 따른다. provider별 redirect URL, client secret, token exchange는 백엔드가 관리하고, 프론트는 authorization URL 발급과 callback code 전달만 수행한다. 같은 이메일 계정 병합은 자동 처리하지 말고 로그인 후 명시적 link flow로 처리한다.

API/DBML 반영 지점: `auth.auth_providers`, `auth.user_auth_identities`, `auth.user_email_addresses`, `GET /auth/oauth/{provider}/authorization-url`, `POST /auth/oauth/{provider}/callback`, 향후 `POST /me/auth-identities/{provider}`.

결정 후 반영: provider email 미검증 시 처리, LOCAL 계정과 소셜 계정의 자동 연결 허용 여부, 소셜 신규 가입 보완 화면, OAuth state 저장 위치.

#### P0-3. 여행방 권한: `ownerUserId` source of truth, MEMBER-only membership, 직접 초대 알림

문제 상세: MVP에서는 `trip.trip_members.role`에 `MEMBER`만 저장하고, 여행방 소유자 권한은 `trip.trips.owner_user_id`에서 파생한다. 이 구분을 명확히 하지 않으면 API 응답의 `role` 값과 실제 권한 판단이 어긋난다. 직접 초대는 invite row와 notification row가 함께 생성되므로 transaction 경계가 불명확하면 알림은 왔지만 초대가 없거나, 초대는 있지만 알림이 없는 상태가 생긴다.

| 선택 | 정책안 | 장점 | 리스크 |
| :--- | :--- | :--- | :--- |
| A | `owner_user_id`만 소유자 source of truth로 사용하고 `trip_members.role`은 `MEMBER`만 저장 | MVP 모델과 가장 일치, 구현 단순 | 다중 OWNER/이관은 V1 이후 확장 필요 |
| B | `trip_members.role=OWNER`를 권한 기준으로 사용 | 다중 OWNER 확장 쉬움 | 사용자 결정 및 MVP 모델과 불일치 |
| C | owner table을 별도로 만들고 멤버십과 분리 | 권한 이력 확장 좋음 | MVP 과설계 |
| D | OWNER 개념 없이 모든 멤버에게 관리 권한 부여 | 협업은 단순 | 초대/삭제/설정 권한 통제 불가 |

선택 결과: **A**. 현재 MVP 수준에서는 `trip_members.role`에 `MEMBER`만 저장한다.

Best practice: 선택된 **A**를 따른다. 권한 판단은 `trip.trips.owner_user_id` 기준으로 하고, API가 OWNER를 표시해야 할 때는 `ownerUserId == user.id`에서 파생한 `accessRole`로 반환한다. 직접 초대 알림 생성은 invite row와 notification row를 단일 transaction으로 처리한다.

API/DBML 반영 지점: `trip.trips.owner_user_id`, `trip.trip_members`, `trip.trip_invites.invitee_user_id`, `notification.notifications`, `PATCH /trips/{tripId}`, `DELETE /trips/{tripId}`, `PATCH /trips/{tripId}/members/{userId}`, `POST /trips/{tripId}/invites`.

결정 후 반영: MEMBER가 수정 가능한 trip 설정, 기존 사용자 직접 초대와 링크 초대의 응답 차이, 초대 알림 문구와 payload 스키마.

#### P0-4. 협업 version: global itinerary version과 resource version의 역할 분리

문제 상세: DBML은 `trip.trips.itinerary_version`뿐 아니라 `planning.trip_notes.version`, `planning.checklists.version`, `itinerary.map_drawings.version`도 둔다. 어떤 version을 `baseVersion`으로 받을지 정하지 않으면 프론트는 충돌을 감지하지 못하거나 같은 변경을 두 번 적용할 수 있다. undo/redo는 command ordering에 의존하므로 version 기준이 흔들리면 WebSocket replay와 REST 응답이 어긋난다.

| 선택 | 정책안 | 장점 | 리스크 |
| :--- | :--- | :--- | :--- |
| A | 리소스별 version만 사용 | 충돌 범위가 좁음 | 여러 도메인 변경의 순서 보장이 어려움 |
| B | 모든 협업 write는 global `itineraryVersion`을 사용하고 resource version은 보조 stale check로 사용 | WebSocket 동기화와 undo/redo가 단순 | 넓은 범위 충돌이 늘 수 있음 |
| C | itinerary/planning/map version을 도메인별로 분리 | 충돌 범위와 동기화 비용 균형 | MVP 구현 복잡도 증가 |
| D | version 없이 last-write-wins 사용 | 구현이 가장 빠름 | 동시 편집 데이터 손실과 undo 불일치 |

선택 결과: **B**.

Best practice: 선택된 **B**를 따른다. 모든 협업 write는 global `itineraryVersion`을 `baseVersion`으로 받고, 리소스별 `version`은 단건 stale edit 감지와 응답 표시용으로 사용한다. 성공한 write는 `collab.collaboration_command_events`에 before/after version과 inverse payload를 남긴다.

API/DBML 반영 지점: `trip.trips.itinerary_version`, `planning.trip_notes.version`, `planning.checklists.version`, `itinerary.map_drawings.version`, `collab.collaboration_command_events`, 모든 itinerary/planning/map drawing 협업 write request/response.

결정 후 반영: request body에 resource version도 받을지, 충돌 시 최신 resource snapshot을 함께 반환할지, AI tool write도 동일한 `baseVersion`을 요구할지.

#### P0-5. WebSocket/session id: STOMP destination, 인증, command event 귀속

문제 상세: 일정 동시 편집, 지도 preview, route matching 결과, 채팅, AI tool write 결과는 REST 응답만으로 동기화하기 어렵다. WebSocket session id가 없으면 undo/redo stack을 어느 브라우저 탭에 귀속할지 결정할 수 없다. 인증과 destination naming이 불명확하면 trip member가 아닌 사용자가 topic을 구독하거나, 재접속 후 missed event를 복구하지 못하는 문제가 생긴다.

| 선택 | 정책안 | 장점 | 리스크 |
| :--- | :--- | :--- | :--- |
| A | REST polling만 사용 | 인프라 단순 | 협업/채팅/AI 상태 반영 지연 |
| B | STOMP over WebSocket, Bearer handshake, 서버 발급 `websocketSessionId`, REST write header 연동 | 권한/동기화/undo 귀속이 명확 | WebSocket 인프라와 재접속 처리 필요 |
| C | 클라이언트가 session id를 생성하고 서버는 신뢰 | 구현 쉬움 | 위조/중복/session hijack 리스크 |
| D | raw WebSocket 단일 channel 사용 | 프로토콜 가벼움 | topic 권한/구독 관리가 어려움 |

선택 결과: **B**.

Best practice: 선택된 **B**를 따른다. 서버가 handshake 성공 시 session id를 발급하고, 협업 REST write는 `X-Soomgil-WebSocket-Session-Id`를 전달한다. missed event 복구를 위해 최신 `itineraryVersion` 기준 resync endpoint도 필요하다.

API/DBML 반영 지점: `GET /ws`, `collab.collaboration_command_events.websocket_session_id`, `ai.ai_tool_calls.websocket_session_id`, `/topic/trips/{tripId}/itinerary`, `/topic/trips/{tripId}/map-drawings`, `/topic/trips/{tripId}/route-matching`, `/topic/trips/{tripId}/chat`, `/topic/trips/{tripId}/ai`.

결정 후 반영: preview stroke payload 크기 제한, 재접속 시 session id 재사용 여부, command event 보관 기간, 클라이언트가 event를 missed 했을 때 resync endpoint.

#### P0-6. 장소/선호도: KTO 참조, enrichment pipeline, tag weight projection

문제 상세: 장소 master data를 저장하지 않고 `provider + external_place_id`로 참조하므로 provider ID 안정성, cache TTL, 원본 삭제 처리 정책이 API 전반에 영향을 준다. 추천 품질은 `preference.place_tag_enrichments`, `place_tag_enrichment_tags`, `user_preference_tag_weights`에 의존하므로 enrichment 실패나 tag dictionary 변경이 곧 추천 품질 저하로 이어진다. raw score를 그대로 노출하면 모델 변경 때 UX가 흔들리고 설명 가능성도 떨어진다.

| 선택 | 정책안 | 장점 | 리스크 |
| :--- | :--- | :--- | :--- |
| A | KTO 응답을 API에서 그대로 passthrough하고 enrichment를 하지 않음 | 구현 빠름 | 추천 품질/일관성 낮음 |
| B | `{provider, externalPlaceId}` 참조, 짧은 cache, 비동기 enrichment, tag weight projection 사용 | DBML과 추천 도메인에 가장 부합 | enrichment job/재처리 운영 필요 |
| C | 외부 장소를 내부 master table로 전량 동기화 | 조회 안정성 높음 | 현재 DBML 원칙과 다르고 sync 비용 큼 |
| D | tag raw score와 모델 score를 프론트에 그대로 노출 | 디버깅 쉬움 | 사용자 경험과 모델 변경 안정성 낮음 |

선택 결과: **B**.

Best practice: 선택된 **B**를 따른다. 내부 API 장소 참조는 `{provider, externalPlaceId}`로 통일하고, KTO 응답은 cache하되 일정/커뮤니티 snapshot에는 표시 필드를 복사한다. 추천 이유는 raw score가 아니라 안정적인 tag display name 기반으로 제한한다.

API/DBML 반영 지점: `preference.preference_tags`, `preference.place_tag_enrichments`, `preference.place_tag_enrichment_tags`, `preference.user_place_reactions`, `preference.user_swipe_events`, `preference.user_preference_tag_weights`, `GET /places/search`, `GET /places/{provider}/{externalPlaceId}`, `GET /swipe/feed`, `GET /trips/{tripId}/place-recommendations`.

결정 후 반영: KTO content id 필드, source hash/modified 기준, enrichment 실패 장소의 추천 노출 여부, tag dictionary version 배포 방식, `SUPER_LIKE` 취소 시 저장 장소 자동 해제 여부.

#### P0-7. Mapbox/route: item-to-item segment, map matching request log, route 연결 보존

문제 상세: route는 day 소유 record가 아니라 두 itinerary item 사이의 snapped segment다. item 삭제/reorder가 route validity에 직접 영향을 주므로 route 연결을 보존할지, 명시적으로 삭제할지, 사용자가 재계산해야 하는지를 API가 알려줘야 한다. Mapbox 요청 좌표를 그대로 저장하거나 제한하지 않으면 비용, 지연, 실패율이 커지고 provider 장애 때 사용자에게 설명 가능한 에러를 주기 어렵다.

| 선택 | 정책안 | 장점 | 리스크 |
| :--- | :--- | :--- | :--- |
| A | route를 day-owned record로 저장 | 화면 구조와 직관적으로 맞음 | DBML의 item-to-item route와 충돌 |
| B | `originItineraryItemId`/`destinationItineraryItemId` 기반 route, request log, affected route/connection lock 응답 | 현재 DBML과 협업 reorder에 적합 | route 연결 보존 규칙 필요 |
| C | 프론트가 snapped geometry를 저장하고 서버는 metadata만 보관 | 서버 구현 감소 | geometry 신뢰성과 감사 추적 약함 |
| D | route를 저장하지 않고 화면 진입 때마다 provider 호출 | 데이터 stale 문제 없음 | 비용/속도/장애 영향 큼 |

선택 결과: **B**.

Best practice: 선택된 **B**를 따른다. map matching 요청은 downsampled coordinates만 서버에 저장하고, 성공 시 `trip_routes`를 생성/갱신한다. item 삭제로 깨진 route는 affected route 응답으로 프론트가 즉시 정리하게 한다. reorder로 active route 연결을 끊어야 할 때는 route를 자동 stale/delete 처리하지 않고 명시적 route 삭제를 먼저 요구한다.

API/DBML 반영 지점: `itinerary.trip_routes`, `itinerary.route_match_requests`, `POST /trips/{tripId}/routes/map-match`, `PATCH /trips/{tripId}/routes/{routeId}`, `DELETE /trips/{tripId}/routes/{routeId}`, `PUT /trips/{tripId}/itinerary/reorder`.

결정 후 반영: route 저장 confidence threshold, 좌표 수/거리 제한, 실패 request log 보관 기간, route 연결 묶음의 UI 표시 방식.

#### P0-8. 커뮤니티 발행: snapshot, media/hashtag, `UNLISTED` 접근 방식

문제 상세: 커뮤니티 게시글은 원본 trip을 직접 보여주는 것이 아니라 발행 시점의 snapshot을 공개한다. snapshot 생성 규칙이 없으면 원본 trip 수정 후 게시글 내용이 바뀌거나, 공개하면 안 되는 private record/media가 포함될 수 있다. `UNLISTED` 접근 보안 수준에 따라 DBML에 공유 토큰 hash를 둘지, 단순 UUID 접근으로 둘지가 달라진다.

| 선택 | 정책안 | 장점 | 리스크 |
| :--- | :--- | :--- | :--- |
| A | JSON snapshot만 저장하고 normalized snapshot table은 사용하지 않음 | 저장 단순 | 목록/검색/렌더링 최적화 어려움 |
| B | snapshot JSON + normalized snapshot table + post media/hashtag를 transaction으로 저장, `UNLISTED`는 MVP에서 UUID post id로 접근 | 현재 DBML을 그대로 활용 | 링크 revoke/secret 요구가 있으면 부족 |
| C | `UNLISTED` share token/slug를 DBML에 추가하고 token 기반 접근으로 확정 | 링크 보안과 revoke에 강함 | schema/API 추가 작업 필요 |
| D | snapshot 없이 source trip을 실시간 참조 | 저장 중복 적음 | 공개 게시글 불변성/삭제 정책 붕괴 |

선택 결과: **C**.

Best practice: 선택된 **C**를 따른다. `UNLISTED`는 고엔트로피 `shareToken`을 요구하고, raw token은 생성/재발급 응답에서만 한 번 반환한다. DB에는 `community.posts.share_token_hash`만 저장하고, 재발급 시 기존 token은 즉시 무효화한다.

API/DBML 반영 지점: `community.posts.share_token_hash`, `community.posts.snapshot`, `community.post_snapshot_days`, `community.post_snapshot_items`, `community.post_snapshot_routes`, `community.post_media`, `community.hashtags`, `community.post_hashtags`, `POST /community/posts`, `GET /community/posts/{postId}`, `POST /community/posts/{postId}/share-token/rotate`.

결정 후 반영: hashtag 정규화 규칙, publish 시 media 소유권/연결 검증, snapshot preview endpoint 포함 여부.

#### P0-9. 미디어: 목적별 제한, linked resource, 삭제/retention

문제 상세: 프로필 이미지, 기록 미디어, 커뮤니티 미디어가 모두 `media.media_files`를 사용하므로 업로드 제한과 삭제 정책이 느슨하면 저장 비용, 악성 파일, 깨진 링크, 개인정보 잔존 문제가 생긴다. `linked_resource_type/id`가 검증되지 않으면 사용자가 권한 없는 게시글이나 기록에 파일을 연결할 수 있다. public URL 정책이 불명확하면 private record media가 외부에 노출될 수 있다.

| 선택 | 정책안 | 장점 | 리스크 |
| :--- | :--- | :--- | :--- |
| A | 모든 파일을 백엔드 proxy upload로 처리 | 검증 중앙화 쉬움 | 서버 부하/대용량 처리 부담 |
| B | signed URL 직접 업로드 후 metadata 확정 시 object/mime/size/권한 검증, soft delete 후 purge | 확장성과 보안 균형 | upload completion 검증 구현 필요 |
| C | public bucket에 직접 업로드하고 client가 URL만 저장 | 구현 가장 빠름 | 보안/비용/권한 리스크 큼 |
| D | 도메인별 media table을 따로 둠 | 도메인별 정책 표현 쉬움 | 중복 schema와 purge 운영 복잡 |

선택 결과: **B**.

Best practice: 선택된 **B**를 따른다. signed URL 직접 업로드 후 `POST /media/files`에서 object existence, byte size, mime sniffing 결과, linked resource 권한을 검증한다. purpose별 mime allowlist, 용량, 이미지 dimension, 동영상 허용 여부를 분리하고, 삭제는 `DELETED` 상태와 `purge_after_at`을 거쳐 물리 purge한다.

API/DBML 반영 지점: `media.media_files`, `auth.user_profiles.profile_media_file_id`, `record.trip_record_media`, `community.post_media`, `POST /media/upload-urls`, `POST /media/files`, `DELETE /media/files/{mediaFileId}`.

결정 후 반영: 동영상 transcoding/thumbnail pipeline 포함 여부, public URL 정책, 이미 게시글/기록에 연결된 media 삭제 제한, purge job 주기.

#### P0-10. 개인정보/삭제: user deletion, soft delete, 공개 콘텐츠 잔존

문제 상세: `auth.users`는 삭제 예약/soft delete 필드를 갖고, 여러 도메인은 `deleted_at` 또는 moderation status를 갖는다. 계정 삭제가 곧 모든 콘텐츠 삭제인지, 공개 게시글은 익명화 후 유지되는지, 감사 로그는 보관되는지 정하지 않으면 사용자 요청 처리와 법적 보관 정책이 충돌한다. 소유자 계정이 삭제될 때 여행방 관리 주체가 사라지는 문제도 함께 해결해야 한다.

| 선택 | 정책안 | 장점 | 리스크 |
| :--- | :--- | :--- | :--- |
| A | 계정 삭제 요청 즉시 hard delete cascade | 사용자가 기대하는 삭제감이 큼 | 협업/감사/공개 콘텐츠 무결성 붕괴 |
| B | `PENDING_DELETION` 예약 후 익명화/삭제, 공개 snapshot은 정책에 따라 유지, 소유자인 여행방은 삭제 전 정리 요구 | 데이터 무결성과 개인정보 요구 균형 | retention/익명화 job 필요 |
| C | 계정은 `DELETED` 상태만 두고 데이터는 영구 보관 | 구현 단순 | 개인정보 삭제 요구 대응 취약 |
| D | 공개/비공개 콘텐츠를 모두 삭제하고 감사 로그도 제거 | 개인정보 최소화 | 운영 감사와 신고 처리 근거 상실 |

선택 결과: **B**.

Best practice: 선택된 **B**를 따른다. 계정 삭제는 예약 상태를 거쳐 처리하고, 소유자인 활성 여행방이 있으면 MVP에서는 이관이 없으므로 삭제 예약을 차단한다. 공개 커뮤니티 콘텐츠는 작성자 표시를 익명화하되 snapshot 유지 여부는 약관/개인정보 정책에 명시한다.

API/DBML 반영 지점: `auth.users.status/deletion_*`, `trip.trip_members.status`, 각 도메인의 `deleted_at`, `community.posts.moderation_status`, `ops.audit_logs`, `DELETE /me`, `DELETE /trips/{tripId}`, `DELETE /community/posts/{postId}`.

결정 후 반영: 계정 삭제 grace period, 공개 게시글/댓글 잔존 정책, 개인 기록과 업로드 media purge 범위, 감사 로그 보관 법적 기준.

### P1: 프론트 구현 전 조정 가능성이 큰 부분

#### P1-1. `/trips/:tripId/swipe`와 전역 `/swipe/feed` 관계

문제 상세: 화면 route에는 `tripId`가 있지만 요구사항과 DBML은 스와이프를 전역 개인 선호도(`user_place_reactions`, `user_swipe_events`)로 둔다. trip별 reaction으로 저장하면 같은 장소에 대한 사용자의 취향이 여행방마다 달라져 추천 projection이 불안정해진다. 반대로 trip context를 완전히 버리면 특정 여행방에서 진입한 스와이프 경험을 추천 설명이나 후보 다양성에 활용하기 어렵지만, MVP 범위에서는 개인 전역 취향을 먼저 안정화하는 것이 중요하다.

| 선택 | 정책안 | 장점 | 리스크 |
| :--- | :--- | :--- | :--- |
| A | reaction을 trip scoped로 저장 | 여행방별 취향 표현 가능 | DBML과 전역 선호도 요구사항 충돌 |
| B | reaction은 전역으로 저장하고 `contextTripId`/`feed_context`만 optional로 기록 | 선호도 일관성과 화면 context 모두 확보 | context가 추천에 미치는 영향 정의 필요 |
| C | 전역 `/swipe/feed`와 trip별 `/trips/{tripId}/swipe`를 별도 reaction으로 운영 | 화면별 최적화 쉬움 | 중복 데이터와 추천 혼란 증가 |
| D | context 없이 전역 feed만 제공 | 전역 개인 선호도 모델이 단순하고 일관됨 | trip 진입 UX와 추천 설명 약함 |

선택 결과: **D**. 여행 방마다 선호도를 관리하지 않고, 사용자 개인마다 전역 선호도를 관리한다. MVP에서는 `contextTripId`를 받지 않고, `feed_context`에도 여행방 context를 저장하지 않는다.

Best practice: context 활용 요구가 명확하면 **B**가 확장성 측면에서 유리하지만, 현재 제품 의도가 개인 전역 선호도라면 선택된 **D**를 따른다. `feed_context`는 향후 feed 실험/노출 메타데이터를 위한 예약 필드로만 남긴다.

API/DBML 반영 지점: `preference.user_place_reactions`, `preference.user_swipe_events.feed_context`, `GET /swipe/feed`, `PUT /places/{provider}/{externalPlaceId}/swipe-reaction`.

결정 후 반영: 선호도 projection은 사용자 기준으로만 갱신하며, 여행방 context는 후보 다양성, 추천 설명, feed exclusion에 영향을 주지 않는다.

#### P1-2. 추천 패널 호출: bbox/center/tab/pagination과 enrichment 상태

문제 상세: 지도 viewport가 바뀔 때마다 추천 API를 호출하면 UX는 즉각적이지만 API 부하와 외부 provider 비용이 커진다. 너무 보수적으로 호출하면 사용자는 현재 지도 영역의 추천이 최신인지 알기 어렵다. enrichment가 `PENDING` 또는 `STALE`인 장소까지 추천에 포함할지 정하지 않으면 추천 목록이 비거나 품질이 일정하지 않을 수 있다.

| 선택 | 정책안 | 장점 | 리스크 |
| :--- | :--- | :--- | :--- |
| A | 지도 이동 중에도 매번 자동 호출 | 반응성이 가장 좋음 | 과도한 API/provider 부하 |
| B | `bbox` 필수, 검색 실행 또는 수동 refresh 버튼 클릭 시 현재 지도 `bbox`로 호출, enrichment fallback 정책 적용 | UX와 비용 균형 | 사용자가 새로고침 필요성을 인지해야 함 |
| C | 추천은 사용자가 버튼을 눌러야만 호출 | 비용 제어 쉬움 | 추천 최신성 인지가 약함 |
| D | bbox 없이 전체 후보를 서버가 미리 계산 | 클라이언트 단순 | 지역 맥락과 지도 UX 약함 |

선택 결과: **B**. 검색했을 때 `bbox` 기준으로 추천 장소를 보여주고, 현재 지도에서 화면을 움직였을 때는 자동 업데이트하지 않는다. 지도 이동 후에는 사용자가 수동 새로고침 버튼을 눌렀을 때 현재 지도 `bbox`로 다시 조회한다.

Best practice: 선택된 **B**를 따른다. `bbox`는 필수, `center`는 거리 동점 처리용 optional로 두고, enrichment 실패/대기 상태는 fallback 점수 또는 보수적 노출 정책을 둔다.

API/DBML 반영 지점: `GET /trips/{tripId}/place-recommendations`, `preference.place_tag_enrichments.status`, `preference.user_preference_tag_weights`.

결정 후 반영: 첫 진입 기본 viewport, 검색/수동 새로고침 시 page reset 조건, enrichment 미완료 장소의 UI 표시 여부.

#### P1-3. 일정 drag/drop payload: 전체 snapshot vs delta와 route invalidation

문제 상세: drag/drop은 동시 편집 충돌이 자주 발생하고 route가 item-to-item segment이므로 item 순서 변경이 route 연결과 직접 충돌할 수 있다. payload가 너무 작으면 서버가 현재 상태와 조합해 의도를 해석해야 하고, payload가 너무 크면 충돌 범위가 커진다. 커스텀 route가 있는 item을 마음대로 분리하면 사용자가 그려둔 경로 의도가 사라질 수 있으므로, route 연결을 보존하거나 명시적으로 삭제하는 규칙이 필요하다.

| 선택 | 정책안 | 장점 | 리스크 |
| :--- | :--- | :--- | :--- |
| A | trip 전체 일정 snapshot을 전송 | 서버 적용/검증 단순, route 연결 묶음 검증 쉬움 | 충돌 범위와 payload 큼 |
| B | day별 item order snapshot을 전송하고 stale route를 응답 | MVP 구현과 검증 균형 | day 간 이동 규칙 명확화 필요 |
| C | item move delta만 전송 | payload 작음 | 동시 편집 merge 복잡 |
| D | 프론트에서만 순서를 관리하고 서버는 주기적으로 저장 | 체감 반응 빠름 | 협업 정합성 붕괴 |

선택 결과: **A**. 재정렬 요청은 여행방 전체 active 일정 snapshot을 통째로 전송한다. 커스텀 route가 있는 경우 연결된 여행지들은 UI상 하나의 묶음처럼 함께 이동한다. 특정 장소만 따로 이동해야 하면 사용자가 먼저 해당 커스텀 route를 명시적으로 삭제한 뒤 재정렬한다.

Best practice: 일반적으로는 **B**가 payload와 충돌 범위를 줄이는 데 유리하지만, 현재 UX가 route 연결 묶음을 강하게 보존하므로 선택된 **A**를 따른다. 서버는 전체 snapshot에 모든 active day/item이 정확히 한 번씩 포함됐는지, `baseVersion`이 맞는지, active route 연결을 깨지 않는지 검증한다.

API/DBML 반영 지점: `PUT /trips/{tripId}/itinerary/reorder`, `ReorderItineraryRequest`, `itinerary.itinerary_items`, `itinerary.trip_routes`, `collab.collaboration_command_events`.

결정 후 반영: `PUT /trips/{tripId}/itinerary/reorder`는 전체 snapshot 전용 endpoint로 유지한다. route 자동 삭제는 하지 않고, 사용자 명시 삭제 이벤트와 reorder 이벤트를 분리한다.

#### P1-4. 채팅/AI message pagination: page vs cursor

문제 상세: 채팅과 AI 메시지는 append-only 성격이 강하고 새 메시지가 계속 뒤에 추가된다. page 기반 목록은 사용자가 과거 메시지를 보는 동안 새 메시지가 들어오면 page boundary가 흔들릴 수 있다. cursor 기준을 명확히 하지 않으면 중복 메시지, 누락 메시지, 역방향 로딩 불일치가 생긴다.

| 선택 | 정책안 | 장점 | 리스크 |
| :--- | :--- | :--- | :--- |
| A | 일반 목록과 동일하게 page/size 사용 | 구현 일관 | 새 메시지 도착 시 목록 흔들림 |
| B | cursor pagination 사용, cursor는 opaque token 또는 `createdAt + id` 기준 | append-only 목록에 적합 | cursor 인코딩/정렬 규칙 필요 |
| C | 최근 N개만 반환하고 과거 조회 없음 | 구현 단순 | 대화 히스토리 UX 부족 |
| D | offset 기반 무한스크롤 사용 | 익숙한 구현 | 대량 데이터와 삽입 상황에서 중복/누락 가능 |

선택 결과: **D**. 채팅과 AI 메시지는 offset 기반 무한스크롤을 사용한다. 요청은 `offset`, `limit`으로 받고, 정렬은 `createdAt DESC, id DESC`로 고정한다.

Best practice: 일반적으로는 **B**가 append-only 목록에서 더 안정적이지만, 선택된 **D**를 따른다. offset 방식의 중복/누락 리스크를 줄이기 위해 클라이언트 임의 정렬은 허용하지 않고, 같은 timestamp의 순서를 안정화하기 위해 `id`를 tie-breaker로 사용한다.

API/DBML 반영 지점: `chat.trip_chat_messages.created_at`, `ai.ai_chat_messages.created_at`, `GET /trips/{tripId}/chat/messages`, `GET /trips/{tripId}/ai/messages`.

결정 후 반영: cursor는 MVP에서 사용하지 않는다. 채팅/AI 메시지 목록 response의 `page` metadata는 `offset`, `limit`, `nextOffset`, `hasMore`, 고정 `sort`를 반환한다.

#### P1-5. AI 응답 streaming/tool 상태: REST 단건 vs SSE/WebSocket

문제 상세: AI 응답은 지연 시간이 길 수 있고 tool calling은 일정/메모/체크리스트 write와 연결된다. 중간 상태가 없으면 사용자는 요청이 멈췄는지, 도구 실행 중인지, 변경이 적용됐는지 알 수 없다. 토큰 단위 streaming을 MVP에 넣으면 UX는 좋아지지만 backend/프론트 상태 관리와 취소/재시도 처리가 복잡해진다.

| 선택 | 정책안 | 장점 | 리스크 |
| :--- | :--- | :--- | :--- |
| A | REST 요청 완료 후 최종 응답만 반환 | 구현 단순 | 긴 응답 동안 상태 불명확 |
| B | REST로 메시지를 생성하고 WebSocket으로 message/tool 상태를 broadcast | MVP 복잡도와 실시간성 균형 | topic 상태 이벤트 설계 필요 |
| C | SSE/WebSocket token streaming을 MVP부터 제공 | 체감 UX 좋음 | 구현/테스트 범위 큼 |
| D | AI 요청은 background job으로 만들고 polling만 제공 | 장애 격리 쉬움 | 실시간 협업과 연결 약함 |

최종 판단: **B**. AI 응답은 지연될 수 있지만 토큰 단위 streaming을 MVP에 넣으면 상태/취소/재시도 테스트 범위가 커진다. 이미 STOMP topic을 쓰는 협업 구조가 있으므로, REST로 요청을 시작하고 message/tool 상태를 `/topic/trips/{tripId}/ai`로 broadcast하는 방식이 가장 균형적이다.

API/DBML 반영 지점: `ai.ai_chat_sessions`, `ai.ai_chat_messages`, `ai.ai_tool_calls`, `POST /trips/{tripId}/ai/messages`, AI WebSocket topic.

결정 후 반영: MVP UI 상태는 “생각 중/도구 실행 중/변경 적용됨/실패”로 제한한다. 토큰 단위 streaming과 polling-only flow는 제외한다.

#### P1-6. 체크리스트 완료 상태 수정 권한

문제 상세: 체크리스트 항목은 멤버별 완료 상태를 갖고 `updated_by_user_id`를 기록한다. 타인 상태 수정 권한이 모호하면 사용자가 자신의 준비 상태가 임의로 바뀌었다고 느낄 수 있고, 누가 변경했는지 감사하기 어렵다. 반대로 소유자만 수정 가능하게 하면 공동 여행 체크리스트의 개인 진행 상태 UX가 부자연스럽다.

| 선택 | 정책안 | 장점 | 리스크 |
| :--- | :--- | :--- | :--- |
| A | 모든 멤버가 모든 멤버 상태를 수정 가능 | 공동 관리 쉬움 | 권한 분쟁과 오조작 가능 |
| B | 기본은 본인 상태만 수정, `updated_by_user_id` 기록, 소유자 대리 수정은 MVP 이후 옵션 | 개인 상태 신뢰성과 감사 균형 | 대리 체크 요구가 있으면 추가 필요 |
| C | 소유자만 모든 상태 수정 가능 | 관리 통제 명확 | 개인 체크리스트 UX 약함 |
| D | 멤버별 상태 없이 item 단일 완료만 사용 | 구현 단순 | DBML의 per-member 상태와 충돌 |

최종 판단: **B**. 현재 DBML이 멤버별 상태와 `updated_by_user_id`를 이미 분리하고 있으므로, MVP에서는 본인 상태만 수정하게 하는 것이 권한 분쟁을 가장 적게 만든다. 타인 상태 수정은 실제 운영 요구가 생길 때 actor 표시와 함께 확장한다.

API/DBML 반영 지점: `planning.checklist_item_member_statuses`, `PUT /trips/{tripId}/checklists/{checklistId}/items/{itemId}/member-statuses/{userId}`.

결정 후 반영: 신규 멤버 status row는 lazy materialization 또는 join 시 bulk 생성 중 구현 단계에서 선택한다. 대리 체크는 MVP 제외.

#### P1-7. `/record` 화면의 범위

문제 상세: 현재 API와 DBML은 trip 기준 기록(`record.trip_record_entries`)으로 설계되어 있지만 화면 경로 `/record`는 전역 내 기록 feed처럼 해석될 수 있다. 전역 기록으로 설계하면 trip membership 권한, 공개 범위, media 연결 규칙이 달라진다. 반대로 trip scoped만 제공하면 전역 기록 화면의 첫 진입 UX를 별도로 정의해야 한다.

| 선택 | 정책안 | 장점 | 리스크 |
| :--- | :--- | :--- | :--- |
| A | `/record`를 전역 기록 timeline으로 만들고 `GET /records`를 추가 | 사용자가 내 기록을 한 곳에서 봄 | 현재 DBML/API와 권한 범위 재설계 필요 |
| B | 기록 CRUD는 trip scoped로 유지하고 `/record`는 trip selector와 전체 참여 여행방 사진 모아보기로 구성 | DBML과 MVP 범위에 맞고 전체 사진 UX도 제공 | 전체 기록 timeline이 필요하면 추후 확장 필요 |
| C | 기록은 사용자 private resource로만 두고 trip과 분리 | 개인정보 경계 명확 | 여행방 멤버 기록 공유 요구와 충돌 |
| D | 기록을 곧바로 public community post로 발행 | 공유 UX 단순 | private record 요구와 충돌 |

최종 판단: **B 확장**. 기록 CRUD는 trip membership 권한을 전제로 하므로 trip scoped로 유지한다. 다만 `/record`에서는 여행방별 선택 조회와 함께, 사용자가 참여한 모든 여행방의 사진을 한 번에 모아보는 `GET /records/photos` API를 제공한다.

API/DBML 반영 지점: `record.trip_record_entries`, `record.trip_record_media`, `GET /records/photos`, `GET /trips/{tripId}/records`, `POST /trips/{tripId}/records`.

결정 후 반영: `/record` 첫 화면은 trip selector와 전체 사진 모아보기. 기록 수정/삭제 권한은 uploader 기준을 기본으로 하고, 여행방 소유자 대리 수정은 별도 정책 확정 전까지 제외한다.

#### P1-8. 게시글 snapshot preview/validation API

문제 상세: 커뮤니티 게시글은 원본 trip이 아니라 게시 시점 snapshot을 저장한다. preview가 없으면 사용자는 어떤 일정, route, media, hashtag가 공개될지 확인하지 못한 채 발행한다. 클라이언트만 preview를 만들면 실제 서버 snapshot과 달라질 수 있고, persisted draft를 만들면 draft lifecycle과 정리 정책이 추가된다.

| 선택 | 정책안 | 장점 | 리스크 |
| :--- | :--- | :--- | :--- |
| A | preview 없이 바로 발행 | 구현 빠름 | 공개 범위 실수와 사용자 불신 |
| B | stateless `POST /community/posts/preview`로 validation/preview 제공 | 서버 snapshot과 preview 일치 | endpoint 추가 필요 |
| C | persisted draft snapshot resource를 제공 | 긴 편집 flow에 유리 | draft 만료/정리/충돌 처리 필요 |
| D | 프론트가 itinerary/media를 조합해 preview하고 서버 validation은 발행 때만 수행 | backend 단순 | preview와 실제 publish 불일치 가능 |

최종 판단: **D**. 발행 전 미리보기는 서버가 별도 preview 응답을 만들어 주는 방식이 아니라, 프론트엔드가 현재 itinerary/media/hashtag 상태를 동적으로 조합해 제공한다. 서버는 실제 publish 요청에서 권한, media 소유권, source trip version, 공개 가능 범위를 검증한다.

API/DBML 반영 지점: `POST /community/posts`, `community.posts.snapshot_version`, `community.post_media`, `community.post_hashtags`.

결정 후 반영: 서버 preview endpoint는 제공하지 않는다. publish 시 source trip version이 바뀌면 `SOURCE_TRIP_VERSION_CONFLICT`를 반환한다. private record/media는 자동 포함하지 않는다.

#### P1-9. 소셜 follow: 공개 프로필, count, privacy/block 정책

문제 상세: `social.user_follows`는 directed follow edge만 제공한다. 공개 프로필 범위, follower/following count, 차단/비공개 계정 정책은 별도 모델이 없으므로 요구사항을 넓히면 DBML 추가가 필요하다. count를 즉시 제공할지 나중에 제공할지도 feed/profile 성능에 영향을 준다.

| 선택 | 정책안 | 장점 | 리스크 |
| :--- | :--- | :--- | :--- |
| A | 공개 프로필, follow/unfollow, follower/following count를 MVP에 모두 제공 | 소셜 UX 완성도 높음 | count 정합성/성능 고려 필요 |
| B | 공개 프로필과 follow/unfollow만 MVP 제공, count는 집계 또는 read model로 최소 제공, block/private는 제외 | 구현 범위 작고 확장 여지 있음 | privacy 요구가 있으면 schema 추가 필요 |
| C | private account와 follow request 승인/거절을 MVP에 포함, block은 제외 | 개인정보 제어 가능 | follow request 상태/승인 API 추가 필요 |
| D | follow API를 MVP에서 제외 | 구현 범위 감소 | 커뮤니티 소셜 연결 약함 |

최종 판단: **C 조정**. private account는 MVP에 포함한다. `auth.user_profiles.profile_visibility`로 `PUBLIC/PRIVATE`를 관리하고, private account follow는 `PENDING` 요청 후 대상 사용자가 승인하면 `ACTIVE`가 된다. block account는 이번 범위에 포함하지 않는다.

API/DBML 반영 지점: `auth.user_profiles.profile_visibility`, `social.user_follows.status`, `GET /users/{userId}`, `PUT /users/{userId}/follow`, `DELETE /users/{userId}/follow`, `GET /me/follow-requests`, `PUT /me/follow-requests/{userId}/accept`, `DELETE /me/follow-requests/{userId}`.

결정 후 반영: 비회원 공개 프로필과 block account는 MVP 제외. private account와 follow request 관리는 MVP 포함. follow count는 optional aggregate/read-model 값으로 제공한다.

#### P1-10. 알림 센터: MVP 직접 초대만 처리할지

문제 상세: DBML의 `notification.notifications.type` note는 MVP에서 직접 여행방 초대 알림만 생성한다고 되어 있다. 프론트 알림 센터가 댓글/좋아요/AI/운영 공지까지 포함하는 범용 알림처럼 보이면 API와 product scope가 불일치한다. payload schema가 자유 JSON이라도 안정 필드가 없으면 라우팅과 수락/거절 처리가 깨진다.

| 선택 | 정책안 | 장점 | 리스크 |
| :--- | :--- | :--- | :--- |
| A | 모든 알림 유형을 MVP에 범용 지원 | 알림 센터 완성도 높음 | type별 payload/권한/읽음 처리 범위 큼 |
| B | MVP는 직접 여행방 초대 알림만 지원하고 typed payload를 고정 | DBML note와 범위 일치 | 알림 센터 UX가 제한적 |
| C | 앱 내 알림 대신 push notification만 사용 | 모바일 중심 UX에 유리 | 웹/인앱 이력 조회 약함 |
| D | 초대 알림 없이 초대 링크만 사용 | 구현 최소 | 직접 초대 UX 약함 |

최종 판단: **B**. DBML note와 제품 범위가 직접 초대 알림에 맞춰져 있으므로 범용 알림을 열면 type별 payload/권한이 불필요하게 커진다. MVP는 직접 초대 알림만 만들고 typed payload를 고정한다.

API/DBML 반영 지점: `notification.notifications`, `GET /notifications`, `PATCH /notifications/{notificationId}/read`, `PATCH /notifications/read-all`, `POST /trips/{tripId}/invites`.

결정 후 반영: 직접 초대 수락/거절 후 알림은 읽음 처리한다. read 상태 되돌리기는 MVP 제외.

### P2: 운영/확장 전 결정

#### P2-1. 신고 사유 목록 조회와 관리자 사유 관리

문제 상세: `community.report_reasons`가 있으므로 신고 사유는 프론트 하드코딩보다 API 조회가 자연스럽다. 사유 코드가 화면마다 다르면 신고 통계와 운영 대응이 흔들린다. 반대로 관리자 CRUD를 너무 빨리 열면 운영 권한, 다국어 문구, 비활성화된 사유의 과거 신고 표시까지 함께 설계해야 한다.

| 선택 | 정책안 | 장점 | 리스크 |
| :--- | :--- | :--- | :--- |
| A | 신고 사유를 프론트에 하드코딩 | 구현 빠름 | 운영 중 사유 변경/비활성화 어려움 |
| B | `GET /community/report-reasons`로 active 사유만 조회, 관리자 CRUD는 이후 | DBML 활용과 MVP 범위 균형 | 운영자가 직접 수정하려면 추후 API 필요 |
| C | 관리자 사유 CRUD를 MVP에 포함 | 운영 유연성 높음 | 권한/감사/다국어 설계 필요 |
| D | 구조화 사유 없이 free text만 받음 | 유연함 | 통계/자동 분류/중복 처리 약함 |

최종 판단: **B**. `community.report_reasons`가 이미 기준 테이블이므로 프론트 하드코딩은 피해야 한다. 다만 관리자 CRUD는 권한/감사/다국어 범위가 커서 MVP에는 active 목록 조회만 포함한다.

API/DBML 반영 지점: `community.report_reasons`, `community.content_reports.reason_id`, `CreateContentReportRequest.reasonCode`, `GET /community/report-reasons`.

결정 후 반영: 다국어 display name과 관리자 CRUD는 MVP 제외. `OTHER` 선택 시 detail 필수 여부는 validation 정책으로 별도 구현 단계에서 확정한다.

#### P2-2. 운영 감사 로그와 moderation action 조회 범위

문제 상세: `community.moderation_actions`와 `ops.audit_logs`가 분리되어 있다. moderation action은 운영자가 콘텐츠 처리 이력을 확인해야 하지만, 범용 audit log에는 IP, user agent, 내부 metadata 같은 민감 정보가 포함될 수 있다. 모든 로그를 API로 열면 운영 편의성은 좋아지지만 개인정보와 내부 운영 정보 노출 리스크가 커진다.

| 선택 | 정책안 | 장점 | 리스크 |
| :--- | :--- | :--- | :--- |
| A | 관리자 API에서 모든 audit log를 조회 가능하게 함 | 운영 분석 편리 | 민감 정보 노출과 권한 리스크 큼 |
| B | moderation action은 운영 화면에 제공하고, 범용 audit log는 DB/운영 도구 우선, API는 SUPER_ADMIN 전용으로 후순위 | 운영 필요와 보안 균형 | 초기 운영 분석은 수동 도구 의존 |
| C | 감사 로그를 API/운영 화면에 노출하지 않음 | 노출 리스크 작음 | 운영 추적과 사고 대응 약함 |
| D | 모든 운영 이력을 `content_reports`에 합쳐 저장 | schema 단순 | 비신고 운영 action 표현이 어려움 |

최종 판단: **B**. 콘텐츠 처리 이력은 운영 화면에 필요하지만, 범용 audit log에는 IP/user agent/metadata 같은 민감 정보가 들어간다. MVP에서는 moderation action 조회만 제공하고, 범용 audit log API는 SUPER_ADMIN 전용 후순위로 둔다.

API/DBML 반영 지점: `community.moderation_actions`, `ops.audit_logs`, `POST /admin/reports/{reportId}/resolve`, `POST /admin/moderation-actions`, 향후 `/admin/audit-logs`.

결정 후 반영: `/admin/moderation-actions` 조회를 제공한다. `/admin/audit-logs`는 MVP 제외.

#### P2-3. AI 대화/도구 로그 보관 기간과 summary 생성 주기

문제 상세: AI 대화 원문 전체 저장은 context 품질에는 좋지만 개인정보/비용/보관 정책 이슈가 있다. summary가 없으면 긴 여행방에서 AI 품질이 떨어지고 token 비용이 커진다. tool call은 실제 일정/메모/체크리스트 변경을 유발하므로 일반 대화보다 감사 가치가 높지만, 개인정보가 arguments/result에 들어갈 수 있다.

| 선택 | 정책안 | 장점 | 리스크 |
| :--- | :--- | :--- | :--- |
| A | AI 원문과 tool call을 무기한 보관 | 품질/감사 추적 좋음 | 개인정보와 저장 비용 리스크 큼 |
| B | 원문은 정책 기간 보관, summary는 비동기 생성, tool call은 별도 retention과 masking 적용 | 품질/비용/개인정보 균형 | retention job과 masking 기준 필요 |
| C | AI 메시지를 저장하지 않고 요청마다 즉시 처리 | 개인정보 보관 최소화 | context 품질과 협업 이력 약함 |
| D | 사용자가 삭제하면 tool call audit까지 즉시 삭제 | 사용자 통제 강함 | 변경 감사와 undo/분쟁 대응 약함 |

최종 판단: **B**. AI 품질을 위해 원문과 summary가 필요하지만 무기한 원문 보관은 개인정보/비용 리스크가 크다. 원문은 정책 기간 보관하고, summary는 비동기 생성하며, tool call은 감사 가치가 있어 별도 retention/masking을 적용한다.

API/DBML 반영 지점: `ai.ai_chat_sessions.summary`, `ai.ai_chat_messages`, `ai.ai_tool_calls`, `collab.collaboration_command_events`.

결정 후 반영: summary 갱신 trigger는 메시지 수 또는 token 추정량 기준. 사용자 AI 대화 삭제와 tool result masking 세부 기준은 개인정보 정책과 함께 확정한다.

#### P2-4. 법정동 sync admin endpoint와 실패 재처리

문제 상세: 지역 데이터는 trip region 선택의 기준 데이터다. sync 실패나 폐지 지역 반영 오류가 있으면 여행방 지역 선택, 장소 추천 bbox, 커뮤니티 필터가 모두 흔들릴 수 있다. 원천이 파일인지 외부 API인지에 따라 실패 재처리 방식과 audit 정보가 달라진다.

| 선택 | 정책안 | 장점 | 리스크 |
| :--- | :--- | :--- | :--- |
| A | 운영자가 DB에 수동 import | 초기 구현 빠름 | 재현성/감사/실패 복구 약함 |
| B | 자동 sync job과 sync log를 기본으로 두고, 관리자 수동 재시도 endpoint는 운영 단계에서 추가 | 안정성과 MVP 범위 균형 | 초기에는 수동 재시도 UI 없음 |
| C | 사용자 요청 때마다 원천 API를 조회 | 항상 최신 가능 | 외부 장애와 지연이 사용자 요청에 직접 영향 |
| D | 프론트에 지역 데이터를 하드코딩 | backend 단순 | 지역 변경 반영과 폐지 처리 어려움 |

최종 판단: **B**. 지역 기준 데이터는 서비스 전반의 기준값이므로 수동 import나 요청 시 원천 조회보다 자동 sync job과 sync log가 안정적이다. 관리자 수동 재시도 endpoint는 운영 단계에서 추가한다.

API/DBML 반영 지점: `geo.legal_regions`, `geo.legal_region_sync_logs`, 향후 `/admin/legal-regions/sync-runs`.

결정 후 반영: 실패 로그에는 source, file name, count, error message를 저장한다. 원천 방식과 폐지 지역 표시 정책은 sync 구현 단계에서 확정한다.

#### P2-5. rate limit 정책과 quota key

문제 상세: 로그인, OAuth, 추천, 장소 검색, Mapbox route matching, AI 메시지는 abuse와 비용 리스크가 크다. quota key가 너무 넓으면 정상 사용자가 함께 막히고, 너무 좁으면 공격자가 쉽게 우회한다. rate limit 응답 형식이 없으면 프론트가 재시도 안내를 일관되게 할 수 없다.

| 선택 | 정책안 | 장점 | 리스크 |
| :--- | :--- | :--- | :--- |
| A | MVP에서는 rate limit을 두지 않음 | 구현 빠름 | abuse/비용 폭증 리스크 |
| B | endpoint 그룹별 quota key 사용: 인증은 IP+email, 일반 API는 user, 협업은 user+trip, 외부 호출은 user/provider 또는 trip/provider | 비용과 정상 사용 균형 | Redis 등 shared limiter 필요 |
| C | 서비스 전체 global limit만 적용 | 구현 단순 | 특정 고비용 API 보호 부족 |
| D | Mapbox/KTO/OpenAI 같은 provider 자체 quota에만 의존 | 내부 구현 감소 | 사용자별 abuse 제어 불가 |

최종 판단: **B**. 인증/AI/지도/외부 provider 호출은 비용과 abuse 리스크가 다르므로 global limit 하나로는 부족하다. endpoint 그룹별 quota key를 사용하고 초과 시 `429`, `Retry-After`, `ProblemDetails(code=RATE_LIMITED)`를 반환한다.

API/DBML 반영 지점: 모든 외부 호출성 endpoint, `ProblemDetails(code=RATE_LIMITED)`, 보안 이벤트/운영 로그.

결정 후 반영: Redis 등 shared limiter 사용 여부는 backend 인프라 선택 시 확정한다. 사용자-facing quota 노출은 MVP 제외.

#### P2-6. 커뮤니티 denormalized counter 정합성

문제 상세: `community.posts`는 `like_count`, `retrip_count`, `comment_count`, `media_count`를 denormalized로 가진다. counter가 실제 row 수와 다르면 feed 정렬, 상세 화면, 관리자 판단이 모두 어긋난다. 숨김/삭제 댓글을 count에 포함할지 정하지 않으면 사용자 화면과 운영 화면의 숫자가 다르게 보일 수 있다.

| 선택 | 정책안 | 장점 | 리스크 |
| :--- | :--- | :--- | :--- |
| A | 매 요청마다 row count를 실시간 계산 | 정합성 높음 | 대형 feed 성능 저하 |
| B | write transaction 안에서 counter 갱신, 운영 recompute job 제공 | 성능과 정합성 균형 | transaction 규칙과 보정 job 필요 |
| C | 비동기 이벤트로만 counter 갱신 | write 지연 작음 | 일시 불일치와 실패 복구 필요 |
| D | counter는 클라이언트에서 표시용으로만 관리 | backend 단순 | 사용자별 숫자 불일치 |

최종 판단: **B**. feed/detail 성능상 denormalized counter는 유지하되, write transaction에서 함께 갱신해야 사용자 화면 불일치를 줄일 수 있다. 운영 recompute job은 장애 복구용으로 둔다.

API/DBML 반영 지점: `community.posts.*_count`, `community.post_likes`, `community.post_retrips`, `community.post_comments`, `community.post_media`, feed/detail response schema.

결정 후 반영: user-facing `commentCount`는 visible 댓글/대댓글 기준으로 한다. 숨김/삭제 댓글은 운영 화면에서 별도 판단한다.

#### P2-7. preference enrichment 운영: tag dictionary, model version, 재처리

문제 상세: `place_tag_enrichments`는 model/provider/prompt/tag dictionary version을 저장한다. dictionary나 prompt가 바뀌면 기존 장소 enrichment와 사용자 weight projection이 오래된 기준을 계속 사용할 수 있다. 재처리 전략이 없으면 추천 품질이 점진적으로 불일치하고, 한 번 실패한 장소가 계속 추천에서 밀릴 수 있다.

| 선택 | 정책안 | 장점 | 리스크 |
| :--- | :--- | :--- | :--- |
| A | 한 번 enrichment한 결과는 재처리하지 않음 | 운영 단순 | 모델/태그 개선 반영 불가 |
| B | tag dictionary/prompt/model version을 관리하고, 새 version 배포 시 stale marking 후 background re-enrichment, user weight는 event log에서 재생성 | 품질 개선과 재현성 균형 | 운영 job과 priority 정책 필요 |
| C | version 변경 때 전체 장소와 사용자 weight를 동기 재계산 | 일괄 정합성 높음 | 배포 지연과 비용 큼 |
| D | 모델이 생성한 tag를 그대로 taxonomy로 사용 | 자동화 수준 높음 | 태그 안정성과 UX 일관성 낮음 |

최종 판단: **B**. enrichment 결과는 모델/prompt/tag dictionary version에 종속되므로 버전 없이 누적하면 추천 품질을 재현할 수 없다. 새 version 배포 시 stale marking 후 background re-enrichment하고, 사용자 weight는 event log에서 재생성 가능한 projection으로 유지한다.

API/DBML 반영 지점: `preference.preference_tags`, `preference.place_tag_enrichments`, `preference.place_tag_enrichment_tags`, `preference.user_swipe_events`, `preference.user_preference_tag_weights`, 운영 job/관리자 tooling.

결정 후 반영: 재처리 priority와 실패 retry 횟수는 운영 job 정책에서 확정한다. 모델이 생성한 임의 tag를 taxonomy로 바로 쓰지 않는다.

#### P2-8. OpenAPI schema generation과 backend build 연결

문제 상세: 현재 `openapi.yaml`은 수동 초안이다. 백엔드 구현이 시작되면 DBML, OpenAPI, controller DTO가 어긋날 수 있고, 프론트 타입 생성 기준도 흔들릴 수 있다. source of truth를 정하지 않으면 PR마다 문서와 구현이 따로 진화해 계약 회귀를 발견하기 어렵다.

| 선택 | 정책안 | 장점 | 리스크 |
| :--- | :--- | :--- | :--- |
| A | OpenAPI 문서를 수동으로만 관리 | 초기 자유도 높음 | 구현과 문서 drift 가능 |
| B | 초반에는 `.agent/contracts/openapi.yaml`을 contract source로 두고 CI에서 backend 구현/생성 OpenAPI와 diff 검증, 안정화 후 generated OpenAPI 전환 검토 | 계약 중심 개발과 구현 검증 균형 | CI 검증 스크립트 필요 |
| C | backend generated OpenAPI를 즉시 source of truth로 사용 | 구현과 문서 일치 쉬움 | 초기 계약 협의와 프론트 병렬 개발이 어려움 |
| D | 프론트 타입을 수동 작성하고 OpenAPI 생성은 나중에 함 | 빠른 UI 실험 가능 | 타입/계약 불일치 누적 |

최종 판단: **B**. 지금 단계에서는 수동 contract가 프론트/백엔드 병렬 협의의 기준이다. 구현 안정화 전부터 backend generated OpenAPI를 source of truth로 삼으면 계약 협의가 코드 구조에 종속된다. 초반에는 `.agent/contracts/openapi.yaml`을 기준으로 두고, 이후 backend generated OpenAPI와 diff 검증을 붙인다.

API/DBML 반영 지점: `.agent/contracts/schema.dbml`, `.agent/contracts/openapi.yaml`, backend CI, frontend API client generation.

결정 후 반영: MVP 초반 source of truth는 `.agent/contracts/openapi.yaml`. 안정화 후 generated OpenAPI 전환 여부를 재검토한다. DBML-to-migration 검증은 CI 후보로 둔다.
