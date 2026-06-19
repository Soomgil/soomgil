# UI / 워크스페이스 인벤토리

이 문서는 `.agent/tools/build-ui-knowledge.mjs`가 상위 워크스페이스를 읽고, frontend가 active일 때 Vue UI까지 분석해 생성한 에이전트용 지도입니다.

## 워크스페이스

| 이름 | 타입 | 경로 | 상태 | 프레임워크 | 언어 | 요약 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| frontend | frontend | `frontend` | active | Vue | TypeScript | routes 16, pages 16, components 23 |
| backend | backend | `backend` | active | Spring Boot | - | active |

## Frontend

- package: `soomgil-frontend`
- language: TypeScript
- dependencies: `@tailwindcss/vite`, `axios`, `mapbox-gl`, `pinia`, `tailwindcss`, `vue`, `vue-router`
- devDependencies: `@types/node`, `@vitejs/plugin-vue`, `@vue/tsconfig`, `typescript`, `vite`, `vue-tsc`

### 라우트

| 경로 | 이름 | Page | 인증 | Guest only |
| :--- | :--- | :--- | :--- | :--- |
| `/` | Landing | `src/pages/LandingPage.vue` | 공개 | 아니오 |
| `/login` | Login | `src/pages/LoginPage.vue` | 공개 | 예 |
| `/register` | Register | `src/pages/RegisterPage.vue` | 공개 | 예 |
| `/home` | Home | `src/pages/HomePage.vue` | 필요 | 아니오 |
| `/my-trips` | MyTrips | `src/pages/MyTripsPage.vue` | 필요 | 아니오 |
| `/trips/:tripId/swipe` | Swipe | `src/pages/SwipePage.vue` | 필요 | 아니오 |
| `/trips/:tripId/route` | Route | `src/pages/RoutePage.vue` | 필요 | 아니오 |
| `/community` | Community | `src/pages/CommunityPage.vue` | 공개 | 아니오 |
| `/community/feed` | Feed | `src/pages/FeedPage.vue` | 공개 | 아니오 |
| `/community/stories` | Stories | `src/pages/StoriesPage.vue` | 공개 | 아니오 |
| `/community/story-write` | StoryWrite | `src/pages/StoryWritePage.vue` | 필요 | 아니오 |
| `/record` | Record | `src/pages/RecordPage.vue` | 필요 | 아니오 |
| `/mypage` | MyPage | `src/pages/MyPage.vue` | 필요 | 아니오 |
| `/mypage/:userId` | UserProfile | `src/pages/UserProfilePage.vue` | 공개 | 아니오 |
| `/settings` | Settings | `src/pages/SettingsPage.vue` | 필요 | 아니오 |
| `/:pathMatch(.*)*` | NotFound | `src/pages/NotFoundPage.vue` | 공개 | 아니오 |

### Vue 모듈

#### frontend/src/app/App.vue

- 종류: component
- script: setup / ts
- headings: 없음
- forms: 0, images: 0
- asset refs: 없음
- classes: 없음

#### frontend/src/components/common/BaseAvatar.vue

- 종류: component
- script: setup / ts
- headings: 없음
- forms: 0, images: 0
- asset refs: 없음
- classes: `[`

#### frontend/src/components/common/BaseBadge.vue

- 종류: component
- script: setup / ts
- headings: 없음
- forms: 0, images: 0
- asset refs: 없음
- classes: `[`

#### frontend/src/components/common/BaseButton.vue

- 종류: component
- script: setup / ts
- headings: 없음
- forms: 0, images: 0
- asset refs: 없음
- classes: `===`, `[`, `material-symbols-rounded`, `variant`

#### frontend/src/components/common/BaseCard.vue

- 종류: component
- script: setup / ts
- headings: 없음
- forms: 0, images: 0
- asset refs: 없음
- classes: `[`, `padding,`

#### frontend/src/components/common/BaseInput.vue

