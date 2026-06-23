# UI / 워크스페이스 인벤토리

이 문서는 `.agent/tools/build-ui-knowledge.mjs`가 상위 워크스페이스를 읽고, frontend가 active일 때 Vue UI까지 분석해 생성한 에이전트용 지도입니다.

## 워크스페이스

| 이름 | 타입 | 경로 | 상태 | 프레임워크 | 언어 | 요약 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| frontend | frontend | `frontend` | active | Vue | TypeScript | routes 21, pages 22, components 30 |
| backend | backend | `backend` | active | Spring Boot | - | active |

## Frontend

- package: `soomgil-frontend`
- language: TypeScript
- dependencies: `@stomp/stompjs`, `@tailwindcss/vite`, `axios`, `express`, `mapbox-gl`, `pinia`, `tailwindcss`, `vue`, `vue-router`
- devDependencies: `@types/node`, `@vitejs/plugin-vue`, `@vue/test-utils`, `@vue/tsconfig`, `jsdom`, `typescript`, `vite`, `vitest`, `vue-tsc`

### 라우트

| 경로 | 이름 | Page | 인증 | Guest only |
| :--- | :--- | :--- | :--- | :--- |
| `/` | Landing | `src/pages/LandingPage.vue` | 공개 | 아니오 |
| `/login` | Login | `src/pages/LoginPage.vue` | 공개 | 예 |
| `/register` | Register | `src/pages/RegisterPage.vue` | 공개 | 예 |
| `/verify-email` | VerifyEmail | `src/pages/VerifyEmailPage.vue` | 공개 | 예 |
| `/reset-password` | ResetPassword | `src/pages/ResetPasswordPage.vue` | 공개 | 아니오 |
| `/home` | Home | `src/pages/HomePage.vue` | 필요 | 아니오 |
| `/search` | Search | `src/pages/SearchResultsPage.vue` | 필요 | 아니오 |
| `/my-trips` | MyTrips | `src/pages/MyTripsPage.vue` | 필요 | 아니오 |
| `/trip-invites/:inviteCode` | TripInviteAccept | `src/pages/TripInviteAcceptPage.vue` | 필요 | 아니오 |
| `/swipe` | Swipe | `src/pages/SwipePage.vue` | 필요 | 아니오 |
| `/trips/:tripId/swipe` | Route | `src/pages/RoutePage.vue` | 필요 | 아니오 |
| `/community` | Community | `src/pages/CommunityPage.vue` | 공개 | 아니오 |
| `/community/feed` | Feed | `src/pages/FeedPage.vue` | 공개 | 아니오 |
| `/community/stories` | Stories | `src/pages/StoriesPage.vue` | 공개 | 아니오 |
| `/community/story-write` | StoryWrite | `src/pages/StoryWritePage.vue` | 필요 | 아니오 |
| `/record` | Record | `src/pages/RecordPage.vue` | 필요 | 아니오 |
| `/mypage` | MyPage | `src/pages/MyPage.vue` | 필요 | 아니오 |
| `/mypage/:userId` | UserProfile | `src/pages/UserProfilePage.vue` | 공개 | 아니오 |
| `/settings` | Settings | `src/pages/SettingsPage.vue` | 필요 | 아니오 |
| `/admin/moderation` | AdminModeration | `src/pages/AdminModerationPage.vue` | 필요 | 아니오 |
| `/:pathMatch(.*)*` | NotFound | `src/pages/NotFoundPage.vue` | 공개 | 아니오 |

### Vue 모듈

#### frontend/src/app/App.vue

- 종류: component
- script: setup / ts
- headings: 없음
- forms: 0, images: 0
- asset refs: 없음
- classes: 없음

#### frontend/src/components/auth/OAuthButtons.vue

