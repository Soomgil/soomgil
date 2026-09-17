---
id: 20260917T021158Z-feature__map-action-polish-note
branch: feature/map-action-polish
branchKey: feature__map-action-polish
createdAt: 2026-09-17T02:11:58.688Z
baseRef: develop
scope: shared
status: draft
---

# 작업 기록

## 배경

- 이 브랜치에서만 필요한 AI 문맥을 기록합니다.
- 다른 브랜치의 ledger를 참조하지 않습니다.

## 변경 요약

- 

## 에이전트 주의사항

- 

## develop 통합 시 반영할 내용

- 

## 구현 및 검증
- 원본 워크트리에서 feature/map-action-polish 브랜치로 작업.
- 미제출 투표의 지도 상단 빨간 배너를 제거하고 투표 버튼 아래 흰색 팝업 카드로 이동. 버튼은 하늘색 맥동, reduced-motion에서는 정지.
- 검색 패널을 열면 하단의 동일한 일정 추가 버튼 자리에 커스텀 일정 토글 표시. 패널 본문은 스크롤 및 하단 여백 확보.
- 일정으로 복귀 버튼을 화이트/파랑 알약 형태로 통일.
- 먼저 실패하는 기존 동작 테스트 2개 확인 후 수정. RoutePage 79 tests, production build, full harness 통과.
- frontend 컨테이너를 원본 ./frontend bind mount로 재생성. backend 및 데이터 볼륨은 변경하지 않음.
- 제품 커밋은 frontend에 저장. 상위 pointer는 child PR 병합 전 갱신하지 않음.
