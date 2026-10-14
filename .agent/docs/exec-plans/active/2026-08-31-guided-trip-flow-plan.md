# 강제 유저 플로우 연결 계획 — 가입에서 일정 초안까지

작성일: 2026-08-31
대상 도메인: `auth`, `user`, `preference`, `place`, `tourismsource`, `trip`, `itinerary`, `collaboration` + `frontend`

## 1. 문제 정의

현재 서비스는 기능이 개별적으로는 존재하지만 **서로 연결되어 있지 않다.**
로그인해서 들어온 사용자는 홈에서 무엇을 먼저 해야 하는지 알 수 없고,
여행을 만들어도 빈 지도 워크스페이스(`RoutePage`)에 떨어져 다음 행동을 스스로 찾아내야 한다.

이번 세션의 최종 목표는 **기존 기능들을 하나의 강제된 파이프라인으로 잇는 것**이다.

## 2. 목표 플로우

```
① 가입
     └ 최초 취향 수집 10개 (수상작 사진 기반) ─ 건너뛸 수 없음
          ↓
② 여행 만들기
     └ 목적지가 정해졌으면 → 지역 선택
     └ 목적지가 안 정해졌으면 → 수상작 사진을 보고 "여기 가고 싶다" 선택 → 지역 확정
          ↓
③ 장소 투표
     └ 확정된 지역의 후보 장소에 같이 가는 멤버들이 스티커를 붙여 투표
     └ 멤버 취향 합의 점수로 후보를 정렬해 제시
          ↓
④ 투표 종료
     └ 득표 장소로 여행 계획 **초안이 자동 생성**되어 RoutePage로 진입
```

## 3. 수상작 사진 사용 범위 (확정)

| 화면 | 이미지 소스 |
| :--- | :--- |
| 랜딩 / 로그인 / 회원가입 | 수상작 |
| 홈(메인) 배경 | 수상작 |
| ① 최초 취향 수집 10개 | 수상작 |
| ② 목적지 미정 시 지역 선택 | 수상작 |
| ③ 여행방 내 장소 투표 / 추천 | **기존 일반 관광지 소스 유지** |

수상작은 "서비스 얼굴"과 "여행 욕구를 자극하는 진입 단계"에만 쓰고,
실제 여행 계획 단계에서는 커버리지가 넓은 일반 관광지 소스를 계속 쓴다.

## 4. 확정된 제품 결정

| 항목 | 결정 |
| :--- | :--- |
| 온보딩 시점 | 가입 후 전용 라우트로 강제. 미완료 사용자는 라우터 가드로 되돌림 |
| 평가 UI | 좋아요 / 별로 2지선다 카드 10장. 기존 `SwipeReaction` 스키마 재사용 |
| 기존 사용자 | 기존 취향 데이터 **보존**. `onboarding_completed_at`이 비어 있으면 1회 요구, 결과는 누적 |
| 제거 | 헤더의 `기록` 탭, `취향 수집` 탭. 취향 수집은 온보딩과 여행방 투표로 흡수 |
| 투표 종료 조건 | **세 가지 모두 지원.** 멤버 전원 완료 / 방장 수동 종료 / 시간 만료 중 먼저 도달한 것 |
| 혼자 여행 | **투표를 건너뛰지 않는다.** 투표의 본질은 다수결이 아니라 "좋은지 아닌지 정하는 것"이므로 1인도 그대로 진행 |
| 일차 배분 | **자동 배분하지 않는다.** 득표 장소를 전부 `UNSCHEDULED`(일차 미정)에 넣고, 일차 배치는 사용자가 직접 한다 |

## 5. 조사 결과 — 이미 있는 것

플로우를 새로 만드는 게 아니라 **이어 붙이는 것**이다. 재료가 상당히 갖춰져 있다.

### 5.1 취향 저장 파이프라인 — 완성됨

```
PUT /api/v1/places/{provider}/{externalPlaceId}/swipe-reaction
  └ PreferenceUpsertSwipeReactionCommandHandler
      1. preference.user_place_reactions upsert
      2. preference.user_swipe_events 이벤트 로그
      3. SUPER_LIKE면 saved_places upsert
      4. 이전 enrichment 태그 증거 제거 → 현재 enrichment 태그 증거 추가
      5. user_preference_tag_weights.preference_score 재계산
```

**①의 온보딩 평가, ③의 투표 모두 이 엔드포인트를 그대로 재사용할 수 있다.**
스키마 변경 없이 `source` 구분만 추가하면 된다.

