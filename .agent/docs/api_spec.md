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
- `.agent/docs/functional_spec.md`: 사용자 유형, 화면 범위, 백엔드 필요 기능.
- `.agent/docs/page_map.md`: 화면/라우트 보조 자료. 확정 API 근거가 아니라 관련 화면 매핑에만 사용.

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
| 비회원/게스트 | 공개 커뮤니티 글 조회, 로그인/회원가입 진입 | `.agent/docs/page_map.md` |
| 일반 사용자 | 스와이프 취향 수집, 여행방 생성/참여, 커뮤니티 탐색 | `.agent/docs/functional_spec.md` |
| 여행방 OWNER | 여행방 생성자. 설정, 초대, 삭제 권한 보유 | `.agent/contracts/backend_contract_decisions.md` |
| 여행방 MEMBER | 일정 편집, 기록 업로드, 채팅, AI 사용 가능 | `.agent/contracts/backend_contract_decisions.md` |
| 게시글 작성자 | 여행방 snapshot을 공개/비공개 링크 게시글로 발행 | `.agent/docs/product-specs/service_requirements.md` |
| MODERATOR/ADMIN/SUPER_ADMIN | 신고 처리, 콘텐츠 숨김/복구/삭제, 운영 감사 | `.agent/contracts/backend_contract_decisions.md` |

확인 필요:

- OWNER 이관, MEMBER 자진 탈퇴, 마지막 OWNER 삭제 정책.
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
| TripStatus | `ACTIVE`, `ARCHIVED`, `DELETED` | OWNER만 설정/삭제 가능으로 설계 |
| TripMemberRole | `OWNER`, `MEMBER` | OWNER/MEMBER 모두 일정 편집 가능 |
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
- 여행방 OWNER: 여행방 설정 변경, 초대 생성/취소, 멤버 제거, 여행방 삭제.
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
- 목록: 아래 형태의 page/cursor metadata를 포함한 object.

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
- feed/chat/AI message처럼 append-only 성격이 강한 목록은 `cursor`, `limit` 방식이 더 적합하다. OpenAPI 초안에는 page 기반을 기본으로 두고, cursor 전환 여부는 확인 필요로 남긴다.
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
- 근거 문서 또는 코드 경로: `.agent/contracts/backend_contract_decisions.md`, `.agent/contracts/schema.dbml`, `.agent/docs/page_map.md`.
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
- 근거: `.agent/docs/api_spec.md`, `.agent/contracts/backend_contract_decisions.md`.
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
- 근거: `.agent/docs/api_spec.md`, `auth.user_sessions`.
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
- 근거: `.agent/docs/api_spec.md`, `auth.users`.
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

- 설명: 계정 삭제를 예약한다. 즉시 hard delete가 아니라 `PENDING_DELETION` 상태와 삭제 예정 시각을 기록하는 흐름을 권장한다.
- 인증/권한: 로그인 사용자.
- Path parameters: 없음.
- Query parameters: 없음.
- Request body schema: 없음.
- Response body schema: 없음, `202 Accepted`.
- 성공 응답 예시: `202`.
- 실패 응답 예시: `409 ProblemDetails(code=ACCOUNT_DELETION_BLOCKED_BY_ACTIVE_OWNER_TRIP)`.
- 관련 화면: `/settings`.
- 근거: `auth.users.status`, `deletion_requested_at`, `deletion_scheduled_at`.
- 확인 필요: OWNER인 여행방이 있을 때 삭제 예약을 차단할지, 이관을 요구할지.

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

- 설명: 사용자 공개 프로필 조회.
- 인증/권한: 로그인 사용자. 공개 범위는 확인 필요.
- Path parameters: `userId`.
- Query parameters: 없음.
- Request body schema: 없음.
- Response body schema: `UserSummary`.
- 성공 응답 예시: `200 {"id":"...","displayName":"현우","profileImageUrl":"https://..."}`
- 실패 응답 예시: `404 ProblemDetails(code=USER_NOT_FOUND)`.
- 관련 화면: 팔로우/커뮤니티 작성자 프로필.
- 근거: `auth.users`, `social.user_follows`.
- 확인 필요: 비회원 공개 프로필 여부.

#### PUT `/users/{userId}/follow`

- 설명: 대상 사용자를 팔로우한다. idempotent upsert.
- 인증/권한: 로그인 사용자.
- Path parameters: `userId`.
- Query parameters: 없음.
- Request body schema: 없음.
- Response body schema: `Follow`.
- 성공 응답 예시: `200 {"followerUserId":"...","followingUserId":"...","status":"ACTIVE"}`
- 실패 응답 예시: `422 ProblemDetails(code=CANNOT_FOLLOW_SELF)`.
- 관련 화면: 커뮤니티/프로필.
- 근거: `.agent/contracts/backend_contract_decisions.md`, `social.user_follows`.
- 확인 필요: 차단/비공개 계정 정책.

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
- 성공 응답 예시: `200 {"items":[{"id":"...","title":"부산 주말","role":"OWNER"}]}`
- 실패 응답 예시: `401 ProblemDetails(code=UNAUTHORIZED)`.
- 관련 화면: `/my-trips`, `/home`.
- 근거: `.agent/docs/functional_spec.md`, `trip.trips`, `trip.trip_members`.
- 확인 필요: archived trip 노출 기본값.

#### POST `/trips`

