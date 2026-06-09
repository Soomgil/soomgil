# 백엔드 계약 결정 기록

이 문서는 숨길 백엔드 DBML/OpenAPI를 만들기 전에 확정한 설계 결정을 저장합니다.
DBML과 OpenAPI는 이 문서를 기준으로 생성합니다.

## 산출물 위치

- 계약 원본: `.agent/contracts/`
- 예정 DBML: `.agent/contracts/schema.dbml`
- 예정 OpenAPI: `.agent/contracts/openapi.yaml`
- 루트 `README.md`에서 바로 접근할 수 있게 링크를 유지합니다.

## 전체 범위

- 범위: Production V1 풀스코프.
- 백엔드 기준 스택: Spring Boot, PostgreSQL, Redis.
- API 성공 응답: HTTP-native JSON.
- API 에러 응답: RFC7807 Problem Details.
- 주요 개인정보/외부 노출 리소스 ID: UUID.
- 내부 로그/이벤트성 데이터 ID: 자동 증가 ID 허용.
- 삭제/보관: 사용자 콘텐츠는 soft delete, 로그성 데이터는 retention 후 purge.

## 인증과 계정

- 인증 방식: 이메일/비밀번호 + 소셜 로그인.
- 소셜 provider는 enum이 아니라 `auth_providers` 테이블로 관리합니다.
- V1 활성 provider: Kakao, Google.
- Naver, Apple 등은 테이블 데이터 추가로 확장 가능하게 둡니다.

## 소셜 그래프와 팔로우 신호

- 팔로우 기능을 지원합니다.
- 팔로우 관계는 `social.user_follows`에 저장합니다.
- 외부 소셜 그래프 import 테이블은 두지 않고 앱 내부 팔로우 관계만 사용합니다.
- `social.user_follows`는 directed follow edge입니다.
- 스와이프 카드에는 현재 사용자가 팔로우하는 사용자 중 해당 장소를 `LIKE` 또는 `SUPER_LIKE`한 사용자를 아바타 수준으로 표시할 수 있어야 합니다.
- 팔로우 기반 스와이프 노출은 `preference.user_place_reactions`와 `social.user_follows`를 조합해 계산합니다.
- 팔로우 사용자의 raw 선호도 점수, 세부 선호 태그 가중치, 스와이프 로그는 노출하지 않습니다.

## 여행방과 멤버

- 여행방 역할: `OWNER`, `MEMBER`.
- OWNER와 MEMBER 모두 일정 편집 가능.
- 여행방 설정, 초대, 삭제는 OWNER만 가능.
- 초대 방식: 초대 링크 + 초대 코드.
- 여행방은 다중 지역을 허용합니다.
- 지역은 법정동코드 기반 `geo.legal_regions`와 `trip.trip_regions`로 관리합니다.
- `geo.legal_regions.code`는 법정동코드 10자리를 PK로 사용합니다.
- 법정동 level은 `SIDO`, `SIGUNGU`, `EUPMYEONDONG`으로 구분합니다.
- `trip.trip_regions`는 UUID region id가 아니라 `legal_region_code`로 `geo.legal_regions.code`를 참조합니다.
- 법정동 원천 동기화 이력은 `geo.legal_region_sync_logs`에 저장합니다.
- 대표 목적지는 지역과 별도로 `trips.display_destination` 문자열로 저장합니다.

## 장소와 관광공사 데이터

- 장소 주 데이터는 관광공사 데이터랩 API를 사용합니다.
- 장소 마스터 상세 데이터는 저장하지 않습니다.
- 서비스 내부 참조는 `provider + external_place_id`를 기준으로 합니다.
- 관광공사 데이터에 없는 장소는 별도 `custom_places` 테이블 없이 일정 아이템 안에 임시 정보로만 저장합니다.
- 커뮤니티/공유 루트 snapshot에는 게시 시점 표시용 최소 장소 정보를 저장합니다.
- snapshot 표시 정보 예: `place_name`, `address`, `lat`, `lng`, `thumbnail_url`, `provider`, `external_place_id`, `source_status`.
- 원본 관광공사 데이터가 삭제/조회 불가이면 `source_status = DELETED`로 표시하고 UI에는 삭제된 데이터로 보여줍니다.

## 스와이프와 저장

