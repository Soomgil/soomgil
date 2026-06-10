# 에이전트 전용

AI 에이전트용 맥락, 문서, 인벤토리, 검사 스크립트는 `.agent/` 아래에서 관리합니다.

OpenAI Harness Engineering 원칙에 따라 이 파일은 짧은 지도 역할만 하며, 상세 지식은 `.agent/docs/`와 `.agent/contracts/`에 둡니다.

Git Flow, commit convention, submodule 운영 정책은 `.agent/docs/process/git_workflow.md`를 따릅니다.

브랜치별 AI 문맥은 `.agent/branch-ledger/branches/<currentBranchKey>/`에만 기록합니다.
기능 브랜치에서는 다른 브랜치의 ledger를 읽거나 수정하지 않습니다.
통합은 `develop` 또는 `main`에서 `.agent/docs/generated/branch_ledger.*`로 재생성합니다.

활성 프론트엔드 제품 코드는 `frontend/`에 둡니다.

`soomgil`은 orchestration repo이며, `frontend/`와 `backend/`는 각각 별도 repo submodule로 관리합니다.

백엔드는 추후 `backend/` 서브모듈로 연결할 예정이며, 상위 `.agent` 하네스가 `frontend`와 `backend`를 함께 다룹니다.

루트에는 정적 `index.html`, `pages/`, `assets/`, 제품 `src/`를 두지 않습니다.

`.agent/docs/` 루트에는 `index.md`만 두고 상세 문서는 역할별 하위 폴더에 둡니다.
