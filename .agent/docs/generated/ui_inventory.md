# UI / 워크스페이스 인벤토리

이 문서는 `.agent/tools/build-ui-knowledge.mjs`가 상위 워크스페이스를 읽고, frontend가 active일 때 Vue UI까지 분석해 생성한 에이전트용 지도입니다.

## 워크스페이스

| 이름 | 타입 | 경로 | 상태 | 프레임워크 | 언어 | 요약 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| frontend | frontend | `frontend` | active | Vue | TypeScript | routes 20, pages 20, components 51 |
| backend | backend | `backend` | active | Spring Boot | - | active |

## Frontend

- package: `soomgil-frontend`
- language: TypeScript
- dependencies: `@stomp/stompjs`, `@tailwindcss/vite`, `axios`, `exifr`, `express`, `heic2any`, `html-to-image`, `mapbox-gl`, `pinia`, `qrcode`, `tailwindcss`, `vue`, `vue-router`
- devDependencies: `@playwright/test`, `@types/node`, `@types/qrcode`, `@vitejs/plugin-vue`, `@vue/test-utils`, `@vue/tsconfig`, `jsdom`, `typescript`, `vite`, `vitest`, `vue-tsc`

### 라우트

| 경로 | 이름 | Page | 인증 | Guest only |
| :--- | :--- | :--- | :--- | :--- |
| `/` | Landing | `src/pages/LandingPage.vue` | 공개 | 아니오 |
| `/login` | Login | `src/pages/LoginPage.vue` | 공개 | 예 |
| `/register` | Register | `src/pages/RegisterPage.vue` | 공개 | 예 |
| `/verify-email` | VerifyEmail | `src/pages/VerifyEmailPage.vue` | 공개 | 예 |
| `/reset-password` | ResetPassword | `src/pages/ResetPasswordPage.vue` | 공개 | 아니오 |
| `/home` | Home | `src/pages/HomePage.vue` | 필요 | 아니오 |
| `/onboarding/preferences` | OnboardingPreferences | `src/pages/SwipePage.vue` | 필요 | 아니오 |
| `/search` | Search | `src/pages/SearchResultsPage.vue` | 필요 | 아니오 |
| `/my-trips` | MyTrips | `src/pages/MyTripsPage.vue` | 필요 | 아니오 |
| `/trip-invites/:inviteCode` | TripInviteAccept | `src/pages/TripInviteAcceptPage.vue` | 필요 | 아니오 |
| `/swipe` | Swipe | `src/pages/SwipePage.vue` | 필요 | 아니오 |
| `/trips/:tripId/swipe` | Route | `src/pages/RoutePage.vue` | 필요 | 아니오 |
| `/trips/:tripId/vote` | TripVote | `src/pages/CommunityPage.vue` | 공개 | 아니오 |
| `/community/feed` | Feed | `src/pages/StoriesPage.vue` | 공개 | 아니오 |
| `/community/story-write` | StoryWrite | `src/pages/StoryWritePage.vue` | 필요 | 아니오 |
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
- classes: `app-layout`, `service-footer`, `{`

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
- classes: `-translate-x-1/2`, `[`, `bottom-10`, `fixed`, `flex`, `flex-col`, `gap-2`, `left-1/2`, `z-[3000]`

#### frontend/src/components/common/ConfirmDialog.vue

- 종류: component
- script: setup / ts
- headings: h2 {{ title }}
- forms: 0, images: 0
- asset refs: 없음
- classes: ``is-${tone}``, `confirm-dialog`, `confirm-dialog__actions`, `confirm-dialog__backdrop`, `confirm-dialog__cancel`, `confirm-dialog__card`, `confirm-dialog__confirm`, `confirm-dialog__copy`, `confirm-dialog__icon`, `material-symbols-rounded`

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

#### frontend/src/components/community/PopularStoryCarousel.vue

- 종류: component
- script: setup / ts
- headings: h3 {{ story.title }}
- forms: 0, images: 2
- asset refs: 없음
- classes: `author-avatar`, `carousel-controls`, `featured-author`, `featured-copy`, `featured-photo`, `featured-polaroid`, `featured-stats`, `featured-story`, `featured-summary`, `material-symbols-rounded`, `photo-caption`, `popular-carousel`, `read-story`, `slide-count`

#### frontend/src/components/community/StoryCard.vue

- 종류: component
- script: setup / ts
- headings: 없음
- forms: 0, images: 2
- asset refs: 없음
- classes: `aspect-[4/3]`, `bg-brand-violet`, `bg-surface`, `bg-surface-2`, `border`, `border-line`, `duration-500`, `flex`, `flex-col`, `font-bold`, `gap-2`, `group`, `group-hover:scale-105`, `h-6`, `h-full`, `hover:border-brand-violet/20`, `hover:shadow-[0_12px_32px_rgba(0,102,255,0.08)]`, `items-center`, `justify-center`, `mb-2`, `object-cover`, `overflow-hidden`, `p-4`, `relative`, `rounded-[24px]`, `rounded-full`, `text-[10px]`, `text-left`, `text-white`, `transition-all`

#### frontend/src/components/community/StoryDetailOverlay.vue

- 종류: component
- script: setup / ts
- headings: h3 {{ adjacentDragStory.title }}, h3 {{ visibleStory.title }}
- forms: 0, images: 3
- asset refs: `/images/랜딩페이지/korea_hero.png`
- classes: `active:`, `carousel-btn`, `fc-avatar`, `feed-drag-preview`, `feed-layout`, `feed-photo-count`, `feed-photo-nav`, `material-symbols-rounded`, `muted`, `next`, `next-btn`, `prev`, `prev-btn`, `small`, `story-action-bar`, `story-author`, `story-body`, `story-detail-panel`, `story-feed`, `story-feed-window`, `story-heart-button`, `story-like-button`, `story-overlay`, `story-overlay-backdrop`, `story-overlay-close`, `story-overlay-panel`, `story-post`, `story-post-head`, `story-post-photo-frame`, `story-post-photo-img`

