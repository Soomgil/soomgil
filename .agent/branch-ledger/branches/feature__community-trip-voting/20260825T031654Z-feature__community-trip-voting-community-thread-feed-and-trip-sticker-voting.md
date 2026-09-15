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

Docker를 올린 뒤 실제 PostgreSQL 16과 실행 중인 백엔드로 검증을 마쳤습니다.

- migration: V45, V46이 실제 DB에 정상 적용됨 (`Successfully applied 2 migrations, now at version v46`).
  V44는 그 전에 이미 적용되어 있었음.
- backend 전체 테스트: 849개 중 7개 실패. 7개 모두 clean `develop`에서 동일하게 실패하는 기존 환경 문제이고
  (KTO API key 미설정 5개, minio compose 1개, Jeju seed 1개) 그 외 실패는 0.
  clean develop worktree에서 같은 5개 클래스를 돌려 동일한 7개 실패를 확인했습니다.
- frontend: `npm run test:run` 365개 전부 통과, `npm run build` 성공.
- harness: `harness:index`, `harness:check` 전 항목 통과.
- HTTP E2E: 커뮤니티 쓰레드 + 투표 + 일정 반영 **81개 검증 전부 통과**.
  - 쓰레드: 공개 조회, 401/400/422 검증, 좋아요 멱등, 1단계 답글, 2단계 거절, 작성자 권한,
    THREAD/THREAD_REPLY 신고, tombstone, 삭제 후 피드 제외
  - 투표: 방장 권한, 참여자 확정, 후보 snapshot, 진행 중 집계 미노출, 몰아붙이기, 지급량 초과 거절,
    이동/회수, 제출, 이중 제출 409, 제출 후 수정 409, 미확인 조기 종료 422, 조기 종료, 재종료 멱등
  - 일정: 선정 관광지가 일차 미정에 추가되고 재종료해도 중복되지 않음
- 취향 격리 확인: 투표한 사용자들의 `user_place_reactions`, `user_swipe_events`,
  `user_saved_places` row가 **0건**. `user_place_vote_evidences`에만 TRIP_VOTE 근거가 기록되고
  projection의 `vote_evidence`에 정상 가산됨.

### E2E로 잡은 버그

`OpenVoteSessionHandler`가 후보 생성 query에 `destinationKeyword`를 넘기지 않아 대체 검색어 fallback이
죽은 코드였습니다. 지역 코드가 KTO area code로 매핑되지 않으면 후보가 0개가 되어 투표를 시작할 수 없었습니다.
`FindTripDetailHandler`로 대표 목적지를 읽어 전달하도록 고치고 테스트 2개를 추가했습니다. (commit a7d134c)

## develop 통합 시 반영할 내용

- KTO live API의 지역 매핑이 현재 제주(area code 39)만 지원합니다.
  `KtoTourismPlaceClient.liveAreaCode`가 `legalRegionCode.startsWith("39")`만 매핑하는데
  제주 법정동코드는 `50`으로 시작하므로, 실제로는 대표 목적지 키워드 fallback으로 후보가 만들어집니다.
  다른 지역을 지원하려면 이 매핑을 확장해야 합니다.
- 마이페이지가 아직 `community.posts` API를 사용합니다. 완전 제거하려면 마이페이지 전환이 선행돼야 합니다.
- 투표 상태 실시간 반영은 현재 5초 polling입니다. STOMP topic 화이트리스트
  (`collaboration/infrastructure/websocket/TripSubscriptionInterceptor`)에 `voting`을 추가하는 것은 후속 과제입니다.
- `voting` 모듈 담당자를 backend TDD checklist에 정식으로 배정해야 합니다.

## 2026-08-28 UI 재설계 (frontend 27efccc)

design.md 실토큰(`--violet`/`--blue` 그라디언트, `page-hero`, `--soft-shadow`) 기준으로
커뮤니티 피드·쓰레드 상세·투표 화면을 재구성하고, 미구현 화면 4종을 채웠습니다.

