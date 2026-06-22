---
id: 20260622T063145Z-feature__recommendation-weight-plan-note
branch: feature/recommendation-weight-plan
branchKey: feature__recommendation-weight-plan
createdAt: 2026-06-22T06:31:45.594Z
baseRef: develop
scope: shared
status: complete
---

# 작업 기록

## 배경

- recommendation weight 실행 계획의 140줄 이후 요구사항을 코드·DB·테스트와 대조해 완료한다.

## 변경 요약

- 문서와 달랐던 discrimination 공식, matched threshold, SUPER_LIKE 가중치와 정렬을 교정했다.
- REAL_USER 통계는 이벤트 로그, 사용자 projection은 최종 반응을 사용하도록 책임을 분리했다.
- 합성 이벤트 source를 V37 migration과 DB 제약으로 명시했다.
- schema DBML, 서울·대전 seed 호환 버전과 실행 오류를 함께 정리했다.
- backend 구현 커밋: `cd08701` (`feat(preference): complete recommendation weight policies`)

## 에이전트 주의사항

- preference API에는 다른 멤버의 세부 점수·근거·태그 가중치를 추가하지 않는다.
- 추천 런타임에 AI client, award photo, rarity, semantic/tree depth를 scoring 입력으로 넣지 않는다.
- 기능 브랜치에서 다른 branch ledger를 읽거나 수정하지 않는다.

## develop 통합 시 반영할 내용

- backend submodule의 `feature/recommendation-weight-plan` 커밋으로 pointer를 갱신한다.
- `.agent/contracts/schema.dbml`의 synthetic source와 SUPER_LIKE evidence 설명을 반영한다.
- 통합 후 `npm --prefix .agent run branch:index`를 실행한다.
