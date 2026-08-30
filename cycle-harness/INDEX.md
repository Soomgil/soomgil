# 작업 인덱스 — "X 해" 하면 여기부터

모든 작업 공통 선행 읽기: `CONTEXT.md` (환경·계정·검증 사실). 그 외에는 아래 목록**만** 읽고 시작한다.
경로 접두사: BE=`backend/src/main/java/com/soomgil/`, FE=`frontend/src/`.

## B0 블로커 (`briefs/B0-blockers.md`)

| 대상 | 읽기 |
| :--- | :--- |
| B0-1 지역 전국 지원 | `data/area-bboxes.json` · BE`place/infrastructure/external/KtoTourismPlaceClient.java` L100-145, L642-652 · BE`preference/application/query/handler/PreferenceListPlaceRecommendationsQueryHandler.java` L108-125, L402-414 · BE`place/application/query/handler/TourismSourcePlaceViewportCandidateQueryHandler.java` · BE`preference/api/PreferenceController.java` |
| B0-2 trip stage | BE`trip/domain/model/Trip.java` · BE`trip/application/command/handler/CreateTripHandler.java` · `backend/src/main/resources/mappers/trip/TripQueryMapper.xml` · BE`trip/api/dto/TripSummary.java` · FE`types/trip.ts` |

## B1 수상작 매칭 서빙 (`briefs/B1-award-pipeline.md`) — Q2 필요

`data/usable-award-place-pairs.json` · BE`place/application/query/handler/KtoListAwardPhotosQueryHandler.java` · BE`place/api/dto/AwardPhoto.java` · BE`tourismsource/imports/TourismSourceImportManifestLoader.java`(로더 패턴) · FE`types/award.ts`

## B2 온보딩 (`briefs/B2-onboarding.md`) — Q1, Q12 필요

`data/onboarding-candidates.md` · BE`auth/infrastructure/persistence/UserMapper.java` · BE`auth/application/handler/GetCurrentUserQueryHandler.java` · BE`user/api/dto/User.java` · BE`preference/application/service/SwipeTagPreparationService.java` · BE`preference/api/SwipeController.java`(반응 재사용 확인용) · FE`router/guards.ts` · FE`router/index.ts` · FE`types/auth.ts` L36-80 · FE`stores/auth.store.ts` · FE`api/swipe.api.ts`(react만) · FE`pages/HomePage.vue`(credit 스타일 복사원)

## B3 여행 마법사 (`briefs/B3-trip-wizard.md`) — B0-2, B1 선행

FE`pages/MyTripsPage.vue`(생성 모달 전체) · FE`api/geo.api.ts` · FE`api/award.api.ts` · BE`trip/application/command/handler/CreateTripHandler.java`

## B4 투표 (`briefs/B4-voting.md`) — Q3~Q7 필요, B0 선행

구조 템플릿: BE`planning/api/PlanningController.java` · BE`planning/application/service/TripMemberAccessCheckerAdapter.java` · BE`planning/infrastructure/websocket/WebSocketPlanningEventBroadcaster.java` · `backend/src/main/resources/db/migration/V10__create_planning_schema.sql`
소비 대상: BE`preference/application/query/handler/PreferenceListPlaceRecommendationsQueryHandler.java` · BE`trip/application/query/handler/ListTripMembersHandler.java`(시그니처만)
FE: `components/map/mapStickerCatalog.ts` · `realtime/stompTransport.ts` · `router/index.ts`

## B5 초안 생성 (`briefs/B5-draft-generation.md`) — Q8 필요, B4 선행

BE`ai/application/AiItineraryToolService.java` L74-115, L305-320 · BE`ai/application/AiAddRecommendedPlacesTools.java`(중복 skip 로직) · BE`itinerary/application/query/*FindItinerary*`(시그니처)

## B6 탭 정리 (`briefs/B6-cleanup.md`) — Q10 필요, 독립

브리프에 파일·라인 전부 명시 — 브리프만 읽고 실행.

## B7 홈/랜딩 (`briefs/B7-home-landing.md`) — Q11, Q13 필요, B1 선행

FE`pages/HomePage.vue`(1차 수정분 — 히어로/credit) · FE`pages/LoginPage.vue` · FE`pages/RegisterPage.vue` L27 · FE`pages/LandingPage.vue`(히어로만) · BE`place/application/query/handler/KtoListAwardPhotosQueryHandler.java` · BE`preference/application/query/handler/PreferenceSwipeFeedQueryHandler.java` L100(CurrentUserProvider null 패턴)

## 장기 하네스 참조 (필요할 때만)

- 커밋/브랜치 규칙: `.agent/docs/process/git_workflow.md`
- JavaDoc 규칙: `.agent/docs/process/javadoc_policy.md`
- 전체 계획 원본: `.agent/docs/exec-plans/active/2026-08-31-guided-trip-flow-plan.md`