- 종류: component
- script: setup / ts
- headings: 없음
- forms: 0, images: 0
- asset refs: `/images/oauth/kakao-login.png`
- classes: `google`, `google-provider-icon`, `google-provider-label`, `kakao`, `kakao-provider-icon`, `kakao-provider-label`, `oauth-provider-button`, `oauth-provider-stack`

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
- headings: h3 {{ title }}
- forms: 0, images: 0
- asset refs: 없음
- classes: `btn`, `empty-state`, `empty-state-action`, `empty-state-description`, `empty-state-icon`, `empty-state-title`, `flex`, `flex-col`, `items-center`, `justify-center`, `material-symbols-rounded`, `primary`, `px-6`, `py-20`, `text-center`

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
- forms: 0, images: 1
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
- headings: 없음
- forms: 0, images: 2
- asset refs: 없음
- classes: `aspect-[4/3]`, `bg-brand-violet`, `bg-surface`, `bg-surface-2`, `border`, `border-line`, `duration-500`, `flex`, `flex-col`, `font-bold`, `gap-2`, `group`, `group-hover:scale-105`, `h-6`, `h-full`, `hover:border-brand-violet/20`, `hover:shadow-[0_12px_32px_rgba(0,102,255,0.08)]`, `items-center`, `justify-center`, `mb-2`, `object-cover`, `overflow-hidden`, `p-4`, `relative`, `rounded-[24px]`, `rounded-full`, `text-[10px]`, `text-left`, `text-white`, `transition-all`

#### frontend/src/components/community/StoryWriteModal.vue

- 종류: component
- script: setup / ts
- headings: h1 당신의 여행을 들려주세요, h3 작성 미리보기, h3 {{ previewTitle }}
- forms: 1, images: 2
- asset refs: 없음
- classes: `avatar`, `btn`, `carousel-btn`, `feed-photo-count`, `feed-photo-frame`, `feed-photo-nav`, `feed-photo-open`, `field`, `ghost`, `material-symbols-rounded`, `next`, `next-btn`, `prev`, `prev-btn`, `primary`, `story-author`, `story-body`, `story-overlay`, `story-overlay-backdrop`, `story-overlay-close`, `story-overlay-panel`, `story-post`, `story-post-head`, `tag`

#### frontend/src/components/layout/AppHeader.vue

- 종류: component
- script: setup / ts
- headings: 없음
- forms: 0, images: 1
- asset refs: `@/assets/images/soomgil_logo_none_text.png`
- classes: `brand`, `nav`, `topbar`

#### frontend/src/components/layout/AppShell.vue

- 종류: component
- script: setup / ts
- headings: 없음
- forms: 0, images: 0
- asset refs: 없음
- classes: `flex`, `flex-1`, `flex-col`, `min-h-screen`

#### frontend/src/components/map/MapDrawingOverlay.vue

- 종류: component
- script: setup / ts
- headings: 없음
- forms: 0, images: 0
- asset refs: 없음
- classes: `===`, `editable,`, `erasing:`, `map-drawing-hit-target`, `map-drawing-overlay`, `map-drawing-stroke`, `tool`, `{`

#### frontend/src/components/map/MapboxItineraryMap.vue

- 종류: component
- script: setup / ts
- headings: 없음
- forms: 0, images: 0
- asset refs: 없음
- classes: `btn`, `ghost`, `itinerary-map`, `itinerary-map__canvas`, `itinerary-map__error`

#### frontend/src/components/mypage/LikedPlacesModal.vue

- 종류: component
- script: setup / ts
- headings: h2 favorite 좋아요한 장소, h3 {{ place.placeName }}
- forms: 0, images: 1
- asset refs: 없음
- classes: `material-symbols-rounded`, `mypage-header-search-row`, `mypage-place-card`, `mypage-places-grid`, `mypage-search-count`, `mypage-search-inline`, `mypage-section-header`, `mypage-section-title`, `place-desc-text`, `place-heart-btn`, `place-image-placeholder`, `place-img-wrap`, `place-info-wrap`, `place-region-category`, `place-tag-pill`, `place-tag-row`, `place-title-h3`, `section-icon`, `section-icon--rose`, `story-overlay`, `story-overlay-backdrop`, `story-overlay-close`, `story-overlay-panel`

#### frontend/src/components/mypage/MyStoriesModal.vue

- 종류: component
- script: setup / ts
- headings: h2 auto_stories 내 여행기, h3 {{ story.title }}
- forms: 0, images: 1
- asset refs: 없음
- classes: `material-symbols-rounded`, `mypage-section-header`, `mypage-section-title`, `mypage-stories-magazine`, `mypage-story-magazine-item`, `section-icon`, `section-icon--violet`, `story-date`, `story-magazine-body`, `story-magazine-meta`, `story-magazine-thumb`, `story-magazine-title`, `story-overlay`, `story-overlay-backdrop`, `story-overlay-close`, `story-overlay-panel`, `story-stats-row`

#### frontend/src/components/mypage/MyStoryDetailModal.vue

