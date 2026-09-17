---
id: 20260916T131417Z-feature__swipe-card-details-note
branch: feature/swipe-card-details
branchKey: feature__swipe-card-details
createdAt: 2026-09-16T13:14:17.258Z
baseRef: develop
scope: shared
status: draft
---

# 취향 수집 사진 탐색과 애니메이션, 홈 상단 검색, 인기 여행기 캐러셀

## 배경

- 사용자 요청으로 홈 검색 위치를 최상단으로 확정했다.
- 취향 수집의 사진 목록은 같은 장소의 다른 사진을 뜻한다.

## 변경 요약

- SwipePage: 설명과 장소 정보를 우측 패널로 이동, 손그림 방향 가이드 복원, Travel Preferences 표기.
- 사진 썸네일과 이전/다음 선택을 복원하고 저장 성공 후 하트·별·고리 애니메이션을 적용했다. 동작 줄이기 환경은 효과를 생략한다.
- HomePage: 검색을 home-gallery 첫 요소로 배치했다.
- CommunityPage: 인기 사진 한 장과 설명, 6초 자동재생, 이전/다음 및 일시정지 컨트롤을 추가했다.
- 테스트 18개, production 빌드, harness 검사 통과. Playwright로 320/390/1440px 사진 탐색 및 390/1440px 커뮤니티 확인.

## 에이전트 주의사항

- 실제 수정 경로는 soomgil-home-award/frontend이며 원래 soomgil/frontend의 별도 미커밋 작업은 보존한다.
- API는 시각 검증에서 fixture를 사용했다. 캐러셀은 hover, 키보드 포커스, 비활성 탭에서 자동 전환을 멈춘다.

## develop 통합 시 반영할 내용

- frontend PR 병합 후 root의 submodule pointer 갱신. 현재 병합하지 않았다.

## 장소 상세 모달 후속 변경 (2026-09-17)

- 사진 중심 고정 높이 모달, 썸네일 높이 스타일 분리, 상세 정보 내부 스크롤 및 스크롤바 숨김.
- 반응 순서 SUPER_LIKE / LIKE / NOPE, 낙관적 UI와 실패 롤백, 이전 모달 요청 응답 무시.
- GET /places/{provider}/{externalPlaceId}/swipe-reaction 추가. 인증 사용자의 DB 반응을 조회해 재진입 상태 복원.
- 저장 성공 시 취향 수집 피드 캐시를 초기화해 다음 진입에서 최신 상태 조회.
- 프론트 상세 테스트 5개와 백엔드 조회 handler 테스트, compileJava 통과. 사진/모달 높이/닫기는 fixture 기반 브라우저 검증.
- 로컬 backend 컨테이너를 재시작해 추가 API 반영. DB schema 변경 없음.

- 최신 요청: 모바일 메인 사진은 contain으로 원본 전체 표시, 썸네일 영역 72px 분리. 데스크톱은 cover로 채움. 스크롤바는 숨기되 휠/터치/자동 스크롤 유지.


## 관광 API 최적화 및 최종 사진 배치 (2026-09-17)

- 사진 contain 및 원본 비율에 따른 높이, 사진 바로 아래 썸네일 배치로 하단 공백 축소. 사용자 확인 완료.
- 목록 DB 우선, 미수집 목록 한 페이지, 상세·이용 정보 지연 조회. 외부 모달 반응은 기존 피드를 초기화하지 않고 해당 항목에만 반영.
- V52 성공 원천 응답 영속 캐시, V53 원천 수정 시각/수동 갱신 표시. 초기 V52가 로컬에 적용되어 체크섬을 유지하고 후속 필드를 V53으로 분리.
- PostgreSQL 잠금으로 동일 요청 수집 병합, 실패/할당량 제한 cooldown. 스케줄러와 자동 갱신은 없음.
- 관광 전용 seed CLI export/import/refresh. 실제 PostgreSQL 중복·반복 적용·오래된 seed·roundtrip 검증과 Python 4 tests 통과.
- frontend 416 tests 중 전체 실행에서 드로잉 대용량 테스트 1건 timeout, 해당 파일 단독 재실행 16 tests 통과. frontend production build, harness check 통과.
- 로컬 V52/V53 migration 성공. seeds/local/tourism.json으로 관광지 153개/이미지 165개/성공 응답 11개 export 및 dry-run 성공(시점별 수집량은 달라질 수 있음).
- 기존 Redis 단편 캐시 일괄 이관은 하지 않음. DB 우선 목록은 전체 최신 외부 목록을 보장하지 않음. 명시적 수동 갱신 또는 seed 갱신 사용.