- 스와이프는 특정 여행방/목적지에 종속된 기능이 아니라, 사용자가 평소에 랜덤에 가까운 장소를 넘기며 개인 선호도를 쌓는 전역 feed를 기본으로 합니다.
- 전역 스와이프 feed는 랜덤성을 유지하면서도 지역, 카테고리, 인기/비인기, 실내/야외 다양성을 보장해야 합니다.
- 이미 반응한 장소도 일정 기간이 지나거나 관광공사 원본/AI 태그가 변경되면 다시 노출할 수 있습니다.
- 재노출 후 다시 반응하면 `user_place_reactions` 최종 상태는 갱신하고 `user_swipe_events`는 누적합니다.
- 여행방 생성 후에는 멤버들의 누적 스와이프 반응을 여행 계획과 장소 후보 정렬에 활용합니다.
- 여행방 추천 장소 리스트는 경로 설계 화면의 좌측 일정/경로 추가 패널에 표시합니다.
- 추천 리스트의 주요 목적은 장소를 바로 일정에 추가하는 것입니다.
- 장소별로 어떤 멤버 선호도에 맞는지 프로필 아바타 목록을 카드 우측 하단에 가볍게 표시하는 UI를 전제로 합니다.
- 여행방 안에서 다른 멤버의 세부 선호 태그와 선호도 점수는 공개하지 않습니다.
- 추천 장소 API는 matched member 아바타 수준의 정보만 반환하고, 다른 멤버의 raw/normalized 선호도 점수나 세부 태그 가중치는 반환하지 않습니다.
- 기본 추천 후보 풀은 현재 보고 있는 지도 viewport 안의 관광공사 장소입니다.
- 기본 추천은 현재 지도 viewport 안의 장소만 후보로 사용합니다.
- 기본 추천 정렬은 참여자들의 누적 스와이프 태그 매칭 점수를 중심으로 합니다.
- 거리는 보조 점수 또는 동점 처리 기준으로 사용합니다.
- 추천 패널에는 SUPER_LIKE 탭이 있으며, 이 탭은 여행방 참여자들이 평소 SUPER_LIKE한 장소를 SUPER_LIKE 강도/수 기준으로 우선 정렬합니다.
- 태그 매칭은 서비스 내부 태그 사전을 기준으로 합니다.
- 관광공사 장소 데이터는 AI 태그 추출/매핑 과정을 거쳐 내부 선호 태그로 변환합니다.
- AI 태그 추출은 사용자-facing AI 경로 초안 기능이 아니라 추천/매칭 품질을 위한 backend enrichment 기능입니다.
- 추천 장소 API는 `matched_members` 또는 이에 준하는 필드로 매칭 멤버의 id, name, avatar/profile image를 반환해야 합니다.
- 추천 장소 API는 viewport bounds, 선택적 center 또는 route anchor, tab mode, pagination을 받을 수 있어야 합니다.
- 스와이프 반응은 최종 상태 테이블과 이벤트 로그 테이블을 분리합니다.
- 최종 상태는 조회/집계용입니다.
- 이벤트 로그는 분석, AI 채팅 컨텍스트, 되돌리기, 감사에 사용합니다.
- 사용자 선호도 가중치는 이벤트 로그를 매번 재계산하지 않고 `user_preference_tag_weights` materialized projection으로 유지합니다.
- `user_preference_tag_weights`는 raw 누적 점수와 capped normalized score를 함께 저장합니다.
- 추천 리스트 계산은 raw score가 아니라 normalized score를 사용합니다.
- normalized score는 `-1..1` 또는 이에 준하는 제한 범위로 계산해 특정 태그/활동량 많은 사용자의 과도한 지배를 막습니다.
- normalized score 공식은 `tanh(raw_score / scale)`을 기본으로 합니다.
- `scale`은 운영 튜닝 가능한 설정값으로 둡니다.
- 스와이프 저장 후 비동기 worker가 projection을 갱신합니다.
- V1에서는 시간 감쇠 기반 선호도 재계산과 daily summary를 사용하지 않습니다.
- projection 갱신은 스와이프 이벤트가 발생할 때 해당 장소의 태그만 반영하는 incremental update를 기본으로 합니다.
- 원본 이벤트 로그는 projection 복구, 가중치 공식 변경 시 재처리, 감사 용도로 남기며 일반 추천 요청에서 매번 재계산하지 않습니다.
- 별도 선호도 snapshot 테이블은 두지 않고, 현재 선호도는 `user_preference_tag_weights` projection과 원본 이벤트 로그로 관리합니다.
- V1 선호도 추론 입력은 스와이프 반응 `LIKE`, `NOPE`, `SUPER_LIKE`로 한정합니다.
- `SUPER_LIKE`는 다른 사용자에게 추천한다는 의미가 아니라, 본인 선호도를 강하게 어필하는 반응입니다.
- `SUPER_LIKE`는 `LIKE`보다 높은 선호도 가중치이며, 언젠가 꼭 가고 싶은 장소에 가까운 의미입니다.
- 장소 상세 조회, 일정 추가/삭제, 저장, 커뮤니티 반응은 선호도 점수에 반영하지 않습니다.
- 스와이프 반응은 전역 개인 반응을 기본으로 저장하고, 필요한 경우 여행방 컨텍스트 반응을 별도 확장할 수 있게 설계합니다.
- 커뮤니티 저장/북마크는 MVP에서 별도 반응으로 두지 않고, 커뮤니티 게시글 좋아요와 리트립을 지원합니다.
- 장소 저장은 사용자가 해당 장소를 `SUPER_LIKE`한 경우에만 허용합니다.

