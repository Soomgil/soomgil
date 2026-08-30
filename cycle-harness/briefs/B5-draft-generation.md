# B5 — 투표 종료 → 일정 초안 자동 생성

의존: B4(투표 종료 훅). 관련 질문: **Q8**(선정 기준).
결정 완료: 전부 UNSCHEDULED(일차 미정) 투입, 일차 배분·동선 최적화 없음.

## 핵심 — 이미 있는 조각으로 끝난다

`AiItineraryToolService.addPlace(tripId, userId, baseVersion, input)` —
`backend/src/main/java/com/soomgil/ai/application/AiItineraryToolService.java` L74:

- `input.itineraryDayId == null`이면 UNSCHEDULED 그룹 탐색 → 없으면 `"일차 미정"` 그룹 자동 생성 → 그 그룹에 item 추가.
- 반환 `ItineraryMutationResult`에 갱신된 `itineraryVersion` 포함 → 다음 addPlace의 baseVersion으로 체이닝.
- `AddPlaceInput` record (L305, 검증 완료):
  `(UUID itineraryDayId, int sortOrder, String placeProvider, String externalPlaceId, String placeName, String address, Double lat, Double lng, URI thumbnailUrl)`
  — **thumbnailUrl은 String이 아니라 `java.net.URI`**. `FindItineraryQuery(UUID tripId, UUID userId)`,
  `ItineraryMutationResult(UUID tripId, long itineraryVersion, day, item, route, ...)` 도 검증 완료.

## 작업 — `vote/application/command/handler/GenerateTripDraftHandler.java` (오케스트레이터)

B4의 종료 처리 공통 로직에서 호출:

```java
@Transactional
public void handle(UUID tripId, UUID sessionId, UUID triggeredByUserId) {
    List<WinnerRow> winners = mapper.findWinners(sessionId);  // Q8 기준 (권장: LIKE > NOPE)
    if (winners.isEmpty()) { /* stage는 DRAFTED로 두되 빈 초안 — 프론트에서 안내 */ return; }
    var itinerary = findItineraryHandler.handle(new FindItineraryQuery(tripId, triggeredByUserId));
    long version = itinerary.itineraryVersion();
    int order = 0;
    for (WinnerRow w : winners) {
        var result = itineraryToolService.addPlace(tripId, triggeredByUserId, version,
            new AddPlaceInput(null, order++, w.provider(), w.externalPlaceId(),
                w.placeName(), w.address(), w.lat(), w.lng(), w.thumbnailUrl()));
        version = result.itineraryVersion();
    }
}
```

주의사항:

- **중복 방지**: 이미 일정에 있는 place는 건너뛴다 — `AiAddRecommendedPlacesTools`가 같은 문제를
  provider/externalPlaceId 조합 체크로 푼다 (`backend/.../ai/application/AiAddRecommendedPlacesTools.java` 참조, 그 로직 복사).
- **AI 감사 로그 미경유**: `AiItineraryToolService`는 audit 없이 직접 호출 가능 (AiToolSupport를 안 거침). OK.
- **동시성**: 종료 판정이 lazy(GET 진입)라 두 요청이 동시에 종료를 밟을 수 있음 →
  세션 UPDATE ... WHERE status='OPEN' 의 affected rows로 승자 1명만 초안 생성 진행.
- 트리거 사용자: 종료를 밟은 사용자 (전원완료=마지막 completion 사용자, 방장종료=방장, 만료=진입자).
  `FindItineraryQuery(tripId, userId)`가 멤버 검증을 하므로 반드시 ACTIVE 멤버여야 함 — 3경로 모두 멤버임.
- winners 정렬: LIKE 수 내림차순 → sort_order.

## 정렬/조회 mapper

`vote` 도메인 XML mapper에 `findWinners`:

```sql
SELECT c.provider, c.external_place_id, c.place_name, c.address, c.lat, c.lng, c.thumbnail_url,
       count(*) FILTER (WHERE b.reaction='LIKE') AS like_count,
       count(*) FILTER (WHERE b.reaction='NOPE') AS nope_count
FROM vote.place_vote_candidates c
LEFT JOIN vote.place_vote_ballots b ON b.candidate_id = c.id
WHERE c.session_id = #{sessionId}
GROUP BY c.id
HAVING count(*) FILTER (WHERE b.reaction='LIKE') > count(*) FILTER (WHERE b.reaction='NOPE')  -- Q8 권장안
ORDER BY like_count DESC, c.sort_order ASC
```

## 프론트

- B4 페이지의 `session.closed` 수신 → "일정 초안이 만들어졌어요" 모달 →
  `router.push({ name: 'Route', params: { tripId } })`.
- RoutePage는 이미 UNSCHEDULED 그룹을 렌더링함 (`groupType === 'UNSCHEDULED'` — `types/itinerary.ts` L44).
  **추가 확인**: RoutePage 진입 시 stage DRAFTED→PLANNING 전이 (B0-2 결정 — RoutePage 마운트 훅에서 PATCH 1회).
- 초안 진입 직후 안내 배너: "일차 미정에 담긴 장소들을 원하는 날짜로 옮겨보세요" (GF-055) —
  DRAFTED stage + UNSCHEDULED에 item 있을 때만 노출.

## 테스트 / 완료 기준

- GenerateTripDraftHandler 단위 테스트: winners 3개 → addPlace 3회 버전 체이닝 / 중복 skip / 빈 winners.
- 통합 수동: 1인 투표 종료 → RoutePage에 "일차 미정" 그룹 + 득표 장소.
- 동시 종료 경합: UPDATE WHERE status='OPEN' 반환값 테스트.
