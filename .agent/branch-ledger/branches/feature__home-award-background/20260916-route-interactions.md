# 지도 작업공간 상호작용 개선 (2026-09-16)

- 테마 label 전체 클릭 처리 및 pointerdown 시 focusout으로 팝오버가 먼저 닫히는 문제 방지. 라디오 키보드 조작 유지.
- 지도 경로 연결 중 카메라 자동 맞춤 차단, 장소 순서에 독립적인 fit 키 적용. 일차 선택과 좌표 변경의 기존 맞춤 유지.
- 경로 모드에서 장소 표시 목록을 필터링하지 않아 관광지 카드 유지. 연결 가능 여부 검증은 유지.
- 좌측 패널과 일차 배경 불투명 흰색. 장소 수, 카드 경계, 연결 해제 텍스트/키보드 접근 개선.
- pointer capture를 시작 시 확보, 취소/Escape/blur 정리. 삽입선이 대상 위치를 밀어내는 현상 제거. 선택 객체 z-index 100001, 연결 그룹 100000.
- 검증: RoutePage/MapboxItineraryMap 100 tests, production build, harness checks; Edge QA fixture로 row click, 실제 마우스 순서 변경 요청, 취소, 일차 layering, 지도 카드 유지, 1440/390 폭 검증. 5종 Mapbox 스타일 HTTP 200 및 도구 전환 시 테마 유지 확인.
- 테마 성능 조사: Mapbox 직결 클라이언트 렌더링과 브라우저/CDN 캐시 구조여서 서버 Redis 추가 효과 제한적. https://docs.mapbox.com/help/dive-deeper/api-caching/ . 현재 스타일 유지; 같은 스타일의 paint/config 변경 방식은 별도 디자인 선택이 필요. 즉시 렌더링 보장하지 않음.
- QA는 격리된 mock 여행 데이터 사용, 실제 사용자 일정 변경 없음.