#### frontend/src/components/community/StoryPostPreview.vue

- 종류: component
- script: setup / ts
- headings: h3 {{ title }}
- forms: 0, images: 2
- asset refs: 없음
- classes: `carousel-btn`, `fc-avatar`, `feed-photo-count`, `feed-photo-nav`, `material-symbols-rounded`, `next`, `next-btn`, `prev`, `prev-btn`, `story-action-bar`, `story-author`, `story-body`, `story-comment-count`, `story-like-button`, `story-post-head`, `story-post-head-row`, `story-post-photo-frame`, `story-post-photo-img`, `story-post-photo-placeholder`, `story-post-preview`, `story-preview-location`, `story-preview-summary`, `story-report-btn`, `tag`, `tag-row`

#### frontend/src/components/community/StoryWriteModal.vue

- 종류: component
- script: setup / ts
- headings: h1 {{ isEditMode ? '여행기 수정' : '여행기 작성' }}, h2 기록할 여행 *, h2 사진 구성 *
- forms: 1, images: 1
- asset refs: 없음
- classes: `material-symbols-rounded`, `photo-strip`, `photo-strip__check`, `photo-strip__cover`, `photo-strip__empty`, `photo-strip__item`, `photo-strip__nav`, `photo-strip__row`, `photo-strip__upload`, `photo-strip__viewport`, `required-mark`, `selection-note`, `sr-only`, `story-overlay`, `story-overlay-backdrop`, `story-overlay-panel`, `story-write-close`, `story-write-editor`, `story-write-eyebrow`, `story-write-form`, `story-write-header`, `story-write-header__meta`, `story-write-panel`, `story-write-progress`, `story-write-workspace`, `trip-select-wrap`, `trip-select-wrap__arrow`, `write-section`, `write-section__heading`, `write-section__number`

#### frontend/src/components/itinerary/RouteTransportPanel.vue

- 종류: component
- script: setup / ts
- headings: 없음
- forms: 0, images: 0
- asset refs: 없음
- classes: `material-symbols-rounded`, `route-meta`, `route-name`, `saved-route`, `saved-routes`, `transport-heading`, `transport-options`, `transport-panel`, `unverified`

#### frontend/src/components/layout/AppFooter.vue

- 종류: component
- script: setup / ts
- headings: 없음
- forms: 0, images: 1
- asset refs: `@/assets/images/soomgil_logo_extract.png`
- classes: `app-footer`, `app-footer-brand`, `app-footer-inner`

#### frontend/src/components/layout/AppHeader.vue

- 종류: component
- script: setup / ts
- headings: 없음
- forms: 0, images: 1
- asset refs: `@/assets/images/soomgil_text_logo.png`
- classes: `===`, `[`, `active:`, `activeNavKey`, `app-header-brand-logo`, `brand`, `item.key`, `nav`, `{`, `}`

#### frontend/src/components/layout/AppShell.vue

- 종류: component
- script: setup / ts
- headings: 없음
- forms: 0, images: 0
- asset refs: 없음
- classes: `flex`, `flex-1`, `flex-col`, `min-h-screen`, `{`

#### frontend/src/components/layout/InkWashBackdrop.vue

- 종류: component
- script: setup / ts
- headings: 없음
- forms: 0, images: 0
- asset refs: 없음
- classes: `paper-grain`

#### frontend/src/components/layout/OnboardingHeader.vue

- 종류: component
- script: setup / ts
- headings: 없음
- forms: 0, images: 1
- asset refs: `@/assets/images/soomgil_logo_none_text.png`
- classes: `material-symbols-rounded`, `onboarding-header`, `onboarding-header__actions`, `onboarding-header__brand`, `onboarding-header__inner`, `onboarding-header__message`, `onboarding-header__progress`

#### frontend/src/components/layout/ServiceBackdrop.vue

- 종류: component
- script: classic / js
- headings: 없음
- forms: 0, images: 0
- asset refs: `@/assets/backgrounds/sky-watercolor-background.webp`
- classes: `service-backdrop`

#### frontend/src/components/map/MapDrawingOverlay.vue

- 종류: component
- script: setup / ts
- headings: 없음
- forms: 0, images: 0
- asset refs: 없음
- classes: `===`, `editable,`, `erasing:`, `map-drawing-overlay`, `map-drawing-stroke`, `tool`, `{`

#### frontend/src/components/map/MapObjectOverlay.vue

- 종류: component
- script: setup / ts
- headings: 없음
- forms: 0, images: 0
- asset refs: 없음
- classes: `map-object`, `map-object-handle`, `map-object-hitbox`, `map-object-image`, `map-object-lock-mask`, `map-object-overlay`, `map-object-placeholder`, `map-object-rotation-handle`, `map-object-rotation-line`, `map-object-selection`, `map-object-sticker`, `{`

#### frontend/src/components/map/MapTasteControl.vue

