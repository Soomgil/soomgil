# B0 — 선행 블로커 해소

의존: 없음 (가장 먼저). 관련 질문: Q9.
이걸 안 하면 B4(투표 후보 생성)가 제주 밖에서 전부 빈다.

## B0-1. 지역 전국 지원 — `liveAreaCode` 확장 (구 GF-001/002)

### 문제

- `backend/src/main/java/com/soomgil/place/infrastructure/external/KtoTourismPlaceClient.java` L642 `liveAreaCode()`:
  legalRegionCode가 "39"로 시작하거나 bbox가 제주와 겹칠 때만 areaCode 반환. **그 외 전부 null → fetchLive 빈 목록.**
- `PreferenceListPlaceRecommendationsQueryHandler.validate()` L402-414: bbox 필수.

### 해법 (실측 데이터 있음 — 재조사 금지)

`data/area-bboxes.json`에 **17개 KTO 지역 전부의 실측 bbox/center + 법정동 시도코드 매핑**이 있다:

```json
"legalSidoToKtoArea": { "11":"1","28":"2","30":"3","27":"4","29":"5","26":"6","31":"7","36":"8",
  "41":"31","51":"32","43":"33","44":"34","47":"35","48":"36","52":"37","46":"38","50":"39" }
```

작업:

1. 신규 `place/domain/policy/KtoAreaCatalog.java` (또는 infrastructure/external 아래) —
   법정동 시도코드(legal_regions.code 앞 2자리) → KTO areaCode 정적 맵 + areaCode별 bbox 상수.
   값은 `data/area-bboxes.json`에서 복사. JavaDoc에 "2026-08-31 KTO areaBasedList2 실측 집계" 명시.
2. `liveAreaCode()` 교체:
   - legalRegionCode 있으면 → 앞 2자리로 카탈로그 조회.
   - bbox만 있으면 → 각 areaCode bbox와 겹침 검사(기존 `bboxOverlapsJeju` 일반화). 겹치는 지역 1곳 선택(면적 교집합 최대).
3. `ListPlaceRecommendationsQuery`(preference/application/query/dto)에 `String legalRegionCode` 필드 추가.
   `PreferenceController.listPlaceRecommendations`에 `@RequestParam(required=false) String legalRegionCode` 추가.
   `validate()`: bbox 또는 legalRegionCode 중 하나 필수로 완화.
   bbox가 없고 legalRegionCode만 있으면 카탈로그 bbox로 대체(거리 계산·bounds 필터용).
4. `PlaceViewportCandidateQuery`(place/application/query/dto)에 legalRegionCode 추가,
   `TourismSourcePlaceViewportCandidateQueryHandler`에서 `TourismPlaceLiveSearchRequest`의 legalRegionCode 슬롯(이미 존재)에 전달.

### 테스트

- `KtoTourismPlaceClientTest`에 liveAreaCode 단위 케이스 (기존 테스트 파일 존재).
- 검증: 백엔드 기동 후 서울 bbox로 `GET /api/v1/trips/{tripId}/place-recommendations?bbox=126.8,37.4,127.2,37.7` 가 비지 않는지.
  (demo 계정 trip 필요 — CONTEXT.md 계정으로 로그인 후 기존 여행 사용)

## B0-2. `trip.trips.stage` 준비 단계 컬럼 (구 GF-004)

### V44 마이그레이션 초안

```sql
ALTER TABLE trip.trips ADD COLUMN stage varchar(30) NOT NULL DEFAULT 'PLANNING';
ALTER TABLE trip.trips ADD CONSTRAINT trip_trips_stage_check
  CHECK (stage IN ('REGION_PENDING', 'VOTING', 'DRAFTED', 'PLANNING'));
CREATE INDEX trip_trips_stage_idx ON trip.trips (stage);
```

기존 행 기본값은 Q9 답에 따름 (권장: 전부 PLANNING → 위 SQL 그대로).

### 상태 전이

```
생성(지역 없음) → REGION_PENDING → (지역 확정) → VOTING → (투표 종료+초안 생성) → DRAFTED → (사용자가 일차 배치 시작 or 그냥) → PLANNING
생성(지역 있음) → VOTING
```

DRAFTED→PLANNING 전이는 단순화를 위해 "RoutePage 진입 시 자동" 권장.

### 코드 변경 지점

- `trip/domain/model/Trip.java` — 필드+`create()` 시그니처. (파일 위치: backend/src/main/java/com/soomgil/trip/domain/model/)
- `trip/api/dto/TripSummary.java`, `TripDetail.java` — stage 노출.
- `mappers/trip/TripQueryMapper.xml` — SELECT에 stage 추가 (start_date 파생 서브쿼리 있는 3곳: L28, L119, L161 부근).
- `TripCommandRepository` 구현( infrastructure/persistence )의 INSERT에 stage.
- stage 전이 커맨드: 신규 `UpdateTripStageHandler` 또는 각 도메인 이벤트에서 직접 UPDATE. 투표 모듈(B4)이 VOTING→DRAFTED를 밟으므로 trip 모듈에 전이 전용 핸들러 두는 걸 권장.
- 프론트 `types/trip.ts` — `TripStage` 타입 + TripSummary/TripDetail 필드.

### 완료 기준

- V44 적용 후 기존 seed 여행 정상 조회.
- `POST /trips` 응답에 stage 포함. legalRegionCodes 있으면 VOTING, 없으면 REGION_PENDING으로 생성(B3에서 사용).

## B0-3. enrichment 커버리지 (구 GF-003) — 해소됨, 작업 없음

`SwipeTagPreparationService.prepare()`가 자동 enrichment 큐잉을 이미 한다 (CONTEXT.md).
B2 온보딩 엔드포인트에서 prepare()를 호출하기만 하면 된다. 별도 작업 불필요.