- 방장 투표 시작 패널 `OwnerVoteSetupPanel` (스티커/선정 개수 스텝퍼, 후보 부족·중복 시작 오류 안내)
- 쓰레드 이미지 첨부 (`ThreadComposer`: COMMUNITY_POST 서명 업로드, 미리보기/제거, 업로드 중 제출 잠금)
- 쓰레드/답글 인라인 수정 (PATCH 연동)
- 신고 사유 선택 모달 `ThreadReportModal` (서버 사유 목록 + fallback)
- 투표 결과 패널 `VoteResultPanel` (일차 미정 추가/중복 스킵 배지), 완료 세션 결과·재시작 흐름
- 가드 변경: `/trips/:id/vote` 직접 진입은 페이지 자체 상태(setup/idle/observer/completed)로 처리,
  `Route` 진입 시에만 nextScreen 게이트 유지 — RoutePage.vue 등 병렬 작업 파일은 미접촉
- 새로고침 시 `auth.fetchUser()` 복원 패턴을 피드/상세/투표 페이지에 적용

검증: frontend 테스트 377개 전부 통과, build 성공, harness index/check 통과,
로컬 브라우저에서 방장 시작→스티커 배분→제출→대기, 피드 인라인 수정, 신고 모달 실동작 확인.

## 2026-08-28 2차 UI 재작업 (frontend c18097e, 50babc5)

사용자 피드백("스레드가 저렇게 생기면 안 된다, 투표는 큰 사진 스와이프 + 장바구니로")을 반영한 전면 재구성.

- 커뮤니티: 카드 나열 → X/Threads식 단일 서피스 피드. 행 사이 헤어라인, 케밥(더보기) 메뉴로
  수정/삭제/신고, 이미지 1~4장 그리드(1장 16:10 / 3장 1+2 / 4장 2×2), 짧은 상대시간.
  상세는 본문 강조(emphasized) + 하위 답글 연결선(Threads식).
- 투표: 목록+스텝퍼 → `VoteCandidateDeck`(큰 사진 슬라이드, 드래그 스와이프/화살표/키보드/썸네일 점프,
  슬라이드별 스티커 배지) + `VoteStickerCart`(장바구니: 붙인 후보 목록·미니 스텝퍼·남은 스티커 도트·
  제출·방장 마감). 데스크톱 2컬럼(카트 sticky), 1024px 미만 1컬럼.
- 지도 결과: `VoteResultMapOverlay`를 App.vue에 전역 장착. 투표 종료 시 `?voteCompleted=1`로
  Route 진입하면 지도 위에 "투표가 끝났어요" 요약(선정지+스티커 수)을 띄우고 닫으면 쿼리 제거.
  멤버 제출로 전원 완료 → 자동으로 지도+오버레이로 이동하는 흐름을 실브라우저로 확인.
- **버그 픽스**: 5초 polling(load→applyState)이 제출 전 로컬 스티커 초안(draftPlacements)을
  서버 상태로 덮어쓰던 문제를 `draftDirty` 플래그로 차단. 회귀 테스트 추가.
  (헤드리스 캡쳐 중 실제로 재현되어 발견 — 2+1+2 배분 중 폴링 경계에서 앞선 3개가 증발)
- 데모 데이터: KTO 공개 썸네일 3장을 media 업로드 → 사진 쓰레드 생성(멤버), 방장 좋아요+답글.

검증: frontend 테스트 380개 전부 통과(덱/카트 2개 + polling 회귀 1개 추가), build 성공,
harness index/check 통과, 헤드리스 크롬으로 11개 화면 실동작 캡쳐(폴링 1사이클 경과 후에도
장바구니 3건 유지 확인 로그 포함).

## 2026-08-31 미디어 정리 버그 픽스 (backend fbf67f8)

데모에서 쓰레드 첨부 사진이 약 1시간 뒤 사라지는 현상 발견. 원인은 media 모듈의
고아 업로드 정리 쿼리 2곳(`claimUnlinkedForPurge`, `findExpiredCompletedUnlinked`)의
보호 목록(record.trip_record_media / community.post_media / posts.cover / user_profiles)에
신규 `community.thread_media`가 빠져 있어, 업로드 인텐트가 만료되면 쓰레드에 연결된
이미지도 PURGED 처리된 것. 두 쿼리에 `NOT EXISTS(community.thread_media)` 보호를 추가했다.
TDD: 재현 통합 테스트 `keepsThreadAttachedMediaOutOfOrphanCleanup`를 먼저 작성해 실패를
확인한 뒤 수정, media·community 스위트 통과.
