---
id: 20260623T003736Z-feature__frontend-api-integration-fei-141-180-fei-141-180-frontend-api-integration
branch: feature/frontend-api-integration-fei-141-180
branchKey: feature__frontend-api-integration-fei-141-180
createdAt: 2026-06-23T00:37:36.776Z
baseRef: develop
scope: frontend
status: ready
---

# FEI 141-180 frontend API integration

## 배경

- 이 브랜치에서만 필요한 AI 문맥을 기록합니다.
- 다른 브랜치의 ledger를 참조하지 않습니다.

## 변경 요약

- FEI-141~143 커뮤니티 조회·작성·스와이프 실제 API 흐름과 test를 보강했습니다.
- FEI-150 미사용 `UserProfileModal`을 제거하고 `UserProfilePage`로 단일화했습니다.
- FEI-160·170 AI·알림의 빈 응답, pagination, 실패·재시도를 검증했습니다.
- FEI-171 인증/reset link token, route alias, OAuth·서버 오류 안내를 보강했습니다.
- FEI-180 production mock import와 hard-coded API method를 막는 AST 검사를 harness에 연결했습니다.

## 에이전트 주의사항

- frontend 변경은 `frontend/` submodule에서 먼저 merge한 뒤 root pointer를 갱신합니다.
- backend worktree의 `feature/gms-gemini-integration` 미커밋 변경은 별도 작업이므로 stage하지 않습니다.

## develop 통합 시 반영할 내용

- `frontend:api-integrity` 검사와 FEI-141~180 완료 증거를 workboard에 통합합니다.
- UI inventory에서 제거된 `UserProfileModal`과 auth route alias를 반영합니다.
