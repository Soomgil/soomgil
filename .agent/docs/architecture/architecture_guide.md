# 아키텍처 가이드

## 상위 경계

| 영역 | 책임 |
| :--- | :--- |
| 루트 | orchestration repo README, 짧은 AGENTS, 워크스페이스 경계, submodule pointer |
| `.agent/` | AI 하네스 문서, 생성 인벤토리, 검사 스크립트 |
| `frontend/` | 활성 Vue 3 프론트엔드 앱 submodule. 화면, 상태와 API client 관리 |
| `backend/` | Spring Boot 백엔드 앱 submodule. CQRS-lite 기준으로 command/query 경계를 분리 |

## 저장소 운영 경계

- `soomgil`은 orchestration repo입니다.
- `frontend/`와 `backend/`는 각각 별도 Git repo를 submodule로 연결합니다.
- `.agent/`는 orchestration repo에서만 관리합니다.
- submodule 내부 제품 코드는 해당 submodule repo의 Git Flow를 따릅니다.
- orchestration repo는 `.agent/` 변경과 submodule pointer 변경을 커밋합니다.
- 상세 Git 정책은 `.agent/docs/process/git_workflow.md`를 따릅니다.

## frontend 책임

- `frontend/src/router/index.ts`: 라우트와 페이지 연결.
- `frontend/src/pages/`: 라우트 단위 화면.
- `frontend/src/components/`: 재사용 UI.
- `frontend/src/api/`: 백엔드 API 클라이언트 경계.
- `frontend/src/stores/`: Pinia 상태.
- `frontend/src/styles/`: 전역 스타일.

## backend 책임

- `backend/src/main/java/com/soomgil/`: Spring Boot 제품 코드.
- `backend/src/main/java/com/soomgil/{domain}/api`: REST/WebSocket adapter.
- `backend/src/main/java/com/soomgil/{domain}/application/command`: write use case.
- `backend/src/main/java/com/soomgil/{domain}/application/query`: read use case.
- `backend/src/main/java/com/soomgil/{domain}/domain`: 도메인 모델, 정책, 이벤트.
- `backend/src/main/java/com/soomgil/{domain}/infrastructure`: persistence/external adapter.
- `backend/src/main/resources/db/migration`: Flyway migration.
- API 명세는 `.agent/docs/api/api_spec.md`와 연결합니다.
- frontend API 클라이언트 변경과 backend endpoint 변경은 같은 PR/작업 단위에서 검증합니다.

## 금지 경계

- 루트에 활성 제품 `index.html`, `pages/`, `assets/`, `src/`를 만들지 않습니다.
- 실제 환경값을 `.env`로 커밋하지 않습니다.
- 정적 HTML/CSS/JS 목업을 다시 활성 기준으로 삼지 않습니다.