### 5.2 멤버 합의 기반 장소 추천 — 완성됨. 투표 집계의 절반이 이미 구현되어 있다

`PreferenceListPlaceRecommendationsQueryHandler`

- 여행의 `ACTIVE` 멤버 전원의 누적 태그 선호도를 읽는다.
- `BASIC` 탭: 모든 멤버 점수를 **곱**으로 반영하는 합의 점수로 정렬한다.
  한 멤버의 강한 선호가 다른 멤버의 낮은 선호를 덮지 않도록 설계되어 있다.
- `SUPER_LIKE` 탭: 최종 SUPER_LIKE 멤버 수를 우선하고 태그 점수는 동점 처리에 쓴다.
- 응답에 `matchedMembers`, `matchedMemberCount`, `totalMemberCount`, `matchPercentage`, `recommendationReason`이 들어 있다.
- 다른 멤버의 원시 선호 점수는 노출하지 않고 공개 요약만 반환한다.

프론트 `PlaceDiscoveryPanel.vue`가 이미 `3/5명의 취향과 잘 맞아요` 형태로 표시하고 있다.

> **③ 투표는 이 위에 "명시적 스티커 한 표"를 얹는 작업이다.** 후보 생성과 정렬은 이미 있다.

### 5.3 일정 조작 — 완성됨

- `AiItineraryToolService.addPlace(...)` → `ItineraryMutationResult` 반환. AI 없이 직접 호출 가능하다.
- **`addPlace`에 `itineraryDayId = null`을 넘기면 `UNSCHEDULED`(일차 미정) 그룹을 찾아 넣고,
  없으면 `"일차 미정"` 그룹을 자동으로 만들어서 넣는다.**
  일차 배분을 하지 않기로 한 결정과 정확히 맞아떨어진다.
- `AiAddRecommendedPlacesTools`가 이미 **추천 조회 → 일정 일괄 추가**를 한 번에 수행한다.
  다만 Spring AI `@Tool`로만 노출되어 있어 채팅을 거쳐야 한다.
- `ItineraryController`에 days / items / order / routes CRUD가 모두 있다.
- 일차 미정 그룹은 스키마에도 이미 있다.
  `itinerary_days.group_type IN ('DAY', 'UNSCHEDULED')`이고 `UNSCHEDULED`는 `day_number`가 NULL이다 (V7).

> **④ 초안 생성은 득표 장소를 순회하며 `addPlace(..., itineraryDayId = null)`을 호출하는
> 오케스트레이터 하나로 끝난다.** 일차 배분과 동선 최적화가 빠지면서 가장 단순한 구간이 되었다.

### 5.4 실시간 협업 — 완성됨

`collaboration` 도메인에 STOMP 기반 presence, 커서, 오브젝트 락, 명령 이벤트, undo/redo가 있다.
③ 투표의 실시간 반영에 그대로 쓸 수 있다.

### 5.5 스티커 — 존재하지만 용도가 다르다

`frontend/src/components/map/mapStickerCatalog.ts` + `assets/stickers/map-stickers.svg` +
`itinerary.map_drawings` (V43에서 협업 오브젝트로 확장됨).

현재는 **지도 위 자유 배치 낙서 오브젝트**이고 투표 의미는 없다.
③에서는 에셋과 카탈로그만 재사용하고, 투표 의미는 새로 정의해야 한다.

### 5.6 여행 생성 — 지역 지정 가능

`TripCreateRequest { title, displayDestination?, legalRegionCodes?, startDate?, endDate? }`
`MyTripsPage.handleCreateTrip`이 단일 지역을 선택해 `legalRegionCodes`로 넘긴다.
생성 후 `intent`가 `route` / `ai`면 `RoutePage`로 이동한다.

## 6. 수상작 API 실측 결과 (2026-08-31 확인)

엔드포인트: `https://apis.data.go.kr/B551011/PhokoAwrdService/phokoAwrdList`

| 항목 | 값 |
| :--- | :--- |
| `totalCount` | **95** |
| `cpyrhtDivCd` | 95건 전부 `Type1` |
| `orgImage` / `thumbImage` | 95건 전부 존재 |
| 고유 `koFilmst` | 83개 |
| `filmDay` 범위 | 202201 ~ 202407 |
| 페이징 | `numOfRows=200` 한 번에 전량 수집 가능 |

응답 필드:

```
contentId, koTitle, enTitle, lDongRegnCd, koFilmst, enFilmst, filmDay,
koCmanNm, enCmanNm, koWnprzDiz, enWnprzDiz, koKeyWord, enKeyWord,
orgImage, thumbImage, cpyrhtDivCd, regDt, mdfcnDt
```

샘플:

```json
{
  "contentId": "DVvwaI",
  "koTitle": "가야산 설경",
  "lDongRegnCd": "48",
  "koFilmst": "경상남도 합천군, 가야산국립공원",
  "koCmanNm": "서정철",
  "koWnprzDiz": "스마트폰 부문 [입선]",
  "orgImage": "https://tong.visitkorea.or.kr/cms/resource_photo/56/3414456_image2_1.jpg",
  "cpyrhtDivCd": "Type1"
}
```

### 6.1 함의

- **95장뿐이다.** ①(10장)과 홈 배경에는 충분하고, ②의 지역 선택에도 83개 촬영지면 충분하다.
  ③의 무한 후보에는 부족한데, ③은 일반 관광지 소스를 쓰기로 했으므로 문제되지 않는다.
- **전부 `Type1`** — 출처 표시 조건이 붙는다. 촬영자와 공모전명을 화면에 반드시 노출해야 한다.
  현재 코드의 `Type1 || Type3` 필터는 실질적으로 무의미하다.
- **`koFilmst` 형식이 일정하다.** `"시도 시군구 [읍면동], 관광지명"` — 쉼표 뒤가 장소명이다.
  이 규칙으로 `searchKeyword2` → KTO `contentId` 매칭이 가능하다.
- 출처 표시에 필요한 값이 전부 API에 있다: `koCmanNm`, `koWnprzDiz`, `koTitle`, `koFilmst`, `filmDay`.
- **`lDongRegnCd = 12`가 `전남광주통합특별시`로 내려온다.** `geo.legal_regions`에 대응 코드가 없을 가능성이 높다.
  `lDongRegnCd`가 빈 문자열인 항목도 3건 있다.

### 6.2 현재 수상작 연동의 문제

`KtoAwardPhotoClient`

- 매칭 방향이 **관광지 → 사진**의 역매칭이다. `findBest(장소명)`으로 `koFilmst`(3점) / `koTitle`(2점) /
  `koKeyWord`(1점) substring 점수를 매기고, 실패하면 조용히 일반 관광지 사진으로 대체된다.
- 반환값이 **이미지 URL 문자열 하나뿐**이다. 촬영자, 수상 부문, 저작권 구분이 API 경계에서 전부 유실된다.
  현재 구조로는 출처 표시를 만들 수 없다.
- `tourism_source.contest_award_photos` / `_matches` 스키마는 V25에 있지만
  **어떤 마이그레이션도 데이터를 넣지 않는다.** 완전히 비어 있어 `findAwardImage`는 항상 빈 결과다.
  게다가 이 테이블은 파일 다운로드 → S3 → 파일명 지역추출 전제라 API 적재용 컬럼이 없다.

수상작을 ①②와 홈에서 **주인공**으로 쓰려면 방향을 뒤집어야 한다.
사진이 피드의 단위가 되고, 사진에서 관광지를 찾는다. 95건이라 전수 수기 검수도 가능하다.

## 7. 기술 블로커

플로우를 잇기 전에 먼저 뚫어야 하는 지점이다.

### B1. 지역을 골라도 bbox를 만들 수 없다 — 가장 큰 블로커

`geo.legal_regions`는 `code / name / full_name / level / parent_code / sido_code / ...`만 가지고 있고
**좌표 컬럼이 전혀 없다.** centroid도 bbox도 없다.

그런데 `ListPlaceRecommendationsQuery`는 **`bbox`가 필수**다 (viewport 전제).
`GeoController`의 `/viewport`는 bbox → 요약의 **역방향**이라 쓸 수 없다.

즉 ②에서 지역을 확정해도 ③의 후보 장소를 뽑을 수 없다.

해결안:

- `tourism_source.attractions`에 `latitude` / `longitude` / `area_code` / `si_gun_gu_code`가 있으므로
  **지역별 bbox 집계 뷰 또는 테이블**을 만든다.
- 또는 ②에서 수상작을 고른 경우, 매칭된 관광지 좌표를 중심으로 반경 bbox를 계산한다.
- 추천 API에 `legalRegionCode` 파라미터를 추가해 bbox 없이도 조회 가능하게 한다.