- 종류: component
- script: setup / ts
- headings: 없음
- forms: 0, images: 0
- asset refs: 없음
- classes: `bg-surface`, `bg-transparent`, `border`, `border-line`, `flex`, `flex-1`, `flex-col`, `focus-within:border-brand-violet`, `focus-within:ring-2`, `focus-within:ring-brand-violet/20`, `font-semibold`, `gap-1.5`, `gap-2`, `items-center`, `material-symbols-rounded`, `outline-none`, `placeholder:text-muted/60`, `px-4`, `py-3`, `rounded-2xl`, `text-[20px]`, `text-ink`, `text-muted`, `text-xs`, `transition-all`

#### frontend/src/components/common/BaseModal.vue

- 종류: component
- script: setup / ts
- headings: 없음
- forms: 0, images: 0
- asset refs: 없음
- classes: `absolute`, `backdrop-blur-sm`, `bg-ink/40`, `bg-surface`, `border`, `border-line`, `fixed`, `flex`, `inset-0`, `items-center`, `justify-center`, `max-w-lg`, `overflow-hidden`, `p-4`, `relative`, `rounded-3xl`, `shadow-[0_24px_64px_rgba(0,0,0,0.15)]`, `w-full`, `z-[2000]`

#### frontend/src/components/common/BaseToast.vue

- 종류: component
- script: setup / ts
- headings: 없음
- forms: 0, images: 0
- asset refs: 없음
- classes: `[`, `fixed`, `flex`, `flex-col`, `gap-2`, `right-4`, `top-20`, `z-[3000]`

#### frontend/src/components/common/EmptyState.vue

- 종류: component
- script: setup / ts
- headings: 없음
- forms: 0, images: 0
- asset refs: 없음
- classes: `flex`, `flex-col`, `items-center`, `justify-center`, `material-symbols-rounded`, `mb-4`, `py-20`, `text-5xl`, `text-center`, `text-line`, `text-muted`, `text-sm`

#### frontend/src/components/common/ErrorState.vue

- 종류: component
- script: setup / ts
- headings: 없음
- forms: 0, images: 0
- asset refs: 없음
- classes: `bg-brand-violet`, `flex`, `flex-col`, `font-bold`, `hover:bg-brand-violet/90`, `items-center`, `justify-center`, `material-symbols-rounded`, `mb-4`, `px-6`, `py-2`, `py-20`, `rounded-full`, `text-5xl`, `text-brand-rose`, `text-center`, `text-muted`, `text-sm`, `text-white`, `transition-colors`

#### frontend/src/components/common/FollowListModal.vue

- 종류: component
- script: setup / ts
- headings: h2 {{ title }}
- forms: 0, images: 0
- asset refs: 없음
- classes: `material-symbols-rounded`, `story-overlay`, `story-overlay-backdrop`, `story-overlay-close`, `story-overlay-panel`

#### frontend/src/components/common/LoadingState.vue

- 종류: component
- script: classic / js
- headings: 없음
- forms: 0, images: 0
- asset refs: 없음
- classes: `animate-spin`, `border-3`, `border-line`, `border-t-brand-violet`, `flex`, `h-8`, `items-center`, `justify-center`, `py-20`, `rounded-full`, `w-8`

#### frontend/src/components/community/StoryCard.vue

- 종류: component
- script: setup / ts
- headings: h3 {{ story.title }}
- forms: 0, images: 1
- asset refs: 없음
- classes: `aspect-[4/3]`, `bg-brand-violet`, `bg-surface`, `bg-surface-2`, `border`, `border-line`, `duration-500`, `flex`, `flex-col`, `font-bold`, `font-semibold`, `gap-1`, `gap-2`, `gap-3`, `group`, `group-hover:scale-105`, `h-6`, `h-full`, `hover:border-brand-violet/20`, `hover:shadow-[0_12px_32px_rgba(0,102,255,0.08)]`, `items-center`, `justify-center`, `leading-snug`, `line-clamp-2`, `material-symbols-rounded`, `mb-2`, `ml-auto`, `mt-3`, `object-cover`, `overflow-hidden`

#### frontend/src/components/community/StoryWriteModal.vue

