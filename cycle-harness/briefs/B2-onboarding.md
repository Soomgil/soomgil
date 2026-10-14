# B2 — 가입 온보딩: 최초 취향 수집 10장

의존: B1(수상작 사진·매칭). 관련 질문: **Q1**(큐레이션), **Q12**(초대 수락).
결정 완료: 좋아요/별로 2지선다, 라우트 강제, 기존 사용자 데이터 보존 + 미완료 시 1회 요구.

## 백엔드

### V45 마이그레이션

```sql
ALTER TABLE auth.users ADD COLUMN onboarding_completed_at timestamptz;
```

기존 사용자 NULL 유지 (= 다음 로그인 시 온보딩 요구. 결정 사항).
**주의**: demo 시연 계정 20개가 전부 온보딩으로 끌려가면 시연이 번거로움 →
마이그레이션에 `UPDATE auth.users SET onboarding_completed_at = now();`를 넣을지는 결정 사항과 상충하므로 넣지 않는다.
대신 시연 시 demo01로 온보딩 1회 통과하면 됨.

### `/me`에 완료 여부 노출

- `auth/domain/model/AuthUser.java` — 필드 추가.
- `auth/infrastructure/persistence/UserMapper.java` — `@Select("SELECT id, status, last_login_at, created_at ...")`(L26)에
  `onboarding_completed_at` 추가. **어노테이션 방식 mapper**다 (XML 아님).
- `user/api/dto/User.java` record에 `OffsetDateTime onboardingCompletedAt` 추가.
- `auth/application/handler/GetCurrentUserQueryHandler.java` — 응답 조립에 반영.
- User record를 조립하는 다른 곳 전부 컴파일 에러로 드러남 → 따라가며 채움 (auth 로그인/onboard 응답 포함 — `AuthTokenResponse`가 user를 포함하는지 확인: `frontend/src/stores/auth.store.ts` L109 `authToken.onboarded` 참고. **주의: OAuth의 기존 `onboarded` 플래그는 "약관/닉네임 온보딩"이지 취향 온보딩이 아님. 이름 충돌 조심 — 새 필드는 `preferenceOnboardedAt` 같은 구분되는 이름도 고려.**)

### 온보딩 API — 신규 `preference/api/OnboardingController.java`

```
GET  /api/v1/onboarding/preference-places
  → [{ place: SwipeFeedPlace 상당, awardPhoto: { imageUrl, photographer, awardDivision, title } }] 10건
POST /api/v1/onboarding/completion  → 204
```

- GET 구현: 큐레이션 10곳의 contentId 목록(Q1 확정본)을 리소스 파일
  `backend/src/main/resources/preference/onboarding-places.json`으로 두고
  — **완성된 초안이 `data/onboarding-places.draft.json`에 있다 (사진 URL·출처·촬영자까지 병합 완료).
  Q1 승인이면 그대로 복사**,
  `TourismPlaceFeedClient.fetchOne(contentId)`로 상세 로드 (기존 메서드, 캐시 있음)
  + **`SwipeTagPreparationService.prepare(items)` 호출** (enrichment 자동 생성 — 10곳 중 8곳이 미보유 상태)
  + `AwardPlaceMatchCatalog`(B1)를 역방향으로 조회해 수상작 사진·출처 병합.
  역방향 조회 필요 → B1 카탈로그에 `findByPlaceContentId()`도 추가.
- 반응 저장은 **기존 엔드포인트 재사용**: 프론트가 `PUT /places/KTO/{contentId}/swipe-reaction` `{reaction:'LIKE'|'NOPE'}` 호출.
  신규 커맨드 불필요.
- POST completion: `UPDATE auth.users SET onboarding_completed_at = now() WHERE id = ?` — auth 도메인에
  `CompletePreferenceOnboardingCommandHandler` 신설 (UserMapper에 @Update 추가).
  이미 완료된 사용자가 또 호출하면 no-op (덮어쓰지 않음).
- SecurityConfig 변경 불필요 (requiresAuth 기본).

## 프론트엔드

### 라우트 + 가드

`router/index.ts`:

```ts
{ path: '/onboarding/preference', name: 'OnboardingPreference',
  component: () => import('@/pages/OnboardingPreferencePage.vue'),
  meta: { requiresAuth: true, hideLayout: true } }
```

`router/guards.ts` — requiresAuth 통과 후:

```ts
if (to.meta.requiresAuth && auth.isAuthenticated && to.name !== 'OnboardingPreference') {
  if (!auth.user) { try { await auth.fetchUser() } catch { /* 못 읽으면 통과 */ } }
  if (auth.user && !auth.user.onboardingCompletedAt) {
    next({ name: 'OnboardingPreference', query: { redirect: to.fullPath } })
    return
  }
}
```

- Q12 권장안이면 위 로직 그대로 (초대 수락도 requiresAuth라 자동 커버, redirect로 복귀).
- `types/auth.ts` User + `mapBackendUser()`에 `onboardingCompletedAt` 추가.

### 페이지 `pages/OnboardingPreferencePage.vue`

- API: 신규 `api/onboarding.api.ts` — `getPreferencePlaces()`, `complete()`.
- 카드 스택: 큰 수상작 사진 배경 + 관광지명/지역 + 출처 캡션(HomePage.vue의 `.home-hero-credit` 스타일 재사용)
  + 하단 [별로예요 | 좋아요] 두 버튼. 스와이프 제스처는 선택 사항 (버튼이면 충분, `SwipePage.vue`는 곧 삭제되므로 복사하지 말 것).
- 각 선택마다 `swipeApi.react('KTO', contentId, 'LIKE'|'NOPE')` (기존 `api/swipe.api.ts` 재사용).
  실패해도 진행은 막지 않되 재시도 1회.
- 10장 완료 → `onboardingApi.complete()` → `auth.user.onboardingCompletedAt` 갱신(스토어에서 fetchUser)
  → `route.query.redirect ?? '/home'`으로 이동.
- 진행 표시 (n/10).

### 진입 경로 연결

- 이메일 가입: `VerifyEmailPage` → `/login` → 로그인 → 가드가 온보딩으로 보냄. **추가 작업 없음.**
- OAuth: `RegisterPage`(oauth=1) `authStore.onboard()` 후 `router.push('/home')` (L86) → 가드가 처리. **추가 작업 없음.**
- `RegisterPage.vue` L180 문구 `가입하고 취향 수집 시작` → 유지해도 됨 (진짜로 취향 수집으로 이어지게 됐으니).

## 테스트 / 완료 기준

- 가드 단위 테스트: `router/swipe-route.test.ts` 패턴 참고해 onboarding 리다이렉트 케이스.
- 신규 계정 흐름 수동 검증: 가입 → 인증(mailpit http://localhost:8125) → 로그인 → 온보딩 강제 → 10장 평가 →
  `preference.user_place_reactions`에 10행 → 홈 진입. demo01은 온보딩 1회 후 재로그인 시 미노출.
- 반응 후 `user_preference_tag_weights` 변화 확인 (enrichment 생성 전이면 점수 반영이 늦을 수 있음 — PENDING 후 재반응 필요 없음, enrichment 완료 시 `refreshPlaceEnrichment`가 소급 반영함. `PreferenceUpsertSwipeReactionCommandHandler.refreshPlaceEnrichment` 참조).
