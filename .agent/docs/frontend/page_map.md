# 프론트엔드 페이지 맵

현재 활성 화면은 `frontend/src/router/index.ts`의 Vue Router 라우트가 기준입니다.

> 여행기 커뮤니티를 제공하며, 투표 설정·참여·결과는 지도 모달에서 진행합니다. 기록 화면과 서버 기능은 제거했습니다.

| 경로 | 이름 | Page | 인증 |
| :--- | :--- | :--- | :--- |
| `/` | Landing | `frontend/src/pages/LandingPage.vue` | 공개 |
| `/login` | Login | `frontend/src/pages/LoginPage.vue` | guest only |
| `/register` | Register | `frontend/src/pages/RegisterPage.vue` | guest only |
| `/verify-email` | VerifyEmail | `frontend/src/pages/VerifyEmailPage.vue` | guest only |
| `/reset-password` | ResetPassword | `frontend/src/pages/ResetPasswordPage.vue` | 공개 |
| `/auth/oauth/:provider/callback` | OAuthCallback | `frontend/src/pages/OAuthCallbackPage.vue` | 공개 |
| `/home` | Home | `frontend/src/pages/HomePage.vue` | 필요 |
| `/search` | Search | `frontend/src/pages/SearchResultsPage.vue` | 필요 |
| `/my-trips` | MyTrips | `frontend/src/pages/MyTripsPage.vue` | 필요 |
| `/trip-invites/:inviteCode` | TripInviteAccept | `frontend/src/pages/TripInviteAcceptPage.vue` | 필요 |
| `/swipe` | Swipe | `frontend/src/pages/SwipePage.vue` | 필요 |
| `/trips/:tripId/route` | Route | `frontend/src/pages/RoutePage.vue` | 필요 |
| `/trips/:tripId/vote` | TripVote | `/trips/:tripId/route?vote=1` redirect | 필요 |
| `/community` | Community | `frontend/src/pages/CommunityPage.vue` | 공개 |
| `/community/feed` | Feed | `/community` redirect | 공개 |
| `/community/stories` | Stories | `frontend/src/pages/StoriesPage.vue` | 공개 |
| `/community/story-write` | StoryWrite | `frontend/src/pages/StoryWritePage.vue` | 필요 |
| `/mypage` | MyPage | `frontend/src/pages/MyPage.vue` | 필요 |
| `/mypage/:userId` | UserProfile | `frontend/src/pages/UserProfilePage.vue` | 공개 |
| `/settings` | Settings | `frontend/src/pages/SettingsPage.vue` | 필요 |
| `/admin/moderation` | AdminModeration | `frontend/src/pages/AdminModerationPage.vue` | 필요 |
| `/:pathMatch(.*)*` | NotFound | `frontend/src/pages/NotFoundPage.vue` | 공개 |

## 홈 화면

- `/home`은 화이트 종이 질감 위에 수상작을 중앙 배치하고 먹 번짐 마스크로 가장자리를 표현합니다. 검색창 위 카테고리 버튼은 제거했으며 캡슐형 입력창에서 전체 검색을 시작합니다.
- 사진은 원본 크기가 기본이며 가로 사진 너비 720px, 세로 사진 높이 520px가 최소 목표입니다. 화면이 작으면 전시 공간을 우선하고 비율을 유지합니다.
- 홈 검색은 `/search?q=...&tab=전체`로 이동합니다. 검색 결과 화면에서 전체/여행/장소/여행기/사용자 필터를 선택합니다.
- 작품 아래의 둘러보기는 장소명, 없으면 지역명으로 장소 검색을 엽니다. 확인된 장소 식별자가 없어 직접 상세 화면으로 연결하지 않습니다.
- 작품 출처, 수동 사진 전환과 마스크가 없는 원본 보기 링크를 제공합니다.
- 최근 검색어는 브라우저에 최대 5개 저장하고 전체 삭제할 수 있습니다.
- 사진 조회/로딩 실패와 빈 목록 상태에서도 검색을 이용할 수 있습니다.
- 기존 홈의 콘텐츠 목록과 해당 목록용 API 호출을 제거했습니다. 좋아요는 수상작과 장소 식별자의 확정 연결 이후 별도로 적용합니다.

## 검색 결과 디자인

- `/search`는 홈과 같은 화이트 종이 질감, 먹 번짐 사진, 명조 제목과 먹빛 초록색을 사용합니다.
- 홈과 결과 검색창은 `frontend/src/styles/paper-search.css`를 공유합니다.
- 검색어 제목과 현재 표시 중인 결과 수를 제공하며 결과 필터는 검색창 아래의 텍스트 버튼입니다.
- 사진 카드 클릭 시 기존 여행/사용자 이동, 장소 상세 및 여행기 상세 기능을 유지합니다.

## 여행 방 진입과 지도 테마

- 여행방 생성 후 `/trips/:tripId/route?vote=1`로 이동하여 투표 설정 모달을 엽니다. AI 진입 의도도 유지합니다.
- 내 여행 카드 투표와 기존 `/trips/:tripId/vote` 링크도 지도 모달로 연결합니다.
- 진입 가드는 투표 상태를 미리 읽고 지도로 통과시킵니다. 미제출 상태에서는 모달을 자동으로 엽니다.
- 관리 오른쪽의 지도 테마 버튼으로 밝게/어둡게/주간 도로/야간 도로/기본 지도를 선택합니다.
- 테마는 브라우저에 저장하고 드로잉·3D 카메라·앱 다크 모드 전환과 독립적으로 유지합니다.

## 기록 기능 제거

- `/record`, 기록 메뉴, 기록 전용 API client·타입·사진 메타데이터 보조 코드를 제거했습니다.
- 여행기 작성은 기기에서 사진을 업로드합니다. 여행 기록에서 사진을 가져오지 않습니다.
- backend V51에서 기록 테이블과 데이터를 삭제하고 기록 전용 객체를 스토리지 cleanup 대상으로 전환합니다. 다른 기능이 참조하는 공용 사진은 유지합니다.

## 갱신 기준

- 라우트를 추가/삭제/변경하면 이 문서와 `.agent/docs/generated/ui_inventory.md`를 갱신합니다.
- 인증 메타 변경 시 `frontend/src/router/guards.ts`도 함께 확인합니다.