## 일정과 협업

- 일정은 `itinerary_days`와 `itinerary_items`로 관리합니다.
- `itinerary_days`는 `day_number`와 선택적 `date`를 저장합니다.
- 일정에는 실제 day 외에 "일차 미정" 그룹을 둡니다.
- "일차 미정"은 trip당 최대 1개이며, 내부적으로 `UNSCHEDULED` 성격의 itinerary day/group으로 구분합니다.
- "일차 미정"은 꼭 가기로 확정했지만 day number가 아직 정해지지 않은 장소를 담습니다.
- "일차 미정"은 `date`가 없고 실제 여행 일차의 `day_number` 순서에는 포함하지 않습니다.
- "일차 미정"에 들어간 아이템은 확정 방문 itinerary item으로 취급하며, 나중에 실제 day로 이동할 수 있어야 합니다.
- AI "일차 미정" 배치 tool은 미정 장소를 실제 day로 이동할 수 있습니다.
- AI "일차 미정" 배치 tool은 기존 실제 day 안의 `sort_order`를 동선에 맞게 조정할 수 있습니다.
- AI "일차 미정" 배치 tool은 명시적 요청 없이 기존 실제 day 아이템의 day를 바꾸지 않습니다.
- 일정 아이템은 `itinerary_day_id`, `sort_order` 기준으로 정렬합니다.
- 경로는 일차(day)에 직접 종속하지 않고 `origin_itinerary_item_id -> destination_itinerary_item_id`로 이어지는 장소 간 segment로 관리합니다.
- 특정 일차의 경로 목록은 해당 일차의 일정 아이템 순서를 기준으로 인접한 장소 간 route segment를 조회해 구성합니다.
- 일정 아이템 이동, 삭제, 순서 변경으로 장소 간 연결이 바뀌면 영향을 받는 route segment는 삭제하거나 stale 처리 후 다시 Mapbox 보정을 요청합니다.
- 일정 아이템에는 `start_at`, `end_at` 같은 시간 필드를 두지 않습니다.
- 일정 협업은 REST 저장 + STOMP over WebSocket broadcast + version 충돌 처리로 설계합니다.
- REST 요청은 `baseVersion`을 포함합니다.
- 서버는 저장 성공 후 여행방 최신 `itineraryVersion`을 증가시키고 STOMP topic으로 broadcast합니다.
- 버전 불일치 시 `409 Conflict` Problem Details를 반환합니다.

## 협업 변경 이력과 Undo/Redo

