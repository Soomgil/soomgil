---
id: 20260621T152928Z-chore__record-api-integration-tracking-fei-100-110-record-api-integration
branch: chore/record-api-integration-tracking
branchKey: chore__record-api-integration-tracking
createdAt: 2026-06-21T15:29:28.530Z
baseRef: develop
scope: shared
status: draft
---

# FEI-100-110 record API integration

## 배경

- 이 브랜치에서만 필요한 AI 문맥을 기록합니다.
- 다른 브랜치의 ledger를 참조하지 않습니다.

## 변경 요약

- `mediaApi`의 여행별 사진 경로를 `/trips/{tripId}/records/photos`로 수정했습니다.
- 전체 여행 사진용 `/records/photos` client를 분리했습니다.
- 기록 목록의 mock 응답을 실제 paged API 호출로 교체했습니다.
- `RecordPage`의 mock 여행·사진을 실제 trip/record API와 loading/empty/error/retry 상태로 교체했습니다.
- 느린 이전 여행 요청이 최신 선택 결과를 덮지 않도록 request sequence를 적용했습니다.
- 사진 목록을 page size 30의 `IntersectionObserver` 기반 무한 스크롤로 전환했습니다.
- 전체 사진 개수와 여행별 사진 개수를 분리하고, 여행별 사진 개수와 대표 사진은 최대 100개 여행을 한 SQL query로 집계하는 batch API로 조회합니다.
- archived 여행을 selector에 포함하고 403/404 오류 메시지와 추가 page 재시도를 분리했습니다.
- 여행 selector를 실제 button으로 바꾸고 OpenAPI, API 문서와 UI 인벤토리를 실제 backend 경로에 맞췄습니다.
- backend `feature/record-photo-summaries` 브랜치에 `POST /api/v1/records/photo-summaries`와 권한·집계 테스트를 추가했습니다.
- 재검토에서 발견한 summary 응답 경합과 null 표지 잔존을 요청 시점의 여행별 상태 버전 비교로 수정했습니다.
- 무한 스크롤의 동일 시각 행이 누락·중복되지 않도록 record/media ID 고유 정렬을 추가했습니다.
- 비공개 `TRIP_RECORD`는 DB `publicUrl`을 비워 둔 채, 권한 확인된 기록 조회에서 30분 만료 `servingUrl`을 발급하도록 storage read 서명 경계를 추가했습니다.
- MinIO 시작 시 `soomgil-local` bucket을 멱등 생성하고, 실제 MinIO signed PUT→GET 통합 테스트를 추가했습니다.
- 대표 사진의 media ID, object key, public URL을 동일 행에서 선택하며, 이미지 로드 실패 시 접근 권한을 다시 확인한 뒤 해당 사진 URL만 재발급합니다.
- RecordPage 사진 추가 폼을 `TRIP_RECORD` signed upload와 기록 생성 API에 연결하고, 기록 생성 실패 시 등록된 미디어를 정리합니다.
- signed URL 재발급의 transient 실패는 한 번 자동 재시도하며 확대 모달에도 갱신 URL을 반영합니다. MinIO compose bucket 초기화 설정은 별도 자동 검사로 고정했습니다.
- 기록 생성은 `Idempotency-Key`로 중복 생성을 막고 불확실한 실패에 같은 key로 한 번 재시도합니다.
- upload intent를 저장해 24시간 동안 완료되지 않거나 연결되지 않은 object를 정리하고, soft-delete된 media는 7일 후 storage에서 물리 삭제합니다.
- production compose를 빈 volume으로 실제 실행해 bucket 생성까지 확인하는 smoke test를 추가했습니다.
- 최종 회귀에서 frontend 28개 test file의 135개 test와 production build, backend 181개 suite의 589개 test, OpenAPI parse와 orchestration harness를 통과했습니다.
- 개선 후 frontend 28개 test file의 134개 test와 production build, backend 179개 suite의 583개 test, OpenAPI 및 orchestration harness를 통과했습니다.
- RecordPage와 여행기 작성 화면은 `servingUrl`을 `publicUrl`보다 우선 사용합니다.

## 에이전트 주의사항

- 구현은 `높음` 추론 수준으로 완료했습니다.
- 첫 `매우 높음` 코드 검토에서 발견된 P1/P2 항목을 `높음` 수준으로 개선했습니다.
- 다음 단계는 `매우 높음` 추론 수준의 독립 재검토입니다.
- 사진 업로드 modal의 실제 submit 연결은 이번 조회 연동 범위에 포함하지 않았습니다.

## develop 통합 시 반영할 내용

- `FEI-100`, `FEI-110`을 검토 결과에 따라 개선한 뒤 `DONE`으로 갱신합니다.
- frontend 전체 127 tests와 production build, backend 전체 577 tests를 통과했습니다.
- 30분 만료 signed read URL을 포함한 전체 회귀와 orchestration harness 검증을 통과했습니다.
- 다음 단계는 `매우 높음` 추론 수준의 독립 재검토입니다.
