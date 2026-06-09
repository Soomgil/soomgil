# 생성 인벤토리

- `ui_inventory.md`: 사람이 읽는 frontend/backend 워크스페이스 지도. frontend가 active일 때 Vue UI까지 포함합니다.
- `ui_inventory.json`: 하네스 스크립트가 읽는 기계용 인벤토리.
- `branch_ledger.md`: 통합 브랜치에서 생성한 브랜치별 AI 기록 인덱스.
- `branch_ledger.json`: 하네스/자동화가 읽는 브랜치별 AI 기록 인덱스.

구조나 라우트가 바뀌면 `npm --prefix .agent run harness:index`로 재생성합니다.
브랜치 ledger는 `develop` 또는 `main`에서 `npm --prefix .agent run branch:index`로 재생성합니다.
