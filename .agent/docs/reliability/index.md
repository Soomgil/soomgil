# 신뢰성 기준

## 현재 자동 검증

- `npm --prefix .agent run harness:index`
- `npm --prefix .agent run harness:check`
- frontend가 `active` 상태일 때만 `npm --prefix frontend run build`
- frontend가 `active` 상태일 때만 `frontend/dist` SPA route smoke

## 기대 상태

- 루트에는 제품 런타임 코드가 없습니다.
- 현재 frontend/backend는 모두 `active`이며 비어 있는 submodule로 취급하지 않습니다.
- frontend는 build 가능한 Vue 앱이어야 하고 UI 인벤토리와 route smoke를 통과해야 합니다.
- backend 자체 build/test와 frontend-backend API contract 검사를 orchestration 하네스에 추가합니다.
