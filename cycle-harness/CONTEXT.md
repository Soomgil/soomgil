# 검증된 컨텍스트 스냅샷 (2026-08-31)

전부 실측·실행으로 확인한 사실이다. 재조사 금지.

## 환경 / 실행

- 모노레포: `soomgil`(orchestration) + `frontend/`, `backend/` git submodule. 셋 다 `develop`.
- 실행: `node start-soomgil.mjs both` (도커 컴포즈 full 프로필).
- **포트 충돌 주의**: 다른 프로젝트(iread)가 5173/8080/6379/1025를 쓸 수 있다.
  현재 기동 상태: frontend `5173`, backend `8180`, redis `6479`, mailpit `1125/8125`, postgres `5432`, minio `9000/9001`.
  환경변수로 오버라이드: `FRONTEND_PORT SERVER_PORT REDIS_PORT MAIL_PORT MAIL_WEB_PORT`.
- 도커 장애 이력: `%LOCALAPPDATA%\Docker\run\`의 고아 소켓 → `run.broken`으로 치우고 재부팅으로 해결.
- 테스트 계정: `demo01@soomgil.local` ~ `demo20`, 비번 `Soomgil123!`.
  (dev-seeds의 `*.@example.com` 계정은 해시가 더미라 로그인 불가.)
- 프론트 테스트: `cd frontend && npx vitest run` — 259개 통과가 기준선.
  기존 결함: `qrcode`/`html-to-image`/`exifr`가 node_modules에 없어 테스트 파일 4개 import 실패 → `npm install`로 해결.
- 백엔드: `cd backend && ./gradlew compileJava` / 단위 테스트는 `--tests` 지정 (통합 테스트는 Testcontainers=도커 필요).
- KTO API 키는 루트 `.env`의 `KTO_API_KEY` (설정됨). GMS Gemini 키도 `.env`에 있음 (`GMS_API_KEY`).

## 라이브 DB 실측 (soomgil-postgres-1)

| 항목 | 값 |
| :--- | :--- |
| `tourism_source.attractions` | 149건 — 서울(area 1) 40, 대전(3) 28, 제주(39) 81. 좌표 100% |
| `preference.place_tag_enrichments` SUCCEEDED | 2,422건 (대부분 제주) |
| attractions 중 enrichment 보유 | 109/149 |
| `geo.legal_regions` | 64건뿐 (SIDO 14, SIGUNGU 37, EUPMYEONDONG 13) — 희소함 |
| `tourism_source.contest_award_photos` | **0건** (스키마만 존재) |
| `trip.trips` 컬럼 | start/end date 없음 — 날짜는 itinerary_days에서 MIN/MAX 파생 |
| demo 계정 | 20개 존재 확인 |

## 수상작 API 실측

- `PhokoAwrdService/phokoAwrdList`: 총 95건, 전부 `Type1`(출처표시 의무), org/thumb 이미지 100%.
- `numOfRows=200` 1회로 전량. 필드: contentId, koTitle, lDongRegnCd, koFilmst, filmDay, koCmanNm, koWnprzDiz, koKeyWord, orgImage, thumbImage, cpyrhtDivCd 등.
- `koFilmst` = `"행정구역, 관광지명"` — 마지막 쉼표 뒤가 장소명.
- 매칭 실측 (`data/award-place-matches.json`): EXACT 36 + PARTIAL 37 = **73쌍 사용 가능**, NO_RESULT 22.
- 매칭된 contentId 중 enrichment SUCCEEDED는 **6개뿐** → 온보딩 장소는 사전 enrichment 필요.
- `lDongRegnCd=12`는 "전남광주통합특별시" — legal_regions에 대응 코드 확인 필요. 빈 값 3건.

## 아키텍처 핵심 사실

- 백엔드: 도메인별 CQRS. `api/ → application/command|query(dto+handler) → domain → infrastructure`.
  MyBatis: preference 등은 XML(`src/main/resources/mappers/<domain>/`), auth는 어노테이션(@Select) 방식.
- JavaDoc 한국어 정책: `.agent/docs/process/javadoc_policy.md`. 탭 인덴트.
- Flyway 최신 V43. **V44부터 예약제 — README 표 참조.**
- 스와이프 반응 저장 경로 (온보딩·투표 모두 재사용):
  `PUT /api/v1/places/{provider}/{externalPlaceId}/swipe-reaction` → `PreferenceUpsertSwipeReactionCommandHandler`
  → user_place_reactions upsert + user_swipe_events 로그 + SUPER_LIKE→saved_places + 태그 증거 ± + preference_score 재계산.
  주의: `SwipeReactionRequest.source`는 현재 **서버에서 무시**된다 (컨트롤러가 안 읽음).
- **enrichment 자동 생성**: `SwipeTagPreparationService.prepare(places)`가 미보유/stale 장소를
  `SwipeTagEnrichmentQueue`에 넣어 Gemini로 비동기 생성. 첫 호출 PENDING → 이후 READY.
  → 온보딩 10곳은 이걸 1회 호출하면 enrichment가 자동으로 만들어진다.
- 멤버 합의 추천 (투표 후보 소스): `PreferenceListPlaceRecommendationsQueryHandler`
  — ACTIVE 멤버 전원 태그점수 곱 (BASIC) / SUPER_LIKE 수 (SUPER_LIKE 탭). bbox 필수(`validate()` L402).
  후보는 `TourismSourcePlaceViewportCandidateQueryHandler` → `fetchLive` (라이브 KTO API).
- **치명 제약**: `KtoTourismPlaceClient.liveAreaCode()` (L642)가 **제주(39)만 지원** —
  다른 지역 bbox면 fetchLive가 빈 목록 → 추천이 제주 밖에서 전부 빈다. B0에서 반드시 해소.
- 일정 초안: `AiItineraryToolService.addPlace(tripId, userId, baseVersion, input)` —
  `input.itineraryDayId=null`이면 UNSCHEDULED("일차 미정") 그룹 자동 탐색/생성 후 추가. AI 불필요.
  `itinerary_days.group_type IN ('DAY','UNSCHEDULED')` (V7).
- 여행 생성: `POST /api/v1/trips` → `CreateTripHandler` — title/displayDestination/legalRegionCodes.
  멤버 권한 검증 재사용: `TripAccessGuard.requireActiveMember(tripId, userId)` (planning의 어댑터 패턴 참조).
- 실시간: STOMP `/topic/trips/{tripId}/{channel}` — 채널: itinerary, planning, chat, ai, presence, map-drawings.
  발행 패턴: `WebSocketPlanningEventBroadcaster` (commit 후 발행). 프론트: `src/realtime/stompTransport.ts`.
- `/me`: `AuthController`→`GetCurrentUserQueryHandler` (auth 도메인!) — users+emails+profiles 조합 → `user.api.dto.User`.
  프론트 매핑: `frontend/src/types/auth.ts`의 `mapBackendUser()`.
- 스티커: `frontend/src/components/map/mapStickerCatalog.ts` — 12종 SVG 심볼. 현재는 지도 낙서용.
- 프론트 스와이프 큐: `swipe.store.ts` QUEUE_CAPACITY=10 — **삭제 금지** (RoutePage PlaceDiscoveryPanel, MyPage가 사용).

## 1차 구현 완료분 (커밋됨 — 세 repo 모두 `feature/award-photo-hero` 브랜치, origin 푸시 완료)

수상작 홈 히어로. 동작 화면까지 검증 완료. develop 미머지 상태 — PR은 아직 안 만듦.
후속 작업(B0~)은 이 브랜치에서 이어가거나, develop 머지 후 `feature/guided-trip-flow`로 분기.

backend 신규: `place/api/AwardPhotoController.java`, `place/api/dto/AwardPhoto.java`,
`place/application/port/AwardPhotoCatalogClient.java`, `AwardPhotoCatalogItem.java`,
`place/application/query/dto/ListAwardPhotosQuery.java`, `query/handler/ListAwardPhotosQueryHandler.java`,
`KtoListAwardPhotosQueryHandler.java`(촬영지 분해+일일 회전), 테스트 2개.
backend 수정: `KtoAwardPhotoClient`(parseCatalog 추가, numOfRows 200, 캐시키 v2), `SecurityConfig`(award-photos permitAll).
frontend 신규: `api/award.api.ts`, `types/award.ts`. 수정: `pages/HomePage.vue`(히어로=수상작+출처 오버레이).

API: `GET /api/v1/award-photos?limit=&regionCode=` — 인증 불필요. 응답 필드:
awardContentId, title, placeName, regionName, filmLocation, photographer, awardDivision,
filmYearMonth, imageUrl, thumbnailUrl, copyrightCode, regionCode.

## 결정 완료된 제품 사항

- 온보딩: 가입 후 전용 라우트 강제, 좋아요/별로 2지선다 10장, 기존 사용자도 미완료면 1회 요구(데이터 보존).
- 투표 종료: 전원 완료 / 방장 종료 / 시간 만료 **3종 모두**, 먼저 도달한 것.
- 1인 여행: 투표 그대로 진행 (전원 완료 즉시 충족).
- 초안: 득표 장소 전부 **UNSCHEDULED(일차 미정)**에 투입. 일차 배분·동선 최적화 안 함.
- 수상작 사용처: 랜딩/로그인/홈 + 온보딩 10 + 목적지 미정 지역 선택. 여행방 투표(③)는 일반 관광지 소스.
- 탭 제거: 헤더 `기록`, `취향 수집`.
