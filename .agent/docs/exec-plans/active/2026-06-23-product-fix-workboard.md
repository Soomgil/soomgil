# 제품 수정 작업현황보드

## 목표

- 2026-06-23에 접수된 `/home`, `/community`, `/my-trips`, `/trip`, `/map`, `/search`, `/mypage`, `/settings`, `/record`, `/swipe` 관련 수정 요청을 추적 가능한 작업 단위로 정리한다.
- 바로 구현 가능한 항목과 제품 결정 또는 재현 확인이 필요한 항목을 분리한다.
- 여러 작업자가 병렬로 진행해도 중복 구현과 누락이 생기지 않도록 작업 ID, 상태, 검증 기준을 기록한다.

## 상태 규칙

| 상태 | 의미 |
| :--- | :--- |
| `TODO` | 목표와 완료 기준이 충분히 명확해 바로 착수 가능 |
| `NEEDS_CONFIRMATION` | 제품 기준, UX 방향, 정책 또는 용어 결정이 필요 |
| `NEEDS_REPRO` | 현상 재현, API 응답, 데이터 상태 확인이 먼저 필요 |
| `IN_PROGRESS` | 작업 브랜치 또는 PR에서 구현 중 |
| `VERIFY` | 구현은 끝났고 테스트, 빌드, 화면 검증이 남음 |
| `DONE` | develop 반영, 검증, 문서 갱신까지 완료 |
| `DROPPED` | 제품 결정으로 하지 않기로 한 항목 |

상태를 `IN_PROGRESS`로 바꿀 때는 작업 브랜치 또는 PR을 함께 기록한다.
`NEEDS_CONFIRMATION` 항목은 구현 작업을 시작하기 전에 사용자에게 질문해 목표와 범위를 확정한다.

## 공통 완료 기준

- 관련 화면의 loading, empty, error, 권한 상태를 확인한다.
- mock 데이터 제거 항목은 실제 API 또는 명시적 empty 상태로 전환한다.
- UI 수정 항목은 desktop과 mobile 주요 viewport에서 겹침, 넘침, 깨짐을 확인한다.
- 기능 구현 항목은 component/API 테스트를 추가하거나 기존 테스트를 보강한다.
- `frontend` 변경 후 최소 `npm test -- --run` 또는 관련 테스트와 `npm run build`를 실행한다.
- root 하네스 영향이 있으면 `npm --prefix .agent run harness:check`를 실행한다.

## 작업표

