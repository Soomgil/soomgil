# 숨길(Soomgil)

> 스와이프로 취향을 모으고, 지도 위에서 함께 그리는 그룹 여행 설계 플랫폼

이 저장소는 숨길의 orchestration repo입니다. 상위 AI 하네스와 제품 서브프로젝트 submodule pointer를 관리합니다.

## 현재 구조

| 경로 | 상태 | 역할 |
| :--- | :--- | :--- |
| `.agent/` | active | frontend/backend를 함께 이해하기 위한 AI 하네스, 문서, 생성 인벤토리, 검사 스크립트 |
| `.agent/branch-ledger/` | active | 브랜치별 AI 문맥을 격리해 기록하는 Flyway식 ledger |
| `frontend/` | planned | 빈 프론트엔드 앱 submodule. 추후 Vue 앱 scaffold |
| `backend/` | planned | 빈 백엔드 앱 submodule. 추후 Spring Boot 앱 scaffold |

루트에는 정적 `index.html`, `pages/`, `assets/`, 제품 `src/`를 두지 않습니다. 정적 HTML/CSS/JS 목업은 더 이상 활성 제품 기준이 아닙니다.

## 주요 명령

| 명령 | 역할 |
| :--- | :--- |
| `npm --prefix frontend run dev` | 프론트엔드 scaffold 이후 개발 서버 실행 |
| `npm --prefix frontend run build` | 프론트엔드 scaffold 이후 production 빌드 |
| `npm --prefix .agent run branch:status` | 현재 브랜치에서 읽어도 되는 AI 문맥 확인 |
| `npm --prefix .agent run branch:note -- --title "제목"` | 현재 브랜치용 AI ledger 기록 생성 |
| `npm --prefix .agent run branch:check` | 다른 브랜치 ledger 오염 검사 |
| `npm --prefix .agent run branch:index` | develop/main에서 branch ledger 통합 인덱스 생성 |
| `npm --prefix .agent run harness:index` | 상위 AI 하네스 인벤토리 재생성 |
| `npm --prefix .agent run harness:check` | 워크스페이스 구조, branch ledger 경계, 프론트 빌드, 라우트 smoke 검사 |

## Backend Contracts

백엔드 구현 전 확정한 계약 결정은 여기서 바로 확인합니다.

| 문서 | 역할 |
| :--- | :--- |
| `.agent/contracts/README.md` | 백엔드 계약 문서 위치와 운영 규칙 |
| `.agent/contracts/backend_contract_decisions.md` | DBML/OpenAPI 생성 전 확정된 설계 결정 |
| `.agent/contracts/schema.dbml` | PostgreSQL 기준 V1 데이터 모델 |
| `.agent/contracts/openapi.yaml` | OpenAPI 3.1 REST API 계약 초안 |
| `.agent/docs/api_spec.md` | 백엔드 API 협의 명세와 미확정 질문 |

## 하네스 원칙

- `.agent/workspaces.json`이 frontend/backend 경계를 정의합니다.
- `.agent/docs/generated/ui_inventory.md`는 현재 워크스페이스 상태를 요약합니다. frontend가 active가 되면 Vue 라우트, 페이지, API 클라이언트, 상태/스타일 파일도 요약합니다.
- `.agent/contracts/backend_contract_decisions.md`는 backend DBML/OpenAPI 생성 기준입니다.
- `.agent/branch-ledger/`는 브랜치별 AI 문맥을 분리합니다. 기능 브랜치는 자기 ledger만 보고, develop/main에서 통합합니다.
- `frontend/`, `backend/` 제품 코드는 각각의 submodule repo에서 커밋하고, 이 orchestration repo는 submodule pointer와 `.agent/`를 관리합니다.
- 백엔드가 서브모듈로 들어오면 `.agent/workspaces.json`, `.agent/docs/architecture_guide.md`, `.agent/tools/*`를 같은 기준으로 확장합니다.
- 제품 코드 수정 시 관련 `.agent/docs/` 문서와 생성 인벤토리를 함께 갱신합니다.

## 참고 문서

| 문서 | 역할 |
| :--- | :--- |
| `AGENTS.md` | 루트 에이전트 포인터 |
| `.agent/AGENTS.md` | 에이전트 작업 지도 |
| `.agent/ARCHITECTURE.md` | 상위 구조와 하네스 경계 |
| `.agent/docs/ai_harness_guide.md` | 하네스 운영 방식 |
| `.agent/docs/git_workflow.md` | Git Flow, commit convention, submodule 운영 정책 |
| `.agent/docs/branching_agent_docs.md` | 브랜치별 AI 문서 격리와 통합 규칙 |
| `.agent/docs/architecture_guide.md` | frontend/backend 책임 경계 |
| `.agent/docs/page_map.md` | 프론트엔드 라우트와 페이지 |
| `.agent/docs/generated/ui_inventory.md` | 자동 생성 UI/워크스페이스 인벤토리 |
| `.agent/docs/generated/branch_ledger.md` | 통합 브랜치에서 생성한 AI ledger 인덱스 |
| `.agent/contracts/backend_contract_decisions.md` | 백엔드 계약 결정 기록 |