- 종류: component
- script: setup / ts
- headings: h1 당신의 여행을 들려주세요, h3 작성 미리보기, h3 {{ previewTitle }}
- forms: 1, images: 2
- asset refs: 없음
- classes: `avatar`, `btn`, `carousel-btn`, `feed-photo-count`, `feed-photo-frame`, `feed-photo-nav`, `feed-photo-open`, `field`, `ghost`, `material-symbols-rounded`, `next`, `next-btn`, `prev`, `prev-btn`, `primary`, `story-author`, `story-body`, `story-overlay`, `story-overlay-backdrop`, `story-overlay-close`, `story-overlay-panel`, `story-post`, `story-post-head`, `tag`

#### frontend/src/components/community/UserProfileModal.vue

- 종류: component
- script: setup / ts
- headings: h2 {{ user.displayName }}, h3 auto_stories {{ user.displayName }}님의 여행기, h3 {{ story.title }}
- forms: 0, images: 1
- asset refs: 없음
- classes: `material-symbols-rounded`, `mypage-hero__tag`, `mypage-section-header`, `mypage-section-title`, `mypage-stories-magazine`, `mypage-story-magazine-item`, `section-icon`, `section-icon--violet`, `story-date`, `story-magazine-body`, `story-magazine-meta`, `story-magazine-thumb`, `story-magazine-title`, `story-overlay`, `story-overlay-backdrop`, `story-overlay-close`, `story-overlay-panel`, `story-stats-row`, `user-profile-card`

#### frontend/src/components/layout/AppHeader.vue

- 종류: component
- script: setup / ts
- headings: 없음
- forms: 0, images: 1
- asset refs: `/images/soomgil_logo_none_text.png`
- classes: `brand`, `nav`, `topbar`

#### frontend/src/components/layout/AppShell.vue

- 종류: component
- script: setup / ts
- headings: 없음
- forms: 0, images: 0
- asset refs: 없음
- classes: `flex`, `flex-1`, `flex-col`, `min-h-screen`

#### frontend/src/components/mypage/LikedPlacesModal.vue

- 종류: component
- script: setup / ts
- headings: h2 favorite 좋아요한 장소, h3 {{ place.placeName }}
- forms: 0, images: 1
- asset refs: 없음
- classes: `material-symbols-rounded`, `mypage-header-search-row`, `mypage-place-card`, `mypage-places-grid`, `mypage-search-count`, `mypage-search-inline`, `mypage-section-header`, `mypage-section-title`, `place-desc-text`, `place-heart-btn`, `place-img-wrap`, `place-info-wrap`, `place-region-category`, `place-tag-pill`, `place-tag-row`, `place-title-h3`, `section-icon`, `section-icon--rose`, `story-overlay`, `story-overlay-backdrop`, `story-overlay-close`, `story-overlay-panel`

#### frontend/src/components/mypage/MyStoriesModal.vue

- 종류: component
- script: setup / ts
- headings: h2 auto_stories 내 여행기, h3 {{ story.title }}
- forms: 0, images: 1
- asset refs: 없음
- classes: `material-symbols-rounded`, `mypage-section-header`, `mypage-section-title`, `mypage-stories-magazine`, `mypage-story-magazine-item`, `section-icon`, `section-icon--violet`, `story-date`, `story-magazine-body`, `story-magazine-meta`, `story-magazine-thumb`, `story-magazine-title`, `story-overlay`, `story-overlay-backdrop`, `story-overlay-close`, `story-overlay-panel`, `story-stats-row`

#### frontend/src/components/swipe/PlaceSwipeCard.vue

- 종류: component
- script: setup / ts
- headings: h3 {{ place.placeName }}
- forms: 0, images: 1
- asset refs: 없음
- classes: `absolute`, `aspect-[3/4]`, `backdrop-blur-sm`, `bg-gradient-to-t`, `bg-white/20`, `bottom-0`, `cursor-grab`, `flex`, `font-black`, `font-semibold`, `from-black/70`, `gap-2`, `h-full`, `inset-0`, `leading-tight`, `left-0`, `max-w-[380px]`, `mb-3`, `mt-1`, `object-cover`, `overflow-hidden`, `p-6`, `px-2.5`, `py-0.5`, `relative`, `right-0`, `rounded-[32px]`, `rounded-full`, `select-none`, `shadow-[0_20px_60px_rgba(0,0,0,0.12)]`