| ID | 영역 | 작업 | 상태 | 선행 확인 | 작업 브랜치/PR | 완료 증거 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `PF-001` | community | 게시물 클릭 후 feed 모달 생성 시 해당 게시물 번호 위치까지 배경 또는 모달이 스크롤되는 현상 수정 | `NEEDS_REPRO` | 어떤 스크롤 컨테이너가 이동하는지 확인 |  |  |
| `PF-002` | community | 게시물 작성 후 `/community` 전체 여행기 목록에 즉시 반영되도록 갱신 | `TODO` | 작성 성공 후 목록 cache/route 갱신 방식 확인 |  |  |
| `PF-003` | community | Feed 모달창 스크롤바 제거 | `TODO` | 스크롤 기능은 유지하고 scrollbar만 숨김 |  |  |
| `PF-035` | community | 커뮤니티 탭 로그인 없이 진입 가능하도록 수정 | `TODO` | 비로그인 읽기 허용 API와 작성 CTA 처리 확인 |  |  |
| `PF-038` | community | 답글이 답글처럼 보이도록 indentation, grouping, label 개선 | `TODO` | 댓글 depth 계약 확인 |  |  |
| `PF-039` | community | 답글 like 안 되는 현상 수정 | `NEEDS_REPRO` | reply ID와 like endpoint 호출 확인 |  |  |
| `PF-040` | community | 커뮤니티 용어 `재여행`을 `리트립`으로 변경 | `TODO` | 전역 문구 검색 후 변경 |  |  |
| `PF-049` | community | `/community` 최신 여행기 게시물 개수를 8개로 변경 | `TODO` | 해당 섹션 조회 size를 8로 고정 |  |  |
| `PF-052` | community | 내 경로 저장하기 UI 제거 | `TODO` | 해당 action 사용처와 기능 영향 확인 |  |  |
| `PF-019` | header | 일정 알림 mock 데이터 제거 및 API 연동 | `TODO` | notification API와 trip schedule 알림 타입 확인 |  |  |
| `PF-020` | header | 알림창 스크롤바 제거 | `TODO` | 스크롤 기능은 유지하고 scrollbar만 숨김 |  |  |
| `PF-021` | header | 알림 클릭 시 알림창이 내려가는 현상 수정 | `NEEDS_REPRO` | click handler, focus, dropdown positioning 확인 |  |  |
| `PF-022` | header | 알림 삭제 버튼 UI/UX 개선 | `TODO` | 삭제 API와 hover/focus 상태 확인 |  |  |
| `PF-010` | home | 새 여행 만들기 버튼 기능 구현 | `TODO` | 연결 목적지: 생성 모달 또는 `/my-trips` 생성 flow 확인 |  |  |
| `PF-011` | home | 지도에서 루트 만들기 버튼 기능 구현 | `TODO` | trip 생성 전 route 편집 진입 방식 확인 |  |  |
| `PF-012` | home | 지도에서 친구 초대하기 버튼 기능 구현 | `NEEDS_CONFIRMATION` | 초대 대상 trip이 없을 때 UX 결정 |  |  |
| `PF-013` | home | 지도에서 AI 추천 받기 버튼 기능 구현 | `NEEDS_CONFIRMATION` | trip 없이 추천 가능한지, 생성 후 추천인지 결정 |  |  |
| `PF-014` | home | Super-like Top 3 우측 컨텐츠 방향 결정 | `NEEDS_CONFIRMATION` | 노출할 지표와 CTA 결정 |  |  |
| `PF-015` | home | 커뮤니티 인기 여행 후기를 최근 등록순이 아니라 인기 기준으로 정렬 | `TODO` | backend 정렬 파라미터 또는 인기 API 확인 |  |  |
| `PF-016` | home | 사진 없는 커뮤니티 카드 placeholder 추가 | `TODO` | placeholder asset 또는 CSS 생성 방식 결정 |  |  |
| `PF-017` | home | 초대 링크 만들기 버튼 기능 구현 | `NEEDS_CONFIRMATION` | 연결할 trip 선택 UX 결정 |  |  |
| `PF-018` | home | 카카오, 구글 초대 버튼 기능 구현 | `NEEDS_CONFIRMATION` | 공유 URL, OAuth invite, 외부 공유 중 범위 결정 |  |  |
| `PF-037` | home | 최상단 배너 mock 데이터 제거 여부 및 실제 데이터 연동 | `NEEDS_CONFIRMATION` | 배너 운영 주체와 API 존재 여부 확인 |  |  |
| `PF-041` | home | Super-like TOP 3 mock 데이터 추가 및 실제 반영 | `NEEDS_CONFIRMATION` | mock 추가와 mock 제거 요청이 충돌하므로 기준 필요 |  |  |
| `PF-047` | map | 맵 위 관광지 카드 hover 시 카드가 튀거나 이동하는 현상 수정 | `NEEDS_REPRO` | hover transform, map overlay positioning 확인 |  |  |
| `PF-048` | map | GPS로 경로 그리기 구현 | `NEEDS_CONFIRMATION` | 실시간 위치 기록인지 현재 위치 기반 경로 생성인지 결정 |  |  |
| `PF-051` | map | 지도 UI를 회색의 심플한 디자인과 한국어로 변경 | `NEEDS_CONFIRMATION` | 지도 provider style 지원 범위 확인 |  |  |
| `PF-005` | my-trips | 새 여행 만들기에서 부산 검색이 안 되는 현상 수정 | `NEEDS_REPRO` | 지역 검색 API, 입력값, debounce, 결과 empty 원인 확인 |  |  |
| `PF-006` | my-trips | 여행 진행 중에서 보관 됨으로 바꾸는 기준 명확화 및 UI 반영 | `NEEDS_CONFIRMATION` | 자동 전환인지 사용자 수동 보관인지 결정 |  |  |
| `PF-007` | my-trips | 멤버 초대 및 설정 모달 곡률을 기존 UI와 통일 | `TODO` | 기준 radius token 확인 |  |  |
| `PF-023` | mypage | 좋아요한 장소 이미지 카드 깨짐 수정 | `NEEDS_REPRO` | 이미지 null, 비율, fallback 확인 |  |  |
| `PF-024` | mypage | 내 여행기 클릭 시 `/community` 이동 없이 모달이 바로 뜨도록 수정 | `TODO` | modal component 재사용 또는 route-less overlay 구현 |  |  |
| `PF-025` | mypage | 전체 공개, 팔로워 공개 설정을 직접 확인할 수 있는 UI 추가 | `NEEDS_CONFIRMATION` | backend 공개 범위 enum과 저장 위치 확인 |  |  |
| `PF-026` | mypage | 공유하기 버튼 구현 | `NEEDS_CONFIRMATION` | Web Share API, 링크 복사, SNS 공유 중 범위 결정 |  |  |
| `PF-027` | mypage | 프로필 사진 변경을 저장 버튼 전까지 preview 상태로만 유지 | `TODO` | profile update API와 upload timing 확인 |  |  |
| `PF-004` | navigation | `/swipe` 화면의 `flex items-center justify-center gap-5` 스와이핑 인터랙션 버튼 3개 제거 | `TODO` | `/swipe` route와 헤더 메뉴는 유지하고 해당 인터랙션 버튼만 제거 |  |  |
| `PF-033` | record | 사진 여러 개 추가 기능 구현 | `TODO` | media upload API의 다중 파일 흐름 확인 |  |  |
| `PF-034` | record | 사진 추가 UI 개선 | `TODO` | 다중 업로드 UX와 함께 처리 |  |  |
| `PF-056` | recommendation | 실제 추천시스템 사용 | `NEEDS_CONFIRMATION` | 현재 추천 API와 목표 추천 엔진 기준 확인 |  |  |
| `PF-008` | search | `/search` 페이지 디자인 수정 | `TODO` | 검색 기능 작업과 함께 검증 |  |  |
| `PF-009` | search | `/search` 검색 기능 추가 또는 복구 | `TODO` | `/api/v1/search` 계약과 page query 연동 확인 |  |  |
| `PF-028` | settings | 로그인 기기 mock 데이터 제거 및 기능 구현 | `NEEDS_CONFIRMATION` | backend 세션/기기 API 존재 여부 확인 |  |  |
| `PF-029` | settings | 표시 언어를 직접 입력이 아닌 option 선택으로 변경 | `TODO` | 지원 언어 목록 확정 필요 |  |  |
| `PF-030` | settings | UI 개선 | `NEEDS_CONFIRMATION` | 구체 개선 범위 필요 |  |  |
| `PF-031` | settings | `/setting` 또는 `/settings` 통으로 안 되는 현상 수정 | `NEEDS_REPRO` | 정확한 경로, 콘솔 오류, API 실패 확인 |  |  |
| `PF-032` | settings | 이름, 소개 설정 제거 여부 결정 | `NEEDS_CONFIRMATION` | 제거하면 mypage 프로필 수정과 충돌 가능 |  |  |
| `PF-036` | swipe | 관광지 카드 텍스트 넘침 개선 방향 결정 및 적용 | `NEEDS_CONFIRMATION` | 줄수 제한, 펼침, 레이아웃 확장 중 선택 |  |  |
| `PF-042` | trip | 여행 일차 지우기 기능 추가 | `TODO` | itinerary day delete API 확인 |  |  |
| `PF-043` | trip | 관광지 추천에서 이미 추가된 목록 확인 UI/UX 개선 | `TODO` | itinerary item과 recommendation 매칭 기준 확인 |  |  |
| `PF-044` | trip | 관광지 추천 북마크 버튼 기능 구현 | `TODO` | savePlace API와 current saved state 확인 |  |  |
| `PF-045` | trip | 관광지 여행 순서 바꾸는 UX 개선 | `NEEDS_CONFIRMATION` | drag/drop, stepper, move buttons 중 방향 결정 |  |  |
| `PF-046` | trip | 관광지 여행 순서 바꾸기 일정 순서 저장 안 되는 버그 수정 | `NEEDS_REPRO` | reorder API payload와 optimistic update 확인 |  |  |
| `PF-053` | trip | 초대하기 및 설정 UI를 더 둥글고 다른 UI와 어울리게 수정 | `TODO` | `PF-007`과 통합 가능 |  |  |
| `PF-054` | trip | QR 생성 및 보여주기 | `TODO` | 초대 링크 API와 QR 라이브러리 확인 |  |  |
| `PF-055` | trip | 일정 추가 기능 구현 | `TODO` | itinerary day/item 추가 API 확인 |  |  |
| `PF-057` | trip | 여행 보관 기능 구현 | `TODO` | trip status update API 확인 |  |  |
| `PF-050` | global | 헤더와 상단 콘텐츠 사이 간격, 상단 문구 디자인 일관성 정리 | `TODO` | 공통 page heading 패턴 정의 |  |  |

