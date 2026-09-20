# AI에게 전달하는 Orchestration 프로젝트 생성 요청서

아래 내용을 AI 코딩 에이전트에게 이 파일과 함께 전달하세요. Node.js 도구를 실행할 수 없는 환경에서도 동일한 구조를 수동으로 만들기 위한 대체 절차입니다.

## 내가 채울 값

- 프로젝트 이름: `<PROJECT_NAME>`
- 프로젝트 설명: `<PROJECT_DESCRIPTION>`
- 루트 저장소 URL: `<ROOT_REPO_URL 또는 아직 없음>`
- production 브랜치: `main`
- integration 브랜치: `develop`
- workspace 목록: `<WORKSPACE_NAME, PATH, REPO_URL, BRANCH의 반복 목록>`
- 각 workspace build/test 명령: `<COMMANDS>`

## AI 실행 요청

당신은 제품 코드를 직접 담지 않는 orchestration 저장소를 구성해야 한다. 먼저 현재 디렉터리와 Git 상태를 읽고, 기존 사용자 파일을 덮어쓰거나 삭제하지 마라. 충돌이 있으면 변경하지 말고 목록을 보고하라.

다음 결과를 만들어라.

1. 루트에는 `AGENTS.md`, `README.md`, `.gitignore`, `.gitmodules`, 통합 실행 설정과 `.agent/`만 둔다. 활성 제품 `src/`, `pages/`, `assets/`, `index.html`은 두지 않는다.
2. 사용자가 지정한 각 workspace는 별도 Git 저장소이며 루트에는 Git submodule로 연결한다. workspace의 역할, 프레임워크, 언어, 빌드 도구를 추측하거나 미리 정하지 마라. 원격 저장소가 아직 없다면 빈 폴더를 만들지 말고 `.agent/workspaces.json`에 `planned` 상태로만 선언한다.
3. 실제 원격과 브랜치가 존재하는 workspace만 `git submodule add -b <branch> <url> <path>`로 연결한다. URL이나 브랜치를 추측하지 마라.
4. `.agent/workspaces.json`을 workspace 이름, path, active/planned 상태, repo URL, 추적 브랜치와 선택적 플랫폼별 검증 명령의 단일 진실 공급원으로 만든다. 사용자가 제공하지 않은 기술 메타데이터는 추가하지 마라.
5. `.agent/docs/` 루트에는 `index.md`만 두고 세부 문서는 `architecture/`, `harness/`, `process/`, `generated/` 아래에 둔다. 공통 API·DB·event 계약은 `.agent/contracts/`에 둔다.
6. 짧은 루트 `AGENTS.md`와 상세 `.agent/AGENTS.md`, `.agent/ARCHITECTURE.md`를 만든다. 루트와 제품 저장소의 책임 경계를 명확히 적는다.
7. `.agent/docs/process/git_workflow.md`에 Git Flow, Conventional Commits, submodule pointer 갱신, child PR → root PR 순서, 검증 기준을 적는다.
8. `.agent/branch-ledger/branches/<currentBranchKey>/`에 브랜치별 append-only AI 기록을 두고, 기능 브랜치는 다른 브랜치 ledger와 `.agent/docs/generated/branch_ledger.*`를 수정하지 못하게 한다. `main`/`develop`에서만 인덱스를 재생성한다.
9. 외부 라이브러리 없는 Node.js 20+ 검사 도구를 `.agent/tools/`에 만든다. 최소한 root 제품 코드 침범, 필수 하네스 파일, workspace 경로, active submodule 여부, docs 루트 규칙, 다른 브랜치 ledger 오염을 검사한다.
10. Windows와 macOS에서 동작하도록 shell 문자열 대신 Node `spawnSync(command, args, { shell: false })`와 인자 배열을 사용한다. 운영체제별 실행 파일이 다른 경우에만 `command`와 `windowsCommand`를 분리한다.
11. `.agent/package.json`에 `branch:status`, `branch:note`, `branch:check`, `branch:index`, `harness:check`, `workspace:verify` 명령을 등록한다.
12. 자동 commit, push, remote 생성, 보호 브랜치 변경은 하지 않는다. 생성 후 사용자가 실행할 명령과 아직 필요한 URL/브랜치를 보고한다.

기능 개발의 표준 순서는 다음으로 고정한다.

`ticket 정의 → develop에서 동일 slug 브랜치 생성 → branch status 확인 → 공통 계약 선행 → 각 submodule test-first 구현/PR → child PR merge → root submodule pointer 갱신 → root 하네스/통합 검증 → root PR → develop에서 ledger 통합`

마지막에는 파일 트리, 설정한 workspace 표, 실행한 검증과 실패/미검증 항목을 간결하게 보고하라.
