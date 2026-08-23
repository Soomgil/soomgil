---
id: 20260823T100816Z-chore__product-policy-realignment-note
branch: chore/product-policy-realignment
branchKey: chore__product-policy-realignment
createdAt: 2026-08-23T10:08:16.689Z
baseRef: develop
scope: shared
status: active
---

# 작업 기록

## 배경

- 이 브랜치에서만 필요한 AI 문맥을 기록합니다.
- 다른 브랜치의 ledger를 참조하지 않습니다.

## 변경 요약

- 회원가입 관광지 10개, 홈 관광지 배경, 여행방 스티커 투표를 최신 제품 흐름으로 확정했습니다.
- 세 선호도 수집 경로의 source multiplier를 모두 `1.0`으로 통일했습니다.
- 전역 기록/취향 탭 제거, 커뮤니티 쓰레드 전환, 지도 이미지·스티커·커서·잠금 정책을 문서화했습니다.
- 제품 요구사항, 선호도 정책, backend 결정, DBML, OpenAPI/API 명세를 함께 갱신했습니다.

## 에이전트 주의사항

- `backend/` 서브모듈의 기존 수정은 이 브랜치 작업 범위가 아니므로 보존합니다.
- 현재 프론트 라우트는 전환 전 구현이며 목표 라우트는 `product_experience_policy.md`를 기준으로 후속 구현합니다.
- legacy `community.posts`와 전역 record API는 migration 호환용으로만 남아 있습니다.

## develop 통합 시 반영할 내용

- 통합 후 `npm --prefix .agent run branch:index`로 ledger 인덱스를 재생성합니다.
- frontend/backend 구현 브랜치는 이 계약의 vote, preference event, thread, map overlay/presence 항목을 기준으로 분리합니다.