- 종류: component
- script: setup / ts
- headings: h2 {{ post.title }}, h3 댓글 {{ post.commentCount }}
- forms: 0, images: 1
- asset refs: 없음
- classes: `btn`, `eyebrow`, `ghost`, `material-symbols-rounded`, `muted`, `my-story-body`, `my-story-comment`, `my-story-comments`, `my-story-detail`, `my-story-gallery`, `my-story-head`, `my-story-state`, `my-story-state--error`, `my-story-tags`, `story-overlay`, `story-overlay-backdrop`, `story-overlay-close`, `story-overlay-panel`

#### frontend/src/components/place/PlaceDiscoveryPanel.vue

- 종류: component
- script: setup / ts
- headings: 없음
- forms: 1, images: 2
- asset refs: 없음
- classes: `discovery-actions`, `discovery-copy`, `discovery-members`, `discovery-meta`, `discovery-panel`, `discovery-reason`, `discovery-result`, `discovery-results`, `discovery-scheduled`, `discovery-search`, `discovery-spinner`, `discovery-state`, `discovery-state--error`, `discovery-tabs`, `discovery-thumb`, `material-symbols-rounded`

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

#### frontend/src/components/trip/LegalRegionCombobox.vue

- 종류: component
- script: setup / ts
- headings: 없음
- forms: 0, images: 0
- asset refs: 없음
- classes: `===`, `active:`, `activeIndex`, `field`, `index`, `is-error`, `legal-region-combobox`, `legal-region-input-wrap`, `legal-region-option`, `legal-region-options`, `legal-region-search-icon`, `legal-region-spinner`, `legal-region-state`, `material-symbols-rounded`, `{`, `}`

#### frontend/src/components/trip/TripAccessModal.vue

- 종류: component
- script: setup / ts
- headings: h2 {{ isOwner ? '멤버 및 초대 관리' : '여행 멤버' }}, h3 멤버
- forms: 0, images: 1
- asset refs: 없음
- classes: `access-content`, `access-error`, `access-header`, `access-list`, `access-modal`, `access-overlay`, `access-section`, `access-section__head`, `eyebrow`, `icon-btn`, `material-symbols-rounded`, `member-avatar`

#### frontend/src/components/trip/TripCard.vue

- 종류: component
- script: setup / ts
- headings: h3 {{ trip.title }}
- forms: 0, images: 0
- asset refs: 없음
- classes: `-space-x-1.5`, `bg-center`, `bg-cover`, `bg-surface`, `border`, `border-line`, `flex`, `flex-1`, `font-bold`, `gap-4`, `h-16`, `hover:border-brand-violet/30`, `hover:shadow-[0_8px_24px_rgba(0,102,255,0.06)]`, `items-center`, `material-symbols-rounded`, `min-w-0`, `mt-0.5`, `mt-2`, `p-4`, `rounded-2xl`, `rounded-xl`, `shrink-0`, `text-ink`, `text-left`, `text-muted`, `text-xs`, `transition-all`, `truncate`, `w-16`, `w-full`

#### frontend/src/components/trip/TripSettingsModal.vue

- 종류: component
- script: setup / ts
- headings: h2 여행 설정, h3 여행 삭제
- forms: 1, images: 0
- asset refs: 없음
- classes: `===`, `active:`, `btn`, `danger-button`, `danger-zone`, `delete-confirmation`, `eyebrow`, `field`, `form-label`, `form-label-text`, `ghost`, `icon-btn`, `material-symbols-rounded`, `primary`, `settings-actions`, `settings-error`, `settings-form`, `settings-header`, `settings-modal`, `settings-overlay`, `status`, `status-fieldset`, `status-segments`, `{`

#### frontend/src/pages/AdminModerationPage.vue

- 종류: page
- script: setup / ts
- headings: h1 신고 및 모더레이션, h2 최근 조치 이력
- forms: 0, images: 0
- asset refs: 없음
- classes: `bg-brand-violet`, `bg-red-50`, `bg-surface`, `block`, `border`, `border-line`, `flex`, `flex-wrap`, `font-black`, `font-bold`, `gap-2`, `gap-3`, `gap-4`, `grid`, `items-center`, `justify-between`, `max-w-5xl`, `mb-12`, `mb-4`, `mb-6`, `mb-8`, `mt-1`, `mx-auto`, `my-3`, `p-4`, `p-5`, `px-3`, `px-4`, `px-6`, `py-12`

