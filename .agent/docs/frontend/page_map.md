# 프론트엔드 페이지 맵

현재 활성 화면은 `frontend/src/router/index.ts`의 Vue Router 라우트가 기준입니다.

> 제품 전환 목표: 독립 `/record`, `/trips/:tripId/swipe`, story/feed 형식은 제거하고 `/home` 관광지 배경 선호 수집, `/trips/:tripId/vote`, 커뮤니티 thread 형식으로 교체합니다. 아래 표는 코드 변경 전 현재 구현 인벤토리이며 목표 정책은 `../product-specs/product_experience_policy.md`를 따릅니다.

| 경로 | 이름 | Page | 인증 |
| :--- | :--- | :--- | :--- |
| `/` | Landing | `frontend/src/pages/LandingPage.vue` | 공개 |
| `/login` | Login | `frontend/src/pages/LoginPage.vue` | guest only |
| `/register` | Register | `frontend/src/pages/RegisterPage.vue` | guest only |
| `/home` | Home | `frontend/src/pages/HomePage.vue` | 필요 |
| `/my-trips` | MyTrips | `frontend/src/pages/MyTripsPage.vue` | 필요 |
| `/trips/:tripId/swipe` | Swipe | `frontend/src/pages/SwipePage.vue` | 필요 |
| `/trips/:tripId/route` | Route | `frontend/src/pages/RoutePage.vue` | 필요 |
| `/community` | Community | `frontend/src/pages/CommunityPage.vue` | 공개 |
| `/community/feed` | Feed | `frontend/src/pages/FeedPage.vue` | 공개 |
| `/community/stories` | Stories | `frontend/src/pages/StoriesPage.vue` | 공개 |
| `/community/story-write` | StoryWrite | `frontend/src/pages/StoryWritePage.vue` | 필요 |
| `/record` | Record | `frontend/src/pages/RecordPage.vue` | 필요 |
| `/mypage` | MyPage | `frontend/src/pages/MyPage.vue` | 필요 |
| `/settings` | Settings | `frontend/src/pages/SettingsPage.vue` | 필요 |
| `/:pathMatch(.*)*` | NotFound | `frontend/src/pages/NotFoundPage.vue` | 공개 |

## 갱신 기준

- 라우트를 추가/삭제/변경하면 이 문서와 `.agent/docs/generated/ui_inventory.md`를 갱신합니다.
- 인증 메타 변경 시 `frontend/src/router/guards.ts`도 함께 확인합니다.
