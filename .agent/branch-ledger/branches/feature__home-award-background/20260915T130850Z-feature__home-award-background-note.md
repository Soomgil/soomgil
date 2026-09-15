---
id: 20260915T130850Z-feature__home-award-background-note
branch: feature/home-award-background
branchKey: feature__home-award-background
createdAt: 2026-09-15T13:08:50.498Z
baseRef: develop
scope: shared
status: complete
---

# 홈 수상작 배경 재설계

## 배경

- 사용자가 검색창과 수상작 전체 배경으로 홈을 재설계하고 새 브랜치에서 구현하도록 요청했습니다.
- 원래 frontend 작업 폴더에 다른 디자인 작업의 미커밋 변경이 있어 별도 worktree를 만들었습니다.
- 상위/프론트엔드 모두 develop에서 feature/home-award-background를 분기했습니다.

## 변경 요약

- content-container 전체와 인기 장소/여행/스토리 API 호출을 제거했습니다.
- 검색 범위 선택, 최근 검색어 최대 5개 저장/삭제, 검색 결과 라우팅을 제공합니다.
- 수상작 배경은 수동 순환하며 촬영지/작품명/작가/수상 부문/출처를 표시합니다.
- 사진 API 및 이미지 실패에도 검색은 유지되며 다시 불러오기를 제공합니다.
- AppShell/AppHeader의 immersive 옵션은 홈에서만 사용합니다. 전역 footer 스타일 충돌과 모바일 body 여백을 시각 검사에서 수정했습니다.
- 최초 기능 테스트 실패 확인 후 구현했습니다. 전체 59개 테스트 파일 415개 테스트 통과 후, 최근 검색/재시도 테스트 추가 및 최종 홈/헤더 12개 테스트 통과를 확인했습니다.
- production 빌드, harness:check, branch:check, SPA 20개 경로 smoke 검사를 통과했습니다.
- 실제 로컬 API 수상작으로 1440×900, 390×844 스크린샷을 확인했습니다. 320/768/1024px에서도 가로 넘침이 없습니다. 인증/기타 API는 브라우저 검증에서만 fixture를 사용했습니다.

## 에이전트 주의사항

- 실제 수상작 사진은 원격 URL을 그대로 사용합니다. QA 스크린샷 PNG는 로컬 검토용으로만 남기며 Git에서 제외합니다.
- AwardPhoto에는 정확한 provider/externalPlaceId와 초점/모바일 크롭 메타데이터가 없어 좋아요 및 사진별 구도 조정은 포함하지 않았습니다.
- 기존 작업 폴더의 변경은 그대로 보존했습니다. 새로운 코드는 D:/vscode-workspace/soomgil-home-award/frontend에 있습니다.

## develop 통합 시 반영할 내용

- 프론트엔드 PR이 merge된 뒤 상위 저장소 submodule pointer를 갱신합니다. 이번 작업에서는 merge/push하지 않습니다.
- merge 완료 후 작업 브랜치를 로컬/원격에서 삭제하는 저장소 정책을 따릅니다.
