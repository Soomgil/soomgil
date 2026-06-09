# 컴포넌트 가이드

프론트 컴포넌트는 `frontend/src/components/` 아래에서 관리합니다.

## 기준

- 라우트 단위 화면은 `frontend/src/pages/`에 둡니다.
- 반복 UI는 `frontend/src/components/`로 분리합니다.
- API 호출은 컴포넌트에서 직접 흩뿌리지 말고 `frontend/src/api/` 또는 store/composable을 거칩니다.
- 상태 공유는 Pinia store 또는 composable로 관리합니다.
- 이미지에는 의미 있는 `alt` 또는 `:alt`를 둡니다.

## 하네스 연결

- 컴포넌트나 페이지를 추가하면 `npm --prefix .agent run harness:index`를 실행합니다.
- 라우트에 연결된 Page는 `.agent/docs/page_map.md`에도 반영합니다.
