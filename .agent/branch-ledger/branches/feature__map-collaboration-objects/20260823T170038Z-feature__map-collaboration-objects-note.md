---
id: 20260823T170038Z-feature__map-collaboration-objects-note
branch: feature/map-collaboration-objects
branchKey: feature__map-collaboration-objects
createdAt: 2026-08-23T17:00:38.271Z
baseRef: develop
scope: map-collaboration
status: ready
---

# 지도 협업 오브젝트 구현

## 배경

- 지도 좌표 공간에서 스티커·이미지 오브젝트를 공동 편집하는 역할 3 범위입니다.
- 계약, backend, frontend를 같은 기능 브랜치로 동기화했습니다.

## 변경 요약

- 지도 오브젝트 정식 REST 경로와 meter 기반 transform 저장 계약을 구현했습니다.
- 12종 SVG 스티커, 안전한 MAP_OVERLAY 이미지 처리, 15초 편집 lease를 구현했습니다.
- 접속자 커서, reconnect snapshot 복구, 줌·회전·피치 투영 UI를 구현했습니다.

## 에이전트 주의사항

- 단일 backend 인스턴스 MVP이므로 lease/presence는 interface 뒤의 인메모리 저장소입니다.
- 다중 인스턴스 배포 전 Redis와 외부 STOMP broker로 교체해야 합니다.

## develop 통합 시 반영할 내용

- `.agent/contracts/`와 API 문서 변경을 공통 계약으로 유지합니다.
- 통합 후 branch ledger 인덱스를 다시 생성합니다.
