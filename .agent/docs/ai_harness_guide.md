# AI 하네스 가이드

숨길의 AI 하네스는 루트에서 frontend와 backend를 같은 기준으로 이해하고 검증하기 위한 장치입니다.

## 1. 현재 상태

- `frontend/`: planned, 빈 submodule. 추후 Vue 앱 scaffold.
- `backend/`: planned, 빈 submodule. 추후 Spring Boot 앱 scaffold.
- `.agent/`: 상위 하네스와 문서.
- `soomgil`: orchestration repo. frontend/backend submodule pointer와 `.agent/`를 관리합니다.
- 루트 정적 HTML/CSS/JS는 활성 기준에서 제외합니다.

## 2. 작업 루프

1. `.agent/workspaces.json`에서 대상 워크스페이스와 상태를 확인합니다.
2. `npm --prefix .agent run branch:status`로 현재 브랜치에서 읽어도 되는 AI 문맥을 확인합니다.
3. 프론트가 active 상태이고 변경 대상이면 `.agent/docs/generated/ui_inventory.md`와 `frontend/src/router/index.ts`를 먼저 봅니다.
4. 구조나 라우트가 바뀌면 `.agent/docs/page_map.md`를 갱신합니다.
5. 브랜치 고유 맥락은 `.agent/branch-ledger/branches/<currentBranchKey>/`에 새 파일로 남깁니다.
6. `npm --prefix .agent run harness:index`로 인벤토리를 재생성합니다.
7. `npm --prefix .agent run harness:check`로 구조, 브랜치 ledger 경계, 빌드, smoke를 확인합니다.

## 3. 검사 범위

- 루트에 정적 제품 파일이 없는지 확인합니다.
- `frontend/`가 active 상태이면 Vue 앱 구조와 라우트-Page 연결을 확인합니다.
- `frontend/`가 planned 상태이면 빈 submodule 경계를 허용합니다.
- 환경 파일은 `.env.example`만 저장소에 남기고 실제 값은 `.env.local`로 둡니다.
- 기능 브랜치가 다른 브랜치의 AI ledger를 수정하지 않는지 확인합니다.
- `frontend`가 active 상태이면 `frontend/dist`를 로컬로 서빙해 SPA 라우트 응답을 확인합니다.

## 4. 브랜치별 AI 문서

- 운영 문서: `.agent/docs/branching_agent_docs.md`
- Git 운영 문서: `.agent/docs/git_workflow.md`
- 기록소: `.agent/branch-ledger/branches/<branchKey>/`
- 통합 인덱스: `.agent/docs/generated/branch_ledger.md`
- 기능 브랜치는 새 ledger 파일만 추가하고, 통합 브랜치가 merge 후 인덱스를 재생성합니다.

## 5. backend 활성화 시 확장

- backend build/test 명령을 `.agent/workspaces.json`에 추가합니다.
- API contract 검사 또는 OpenAPI/schema 검사를 하네스에 추가합니다.
- frontend API 클라이언트와 backend endpoint 매칭 검사를 추가합니다.