### B2. 태그 enrichment가 없는 장소는 취향 점수를 움직이지 않는다

태그 증거는 `place_tag_enrichments.status = 'SUCCEEDED'`인 장소에만 쌓인다.
enrichment가 없는 장소는 반응을 저장해도 `user_preference_tag_weights`가 그대로다.

- ①의 10개 장소는 enrichment를 **사전 보장**해야 한다. 아니면 온보딩이 아무 효과가 없다.
- ③의 투표 후보군도 enrichment 커버리지를 확인해야 한다.

### B3. 투표 세션이라는 개념이 없다

`planning` 도메인은 체크리스트와 노트뿐이고, 투표 도메인은 존재하지 않는다.
`collaboration`은 지도 편집 실시간화이지 의사결정 집계가 아니다.

후보군, 멤버별 한 표, 종료 조건, 종료 시각, 결과 스냅샷을 담을 저장소가 필요하다.

### B4. 여행의 준비 단계 상태가 없다

`TripStatus`는 `ACTIVE / ARCHIVED / DELETED`뿐이다.
"지역 미정 → 투표 중 → 초안 생성됨"을 표현할 수 없어 사용자를 다음 단계로 강제할 수 없다.

## 8. 작업표

상태 규칙은 `2026-06-23-product-fix-workboard.md`와 동일하다.

### 8.0 선행 — 블로커 해소

| ID | 작업 | 상태 | 비고 |
| :--- | :--- | :--- | :--- |
| `GF-001` | 지역 코드 → bbox 변환 수단 마련 | `TODO` | B1. `attractions` 좌표 집계 뷰 우선 검토 |
| `GF-002` | `ListPlaceRecommendationsQuery`에 `legalRegionCode` 파라미터 추가 | `TODO` | bbox 없이 지역 단위 조회 |
| `GF-003` | 온보딩 10개 및 투표 후보군의 enrichment 커버리지 확인 | `NEEDS_REPRO` | B2 |
| `GF-004` | `trips`에 준비 단계 컬럼 추가 | `TODO` | B4. `REGION_PENDING / VOTING / DRAFTED / PLANNING` |

### 8.1 수상작 이미지 파이프라인

| ID | 작업 | 상태 | 비고 |
| :--- | :--- | :--- | :--- |
| `GF-010` | `contest_award_photos`에 API 기반 컬럼 추가 마이그레이션 | `TODO` | `award_content_id`(유니크), `copyright_div_code`, `org_image_url`, `thumb_image_url`, `film_location_text`, `film_day`, `photographer_name`, `award_division`, `legal_region_code` |
| `GF-011` | `PhokoAwrdService` 전량(95건) 적재 배치 | `TODO` | `numOfRows=200` 1회 호출 |
| `GF-012` | `koFilmst` 파싱 → `searchKeyword2` → KTO `contentId` 매칭 배치 | `TODO` | 쉼표 뒤 장소명 우선, 실패 시 `koTitle` / `koKeyWord` |
| `GF-013` | 매칭 결과 전수 수기 검수 후 시드 마이그레이션 확정 | `TODO` | 95건 규모 |
| `GF-014` | `KtoAwardPhotoClient.findBest`가 메타데이터 객체를 반환하도록 변경 | `TODO` | `withPhotos` 호출부 동반 수정 |
| `GF-015` | 수상작 조회 API 신설 (`GET /api/v1/award-photos`) | `TODO` | 출처 + 매칭 관광지 + 내 좋아요 여부 |
| `GF-016` | `lDongRegnCd=12`(전남광주통합특별시) 및 빈 코드 3건 지역 매핑 확인 | `NEEDS_REPRO` | |

### 8.2 ① 가입 → 최초 취향 수집

| ID | 작업 | 상태 | 비고 |
| :--- | :--- | :--- | :--- |
| `GF-020` | `onboarding_completed_at` 컬럼 추가 | `TODO` | 기존 사용자는 NULL 유지 |
| `GF-021` | 온보딩 10개 큐레이션 선정 기준 확정 | `NEEDS_CONFIRMATION` | 태그 다양성 + 지역 분산 기준 고정 큐레이션 제안 |
| `GF-022` | `GET /api/v1/onboarding/preference-places` 신설 | `TODO` | 수상작 사진 + 관광지 정보 + 출처 |
| `GF-023` | 초기 평가 반응 저장 | `TODO` | 기존 upsert 핸들러 재사용, `source='onboarding'` |
| `GF-024` | 온보딩 완료 처리 + `/me` 응답에 완료 여부 노출 | `TODO` | |
| `GF-025` | `/onboarding/preference` 라우트 + 평가 화면 | `TODO` | 좋아요 / 별로 2지선다 카드 10장 |
| `GF-026` | 라우터 가드에 온보딩 미완료 리다이렉트 추가 | `TODO` | `requiresAuth` 진입 시 검사 |
| `GF-027` | 이메일 인증 완료 / OAuth 온보딩 완료 후 진입 경로 연결 | `TODO` | `useAuth.register`는 현재 `/verify-email`로 이동 |

