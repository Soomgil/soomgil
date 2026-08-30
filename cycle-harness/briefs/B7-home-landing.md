# B7 — 홈/랜딩/로그인 수상작 적용 + 이미지 좋아요

의존: B1(매칭 필드 — 좋아요 승격에 필요). 관련 질문: **Q11**(승격), **Q13**(홈 디자인 — 블로킹).
1차 완료분: 홈 히어로 캐러셀 = 수상작 + 출처 오버레이 (CONTEXT.md).

## B7-1. 랜딩/로그인/회원가입 히어로 교체 (GF-075) — Q13 없이 진행 가능

현재 정적 이미지:

- `LoginPage.vue` — 히어로 이미지 (경복궁 야경 계열 정적 파일)
- `RegisterPage.vue` L27 — `const heroImg = '/images/랜딩페이지/jeonju.png'`
- `LandingPage.vue` — `src/assets/images/랜딩페이지/` 참조 다수

작업:

- `GET /award-photos`는 permitAll이므로 비로그인 페이지에서 호출 가능.
- 공용 컴포저블 `composables/useAwardHero.ts` 신설: `awardApi.getAwardPhotos({limit:1})` →
  `{ imageUrl, credit }` 반환 + 실패 시 기존 정적 이미지 fallback.
- 출처 캡션 컴포넌트 `components/common/AwardPhotoCredit.vue` 신설
  (HomePage.vue의 `.home-hero-credit` 마크업/스타일 추출) — 홈 히어로도 이걸 쓰도록 교체.
- LandingPage는 이미지가 여러 곳이라 히어로 1곳만 교체하고 나머지는 유지 (범위 최소화).

## B7-2. V48 — 이미지 좋아요 (GF-072/073)

```sql
CREATE TABLE preference.user_award_photo_likes (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  award_content_id varchar(40) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, award_content_id)
);
CREATE INDEX idx_user_award_photo_likes_user ON preference.user_award_photo_likes (user_id);
```

### API — `preference/api/AwardPhotoLikeController.java`

```
PUT    /api/v1/award-photos/{awardContentId}/like   → 201/200
DELETE /api/v1/award-photos/{awardContentId}/like   → 204
```

- 핸들러에서 Q11 권장안이면: like 시 `AwardPlaceMatchCatalog.findByAwardContentId()`(B1)로 매칭 장소를 찾아
  `UpsertSwipeReactionCommandHandler.handle(new UpsertSwipeReactionCommand(KTO, placeContentId, LIKE, null))` 병행 호출.
  unlike 시에는 장소 반응을 **되돌리지 않는다** (사용자가 스와이프로 이미 다른 반응을 남겼을 수 있음 — 단방향 승격).
- `GET /award-photos` 응답에 `likedByMe: boolean` 추가 — 이 필드 때문에
  `KtoListAwardPhotosQueryHandler`에 `ObjectProvider<CurrentUserProvider>` 주입 (비로그인=false).
  permitAll 경로라 CurrentUserProvider가 없을 수 있음 → `getIfAvailable()` null 안전 처리
  (`PreferenceSwipeFeedQueryHandler` L100 패턴).

### 프론트

- `award.api.ts`에 like/unlike. `types/award.ts`에 likedByMe.
- 홈 히어로 오버레이에 하트 토글 (비로그인 시 클릭 → 로그인 유도 toast + /login).

## B7-3. 홈 배경 전면 개편 (GF-070/071) — **Q13 답 대기**

Q13에 디자인이 오면 그때 HomePage.vue 히어로 영역을 재작성.
현재 캐러셀 슬라이드 소스는 이미 수상작 전용으로 교체돼 있으므로 (1차 완료),
디자인 답이 없으면 이 항목은 건너뛰고 B7-1/2만 진행.

## B7-4. 다음 할 일 배너 (GF-076)

홈 상단에 stage 기반 안내 배너 (B0-2의 stage 필드 사용):

- REGION_PENDING 여행 존재 → "OO 여행, 어디로 갈지 정해볼까요?" → 위저드 지역 스텝
- VOTING → "장소 투표가 진행 중이에요 (n/m명 완료)" → /trips/:id/vote
- DRAFTED → "일정 초안이 준비됐어요" → RoutePage
- 소스: `tripApi.getTrips({status:'ACTIVE'})` 중 stage가 PLANNING이 아닌 첫 여행.

## 테스트 / 완료 기준

- like 왕복 + likedByMe 반영. Q11이면 like 후 `user_place_reactions`에 행 생성 확인.
- 비로그인 랜딩/로그인 페이지에 수상작 + 출처 노출, API 실패 시 정적 이미지 fallback.
- vitest 기준선 유지.
