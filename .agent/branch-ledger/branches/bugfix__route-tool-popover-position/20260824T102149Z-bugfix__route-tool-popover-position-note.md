---
id: 20260824T102149Z-bugfix__route-tool-popover-position-note
branch: bugfix/route-tool-popover-position
branchKey: bugfix__route-tool-popover-position
createdAt: 2026-08-24T10:21:49.966Z
baseRef: develop
scope: shared
status: active
---

# 작업 기록

## 배경

- `/trips/{id}/route` 좌측 일정 패널 토글과 지도 자유 그리기의 실시간 품질을 개선합니다.
- 빠른 입력에서 선이 직선처럼 보이고, 완료 후 preview와 영구 drawing이 서로 다른 좌표로 겹쳐 보이는 문제를 해결합니다.

## 변경 요약

- 좌측 일정 패널의 열기/닫기 버튼을 같은 108x42 알약형 컨트롤로 통일했습니다.
- 자유 그리기를 polyline 대신 입력 좌표를 통과하는 부드러운 SVG cubic path로 표시합니다.
- drawing preview와 영구 저장이 같은 곡률 보존 좌표를 사용하며, preview 좌표 제한을 32개에서 100개로 상향했습니다.
- `END`/`CANCEL` preview는 update throttle과 무관하게 즉시 중계합니다.

## 에이전트 주의사항

- preview 좌표 제한은 frontend와 backend 모두 100개이며 `.agent/docs/api/api_spec.md`와 일치시켜야 합니다.
- 균일 간격 추출로 되돌리면 긴 곡선의 굴곡이 소실되므로 `simplifyPathToLimit`의 곡률 보존 방식을 유지합니다.

## develop 통합 시 반영할 내용

- frontend/backend submodule commit과 orchestration pointer를 함께 통합합니다.
- develop에서 branch ledger 인덱스를 재생성하고 공통 API 문서의 preview 좌표 제한 변경을 유지합니다.
