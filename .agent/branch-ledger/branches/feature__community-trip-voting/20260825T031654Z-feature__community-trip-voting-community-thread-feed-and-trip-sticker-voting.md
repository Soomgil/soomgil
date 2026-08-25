---
id: 20260825T031654Z-feature__community-trip-voting-community-thread-feed-and-trip-sticker-voting
branch: feature/community-trip-voting
branchKey: feature__community-trip-voting
createdAt: 2026-08-25T03:16:54.957Z
baseRef: develop
scope: backend
status: draft
---

# community thread feed and trip sticker voting

## 배경

- 커뮤니티를 여행 스냅샷 게시글에서 Threads/X형 공개 피드로 교체하고, 여행 방 스티커 투표를 새로 구현했습니다.
- 작업 시작 시점에 `develop`에는 커뮤니티 쓰레드와 여행 방 투표가 **계약 문서로만 존재**하고 backend/frontend 구현은 전혀 없었습니다.
- 확정 요구사항이 기존 계약과 여러 지점에서 충돌해, 지시에 따라 요구사항을 우선하고 계약 문서를 함께 수정했습니다.

## 변경 요약

### backend

- `V44` community thread 계열 테이블. 기존 `community.posts` 계열은 DROP하지 않고 `COMMENT`로 deprecated 표시만 추가.
- `V45` `voting` 스키마. 세션, 후보 snapshot, 참여자, 스티커, 일정 반영 링크.
- `V46` `preference.user_place_vote_evidences`와 `user_preference_tag_weights`의 감사 컬럼 2개.
- 신고/모더레이션 `target_type`에 `THREAD`, `THREAD_REPLY` 추가. 컬럼이 `varchar(20)`이고 CHECK 제약이 없어 migration 불필요.
- 공개 interface 신설: `AddPlacesToUnscheduledHandler`(itinerary), `ApplyTripVotePreferenceCommandHandler`,
  `ListTripVoteCandidatesQueryHandler`(preference), `PlaceRegionCandidateQueryHandler`(place),
  `ListTripRegionCodesHandler`(trip).

### frontend

- `/community`를 `CommunityFeedPage`로 교체하고 `/community/threads/:threadId` 추가.
- `/trips/:tripId/vote` 추가. 라우터 가드가 서버 `nextScreen`으로 지도/투표/대기를 분기.
- 여행 스냅샷 게시글 화면과 전용 컴포넌트 제거. `StoryDetailOverlay`는 마이페이지/홈/검색에서 계속 사용하므로 유지.

## 에이전트 주의사항

- **투표 모듈은 다른 모듈의 DB나 mapper를 직접 접근하지 않습니다.** 반드시 위 공개 interface만 호출하세요.
- **종료와 결과 반영은 조건부 UPDATE의 영향 row 수로만 판정합니다.**
  `completeIfOpen`, `markResultAppliedIfAbsent`, `markParticipantSubmittedIfNotYet`의 반환값을 무시하면
  동시 종료와 중복 반영을 막을 수 없습니다.
- **`TRIP_VOTE` 취향 반영은 스와이프 테이블을 건드리지 않습니다.**
  `user_place_reactions`, `user_swipe_events`, `user_saved_places`를 수정하면 반응 되돌리기 로직과
  저장 장소 정책이 깨집니다.
- 투표 후보 API에는 다른 참여자의 취향 점수, 세부 태그, matched member를 절대 넣지 마세요.
  `TripVoteCandidateView`의 필드 구성을 검증하는 테스트가 있습니다.
- 진행 중 세션에서는 후보별 스티커 중간 집계도 노출하지 않습니다.
- `TripVoteEvidencePolicy`를 바꾸면 이미 반영된 근거는 자동 재계산되지 않습니다.
  `calculationVersion`을 함께 올리세요.

## 폐기한 기존 계약과 사유

확정 요구사항과 충돌해 폐기했습니다. 구현이 없던 계약이라 코드 영향은 없습니다.

| 폐기 대상 | 사유 |
| :--- | :--- |
| `trip.trips.vote_*` 컬럼 | 세션 개념이 없어 세션별 참여 상태와 후보 snapshot을 표현할 수 없음 |
| `trip.trip_vote_candidates` | `added_by_user_id`가 사람이 후보를 추가하는 구조. 요구사항은 추천 자동 구성 |
| `trip.trip_vote_stickers` | 활성 row 1개 = 스티커 1개. 취향 반영에 개수를 그대로 보존해야 함 |
| `trip_members.vote_state` (JOINED/VOTED) | 요구사항은 세션별 NOT_STARTED/IN_PROGRESS/SUBMITTED |
| `/trips/{tripId}/vote*` OpenAPI 경로 | 위 구조에 종속. `/vote-sessions*`로 교체 |
| `product_experience_policy.md`의 투표 절 | 후보 직접 추가, 제출 후 수정 허용, 마감 시각 종료가 요구사항과 충돌 |

## 검증 결과

- backend 단위/슬라이스 테스트: 847개 중 47개 실패, **실패는 전부 Docker 필요 통합 테스트**이고 Docker 외 실패 0.
- frontend: `npm run test:run` 365개 전부 통과, `npm run build` 성공.
- Testcontainers 통합 테스트와 HTTP E2E는 작업 중 Docker Desktop이 내려가 **실행하지 못했습니다.**

## develop 통합 시 반영할 내용

- Docker를 올린 뒤 `./gradlew test` 전체와 HTTP E2E를 반드시 재검증해야 합니다.
  특히 V44~V46 migration 적용과 신규 mapper SQL은 아직 실제 DB에서 실행된 적이 없습니다.
- 마이페이지가 아직 `community.posts` API를 사용합니다. 완전 제거하려면 마이페이지 전환이 선행돼야 합니다.
- 투표 상태 실시간 반영은 현재 5초 polling입니다. STOMP topic 화이트리스트
  (`collaboration/infrastructure/websocket/TripSubscriptionInterceptor`)에 `voting`을 추가하는 것은 후속 과제입니다.
- `voting` 모듈 담당자를 backend TDD checklist에 정식으로 배정해야 합니다.
