---
id: 20260619T131321Z-feature__trip-basic-access-note
branch: feature/trip-basic-access
branchKey: feature__trip-basic-access
createdAt: 2026-06-19T13:13:21.072Z
baseRef: develop
scope: frontend-process
status: ready
---

# 프론트엔드 3인 역할 배분

## 변경 요약

- 백엔드 도메인 소유권을 같은 도메인의 프론트 페이지, 컴포넌트, API, 상태와 타입 소유권으로 연결했습니다.
- 윤정은 auth/user/AI/chat/planning/community/notification, 김지훈은 trip/itinerary/Mapbox/collaboration/record, 민경철은 place/preference/swipe/recommendation/social/media를 담당합니다.
- 여러 도메인이 모이는 `RoutePage`, `HomePage`, `MyPage`는 한 명의 페이지 소유자와 도메인 컴포넌트 제공자로 분리했습니다.
- 현재 scaffold, mock data와 API 함수 선언은 기능 완료로 보지 않고 실제 API, 상태, 테스트와 E2E까지 완료 조건에 포함했습니다.

## 에이전트 주의사항

- 프론트 작업을 시작하기 전에 `.agent/docs/process/frontend_team_tdd_checklist.md`에서 담당 파일과 의존 컴포넌트를 확인합니다.
- 공통 파일과 다른 담당자의 Page를 직접 확장하지 않고 자기 도메인 컴포넌트/API/composable을 제공합니다.
- frontend 제품 코드는 `frontend/` submodule의 별도 기능 브랜치에서 작업하고 orchestration에는 문서와 merge 후 pointer만 반영합니다.
