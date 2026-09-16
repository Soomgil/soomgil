---
id: 20260913T165524Z-feature__community-trip-voting-vote-region-selection-and-candidate-count
branch: feature/community-trip-voting
branchKey: feature__community-trip-voting
createdAt: 2026-09-13T16:55:24.986Z
baseRef: develop
scope: shared
status: draft
---
# vote region selection and candidate count

## 배경

- 투표 시작 화면은 버튼 없이 URL로만 진입할 수 있었고, 지역 검색은 `geo.legal_regions`가 비어 항상 0건이었다. 여행은 지역 없이 만들어졌고,
  투표 후보는 여행방 지역 대신 대표 목적지 문자열 검색으로만 만들어졌다.
- 원인은 두 겹이었다. (1) 법정동 코드가 그대로 KTO API `areaCode`로 전달돼 지역 필터가 항상 비었고, (2) KTO 라이브 조회가 제주(`39`)로 고정돼
  다른 지역은 후보가 0개였다. 여행 상세 `regions`도 어디에서도 채워지지 않았다.

## 변경 요약

### backend
- place: `LegalRegionKtoAreaPolicy`(법정동 시도 → KTO areaCode), `LegalRegionKtoCodeResolver`(시군구 이름 → `tourism_source.guguns`),
  `TourismSourceRegionRepository`/`TourismSourceRegionMapper`, `TourismPlaceLiveSearchRequest.sigunguCode`, KTO 클라이언트 `sigunguCode` 파라미터와
  `liveAreaCode` 제주 고정 해제, `TourismSourcePlaceRegionCandidateQueryHandler`가 변환기를 거쳐 조회.
- geo: `FindLegalRegionsByCodesQuery/Handler`, `LegalRegionQueryRepository.findLegalRegionsByCodes`(mapper XML `IN` 조회).
- voting: `OpenVoteSessionRequest.legalRegionCodes`(최대 20, 각 10자리), command/controller 전달, 지역 폴백·거절 규칙, `voting.vote_session_regions`(V49)
  snapshot, `TripVoteSessionDetail.regions`(`TripVoteRegion`), 조립기·조회 핸들러 반영.
- preference: `ListTripVoteCandidatesQuery.regionCodes` override.
- trip: `TripDetailView.regions` + `FindTripDetailHandler`가 geo 공개 query로 이름을 채움, 두 컨트롤러가 `TripDetail.regions` 매핑. (다른 담당 모듈이지만
  기능이 막혀 최소 변경으로 고침. 10인자 호환 생성자로 기존 호출은 그대로 컴파일된다.)
- migration: `V48__seed_region_baseline.sql`(법정동 시도 17 + 서울·부산·대전·제주 시군구 48, KTO `sidos`/`guguns` 기준값, sync 로그),
  `V49__create_vote_session_regions.sql`.

### frontend
- `OwnerVoteSetupPanel`: 투표 지역 칩(여행방 지역 prefill, `LegalRegionCombobox`로 추가/제외), 후보 수 스텝퍼(5~30), 스티커·선정 개수는 후보 수 이하,
  지역·목적지 모두 없으면 시작 비활성.
- `TripVotePage`: 여행 상세의 `regions`/`displayDestination`을 패널에 전달, 방장 `투표 마감` 버튼을 스티커 보드에서 상단 진행 현황 옆으로 이동.
- `VoteStickerCart`: 제출 버튼 문구 `스티커 N개로 제출하기` → `제출하기`, 마감 버튼 제거.
- `MyTripsPage`: 여행 생성 시 검색 결과에서 고른 지역 필수, 방장 카드 `투표` 버튼. `RoutePage`: 좌측 여행 카드 방장 `투표 시작/현황/결과` 버튼.
- 1024px 이하 `내 여행` 레이아웃 붕괴(히어로 480px 공백·우측 쏠림·헤더 메뉴 잘림) 수정.

## 검증 결과

