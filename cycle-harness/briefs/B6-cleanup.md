# B6 — 탭 제거·정리 (기록 / 취향 수집)

의존: 없음 (독립 — 아무 때나. 단 B2 완료 후가 자연스러움: 취향 수집 진입점이 온보딩으로 대체된 뒤).
관련 질문: **Q10**(record 백엔드).

## 삭제/수정 목록 (조사 완료 — 그대로 실행)

### frontend 수정

| 파일 | 작업 |
| :--- | :--- |
| `src/components/layout/AppHeader.vue` L26-32 | `serviceNavItems`에서 `취향 수집`(/swipe), `기록`(/record) 항목 제거 |
| `src/components/layout/AppHeader.test.ts` | nav 항목 기대값 갱신 |
| `src/router/index.ts` | `/swipe`(L68-73), `/trips/:tripId/swipe` redirect(L74-77), `/record`(L105-110) 라우트 제거 |
| `src/router/guards.ts` | `to.name === 'Swipe'` warm 분기(L19-21) + `useSwipeStore` import 제거 |
| `src/pages/HomePage.vue` | 퀵액션 `내 취향 수집` 카드(router.push({name:'Swipe'}) 참조) → B4 투표 진입 또는 새 여행 만들기 카드로 교체 |
| `src/pages/LandingPage.vue` | grep에서 swipe 참조 있었음 — `/swipe` 링크 있으면 제거/교체 |
| `src/pages/SearchResultsPage.vue`, `src/pages/StoryWritePage.vue`, `src/components/community/StoryWriteModal.vue`, `src/pages/CommunityPage.vue`, `src/pages/MyTripsPage.test.ts` | `/record` 또는 `/swipe` 링크 참조 검색해 교체 (`grep -rn "'/record'\|name: 'Record'\|name: 'Swipe'\|'/swipe'" src`) |

### frontend 삭제

| 파일 | 비고 |
| :--- | :--- |
| `src/pages/SwipePage.vue` + `SwipePage.test.ts` | |
| `src/pages/RecordPage.vue` + `RecordPage.test.ts` | |
| `src/composables/useRecordPhotoUrlRefresh.ts` + `.test.ts` | RecordPage 전용 |
| `src/utils/record-photo-metadata.ts` + `.test.ts` | RecordPage 전용 (exifr 의존 — 삭제하면 exifr 미설치 문제도 사라짐) |
| `src/router/swipe-route.test.ts` | 라우트 삭제에 따라 |

### 절대 삭제 금지 (다른 화면이 사용)

- `src/api/swipe.api.ts`, `src/stores/swipe.store.ts`, `src/composables/useSwipeFeed.ts`, `src/composables/useSwipe.ts`,
  `src/components/swipe/*` — RoutePage `PlaceDiscoveryPanel` + `MyPage`가 사용.
  단, SwipePage 삭제 후 `PlaceSwipeCard.vue`/`SwipeActionBar.vue`가 어디서도 안 쓰이면 그때 제거
  (`grep -rn "PlaceSwipeCard\|SwipeActionBar" src` 결과 0이면).
- `src/types/media.ts` — RecordPage 전용 타입(L111 부근 PhotoRecord)만 제거, 나머지는 커뮤니티가 사용.
- `src/api/media.api.ts` — 유지.

### backend

- Q10 권장안(유지)이면 백엔드 변경 없음.
- 제거로 결정되면: `com.soomgil.record` 패키지 + `mappers/record/` + SecurityConfig 관련 라인 + V15 테이블은 유지(데이터).

## 완료 기준

- `npx vitest run` 통과 (기준선 259 - 삭제된 테스트 수).
- `npx vue-tsc --noEmit -p tsconfig.app.json` 신규 오류 0.
- 로그인 후 헤더에 홈/내 여행/커뮤니티만. `/swipe`, `/record` 직접 진입 시 NotFound.
- RoutePage 발견 패널, MyPage 슈퍼라이크 정상 (swipe.api 재사용처 회귀 확인).
