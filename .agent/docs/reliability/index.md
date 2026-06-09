# 신뢰성 기준

## 현재 자동 검증

- `npm --prefix .agent run harness:index`
- `npm --prefix .agent run harness:check`
- frontend가 `active` 상태일 때만 `npm --prefix frontend run build`
- frontend가 `active` 상태일 때만 `frontend/dist` SPA route smoke

## 기대 상태

- 루트에는 제품 런타임 코드가 없습니다.
- frontend와 backend는 초기에는 비어있는 planned submodule이어도 하네스 실패를 만들지 않습니다.
- frontend가 active가 되면 build 가능한 Vue 앱이어야 하고 UI 인벤토리, route smoke를 통과해야 합니다.
- backend가 active가 되면 자체 build/test와 API contract 검사를 추가합니다.