#### frontend/src/pages/CommunityPage.vue

- 종류: page
- script: setup / ts
- headings: h1 여행의 기록 을 나누고, 새로운 루트 를 발견하세요, h3 {{ currentPopular.title }}, h2 {{ currentPopular.title }}, h2 최신 여행기, h3 {{ story.title }}, h2 dynamic_feed 최신 여행 이야기
- forms: 0, images: 5
- asset refs: `/images/랜딩페이지/korea_hero.png`
- classes: `===`, `active:`, `btn`, `carousel-btn`, `community-content-container`, `community-hero-actions`, `community-hero-eyebrow`, `community-hero-gradient`, `community-hero-header`, `community-hero-lead`, `community-hero-text`, `community-hero-title`, `community-page`, `community-pagination`, `community-pill`, `community-pill-ghost`, `community-pill-primary`, `community-story-search`, `compact-title`, `currentPage`, `eyebrow`, `fc-avatar`, `feed-layout`, `feed-photo-count`, `feed-photo-nav`, `filter-pill`, `idx`, `latest-stories-eyebrow`, `latest-stories-header`, `latest-stories-icon`

#### frontend/src/pages/FeedPage.vue

- 종류: page
- script: setup / ts
- headings: h1 여행자들의 피드 에서 실시간 영감을 얻어보세요, h2 dynamic_feed 최신 여행 이야기
- forms: 0, images: 2
- asset refs: `/images/랜딩페이지/korea_hero.png`
- classes: `community-hero-header`, `compact-title`, `eyebrow`, `fc-avatar`, `feed-layout`, `feed-page`, `lead`, `material-symbols-rounded`, `section`, `section-title`, `story-feed`, `story-feed-window`, `story-post`

#### frontend/src/pages/HomePage.vue

- 종류: page
- script: setup / ts
- headings: h2 어떤 여행을 찾고 계신가요?, h1 여행의 시작은 설렘에서부터, h3 {{ slide.title }}, h3 내 취향 수집, h3 지도에서 루트 만들기, h3 친구 초대하기
- forms: 0, images: 6
- asset refs: `/images/랜딩페이지/busan.png`, `/images/랜딩페이지/jeju.png`
- classes: `===`, `active:`, `activeSearchTab`, `avatar`, `avatars`, `btn`, `card-tag`, `cat.key`, `cmn-tag`, `content-container`, `eyebrow`, `ghost`, `home-action-card`, `home-action-icon`, `home-action-row`, `home-action-text`, `home-community-author`, `home-community-card`, `home-community-card-body`, `home-community-card-img`, `home-community-card-meta`, `home-community-grid`, `home-hero`, `home-hero-card-overlay`, `home-hero-content`, `home-hero-copy`, `home-hero-dots`, `home-hero-slide`, `home-nearest-bg`, `home-nearest-card`

#### frontend/src/pages/LandingPage.vue

- 종류: page
- script: setup / ts
- headings: h1 함께 그리는 설렘, 여행의 모든 순간, h2 서로의 취향을 확인하는 가장 쉬운 방법, h2 지도 위에서 펼쳐지는 실시간 공동 작업, h2 똑똑한 AI가 완성하는 맞춤형 여행 코스, h2 검증된 여행 전문가들의 추천 루트, h3 {{ card.title }}
- forms: 0, images: 6
- asset refs: `/images/랜딩페이지/ai_simple.png`, `/images/랜딩페이지/busan.png`, `/images/랜딩페이지/daejeon.png`, `/images/랜딩페이지/gyeongju.png`, `/images/랜딩페이지/jeju.png`, `/images/랜딩페이지/jeonju.png`, `/images/랜딩페이지/korea_hero.png`, `/images/랜딩페이지/map_bg.png`, `@/assets/images/soomgil_logo_extract.png`, `@/assets/images/랜딩페이지/busan.png`
- classes: `app-shell`, `badge`, `btn`, `btn-premium`, `card-badges`, `collab-cursor`, `collab-map`, `container`, `cta-content`, `cta-section`, `cursor-label`, `cursor-pointer`, `eyebrow`, `feature-step`, `features-section`, `gallery-card`, `gallery-info`, `gallery-track`, `ghost`, `glass-card`, `gradient-text`, `hero-content`, `hero-cta`, `hero-logo`, `hero-overlay`, `hero-section`, `horizontal-header`, `horizontal-scroll-container`, `horizontal-section`, `keyword-tag`

