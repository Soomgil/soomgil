# 지도 협업 오브젝트와 실시간 커서

## 목표

- 여행방 지도에서 기본 스티커와 사용자 업로드 이미지를 지도 좌표 공간에 배치한다.
- 오브젝트가 지도 줌, 이동, 회전과 함께 자연스럽게 변하도록 실제 지도 크기를 저장한다.
- 같은 오브젝트의 동시 편집을 lease 잠금으로 막고, 접속자의 지도 커서를 실시간으로 표시한다.

## 현재 상태

- Mapbox 일정 지도와 자유 그리기, 그리기 REST 저장, STOMP preview 기반은 구현되어 있다.
- 실제 제품 코드는 `FREEHAND`, `LINE`, `POLYGON`, `MARKER`, `TEXT`만 지원한다.
- 계약 DBML/OpenAPI에는 `STICKER`, `IMAGE`, `mediaFileId`, `stickerCode`, `transform`, `MAP_OVERLAY`가 선반영되어 있다.
- 접속자 snapshot은 범용 collaboration topic으로 전송되며 커서와 편집 잠금은 구현되지 않았다.
- 프론트와 백엔드의 기존 drawing REST 경로는 계약 경로와 다르다.

## 확정 결정

- 담당 범위는 frontend, backend itinerary/collaboration, media 전체다.
- 정식 REST 경로는 `/api/v1/trips/{tripId}/map-drawings`다.
- 이미지와 스티커는 중심 lng/lat, 지도상 너비·높이(m), 회전각을 저장한다.
- 모든 active member가 모든 지도 오브젝트를 편집·삭제할 수 있다.
- 편집 잠금은 15초 lease, 5초 갱신이며 수정·삭제 시 잠금 소유권을 검사한다.
- 잠금 요청은 `/app/trips/{tripId}/map-object-lock`, 상태는 map-drawings topic으로 전파한다.
- MVP 실시간 상태는 단일 인스턴스 메모리에 두되 저장소 interface를 분리한다.
- 기본 스티커는 안정적인 code를 가진 자체 SVG 12종을 저장소에 포함한다.
- 지도 이미지는 임시 업로드 후 서버에서 MIME 검증, 메타데이터 제거, orientation 보정, 긴 변 2048px 리사이징 후 최종 저장한다.
- 커서는 lng/lat, 50ms throttle, 10초 TTL로 presence topic에 중계하고 영구 저장하지 않는다.
- 재접속 시 로컬 미저장 상태를 폐기하고 최신 itinerary snapshot을 다시 조회한다.

## 변경 범위

- `backend/src/main/java/com/soomgil/itinerary/`: 지도 오브젝트 계약, handler, persistence, REST.
- `backend/src/main/java/com/soomgil/collaboration/`: lease 잠금, cursor/presence STOMP.
- `backend/src/main/java/com/soomgil/media/`, `global/storage/`: MAP_OVERLAY 정책과 안전한 이미지 처리.
- `backend/src/main/resources/db/migration/`: map drawing 확장 migration.
- `frontend/src/components/map/`, `pages/RoutePage.vue`: 스티커·이미지 배치와 편집, 원격 커서.
- `frontend/src/realtime/`, `api/`, `types/`: 실시간·REST 계약 확장.
- `.agent/contracts/`, `.agent/docs/api/`: 구현과 계약 동기화.

## 수용 기준

- STICKER와 IMAGE를 생성, 조회, 이동, 회전, 크기 조절, 삭제할 수 있다.
- 오브젝트는 고정 픽셀 크기가 아니라 지도 좌표 투영에 따라 확대·축소된다.
- 조작 중에는 preview만 전송하고 조작 종료 시 REST 저장을 한 번 수행한다.
- 타 사용자가 잠근 오브젝트는 편집할 수 없고 lease 만료 또는 disconnect 시 다시 편집할 수 있다.
- 접속자의 커서는 지도 좌표에 표시되고 10초 후 제거되며 DB에 저장되지 않는다.
- MAP_OVERLAY는 JPG, PNG, WebP, 최대 10MB이고 서버 이미지 정제 정책을 통과해야 한다.
- version/lease 충돌과 재접속 시 서버 저장 상태로 복구한다.
- 기존 자유 그리기, 경로, undo/redo가 회귀하지 않는다.

## 테스트 계획

- backend: drawing subtype 불변 조건, transform 경계, media 연결 권한, version/lease 충돌 handler/controller/repository 테스트.
- backend: lock acquire/renew/release/expiry/disconnect, cursor 인증·payload 제한·topic 권한 테스트.
- backend: MAP_OVERLAY MIME/용량/WebP/이미지 정제 테스트.
- frontend: 스티커/이미지 배치, map-meter 변환, zoom 투영, transform preview와 단일 저장 테스트.
- frontend: lock UI, remote cursor TTL/self echo, reconnect snapshot resync 테스트.
- integration: 두 브라우저 동시 편집과 재접속 시나리오.

## 진행 로그

- [x] 맥락 조사
- [x] 사용자 흐름·수용 기준·테스트 계획 승인
- [x] 실패 테스트 작성
- [x] backend 구현
- [x] frontend 구현
- [x] 계약 문서 갱신
- [x] 통합 검증

## 결정 기록

- 2026-08-24: 사용자가 1-B, 2-A, 3-B, 4-A~13-A를 선택하고 구현 진행을 승인했다.

## 검증 로그

- 구현 전 기준선: frontend 지도/실시간 관련 72개 테스트 통과.
- 구현 전 기준선: backend 지도/협업/미디어 관련 41개 테스트 통과.
- 구현 후 frontend 전체 45개 파일, 283개 테스트 통과 및 production build 통과.
- 구현 후 backend collaboration, itinerary API/domain/persistence, media, context 범위 테스트 통과.
- PostgreSQL Testcontainers에서 V43 migration과 STICKER 영속화 통합 테스트 통과.
- backend JavaDoc 생성과 orchestration `harness:check` 통과.
- OpenAPI YAML 파싱과 frontend API integrity/smoke 검사 통과.
- 실제 두 브라우저 수동 검증은 인증된 로컬 계정/실행 backend가 없어 자동화된 component/controller 동시성 시나리오로 대체했다.

## 후속 작업

- 다중 backend 인스턴스 배포 전 lease/presence 저장소를 Redis로 교체하고 외부 STOMP broker를 도입한다.

## 후속 안정화

- 2026-08-24: 로컬 저장소를 MinIO로 고정하고 서버 내부 endpoint와 브라우저 presign endpoint를 분리했다.
- 2026-08-24: 저장 지도 오브젝트 삭제는 lease 획득과 서버 삭제가 성공한 뒤 화면에서 제거하며, 동일 계정의 다른 창과 다른 사용자의 잠금 충돌을 구분해 안내한다.
- 2026-08-24: 지도 오브젝트 command event에 WebSocket session ID를 명시적으로 저장하고 프론트 toolbar를 서버 undo/redo stack에 연결했다.
