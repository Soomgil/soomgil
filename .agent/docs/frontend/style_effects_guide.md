# 스타일 가이드

프론트 스타일은 `frontend/src/styles/`에서 관리합니다.

## 기준

- 전역 진입점은 `frontend/src/styles/main.css`입니다.
- 기존 스타일 마이그레이션 흔적은 `original.css`, `scroll-explore.css`, `mypage.css`에 남아 있습니다.
- 새 스타일은 페이지/컴포넌트 책임에 맞춰 추가하고, 반복되는 토큰은 전역으로 승격합니다.
- Tailwind 사용 여부는 `frontend`의 현재 설정을 따릅니다.

## 검증

- 스타일 변경 후 `npm --prefix frontend run build`를 실행합니다.
- 구조 변경 후 `npm --prefix .agent run harness:index`를 실행합니다.