- 종류: component
- script: setup / ts
- headings: 없음
- forms: 0, images: 1
- asset refs: 없음
- classes: `active:`, `enabled`, `map-taste-control`, `material-symbols-rounded`, `taste-description`, `taste-members`, `taste-panel`, `taste-reload`, `taste-switch`, `taste-switch-row`, `taste-tab-indicator`, `taste-tabs`, `taste-toggle`, `{`, `}`

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
- headings: h2 star 가고 싶은 장소, h3 {{ place.placeName }}
- forms: 1, images: 1
- asset refs: 없음
- classes: `material-symbols-rounded`, `modal-scroll-container`, `mypage-place-card`, `mypage-places-grid`, `mypage-section-title`, `place-desc-text`, `place-image-placeholder`, `place-img-wrap`, `place-info-wrap`, `place-region-category`, `place-super-like-btn`, `place-tag-pill`, `place-tag-row`, `place-title-h3`, `saved-board-content`, `saved-board-empty`, `saved-board-heading`, `saved-board-pagination`, `saved-board-panel`, `saved-board-search`, `saved-note-board`, `section-icon`, `section-icon--sky`, `story-overlay`, `story-overlay-backdrop`, `story-overlay-close`, `story-overlay-panel`, `{`

#### frontend/src/components/mypage/MyStoriesModal.vue

- 종류: component
- script: setup / ts
- headings: h2 auto_stories 내 여행기
- forms: 0, images: 2
- asset refs: 없음
- classes: `===`, `active:`, `material-symbols-rounded`, `modal-scroll-container`, `my-stories-modal-content`, `my-stories-modal-grid`, `my-stories-modal-scroll`, `my-stories-pagination`, `mypage-empty-desc`, `mypage-empty-icon`, `mypage-empty-state`, `mypage-empty-state--inline`, `mypage-empty-title`, `mypage-header-search-row`, `mypage-search-inline`, `mypage-section-header`, `mypage-section-title`, `mypage-stories-magazine`, `mypage-story-magazine-item`, `page`, `pageNumber`, `section-icon`, `section-icon--violet`, `story-magazine-author`, `story-magazine-author-copy`, `story-magazine-avatar`, `story-magazine-body`, `story-magazine-image-wrap`, `story-magazine-tags`, `story-magazine-thumb`

#### frontend/src/components/mypage/MyStoryDetailModal.vue

- 종류: component
- script: setup / ts
- headings: h2 {{ post.title }}, h3 {{ formatUiText("댓글 {0}", "{0} comments", [post.commentCount]) }}
- forms: 0, images: 1
- asset refs: 없음
- classes: `btn`, `eyebrow`, `ghost`, `material-symbols-rounded`, `muted`, `my-story-body`, `my-story-comment`, `my-story-comments`, `my-story-detail`, `my-story-gallery`, `my-story-head`, `my-story-state`, `my-story-state--error`, `my-story-tags`, `story-overlay`, `story-overlay-backdrop`, `story-overlay-close`, `story-overlay-panel`

#### frontend/src/components/onboarding/MapSectionTour.vue

- 종류: component
- script: setup / ts
- headings: h2 {{ step.title }}
- forms: 0, images: 0
- asset refs: 없음
- classes: `===`, `active:`, `index`, `map-tour`, `map-tour-actions`, `map-tour-backdrop`, `map-tour-card`, `map-tour-footer`, `map-tour-next`, `map-tour-previous`, `map-tour-progress`, `map-tour-spotlight`, `map-tour-topline`, `material-symbols-rounded`, `stepIndex`, `{`, `}`

#### frontend/src/components/onboarding/SwipeIntroTour.vue

- 종류: component
- script: setup / ts
- headings: h2 {{ step.title }}
- forms: 0, images: 0
- asset refs: 없음
- classes: `===`, `active:`, `index`, `material-symbols-rounded`, `stepIndex`, `swipe-tour`, `swipe-tour-actions`, `swipe-tour-backdrop`, `swipe-tour-card`, `swipe-tour-footer`, `swipe-tour-next`, `swipe-tour-previous`, `swipe-tour-progress`, `swipe-tour-spotlight`, `swipe-tour-topline`, `{`, `}`

#### frontend/src/components/place/PlaceDiscoveryPanel.vue

- 종류: component
- script: setup / ts
- headings: 없음
- forms: 1, images: 2
- asset refs: 없음
- classes: `[`, `discovery-copy`, `discovery-match-icon`, `discovery-match-label`, `discovery-match-row`, `discovery-match-value`, `discovery-members`, `discovery-meta`, `discovery-panel`, `discovery-reason`, `discovery-reason--standalone`, `discovery-reload`, `discovery-result`, `discovery-results`, `discovery-scheduled`, `discovery-search`, `discovery-spinner`, `discovery-state`, `discovery-state--error`, `discovery-tabs`, `discovery-thumb`, `full-heart`, `material-symbols-rounded`

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
- headings: h2 {{ trip.title }}, h2 {{ trip.title }}
- forms: 0, images: 2
- asset refs: `@/assets/images/soomgil_logo_none_text.png`
- classes: `airport-code`, `boarding-pass-card`, `boarding-pass-card--placeholder`, `bottom`, `city-name`, `d-day-badge`, `dashed-line`, `departure`, `destination`, `detail-item`, `label`, `line`, `logo-image`, `logo-text`, `material-symbols-rounded`, `plane-mark`, `punch-hole`, `route-path`, `route-point`, `stub-actions`, `stub-date-info`, `stub-date-label`, `stub-detail-btn`, `stub-export-btn`, `stub-header`, `stub-kicker-row`, `stub-qr-panel`, `stub-role-badge`, `stub-route-code`, `stub-ticket-badges`

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

#### frontend/src/components/trip/TripDateRangeDialog.vue