### 8.3 ② 여행 만들기 → 지역 확정

| ID | 작업 | 상태 | 비고 |
| :--- | :--- | :--- | :--- |
| `GF-030` | 여행 생성 마법사로 전환 (이름 → 목적지 정함/미정 분기 → 기간) | `TODO` | 현재는 단일 모달 |
| `GF-031` | 목적지 미정 분기: 수상작 사진 선택으로 지역 확정 | `TODO` | 선택한 수상작의 매칭 관광지 → `legalRegionCodes` + bbox |
| `GF-032` | 생성 직후 다음 단계로 강제 이동 | `TODO` | `RoutePage` 대신 ③ 투표 화면 |
| `GF-033` | 여행 생성 후 멤버 초대 유도 삽입 | `TODO` | 혼자면 투표가 무의미. 기존 초대 링크 기능 재사용 |

### 8.4 ③ 장소 투표

| ID | 작업 | 상태 | 비고 |
| :--- | :--- | :--- | :--- |
| `GF-040` | 투표 세션 스키마 설계 | `TODO` | B3. 후보군 / 멤버별 표 / 종료 조건 / 결과 스냅샷 |
| `GF-041` | 투표 후보군 생성 | `TODO` | `ListPlaceRecommendationsQueryHandler` + `legalRegionCode` 재사용 |
| `GF-042` | 스티커 투표 UI | `TODO` | `mapStickerCatalog` 에셋 재사용, 의미는 새로 정의 |
| `GF-043` | 투표를 취향 반응으로도 저장 | `TODO` | 기존 swipe-reaction 재사용, `source='trip-vote'` |
| `GF-044` | 투표 실시간 반영 | `TODO` | 기존 collaboration STOMP 채널 재사용 |
| `GF-045` | 투표 종료 조건 3종 구현 | `TODO` | 전원 완료 / 방장 수동 종료 / 시간 만료. 먼저 도달한 것이 종료를 확정 |
| `GF-046` | 1인 여행방에서도 투표 진행 | `TODO` | 전원 완료 조건이 즉시 충족되므로 종료 처리 경로만 확인 |
| `GF-047` | 만료 시각 도달 시 자동 종료 수단 | `TODO` | 스케줄러 또는 조회 시점 lazy 종료 중 선택 |

### 8.5 ④ 일정 초안 자동 생성

| ID | 작업 | 상태 | 비고 |
| :--- | :--- | :--- | :--- |
| `GF-050` | 초안 생성 오케스트레이터 신설 | `TODO` | 득표 장소를 순회하며 `AiItineraryToolService.addPlace(..., itineraryDayId = null)` 직접 호출 |
| `GF-051` | 득표 장소를 전부 `UNSCHEDULED`에 투입 | `TODO` | 일차 배분 없음. `addPlace`가 "일차 미정" 그룹을 자동 생성한다 |
| `GF-052` | 동선 최적화 자동 실행 | `DROPPED` | 일차 미정에만 넣으므로 최적화할 동선이 없다. 사용자가 일차를 배치한 뒤 기존 기능으로 수행 |
| `GF-053` | 초안 생성 결과로 `RoutePage` 진입 | `TODO` | 빈 워크스페이스 문제 해소 |
| `GF-054` | 초안 재생성 / 되돌리기 경로 | `TODO` | 기존 undo/redo 및 버전 체계 확인 필요 |
| `GF-055` | 일차 미정 항목을 일차로 옮기도록 유도하는 안내 | `TODO` | 초안 진입 직후 다음 행동을 명시 |

### 8.6 탭 제거 및 정리

