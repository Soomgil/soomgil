# .agent 문서 인덱스

이 디렉터리는 상위 AI 하네스가 frontend와 backend를 함께 다루기 위한 문서를 담습니다.

## 핵심 문서

- `ai_harness_guide.md`: 하네스 실행 흐름.
- `git_workflow.md`: orchestration repo, submodule, Git Flow, commit convention 운영 규칙.
- `branching_agent_docs.md`: 브랜치별 AI 문서 격리와 통합 규칙.
- `domain_development_policy.md`: 도메인 개발 전 사용자 흐름 설명과 test-first 강제 정책.
- `architecture_guide.md`: frontend/backend 책임 경계.
- `page_map.md`: Vue Router 기준 프론트 화면 맵.
- `functional_spec.md`: 제품 기능 명세.
- `design-docs/design.md`: `frontend/` 현재 구현 기준 디자인 문서.
- `design-docs/design_system_todo.md`: 디자인 시스템 수렴과 Settings 화면 통일 작업 TODO.
- `api_spec.md`: API 경계와 백엔드 준비 기준.
- `../contracts/backend_contract_decisions.md`: DBML/OpenAPI 생성 전 확정된 백엔드 계약 결정.
- `../contracts/openapi.yaml`: OpenAPI 3.1 REST API 계약 초안.
- `generated/ui_inventory.md`: 자동 생성 워크스페이스/UI 인벤토리.
- `generated/branch_ledger.md`: 통합 브랜치에서 생성하는 브랜치 AI ledger 인덱스.

## 디렉터리

- `design-docs/`: 디자인 관련 문서. 정적 목업은 현재 보유하지 않습니다.
- `api/`: 백엔드 API 협의 명세.
- `architecture/`: frontend/backend 경계와 상위 구조.
- `frontend/`: 화면, 라우트, 컴포넌트, 스타일 기준.
- `harness/`: AI 하네스 사용법과 검증 흐름.
- `process/`: Git Flow, 브랜치 ledger, 문서 운영 절차.
- `product-specs/`: 제품 요구사항과 기능 명세.
- `quality/`: 품질 점수표.
- `references/`: 외부 참고와 하네스 철학.
- `exec-plans/`: 큰 작업의 실행 계획.
- `../contracts/`: 백엔드 DBML/OpenAPI 계약 문서.
- `../branch-ledger/`: 브랜치별 AI 문맥 기록소.

## 구조 규칙

- `.agent/docs/` 루트에는 이 `index.md`만 둡니다.
- 상세 문서는 역할별 하위 폴더에 둡니다.
- 폴더를 추가하거나 문서를 이동하면 이 색인과 해당 폴더의 `index.md`를 함께 갱신합니다.
- 반복되는 구조 규칙은 `.agent/tools/harness-check.mjs` 검사로 승격합니다.

## 초안/참고 문서 구분

- 활성 협의 초안: `api/api_spec.md`, `../contracts/openapi.yaml`
- 디자인 참고 초안: `design-docs/ui_prompt_proposal.md`
- 과거 리뷰 기록: `quality/api_spec_initial_review.md`
