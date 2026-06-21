---
id: 20260621T065741Z-feature__place-search-detail-note
branch: feature/place-search-detail
branchKey: feature__place-search-detail
createdAt: 2026-06-21T06:57:41.670Z
baseRef: develop
scope: frontend
status: ready
---

# 프론트 장소 취향 추천 연결

## 배경

- 민경철 담당 backend의 장소 탐색, 취향 반응, 여행 추천, media 계약을 frontend 사용자 흐름에 연결한다.
- 기존 일정 편집 화면은 유지하고 장소 탐색 영역만 실제 API로 교체한다.

## 변경 요약

- 장소 검색과 장소 상세 조회를 실제 `/places` API에 연결했다.
- 스와이프 feed를 조회하고 `NOPE`, `LIKE`, `SUPER_LIKE` 최종 반응을 저장한다.
- 반응 저장 실패 시 현재 카드를 유지하고 재시도할 수 있다.
- 일정 추가 패널에서 기본 추천, 슈퍼라이크 추천, 직접 검색을 전환할 수 있다.
- 추천 장소 상세 조회, 저장/저장 취소, 일정 추가를 기존 Route 화면 흐름에 연결했다.
- media는 upload URL 발급, object storage 직접 PUT, metadata 등록 순서로 업로드한다.
- frontend commit은 `721e70d`, `6bb3d22`, `0bf4381`, `9d26af2`, `88b07fa`다.
- frontend 전체 테스트 15개와 production build를 통과했고 데스크톱 화면에서 스와이프와 장소 추천 패널을 확인했다.

## 에이전트 주의사항

- 추천 응답의 내부 점수는 화면에 노출하지 않고 추천 이유와 매칭 멤버만 표시한다.
- Route 화면의 기존 mock 일정과 지도 로직은 김지훈 담당 범위이므로 이 브랜치에서 교체하지 않았다.
- frontend와 backend submodule pointer 변경은 로컬 orchestration 상태이며 root commit에 포함하지 않는다.
- frontend 제품 기능은 별도 `feature/place-search-detail` 브랜치에 커밋되어 있다.

## develop 통합 시 반영할 내용

- frontend `feature/place-search-detail`을 검토 후 frontend `develop`에 통합한다.
- root `develop` 또는 `main`에서 submodule pointer와 generated branch ledger를 통합 정책에 맞게 갱신한다.