## 확인 질문

1. `my-trips`의 진행 중 → 보관 됨 전환 기준은 사용자가 직접 보관 버튼을 누르는 방식인가, 여행 종료일이 지나면 자동 전환되는 방식인가?
2. `/home` 지도 영역의 루트 만들기, 친구 초대하기, AI 추천 받기는 기존 여행을 선택한 뒤 실행해야 하는가, 아니면 새 여행 생성 flow로 보내야 하는가?
3. `/home` 초대 링크, 카카오, 구글 초대 버튼은 어느 여행의 초대 링크를 공유해야 하는가?
4. Super-like TOP 3는 실제 API 데이터가 없을 때 mock을 임시로 보여야 하는가, 아니면 mock 제거 원칙에 따라 empty/loading/error 상태만 보여야 하는가?
5. `/settings` 로그인 기기는 backend에 실제 세션/기기 관리 API가 있는가? 없다면 이번 범위에 backend API 추가도 포함하는가?
6. `/settings` 이름, 소개 설정은 완전히 제거하는가, 아니면 `/mypage` 프로필 수정으로만 이동하는가?
7. `/swipe` 관광지 카드 텍스트 넘침은 카드 내부 말줄임, 더보기 펼침, 상세 모달 연결 중 어떤 UX를 원하는가?
8. `/map` GPS로 경로 그리기는 사용자의 이동 기록을 실시간으로 그리는 기능인가, 현재 위치에서 선택 관광지까지 길찾기 경로를 그리는 기능인가?
9. 지도 UI의 회색 심플 스타일과 한국어 변경은 사용하는 지도 provider가 지원하는 범위 안에서 처리하면 되는가?
10. `실제 추천시스템 사용`은 현재 `/place-recommendations` API를 더 적극적으로 쓰라는 뜻인가, 별도 추천 엔진 또는 가중치 문서의 알고리즘을 적용하라는 뜻인가?