#### frontend/src/components/swipe/SwipeActionBar.vue

- 종류: component
- script: setup / ts
- headings: 없음
- forms: 0, images: 0
- asset refs: 없음
- classes: `bg-white`, `border-2`, `border-brand-rose/30`, `border-brand-violet/30`, `border-brand-yellow/30`, `flex`, `gap-5`, `h-14`, `h-16`, `hover:border-brand-rose`, `hover:border-brand-violet`, `hover:border-brand-yellow`, `hover:scale-110`, `items-center`, `justify-center`, `material-symbols-rounded`, `rounded-full`, `shadow-lg`, `text-2xl`, `text-3xl`, `text-brand-rose`, `text-brand-violet`, `text-brand-yellow`, `transition-all`, `w-14`, `w-16`

#### frontend/src/components/trip/BoardingPassCard.vue

- 종류: component
- script: setup / ts
- headings: h2 {{ trip.title }}
- forms: 0, images: 1
- asset refs: `@/assets/images/soomgil_logo_none_text.png`
- classes: `-bottom-3`, `-left-3`, `-space-x-2`, `-top-3`, `absolute`, `bg-bg`, `bg-brand-violet/10`, `bg-line`, `bg-surface-2`, `bg-transparent`, `block`, `boarding-pass-card`, `border`, `border-2`, `border-dashed`, `border-l`, `border-line`, `border-line/50`, `border-surface`, `flex`, `flex-1`, `flex-col`, `font-black`, `font-bold`, `gap-1`, `gap-2`, `gap-4`, `gap-x-6`, `gap-y-2`, `grid`

#### frontend/src/components/trip/TripCard.vue

- 종류: component
- script: setup / ts
- headings: h3 {{ trip.title }}
- forms: 0, images: 0
- asset refs: 없음
- classes: `-space-x-1.5`, `bg-center`, `bg-cover`, `bg-surface`, `border`, `border-line`, `flex`, `flex-1`, `font-bold`, `gap-4`, `h-16`, `hover:border-brand-violet/30`, `hover:shadow-[0_8px_24px_rgba(0,102,255,0.06)]`, `items-center`, `material-symbols-rounded`, `min-w-0`, `mt-0.5`, `mt-2`, `p-4`, `rounded-2xl`, `rounded-xl`, `shrink-0`, `text-ink`, `text-left`, `text-muted`, `text-xs`, `transition-all`, `truncate`, `w-16`, `w-full`

#### frontend/src/pages/CommunityPage.vue

- 종류: page
- script: setup / ts
- headings: h1 여행의 기록 을 나누고, 새로운 루트를 발견하세요, h3 {{ popularStories[popularIndex].title }}, h2 dynamic_feed 전체 여행기, h3 {{ story.title }}, h2 dynamic_feed 최신 여행 이야기, h3 {{ story.title }}
- forms: 0, images: 3
- asset refs: 없음
- classes: `===`, `active:`, `all-stories-section`, `animated-finger`, `btn`, `carousel-btn`, `comment-count-badge`, `comment-submit-btn`, `community-content-container`, `community-hero-header`, `community-page`, `community-story-actions`, `community-story-search`, `community-story-search-btn`, `compact-title`, `currentPage`, `eyebrow`, `fc-actions`, `fc-author-badge`, `fc-avatar`, `fc-body`, `fc-item`, `fc-meta`, `fc-name`, `fc-reply`, `fc-text`, `fc-time`, `feed-comment-composer`, `feed-comment-header`, `feed-comment-input-area`

#### frontend/src/pages/FeedPage.vue

