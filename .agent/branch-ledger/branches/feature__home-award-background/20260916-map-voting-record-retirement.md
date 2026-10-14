# 기록 기능 폐지와 지도 투표·테마 통합

## 요청과 범위

- 기록 페이지뿐 아니라 서버 기능과 데이터도 제거한다는 사용자 답변을 확인했다.
- 여행 생성 직후 및 내 여행의 투표 진입은 지도 모달에서 진행한다.
- 관리 오른쪽에서 지도 테마를 직접 고르고, 드로잉·경로 그리기·3D·앱 다크 모드는 선택한 테마를 바꾸지 않는다.

## 구현

- frontend `29b2ddf`: 기록 페이지·메뉴·전용 API/타입/사진 유틸을 제거했다. 여행기 작성은 직접 업로드를 이용한다.
- 기존 `/trips/:tripId/vote`는 지도 `?vote=1` 링크로 redirect한다. 생성 흐름에서 AI 진입 query도 유지한다.
- 지도 테마는 밝게, 어둡게, 주간 도로, 야간 도로, 기본 지도 5종이다. 브라우저 localStorage에 저장한다. 작은 화면에서도 투표·관리·테마 버튼 순서를 유지한다.
- backend `e978fb6`: record 모듈·API·업로드 목적·여행 카드 및 AI의 기록 의존성을 제거했다.
- V51은 record 테이블 3개와 schema를 삭제한다. 기록 전용 미디어는 즉시 purge 대상이며 객체 삭제 실패는 기존 cleanup에서 재시도한다. 공용 사진은 유지한다.
- 기존 키를 사용하는 공개 커뮤니티 사진은 공개 게시물 참조를 확인한 뒤에만 제공한다.
- 이미 적용된 V15/V38 migration은 변경하지 않았다.

## 검증

- test-first: 기존 구현에서 지도 자동 스타일 변경/기존 투표 라우팅/기록 사진 API 호출/기록 schema 잔존으로 실패함을 확인했다.
- frontend 전체 58개 파일, 400개 테스트 통과. 최종 버튼 그룹 변경 후 RoutePage 78개 테스트 재통과. production build 통과.
- backend 관련 51개 suite, 208개 테스트 및 bootJar 통과. V50→V51 PostgreSQL Testcontainers migration 검증 포함.
- 실제 Mapbox 5종 스타일 HTTP 200, 렌더링 및 각 테마에서 그리기·경로·3D 전환 후 스타일 유지 확인. 새로고침 후 선택 유지 확인.
- Playwright fixture UI: 1440/390/320 너비, 지도 모달 투표 설정, 테마 팝오버 화면 범위 확인. 이는 실제 사용자 여행방 API 테스트는 아니다.
- harness:index / harness:check, API integrity, SPA 18개 smoke 통과. OpenAPI schema reference 누락 없음.

## 로컬 실행

- `qa/start-workspace-preview.ps1`: frontend와 backend 모두 현재 worktree로 build/mount한다. V51은 데이터 삭제 migration이다.
- 기존 `qa/start-home-preview.ps1`은 frontend만 재시작한다.
- 적용 전 로컬 DB: 기록 본문 239개, 사진 연결 238개.
- 로컬 V51 적용 성공, record schema 0개 확인. 공용 ACTIVE 미디어 99개 유지, 기록 전용 미디어 230개는 기존 storage cleanup의 삭제 대상으로 전환되었다.
- 원래 `D:/vscode-workspace/soomgil`의 submodule checkout은 변경하지 않았다.
- submodule merge 전이므로 root의 frontend/backend pointer는 stage하지 않는다. push/PR/merge는 하지 않았다.

## 로컬 적용 최종 확인

- backend actuator health HTTP 200, frontend/backend worktree mount 확인.
- 실제 Mapbox 5종 스타일 전환과 독립 모드 전환 검증을 다시 통과했다.
- 최종 1440/390/320 UI와 투표 설정 redirect/모달 확인 통과.
- storage cleanup 첫 batch: 100개 PURGED, 130개 DELETED(후속 자동 정리 대기). 공용 ACTIVE 99개 유지. 기록 테이블의 본문/연결 데이터는 즉시 삭제 완료.
