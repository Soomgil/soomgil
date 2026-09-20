---
id: 20260918T153429Z-feature__onboarding-preference-map-tour
branch: feature/onboarding-preference-map-tour
branchKey: feature__onboarding-preference-map-tour
createdAt: 2026-09-18T15:34:29.614Z
baseRef: develop
scope: shared
status: draft
---

# 신규 사용자 취향 온보딩과 지도 섹션 안내

## 배경

- 신규 사용자의 취향 데이터가 없는 콜드 스타트를 가입 직후 필수 10개 관광지 평가로 줄입니다.
- 지도 첫 진입 시 화면의 주요 영역만 가볍게 설명하는 coachmark를 제공합니다.

## 변경 요약

- 태그가 준비된 서로 다른 제주 관광지 10개를 versioned 설문으로 고정했습니다.
- 가입 설문과 일반 취향 수집이 동일한 `SwipePage` 카드·상세 패널·세 방향 제스처 UI를 공유합니다.
- 10개 `LIKE`/`NOPE`/`SUPER_LIKE` 전체 제출을 원자적으로 저장하고 `ONBOARDING` 근거를 일반 반응의 3배로 반영합니다.
- 기존 사용자는 migration 시 완료 처리하고, 이후 가입한 활성 사용자는 설문 완료 전 다른 화면 진입을 막습니다.
- 지도 화면의 일정, 지도, 지도 도구, 여행방 관리, 협업 도구를 설명하는 최초 1회 안내와 다시 보기 버튼을 추가했습니다.
- API/OpenAPI/DBML/제품 정책의 source multiplier를 `ONBOARDING=3.0`, 나머지 `1.0`으로 동기화했습니다.
- frontend commits: `5e2d5df` (`feat(frontend): add preference onboarding and map tour`), `b9eec93` (`feat(preference): reuse swipe UI for onboarding`)
- backend commits: `dc6cf8f` (`feat(preference): add required onboarding survey`), `a45645a` (`feat(preference): allow onboarding super likes`)

## 검증

- 프론트엔드 온보딩·스와이프 관련 Vitest: 3 files, 14 tests 통과.
- 프론트엔드 production build 통과.
- 백엔드 온보딩 및 회원가입 관련 테스트 통과.

## develop 통합 시 반영할 내용

- `frontend`와 `backend` submodule 변경을 함께 통합해야 합니다.
- 배포 시 Flyway `V54__create_onboarding_preference_survey.sql`, `V55__allow_super_like_onboarding_response.sql` 순서로 적용되어야 합니다.