## 모호성 검토 결과

확정된 범위:

- `PF-004`는 `/swipe` 화면의 `flex items-center justify-center gap-5` 스와이핑 인터랙션 버튼 3개만 제거한다. `/swipe` route와 헤더 메뉴 제거는 범위에 포함하지 않는다.
- `PF-049`는 `/community` 최신 여행기 섹션의 게시물 개수를 8개로 변경하는 작업으로 확정한다.

아직 목표 확정이 필요한 항목:

- 보관 기준: 사용자가 직접 보관하는지, 종료일 기준 자동 보관인지.
- 홈 지도 CTA와 초대 버튼: 선택된 여행이 없을 때 어떤 flow로 보낼지.
- Super-like TOP 3: mock 데이터를 임시로 유지할지, 실제 API/empty 상태만 허용할지.
- 설정 페이지: 로그인 기기 API 존재 여부, 이름/소개 설정 제거 범위, UI 개선의 구체 범위.
- 지도/GPS/추천 시스템: provider 지원 범위와 실제 추천 엔진 기준.

## 권장 진행 순서

1. 즉시 수정 가능한 UI 깨짐과 문구 변경: `PF-003`, `PF-007`, `PF-016`, `PF-020`, `PF-038`, `PF-040`, `PF-049`, `PF-050`, `PF-052`, `PF-053`
2. 사용자 흐름이 막히는 기능 버그: `PF-002`, `PF-005`, `PF-009`, `PF-019`, `PF-021`, `PF-023`, `PF-024`, `PF-027`, `PF-031`, `PF-039`, `PF-046`, `PF-047`
3. 기존 API로 구현 가능한 기능: `PF-010`, `PF-011`, `PF-015`, `PF-029`, `PF-033`, `PF-034`, `PF-035`, `PF-042`, `PF-043`, `PF-044`, `PF-054`, `PF-055`, `PF-057`
4. 제품 결정 후 구현할 항목: `PF-006`, `PF-012`, `PF-013`, `PF-014`, `PF-017`, `PF-018`, `PF-025`, `PF-026`, `PF-028`, `PF-030`, `PF-032`, `PF-036`, `PF-037`, `PF-041`, `PF-045`, `PF-048`, `PF-051`, `PF-056`

## 진행 로그

