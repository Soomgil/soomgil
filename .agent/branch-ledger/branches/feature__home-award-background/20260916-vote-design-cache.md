# 지도 스타일 캐싱과 투표 모달 개편 (2026-09-16)

## 요청 및 적용
- 현재 5종 Mapbox 테마 유지. 메뉴를 열 때 스타일 JSON을 미리 요청하고 메모리 캐시를 15분 유지한다. URL+token별 요청 중복 방지, 8초 timeout, 오류/만료 시 기존 URL setStyle 방식 사용. 반환 JSON은 clone해 Mapbox 변형이 캐시에 전파되지 않게 한다. Redis와 타일 선로딩은 추가하지 않았다.
- 설정 순서를 지역 → 하루 방문 수 → 자동 계산 요약으로 변경. 화이트/하늘색 UI, 여행 정보, 범위에 따른 stepper 비활성화, sticky 시작 버튼, 목적지 fallback 안내.
- 결과 요약은 1위 큰 사진 한 행, 2/3위 강조 목록, 4/5위 축약 목록. 전체 보기 버튼으로 모든 후보 결과 표시 및 요약 복귀. 선정 여부와 실제 일정 ADDED/SKIPPED_DUPLICATE를 구분. 이미지 실패 fallback 및 새 세션 시 상태 초기화.
- 공통 투표 단계 색상/버튼 정리, 중복 닫기 제거, 모바일 sticky 액션 최소화.

## 검증
- 관련 6개 테스트 파일 138 tests 통과 후 cached JSON setStyle 통합 테스트 1개 추가: Mapbox 파일 22 tests 재검증 통과 (관련 합계 139).
- production build, git diff --check, harness:index/check 통과.
- check-vote-cache.cjs: Edge 실제 Mapbox 요청으로 사전 로딩 후 dark/light/dark 재선택 시 root style 추가 요청 0 확인. 초기 네트워크/타일/렌더링 소요 자체를 제거하거나 시간 개선 수치를 보장하지 않는다.
- 격리된 mock 여행/투표 및 실제 관광공사 사진 사용. 1440/390/320에서 setup/result 및 전체 8개 보기→5개 요약 복귀, 가로 overflow 검사/스크린샷 확인. 실제 사용자의 투표/일정 변경 없음.
- 캐시 구조 근거: https://docs.mapbox.com/api/maps/styles/ (Styles API freshness 15분).
