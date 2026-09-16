# B4 — 장소 스티커 투표

의존: B0(전국 추천 + stage). 관련 질문: **Q3**(만료 시간), **Q4**(만료 방식), **Q5**(화면 위치), **Q6**(후보 수), **Q7**(반응 종류).
결정 완료: 종료 3종(전원/방장/만료) 모두, 1인도 투표 진행, 투표는 취향 반응으로도 저장(source='trip-vote' 의미).

## V47 마이그레이션 초안 (Q3/Q7 확정 후 미세 조정)

```sql
CREATE SCHEMA IF NOT EXISTS vote;

CREATE TABLE vote.place_vote_sessions (
  id uuid PRIMARY KEY,
  trip_id uuid NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'OPEN',
  legal_region_code varchar(10),
  bbox varchar(80) NOT NULL,
  expires_at timestamptz,
  closed_at timestamptz,
  closed_reason varchar(20),
  created_by_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT vote_sessions_status_check CHECK (status IN ('OPEN','CLOSED')),
  CONSTRAINT vote_sessions_closed_reason_check
    CHECK (closed_reason IS NULL OR closed_reason IN ('ALL_VOTED','OWNER_CLOSED','EXPIRED'))
);
CREATE UNIQUE INDEX uq_vote_sessions_open_trip ON vote.place_vote_sessions (trip_id) WHERE status = 'OPEN';

CREATE TABLE vote.place_vote_candidates (
  id uuid PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES vote.place_vote_sessions (id) ON DELETE CASCADE,
  provider varchar(40) NOT NULL,
  external_place_id varchar(120) NOT NULL,
  place_name varchar(500) NOT NULL,
  address varchar(500),
  lat double precision, lng double precision,
  thumbnail_url text,
  sort_order integer NOT NULL DEFAULT 0,
  UNIQUE (session_id, provider, external_place_id)
);

CREATE TABLE vote.place_vote_ballots (
  id uuid PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES vote.place_vote_sessions (id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES vote.place_vote_candidates (id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reaction varchar(20) NOT NULL,
  sticker_code varchar(20),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (candidate_id, user_id),
  CONSTRAINT vote_ballots_reaction_check CHECK (reaction IN ('LIKE','NOPE'))
);
CREATE INDEX idx_vote_ballots_session_user ON vote.place_vote_ballots (session_id, user_id);

CREATE TABLE vote.place_vote_member_progress (
  session_id uuid NOT NULL REFERENCES vote.place_vote_sessions (id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (session_id, user_id)
);
```

sticker_code는 `mapStickerCatalog.ts`의 12종 코드 재사용 (HEART/STAR/...) — 시각 표현용 (Q7 권장안 기준).

## 백엔드 — 신규 `vote` 도메인 (planning 모듈이 구조 템플릿)

패키지: `com.soomgil.vote` — `api / application(command|query) / infrastructure/persistence`.
planning처럼 트랜잭션 커밋 후 STOMP 발행 (`WebSocketPlanningEventBroadcaster` 패턴 복사).
멤버 검증: `TripMemberAccessCheckerAdapter` 패턴 → `TripAccessGuard.requireActiveMember`.

### API

```
POST   /api/v1/trips/{tripId}/vote-sessions            — 세션 시작 (OPEN 세션 있으면 409 or 기존 반환)
GET    /api/v1/trips/{tripId}/vote-sessions/current    — 세션+후보+내 투표+집계+진행자 수
PUT    /api/v1/trips/{tripId}/vote-sessions/{sid}/ballots/{candidateId}  — {reaction, stickerCode} upsert
POST   /api/v1/trips/{tripId}/vote-sessions/{sid}/completion             — 나 투표 끝 (progress upsert)
POST   /api/v1/trips/{tripId}/vote-sessions/{sid}/close                  — 방장 수동 종료
```

### 세션 시작 핸들러

1. trip의 legal_region_code(trip_regions 첫 행) 또는 요청 bbox로
   `ListPlaceRecommendationsQueryHandler.handle()` 직접 주입 호출 (B0-1로 legalRegionCode 지원됨) → 상위 N개(Q6).
2. 추천이 N 미만이면 `PlaceViewportCandidateQueryHandler`(비개인화 후보)로 채움.
3. 후보 INSERT + 세션 INSERT(expires_at = now()+Q3값) + trip stage=VOTING(이미면 무시).

### 투표 핸들러

- ballot upsert 후 **기존 취향 파이프라인에도 반영**:
  `UpsertSwipeReactionCommandHandler.handle(new UpsertSwipeReactionCommand(provider, externalPlaceId, reaction, null))` 직접 호출.
  (source 구분은 user_swipe_events.feed_context가 현재 미사용이므로 생략 가능 — 필요하면 command에 안 얹고 그대로.)
- 발행: `/topic/trips/{tripId}/vote` — `{type:'ballot.updated', candidateId, counts:{like,nope}, votedBy}`.

### 종료 판정 (3종)

- **전원 완료**: completion POST 때 ACTIVE 멤버 수(=`ListTripMembersHandler`)와 progress 수 비교 → 같으면 종료.
- **방장 종료**: close POST (OWNER 검증 — `TripAccessGuard`에 owner 검증 메서드 있는지 확인, 없으면 trip 조회로).
- **만료**: Q4 권장안 = GET/PUT 진입 시 `expires_at < now()`면 종료 처리 (lazy).
- 종료 처리 공통: status=CLOSED + closed_reason + **B5 초안 생성 오케스트레이터 호출** + trip stage=DRAFTED +
  `/topic/trips/{tripId}/vote`에 `{type:'session.closed', reason}` 발행.

## 프론트 — 신규 페이지 (Q5 권장안)

- 라우트: `/trips/:tripId/vote`, name `TripVote`, requiresAuth.
- `api/vote.api.ts` 신규.
- 화면: 후보 카드 그리드. 카드에 스티커 팔레트(`mapStickerCatalog` 재사용 — `stickerHref()`로 SVG 심볼) —
  스티커 선택=LIKE(+sticker_code), 별로 버튼=NOPE. 카드에 멤버들의 스티커가 겹쳐 붙는 시각화.
- 상단: 진행 상태 (n/전체 멤버 완료), 방장에게만 [투표 종료] 버튼, 만료 카운트다운.
- [내 투표 완료] 버튼 → completion POST.
- STOMP 구독: `stompTransport.subscribe('/topic/trips/'+tripId+'/vote', ...)` —
  RoutePage.test.ts에 구독 테스트 패턴 다수.
- `session.closed` 수신 → 초안 생성 안내 모달 → `RoutePage`로 이동.

## 테스트 / 완료 기준

- 백엔드: 종료 판정 3종 단위 테스트 (핸들러 생성자 주입이라 mock 쉬움 — `KtoListAwardPhotosQueryHandlerTest`처럼 Clock 주입해 만료 테스트).
- 1인 여행: 후보 전부 반응 → completion → 즉시 CLOSED(ALL_VOTED) → 초안 생성 확인.
- 투표가 `preference.user_place_reactions`에도 반영되는지 DB 확인.
- 2계정(demo01/demo02) 동시 접속 실시간 반영 수동 확인.