#### frontend/src/pages/LoginPage.vue

- 종류: page
- script: setup / ts
- headings: h1 함께 만들던 여행을 바로 이어가세요, h2 로그인
- forms: 1, images: 0
- asset refs: `/images/랜딩페이지/korea_hero.png`
- classes: `app-shell`, `auth-card`, `auth-check`, `auth-feedback-slot`, `auth-field-wrap`, `auth-form`, `auth-form-head`, `auth-form-options`, `auth-main-action`, `auth-modern-card`, `auth-modern-form`, `auth-modern-page`, `auth-page`, `auth-submit-error`, `auth-success-message`, `auth-switch`, `auth-visual-content`, `auth-visual-image`, `auth-visual-panel`, `btn`, `divider`, `eyebrow`, `field`, `material-symbols-rounded`, `muted`, `primary`, `small`

#### frontend/src/pages/MyPage.vue

- 종류: page
- script: setup / ts
- headings: h1 나의 여행 프로필, h2 {{ displayName }}
- forms: 0, images: 1
- asset refs: 없음
- classes: `avatar-link-badge`, `eyebrow`, `gradient-text`, `material-symbols-rounded`, `minimal-stat-icon`, `minimal-stat-item`, `minimal-stat-label`, `minimal-stat-value`, `mypage-hero`, `mypage-hero__avatar`, `mypage-hero__avatar-container`, `mypage-hero__avatar-ring`, `mypage-hero__content`, `mypage-hero__email`, `mypage-hero__intro`, `mypage-hero__name`, `mypage-hero__name-col`, `mypage-hero__name-row`, `mypage-hero__tag`, `mypage-hero__tags`, `mypage-page-heading`, `mypage-profile-card`, `mypage-profile-minimal-stats`, `mypage-shell`, `mypage-visibility-badge`, `profile-card-details`, `profile-card-left-group`, `section`, `verified-check-badge`

#### frontend/src/pages/MyTripsPage.vue

- 종류: page
- script: setup / ts
- headings: h1 내 여행 준비 를 이어가세요, h2 {{ currentTrip.title }}, h2 여행 목록, h3 {{ trip.title }}, h3 새 여행 만들기
- forms: 1, images: 1
- asset refs: `@/assets/images/soomgil_logo_none_text.png`
- classes: `===`, `[getStatusCls(trip),`, `active`, `active:`, `activeFilter`, `airport-code`, `app-shell`, `avatar`, `boarding-pass-card`, `boarding-pass-card--placeholder`, `boarding-pass-container`, `bottom`, `btn`, `carousel-btn`, `carousel-dot`, `carousel-dots-container`, `carouselIndex`, `city-name`, `compact-title`, `createModal.isOpen.value`, `d-day-badge`, `dashed-line`, `departure`, `destination`, `detail-item`, `eyebrow`, `field`, `filter.value`, `form-label`, `form-label-text`

#### frontend/src/pages/NotFoundPage.vue

- 종류: page
- script: setup / ts
- headings: h1 페이지를 찾을 수 없습니다
- forms: 0, images: 0
- asset refs: 없음
- classes: `bg-brand-violet`, `bg-clip-text`, `bg-gradient-to-br`, `flex`, `font-black`, `font-bold`, `from-brand-violet`, `hover:bg-brand-violet/90`, `items-center`, `justify-center`, `mb-8`, `min-h-screen`, `mt-2`, `mt-4`, `px-6`, `px-8`, `py-3`, `rounded-full`, `text-2xl`, `text-8xl`, `text-center`, `text-ink`, `text-muted`, `text-transparent`, `text-white`, `to-brand-blue`, `transition-colors`

#### frontend/src/pages/OAuthCallbackPage.vue

- 종류: page
- script: setup / ts
- headings: h2 로그인 처리 중..., h2 로그인 실패
- forms: 0, images: 0
- asset refs: 없음
- classes: `app-shell`, `auth-card`, `auth-form`, `auth-main-action`, `auth-modern-card`, `auth-modern-form`, `auth-modern-page`, `auth-page`, `btn`, `material-symbols-rounded`, `muted`, `oauth-callback-state`, `oauth-error-icon`, `oauth-spinner`, `primary`, `small`

#### frontend/src/pages/RecordPage.vue