- 설명: 새 여행방 생성. 생성자는 OWNER 멤버로 등록된다.
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
- 성공 응답 예시: `200 {"id":"...","title":"부산 주말","members":[{"role":"OWNER"}]}`
- 실패 응답 예시: `403 ProblemDetails(code=TRIP_MEMBER_REQUIRED)`.
- 관련 화면: `/trips/:tripId/route`, `/trips/:tripId/swipe`.
- 근거: `trip.trips`, `trip.trip_members`.
- 확인 필요: 초대 링크 진입 전 preview 응답 필요 여부.

#### PATCH `/trips/{tripId}`

- 설명: 여행방 제목, 대표 목적지, 지역, 상태 수정.
- 인증/권한: OWNER. 단, 제목 수정 MEMBER 허용 여부는 확인 필요.
- Path parameters: `tripId`.
- Query parameters: 없음.
- Request body schema: `UpdateTripRequest`.
- Response body schema: `TripDetail`.
- 성공 응답 예시: `200 {"id":"...","title":"부산 미식 여행"}`
- 실패 응답 예시: `403 ProblemDetails(code=OWNER_REQUIRED)`.
- 관련 화면: 여행방 설정.
- 근거: `.agent/contracts/backend_contract_decisions.md`, `trip.trips`.
- 확인 필요: MEMBER가 어떤 설정을 수정할 수 있는지.

#### DELETE `/trips/{tripId}`

- 설명: 여행방 soft delete.
- 인증/권한: OWNER.
- Path parameters: `tripId`.
- Query parameters: 없음.
- Request body schema: 없음.
- Response body schema: 없음, `204 No Content`.
- 성공 응답 예시: `204`.
- 실패 응답 예시: `403 ProblemDetails(code=OWNER_REQUIRED)`.
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
- 성공 응답 예시: `200 [{"user":{"id":"...","displayName":"민지"},"role":"OWNER"}]`
- 실패 응답 예시: `403 ProblemDetails(code=TRIP_MEMBER_REQUIRED)`.
- 관련 화면: 여행방 설정, route 협업 화면.
- 근거: `trip.trip_members`.
- 확인 필요: LEFT/REMOVED 멤버 이력 노출 여부.

#### POST `/trips/{tripId}/invites`

- 설명: 초대 링크/코드 또는 직접 사용자 초대를 생성한다.
- 인증/권한: OWNER.
- Path parameters: `tripId`.
- Query parameters: 없음.
- Request body schema: `CreateTripInviteRequest`.
- Response body schema: `TripInvite`.
- 성공 응답 예시: `201 {"id":"...","inviteCode":"ABCD1234","status":"PENDING"}`
- 실패 응답 예시: `403 ProblemDetails(code=OWNER_REQUIRED)`.
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
- 인증/권한: OWNER가 MEMBER 제거. 본인 나가기는 MEMBER 허용 여부 확인 필요.
- Path parameters: `tripId`, `userId`.
- Query parameters: 없음.
- Request body schema: 없음.
- Response body schema: 없음, `204 No Content`.
- 성공 응답 예시: `204`.
- 실패 응답 예시: `422 ProblemDetails(code=CANNOT_REMOVE_LAST_OWNER)`.
- 관련 화면: 여행방 설정.
- 근거: `trip.trip_members.status`.
- 확인 필요: OWNER self leave/ownership transfer 정책.

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
- 확인 필요: 화면 route의 `tripId`를 API에 optional context로 전달할지.

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
- Query parameters: `bbox`, `centerLat`, `centerLng`, `tab=BASIC|SUPER_LIKE`, `page`, `size`.
- Request body schema: 없음.
- Response body schema: `PagedPlaceRecommendation`.
- 성공 응답 예시: `200 {"items":[{"place":{"name":"성심당"},"matchedMembers":[{"id":"...","displayName":"민지"}]}]}`
- 실패 응답 예시: `403 ProblemDetails(code=TRIP_MEMBER_REQUIRED)`.
- 관련 화면: `/trips/:tripId/route`.
- 근거: `.agent/docs/product-specs/service_requirements.md`.
- 확인 필요: raw/normalized score는 반환하지 않는 정책 유지, bbox 필수 여부.

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
- 확인 필요: 이동으로 stale이 되는 route segment 응답 형태.

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

- 설명: day/item 순서를 일괄 재정렬한다.
- 인증/권한: active trip member.
- Path parameters: `tripId`.
- Query parameters: 없음.
- Request body schema: `ReorderItineraryRequest` with `baseVersion`.
- Response body schema: `ItineraryMutationResponse`.
- 성공 응답 예시: `200 {"itineraryVersion":19,"days":[...]}`
- 실패 응답 예시: `409 ProblemDetails(code=ITINERARY_VERSION_CONFLICT)`.
- 관련 화면: route drag/drop, AI 재배치.
- 근거: `.agent/docs/product-specs/service_requirements.md`.
- 확인 필요: 부분 reorder payload와 전체 snapshot payload 중 선택.

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
- 확인 필요: item reorder 시 서버가 자동 삭제하는 stale route와 사용자 삭제의 구분.

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

- 설명: 특정 멤버의 체크리스트 항목 완료 상태 변경.
- 인증/권한: active trip member. 본인 상태만 수정할지, 모든 멤버 상태를 수정할 수 있을지는 확인 필요.
- Path parameters: `tripId`, `checklistId`, `itemId`, `userId`.
- Query parameters: 없음.
- Request body schema: `UpdateChecklistMemberStatusRequest` with `baseVersion`.
- Response body schema: `PlanningMutationResponse`.
- 성공 응답 예시: `200 {"itineraryVersion":35,"memberStatus":{"userId":"...","isCompleted":true}}`
- 실패 응답 예시: `403 ProblemDetails(code=CHECKLIST_STATUS_FORBIDDEN)`.
- 관련 화면: planning panel.
- 근거: `planning.checklist_item_member_statuses`.
- 확인 필요: 다른 멤버 완료 처리 허용 여부.