- 종류: page
- script: setup / ts
- headings: h1 여행자들의 피드 에서 실시간 영감을 얻어보세요, h2 dynamic_feed 최신 여행 이야기, h3 {{ story.title }}, h3 tag 인기 해시태그, h3 forum 댓글 {{ comments.length }}
- forms: 0, images: 1
- asset refs: 없음
- classes: `animated-finger`, `comment-composer-tools`, `comment-count-badge`, `comment-submit-btn`, `comment-submit-row`, `comment-tool-btn`, `community-hero-header`, `compact-title`, `eyebrow`, `fc-actions`, `fc-author-badge`, `fc-avatar`, `fc-body`, `fc-item`, `fc-meta`, `fc-name`, `fc-reply`, `fc-text`, `fc-time`, `feed-comment-composer`, `feed-comment-header`, `feed-comment-input-area`, `feed-comment-input-wrap`, `feed-comment-my-avatar`, `feed-comment-scroll`, `feed-comment-widget`, `feed-layout`, `feed-page`, `feed-scroll-guide`, `feed-scroll-guide-pill`

#### frontend/src/pages/HomePage.vue

- 종류: page
- script: setup / ts
- headings: h2 어떤 여행을 찾고 계신가요?, h1 여행의 시작은 설렘에서부터, h3 {{ slide.title }}, h3 내 취향 수집, h3 지도에서 루트 만들기, h3 친구 초대하기
- forms: 0, images: 4
- asset refs: `/images/랜딩페이지/busan.png`, `/images/랜딩페이지/daejeon.png`, `/images/랜딩페이지/gyeongju.png`, `/images/랜딩페이지/jeju.png`, `/images/랜딩페이지/jeonju.png`
- classes: `===`, `active:`, `activeSearchTab`, `avatar`, `avatars`, `btn`, `btn-google`, `btn-kakao`, `card-tag`, `cat.key`, `cmn-tag`, `content-container`, `eyebrow`, `ghost`, `home-action-card`, `home-action-icon`, `home-action-row`, `home-action-text`, `home-community-author`, `home-community-card`, `home-community-card-body`, `home-community-card-img`, `home-community-card-meta`, `home-community-grid`, `home-community-stats`, `home-hero`, `home-hero-card-overlay`, `home-hero-content`, `home-hero-copy`, `home-hero-dots`

#### frontend/src/pages/LandingPage.vue

- 종류: page
- script: setup / ts
- headings: h1 함께 그리는 설렘, 여행의 모든 순간, h2 서로의 취향을 확인하는 가장 쉬운 방법, h2 지도 위에서 펼쳐지는 실시간 공동 작업, h2 똑똑한 AI가 완성하는 맞춤형 여행 코스, h2 검증된 여행 전문가들의 추천 루트, h3 {{ card.title }}
- forms: 0, images: 6
- asset refs: `/images/soomgil_logo_extract.png`, `/images/랜딩페이지/ai_simple.png`, `/images/랜딩페이지/busan.png`, `/images/랜딩페이지/daejeon.png`, `/images/랜딩페이지/gyeongju.png`, `/images/랜딩페이지/jeju.png`, `/images/랜딩페이지/jeonju.png`, `/images/랜딩페이지/korea_hero.png`, `/images/랜딩페이지/map_bg.png`, `@/assets/images/랜딩페이지/busan.png`
- classes: `app-shell`, `badge`, `btn`, `btn-premium`, `card-badges`, `collab-cursor`, `collab-map`, `container`, `cta-content`, `cta-section`, `cursor-label`, `cursor-pointer`, `eyebrow`, `feature-step`, `features-section`, `gallery-card`, `gallery-info`, `gallery-track`, `ghost`, `glass-card`, `gradient-text`, `hero-content`, `hero-cta`, `hero-logo`, `hero-overlay`, `hero-section`, `horizontal-header`, `horizontal-scroll-container`, `horizontal-section`, `keyword-tag`

#### frontend/src/pages/LoginPage.vue

- 종류: page
- script: setup / ts
- headings: h1 함께 만들던 여행을 바로 이어가세요, h2 로그인
- forms: 1, images: 0
- asset refs: `/images/랜딩페이지/korea_hero.png`
- classes: `app-shell`, `auth-card`, `auth-check`, `auth-field-wrap`, `auth-form`, `auth-form-head`, `auth-form-options`, `auth-main-action`, `auth-modern-card`, `auth-modern-form`, `auth-modern-page`, `auth-page`, `auth-switch`, `auth-visual-content`, `auth-visual-image`, `auth-visual-panel`, `btn`, `divider`, `eyebrow`, `field`, `google`, `kakao`, `material-symbols-rounded`, `muted`, `naver`, `oauth-btn`, `oauth-row`, `primary`, `small`

