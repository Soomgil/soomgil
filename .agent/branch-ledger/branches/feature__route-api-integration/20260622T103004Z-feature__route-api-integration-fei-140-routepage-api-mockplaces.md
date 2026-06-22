---
id: 20260622T103004Z-feature__route-api-integration-fei-140-routepage-api-mockplaces
branch: feature/route-api-integration
branchKey: feature__route-api-integration
createdAt: 2026-06-22T10:30:04.108Z
baseRef: develop
scope: shared
status: draft
---

# FEI-140: RoutePage API 연동 완료 (mockPlaces 제거)

## 배경

- 이 브랜치에서만 필요한 AI 문맥을 기록합니다.
- 다른 브랜치의 ledger를 참조하지 않습니다.

## 변경 요약

- `RoutePage.vue`에서 `mockPlaces` 의존성 제거
- 지도 상의 마커 클릭 및 장소 선택 시 서버의 `placeApi.getPlace`를 호출하도록 `selectPlace` 수정 및 캐싱 도입
- 상세 바(Detail Bar)에 API 로딩 상태(`<LoadingState>`) 및 장소 조회 실패 상태(`<ErrorState>`) 추가 대응

## 에이전트 주의사항

- `selectPlace`는 이제 `placeProvider`와 `placeId` 두 개의 인자를 받습니다. `MapboxItineraryMap` 컴포넌트의 emit 이벤트 시그니처도 이와 동일하게 변경되었습니다.
- 테스트 시 `placeProvider`가 `undefined`로 들어올 수 있으므로 주의해야 합니다.

## develop 통합 시 반영할 내용

- `frontend/src/pages/RoutePage.vue`
- `frontend/src/components/map/MapboxItineraryMap.vue`
- 관련 프론트엔드 테스트 코드(`MapboxItineraryMap.test.ts`)의 수정사항