- 종류: component
- script: setup / ts
- headings: h3 여행 기간 선택
- forms: 0, images: 0
- asset refs: 없음
- classes: `range-apply`, `range-clear`, `range-close`, `range-dialog`, `range-fields`, `range-grid`, `range-month`, `range-overlay`, `range-weekday`, `{outside:day.outside,endpoint:day.value===start||day.value===end,between:start&&end&&day.value>start&&day.value<end}`

#### frontend/src/components/trip/TripSettingsButton.vue

- 종류: component
- script: setup / ts
- headings: 없음
- forms: 0, images: 0
- asset refs: 없음
- classes: ``trip-settings-button--${variant}``, `material-symbols-rounded`, `trip-settings-button`, `trip-settings-button__label`

#### frontend/src/components/trip/TripSettingsModal.vue

- 종류: component
- script: setup / ts
- headings: h3 여행 관리, h4 여행 삭제, h4 초대 링크 공유, h4 참여 중인 멤버
- forms: 1, images: 1
- asset refs: 없음
- classes: `[`, `advanced-modal`, `advanced-overlay`, `btn`, `danger-button`, `danger-zone`, `delete-confirmation`, `eyebrow`, `field`, `form-label`, `form-label-text`, `ghost`, `icon-btn`, `invite-action-btn`, `invite-action-btn--ghost`, `invite-action-btn--primary`, `invite-actions`, `invite-error`, `invite-link-box`, `invite-link-icon`, `invite-share-section`, `management-section`, `management-section-head`, `management-section-icon`, `management-section-icon--danger`, `material-symbols-rounded`, `member-avatar`, `member-count`, `member-info`, `member-invite-note`

#### frontend/src/components/voting/OwnerVoteSetupPanel.vue

- 종류: component
- script: setup / ts
- headings: h1 새 투표를 시작할까요?
- forms: 0, images: 0
- asset refs: 없음
- classes: `material-symbols-rounded`, `vote-setup`, `vote-setup__chip`, `vote-setup__chip-remove`, `vote-setup__chips`, `vote-setup__cta`, `vote-setup__destination`, `vote-setup__error`, `vote-setup__eyebrow`, `vote-setup__footer`, `vote-setup__header`, `vote-setup__hint`, `vote-setup__hint--warn`, `vote-setup__lead`, `vote-setup__panel`, `vote-setup__row`, `vote-setup__row--question`, `vote-setup__row--regions`, `vote-setup__row-copy`, `vote-setup__row-icon`, `vote-setup__row-icon--count`, `vote-setup__row-icon--region`, `vote-setup__stepper`, `vote-setup__title`

#### frontend/src/components/voting/TripVoteFlow.vue

- 종류: component
- script: setup / ts
- headings: h2 진행 중인 투표가 없어요, h2 투표가 진행 중이에요, h2 내 투표를 제출했어요, h1 어디로 갈까요?
- forms: 0, images: 0
- asset refs: 없음
- classes: `material-symbols-rounded`, `page-hero`, `page-hero__actions`, `page-hero__copy`, `page-hero__gradient`, `page-hero__lead`, `page-hero__title`, `page-with-hero`, `section`, `trip-vote`, `trip-vote__back`, `trip-vote__close`, `trip-vote__cta`, `trip-vote__cta--ai`, `trip-vote__ghost`, `trip-vote__hero`, `trip-vote__hero-actions`, `trip-vote__idle`, `trip-vote__layout`, `trip-vote__narrow`, `trip-vote__observer-card`, `trip-vote__observer-copy`, `trip-vote__observer-cta`, `trip-vote__observer-progress`, `trip-vote__observer-progress-head`, `trip-vote__panel`, `trip-vote__progress`, `trip-vote__restart`, `trip-vote__result-actions`, `trip-vote__state-eyebrow`

#### frontend/src/components/voting/VoteCandidateDeck.vue

- 종류: component
- script: setup / ts
- headings: h3 {{ current.name ?? '이름 미상' }}
- forms: 0, images: 2
- asset refs: 없음
- classes: `material-symbols-rounded`, `vote-deck`, `vote-deck__address`, `vote-deck__badge`, `vote-deck__caption`, `vote-deck__category`, `vote-deck__controls`, `vote-deck__count`, `vote-deck__count-unit`, `vote-deck__count-value`, `vote-deck__counter`, `vote-deck__name`, `vote-deck__nav`, `vote-deck__nav--next`, `vote-deck__nav--prev`, `vote-deck__photo`, `vote-deck__photo--empty`, `vote-deck__scrim`, `vote-deck__slide`, `vote-deck__stage`, `vote-deck__step`, `vote-deck__step--add`, `vote-deck__thumb`, `vote-deck__thumb-badge`, `vote-deck__thumbs`, `{`

#### frontend/src/components/voting/VoteResultMapOverlay.vue

- 종류: component
- script: setup / ts
- headings: h2 투표가 끝났어요!
- forms: 0, images: 1
- asset refs: 없음
- classes: `material-symbols-rounded`, `vote-map-overlay`, `vote-map-overlay__backdrop`, `vote-map-overlay__card`, `vote-map-overlay__count`, `vote-map-overlay__cta`, `vote-map-overlay__icon`, `vote-map-overlay__item`, `vote-map-overlay__lead`, `vote-map-overlay__list`, `vote-map-overlay__name`, `vote-map-overlay__rank`, `vote-map-overlay__thumb`, `vote-map-overlay__thumb--empty`, `vote-map-overlay__title`

#### frontend/src/components/voting/VoteResultPanel.vue

