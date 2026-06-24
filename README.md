# 숨길(Soomgil)

> 스와이프로 취향을 모으고, 지도 위에서 함께 그리는 그룹 여행 설계 플랫폼

이 저장소는 숨길의 orchestration repo입니다. 상위 AI 하네스와 제품 서브프로젝트 submodule pointer를 관리합니다.

## 현재 구조

| 경로 | 상태 | 역할 |
| :--- | :--- | :--- |
| `.agent/` | active | frontend/backend를 함께 이해하기 위한 AI 하네스, 문서, 생성 인벤토리, 검사 스크립트 |
| `.agent/branch-ledger/` | active | 브랜치별 AI 문맥을 격리해 기록하는 Flyway식 ledger |
| `frontend/` | active | Vue 기반 프론트엔드 제품 앱 submodule. 화면, 라우트, API 클라이언트와 테스트를 포함 |
| `backend/` | active | Spring Boot 백엔드 앱 submodule. CQRS-lite 패키지 구조와 Gradle scaffold |

루트에는 정적 `index.html`, `pages/`, `assets/`, 제품 `src/`를 두지 않습니다. 정적 HTML/CSS/JS 목업은 더 이상 활성 제품 기준이 아닙니다.

## 주요 명령

가장 간단한 실행 방법:

- macOS: `start-soomgil.command`를 더블클릭합니다.
- Windows: `start-soomgil.bat`를 더블클릭합니다.
- 메뉴에서 프론트엔드+백엔드, 백엔드만, 프론트엔드만, 데모 DB 초기화, 전체 종료를 선택합니다.

Node.js 18 이상과 실행 중인 Docker Desktop이 필요합니다.

| 명령 | 역할 |
| :--- | :--- |
| `docker-compose up -d` | PostgreSQL, Redis, Mailpit, MinIO 로컬 인프라 실행 |
| `docker-compose --profile full up --build -d` | 프론트엔드, 백엔드와 로컬 인프라 전체 실행 |
| `docker-compose --profile full logs -f` | 전체 개발 스택 로그 확인 |
| `docker-compose --profile full down` | 전체 개발 스택 종료 |
| `node start-soomgil.mjs both` | 프론트엔드와 백엔드 실행 |
| `node start-soomgil.mjs backend` | 백엔드와 필수 인프라만 실행 |
| `node start-soomgil.mjs frontend` | 프론트엔드만 실행 |
| `node start-soomgil.mjs reset` | 기존 DB를 삭제하고 데모 dump 재적재 |
| `node start-soomgil.mjs stop` | 전체 컨테이너 종료 |
| `npm --prefix frontend run dev` | 프론트엔드 개발 서버 실행 |
| `npm --prefix frontend run build` | 프론트엔드 production 빌드 |
| `./backend/gradlew -p backend bootRun` | 백엔드 개발 서버 실행 |
| `./backend/gradlew -p backend test` | 백엔드 테스트 실행 |
| `npm --prefix .agent run branch:status` | 현재 브랜치에서 읽어도 되는 AI 문맥 확인 |
| `npm --prefix .agent run branch:note -- --title "제목"` | 현재 브랜치용 AI ledger 기록 생성 |
| `npm --prefix .agent run branch:check` | 다른 브랜치 ledger 오염 검사 |
| `npm --prefix .agent run branch:index` | develop/main에서 branch ledger 통합 인덱스 생성 |
| `npm --prefix .agent run harness:index` | 상위 AI 하네스 인벤토리 재생성 |
| `npm --prefix .agent run harness:check` | 워크스페이스 구조, branch ledger 경계, 프론트 빌드, 라우트 smoke 검사 |

Docker Compose 전체 실행 후 프론트엔드는 `http://localhost:5173`, 백엔드는
`http://localhost:8080`, Mailpit은 `http://localhost:8025`, MinIO 콘솔은
`http://localhost:9001`에서 접근합니다.

### Windows PowerShell

```powershell
Copy-Item .env.example .env
docker compose --profile full up --build -d
docker compose --profile full logs -f backend
```

### macOS / Linux

```bash
cp .env.example .env
docker compose --profile full up --build -d
docker compose --profile full logs -f backend
```

Docker Compose v1만 설치된 환경에서는 `docker compose` 대신 `docker-compose`를 사용합니다.
실행기는 설치된 버전을 자동으로 감지합니다.

### 데모 DB 초기화

