# 마이페이지 캐시와 UI 언어 일관성

## 목표와 범위
- 마이페이지 여행기는 작은 폴라로이드 2열 카드로 최대 6개 미리보기. 모두 보기에서는 전체 유지.
- 기존 API 계약을 유지하면서 프로필/설정, 저장 장소, 취향, 팔로우, 작성 게시물, 여행 목록의 반복 조회를 Redis에서 처리.
- 정적 및 동적 UI 영어 번역 누락 수정. 사용자/관광공사/API 콘텐츠는 원문 유지.

## 캐시 정책
- MyPageCached가 선언된 조회만 캐시. 키: 버전 + 조회 영역 + 영역 세대 + 인증 사용자 UUID + 메서드/인자 해시.
- 기본 TTL 120초, soomgil.mypage-cache.ttl-seconds로 조절. 스케줄러 없음.
- 인증되지 않은 조회와 쓰기 트랜잭션 안의 조회는 캐시하지 않음. 기존 보안 필터는 항상 실행.
- InvalidatesMyPageCache가 붙은 변경의 성공 커밋 뒤 영역 세대 교체. 조회 중 발생한 변경에 오래된 응답이 재저장되어도 새 세대에서 접근 불가.
- 프로필/친구/게시물 변경이 다른 사용자의 화면에도 영향을 주므로 영역 전체를 보수적으로 무효화. 사용자별 세분화는 실제 트래픽 측정 후 개선 가능.
- Redis 읽기/쓰기 실패 시 원래 조회 결과 제공. 무효화 실패는 경고 기록; 장애 중 남은 응답은 최대 TTL까지 유지될 수 있음.
- JSON은 명시적인 반환 타입으로 역직렬화. Java 시간대와 날짜 값 유지. 인증 토큰은 저장하지 않음.
- Redis connect/command timeout 기본 500ms; 기존 REDIS_HOST/PORT 사용.

## 검증
- 먼저 캐시 회귀 테스트 컴파일 실패 확인 후 구현.
- 사용자/조회 인자 분리, 캐시 적중, 커밋/롤백, 장애 폴백, 손상 JSON, 진행 중 조회와 무효화 경합, 제네릭 핸들러 반환 타입 테스트.
- 전용 임시 Redis 컨테이너에서 실제 JSON 재조회 및 TTL, 세대 교체 확인. 실행: REDIS_TEST_PORT 지정 후 MyPageRedisIntegrationTest. 운영 Redis 데이터는 변경하지 않음.
- Windows Testcontainers Docker 통신이 무기한 대기하여 전체 backend 테스트 중단. 관련 핸들러/서비스 단위 테스트와 전용 Redis 통합 테스트로 검증.
- 정적 Vue UI/접근성 문구 번역 목록 감사, 동적 숫자/이름 템플릿 번역, 브라우저 confirm/prompt/alert 번역.
- 7개 주요 페이지 fixture 영어 UI 감사 및 1440/390px 폴라로이드 화면 확인. API 반환 콘텐츠는 data-no-translate로 유지.

## 계약 영향
- API/DB 스키마 변경 없음. 새 캐시 annotation/aspect에 한국어 JavaDoc 추가.

## Service background (2026-09-17)
- Replaced initial PNG-derived assets with user-provided background-img.webp, unchanged 35,834 bytes (1659x948).
- Shared fixed decorative background on home, my trips, preferences, community, search, mypage and settings; map excluded.
- Full viewport width, intrinsic aspect ratio, bottom anchored; no horizontal letterboxing. Portrait screens show full panorama at bottom. Top fades into paper tone; white cards remain opaque.
- App navigation tests 2 passed; frontend production build passed; desktop/mobile browser fixture checked; harness passed.

- 사용자 요청으로 공통 산수화 배경 적용을 철회하고 기존 배경을 복원함. Downloads 원본은 유지함.

## Sky watercolor background
- Applied user-provided WebP as sky-watercolor-background.webp (24,586 bytes). Single asset reused at independent left/right edges; mobile narrower/lighter; map excluded.
- App tests 2 passed, production build passed, desktop/mobile browser fixture reviewed.