- 사용자 직접 UI 조작과 AI tool write는 같은 협업 command pipeline을 사용합니다.
- undo/redo 대상 협업 command 예시: 일정 아이템 재정렬/day 이동/추가, snapped route 생성/수정/삭제, 저장된 지도 도형/경로 수정, 메모 생성/수정, 체크리스트 생성/수정/완료 처리.
- undo/redo 가능 상태는 영구 히스토리가 아니라 사용자별 활성 WebSocket 세션별 command stack으로 관리합니다.
- 사용자는 본인이 현재 활성 WebSocket 세션에서 실행한 command만 undo/redo할 수 있습니다.
- AI tool write는 해당 tool을 요청한 사용자와 활성 WebSocket 세션의 command stack에만 쌓입니다.
- 사용자별 활성 WebSocket 세션의 undo stack과 redo stack은 각각 최대 5개로 제한합니다.
- 새로고침, 재접속, 다른 기기 접속, WebSocket 세션 종료 이후에는 이전 세션의 undo/redo를 허용하지 않습니다.
- 저장 전 자유 드로잉 preview는 프론트엔드 로컬 undo/redo로 처리하고, 백엔드 undo/redo는 저장된 snapped route나 저장된 도형/경로 command에만 적용합니다.
- undo는 DB 트랜잭션 롤백이 아니라 보상 명령으로 구현합니다.
- redo는 직전에 undo된 command의 보상 명령을 다시 적용하는 별도 command로 구현합니다.
- undo/redo 가능한 command는 실행 시 이전 상태 또는 inverse/redo command를 저장해야 합니다. 예: 재정렬 전후 sort order, memo 수정 전후 본문, checklist 완료 전후 상태, route geometry 수정 전후 geometry, 새로 추가한 일정 아이템 ID.
- undo/redo 실행도 권한, 멤버십, 현재 version, 대상 리소스 변경 여부를 검사하고 성공 시 version 증가, 이벤트 저장, STOMP broadcast를 수행합니다.
- undo 이후 새 write command가 실행되면 해당 세션의 redo stack은 비웁니다.
- undo/redo 대상이 이후 다른 사용자 또는 같은 사용자의 다른 세션에 의해 변경되어 충돌이 있으면 자동 undo/redo를 거절하고 409 Problem Details로 응답합니다.
- MVP에서는 일정, 메모, 체크리스트 변경을 보여주는 사용자용 활동 기록 UI를 제공하지 않습니다.
- 협업 변경 이벤트와 감사 로그는 저장하되, 사용자용 activity feed API/UI는 V1 이후로 미룹니다.

## 지도 드로잉과 경로 보정

- 지도 위 자유 드로잉과 경로 보정을 핵심 기능으로 포함합니다.
- 경로 보정용 임시 stroke는 실시간 preview와 Mapbox 요청 처리에 사용하지만 영구 저장하지 않습니다.
- 사용자가 명시적으로 저장한 지도 그림/도형은 `itinerary.map_drawings`에 저장합니다.
- 저장된 지도 그림은 trip에 묶이며, 선택적으로 itinerary day에 연결할 수 있습니다.
- 저장된 지도 그림은 생성자, 수정자, 삭제자를 기록하고 협업 undo/redo command 대상입니다.
- 선을 실제 도로/보행로/자전거 경로에 맞추는 provider는 Mapbox Map Matching API입니다.
- V1에서 사용하는 Mapbox profile은 `mapbox/driving`, `mapbox/walking`입니다.
- 자체 도로 네트워크 인식 알고리즘은 만들지 않고, Mapbox Map Matching API가 제공하는 기능 범위에서 처리합니다.
- 최종 보정 결과만 snapped route로 영구 저장합니다.
- 최종 snapped route는 day 단위가 아니라 출발 일정 아이템과 도착 일정 아이템 사이의 route segment로 저장합니다.
- Mapbox route snapping 실패 시 원본 stroke나 부분 경로를 저장하지 않습니다.
- 실패 시 사용자에게 다시 그리도록 안내하는 Problem Details 또는 실패 응답을 반환합니다.
- route matching 요청에는 Mapbox profile, 입력 좌표, radiuses, tidy 사용 여부를 포함할 수 있어야 합니다.
- route matching 요청은 실패하더라도 어떤 출발/도착 일정 아이템 사이의 보정 시도였는지 저장해야 합니다.
- route matching 결과에는 provider, provider request id 또는 hash, confidence, distance, duration, geometry, tracepoints, matchings metadata를 저장할 수 있어야 합니다.
- Mapbox 일반 좌표 요청은 2~100개 좌표 제한이 있으므로 stroke simplification/downsampling 정책이 필요합니다.
- Mapbox 결과는 Mapbox 지도 위에 표시하는 것을 전제로 합니다.

## 커뮤니티

