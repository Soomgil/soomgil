# Harness Engineering 적용 메모

참고: [Harness engineering: leveraging Codex in an agent-first world](https://openai.com/ko-KR/index/harness-engineering/)

## 숨길 적용

숨길에서 AI 하네스는 에이전트가 frontend와 backend를 같은 저장소 맥락에서 이해하고 검증하게 만드는 구조입니다.

## 적용 원칙

- 루트 `AGENTS.md`는 백과사전이 아니라 짧은 지도입니다.
- 실제 기록 시스템은 구조화된 `.agent/docs/`와 `.agent/contracts/`에 둡니다.
- `.agent/docs/` 루트에는 `index.md`만 두고, 상세 문서는 목적별 하위 폴더에 둡니다.
- `.agent/workspaces.json`을 frontend/backend 경계의 단일 진실 공급원으로 둡니다.
- 생성 인벤토리, API 계약, DBML, 실행 계획을 저장소 안의 버전 관리 아티팩트로 둡니다.
- 반복되는 규칙은 문서에서 검사로 승격하고 `.agent/tools/harness-check.mjs`로 기계적으로 강제합니다.
- 긴 작업 계획은 `.agent/docs/exec-plans/active/`와 `.agent/docs/exec-plans/completed/`에서 관리합니다.
- 생성 파일은 `.agent/docs/generated/`에 두고 사람이 직접 편집하는 원문과 구분합니다.

## 문서 폴더 기준

| 경로 | 역할 |
| :--- | :--- |
| `.agent/docs/index.md` | 에이전트가 시작할 때 보는 문서 지도 |
| `.agent/docs/api/` | 백엔드 API 협의 명세 |
| `.agent/docs/architecture/` | 상위 구조와 워크스페이스 경계 |
| `.agent/docs/design-docs/` | 화면/디자인 판단과 참고 초안 |
| `.agent/docs/exec-plans/` | 진행 중/완료된 실행 계획 |
| `.agent/docs/frontend/` | 프론트 화면, 라우트, 컴포넌트, 스타일 기준 |
| `.agent/docs/generated/` | 자동 생성 인벤토리와 ledger 인덱스 |
| `.agent/docs/harness/` | 하네스 운영 방식 |
| `.agent/docs/process/` | Git Flow, branch ledger, 작업 절차 |
| `.agent/docs/product-specs/` | 제품 요구사항과 기능 명세 |
| `.agent/docs/quality/` | 품질 점수표와 리뷰 기록 |
| `.agent/docs/references/` | 외부 참고와 공식 문서 적용 메모 |
| `.agent/docs/reliability/` | 안정성 원칙 |
| `.agent/docs/security/` | 보안 원칙 |

## 현재 하네스 레이어

- workspace 경계 검사.
- `.agent/docs/` 루트 파일 금지 검사.
- frontend Vue 라우트와 페이지 연결 검사.
- 환경 파일 위생 검사.
- frontend build와 SPA smoke.
- backend planned 경계 유지.