### Chat / AI

#### GET `/trips/{tripId}/chat/messages`

- 설명: 여행방 전체 텍스트 채팅 메시지 조회.
- 인증/권한: active trip member.
- Path parameters: `tripId`.
- Query parameters: `page`, `size`, `sort`.
- Request body schema: 없음.
- Response body schema: `PagedTripChatMessage`.
- 성공 응답 예시: `200 {"items":[{"id":"...","content":"내일 10시에 만나요"}]}`
- 실패 응답 예시: `403 ProblemDetails(code=TRIP_MEMBER_REQUIRED)`.
- 관련 화면: route 내 사용자 소통 UI.
- 근거: `.agent/docs/product-specs/service_requirements.md`, `chat.trip_chat_messages`.
- 확인 필요: cursor pagination 전환.

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
- Query parameters: `page`, `size`, `sort`.
- Request body schema: 없음.
- Response body schema: `PagedAiChatMessage`.
- 성공 응답 예시: `200 {"items":[{"role":"USER","content":"비 오는 날 갈 곳 찾아줘"}]}`
- 실패 응답 예시: `403 ProblemDetails(code=TRIP_MEMBER_REQUIRED)`.
- 관련 화면: AI 챗봇 패널.
- 근거: `ai.ai_chat_messages`.
- 확인 필요: 오래된 대화 summary 노출 여부.

#### POST `/trips/{tripId}/ai/messages`

- 설명: AI 사용자 메시지를 저장하고, 필요한 read/search 또는 reversible write tool 실행 결과를 assistant message로 반환한다.
- 인증/권한: active trip member.
- Path parameters: `tripId`.
- Query parameters: 없음.
- Request body schema: `CreateAiMessageRequest` with optional `baseVersion`.
- Response body schema: `AiMessageResponse`.
- 성공 응답 예시: `201 {"message":{"role":"ASSISTANT","content":"성심당을 일차 미정에 추가했어요."},"toolCalls":[{"status":"SUCCEEDED"}]}`
- 실패 응답 예시: `409 ProblemDetails(code=ITINERARY_VERSION_CONFLICT)`.
- 관련 화면: AI 챗봇 패널.
- 근거: AI Tool Calling 요구사항.
- 확인 필요: streaming 응답(SSE/WebSocket) 도입 여부.

### Records / Media

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
- 확인 필요: `/record`가 전역 내 기록인지 특정 trip 선택 후 기록인지.

#### POST `/trips/{tripId}/records`

- 설명: 여행 기록 엔트리 생성.
- 인증/권한: active trip member.
- Path parameters: `tripId`.
- Query parameters: 없음.
- Request body schema: `CreateTripRecordRequest`.
- Response body schema: `TripRecordEntry`.
- 성공 응답 예시: `201 {"id":"...","media":[{"id":"..."}],"visibility":"TRIP_MEMBERS"}`
- 실패 응답 예시: `422 ProblemDetails(code=MEDIA_NOT_OWNED)`.
- 관련 화면: `/record`.
- 근거: `record.trip_record_entries`, `record.trip_record_media`.
- 확인 필요: 동영상 지원 mime/size 제한.

#### PATCH `/trips/{tripId}/records/{recordId}`

- 설명: 기록 제목/caption/연결 day/item 수정.
- 인증/권한: active trip member + uploader 또는 OWNER 여부 확인 필요.
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
- 인증/권한: uploader 또는 OWNER 여부 확인 필요.
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

- 설명: S3 호환 object storage 직접 업로드용 signed URL 발급.
- 인증/권한: 로그인 사용자.
- Path parameters: 없음.
- Query parameters: 없음.
- Request body schema: `CreateUploadUrlRequest`.
- Response body schema: `UploadUrlResponse`.
- 성공 응답 예시: `201 {"uploadUrl":"https://storage...","objectKey":"media/..." }`
- 실패 응답 예시: `422 ProblemDetails(code=UNSUPPORTED_MEDIA_TYPE)`.
- 관련 화면: 프로필, 기록, 커뮤니티 작성.
- 근거: `.agent/contracts/backend_contract_decisions.md`, `media.media_files`.
- 확인 필요: multipart upload 필요 여부, 이미지 처리 pipeline.

#### POST `/media/files`

- 설명: 업로드 완료 후 media metadata를 확정 등록한다.
- 인증/권한: 로그인 사용자.
- Path parameters: 없음.
- Query parameters: 없음.
- Request body schema: `CreateMediaFileRequest`.
- Response body schema: `MediaFile`.
- 성공 응답 예시: `201 {"id":"...","mimeType":"image/jpeg","status":"ACTIVE"}`
- 실패 응답 예시: `422 ProblemDetails(code=OBJECT_NOT_FOUND)`.
- 관련 화면: 프로필, 기록, 커뮤니티 작성.
- 근거: `media.media_files`.
- 확인 필요: 백엔드 proxy upload를 병행할지.

#### DELETE `/media/files/{mediaFileId}`