`node init-demo-dump.mjs`는 백엔드를 잠시 중지하고 `DB_NAME` 데이터베이스를 완전히
삭제·재생성합니다. 이후 Flyway를 다시 적용하고
`backend/seeds/generated/soomgil_demo_dashboard_dump.sql` 하나만 적재한 뒤 검증합니다.
기존 로컬 데이터는 복구되지 않으므로 데모 데이터를 처음부터 다시 만들 때만 실행합니다.

## 환경변수 운영

팀에서 공유해야 하는 환경변수 기준 파일은 루트 `.env` 하나입니다.
루트 `.env.example`을 복사해 `.env`를 만들고, 실제 키는 팀의 비밀 공유 채널로 전달합니다.

Docker Compose와 백엔드 컨테이너는 루트 `.env`만 사용합니다.
프론트엔드를 단독 실행할 때만 `frontend/.env.local`처럼 Vite 로컬 env 파일을 사용할 수 있습니다.
`.env`, `.env.*`, `frontend/.env.local` 같은 실제 값 파일은 모두 Git에 커밋하지 않습니다.

## Backend Contracts

백엔드 구현 전 확정한 계약 결정은 여기서 바로 확인합니다.

| 문서 | 역할 |
| :--- | :--- |
| `.agent/contracts/README.md` | 백엔드 계약 문서 위치와 운영 규칙 |
| `.agent/contracts/backend_contract_decisions.md` | DBML/OpenAPI 생성 전 확정된 설계 결정 |
| `.agent/contracts/schema.dbml` | PostgreSQL 기준 V1 데이터 모델 |
| `.agent/contracts/openapi.yaml` | OpenAPI 3.1 REST API 계약 초안 |
| `.agent/docs/api/api_spec.md` | 백엔드 API 협의 명세와 미확정 질문 |

## 하네스 원칙

- `.agent/workspaces.json`이 frontend/backend 경계를 정의합니다.
- `.agent/docs/index.md`는 에이전트용 문서 지도이며, `.agent/docs/` 루트에는 `index.md`만 둡니다.
- `.agent/docs/generated/ui_inventory.md`는 현재 워크스페이스 상태를 요약합니다. frontend가 active가 되면 Vue 라우트, 페이지, API 클라이언트, 상태/스타일 파일도 요약합니다.
- `.agent/contracts/backend_contract_decisions.md`는 backend DBML/OpenAPI 생성 기준입니다.
- `.agent/branch-ledger/`는 브랜치별 AI 문맥을 분리합니다. 기능 브랜치는 자기 ledger만 보고, develop/main에서 통합합니다.
- `frontend/`, `backend/` 제품 코드는 각각의 submodule repo에서 커밋하고, 이 orchestration repo는 submodule pointer와 `.agent/`를 관리합니다.
- 백엔드 구조 변경 시 `.agent/workspaces.json`, `.agent/docs/architecture/architecture_guide.md`, `.agent/tools/*`를 같은 기준으로 확장합니다.
- 제품 코드 수정 시 관련 `.agent/docs/` 문서와 생성 인벤토리를 함께 갱신합니다.

## 참고 문서

| 문서 | 역할 |
| :--- | :--- |
| `AGENTS.md` | 루트 에이전트 포인터 |
| `.agent/AGENTS.md` | 에이전트 작업 지도 |
| `.agent/ARCHITECTURE.md` | 상위 구조와 하네스 경계 |
| `.agent/docs/harness/ai_harness_guide.md` | 하네스 운영 방식 |
| `.agent/docs/process/git_workflow.md` | Git Flow, commit convention, submodule 운영 정책 |
| `.agent/docs/process/branching_agent_docs.md` | 브랜치별 AI 문서 격리와 통합 규칙 |
| `.agent/docs/process/domain_development_policy.md` | 도메인 개발 전 설명, test-first, 검증 보고 정책 |
| `.agent/docs/architecture/architecture_guide.md` | frontend/backend 책임 경계 |
| `.agent/docs/frontend/page_map.md` | 프론트엔드 라우트와 페이지 |
| `.agent/docs/generated/ui_inventory.md` | 자동 생성 UI/워크스페이스 인벤토리 |
| `.agent/docs/generated/branch_ledger.md` | 통합 브랜치에서 생성한 AI ledger 인덱스 |
| `.agent/contracts/backend_contract_decisions.md` | 백엔드 계약 결정 기록 |
