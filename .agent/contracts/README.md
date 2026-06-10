# Backend Contracts

이 디렉터리는 숨길 백엔드가 active 서브모듈로 들어오기 전까지 상위 AI 하네스가 관리하는 계약 문서 영역입니다.

## 현재 문서

- `backend_contract_decisions.md`: DBML/OpenAPI 생성 전 확정된 백엔드 설계 결정.
- `schema.dbml`: PostgreSQL 기준 데이터 모델. 하나의 DBML 파일 안에서 `auth.users`, `trip.trips`처럼 schema-qualified table name으로 기능/역할을 분리합니다.
- `openapi.yaml`: `/api/v1` REST API와 RFC7807 에러 계약.

## 운영 규칙

- backend 구현을 시작하기 전 이 디렉터리의 결정을 먼저 확인합니다.
- 서비스 요구사항 질문이 추가로 확정되면 `backend_contract_decisions.md`를 갱신합니다.
- `backend/` 서브모듈이 연결되면 이 계약을 기준으로 backend repo의 문서와 동기화합니다.