- 최종 API 관련 backend 54 tests 통과. schema.dbml PostgreSQL 변환 및 최종 harness 검사 통과.

- 최종 backend 재기동 및 /actuator/health HTTP 200 확인. 별개 기존 Gemini 태그 추출에서 401 인증 오류 관찰(API 키 변경하지 않음).


## 브리핑·알림 및 커뮤니티 보기 방식 (2026-09-17)

- 사용자 확정: 한국 시간의 오늘 일정 + 가장 가까운 미래 일정, 여행 초대 + 투표 시작·결과 알림.
- 헤더를 화이트·하늘색 패널로 통일, 날짜/여행명/방문 순서, 빈 상태/실패 재시도, Escape 및 모바일 폭 대응.
- 미읽음 숫자는 서버 전체 개수. 활성 탭 30초 간격 및 포커스 복귀 시 갱신하며 외부 관광 API 호출은 없음. 전체 읽음·삭제·초대 이동을 연결.
- voting 공개 포트와 notification adapter 연결. 같은 트랜잭션에서 활성 참여자만 저장, 세션/종류/수신자 고정 ID로 중복 방지. 과거 알림은 해당 세션 결과 조회, 새 투표에 소급 생성하지 않음.
- 커뮤니티 최근 글 기본 그리드, 리스트 토글. 전환 시 검색/페이지 유지 및 재조회 없음. 정사각 사진·흰 종이 테두리·넓은 하단 여백의 폴라로이드, 사진 없음/오류 표지 지원.
- 홈 검색 버튼은 하늘색 단색/아이콘/기존 입력창과 일관된 높이를 제안만 했고 변경하지 않음.
- 먼저 실패 테스트를 확인한 뒤 구현. frontend 관련 43 tests, backend 33 tests(실제 PostgreSQL 알림 범위·중복 방지 포함), frontend build 통과.
- 전체 frontend에서는 420 pass/1 fail: 별도 작업의 Mapbox NavigationControl 제거와 기존 addControl 기대값 충돌. 해당 별도 변경과 Community 인기 제목 제거, RoutePage 다른 UI 수정은 그대로 미커밋 상태로 보존.
- 1440/390/320px Playwright fixture로 브리핑/알림/그리드/리스트 및 읽음/닫기 확인. 실제 운영 계정으로 초대·투표 알림을 발송하지 않음.
- backend 재시작 후 health HTTP 200 확인. 마이그레이션 추가 없음. 한국 시간 nearest 쿼리는 실제 PostgreSQL EXPLAIN 통과.

## 2026-09-17 Home search visual refinement
- Applied home-only hanji ivory surface, thin border, restrained shadow, modest corner radius and muted blue-gray search button; matched recent-search dropdown.
- Updated placeholder to 어떤 한국의 풍경을 만나고 싶나요? Existing search routing/history preserved.
- Validation: HomePage 9 tests passed, frontend production build passed, harness passed. Mock-only browser QA verified 1440/390/320 widths, styles, recent searches, Escape and no horizontal overflow; mobile screenshot inspected.

- Follow-up: restored capsule search field/button, hid redundant leading icon, softened shadow and rounded history dropdown. Home tests 9 passed, build passed, browser QA at 1440/390/320 passed; screenshot inspected. Frontend commit 4299ec9.

- Follow-up: white capsule search surface with soft blue #487DB5 button, #396A9E hover, pale blue-gray border and matching focus/history colors. Production build and fixture browser QA at 1440/390/320 passed; mobile screenshot inspected.

- Unified My Trips, Community and Search page controls using shared scoped travel-page-actions.css: soft-blue capsule primary actions and selected filters, white outlined secondary actions, matching focus/hover/search surfaces and carousel controls. Existing unrelated Community changes preserved. Validation: 24 page tests passed; production build passed; mocked browser QA at 1440/390/320 passed; travel/search mobile screenshots inspected.

- Header: fresh white/sky palette, transparent utility buttons, sliding selected-menu pill retained across page shell remounts; responsive ResizeObserver alignment and reduced-motion support. User requested removing glass effect: final pill is opaque pale sky blue with a defined border. Header tests 12 passed; build passed; browser verified actual active CSS transition across navigation, alignment at 1440/768/390/320 and reduced motion. Screenshot inspected.

- Header utility buttons: unified pale sky circular surfaces, thin borders and stronger hover/open states for briefing, notifications and profile. Profile exposes expanded state. Header 12 tests, build and responsive browser checks passed.

- Community grid/list toggle now slides its selection pill using the header easing and 420ms duration, with reduced-motion support. Existing toggle test and build passed; fixture browser verified intermediate translation, duration and responsive layout at 1440/390/320. Color inversion scope pending user clarification.
