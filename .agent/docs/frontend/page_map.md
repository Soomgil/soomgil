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