- backend 유닛 테스트: trip·place·geo·voting·preference 297개 중 Testcontainers 통합 테스트 30개(컨테이너 안에 Docker 없음)만 실패, 나머지 전부 통과.
  새 테스트: `LegalRegionKtoAreaPolicyTest`, `LegalRegionKtoCodeResolverTest`, `TourismSourcePlaceRegionCandidateQueryHandlerTest`,
  `FindLegalRegionsByCodesHandlerTest`, `KtoTourismPlaceClientTest`(sigungu·areaCode 통과), `OpenVoteSessionHandlerTest`(override·폴백·거절·snapshot),
  `PreferenceListTripVoteCandidatesQueryHandlerTest`(override), `FindTripDetailHandlerTest`(regions).
- Flyway: 로컬 DB에 V48·V49 적용 확인(`legal_regions` 65, `guguns` 48, `vote_session_regions` 생성).
- HTTP E2E(라이브 KTO): 서귀포시 override → 후보 6/6 서귀포 주소, 강남구 override → 8개 중 7개 강남구 주소, 해운대구 폴백 → 5/5,
  지역·목적지 없음 → 422 `VOTE_CANDIDATE_POOL_INSUFFICIENT`, `["123"]` → 400 `VALIDATION_FAILED`, 중복 시작 → 409, `GET /trips/{id}` regions 이름 포함.
- frontend vitest 393개 중 392 통과(실패 1개는 기존 `RoutePage` AI 재시도 테스트, 이 변경 전부터 실패), `npm run build` 통과.

## 남은 일 / 주의

- 통합 테스트는 Docker가 있는 환경에서 다시 돌려야 한다.
- `RoutePage` 아바타 툴팁이 `member.role`로 방장을 판별해 방장이 "멤버"로 표시된다(김지훈 영역, 미수정).
- 시군구 KTO 코드 기준값은 서울·부산·대전·제주만 있다. 다른 시도의 시군구는 시도 범위로 넓혀 조회된다(정식 원천 import 시 자동 정밀화).

### 후속: 모달 투표와 개수 제안 (2026-09-14)
- 가드의 강제 이동 제거. 투표는 지도 위 모달(`components/voting/TripVoteFlow.vue`, 페이지 본문을 추출)로 열리고, 미제출이면 자동 1회 오픈 + 빨간 카드 버튼/상단 배너.
- `OwnerVoteSetupPanel`: 질문은 하루 개수 하나. 일수 × 하루 개수로 선정, ×2로 후보(6~24), ÷4로 스티커(3~8)를 제안. 지역 칩은 유지.
- 결과 → `AI에게 일정 배치 맡기기` → 모달 닫고 AI 패널 오픈 + 프롬프트 채움. `RoutePage`가 `?panel=ai&aiPrompt=`도 처리.
- 전역 `.modal-overlay`는 `.show`가 있어야 보이므로 투표 오버레이에 `show is-open`을 준다(우측 탭바가 클릭을 가로채던 원인).
- 검증: vitest 400개 중 399 통과(잔여 1개는 기존 RoutePage AI 재시도), build 통과. 라이브: `/route` 진입 시 URL 유지·모달 자동, 닫기 → 경고, 배너로 재오픈, 시작 패널 제안값(3일·하루 3곳 → 9/18/5), 제출 → 자동 종료(동점 2위 둘 다 선정) → 결과 모달 → AI 입력 채움.
- 참고: 미지원 경로 요청이 404가 아니라 500(`NoResourceFoundException`)으로 응답한다(전역 예외 처리, 기존 동작).

### 후속: 생성 직후 투표 모달과 스티커 에셋 (2026-09-16)
- 여행 생성 → `router.replace(Route, { voteSetup: '1' })`. `RoutePage`는 방장·세션 없음일 때만 설정 모달을 자동 오픈. 설정 패널에 `지금은 나중에 할게요`(`later` emit) 추가.
- 스티커 6종 SVG(`public/vote-stickers/`), `voteStickerCatalog.ts`, `VoteStickerMark.vue`. 덱 사진 위 겹침(최대 8, 회전), 보드 도트를 스티커 자리로 교체(미사용은 흐림).
- 검증: 호스트 vitest 405/405, build 통과. (컨테이너에서 실패하던 RoutePage AI 재시도 테스트는 호스트에서 통과 — 컨테이너 환경 flake로 판단)