- 설명: media file soft delete 및 purge 예약.
- 인증/권한: owner 또는 연결 리소스 권한자.
- Path parameters: `mediaFileId`.
- Query parameters: 없음.
- Request body schema: 없음.
- Response body schema: 없음, `204 No Content`.
- 성공 응답 예시: `204`.
- 실패 응답 예시: `403 ProblemDetails(code=MEDIA_OWNER_REQUIRED)`.
- 관련 화면: 프로필, 기록, 커뮤니티 작성.
- 근거: `media.media_files.status`, `purge_after_at`.
- 확인 필요: 이미 게시글/기록에 연결된 media 삭제 제한.

### Community / Reports / Notifications / Admin

#### GET `/community/posts`

- 설명: 커뮤니티 게시글 목록/feed 조회.
- 인증/권한: 공개. 로그인 시 liked/retripped 여부 포함 가능.
- Path parameters: 없음.
- Query parameters: `visibility`, `hashtag`, `q`, `page`, `size`, `sort`.
- Request body schema: 없음.
- Response body schema: `PagedCommunityPostSummary`.
- 성공 응답 예시: `200 {"items":[{"id":"...","title":"부산 2박 3일","visibility":"PUBLIC"}]}`
- 실패 응답 예시: `400 ProblemDetails(code=INVALID_SORT)`.
- 관련 화면: `/community`, `/community/feed`, `/community/stories`.
- 근거: `.agent/docs/functional_spec.md`, `community.posts`.
- 확인 필요: `/feed`와 `/stories`를 같은 API 필터로 처리할지.

#### POST `/community/posts`

- 설명: 여행방 snapshot을 커뮤니티 게시글로 발행한다.
- 인증/권한: source trip active member.
- Path parameters: 없음.
- Query parameters: 없음.
- Request body schema: `CreateCommunityPostRequest`.
- Response body schema: `CommunityPostDetail`.
- 성공 응답 예시: `201 {"id":"...","sourceTripId":"...","snapshotVersion":1}`
- 실패 응답 예시: `403 ProblemDetails(code=TRIP_MEMBER_REQUIRED)`.
- 관련 화면: `/community/story-write`.
- 근거: 커뮤니티 snapshot 요구사항, `community.posts`.
- 확인 필요: 발행 전 preview/validation endpoint 필요 여부.

#### GET `/community/posts/{postId}`

- 설명: 커뮤니티 게시글 상세와 immutable snapshot 조회.
- 인증/권한: `PUBLIC` 공개, `UNLISTED`는 링크 접근 허용. 삭제/숨김은 권한자만.
- Path parameters: `postId`.
- Query parameters: 없음.
- Request body schema: 없음.
- Response body schema: `CommunityPostDetail`.
- 성공 응답 예시: `200 {"id":"...","snapshot":{"days":[...]}}`
- 실패 응답 예시: `404 ProblemDetails(code=POST_NOT_FOUND)`.
- 관련 화면: 커뮤니티 상세.
- 근거: `community.post_snapshot_*`.
- 확인 필요: UNLISTED 접근을 post id만으로 허용할지 secret slug/token을 둘지.

#### PATCH `/community/posts/{postId}`

- 설명: 게시글 title/summary/visibility/media/hashtags 수정. snapshot 변경은 확인 필요.
- 인증/권한: published_by user. OWNER/MEMBER 권한은 게시 후 무관.
- Path parameters: `postId`.
- Query parameters: 없음.
- Request body schema: `UpdateCommunityPostRequest`.
- Response body schema: `CommunityPostDetail`.
- 성공 응답 예시: `200 {"id":"...","title":"부산 맛집 루트"}`
- 실패 응답 예시: `403 ProblemDetails(code=POST_AUTHOR_REQUIRED)`.
- 관련 화면: 게시글 수정.
- 근거: `community.posts.updated_at`.
- 확인 필요: snapshot 재발행/갱신 허용 여부.

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
- 확인 필요: 신고 사유 목록 조회 endpoint 필요 여부.

#### GET `/notifications`

- 설명: 내 인앱 알림 목록.
- 인증/권한: 로그인 사용자.
- Path parameters: 없음.
- Query parameters: `unreadOnly`, `page`, `size`.
- Request body schema: 없음.
- Response body schema: `PagedNotification`.
- 성공 응답 예시: `200 {"items":[{"type":"TRIP_INVITE","readAt":null}]}`
- 실패 응답 예시: `401 ProblemDetails(code=UNAUTHORIZED)`.
- 관련 화면: `/home`, `/mypage`.
- 근거: MVP 알림 요구사항, `notification.notifications`.
- 확인 필요: 알림 센터 UI 존재 여부.

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
- 확인 필요: read 상태 되돌리기 지원 여부.

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
- 확인 필요: 알림 type별 일괄 처리 필요 여부.

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
- 확인 필요: 자동 숨김이 없다는 MVP 정책 유지.

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
| Trip | `id`, `ownerUserId`, `title`, `displayDestination`, `status`, `itineraryVersion` | 생성자가 OWNER, 설정/삭제는 OWNER |
| TripMember | `tripId`, `userId`, `role`, `status` | active member만 협업 가능 |
| TripInvite | `tripId`, `inviteCode`, `inviteTokenHash`, `status`, `expiresAt` | OWNER 생성, direct invite는 알림 생성 |
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
| CommunityPost | `sourceTripId`, `publishedByUserId`, `visibility`, `snapshot`, `counts`, `moderationStatus` | snapshot immutable 유지 |
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