| 날짜 | 작업 ID | 상태 변경 | 브랜치/PR | 결과 또는 다음 단계 |
| :--- | :--- | :--- | :--- | :--- |
| 2026-06-23 | 전체 | 생성 | `develop` | 접수 요청 57개를 작업 ID와 확인 질문으로 정리 |
| 2026-06-23 | 전체 | 작업표 정렬 | `develop` | 작업 목록을 page 또는 주요 영역 단위로 재정렬 |
| 2026-06-23 | `PF-049` | 기준 보완 | `develop` | `/community` 최신 여행기 8개로 범위 확정 |
| 2026-06-23 | `PF-004` | `NEEDS_CONFIRMATION` → `TODO` | `develop` | `/swipe` 화면의 스와이핑 인터랙션 버튼 3개 제거로 범위 확정 |

## 검증 로그

| 날짜 | 범위 | 명령/검증 | 결과 |
| :--- | :--- | :--- | :--- |
| 2026-06-23 | 문서 | 작업표 항목 수동 대조 | 사용자 요청 목록을 빠짐없이 작업 ID로 등록 |
| 2026-06-23 | 문서 | 모호성 재검토 | 작업표 영역별 정렬과 최신 여행기 개수 범위를 문서에 반영 |
| 2026-06-23 | 문서 | 사용자 확인 반영 | `PF-004` 범위와 확인 필요 항목의 사전 질문 규칙 반영 |

## 후속 작업

- `NEEDS_CONFIRMATION` 항목은 작업자가 구현 전에 사용자에게 질문하고, 답변을 반영해 `TODO` 또는 `DROPPED`로 바꾼다.
- 현상 재현이 필요한 항목은 관련 화면, API 응답, 콘솔 오류를 확인한 뒤 원인과 수정 범위를 기록한다.
- 실제 구현 착수 시 기능 브랜치를 만들고 해당 작업 ID를 branch ledger에 남긴다.

## 2026-06-23 비여행 페이지 최종 감사

이 절은 이번 실행의 최종 상태이며 위 최초 접수 표보다 우선한다. 사용자 요청에 따라 `/trip`, `/map` 내부 일정 편집 및 추천 기능은 이번 병합 범위에서 제외했다.

| 최종 상태 | 작업 ID | 근거 |
| :--- | :--- | :--- |
| `DONE` | `PF-001`, `PF-002`, `PF-003`, `PF-035`, `PF-038`, `PF-040`, `PF-049`, `PF-052` | 비로그인 조회, 작성 후 갱신, 단일 상세 모달, 답글 계층, 리트립 용어, 8개 페이지, 스크롤바 및 미사용 CTA 정리 |
| `DONE` | `PF-019`, `PF-020`, `PF-021`, `PF-022` | 최근 여행과 실제 일정 API 기반 브리핑, 드롭다운 스크롤/위치/삭제 조작 개선 |
| `DONE` | `PF-010`~`PF-018`, `PF-037`, `PF-041` | 홈 CTA를 여행 생성·선택 흐름에 연결하고 인기순 커뮤니티, 이미지 placeholder, 실제 배너와 Super-like API 상태 반영 |
| `DONE` | `PF-005`, `PF-006`, `PF-007` | 지역 검색 회귀 테스트, 수동 보관 기준 안내, 초대·설정 모달 radius 통일, 필터와 무관한 여행 티켓 유지 |
| `DONE` | `PF-023`~`PF-027` | 좋아요 장소 이미지 fallback, 마이페이지 직접 여행기 모달, 공개 범위 표시, Web Share/복사, 저장 전 사진 preview |
| `DONE` | `PF-004`, `PF-008`, `PF-009`, `PF-028`~`PF-034`, `PF-036`, `PF-047`, `PF-050` | 스와이프 버튼 제거, 통합 검색, 실제 기기 세션, 언어 option, 설정 UI/alias, 다중 사진, 카드 overflow, 지도 hover, 공통 상단 간격 |
| `DROPPED` | `PF-039` | 댓글 좋아요 API가 제품 계약에 없어 동작하지 않는 좋아요 affordance를 제거했다. 게시글 좋아요는 유지한다. |
| `EXCLUDED` | `PF-042`~`PF-046`, `PF-048`, `PF-051`, `PF-053`~`PF-057` | 사용자 요청의 “여행 페이지 제외” 범위. 기존 완료분을 되돌리지 않았으며 이번 병합에서 추가 변경하지 않았다. |

### 최종 검증

- `frontend`: Vitest 36 files, 184 tests 통과.
- `frontend`: TypeScript 검사와 Vite production build 통과.
- 브라우저 desktop: 비로그인 `/community` 진입, 최신 여행기 8개, 선택한 카드의 상세 모달 즉시 표시 확인.
- 브라우저 mobile 390×844: 문서 너비와 viewport 너비가 일치해 가로 넘침 없음 확인.
