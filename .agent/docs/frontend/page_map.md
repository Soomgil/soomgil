# 프론트엔드 페이지 맵

현재 활성 화면은 `frontend/src/router/index.ts`의 Vue Router 라우트가 기준입니다.

> 커뮤니티 thread 형식과 `/trips/:tripId/vote`는 구현 완료 상태입니다. 독립 `/record`와 `/swipe` 정리는 아직 진행 중이며 목표 정책은 `../product-specs/product_experience_policy.md`를 따릅니다.

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
| `/trips/:tripId/vote` | TripVote | `frontend/src/pages/TripVotePage.vue` | 필요 |
| `/community` | Community | `frontend/src/pages/CommunityFeedPage.vue` | 공개 |
| `/community/threads/:threadId` | CommunityThread | `frontend/src/pages/CommunityThreadDetailPage.vue` | 공개 |
| `/community/feed` | Feed | `/community` redirect | 공개 |
| `/community/stories` | Stories | `/community` redirect | 공개 |
| `/community/story-write` | StoryWrite | `/community` redirect | 공개 |
| `/record` | Record | `frontend/src/pages/RecordPage.vue` | 필요 |
| `/mypage` | MyPage | `frontend/src/pages/MyPage.vue` | 필요 |
| `/mypage/:userId` | UserProfile | `frontend/src/pages/UserProfilePage.vue` | 공개 |
| `/settings` | Settings | `frontend/src/pages/SettingsPage.vue` | 필요 |
| `/admin/moderation` | AdminModeration | `frontend/src/pages/AdminModerationPage.vue` | 필요 |
| `/:pathMatch(.*)*` | NotFound | `frontend/src/pages/NotFoundPage.vue` | 공개 |

## 홈 화면

- `/home`은 화이트 종이 질감 위에 수상작을 중앙 배치하고 먹 번짐 마스크로 가장자리를 표현합니다. 검색창은 기존 캡슐과 카테고리 버튼 디자인을 사용합니다.
- 사진은 원본 크기가 기본이며 가로 사진 너비 720px, 세로 사진 높이 520px가 최소 목표입니다. 화면이 작으면 전시 공간을 우선하고 비율을 유지합니다.
- 검색 범위(전체/계획/여행지/커뮤니티/유저)를 결과 화면의 전체/여행/장소/여행기/사용자 탭으로 변환해 `/search?q=...&tab=...`으로 이동합니다.
- 작품 아래의 둘러보기는 장소명, 없으면 지역명으로 장소 검색을 엽니다. 확인된 장소 식별자가 없어 직접 상세 화면으로 연결하지 않습니다.
- 작품 출처, 수동 사진 전환과 마스크가 없는 원본 보기 링크를 제공합니다.
- 최근 검색어는 브라우저에 최대 5개 저장하고 전체 삭제할 수 있습니다.
- 사진 조회/로딩 실패와 빈 목록 상태에서도 검색을 이용할 수 있습니다.
- 기존 홈의 콘텐츠 목록과 해당 목록용 API 호출을 제거했습니다. 좋아요는 수상작과 장소 식별자의 확정 연결 이후 별도로 적용합니다.

## 여행 방 진입 가드

`/trips/:tripId/route`와 `/trips/:tripId/vote`는 `frontend/src/router/guards.ts`에서
`GET /trips/{tripId}/vote-sessions/current`의 `nextScreen`으로 분기합니다.

- `VOTE` 또는 `WAITING`이면 지도 대신 `/trips/:tripId/vote`로 보냅니다.
- `MAP`이면 투표 화면 대신 `/trips/:tripId/route`로 보냅니다.
- 게이트 조회가 실패하면 여행 방 진입 자체를 막지 않고 지도로 통과시킵니다.

## 제거된 화면

여행 스냅샷 게시글 UI는 신규 커뮤니티에서 사용하지 않아 제거했습니다.

- `CommunityPage.vue`, `StoriesPage.vue`, `StoryWritePage.vue`
- `components/community/StoryCard.vue`, `StoryPostPreview.vue`, `StoryWriteModal.vue`
- `components/community/StoryDetailOverlay.vue`는 마이페이지, 홈, 검색에서 계속 사용하므로 유지합니다.

## 갱신 기준

- 라우트를 추가/삭제/변경하면 이 문서와 `.agent/docs/generated/ui_inventory.md`를 갱신합니다.
- 인증 메타 변경 시 `frontend/src/router/guards.ts`도 함께 확인합니다.