OpenAPI YAML은 별도 파일 [.agent/contracts/openapi.yaml](../contracts/openapi.yaml)에 저장했다. 미확정 사항은 schema/operation description에 `TODO` 또는 `확인 필요`로 남겼다.

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

이 섹션은 API 명세 확정 전에 PM/디자인/백엔드/프론트엔드가 결정해야 할 항목이다. 각 항목은 “왜 필요한지”, “권장 best practice”, “API 반영 지점”으로 나눴다.

### P0: API 확정 전 반드시 결정

#### P0-1. 인증: 이메일 인증, password policy, OAuth, refresh token rotation

- 왜 필요한가: 인증 정책은 회원가입, 로그인, 토큰 갱신, WebSocket handshake, 보안 에러 코드에 모두 영향을 준다. 이메일 인증을 필수로 할지에 따라 `UserStatus` 또는 별도 `emailVerifiedAt` 필드가 필요할 수 있다.
- Best practice 제안: 이메일/비밀번호는 이메일 인증을 권장하되 MVP에서는 “가입 가능, 민감 기능 전 인증 요구” 방식도 허용할 수 있다. 비밀번호는 최소 8자 이상, 유출/약한 비밀번호 차단, 로그인 실패 rate limit을 적용한다. refresh token은 rotation을 적용하고, 재사용 감지 시 해당 user session family를 revoke하는 방식이 안전하다.
- API 반영 지점: `POST /auth/register`, `POST /auth/email-verification-requests`, `POST /auth/email-verifications`, `POST /auth/password-reset-requests`, `POST /auth/password-resets`, `POST /auth/refresh`, `POST /auth/logout`, `GET /me`, `GET /me/sessions`, `GET /me/security-events`, WebSocket handshake.
- 확인 필요: 이메일 인증 필수 여부, 필수 약관 미동의 처리, access/refresh token TTL, 전체 기기 로그아웃 지원 여부.

#### P0-2. OAuth: Kakao/Google redirect/callback 방식

- 왜 필요한가: V1 활성 provider가 Kakao/Google로 정해져 있지만, 프론트가 provider authorization URL을 직접 구성할지 백엔드가 생성할지에 따라 endpoint 책임이 달라진다.
- Best practice 제안: provider별 redirect URL, client secret, token exchange는 백엔드가 관리한다. 프론트는 `GET /auth/oauth/{provider}/authorization-url`로 URL을 받고, callback code를 `POST /auth/oauth/{provider}/callback`에 전달한다. state 검증과 provider subject 중복 방지는 서버가 담당한다.
- API 반영 지점: `GET /auth/oauth/{provider}/authorization-url`, `POST /auth/oauth/{provider}/callback`, `auth.user_auth_identities`.
- 확인 필요: 소셜 신규 가입 시 display name/약관 동의 보완 화면이 필요한지.

#### P0-3. 권한: OWNER 이관, 마지막 OWNER 삭제/탈퇴, MEMBER 설정 권한

- 왜 필요한가: 여행방 OWNER가 사라지면 초대, 삭제, 설정 변경 같은 관리 작업의 주체가 없어진다. MEMBER가 어디까지 수정 가능한지도 endpoint별 `403` 기준을 결정한다.
- Best practice 제안: trip은 항상 active OWNER가 최소 1명 있어야 한다. OWNER가 탈퇴/삭제하려면 사전 이관을 요구하고, 마지막 OWNER 삭제는 차단한다. MEMBER는 일정/지도/메모/체크리스트/채팅/기록 생성은 가능하게 두되, 초대/멤버 제거/여행방 삭제/핵심 설정 변경은 OWNER 전용으로 둔다.
- API 반영 지점: `PATCH /trips/{tripId}`, `DELETE /trips/{tripId}`, `POST /trips/{tripId}/invites`, `DELETE /trips/{tripId}/members/{userId}`.
- 확인 필요: OWNER 이관 endpoint를 별도로 둘지, `PATCH /trips/{tripId}/members/{userId}` 형태로 둘지.

#### P0-4. 협업 version: 단일 `itineraryVersion` vs domain별 version

- 왜 필요한가: 일정, route, map drawing, 메모, 체크리스트가 모두 협업 write로 처리된다. version 정책이 정해져야 `baseVersion` 충돌 처리와 undo/redo가 일관된다.
- Best practice 제안: MVP에서는 `trip.itineraryVersion` 단일 version을 사용한다. 협업 범위가 넓어지면 충돌이 다소 많아질 수 있지만, 프론트 동기화와 WebSocket broadcast가 단순하고 undo/redo pipeline도 하나로 유지된다. 추후 사용량이 늘면 `planningVersion`, `mapVersion` 분리를 검토한다.
- API 반영 지점: 모든 협업 write request의 `baseVersion`, `ItineraryMutationResponse`, `PlanningMutationResponse`, `CollaborationActionResponse`.
- 확인 필요: 메모/체크리스트 변경도 `itineraryVersion` 이름을 그대로 쓸지, 더 넓은 의미의 `collaborationVersion`으로 명칭을 바꿀지.

#### P0-5. WebSocket: STOMP destination, 인증, session id

