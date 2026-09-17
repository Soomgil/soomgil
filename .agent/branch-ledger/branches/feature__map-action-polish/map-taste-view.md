# 지도 취향 보기 · 투표 안내 축소

## 구현
- 투표 안내: 11px, padding 5px 9px, 작은 말풍선. 클릭 닫기 유지.
- 지도 상단 취향 보기: 내 취향 / 동료 취향(프로필별 필터) / 함께 좋아한 곳(공개 가능한 멤버 2명 이상), 슈퍼라이크 필터.
- 실제 LIKE/SUPER_LIKE만 조회. 태그 기반 추천 API와 분리.
- 한 WebP 배경 변경과 독립적인 지도 기능. 일정 마커는 유지하고 취향 마커는 하트/별, 48px 이내는 묶어서 선택.
- 필터 변경은 카메라 이동 없음. 장소 선택은 기존 상세/일정 추가에 연결.
- 모바일 하단 패널은 지도 도구 위에 배치.

## API / 권한 / 한계
- GET /api/v1/trips/{tripId}/preference-places?bbox=west,south,east,north
- ACTIVE 여행 멤버 접근 확인 후 해당 ACTIVE 멤버의 최종 반응만 조회.
- 본인 / PUBLIC / PRIVATE 중 승인된 팔로워에게 허용된 사용자. 공개되지 않는 동료 이름과 반응은 응답에 포함하지 않음.
- DB에 저장된 좌표가 있는 KTO 관광지 최대 200개. 외부 API 및 scheduler 호출 없음. 화면 열기/수동 재검색 시 조회.
- DB 스키마 변경 없음. 신규 계약/handler/mapper 한국어 JavaDoc 및 OpenAPI 갱신.

## 검증
- 구현 전 누락 컴포넌트/mapper 및 marker 테스트 실패 확인.
- 관련 frontend 104개 통과, stale response 테스트 추가 3개 통과.
- backend handler 권한/잘못된 범위/빈 멤버, PostgreSQL 임시 컨테이너의 실제 MyBatis 조회 검증 통과.
- SQL 검증: PUBLIC, PRIVATE, 승인/대기 팔로워, 본인, 지도 범위, NOPE 제외, 멤버 제한, record 매핑.
- Desktop 1440 / mobile 390 fixture 브라우저에서 패널 범위/필터 확인. 실제 지도 타일은 fixture 검증 범위 외이며 마커/카메라는 Mapbox mock 테스트로 검증.
- 임시 PostgreSQL 컨테이너 soomgil-taste-qa는 검사 후 삭제됨.

## 최종 결과
- 프론트 전체 435개 테스트 및 production build 통과. 하네스/API integrity/smoke 통과.
- 실행 중인 localhost:8080/v3/api-docs에서 /api/v1/trips/{tripId}/preference-places 반영 확인.
- Backend commit ab01e4d. Child PR 병합 전이므로 orchestration submodule pointer는 stage하지 않음.