- MVP에는 완성된 여행방을 공개 게시글로 공유하는 기능을 포함합니다.
- 여행방 OWNER와 MEMBER 모두 커뮤니티 게시글을 발행할 수 있습니다.
- 커뮤니티 게시글은 `published_by_user_id`, `published_at`을 저장합니다.
- 커뮤니티 게시글에는 사진/미디어를 첨부할 수 있습니다.
- 커뮤니티 게시글 미디어는 `community.post_media`로 `media.media_files`와 연결합니다.
- 커뮤니티 게시글 대표 이미지는 `posts.cover_media_file_id` 또는 첫 번째 `post_media.sort_order`로 결정합니다.
- 커뮤니티 게시글에는 해시태그를 붙일 수 있습니다.
- 해시태그는 `community.hashtags`와 `community.post_hashtags`로 관리합니다.
- 커뮤니티 게시글은 원본 `trip_id` 연결과 게시 시점 snapshot을 모두 저장합니다.
- 원본 여행방이 변경되어도 공개 게시물 snapshot은 유지합니다.
- snapshot에는 공개 표시용 일정, 경로, 장소 표시 정보, 작성자 표시 정보를 저장합니다.
- snapshot 경로도 day 단위가 아니라 snapshot item 간 route segment로 저장합니다.
- MVP 공개 범위: `PUBLIC`, `UNLISTED`.
- `PRIVATE` 공개 범위는 MVP에서 제외합니다.
- 댓글은 1단계 대댓글까지만 허용합니다.
- 커뮤니티 게시글 댓글/대댓글은 작성자와 게시글 발행자가 soft delete할 수 있습니다.
- soft deleted 댓글/대댓글은 content를 노출하지 않고 tombstone 상태로 응답합니다.
- MVP 신고 대상은 커뮤니티 게시글, 댓글, 대댓글입니다.
- 신고는 구조화된 신고 사유와 optional 상세 설명을 저장합니다.
- 신고 사유는 확장 가능하도록 `report_reasons` 성격의 테이블 또는 동등한 코드 관리 구조로 둡니다.
- 신고 사유 예: `SPAM`, `INAPPROPRIATE`, `HARASSMENT_OR_HATE`, `RIGHTS_VIOLATION`, `OTHER`.
- 동일 사용자의 동일 대상 반복 신고는 unique 제약 또는 동등한 애플리케이션 제약으로 중복 생성하지 않습니다.
- 신고, 숨김, 삭제 모더레이션 상태를 포함합니다.
- MVP 신고 처리는 관리자/모더레이터가 신고 큐를 검토해 숨김, 복구, 삭제 처리합니다.
- MVP에서는 신고 수 기준 자동 숨김이나 신고 즉시 숨김을 적용하지 않습니다.
- 모더레이션 처리는 `moderated_by_user_id`, `moderated_at`, `moderation_reason`, `moderation_status` 또는 동등한 필드를 기록해야 합니다.
- MVP 커뮤니티 게시글 반응은 좋아요와 리트립을 지원합니다.
- 리트립은 커뮤니티 게시글 snapshot을 내 여행으로 가져오는 액션입니다.
- 리트립 실행 시 커뮤니티 게시글 snapshot 전체를 기반으로 새 `trip`을 생성합니다.
- 리트립은 기존 여행방에 snapshot을 병합하지 않습니다.
- 리트립으로 생성된 여행방은 원본 커뮤니티 게시글 ID와 원본 snapshot reference를 추적할 수 있어야 합니다.
- 리트립으로 생성된 새 여행방은 리트립한 사용자 혼자 OWNER로 시작합니다.
- 리트립 이후 동행자 추가는 일반 여행방 초대 흐름을 사용합니다.
- 커뮤니티 게시글 좋아요는 로그인 사용자 기준 토글형 1회 반응입니다.
- 한 사용자는 한 커뮤니티 게시글에 좋아요를 1개만 남길 수 있고, 다시 누르면 취소됩니다.
- 커뮤니티 게시글 좋아요는 `post_id + user_id` unique 제약 또는 동등한 애플리케이션 제약을 가져야 합니다.
- 공개 게시글 좋아요와 리트립은 선호도 점수에 반영하지 않습니다.

## 미디어