| ID | 작업 | 상태 | 비고 |
| :--- | :--- | :--- | :--- |
| `GF-060` | `AppHeader.vue`에서 `기록`, `취향 수집` 제거 | `TODO` | `AppHeader.test.ts` 동반 수정 |
| `GF-061` | 라우터에서 `/record`, `/swipe`, `/trips/:tripId/swipe` 제거 | `TODO` | `router/swipe-route.test.ts` 정리 |
| `GF-062` | `RecordPage` + 테스트 + `useRecordPhotoUrlRefresh` + `record-photo-metadata` 제거 | `TODO` | `types/media.ts`의 RecordPage 전용 타입 정리 |
| `GF-063` | `SwipePage` + 테스트 제거 | `TODO` | **`swipe.api.ts` / `swipe.store.ts` / `components/swipe/*`는 유지.** `RoutePage`의 `PlaceDiscoveryPanel`과 `MyPage`가 사용 중 |
| `GF-064` | `router/guards.ts`의 `Swipe` warm 분기 제거 | `TODO` | |
| `GF-065` | 홈 퀵액션의 `내 취향 수집` 카드 제거 또는 재평가 진입점으로 교체 | `TODO` | |
| `GF-066` | 백엔드 `record` 도메인 API 유지 여부 확인 | `NEEDS_CONFIRMATION` | `media`는 커뮤니티가 계속 사용 |

### 8.7 홈 / 랜딩 / 로그인 수상작 적용

| ID | 작업 | 상태 | 비고 |
| :--- | :--- | :--- | :--- |
| `GF-070` | 홈 배경 이미지 영역 디자인 확정 | `NEEDS_CONFIRMATION` | 사용자가 직접 지정 예정 |
| `GF-071` | 홈 슬라이드 소스를 수상작 전용으로 교체 | `TODO` | 현재는 커뮤니티 스토리 + 인기 장소 혼합 |
| `GF-072` | 배경 이미지 좋아요 이력 테이블 신설 | `TODO` | `preference.user_award_photo_likes` |
| `GF-073` | 이미지 좋아요 API + 취향 반영 규칙 확정 | `NEEDS_CONFIRMATION` | 매칭 관광지가 있으면 LIKE로 승격할지 결정 필요 |
| `GF-074` | 이미지 출처 / 관광지 정보 / 좋아요 여부 오버레이 | `TODO` | Type1 출처 표시 의무 |
| `GF-075` | 랜딩 / 로그인 / 회원가입 히어로 이미지를 수상작으로 교체 | `TODO` | 현재 `/images/랜딩페이지/jeonju.png` 등 정적 파일 |
| `GF-076` | 홈에 현재 여행의 다음 할 일 배너 추가 | `TODO` | 준비 단계별로 ②③④ 진입점 노출 |

## 9. 권장 진행 순서

1. **`GF-001` ~ `GF-004`** — 블로커부터. 특히 지역 → bbox가 없으면 ③이 성립하지 않는다.
2. **`GF-010` ~ `GF-016`** — 수상작 적재와 매칭. ①②와 홈이 전부 여기에 의존한다.
3. **`GF-020` ~ `GF-027`** — 온보딩. 플로우의 시작점이자 이후 추천 품질의 전제다.
4. **`GF-030` ~ `GF-033`** — 여행 생성 마법사.
5. **`GF-040` ~ `GF-045`** — 투표. 신규 설계가 가장 많은 구간이다.
6. **`GF-050` ~ `GF-054`** — 초안 생성. 여기까지 와야 플로우가 닫힌다.
7. **`GF-060` 이후** — 탭 정리와 홈 적용.

## 10. 미결 항목

1. `GF-021` 온보딩 10개 큐레이션 선정 기준.
2. `GF-066` 백엔드 `record` 도메인 유지 여부.
3. `GF-070` 홈 배경 영역 디자인.
4. `GF-073` 홈 이미지 좋아요를 관광지 LIKE로 승격할지 여부.
5. `GF-047` 투표 시간 만료를 스케줄러로 처리할지, 조회 시점 lazy 종료로 처리할지.
6. 투표 만료 기본 시간값.

해소된 항목:

- 투표 종료 조건 → 전원 완료 / 방장 종료 / 시간 만료 3종 모두 지원.
- 일차 배분 → 자동 배분 없이 전부 일차 미정에 투입.
- 1인 여행방 → 투표를 그대로 진행.

## 11. 브랜치 계획

`git_workflow.md`에 따라 `develop`에서 분기한다.

| repo | 브랜치 |
| :--- | :--- |
| `frontend` | `feature/guided-trip-flow` |
| `backend` | `feature/guided-trip-flow` |
| `soomgil` | `feature/guided-trip-flow` (submodule pointer + 본 문서) |
