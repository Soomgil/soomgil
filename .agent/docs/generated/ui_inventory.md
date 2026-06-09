# UI / 워크스페이스 인벤토리

이 문서는 `.agent/tools/build-ui-knowledge.mjs`가 상위 워크스페이스를 읽고, frontend가 active일 때 Vue UI까지 분석해 생성한 에이전트용 지도입니다.

## 워크스페이스

| 이름 | 타입 | 경로 | 상태 | 프레임워크 | 언어 | 요약 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| frontend | frontend | `frontend` | planned | Vue | - | planned |
| backend | backend | `backend` | planned | TBD | - | planned |

## 하네스 사용법

- 구조 변경 후 `npm --prefix .agent run harness:index`로 재생성합니다.
- `npm --prefix .agent run harness:check`는 워크스페이스 경계를 확인하고, frontend가 active일 때 라우트, 빌드, SPA smoke까지 확인합니다.

