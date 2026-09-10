---
id: 20260910T035310Z-feature__planning-collision-protection-note
branch: feature/planning-collision-protection
branchKey: feature__planning-collision-protection
createdAt: 2026-09-10T03:53:10.967Z
baseRef: develop
scope: shared
status: ready
---

# 메모 동시 수정 충돌 방지

## 배경

- 공동 메모를 두 사용자가 동시에 수정할 때 나중 저장이 먼저 저장된 내용을 조용히 덮어쓰는 문제를 막습니다.
- 합의 범위는 메모의 충돌 방지이며 체크리스트 last-write-wins와 planning undo/redo는 유지합니다.

## 변경 요약

- `planning.trip_notes.version`을 런타임 DB와 API DTO에 연결했습니다.
- 메모 upsert/delete가 `baseVersion`을 조건으로 갱신하고 불일치 시 `PLANNING_VERSION_CONFLICT`를 반환합니다.
- 프론트는 작성 중 실시간 변경이나 409 충돌을 받아도 로컬 초안을 보존하고 최신 메모 다시 불러오기를 제공합니다.
- 저장 응답보다 최신 실시간 이벤트가 먼저 도착해도 이전 응답으로 상태를 되돌리지 않으며, 처리 중 날짜 전환과 편집을 잠급니다.
- 저장하지 않은 메모에서 다른 날짜로 이동할 때는 초안을 버릴지 확인합니다.
- AI 메모 tool도 실행 직전 최신 note version을 읽고 같은 충돌 규칙을 적용합니다.

## 에이전트 주의사항

- 메모의 신규 저장 version은 1이고, 아직 메모가 없는 scope의 `baseVersion`은 0입니다.
- 메모·체크리스트 mutation의 `itineraryVersion`과 command event 필드는 null이며 undo/redo flags는 false입니다.
- 체크리스트에는 이번 변경으로 version이나 undo/redo를 추가하지 않습니다.

## develop 통합 시 반영할 내용

- 공통 API/제품 계약에서 메모 resource version, 체크리스트 last-write-wins, planning undo/redo 제외 결정을 유지합니다.