- 왜 필요한가: 일정 동시 편집, 지도 preview, route matching 결과, 채팅, AI tool write 결과는 REST 응답만으로 동기화하기 어렵다. 또한 undo/redo stack은 “사용자별 활성 WebSocket 세션”에 귀속된다.
- Best practice 제안: STOMP over WebSocket을 사용하고, handshake는 Bearer access token으로 인증한다. 서버가 handshake 성공 시 `websocketSessionId`를 발급하고, 프론트는 협업 REST write 때 `X-Soomgil-WebSocket-Session-Id`로 전달한다. destination은 도메인별로 분리한다.
- API 반영 지점: `GET /ws`, `/topic/trips/{tripId}/itinerary`, `/topic/trips/{tripId}/map-drawings`, `/topic/trips/{tripId}/route-matching`, `/topic/trips/{tripId}/chat`, `/topic/trips/{tripId}/ai`.
- 확인 필요: preview stroke payload 크기 제한, 재접속 시 session id 재사용 여부.

#### P0-6. 장소 provider: KTO API, 캐시 TTL, fallback, place id 포맷

- 왜 필요한가: 장소 master data를 저장하지 않고 `provider + externalPlaceId`로 참조하므로 provider ID 안정성이 중요하다. 추천/검색/스와이프/일정/커뮤니티 snapshot이 모두 같은 참조 포맷을 사용해야 한다.
- Best practice 제안: 내부 API의 장소 참조는 항상 `{provider, externalPlaceId}` object로 통일한다. KTO 원본 응답은 짧은 TTL cache를 두고, itinerary/community snapshot에는 표시 가능한 최소 필드를 복사해 외부 provider 장애와 원본 삭제에 대비한다. provider 장애 시 검색/추천은 `502` 또는 stale cache 반환 중 하나를 endpoint별로 명확히 둔다.
- API 반영 지점: `PlaceRef`, `PlaceSummary`, `PlaceDetail`, `ItineraryItem`, `CommunityPostSnapshot`, `GET /places/search`, `GET /trips/{tripId}/place-recommendations`.
- 확인 필요: KTO content id 필드 확정, cache TTL, 원본 삭제 감지 방식.

#### P0-7. Mapbox: stroke downsampling, 좌표 제한, 실패 코드

- 왜 필요한가: Mapbox Map Matching은 일반적으로 좌표 수 제한이 있고, 너무 촘촘한 stroke를 그대로 보내면 실패하거나 비용/지연이 커진다.
- Best practice 제안: 프론트는 drawing 중 preview용 원본 stroke를 로컬 관리하고, route matching 요청 전 1차 downsampling을 수행한다. 백엔드는 최종 방어선으로 좌표 개수와 거리 간격을 검증한다. 실패는 `ROUTE_MATCH_FAILED`, `TOO_MANY_COORDINATES`, `LOW_CONFIDENCE`, `UPSTREAM_PROVIDER_ERROR`처럼 UI 안내 가능한 code로 나눈다.
- API 반영 지점: `POST /trips/{tripId}/routes/map-match`, `MapMatchRouteRequest.coordinates`, `MapMatchRouteResponse`, `ProblemDetails.code`.
- 확인 필요: confidence threshold, route 저장 최소 기준, 실패 request log 보관 기간.

#### P0-8. 커뮤니티 `UNLISTED` 접근 방식

- 왜 필요한가: `UNLISTED`는 feed에는 노출되지 않지만 링크를 아는 사람은 접근할 수 있는 공개 범위다. post id만으로 접근할지 secret이 필요한지에 따라 보안 수준이 달라진다.
- Best practice 제안: `UNLISTED`는 post id와 별도 share token 또는 slug를 함께 요구하는 방식을 권장한다. `PUBLIC`은 `/community/posts/{postId}`로 접근하고, `UNLISTED`는 `/community/posts/{postId}?shareToken=...` 또는 별도 share slug route를 사용한다.
- API 반영 지점: `GET /community/posts/{postId}`, `CreateCommunityPostRequest`, `CommunityPostDetail`.
- 확인 필요: share token rotate/revoke 기능을 MVP에 포함할지.

#### P0-9. 미디어: 용량, mime type, 썸네일, retention

- 왜 필요한가: 프로필 이미지, 기록 사진/영상, 커뮤니티 미디어가 같은 `media.media_files`를 사용한다. 제한이 없으면 비용과 보안 리스크가 커진다.
- Best practice 제안: signed URL 직접 업로드를 기본으로 한다. 이미지/영상 mime allowlist와 용량 제한을 purpose별로 다르게 둔다. 업로드 완료 후 metadata 확정 시 object existence와 mime sniffing을 검증한다. 삭제는 soft delete 후 retention 기간이 지나면 object purge한다.
- API 반영 지점: `POST /media/upload-urls`, `POST /media/files`, `DELETE /media/files/{mediaFileId}`, `MediaFile`.
- 확인 필요: 동영상 지원 시 transcoding/thumbnail pipeline을 MVP에 포함할지.

### P1: 프론트 구현 전 조정 가능성이 큰 부분

#### P1-1. `/trips/:tripId/swipe`와 전역 `/swipe/feed` 관계

- 왜 필요한가: 화면 route에는 `tripId`가 있지만 요구사항은 스와이프를 여행방 종속이 아닌 전역 개인 선호도 수집으로 정의한다.
- Best practice 제안: API는 전역 `/swipe/feed`로 유지하고, 화면에서 필요한 경우 `contextTripId`를 optional query로 받는다. 단, 저장되는 reaction은 전역 개인 반응으로 유지한다. 이렇게 하면 기획의 “평소 취향 수집” 원칙을 지키면서 trip 화면 진입 UX도 지원할 수 있다.
- API 반영 지점: `GET /swipe/feed`, `PUT /places/{provider}/{externalPlaceId}/swipe-reaction`.
- 확인 필요: `contextTripId`가 후보 다양성이나 추천 설명에 영향을 주는지.

