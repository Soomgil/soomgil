# UI 기능 요소 전수 점검 체크리스트

## 범위와 판정 기준

- 범위: frontend 활성 Vue 파일 51개, Router 화면 21개, frontend API client 16개, 연결된 backend endpoint.
- `DONE`: 실제 브라우저 또는 component/API 테스트와 backend 응답으로 동작을 확인했다.
- `FIXED`: 점검 중 결함을 재현하고 코드와 회귀 테스트를 수정했다.
- `CONFIG`: 외부 키·provider 설정이 없어 로컬에서 완전 검증할 수 없다.
- `LARGE`: 데이터 보존 또는 외부 서비스가 필요한 후속 E2E 작업이다.

## 화면별 체크리스트

| 화면 | 주요 기능 요소 | 상태 | 증거/남은 작업 |
| :--- | :--- | :--- | :--- |
| `/` | 로그인·회원가입 진입 | `DONE` | 공개 브라우저 smoke, 가로 overflow 없음 |
| `/login` | 이메일 로그인, OAuth 진입, 비밀번호 찾기 | `DONE` / `CONFIG` | 로컬 계정 실제 로그인 성공. Kakao/Google은 provider credential E2E 필요 |
| `/register`, `/verify-email` | 약관, 가입, 이메일 인증 | `DONE` | 실제 테스트 계정 가입, Mailpit 인증, 로그인까지 성공 |
| `/reset-password` | 재설정 메일·토큰·새 비밀번호 | `LARGE` | API/component 테스트 존재. 실제 계정 비밀번호 변경 파괴 테스트는 별도 격리 E2E 필요 |
| `/home` | 검색, 새 여행, 빠른 기능, 인기 장소, 인기 여행기, 초대 CTA | `FIXED` | 인기 장소 Redis 직렬화 500 수정. CTA는 여행 생성·선택 흐름 연결 |
| `/search` | 통합 검색, 탭, 페이지 이동 | `FIXED` | community 인기 SQL과 사용자 이미지 URI 매핑 오류 수정. backend 재검증 대상 |
| `/my-trips` | 여행 생성, 티켓, 필터, 검색, 멤버, 설정 | `FIXED` | `BoardingPassCard`를 실제 화면에 복구. 실제 trip 생성 후 desktop/mobile 티켓 및 멤버 API 확인 |
| `/trip-invites/:code` | 초대 수락·오류·로그인 복귀 | `DONE` | component/API 상태 테스트 |
| `/swipe` | 제스처 반응, 사진 탐색, 상세 정보 | `DONE` | component/API 회귀 테스트. 버튼형 중복 제어는 제거하고 제스처 유지 |
| `/trips/:tripId/route` | 일차·일정, 추천, 북마크, 메모, 체크리스트, 채팅 | `FIXED` / `CONFIG` | 북마크가 SUPER_LIKE 계약 없이 422 나던 문제 수정. 메모 서식 동작 연결. Mapbox token과 외부 AI 설정 필요 |
| `/community` | 공개 목록, 검색, 좋아요, 댓글·답글, 리트립, 공유 | `FIXED` | 실제 8개 목록·상세 모달 확인. 좋아요 API와 답글 계층 회귀 테스트 추가 |
| `/community/feed` | 중복 피드 | `FIXED` | 무동작 댓글 도구가 있던 중복 화면 제거 후 `/community`로 redirect |
| `/community/stories` | 전체 여행기 카드 | `FIXED` | 무동작 `#` 카드를 해당 여행기 상세 query로 연결, serving URL 적용 |
| `/community/story-write` | 여행 선택, 사진, 편집, 게시 | `FIXED` / `LARGE` | 가짜 미리보기 버튼 제거. 실제 S3/Minio 파일 업로드 E2E는 별도 fixture 필요 |
| `/record` | 여행 필터, 다중 사진, 정렬, 보기 전환, 확대 | `FIXED` | 정렬·보기 전환 무동작 버튼 구현. 다중 업로드 component/API 테스트 통과 |
| `/mypage` | 프로필, 공유, 저장 장소, 여행기, 팔로우 목록 | `FIXED` | saved-place wrapper 오매핑 수정. 실제 장소 저장→표시→좋아요 취소→backend 0건 확인 |
| `/mypage/:userId` | 팔로우, 공유, 여행기 | `FIXED` | 공개 프로필 공유 버튼 구현, 비대화형 좋아요 아이콘으로 정리 |
| `/settings` | 세션 해제, 전체 로그아웃, 환경 설정, 계정 삭제 | `DONE` / `LARGE` | 실제 session API 렌더링. 전체 로그아웃·계정 삭제는 격리 E2E 필요 |
| `/admin/moderation` | 신고 조회·조치 | `DONE` / `LARGE` | 일반 사용자는 backend 403 안내. moderator fixture로 조치 E2E 필요 |
| 404 | 홈 복귀 | `DONE` | 브라우저 smoke |

