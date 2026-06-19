# 숨길 에이전트 작업 지도

이 저장소의 루트는 제품 코드가 아니라 상위 AI 하네스와 워크스페이스 경계를 관리합니다.

## 1. 작업 원칙

- 에이전트 문맥, 문서, 생성 인벤토리, 검사 스크립트는 `.agent/` 아래에 둡니다.
- `AGENTS.md`는 짧은 지도 역할만 하며, 상세 지식은 `.agent/docs/`와 `.agent/contracts/`에 둡니다.
- `.agent/docs/` 루트에는 `index.md`만 두고 상세 문서는 역할별 하위 폴더에 둡니다.
- 작업 시작 전 `npm --prefix .agent run branch:status`로 현재 브랜치에서 읽어도 되는 AI 문맥을 확인합니다.
- 기능 브랜치에서는 `.agent/branch-ledger/branches/<currentBranchKey>/`만 브랜치 고유 문맥으로 읽고 씁니다.
- 기능 브랜치에서는 다른 브랜치의 ledger와 `.agent/docs/generated/branch_ledger.*`를 읽거나 수정하지 않습니다.
- `develop` 또는 `main`에서는 merge 후 `npm --prefix .agent run branch:index`로 브랜치 ledger를 통합합니다.
- 활성 프론트엔드 제품 코드는 `frontend/`에 둡니다.
- `frontend/`와 `backend/`는 활성 submodule이며 `.agent/workspaces.json`의 build 명령과 경계를 따릅니다.
- 루트에는 정적 `index.html`, `pages/`, `assets/`, 제품 `src/`를 두지 않습니다.
- 정적 HTML/CSS/JS 목업은 더 이상 활성 제품 기준이 아닙니다.

## 2. 먼저 볼 문서

| 상황 | 먼저 볼 문서 |
| :--- | :--- |
| 워크스페이스 경계 | `.agent/workspaces.json`, `.agent/ARCHITECTURE.md` |
| 하네스 운영 방식 | `.agent/docs/harness/ai_harness_guide.md` |
| 브랜치별 AI 문서 | `.agent/docs/process/branching_agent_docs.md`, `.agent/branch-ledger/README.md` |
| 프론트 라우트와 페이지 | `.agent/docs/frontend/page_map.md`, `.agent/docs/generated/ui_inventory.md` |
| frontend/backend 책임 경계 | `.agent/docs/architecture/architecture_guide.md` |
| 제품 기능/API 이해 | `.agent/docs/product-specs/functional_spec.md`, `.agent/docs/api/api_spec.md` |
| 백엔드 계약 결정 | `.agent/contracts/backend_contract_decisions.md` |
| 품질 현황 | `.agent/docs/quality/scorecard.md` |

## 3. 변경 절차

1. `.agent/workspaces.json`에서 영향받는 워크스페이스를 확인합니다.
2. `npm --prefix .agent run branch:status`로 현재 브랜치 ledger 경계를 확인합니다.
3. 프론트 변경이면 `frontend/src/router`, `frontend/src/pages`, `frontend/src/components`, `frontend/src/api`, `frontend/src/stores`를 함께 확인합니다.
4. 백엔드/API/DB 변경이면 `.agent/contracts/backend_contract_decisions.md`를 먼저 확인합니다.
5. 구조나 라우트가 바뀌면 `.agent/docs/frontend/page_map.md`와 생성 인벤토리를 갱신합니다.
6. 브랜치 고유 문맥은 `npm --prefix .agent run branch:note -- --title "제목"`으로 기록합니다.
7. 백엔드가 들어오면 같은 하네스 안에 backend build/test/contract 검사를 추가합니다.
8. 변경 후 `npm --prefix .agent run harness:index`와 `npm --prefix .agent run harness:check`를 실행합니다.

## 4. 검증 명령

| 명령 | 역할 |
| :--- | :--- |
| `npm --prefix frontend run build` | 프론트 production 빌드 |
| `npm --prefix .agent run branch:status` | 현재 브랜치 AI 문서 경계 확인 |
| `npm --prefix .agent run branch:check` | 다른 브랜치 ledger 오염 검사 |
| `npm --prefix .agent run branch:index` | 통합 브랜치에서 ledger 인덱스 생성 |
| `npm --prefix .agent run harness:index` | 워크스페이스/UI 인벤토리 재생성 |
| `npm --prefix .agent run harness:check` | 상위 구조, 프론트 빌드, SPA smoke 검사 |

## 5. 언어

- 문서, 주석, 보고서는 한국어로 작성합니다.
- 코드 식별자, 파일명, API 이름, 명령어는 영어를 사용할 수 있습니다.