- 파일 저장은 S3 호환 Object Storage를 사용합니다.
- DB에는 `media_files` metadata를 저장합니다.
- metadata 예: owner, storage key, public URL 또는 signed URL 기준, mime type, size, width, height, linked resource.
- 프로필 이미지, 여행 기록 사진, 커뮤니티 게시글 사진은 모두 `media.media_files`를 실제 파일 메타데이터의 기준으로 사용합니다.
- 각 기능의 소유권/권한/정렬은 `record.trip_record_media`, `community.post_media` 같은 도메인별 연결 테이블에서 관리합니다.
- soft delete 후 retention 기간이 지나면 object도 purge합니다.

## 여행 기록

- `/record` 화면의 여행 기록 기능은 trip에 묶어 관리합니다.
- 여행 기록 엔트리는 `record.trip_record_entries`에 저장합니다.
- 기록 엔트리는 `trip_id`, `uploaded_by_user_id`, 선택적 `itinerary_day_id`, 선택적 `itinerary_item_id`를 가집니다.
- 기록 사진/영상은 `record.trip_record_media`로 `media.media_files`와 연결합니다.
- 기록에는 누가 올렸는지, 언제 찍었는지, 위치/장소 메모, caption을 저장할 수 있어야 합니다.
- MVP 기록 공개 범위는 여행방 멤버 기준이며, 공개 커뮤니티 노출은 `community.posts` 발행 흐름을 사용합니다.

## AI