## 이번 점검에서 바로 수정한 결함

- 내 여행 티켓을 방치된 중복 마크업이 아닌 `BoardingPassCard`로 복구하고 `data-testid=trip-ticket` 회귀 계약을 추가했다.
- 저장 장소 API의 `{ id, place, createdAt }` 응답을 `Place`로 잘못 해석하던 매핑을 고쳤다.
- 마이페이지 좋아요 취소를 `DELETE /places/{provider}/{externalPlaceId}/save`에 연결했다.
- 추천 북마크는 backend 규칙에 맞게 `SUPER_LIKE` 반응 후 저장하도록 순서를 연결했다.
- 인기 장소의 직렬화 불가능 Redis cache로 인한 500을 제거했다.
- 커뮤니티 인기 검색의 존재하지 않는 `post_likes.deleted_at` 조건을 제거했다.
- 사용자 검색의 `String → URI` MyBatis 생성 오류를 명시 변환으로 수정했다.
- 댓글 답글은 들여쓰기, 부모 작성자 label, 별도 배경으로 표시하고 회귀 테스트를 추가했다.
- 기록 정렬·보기 전환, 공개 프로필 공유, 메모 Markdown 서식을 구현했다.
- 무동작 검색·필터·음성·미리보기 버튼을 의미 있는 동작으로 바꾸거나 비대화형 요소로 정리했다.

## 자동 전수 검사 결과

- Vue 파일 51개에서 `type=button`인데 click/emit/submit 계약이 없는 버튼: **0개**.
- `href="#"`인데 실제 이동 또는 click 계약이 없는 링크: **0개**.
- 인증된 실제 계정으로 16개 대표 경로 desktop smoke: 모든 화면 렌더링, 문서 가로 overflow 없음.
- `/my-trips` mobile 390×844: 티켓 표시, 문서 가로 overflow 없음.
- frontend: 36 test files, 186 tests 통과 및 production build 통과.
- backend: 전체 test suite 통과. 추가 사용자 검색 회귀 테스트 통과.

## 외부 설정·대형 후속 작업

- `CONFIG`: `VITE_MAPBOX_ACCESS_TOKEN`이 없어 지도 canvas 대신 명시적 오류 상태가 보인다.
- `CONFIG`: Google GenAI 설정이 현재 400을 반환한다. 운영 credential/model 확인과 비용 제한을 포함한 별도 E2E가 필요하다.
- `CONFIG`: Kakao/Google OAuth callback은 실제 provider credential과 등록 redirect URI가 필요하다.
- `LARGE`: 실제 브라우저 파일 chooser를 이용한 다중 사진 업로드와 S3/Minio read-back fixture.
- `LARGE`: 계정 삭제, 여행 삭제, 전체 기기 로그아웃, moderator 조치는 격리된 disposable 데이터 E2E로 운영한다.
- `LARGE`: Web Share, clipboard, 카메라·마이크 등 OS/browser permission 기능은 지원 브라우저 matrix에서 검증한다.