- 종류: component
- script: setup / ts
- headings: h2 함께 고른 여행지를 확인해보세요
- forms: 0, images: 1
- asset refs: 없음
- classes: `material-symbols-rounded`, `row.selected,`, `selected:`, `sr-only`, `vote-result`, `vote-result__all`, `vote-result__badge`, `vote-result__body`, `vote-result__count`, `vote-result__empty`, `vote-result__favorite`, `vote-result__header`, `vote-result__list`, `vote-result__media`, `vote-result__name`, `vote-result__rank`, `vote-result__row`, `vote-result__selected`, `{`

#### frontend/src/components/voting/VoteStickerCart.vue

- 종류: component
- script: setup / ts
- headings: h2 shopping_bag 스티커 보드
- forms: 0, images: 1
- asset refs: 없음
- classes: `material-symbols-rounded`, `vote-cart`, `vote-cart__dot`, `vote-cart__dots`, `vote-cart__empty`, `vote-cart__header`, `vote-cart__hint`, `vote-cart__item`, `vote-cart__list`, `vote-cart__name`, `vote-cart__remaining`, `vote-cart__reset`, `vote-cart__stepper`, `vote-cart__submit`, `vote-cart__thumb`, `vote-cart__thumb--empty`, `vote-cart__title`, `{`

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
- headings: h1 {{ locale === 'en' ? 'Travel stories' : '여행 이야기' }}, h2 방금 도착한 여행 이야기, h3 {{ story.title }}, h3 {{ adjacentDragStory.title }}, h3 {{ visibleStory.title }}
- forms: 0, images: 5
- asset refs: `/images/랜딩페이지/korea_hero.png`
- classes: `===`, `active:`, `carousel-btn`, `community-content-container`, `community-empty`, `community-page`, `community-pagination`, `community-paper`, `community-pill`, `community-pill-primary`, `community-story-search`, `currentPage`, `eyebrow`, `fc-avatar`, `feed-drag-preview`, `feed-layout`, `feed-photo-count`, `feed-photo-nav`, `latest-stories-eyebrow`, `latest-stories-header`, `latest-stories-icon`, `latest-stories-section`, `latest-stories-title`, `latest-stories-tools`, `material-symbols-rounded`, `muted`, `next`, `next-btn`, `page`, `page-hero`

#### frontend/src/pages/HomePage.vue

- 종류: page
- script: setup / ts
- headings: h1 어디로 떠나고 싶으세요?, h2 {{ photoTitle }}
- forms: 1, images: 1
- asset refs: `@/assets/textures/ink-reveal-mask.png`
- classes: `home-artwork-actions`, `home-artwork-caption`, `home-artwork-credit`, `home-artwork-cta-row`, `home-artwork-footer`, `home-artwork-info`, `home-artwork-label`, `home-artwork-title`, `home-backdrop`, `home-canvas`, `home-explore-link`, `home-gallery`, `home-ink-underlay`, `home-photo-controls`, `home-photo-count`, `home-photo-status`, `home-plan-link`, `home-search`, `home-search-history`, `home-search-history-heading`, `home-search-position`, `home-sr-only`, `material-symbols-rounded`, `paper-search`, `paper-search-field`, `paper-search-icon`, `paper-search-input`, `paper-search-submit`

#### frontend/src/pages/LandingPage.vue

- 종류: page
- script: setup / ts
- headings: h1 함께 그리는 설렘, 여행의 모든 순간, h2 여행 계획, 이제 함께 한곳에서, h3 가고 싶은 곳을 함께 골라요, h3 한눈에 일정을 정리해요, h3 이동하기 좋은 순서로 완성해요, h2 마음에 드는 여행을 내 일정으로 시작해 보세요.
- forms: 0, images: 2
- asset refs: `/images/랜딩페이지/daejeon.png`, `/images/랜딩페이지/gyeongju.png`, `/images/랜딩페이지/jeju.png`, `/images/랜딩페이지/jeonju.png`, `/images/랜딩페이지/korea_hero.png`, `@/assets/images/soomgil_logo_extract.png`
- classes: `is-visible`, `landing-button`, `landing-button--classic`, `landing-button--classic-ghost`, `landing-button--large`, `landing-button--light`, `landing-button--outline`, `landing-classic-actions`, `landing-classic-content`, `landing-classic-kicker`, `landing-classic-lead`, `landing-classic-logo`, `landing-day-demo`, `landing-final`, `landing-hero`, `landing-hero--classic`, `landing-hero-background`, `landing-hero-shade`, `landing-page`, `landing-process`, `landing-process-grid`, `landing-reveal`, `landing-route-demo`, `landing-section-heading`, `landing-step-icon`, `landing-step-icon--green`, `landing-step-icon--rose`, `landing-step-number`, `landing-stories`, `landing-stories-copy`

#### frontend/src/pages/LoginPage.vue

- 종류: page
- script: setup / ts
- headings: h1 {{ t('login.hero') }}, h2 {{ t('auth.login') }}
- forms: 1, images: 0
- asset refs: `/images/랜딩페이지/korea_hero.png`
- classes: `app-shell`, `auth-card`, `auth-check`, `auth-feedback-slot`, `auth-field-wrap`, `auth-form`, `auth-form-head`, `auth-form-options`, `auth-main-action`, `auth-modern-card`, `auth-modern-card--split`, `auth-modern-form`, `auth-modern-page`, `auth-page`, `auth-submit-error`, `auth-success-message`, `auth-switch`, `auth-visual-content`, `auth-visual-image`, `auth-visual-panel`, `btn`, `divider`, `eyebrow`, `field`, `material-symbols-rounded`, `muted`, `primary`, `small`

#### frontend/src/pages/MyPage.vue