#### P1-2. route 추천 패널의 bbox/center/tab/pagination 호출 타이밍

- 왜 필요한가: 지도 viewport가 바뀔 때마다 추천 API를 호출하면 UX는 즉각적이지만 API 부하가 크다. 반대로 수동 갱신만 허용하면 사용자는 현재 지도의 추천이 최신인지 알기 어렵다.
- Best practice 제안: `bbox`는 필수, `center`는 거리 동점 처리용 optional로 둔다. 지도 이동 종료 후 debounce 호출을 기본으로 하고, 큰 이동에는 “이 지역에서 다시 추천” 버튼을 제공한다. `tab=BASIC|SUPER_LIKE`는 같은 endpoint에서 처리한다.
- API 반영 지점: `GET /trips/{tripId}/place-recommendations`.
- 확인 필요: debounce 시간, 첫 진입 기본 viewport, page reset 조건.

#### P1-3. 일정 drag/drop payload: 전체 snapshot vs delta

- 왜 필요한가: drag/drop은 동시 편집 충돌이 자주 발생하는 영역이다. payload 모양이 서버 검증 난이도와 충돌 범위를 결정한다.
- Best practice 제안: MVP에서는 day별 전체 item order snapshot을 보낸다. 서버는 `baseVersion`을 검사하고, item 소유 trip/day 유효성을 검증한 뒤 적용한다. delta 방식은 동시 편집과 부분 reorder 최적화가 필요해질 때 도입한다.
- API 반영 지점: `PUT /trips/{tripId}/itinerary/reorder`, `ReorderItineraryRequest`.
- 확인 필요: day reorder와 item reorder를 같은 endpoint로 유지할지 분리할지.

#### P1-4. 채팅/AI message pagination: page vs cursor

- 왜 필요한가: 채팅과 AI 메시지는 계속 뒤에 추가되는 append-only 성격이다. page 기반은 중간 삽입/새 메시지 도착 시 목록이 흔들릴 수 있다.
- Best practice 제안: 일반 목록은 `page/size`, 채팅과 AI 메시지는 cursor 기반을 권장한다. MVP에서 page 기반으로 시작하더라도 response에 `nextCursor`를 추가할 수 있게 schema를 열어 둔다.
- API 반영 지점: `GET /trips/{tripId}/chat/messages`, `GET /trips/{tripId}/ai/messages`.
- 확인 필요: cursor를 message `createdAt + id` 복합 기준으로 할지, opaque token으로 할지.

#### P1-5. AI 응답 streaming: REST 단건 vs SSE/WebSocket

- 왜 필요한가: AI 응답은 지연 시간이 길 수 있고, tool calling이 실행되면 중간 상태와 최종 변경 broadcast가 필요하다.
- Best practice 제안: MVP는 `POST /trips/{tripId}/ai/messages`의 REST 단건 응답으로 시작한다. 동시에 AI message 생성/완료 이벤트는 WebSocket `/topic/trips/{tripId}/ai`로 broadcast한다. 토큰 단위 streaming은 V1 이후 SSE 또는 WebSocket으로 확장한다.
- API 반영 지점: `POST /trips/{tripId}/ai/messages`, AI WebSocket topic, `AiMessageResponse`.
- 확인 필요: 사용자에게 “생각 중/도구 실행 중” 상태를 보여줄지.

#### P1-6. 체크리스트 완료 상태 수정 권한

- 왜 필요한가: 체크리스트 항목은 멤버별 완료 상태를 가진다. 다른 멤버 상태를 누가 수정할 수 있는지 명확하지 않으면 권한 분쟁과 감사 추적 문제가 생긴다.
- Best practice 제안: 기본은 본인 상태만 수정 가능하게 둔다. OWNER 또는 모든 멤버가 타인 상태를 수정하는 기능은 MVP 이후 옵션으로 둔다. 타인 상태 수정이 필요하면 `updatedByUserId`를 반드시 기록하고 UI에 actor를 표시한다.
- API 반영 지점: `PUT /trips/{tripId}/checklists/{checklistId}/items/{itemId}/member-statuses/{userId}`.
- 확인 필요: OWNER가 멤버 상태를 대신 체크할 수 있어야 하는 실제 사용 시나리오가 있는지.

#### P1-7. `/record` 화면의 범위

- 왜 필요한가: 현재 API는 trip 기준 기록(`GET /trips/{tripId}/records`)으로 설계되어 있다. 하지만 화면 경로 `/record`는 전역 내 기록 feed처럼 해석될 수 있다.
- Best practice 제안: MVP에서는 trip 선택 후 기록을 관리하는 구조로 시작한다. 전역 `/record`는 내 여행방 목록과 최근 기록 preview를 보여주고, 실제 CRUD는 trip scoped API를 사용한다. 나중에 필요하면 `GET /records`를 추가한다.
- API 반영 지점: `GET /trips/{tripId}/records`, `POST /trips/{tripId}/records`.
- 확인 필요: `/record` 첫 화면이 trip selector인지, 전체 timeline인지.

#### P1-8. 게시글 snapshot preview/validation API

