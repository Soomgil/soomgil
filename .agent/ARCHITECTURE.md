# 숨길 상위 아키텍처

숨길 저장소는 상위 AI 하네스가 frontend와 backend를 일관성 있게 다루도록 설계된 orchestration repo입니다.

## 워크스페이스

| 경로 | 상태 | 역할 |
| :--- | :--- | :--- |
| `.agent/` | active | 하네스 문서, 워크스페이스 매니페스트, 생성 인벤토리, 검사 스크립트 |
| `frontend/` | active | Vue 3 제품 앱 submodule. 화면, 상태, API client와 frontend 테스트 관리 |
| `backend/` | active | Spring Boot 제품 앱 submodule. API, persistence와 backend 테스트 관리 |

## 경계 원칙

- 루트는 제품 런타임 코드를 직접 소유하지 않습니다.
- 프론트엔드 제품 코드는 `frontend/` submodule 안에서 완결됩니다.
- 백엔드 제품 코드는 `backend/` submodule 안에서 완결됩니다.
- 제품 코드 변경은 각 submodule repo에서 커밋하고, orchestration repo는 submodule pointer와 `.agent/`를 관리합니다.
- 루트 정적 HTML/CSS/JS 목업은 활성 기준에서 제거합니다.
- `.agent/workspaces.json`을 단일 진실 공급원으로 사용합니다.
- Git Flow, commit convention, submodule 운영은 `.agent/docs/process/git_workflow.md`를 따릅니다.
- `.agent/docs/` 루트에는 `index.md`만 두고, 상세 지식은 역할별 하위 폴더와 `.agent/contracts/`에 둡니다.

## 하네스 계층

1. Workspace layer: `.agent/workspaces.json`으로 frontend/backend 경계와 상태를 정의합니다.
2. Inventory layer: `.agent/tools/build-ui-knowledge.mjs`가 frontend 라우트, 페이지, 컴포넌트, API, 상태, 스타일을 읽어 생성 인벤토리를 만듭니다.
3. Check layer: `.agent/tools/harness-check.mjs`가 루트 경계, 문서 폴더 구조, 필수 문서, 라우트-페이지 연결, 환경 파일 위생을 검사합니다.
4. Smoke layer: `.agent/tools/smoke-local.mjs`가 `frontend/dist`를 서빙해 SPA 라우트 응답을 확인합니다.

## 통합 검증 확장

- frontend unit/component/E2E test 명령을 workspace 검증에 연결합니다.
- backend build/test 명령을 orchestration 하네스에 연결합니다.
- `.agent/contracts/openapi.yaml`, backend controller와 frontend client의 diff 검사를 추가합니다.