- 종류: page
- script: setup / ts
- headings: h1 여행으로 채운 나의 공간, h2 {{ displayName }}
- forms: 0, images: 1
- asset refs: 없음
- classes: `account-page-hero`, `account-page-link`, `material-symbols-rounded`, `mypage-hero`, `mypage-hero__avatar`, `mypage-hero__content`, `mypage-page-heading`, `mypage-profile-card`, `mypage-shell`, `page-hero`, `page-hero__actions`, `page-hero__copy`, `page-hero__eyebrow`, `page-hero__lead`, `page-hero__title`, `page-with-hero`, `primary-page-hero`, `profile-avatar-col`, `profile-avatar-img`, `profile-avatar-wrap`, `profile-bio`, `profile-display-name`, `profile-handle`, `profile-header-card`, `profile-info-col`, `profile-stat-item`, `profile-stat-label`, `profile-stat-value`, `profile-stats-row`, `section`

#### frontend/src/pages/MyTripsPage.vue

- 종류: page
- script: setup / ts
- headings: h1 내 여행, h2 여행 목록, h3 {{ trip.title }}, h3 새 여행 만들기
- forms: 1, images: 2
- asset refs: 없음
- classes: `===`, `[getStatusCls(trip),`, `active`, `active:`, `activeFilter`, `app-shell`, `btn`, `compact-title`, `createModal.isOpen.value`, `eyebrow`, `field`, `filter.value`, `form-label`, `form-label-text`, `getStatusCls(trip)`, `ghost`, `icon-btn`, `material-symbols-rounded`, `modal-card`, `modal-header`, `modal-overlay`, `my-trips-dashboard`, `my-trips-timeline`, `my-trips-timeline-wrapper`, `page-hero`, `page-hero__copy`, `page-hero__eyebrow`, `page-hero__lead`, `page-hero__title`, `page-with-hero`

#### frontend/src/pages/NotFoundPage.vue

- 종류: page
- script: setup / ts
- headings: h1 {{ tr('페이지를 찾을 수 없습니다', 'Page not found') }}
- forms: 0, images: 0
- asset refs: 없음
- classes: `bg-brand-violet`, `bg-clip-text`, `bg-gradient-to-br`, `flex`, `font-black`, `font-bold`, `from-brand-violet`, `hover:bg-brand-violet/90`, `items-center`, `justify-center`, `mb-8`, `min-h-screen`, `mt-2`, `mt-4`, `px-6`, `px-8`, `py-3`, `rounded-full`, `text-2xl`, `text-8xl`, `text-center`, `text-ink`, `text-muted`, `text-transparent`, `text-white`, `to-brand-blue`, `transition-colors`

#### frontend/src/pages/OAuthCallbackPage.vue

- 종류: page
- script: setup / ts
- headings: h2 {{ tr('로그인 처리 중...', 'Processing login...') }}, h2 {{ tr('로그인 실패', 'Login failed') }}
- forms: 0, images: 0
- asset refs: 없음
- classes: `app-shell`, `auth-card`, `auth-form`, `auth-main-action`, `auth-modern-card`, `auth-modern-form`, `auth-modern-page`, `auth-page`, `btn`, `material-symbols-rounded`, `muted`, `oauth-callback-state`, `oauth-error-icon`, `oauth-spinner`, `primary`, `small`

#### frontend/src/pages/RegisterPage.vue

- 종류: page
- script: setup / ts
- headings: h1 {{ t('register.hero') }}, h2 {{ isOAuthOnboarding ? '가입 완료' : t('auth.register') }}
- forms: 1, images: 0
- asset refs: `/images/랜딩페이지/jeonju.png`
- classes: `app-shell`, `auth-back-to-login`, `auth-card`, `auth-form`, `auth-form-head`, `auth-modern-card`, `auth-modern-card--split`, `auth-modern-form`, `auth-modern-page`, `auth-page`, `auth-visual-content`, `auth-visual-description--nowrap`, `auth-visual-image`, `auth-visual-panel`, `eyebrow`, `material-symbols-rounded`

#### frontend/src/pages/ResetPasswordPage.vue

- 종류: page
- script: setup / ts
- headings: h1 {{ tr('다시 여행을 이어가세요', 'Continue your journey') }}, h2 {{ tr('비밀번호 재설정', 'Reset password') }}
- forms: 1, images: 0
- asset refs: `/images/랜딩페이지/korea_hero.png`
- classes: `===`, `active:`, `app-shell`, `auth-back-to-login`, `auth-card`, `auth-field-wrap`, `auth-form`, `auth-form-head`, `auth-main-action`, `auth-modern-card`, `auth-modern-card--split`, `auth-modern-form`, `auth-modern-page`, `auth-page`, `auth-visual-content`, `auth-visual-image`, `auth-visual-panel`, `btn`, `eyebrow`, `field`, `material-symbols-rounded`, `muted`, `primary`, `reset-password-card`, `reset-password-form`, `reset-password-visual-copy`, `reset-step-indicator`, `small`, `step`, `{`

#### frontend/src/pages/RoutePage.vue

- 종류: page
- script: setup / ts
- headings: 없음
- forms: 0, images: 1
- asset refs: `@/assets/images/ai-profile.png`
- classes: `[`, `avatar-img`, `avatars`, `avatars-group`, `full-screen`, `route-page-section`, `section`, `trip-map-actions`

#### frontend/src/pages/SearchResultsPage.vue