- V1 AI 기능은 AI 가이드 채팅만 포함합니다.
- AI 경로 초안/채택 기능은 제외합니다.
- AI agent session은 여행방 단위의 공유 세션입니다.
- V1에서는 여행방당 공유 AI agent session을 1개만 둡니다.
- `ai_chat_sessions`는 V1에서 trip당 active/shared session이 하나만 존재하도록 `trip_id` 기준 unique 제약 또는 동등한 애플리케이션 제약을 가져야 합니다.
- 주제별 AI session, 사용자별 private AI session은 V1 범위에서 제외합니다.
- 여행방 참여자는 같은 `ai_chat_sessions`, `ai_chat_messages`, AI tool 실행 결과를 볼 수 있습니다.
- `ai_chat_messages`는 요청자 user, message role, content, tool call/result reference를 구분해 저장해야 합니다.
- AI 대화 원문은 전체 저장합니다.
- 모델 context assembly는 최근 메시지, 오래된 대화 요약본, 현재 여행방 상태, 허용된 tool context를 조합합니다.
- 오래된 대화 요약본을 저장하기 위한 session summary 또는 equivalent 구조가 필요합니다.
- MVP에서 AI tool 실행 결과는 `ai_chat_messages`에 자연어 assistant message로만 사용자에게 표시합니다.
- MVP 사용자 UI에는 별도 tool execution card나 tool call JSON을 노출하지 않습니다.
- `ai_chat_messages`와 `ai_tool_calls`는 tool call/result reference를 저장해 이후 실행 카드 UI로 확장할 수 있어야 합니다.
- AI 채팅에는 보관 기간과 만료/삭제 정책을 둡니다.
- AI context 권한은 현재 여행방 데이터, 요청자 본인의 상세 선호도 데이터, 그룹 추천용 집계/추천 결과로 제한합니다.
- 현재 여행방 데이터 예시: 일정, 지도 경로/그림, 여행방 전체 메모, 일차(day) 관리 메모, 여행방 전체 체크리스트, 일차(day) 관리 체크리스트, 여행방 멤버 기본 정보.
- 요청자 본인의 상세 선호도 데이터 예시: 본인의 스와이프 기반 선호도 projection, SUPER_LIKE 장소, 저장 장소.
- 다른 멤버의 raw 선호도 점수, 세부 태그 가중치, 스와이프 로그는 AI context에 직접 주입하지 않습니다.
- 그룹 추천 context는 추천/search tool 결과로만 제공합니다. 예: 후보 장소, matched member avatar/id, 정렬 결과, 일정 추가에 필요한 외부 장소 참조.
- AI 추천 설명은 matched member avatar/name 수준만 허용합니다.
- AI 추천 설명은 다른 멤버의 세부 선호 태그, raw/normalized score, 태그 가중치, 스와이프 로그를 노출하지 않습니다.
- AI 챗봇은 Spring AI tool calling을 사용해 제한된 서버-side action을 수행할 수 있습니다.
- V1 tool 범위는 일정 편집, "일차 미정" 장소 배치, 여행지 탐색, 메모, 체크리스트로 제한합니다.
- 예시 tool action: 일정 아이템 순서 재배치, 일정 아이템 day 이동, "일차 미정" 장소 실제 day 배치, 여행지 후보 검색, 추천 장소 일정 추가, 여행방 전체 메모 수정, 일차(day) 관리 메모 수정, 여행방/일차 체크리스트 생성/수정/완료 처리.
- MVP 메모는 여행방 전체 메모와 일차(day) 관리 메모만 지원합니다.
- MVP 메모는 특정 itinerary item, place, map object에 직접 연결하지 않습니다.
- 메모는 scope별 단일 관리 문서로 취급합니다.
- 여행방 전체 메모는 trip당 1개만 둡니다.
- 일차(day) 관리 메모는 각 실제 itinerary day와 `UNSCHEDULED` group마다 1개만 둡니다.
- 여행방 멤버는 메모를 soft delete할 수 있습니다.
- soft deleted 메모는 `deleted_by_user_id`, `deleted_at`을 저장합니다.
- MVP 체크리스트는 여행방 전체 체크리스트와 일차(day) 관리 체크리스트만 지원합니다.
- MVP 체크리스트는 특정 itinerary item, place, map object에 직접 연결하지 않습니다.
- 체크리스트는 scope별 단일 리스트로 취급합니다.
- 여행방 전체 체크리스트는 trip당 1개만 둡니다.
- 일차(day) 관리 체크리스트는 각 실제 itinerary day와 `UNSCHEDULED` group마다 1개만 둡니다.
- MVP 체크리스트 항목에는 담당자 필드를 두지 않습니다.
- 체크리스트 항목은 여행방 멤버가 함께 보는 공통 할 일로 취급합니다.
- 체크리스트 항목 자체에는 전역 완료 여부를 저장하지 않습니다.
- 각 체크리스트 항목의 완료 여부는 여행방 멤버별 상태로 관리합니다. 예: `여권 챙기기` 항목에 대해 민지는 완료, 현우는 미완료일 수 있습니다.
- 멤버별 체크 상태는 `planning.checklist_item_member_statuses`에 `user_id`, `is_completed`, `completed_at`, `updated_by_user_id`로 저장합니다.
- 신규 멤버가 합류하면 기존 체크리스트 항목에 대해 미완료 상태로 보이도록 처리합니다.
- 여행방 멤버는 체크리스트 항목을 soft delete할 수 있습니다.
- soft deleted 체크리스트 항목은 `deleted_by_user_id`, `deleted_at`을 저장합니다.
- 여행지 탐색 tool은 검색/추천 후보를 반환하는 read/search tool입니다.
- 사용자가 같은 요청 안에서 "일정에 넣어줘", "1일차에 추가해줘"처럼 명시적으로 추가 의도를 표현하고 후보가 하나로 해석되면, AI는 별도 확인 없이 추천 장소 일정 추가 write tool을 호출할 수 있습니다.
- 추가 의도는 있지만 day/위치를 판단할 수 없으면, AI는 "일차 미정" 그룹을 생성 또는 재사용해 확정 방문 itinerary item으로 추가합니다.
- 추가할 장소가 여러 개로 해석되고 사용자가 여러 장소 추가를 의도한 경우, AI는 "일차 미정" 그룹에 최대 10개까지 추가할 수 있습니다.
- 검색 후보가 너무 많거나 사용자의 의도가 검색인지 일정 추가인지 불명확하면, AI는 write tool을 호출하지 않고 후보 또는 필요한 선택지를 먼저 반환해야 합니다.
- 여행지 탐색 tool은 기본적으로 현재 지도 viewport를 검색 범위로 사용합니다.
- 사용자가 자연어로 지역을 명시하면 해당 지역을 검색 범위로 사용할 수 있습니다.
- 지역이 명시되지 않으면 현재 지도 viewport와 여행방 작업 맥락을 기준으로 검색합니다.
- tool action은 일반 REST 일정 변경과 동일하게 권한 검사, `baseVersion` 검사, 변경 이벤트 저장, itinerary version 증가, STOMP broadcast를 수행해야 합니다.
- tool action은 허용된 tool registry 안에서만 실행하며, 임의 SQL/임의 API 호출은 허용하지 않습니다.
- tool action은 `READ`, `REVERSIBLE_WRITE`, `BLOCKED_HIGH_RISK` 같은 execution policy를 가져야 합니다.
- read/search tool은 확인 없이 실행합니다.
- reversible write tool은 명시적인 사용자 요청이 있을 때 확인 없이 즉시 실행하고, 실행 결과에 undo/redo 가능 여부를 포함합니다.
- V1 AI tool은 pending confirmation 흐름을 만들지 않습니다.
- 확인이 필요할 만큼 위험한 작업은 V1 AI tool registry에 등록하지 않고 `BLOCKED_HIGH_RISK`로 차단합니다.
- blocked high-risk 예시: 일정/메모/체크리스트 삭제, 대량 변경, 공개 공유, 초대/권한/설정 변경, 되돌리기 어려운 외부 API 호출.
- AI tool 호출은 `ai_tool_calls` 성격의 감사 로그에 요청자, 여행방, tool name, execution policy, arguments, status, version before/after, undo/redo 가능 여부를 기록해야 합니다.
- AI tool write도 공통 협업 undo/redo command stack을 사용합니다.
- 공유 AI agent session에서 실행된 AI tool write라도 command/undo/redo 소유권은 해당 tool을 요청한 사용자와 활성 WebSocket 세션에 귀속됩니다.
- `ai_tool_calls` 감사 로그는 영구 보관 정책을 따르지만, 감사 로그만으로 오래된 변경을 undo할 수 있게 만들지는 않습니다.

