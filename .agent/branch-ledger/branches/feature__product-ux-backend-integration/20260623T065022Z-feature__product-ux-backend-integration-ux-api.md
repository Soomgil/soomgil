---
id: 20260623T065022Z-feature__product-ux-backend-integration-ux-api
branch: feature/product-ux-backend-integration
branchKey: feature__product-ux-backend-integration
createdAt: 2026-06-23T06:50:22.714Z
baseRef: develop
scope: shared
status: complete
---

# 마이페이지 설정 기록 일정 UX 및 API 상태 동기화

## 배경

- 2026-06-23 사용자 요청의 MyPage, Settings, Record, Home, Swipe, Route UX 문제를 실제 API 경계 위에서 보완했습니다.
- backend에는 이미 로그인 세션, 공개 community GET, 저장 장소, 인기 장소, itinerary 삭제·재정렬 계약이 있어 새 endpoint 없이 frontend 상태 동기화를 수정했습니다.

## 변경 요약

- MyPage 여행기 직접 모달, 프로필 공유, 공개 범위 표시, 저장 전 프로필 사진 미리보기와 장소 이미지 fallback을 추가했습니다.
- Settings의 중복 이름·소개 편집을 제거하고 언어 select, 실제 로그인 세션·보안 활동 중심 UI로 정리했습니다.
- Record 사진을 최대 10장까지 한 record 요청으로 업로드하도록 바꾸고 다중 미리보기·개별 제거 UI를 추가했습니다.
- Home 정적 상단 배너를 community/인기 장소 API 기반으로 전환하고 Super-like TOP 3 이동 경로를 실제 검색으로 연결했습니다.
- Swipe 카드 텍스트를 제한된 스크롤·말줄임 구조로 보완했습니다.
- 추천 패널에서 서버 북마크 상태와 일정 추가 여부를 표시하고 중복 추가를 막았습니다.
- itinerary drag 경로 중복을 제거하고 순서 저장을 직렬화했으며 Mapbox marker transform 충돌을 제거했습니다.

## 에이전트 주의사항

- 저장 장소는 SUPER_LIKE 이후에만 backend 저장이 허용되는 기존 정책을 유지합니다.
- 일차 삭제는 backend 정책에 따라 비어 있는 일차만 허용합니다.
- community 조회 라우트와 backend GET endpoint는 비로그인 접근 허용 상태를 검증했습니다.

## develop 통합 시 반영할 내용

- frontend 36개 파일 182개 테스트와 production build 통과.
- backend `gradlew test --no-daemon` 통과.
- UI inventory 재생성 및 `harness:check` 통과.