- 종류: page
- script: setup / ts
- headings: h1 {{ searchHeading }}, h3 최근 검색어, h2 luggage 여행 {{ visibleTrips.length }}, h3 {{ trip.title }}, h2 place 장소 {{ visiblePlaces.length }}, h3 {{ place.name }}
- forms: 1, images: 4
- asset refs: `@/assets/textures/ink-reveal-mask.png`
- classes: `===`, `active:`, `activeTab`, `avatar`, `material-symbols-rounded`, `paper-search`, `paper-search-clear`, `paper-search-field`, `paper-search-icon`, `paper-search-input`, `paper-search-submit`, `search-back-link`, `search-body`, `search-card`, `search-card--place`, `search-card--post`, `search-card--trip`, `search-card--user`, `search-card-author`, `search-card-avatar-fallback`, `search-card-body`, `search-card-eyebrow`, `search-card-meta`, `search-card-thumb`, `search-card-thumb--avatar`, `search-card-title`, `search-content`, `search-empty-panel`, `search-grid`, `search-grid--users`

#### frontend/src/pages/SettingsPage.vue

- 종류: page
- script: setup / ts
- headings: h1 나에게 맞는 여행 환경, h2 {{ currentUser?.displayName || '여행자' }}, h2 {{ t('settings.environment') }}, h2 {{ t('settings.account') }}
- forms: 0, images: 1
- asset refs: 없음
- classes: `account-page-hero`, `account-page-link`, `animate-spin`, `avatar-fallback`, `btn`, `bullet-icon`, `danger-action-btn`, `danger-bullet-item`, `email-icon`, `error-status`, `lg:px-8`, `loading-spinner-wrap`, `loading-text`, `material-symbols-rounded`, `max-w-6xl`, `mx-auto`, `page-hero`, `page-hero__actions`, `page-hero__copy`, `page-hero__eyebrow`, `page-hero__lead`, `page-hero__title`, `page-with-hero`, `panel-head-icon`, `panel-head-icon--orange`, `panel-head-icon--violet`, `panel-head-title-group`, `primary`, `primary-page-hero`, `profile-settings-page`

#### frontend/src/pages/StoriesPage.vue

- 종류: page
- script: setup / ts
- headings: h1 우리들의 여행 이야기 를 둘러보세요, h3 {{ story.title }}
- forms: 0, images: 1
- asset refs: `/images/랜딩페이지/korea_hero.png`
- classes: `btn`, `detail-topline`, `ghost`, `muted`, `page-hero`, `page-hero__copy`, `page-hero__gradient`, `page-hero__lead`, `page-hero__title`, `page-with-hero`, `post-type`, `primary`, `section`, `story`, `story-list-card`, `story-list-grid`

#### frontend/src/pages/StoryWritePage.vue

- 종류: page
- script: setup / ts
- headings: h1 당신의 여행 을 들려주세요, h3 작성 미리보기
- forms: 1, images: 1
- asset refs: 없음
- classes: `btn`, `content-container`, `detail-topline`, `editor-toolbar`, `field`, `form-group`, `form-group-icon-wrap`, `ghost`, `material-symbols-rounded`, `muted`, `page-hero`, `page-hero__copy`, `page-hero__eyebrow`, `page-hero__gradient`, `page-hero__lead`, `page-hero__title`, `page-with-hero`, `primary`, `section`, `small`, `text-area`, `upload-grid`, `write-form`, `write-layout`, `write-main`, `write-page`, `write-page-hero`, `write-preview-feed-frame`, `write-preview-sidebar`

#### frontend/src/pages/SwipePage.vue

- 종류: page
- script: setup / ts
- headings: h1 {{ onboardingMode ? '첫 여행 취향 찾기' : '취향 수집' }}, h2 취향 수집 완료!
- forms: 0, images: 1
- asset refs: 없음
- classes: `[swipeClass,`, `app-shell`, `btn`, `celebration-particle`, `celebration-ring`, `lead`, `material-symbols-rounded`, `page-hero`, `page-hero__copy`, `page-hero__eyebrow`, `page-hero__lead`, `page-hero__title`, `page-with-hero`, `panel`, `primary`, `primary-page-hero`, `ring-echo`, `section`, `sketch-echo`, `swipe-breeze`, `swipe-card`, `swipe-celebration`, `swipe-discovery`, `swipe-guide`, `swipe-guide--left`, `swipe-guide--right`, `swipe-guide--top`, `swipe-help-btn`, `swipe-layout`, `swipe-main-column`

#### frontend/src/pages/TripInviteAcceptPage.vue

- 종류: page
- script: setup / ts
- headings: h1 {{ tr('초대 수락 완료!', 'Invitation accepted!') }}
- forms: 0, images: 0
- asset refs: 없음
- classes: ``is-${state}``, `app-shell`, `invite-actions`, `invite-button`, `invite-lead`, `invite-loading`, `invite-page`, `invite-shell`, `invite-status`, `invite-trip-card`, `invite-trip-card__check`, `invite-trip-card__pin`, `material-symbols-rounded`, `primary`, `secondary`

#### frontend/src/pages/UserProfilePage.vue

- 종류: page
- script: setup / ts
- headings: h1 {{ user.displayName }}님의 여행 공간, h2 {{ user.displayName }}, h2 비공개 프로필입니다, h2 star 슈퍼라이크한 장소, h3 {{ place.placeName }}, h2 auto_stories {{ formatUiText("{0}님의 여행기", "Stories by {0}", [user.displayName]) }}
- forms: 0, images: 4
- asset refs: 없음
- classes: `account-page-hero`, `account-page-link`, `keepsake-board`, `keepsake-note`, `liked-places-layout`, `material-symbols-rounded`, `mypage-body-container`, `mypage-empty-desc`, `mypage-empty-icon`, `mypage-empty-state`, `mypage-empty-title`, `mypage-glass-container`, `mypage-hero`, `mypage-hero__avatar`, `mypage-hero__content`, `mypage-more-link`, `mypage-page-heading`, `mypage-place-card`, `mypage-place-card--slider`, `mypage-places-slider`, `mypage-places-slider-wrapper`, `mypage-profile-card`, `mypage-section`, `mypage-section-content`, `mypage-section-header`, `mypage-section-title`, `mypage-shell`, `mypage-stories-magazine`, `mypage-story-magazine-item`, `page-hero`