## 여행방 사용자 소통

- 여행방 사용자 간 소통 기능은 AI agent session과 별도 도메인으로 설계합니다.
- 사용자 채팅/소통 메시지는 AI 채팅 메시지와 같은 테이블에 섞지 않습니다.
- 사용자 간 소통 UI와 AI agent UI는 화면에서 함께 배치될 수 있지만, API/DB 계약은 분리합니다.
- MVP 사용자 간 소통은 여행방 전체 텍스트 채팅만 지원합니다.
- 사용자 채팅 메시지는 `trip_id`, `sender_user_id`, `content`, `created_at`을 중심으로 저장합니다.
- MVP 채팅 메시지는 특정 itinerary item, place, map object에 연결하지 않습니다.
- 스레드, 멘션, 리액션, 일정/장소 연결 메시지는 MVP 범위에서 제외합니다.
- 새 채팅 메시지는 저장 후 WebSocket/STOMP로 여행방 참여자에게 broadcast합니다.
- MVP 채팅 메시지는 수정 API를 제공하지 않습니다.
- 사용자는 본인이 보낸 채팅 메시지만 soft delete할 수 있습니다.
- soft deleted 채팅 메시지는 content를 노출하지 않고 tombstone 상태로 응답합니다.
- 채팅 메시지에는 soft delete 상태와 삭제 시각을 저장할 수 있어야 합니다.

## 알림

- MVP 알림 채널은 인앱 알림만 지원합니다.
- MVP 인앱 알림 생성 이벤트는 여행방 초대 관련 이벤트로 제한합니다.
- MVP 초대 알림은 앱 가입자인 사용자를 직접 초대했을 때 초대받은 사용자에게만 생성합니다.
- 초대 링크/코드로 참여하는 흐름은 별도 인앱 알림을 생성하지 않습니다.
- 일정, AI tool, 채팅, 메모, 체크리스트 변경은 MVP에서 인앱 알림을 생성하지 않습니다.
- 이메일, Web Push, FCM, APNs 알림 발송은 MVP 범위에서 제외합니다.
- notification model은 이후 이메일/푸시 채널을 확장할 수 있게 둡니다.
- MVP에서는 알림 수신함과 읽음 상태를 저장합니다.
- 이메일/푸시 delivery 로그는 실제 채널 구현 시 추가합니다.

## 관리자와 운영

- 관리자 콘솔 전체 범위를 포함합니다.
- 전역 운영 권한은 별도 admin user/table이 아니라 `auth.roles`와 `auth.user_roles` 기반 RBAC로 관리합니다.
- 운영 role code: `SUPER_ADMIN`, `ADMIN`, `MODERATOR`.
- `SUPER_ADMIN`: 운영자 계정, 권한, 시스템 설정 관리.
- `ADMIN`: 사용자, 여행방, 게시글, 미디어, 알림 등 전체 운영 처리.
- `MODERATOR`: 신고 처리, 게시글/댓글 숨김/복구 등 콘텐츠 중심 처리.
- 운영 감사 로그는 `ops.audit_logs`에 저장합니다.
