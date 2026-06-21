# KTO swipe feed runtime integration

- 담당자: 민경철
- 런타임 스와이프 후보는 `tourism_source.attractions`가 아니라 한국관광공사 KorService2 API에서 조회한다.
- 백엔드는 KTO 장소 정보에 `preference.place_tag_enrichments`의 최신 확정 태그, 현재 사용자 반응, 팔로우 사용자 반응을 결합한다.
- `/swipe/feed` 장소 응답에 설명, 사진 목록, 한글 태그 표시 이름을 포함한다.
- 프론트 장소 mapper가 설명, 사진, 태그를 버리지 않고 스와이프 화면에 전달한다.
- Gemini/KTO 키는 `backend/.env`에만 보관하며 Git에 포함하지 않는다.

## Verification

- backend 전체 Gradle test 성공
- frontend Vitest 103개 성공
- frontend production build 성공
- 실제 KorService2 `areaBasedList2`, `detailCommon2` 응답 확인
- 로컬 HTTP 검증은 미구현 인증 계층의 401까지 확인
