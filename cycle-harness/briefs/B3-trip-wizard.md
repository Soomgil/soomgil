# B3 — 여행 만들기 마법사 (목적지 미정 → 수상작으로 지역 확정)

의존: B0-2(stage), B1(매칭 데이터). 관련 질문: 없음 (Q13 홈 디자인과 무관).

## 현재 상태

- `frontend/src/pages/MyTripsPage.vue` — 단일 모달. `handleCreateTrip()` L197:
  title + displayDestination + selectedRegion(단일) → `tripStore.createTrip()` →
  intent가 route/ai면 `RoutePage`로 replace.
- 지역 검색: 모달 안에서 `geoApi`(`/legal-regions?q=`)로 검색해 `selectedRegion` 선택하는 UI가 이미 있음 (같은 파일 상단).
- 백엔드 `POST /api/v1/trips`는 legalRegionCodes 배열을 이미 받음. **백엔드 변경은 stage 초기값(B0-2)뿐.**

## 목표 플로우

```
[1단계] 여행 이름 (+기간 선택 사항)
[2단계] "어디로 갈지 정했나요?"
   ├─ 정했어요 → 기존 지역 검색 UI (legal-regions q=)
   └─ 아직이요 → 수상작 사진 그리드에서 끌리는 사진 선택 → 그 사진의 지역으로 확정
[생성] stage: 지역 있음=VOTING, 없음=REGION_PENDING
[이동] VOTING이면 /trips/:id/vote (B4), REGION_PENDING이면 지역 확정 화면 재진입 유도
```

## 프론트 작업

1. `MyTripsPage.vue` 생성 모달을 스텝형으로 개편 — 파일이 이미 크니
   `components/trip/TripCreateWizard.vue`로 분리 신설, MyTripsPage는 열기/닫기만.
   기존 모달의 지역 검색 로직(geoApi 부분)을 위저드로 이동.
2. 미정 분기: `awardApi.getAwardPhotos({ limit: 30 })` →
   `matchedPlaceContentId`가 있는 항목만 그리드로 (B1 완료 전제).
   사진 카드: 이미지 + placeName + regionName + 출처 캡션.
   선택 시: `displayDestination = photo.placeName`,
   `legalRegionCodes = [sidoLegalCode + '00000000']`… **주의**: trip_regions는 10자리 코드 체크만 있고
   FK 없음(V4 확인됨) → 시도 단위 확정이면 `matchedLegalSidoCode + '00000000'` 형태로 넣어도 저장은 되지만,
   `geo.legal_regions`에 없는 코드일 수 있음. 안전안: `geoApi.searchRegions(photo.regionName의 시군구 토큰)`으로
   실제 legal_regions 코드를 찾아 넣고, 실패 시 legalRegionCodes 생략 + displayDestination만.
3. 생성 후 이동: `router.replace({ name: 'TripVote', params: { tripId } })` (B4 라우트).
   B4 미완이면 임시로 RoutePage 유지 + TODO.
4. `types/trip.ts` — TripCreateRequest는 변경 없음 (stage는 서버가 정함).

## 백엔드 작업 (B0-2에 이미 포함, 여기선 확인만)

- `CreateTripHandler`: legalRegionCodes 유무로 stage 초기값 분기.
- `PATCH /trips/{tripId}`(UpdateTripRequest.legalRegionCodes)로 지역 나중 확정 →
  stage REGION_PENDING→VOTING 전이를 update 핸들러에 추가.

## 테스트 / 완료 기준

- 위저드에서 두 분기 모두로 여행 생성 → 응답 stage 확인.
- 수상작 선택 분기: 사진 선택 → displayDestination/지역 반영 확인.
- `MyTripsPage.test.ts` 갱신 (모달 열림 테스트가 위저드로 바뀜).
- 기존 홈 `새 여행 만들기`(`/my-trips?create=1`) 경로 회귀 없음.

## 읽기 목록

- `frontend/src/pages/MyTripsPage.vue` L150-240 (생성 로직) + 모달 template 부분
- `frontend/src/api/geo.api.ts`
- `frontend/src/api/award.api.ts` (1차 구현)
- `backend/.../trip/application/command/handler/CreateTripHandler.java`