#### frontend/src/pages/MyPage.vue

- 종류: page
- script: setup / ts
- headings: h1 나의 여행 프로필, h2 {{ mockUser.displayName }}, h2 favorite 좋아요한 장소, h3 {{ place.placeName }}, h2 auto_stories 내 여행기, h3 {{ story.title }}
- forms: 0, images: 2
- asset refs: 없음
- classes: `avatar-link-badge`, `btn-more-map`, `cafe`, `circular-progress-bar`, `city`, `culture`, `divider`, `edit`, `eyebrow`, `gradient-text`, `insight-card`, `insight-card-header`, `insight-subtitle`, `korea-map-container`, `liked-places-layout`, `map-insight-card`, `map-insight-content`, `map-stats-list`, `map-stats-panel`, `material-symbols-rounded`, `minimal-stat-icon`, `minimal-stat-item`, `minimal-stat-label`, `minimal-stat-value`, `mypage-body-container`, `mypage-glass-container`, `mypage-header-search-row`, `mypage-hero`, `mypage-hero__avatar`, `mypage-hero__avatar-container`

#### frontend/src/pages/MyTripsPage.vue

- 종류: page
- script: setup / ts
- headings: h1 내 여행 준비 를 이어가세요
- forms: 0, images: 1
- asset refs: `/images/soomgil_logo_none_text.png`, `/images/랜딩페이지/busan.png`
- classes: `airport-code`, `app-shell`, `avatar`, `boarding-pass-card`, `boarding-pass-container`, `btn`, `city-name`, `d-day-badge`, `departure`, `destination`, `detail-item`, `eyebrow`, `label`, `lead`, `line`, `logo-image`, `logo-text`, `material-symbols-rounded`, `my-trips-dashboard`, `next-trip-members`, `next-trip-panel`, `plane-icon`, `primary`, `route-path`, `route-point`, `section`, `ticket-badge`, `ticket-details`, `ticket-header`, `ticket-logo`

#### frontend/src/pages/NotFoundPage.vue

- 종류: page
- script: setup / ts
- headings: h1 페이지를 찾을 수 없습니다
- forms: 0, images: 0
- asset refs: 없음
- classes: `bg-brand-violet`, `bg-clip-text`, `bg-gradient-to-br`, `flex`, `font-black`, `font-bold`, `from-brand-violet`, `hover:bg-brand-violet/90`, `items-center`, `justify-center`, `mb-8`, `min-h-screen`, `mt-2`, `mt-4`, `px-6`, `px-8`, `py-3`, `rounded-full`, `text-2xl`, `text-8xl`, `text-center`, `text-ink`, `text-muted`, `text-transparent`, `text-white`, `to-brand-blue`, `transition-colors`

#### frontend/src/pages/RecordPage.vue

- 종류: page
- script: setup / ts
- headings: h1 여행의 기록 을 한눈에 모아보세요, h3 전체 기록, h3 {{ trip.title }}, h3 사진 추가
- forms: 1, images: 4
- asset refs: 없음
- classes: `avatar`, `btn`, `content-container`, `eyebrow`, `field`, `form-label`, `form-label-text`, `ghost`, `icon-btn`, `is-all`, `isUploadModalOpen`, `lead`, `material-symbols-rounded`, `modal-card`, `modal-header`, `modal-overlay`, `next`, `overlay-schedule`, `overlay-uploader`, `prev`, `preview-remove-btn`, `primary`, `record-action-icon`, `record-actions`, `record-divider`, `record-masonry`, `record-masonry-item`, `record-masonry-overlay`, `record-page`, `record-page-head`

#### frontend/src/pages/RegisterPage.vue

