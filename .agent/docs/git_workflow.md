# Git 운영 정책

이 문서는 `soomgil` orchestration repo와 `frontend/`, `backend/` submodule repo의 Git 운영 기준입니다.

## 저장소 역할

| 저장소 | 역할 |
| :--- | :--- |
| `soomgil` | orchestration repo. `.agent/`, 루트 문서, submodule pointer, 통합 하네스만 관리합니다. |
| `frontend/` | 프론트엔드 제품 코드 repo. Vue 앱 코드와 프론트 빌드/테스트를 관리합니다. |
| `backend/` | 백엔드 제품 코드 repo. Spring Boot/API/DB migration/backend 테스트를 관리합니다. |

원칙:

- AI agent 문서, 하네스, 생성 인벤토리, branch ledger는 orchestration repo의 `.agent/`에서만 관리합니다.
- `frontend/`, `backend/` submodule 안에는 orchestration용 `.agent/` 문서를 만들지 않습니다.
- 제품 코드 변경은 해당 submodule repo에서 커밋하고 push합니다.
- orchestration repo는 submodule commit pointer와 `.agent/` 문서/계약 변경을 커밋합니다.
- 루트에는 활성 제품 `src/`, `index.html`, `pages/`, `assets/`를 두지 않습니다.

## Submodule 운영

초기 연결:

```bash
git submodule add <frontend-repo-url> frontend
git submodule add <backend-repo-url> backend
git commit -m "chore(submodules): add frontend and backend"
```

clone:

```bash
git clone --recurse-submodules <soomgil-repo-url>
git submodule update --init --recursive
```

submodule 코드 변경:

```bash
cd frontend
git checkout develop
git pull
git checkout -b feature/<short-topic>
# edit, test, commit, push, PR
cd ..
git add frontend
git commit -m "chore(submodules): update frontend pointer"
```

규칙:

- submodule 내부 변경과 orchestration pointer 변경은 같은 목적의 PR 세트로 묶습니다.
- submodule PR이 먼저 merge된 뒤 orchestration repo에서 pointer를 갱신합니다.
- 긴 기능은 `frontend`, `backend`, `soomgil`에 같은 ticket/slug를 사용해 추적합니다.
- orchestration PR에는 어떤 submodule commit으로 이동했는지 요약합니다.

## Git Flow

브랜치 역할:

| 브랜치 | 역할 |
| :--- | :--- |
| `main` | production 기준. release/hotfix 결과만 들어갑니다. |
| `develop` | 통합 개발 기준. 기능 브랜치는 여기서 시작하고 여기로 merge합니다. |
| `feature/<ticket>-<slug>` | 새 기능. `develop`에서 분기합니다. |
| `bugfix/<ticket>-<slug>` | 개발 중 버그 수정. `develop`에서 분기합니다. |
| `chore/<slug>` | 설정, 문서, 하네스, 정리 작업. `develop`에서 분기합니다. |
| `release/<version>` | 배포 준비. `develop`에서 분기하고 `main`, `develop`으로 merge합니다. |
| `hotfix/<version>-<slug>` | production 긴급 수정. `main`에서 분기하고 `main`, `develop`으로 merge합니다. |
| `codex/<type>/<slug>` | AI agent가 임시로 만드는 작업 브랜치. 명시 지시가 없으면 이 prefix를 사용합니다. |

흐름:

1. 기능은 `develop`에서 브랜치를 만듭니다.
2. 기능 PR은 `develop`으로 보냅니다.
3. 배포 준비 시 `release/<version>`을 만들고 QA/버전 고정을 진행합니다.
4. release PR은 `main`으로 merge하고 tag를 생성합니다.
5. release 결과는 다시 `develop`으로 merge합니다.
6. production 긴급 수정은 `main`에서 `hotfix/<version>-<slug>`로 만들고, `main`과 `develop`에 모두 반영합니다.

보호 규칙:

- `main`, `develop` 직접 push 금지.
- 모든 merge는 PR로 진행합니다.
- `main` merge 전 release/hotfix 검증을 통과해야 합니다.
- submodule pointer만 바뀐 PR도 어떤 child repo PR/commit과 연결되는지 명시해야 합니다.

## Commit Convention

Conventional Commits를 사용합니다.

형식:

```text
<type>(<scope>): <summary>
```

예시:

```text
feat(frontend): add route drawing toolbar
feat(backend): add trip record upload API
docs(agent): document git workflow
docs(contracts): update community post DBML
chore(submodules): update frontend pointer
fix(preference): hide raw follower preference score
```

type:

| type | 의미 |
| :--- | :--- |
| `feat` | 사용자 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 변경 |
| `refactor` | 동작 변경 없는 구조 개선 |
| `perf` | 성능 개선 |
| `test` | 테스트 추가/수정 |
| `build` | 빌드/의존성/패키징 |
| `ci` | CI/CD |
| `chore` | 운영성 작업, submodule pointer, 잡무 |
| `revert` | 되돌리기 |

권장 scope:

| scope | 사용 위치 |
| :--- | :--- |
| `orchestration` | 루트 저장소 구조 |
| `agent` | `.agent/` 하네스, ledger, 검사 스크립트 |
| `contracts` | DBML/OpenAPI/backend 계약 |
| `submodules` | `frontend/`, `backend/` pointer 변경 |
| `frontend` | frontend repo 또는 frontend 관련 pointer |
| `backend` | backend repo 또는 backend 관련 pointer |
| `auth`, `trip`, `itinerary`, `record`, `community`, `preference`, `media`, `social` | 도메인 단위 변경 |

규칙:

- summary는 명령형 현재 시제로 작성합니다.
- 한 커밋은 한 목적만 담습니다.
- orchestration repo에서 제품 코드 대량 변경과 `.agent` 정책 변경을 한 커밋에 섞지 않습니다.
- breaking change는 body 또는 footer에 `BREAKING CHANGE:`를 적습니다.

## PR 정책

PR 본문에는 최소한 다음을 포함합니다.

- 변경 요약
- 영향을 받는 repo: `soomgil`, `frontend`, `backend`
- 관련 submodule PR/commit
- 검증 명령과 결과
- DBML/OpenAPI/하네스 문서 변경 여부

검증 기준:

- orchestration repo: `npm --prefix .agent run harness:check`
- frontend repo: frontend 자체 build/test 명령
- backend repo: backend 자체 test/build/migration 검증
- DBML 변경 시: DBML to PostgreSQL SQL 변환 확인

## AI Agent Git 규칙

- AI agent 관련 파일은 orchestration repo의 `.agent/`에 둡니다.
- 기능 브랜치의 AI 문맥은 `.agent/branch-ledger/branches/<currentBranchKey>/`에만 기록합니다.
- 기능 브랜치에서는 다른 브랜치 ledger를 읽거나 수정하지 않습니다.
- `develop` 또는 `main` 통합 후 `npm --prefix .agent run branch:index`로 branch ledger 인덱스를 재생성합니다.
- AI agent가 브랜치를 만들 때 별도 지시가 없으면 `codex/<type>/<slug>`를 사용합니다.
- AI agent가 submodule 제품 코드를 수정해야 하면 해당 submodule repo 브랜치에서 커밋하고, orchestration repo에는 pointer 갱신과 하네스 문서 변경만 남깁니다.
