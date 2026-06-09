# Harness Engineering 적용 메모

참고: [Harness engineering: leveraging Codex in an agent-first world](https://openai.com/index/harness-engineering/)

## 숨길 적용

숨길에서 AI 하네스는 에이전트가 frontend와 backend를 같은 저장소 맥락에서 이해하고 검증하게 만드는 구조입니다.

## 적용 원칙

- 루트 `AGENTS.md`는 짧은 지도입니다.
- 상세 맥락은 `.agent/`에 둡니다.
- `.agent/workspaces.json`을 frontend/backend 경계의 단일 진실 공급원으로 둡니다.
- 생성 인벤토리와 검사 스크립트를 저장소 안에 둡니다.
- 반복되는 규칙은 문서에서 검사로 승격합니다.

## 현재 하네스 레이어

- workspace 경계 검사.
- frontend Vue 라우트와 페이지 연결 검사.
- 환경 파일 위생 검사.
- frontend build와 SPA smoke.
- backend planned 경계 유지.