- 종류: page
- script: setup / ts
- headings: h1 여행의 기록 을 한눈에 모아보세요, h3 전체 기록, h3 {{ trip.title }}, h3 사진 추가
- forms: 1, images: 4
- asset refs: 없음
- classes: `avatar`, `btn`, `content-container`, `eyebrow`, `field`, `form-label`, `form-label-text`, `ghost`, `icon-btn`, `is-all`, `isUploadModalOpen`, `lead`, `material-symbols-rounded`, `modal-card`, `modal-header`, `modal-overlay`, `next`, `overlay-schedule`, `overlay-uploader`, `prev`, `preview-remove-btn`, `primary`, `record-action-icon`, `record-actions`, `record-divider`, `record-load-more-error`, `record-load-more-sentinel`, `record-load-more-status`, `record-masonry`, `record-masonry-add`

#### frontend/src/pages/RegisterPage.vue

- 종류: page
- script: setup / ts
- headings: h1 친구들과 여행 취향부터 맞춰보세요, h2 {{ isOAuthOnboarding ? '가입 완료' : '회원가입' }}
- forms: 1, images: 0
- asset refs: `/images/랜딩페이지/jeonju.png`
- classes: `app-shell`, `auth-card`, `auth-form`, `auth-form-head`, `auth-modern-card`, `auth-modern-form`, `auth-modern-page`, `auth-page`, `auth-visual-content`, `auth-visual-image`, `auth-visual-panel`, `divider`, `eyebrow`

#### frontend/src/pages/ResetPasswordPage.vue

- 종류: page
- script: setup / ts
- headings: h2 비밀번호 재설정
- forms: 1, images: 0
- asset refs: 없음
- classes: `app-shell`, `auth-card`, `auth-field-wrap`, `auth-form`, `auth-form-head`, `auth-main-action`, `auth-modern-card`, `auth-modern-form`, `auth-modern-page`, `auth-page`, `btn`, `field`, `material-symbols-rounded`, `muted`, `primary`, `small`

#### frontend/src/pages/RoutePage.vue

- 종류: page
- script: setup / ts
- headings: h3 {{ trip.title }}
- forms: 0, images: 1
- asset refs: 없음
- classes: `[`, `avatar`, `avatar-img`, `avatars`, `avatars-group`, `full-screen`, `material-symbols-rounded`, `route-page-section`, `section`, `sidebar`, `sidebar-content`, `stat-label`, `stat-value`, `trip-card-dates`, `trip-card-divider`, `trip-card-footer`, `trip-card-title`, `trip-info-badge-row`, `trip-stat-item`, `trip-stats-grid`, `trip-status-badge`

#### frontend/src/pages/SearchResultsPage.vue

- 종류: page
- script: setup / ts
- headings: h1 통합 검색, h2 luggage 여행 {{ result.trips.length }}, h3 {{ trip.title }}, h2 place 장소 {{ result.places.length }}, h3 {{ place.name }}, h2 auto_stories 여행기 {{ result.posts.length }}
- forms: 1, images: 3
- asset refs: 없음
- classes: `avatar`, `btn`, `eyebrow`, `ghost`, `material-symbols-rounded`, `primary`, `search-body`, `search-card`, `search-card--place`, `search-card--post`, `search-card--trip`, `search-card--user`, `search-card-author`, `search-card-avatar-fallback`, `search-card-body`, `search-card-eyebrow`, `search-card-meta`, `search-card-thumb`, `search-card-thumb--avatar`, `search-card-thumb--icon`, `search-card-title`, `search-clear-btn`, `search-form`, `search-grid`, `search-head`, `search-head-lead`, `search-head-title`, `search-input`, `search-input-icon`, `search-input-wrap`

#### frontend/src/pages/SettingsPage.vue

- 종류: page
- script: setup / ts
- headings: h1 설정, h2 로그인 기기, h2 보안 활동, h2 계정 삭제, h2 환경 설정
- forms: 0, images: 0
- asset refs: 없음
- classes: `accent-brand-violet`, `bg-brand-violet`, `bg-surface`, `bg-white`, `block`, `border`, `border-b`, `border-brand-rose/20`, `border-brand-rose/30`, `border-line`, `disabled:opacity-50`, `eyebrow`, `flex`, `font-bold`, `font-semibold`, `gap-4`, `hover:bg-brand-rose/5`, `items-center`, `justify-between`, `last:border-0`, `material-symbols-rounded`, `max-w-2xl`, `mb-1`, `mb-2`, `mb-4`, `mb-6`, `mt-1`, `mt-4`, `mx-auto`, `p-3`