#### frontend/src/pages/VerifyEmailPage.vue

- 종류: page
- script: setup / ts
- headings: h1 {{ tr('여행을 시작하기 전,\n마지막 한 걸음', 'One last step\nbefore your journey') }}, h2 {{ tr('이메일 인증이 완료됐어요', 'Email verified') }}, h2 {{ submitting ? tr('이메일 인증 중…', 'Verifying email…') : tr('인증 메일을 확인해주세요', 'Check your verification email') }}
- forms: 1, images: 0
- asset refs: `/images/랜딩페이지/jeju.png`
- classes: `app-shell`, `auth-card`, `auth-field-wrap`, `auth-form`, `auth-form-head`, `auth-main-action`, `auth-modern-card`, `auth-modern-form`, `auth-modern-page`, `auth-page`, `auth-submit-error`, `auth-success-message`, `auth-visual-content`, `auth-visual-panel`, `btn`, `email-login-link`, `email-recipient`, `email-resend-button`, `email-verification-actions`, `email-verification-card`, `email-verification-description`, `email-verification-form`, `email-verification-kicker`, `email-verification-visual`, `email-verification-visual__content`, `email-verification-visual__wash`, `eyebrow`, `field`, `ghost`, `material-symbols-rounded`

### Styles

#### frontend/src/styles/account-theme.css

- Tailwind import: 없음
- tokens: `--blue`, `--ink`, `--line`, `--muted`, `--violet`
- animations: 없음

#### frontend/src/styles/main.css

- Tailwind import: 있음
- tokens: `--color-bg`, `--color-brand-blue`, `--color-brand-cyan`, `--color-brand-lavender`, `--color-brand-rose`, `--color-brand-violet`, `--color-brand-yellow`, `--color-glass`, `--color-ink`, `--color-line`, `--color-muted`, `--color-surface`, `--color-surface-2`, `--font-sans`, `--page-hero-bottom-space`, `--page-hero-top-space`, `--search-box-bg`, `--search-box-border`, `--search-box-focus`, `--search-box-height`, `--search-box-radius`, `--search-box-shadow`, `--settings-modal-width`
- animations: 없음

#### frontend/src/styles/mypage.css

- Tailwind import: 없음
- tokens: 없음
- animations: `floatY`, `headlightFlicker`, `mypageFadeIn`, `pinPulse`, `shine`, `smokeFloat`, `tagWiggle`, `vanDrive`

#### frontend/src/styles/original.css

- Tailwind import: 없음
- tokens: `--bg`, `--blue`, `--cyan`, `--day-color`, `--day-color-bg`, `--day-color-border`, `--detailbar-gap`, `--detailbar-offset`, `--detailbar-width`, `--feed-list-height`, `--feed-panel-offset`, `--font-sans`, `--glint`, `--ink`, `--lavender`, `--line`, `--muted`, `--rose`, `--shadow`, `--sidebar-width`, `--soft-shadow`, `--surface`, `--surface-2`, `--violet`, `--yellow`
- animations: `activeDotPop`, `aiGlowAnimation`, `clickParticleFade`, `fadeInUp`, `likeEmojiFloat`, `likeParticleBurst`, `likeParticleTrail`, `mic-pulse`, `nopeEmojiFloat`, `nopeParticleBurst`, `nopeParticleTrail`, `popover-in`, `pulseSpark`, `routeBurstDot`, `routeBurstGlint`, `routeBurstPin`, `scrollArrowBounce`, `scrollLineMove`, `superlikeEmojiFloat`, `superlikeParticleBurst`, `superlikeParticleTrail`, `swipeFingerAnimNew`, `swipeParticleFade`, `swipeRippleAnim`, `swipeUpAnim`, `typingBounce`, `wave-bounce`

#### frontend/src/styles/paper-search.css

- Tailwind import: 없음
- tokens: 없음
- animations: 없음

#### frontend/src/styles/route-sky-theme.css

- Tailwind import: 없음
- tokens: `--bg`, `--blue`, `--ink`, `--line`, `--muted`, `--surface`, `--surface-2`, `--violet`
- animations: 없음

#### frontend/src/styles/scroll-explore.css

- Tailwind import: 없음
- tokens: `--bg`, `--blue`, `--glass`, `--ink`, `--line`, `--muted`, `--rose`, `--shadow`, `--surface`, `--violet`
- animations: `marquee`, `scroll-wheel`

#### frontend/src/styles/story-detail-theme.css

- Tailwind import: 없음
- tokens: `--blue`, `--ink`, `--line`, `--muted`, `--surface-2`, `--violet`
- animations: `story-heart-float`, `story-heart-pop`

#### frontend/src/styles/travel-page-actions.css

- Tailwind import: 없음
- tokens: `--action-blue`, `--action-blue-hover`, `--action-border`, `--action-soft`
- animations: 없음

## 하네스 사용법

- 구조 변경 후 `npm --prefix .agent run harness:index`로 재생성합니다.
- `npm --prefix .agent run harness:check`는 워크스페이스 경계를 확인하고, frontend가 active일 때 라우트, 빌드, SPA smoke까지 확인합니다.