- 종류: page
- script: setup / ts
- headings: h1 친구들과 여행 취향부터 맞춰보세요, h2 회원가입
- forms: 1, images: 0
- asset refs: `/images/랜딩페이지/jeonju.png`
- classes: `app-shell`, `auth-card`, `auth-check`, `auth-field-wrap`, `auth-form`, `auth-form-head`, `auth-main-action`, `auth-modern-card`, `auth-modern-form`, `auth-modern-page`, `auth-page`, `auth-switch`, `auth-terms-check`, `auth-visual-content`, `auth-visual-image`, `auth-visual-panel`, `btn`, `divider`, `eyebrow`, `field`, `google`, `kakao`, `material-symbols-rounded`, `muted`, `naver`, `oauth-btn`, `oauth-row`, `primary`, `small`

#### frontend/src/pages/RoutePage.vue

- 종류: page
- script: setup / ts
- headings: h3 {{ trip.title }}
- forms: 0, images: 0
- asset refs: 없음
- classes: `[`, `avatar`, `avatars`, `avatars-group`, `btn`, `compact-settings-btn`, `day-date`, `day-pill`, `day-scroll-btn`, `day-tabs`, `day-tabs-container`, `day-title`, `full-screen`, `ghost`, `grip-icon`, `itinerary`, `line`, `material-symbols-rounded`, `members-count`, `muted`, `next`, `prev`, `route-connector`, `route-connector-line`, `route-page-section`, `route-unlink-icon`, `section`, `sidebar`, `sidebar-content`, `small`

#### frontend/src/pages/SettingsPage.vue

- 종류: page
- script: setup / ts
- headings: h1 설정, h2 프로필, h2 알림, h2 계정
- forms: 0, images: 0
- asset refs: 없음
- classes: `accent-brand-violet`, `bg-brand-violet`, `bg-surface`, `border`, `border-brand-rose/30`, `border-line`, `flex`, `font-black`, `font-bold`, `font-semibold`, `gap-4`, `h-16`, `hover:bg-brand-rose/5`, `hover:bg-surface-2`, `items-center`, `justify-between`, `justify-center`, `material-symbols-rounded`, `max-w-2xl`, `mb-4`, `mb-6`, `mb-8`, `ml-auto`, `mx-auto`, `p-6`, `px-4`, `px-6`, `py-12`, `py-2`, `py-3`

#### frontend/src/pages/StoriesPage.vue

- 종류: page
- script: setup / ts
- headings: h1 우리들의 여행 이야기, h3 {{ story.title }}
- forms: 0, images: 1
- asset refs: 없음
- classes: `btn`, `detail-topline`, `eyebrow`, `ghost`, `lead`, `muted`, `post-type`, `primary`, `section`, `section-title`, `story`, `story-list-card`, `story-list-grid`

#### frontend/src/pages/StoryWritePage.vue

- 종류: page
- script: setup / ts
- headings: h1 당신의 여행을 들려주세요, h3 작성 미리보기, h3 {{ previewTitle }}
- forms: 1, images: 2
- asset refs: 없음
- classes: `avatar`, `btn`, `carousel-btn`, `content-container`, `detail-topline`, `editor-toolbar`, `eyebrow`, `feed-photo-count`, `feed-photo-frame`, `feed-photo-nav`, `feed-photo-open`, `field`, `form-group`, `form-group-icon-wrap`, `ghost`, `lead`, `material-symbols-rounded`, `muted`, `next`, `next-btn`, `prev`, `prev-btn`, `primary`, `section`, `section-title`, `small`, `story-author`, `story-body`, `story-post`, `story-post-head`

#### frontend/src/pages/SwipePage.vue

- 종류: page
- script: setup / ts
- headings: h1 우리만의 여행 취향 을 모아보세요, h2 취향 수집 완료!, h2 {{ currentPlace.placeName }}
- forms: 0, images: 1
- asset refs: 없음
- classes: `[swipeClass,`, `app-shell`, `btn`, `community-hero-header`, `eyebrow`, `lead`, `material-symbols-rounded`, `meta-row`, `muted`, `panel`, `primary`, `section`, `section-title`, `swipe-body`, `swipe-card`, `swipe-layout`, `swipe-main-column`, `swipe-stage`, `swipe-workspace-card`, `swipe-xp-bar`, `swipe-xp-count`, `swipe-xp-fill`, `swipe-xp-track`, `tag`, `tag-row`, `{`

