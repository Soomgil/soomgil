# 품질 점수표

| 영역 | 등급 | 상태 |
| :--- | :--- | :--- |
| 상위 구조 | A- | 루트, `.agent`, `frontend`, planned `backend` 경계가 분리되어 있다. |
| 프론트 구조 | B+ | Vue Router, pages, components, api, stores, styles가 분리되어 있다. |
| 백엔드 준비 | B | `backend` 경계는 선언됐지만 실제 서브모듈과 검사는 아직 없다. |
| 하네스 자동화 | A- | 인벤토리, 구조 검사, frontend build, SPA smoke가 있다. |
| 환경 파일 위생 | A- | `.env.example`만 저장소에 두고 실제 값은 `.env.local`로 분리한다. |

## 다음 개선

- backend 서브모듈이 들어오면 backend build/test를 하네스에 추가합니다.
- frontend API 클라이언트와 backend endpoint contract 검사를 추가합니다.
- TypeScript 유지 여부 또는 JavaScript 전환 기준을 명확히 결정합니다.