- 왜 필요한가: 커뮤니티 게시글은 원본 trip이 아니라 게시 시점 snapshot을 저장한다. 사용자가 발행 전 어떤 일정/경로/미디어가 공개될지 확인해야 한다.
- Best practice 제안: MVP라도 발행 직전 preview는 제공하는 것이 안전하다. 다만 별도 저장 리소스를 만들기보다 `POST /community/posts/preview` 같은 stateless validation/preview endpoint를 두거나, 프론트가 `GET /trips/{tripId}/itinerary`를 조합해 preview하고 발행 시 서버가 최종 snapshot을 생성한다.
- API 반영 지점: `POST /community/posts`, 향후 `POST /community/posts/preview` 후보.
- 확인 필요: preview snapshot과 실제 publish snapshot 사이의 version conflict 처리.

### P2: 운영/확장 전 결정

#### P2-1. 신고 사유 목록 조회와 관리자 사유 관리

- 왜 필요한가: 신고 사유는 구조화 코드로 저장되지만, 프론트가 하드코딩하면 운영 중 사유명 변경/비활성화가 어렵다.
- Best practice 제안: MVP에서는 `GET /community/report-reasons`로 active reason 목록만 제공하고, 관리자 사유 CRUD는 V1 이후로 미룬다. reason code는 안정적으로 유지하고 display name만 바꿀 수 있게 한다.
- API 반영 지점: `CreateContentReportRequest.reasonCode`, 향후 `GET /community/report-reasons`.
- 확인 필요: 다국어 reason display name 필요 여부.

#### P2-2. 운영 감사 로그 조회 API 범위

- 왜 필요한가: moderation, 권한 변경, 민감 데이터 접근은 운영 감사가 필요하다. 하지만 감사 로그 API는 개인정보와 내부 운영 정보 노출 위험이 크다.
- Best practice 제안: 감사 로그는 먼저 DB/운영 도구에서만 조회하고, 관리자 콘솔 API는 필요한 필터가 확정된 뒤 만든다. API를 만들 경우 SUPER_ADMIN 전용으로 제한하고, IP/user agent 등 민감 필드는 마스킹한다.
- API 반영 지점: `ops.audit_logs`, 향후 `/admin/audit-logs`.
- 확인 필요: 운영 콘솔 MVP 범위에 감사 로그 화면이 포함되는지.

#### P2-3. AI 대화/도구 로그 보관 기간과 summary 생성 주기

- 왜 필요한가: AI 대화 원문 전체 저장은 context 품질에는 좋지만 개인정보/비용/보관 정책 이슈가 있다. summary가 없으면 긴 여행방에서 AI 품질이 떨어지고 token 비용이 커진다.
- Best practice 제안: 원문은 서비스 정책상 일정 기간 보관하고, trip 삭제/사용자 삭제 시 처리 정책을 둔다. summary는 메시지 수 또는 token 추정량 기준으로 비동기 생성한다. tool call audit log는 일반 대화보다 더 오래 보관할 수 있지만, undo 가능 기간과는 분리한다.
- API 반영 지점: `ai.ai_chat_sessions.summary`, `ai.ai_chat_messages`, `ai.ai_tool_calls`.
- 확인 필요: 사용자에게 AI 대화 삭제 기능을 제공할지.

#### P2-4. 법정동 sync admin endpoint와 실패 재처리

- 왜 필요한가: 지역 데이터는 trip region 선택의 기준 데이터다. sync 실패나 폐지 지역 반영 오류가 있으면 여행방 지역 선택과 추천 범위가 흔들린다.
- Best practice 제안: 자동 sync job과 sync log를 기본으로 두고, 관리자 수동 재시도 endpoint는 운영 단계에서 추가한다. 실패 로그에는 source, file name, count, error message를 저장하고, 재시도는 idempotent하게 설계한다.
- API 반영 지점: `geo.legal_region_sync_logs`, 향후 `/admin/legal-regions/sync-runs`.
- 확인 필요: 원천이 파일 업로드인지 외부 API인지.

#### P2-5. rate limit 정책과 quota key

- 왜 필요한가: 로그인, OAuth, 추천, 장소 검색, Mapbox route matching은 abuse와 비용 리스크가 크다. 특히 외부 provider 호출은 서비스 비용으로 직결된다.
- Best practice 제안: endpoint 그룹별 quota key를 다르게 둔다. 인증은 IP+email, 일반 API는 user, trip 협업 write는 user+trip, Mapbox/KTO 호출은 user+provider 또는 trip+provider 기준으로 제한한다. rate limit 초과는 `429`와 `Retry-After`를 반환한다.
- API 반영 지점: 모든 외부 호출성 endpoint, `ProblemDetails(code=RATE_LIMITED)`.
- 확인 필요: MVP에서 Redis 기반 rate limiter를 포함할지.

#### P2-6. OpenAPI schema generation과 backend build 연결

- 왜 필요한가: 현재 `openapi.yaml`은 수동 초안이다. 백엔드 구현이 시작되면 코드와 문서가 어긋날 수 있다.
- Best practice 제안: 초반에는 `.agent/contracts/openapi.yaml`을 contract source로 두고, backend controller/schema가 이를 만족하는지 CI에서 검증한다. 구현이 안정되면 Springdoc 등으로 생성한 OpenAPI와 contract 파일의 diff를 검증한다. 프론트 타입 생성은 tagged release 또는 PR 단위로 고정된 OpenAPI 파일에서 수행한다.
- API 반영 지점: `.agent/contracts/openapi.yaml`, backend CI, frontend API client generation.
- 확인 필요: source of truth를 수동 contract 파일로 유지할지, backend generated OpenAPI로 전환할지.