#### frontend/src/pages/UserProfilePage.vue

- 종류: page
- script: setup / ts
- headings: h1 {{ user.displayName }}님의 여행 프로필, h2 {{ user.displayName }}, h2 favorite 좋아요한 장소, h3 {{ place.placeName }}, h2 auto_stories {{ user.displayName }}님의 여행기, h3 {{ story.title }}
- forms: 0, images: 2
- asset refs: 없음
- classes: `btn`, `btn-more-map`, `cafe`, `circular-progress-bar`, `city`, `culture`, `eyebrow`, `gradient-text`, `insight-card`, `insight-card-header`, `insight-subtitle`, `korea-map-container`, `liked-places-layout`, `map-insight-card`, `map-insight-content`, `map-stats-list`, `map-stats-panel`, `material-symbols-rounded`, `minimal-stat-icon`, `minimal-stat-item`, `minimal-stat-label`, `minimal-stat-value`, `mypage-body-container`, `mypage-glass-container`, `mypage-header-search-row`, `mypage-hero`, `mypage-hero__avatar`, `mypage-hero__avatar-container`, `mypage-hero__avatar-ring`, `mypage-hero__content`

### Styles

#### frontend/src/styles/main.css

- Tailwind import: 있음
- tokens: `--color-bg`, `--color-brand-blue`, `--color-brand-cyan`, `--color-brand-lavender`, `--color-brand-rose`, `--color-brand-violet`, `--color-brand-yellow`, `--color-glass`, `--color-ink`, `--color-line`, `--color-muted`, `--color-surface`, `--color-surface-2`, `--font-sans`
- animations: 없음

#### frontend/src/styles/mypage.css

- Tailwind import: 없음
- tokens: 없음
- animations: `floatY`, `headlightFlicker`, `mypageFadeIn`, `pinPulse`, `shine`, `smokeFloat`, `tagWiggle`, `vanDrive`

#### frontend/src/styles/original.css

- Tailwind import: 없음
- tokens: `--bg`, `--blue`, `--cyan`, `--day-color`, `--day-color-bg`, `--day-color-border`, `--detailbar-gap`, `--detailbar-offset`, `--detailbar-width`, `--feed-list-height`, `--feed-panel-offset`, `--font-sans`, `--glint`, `--ink`, `--lavender`, `--line`, `--muted`, `--rose`, `--shadow`, `--sidebar-width`, `--soft-shadow`, `--surface`, `--surface-2`, `--violet`, `--yellow`
- animations: `activeDotPop`, `aiGlowAnimation`, `clickParticleFade`, `fadeInUp`, `likeEmojiFloat`, `likeParticleBurst`, `likeParticleTrail`, `mic-pulse`, `nopeEmojiFloat`, `nopeParticleBurst`, `nopeParticleTrail`, `popover-in`, `pulseSpark`, `routeBurstDot`, `routeBurstGlint`, `routeBurstPin`, `scrollArrowBounce`, `scrollLineMove`, `superlikeEmojiFloat`, `superlikeParticleBurst`, `superlikeParticleTrail`, `swipeFingerAnimNew`, `swipeParticleFade`, `swipeRippleAnim`, `swipeUpAnim`, `typingBounce`, `wave-bounce`

#### frontend/src/styles/scroll-explore.css

- Tailwind import: 없음
- tokens: `--bg`, `--blue`, `--glass`, `--ink`, `--line`, `--muted`, `--rose`, `--shadow`, `--surface`, `--violet`
- animations: `marquee`, `scroll-wheel`

## 하네스 사용법

- 구조 변경 후 `npm --prefix .agent run harness:index`로 재생성합니다.
- `npm --prefix .agent run harness:check`는 워크스페이스 경계를 확인하고, frontend가 active일 때 라우트, 빌드, SPA smoke까지 확인합니다.