#### frontend/src/pages/StoriesPage.vue

- 종류: page
- script: setup / ts
- headings: h1 우리들의 여행 이야기, h3 {{ story.title }}
- forms: 0, images: 1
- asset refs: `/images/랜딩페이지/korea_hero.png`
- classes: `btn`, `detail-topline`, `eyebrow`, `ghost`, `lead`, `muted`, `post-type`, `primary`, `section`, `section-title`, `story`, `story-list-card`, `story-list-grid`

#### frontend/src/pages/StoryWritePage.vue

- 종류: page
- script: setup / ts
- headings: h1 당신의 여행을 들려주세요, h3 작성 미리보기, h3 {{ previewTitle }}
- forms: 1, images: 3
- asset refs: 없음
- classes: `avatar`, `btn`, `carousel-btn`, `content-container`, `detail-topline`, `editor-toolbar`, `eyebrow`, `feed-photo-count`, `feed-photo-frame`, `feed-photo-nav`, `feed-photo-open`, `field`, `form-group`, `form-group-icon-wrap`, `ghost`, `lead`, `material-symbols-rounded`, `muted`, `next`, `next-btn`, `prev`, `prev-btn`, `primary`, `section`, `section-title`, `small`, `story-author`, `story-body`, `story-post`, `story-post-head`

#### frontend/src/pages/SwipePage.vue

- 종류: page
- script: setup / ts
- headings: h1 우리만의 여행 취향 을 모아보세요, h2 취향 수집 완료!, h2 {{ currentPlace.placeName }}
- forms: 0, images: 1
- asset refs: 없음
- classes: `[swipeClass,`, `app-shell`, `btn`, `community-hero-header`, `eyebrow`, `lead`, `material-symbols-rounded`, `meta-row`, `muted`, `panel`, `primary`, `section`, `section-title`, `swipe-body`, `swipe-card`, `swipe-layout`, `swipe-main-column`, `swipe-place-placeholder`, `swipe-stage`, `swipe-workspace-card`, `swipe-xp-bar`, `swipe-xp-count`, `swipe-xp-fill`, `swipe-xp-track`, `tag`, `tag-row`, `{`

#### frontend/src/pages/TripInviteAcceptPage.vue

- 종류: page
- script: setup / ts
- headings: h1 초대 수락 완료
- forms: 0, images: 0
- asset refs: 없음
- classes: `app-shell`, `btn`, `eyebrow`, `ghost`, `invite-actions`, `invite-icon`, `invite-page`, `invite-status`, `material-symbols-rounded`, `primary`, `success`

#### frontend/src/pages/UserProfilePage.vue

- 종류: page
- script: setup / ts
- headings: h1 {{ user.displayName }}님의 여행 프로필, h2 {{ user.displayName }}, h2 favorite 좋아요한 장소, h3 {{ place.placeName }}, h2 auto_stories {{ user.displayName }}님의 여행기, h3 {{ story.title }}
- forms: 0, images: 3
- asset refs: 없음
- classes: `!isFollowing,`, `btn`, `edit:`, `eyebrow`, `gradient-text`, `insight-card`, `insight-card-header`, `insight-subtitle`, `isFollowing`, `liked-places-layout`, `map-insight-card`, `material-symbols-rounded`, `minimal-stat-icon`, `minimal-stat-item`, `minimal-stat-label`, `minimal-stat-value`, `mypage-body-container`, `mypage-empty-desc`, `mypage-empty-icon`, `mypage-empty-state`, `mypage-empty-state--inline`, `mypage-empty-title`, `mypage-glass-container`, `mypage-header-search-row`, `mypage-hero`, `mypage-hero__avatar`, `mypage-hero__avatar-container`, `mypage-hero__avatar-ring`, `mypage-hero__content`, `mypage-hero__email`

#### frontend/src/pages/VerifyEmailPage.vue

- 종류: page
- script: setup / ts
- headings: h2 이메일 인증
- forms: 1, images: 0
- asset refs: 없음
- classes: `app-shell`, `auth-card`, `auth-field-wrap`, `auth-form`, `auth-form-head`, `auth-form-options`, `auth-main-action`, `auth-modern-card`, `auth-modern-form`, `auth-modern-page`, `auth-page`, `auth-submit-error`, `btn`, `field`, `material-symbols-rounded`, `muted`, `primary`, `small`

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

