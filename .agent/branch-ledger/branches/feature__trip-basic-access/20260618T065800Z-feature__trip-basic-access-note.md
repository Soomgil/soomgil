---
id: 20260618T065800Z-feature__trip-basic-access-note
branch: feature/trip-basic-access
branchKey: feature__trip-basic-access
createdAt: 2026-06-18T06:58:00.835Z
baseRef: develop
scope: backend
status: ready
---

# 김지훈 백엔드 완료 조건 보완

## 배경

- 이 브랜치에서만 필요한 AI 문맥을 기록합니다.
- 다른 브랜치의 ledger를 참조하지 않습니다.

## 변경 요약

- record PATCH의 생략 필드 유지와 명시적 null 삭제 조건을 체크리스트에 추가했습니다.
- itinerary 참조와 media 소유권/상태/연결 충돌 검증 조건을 추가했습니다.
- WebSocket 인증 principal, trip 구독 권한, 서버 활성 session ID 검증 조건을 추가했습니다.
- nullable undo snapshot과 transaction commit 이후 broadcast 조건을 추가했습니다.
- Docker/Testcontainers context test 통과 전에는 persistence 기능을 최종 완료 처리하지 않도록 명시했습니다.
- Docker PostgreSQL에서 전체 190 tests, Flyway migration, MyBatis context와 핵심 persistence 통합 테스트가 통과했습니다.
- 최종 리뷰에서 UUID type handler, invite 원자성/재가입, DML returning cache, media 중복 연결, WebSocket session 전달/정리, admin 권한을 보완했습니다.

## 에이전트 주의사항

- backend 제품 코드는 `backend` submodule의 `feature/trip-basic-access` 브랜치에서 관리합니다.
- backend submodule pointer는 child repo PR merge 후 orchestration repo에서 한 번에 갱신합니다.
- 인증 principal/JWT 발급은 윤정의 `auth`와 `global/security` 담당 범위에 의존합니다.
- 다중 backend instance 배포 시 WebSocket session registry는 Redis 등 공유 저장소로 교체해야 합니다.

## develop 통합 시 반영할 내용

- 체크리스트의 추가 완료 조건을 공통 정책으로 유지합니다.
- 김지훈 TODO 13개는 Docker 기반 `./gradlew clean test` 통과를 근거로 완료 처리합니다.
