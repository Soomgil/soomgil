# 브랜치별 AI 문서 운영

이 프로젝트는 여러 브랜치의 AI 에이전트 문맥이 섞이지 않도록 브랜치 ledger를 사용합니다.

Git Flow, commit convention, submodule 운영은 `.agent/docs/process/git_workflow.md`를 따릅니다.

## 읽기 규칙

- 모든 브랜치에서 공통 하네스 문서(`AGENTS.md`, `.agent/AGENTS.md`, `.agent/docs/`)는 읽을 수 있습니다.
- 기능 브랜치에서는 `.agent/branch-ledger/branches/<currentBranchKey>/`만 읽습니다.
- 기능 브랜치에서는 다른 브랜치의 ledger를 읽지 않습니다.
- `develop`과 `main`은 통합 브랜치로 간주하며, 통합 작업 때 모든 ledger를 읽을 수 있습니다.
- `frontend/`, `backend/` submodule 내부 AI 문서가 아니라 orchestration repo의 `.agent/` 문서를 기준으로 작업합니다.

## 쓰기 규칙

- 기능 브랜치의 AI 맥락은 `npm --prefix .agent run branch:note -- --title "제목"`으로 새 파일에 기록합니다.
- 기능 브랜치에서는 `.agent/docs/generated/branch_ledger.*`를 수정하지 않습니다.
- 공통 문서로 승격해야 하는 내용은 merge 후 `develop`에서 반영합니다.
- `develop`에서 공통 문서를 수정한 경우 각 기능 브랜치는 rebase 또는 merge로 최신 하네스를 받아야 합니다.

## 통합 규칙

- merge 후 통합 브랜치에서 `npm --prefix .agent run branch:index`를 실행합니다.
- 생성된 `.agent/docs/generated/branch_ledger.md`와 `.agent/docs/generated/branch_ledger.json`은 통합 결과 확인용입니다.
- 공통 규칙으로 남길 내용만 `.agent/docs/`에 정리합니다.

## 에이전트 체크리스트

1. 작업 시작 전 `npm --prefix .agent run branch:status`를 실행합니다.
2. 현재 브랜치가 기능 브랜치이면 다른 브랜치 ledger를 보지 않습니다.
3. 작업 중 생긴 브랜치 고유 맥락은 branch note로 남깁니다.
4. 완료 전 `npm --prefix .agent run branch:check`와 `npm --prefix .agent run harness:check`를 실행합니다.
