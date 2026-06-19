# 품질 점수표

| 영역 | 등급 | 상태 |
| :--- | :--- | :--- |
| 상위 구조 | A- | 루트 orchestration과 활성 frontend/backend submodule 경계가 분리되어 있다. |
| 프론트 구조 | B+ | Vue Router, pages, components, api, stores, styles가 분리되어 있다. |
| 백엔드 준비 | B+ | Spring Boot submodule과 자체 Gradle/Testcontainers 검증이 있으며 orchestration 자동 실행 연결은 남아 있다. |
| 하네스 자동화 | A- | 인벤토리, 구조 검사, frontend build, SPA smoke가 있다. |
| 환경 파일 위생 | A- | `.env.example`만 저장소에 두고 실제 값은 `.env.local`로 분리한다. |

## 다음 개선

- backend build/test를 orchestration 하네스에 추가합니다.
- frontend unit/component/E2E test 명령을 추가합니다.
- frontend API 클라이언트와 backend endpoint contract 검사를 추가합니다.
- TypeScript 유지 여부 또는 JavaScript 전환 기준을 명확히 결정합니다.

## 참고 리뷰

- `api_spec_initial_review.md`: 초기 API 명세 초안에 대한 리뷰 기록. 최신 기준은 `.agent/docs/api/api_spec.md`와 `.agent/contracts/openapi.yaml`입니다.
