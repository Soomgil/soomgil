---
id: 20260619T132309Z-feature__trip-basic-access-note
branch: feature/trip-basic-access
branchKey: feature__trip-basic-access
createdAt: 2026-06-19T13:23:09.934Z
baseRef: develop
scope: frontend-process
status: ready
---

# 프론트 역할 최종 검토 보완

## 변경 요약

- 공통 frontend 파일과 기반 작업에 단일 DRI를 지정했습니다.
- 인증/계정 생명주기, 관리자 moderation, 실시간 재접속/resync와 drawing preview 책임을 추가했습니다.
- record route의 trip context, 초대 딥링크와 누락된 도메인 API/type 소유권을 명시했습니다.
- frontend workspace를 `active`로 전환하고 오래된 planned/빈 submodule 설명을 현재 상태로 갱신했습니다.
- frontend build는 통과했지만 기존 `package-lock.json` 불일치로 `npm ci`가 실패해 재현 가능한 설치 정리를 선행 TODO로 추가했습니다.

## 에이전트 주의사항

- `3명 합의`는 리뷰 규칙이며 구현 책임을 대신하지 않습니다. 공통 영역도 문서에 지정된 DRI가 작업을 주도합니다.
- frontend 기능 완료 판정에는 active workspace의 build와 SPA smoke가 실제로 실행되어야 합니다.
- 현재 `/record` route는 backend trip-scoped record API와 맞지 않으므로 김지훈 작업에서 `/trips/:tripId/records`로 이동합니다.
