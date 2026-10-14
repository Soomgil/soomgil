---
id: 20260823T230734Z-bugfix__map-collaboration-reliability-note
branch: bugfix/map-collaboration-reliability
branchKey: bugfix__map-collaboration-reliability
createdAt: 2026-08-23T23:07:34.185Z
baseRef: develop
scope: map-collaboration
status: ready
---

# 지도 협업 신뢰성 보강

## 배경

- 지도 이미지 업로드, 저장 오브젝트 삭제, 실행 취소·다시 실행의 통합 장애를 보강합니다.
- 로컬 AWS S3 오설정, lease 충돌 시 낙관적 삭제, 프론트 toolbar와 서버 stack 단절이 각각 원인이었습니다.

## 변경 요약

- 로컬 Compose 저장소를 MinIO로 고정하고 내부 endpoint와 브라우저 presign endpoint를 분리했습니다.
- 저장 오브젝트는 lease와 서버 삭제가 성공한 뒤 제거하고 잠금 소유자를 구분해 안내합니다.
- 지도 오브젝트 event에 WebSocket session ID를 명시적으로 기록하고 서버 undo/redo API를 toolbar에 연결했습니다.
- 만료된 access token의 refresh 요청을 REST와 WebSocket이 공유하고, 협업 채널은 토큰 갱신 완료 후 연결하도록 보강했습니다.
- Spring의 내부 `CONNECT_ACK` 변환 뒤 최종 `CONNECTED` frame에 서버 WebSocket session ID를 삽입해 HTTP mutation header와 동일 session을 사용하도록 수정했습니다.
- 지도 이미지 등록 시 MinIO object를 한 번만 읽어 검증과 정제에 재사용하고, 정제 후 알고 있는 metadata를 다시 전체 다운로드해 검증하던 왕복을 제거했습니다.
- 프론트는 업로드 직후 원본 `blob:` URL을 배치 preview에 재사용해 정제 이미지를 즉시 다시 다운로드하지 않습니다.
- 다른 참여자가 만든 오브젝트도 active MEMBER가 lease를 획득해 수정할 수 있으며, 조작 중 transform을 WebSocket으로 중계해 모든 참여자 화면에 즉시 반영합니다.
- JPG/PNG와 동일하게 허용된 WebP의 magic byte 판별을 보강했습니다.

## 에이전트 주의사항

- lease/presence는 단일 backend 인스턴스용 인메모리 구현입니다.
- WebSocket 재접속 시 세션별 undo/redo availability는 초기화되며 최신 itinerary snapshot을 다시 조회합니다.
- refresh token까지 만료된 경우 기존 인증 오류 처리에 따라 로그인 화면으로 이동하며 협업 연결은 시작하지 않습니다.

## develop 통합 시 반영할 내용

- frontend/backend submodule commit과 orchestration pointer를 함께 갱신합니다.
- 통합 후 branch ledger 인덱스를 재생성합니다.
