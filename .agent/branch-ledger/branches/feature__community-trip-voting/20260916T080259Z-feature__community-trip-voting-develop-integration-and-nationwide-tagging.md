---
id: 20260916T080259Z-feature__community-trip-voting-develop-integration-and-nationwide-tagging
branch: feature/community-trip-voting
branchKey: feature__community-trip-voting
createdAt: 2026-09-16T08:02:59.000Z
baseRef: develop
scope: shared
status: draft
---
# develop integration and nationwide tagging

## 배경

- 팀이 이 브랜치의 이전 커밋(투표 지역 선택·후보 개수·모달 투표)을 `develop`에 머지하고 그 위에 여행 카드 그리드,
  새 여행 만들기 초기 설정 통합, 경로 이동수단(도보/자전거/운전)을 올렸다. 이 브랜치에는 "생성 직후 지도 위 투표 설정 모달 +
  스티커 에셋" 커밋 하나만 develop에 없었다.
- 장소 취향 태그는 제주(`area_code=39`, 2,335곳)만 `backend/tools/jeju-tagging`으로 뽑혀 있었다. 전국을 세 사람이 나눠 돌릴
  방법이 필요했다.

## 변경 요약

### frontend (rebase onto develop)
- `MyTripsPage.vue` 충돌 해결: develop의 `intent`(route/ai) 분기를 유지하면서, 경로/AI를 고르지 않은 기본 생성은
  `Route?voteSetup=1`로 보내 지도 위에 투표 설정 모달을 띄운다(TripVote 페이지 강제 이동 제거). `route` intent는 그대로 지도,
  `ai` intent는 `panel=ai`.
- develop 테스트 두 곳(생성 후 `TripVote` push 기대) → 새 흐름으로 수정. 초기 설정 통합으로 기간이 필수가 되어 내 테스트에 날짜 입력 추가.
- 결과: vitest 58파일 415개 통과, `npm run build` 통과.

### backend
- develop을 fast-forward(이 브랜치 커밋은 모두 develop에 포함, V48/V49 번호 유지, develop의 V50 추가).
- `tools/place-tagging/` 신규: 전국 장소를 시도 단위로 장소 수가 비슷한 A/B/C 세 파트로 결정적으로 나눠(제주 제외),
  jeju-tagging의 프롬프트·모델(`gpt-5.5`)·선정 정책·SQL 형식을 그대로 재사용한다. 묶음(10곳)마다 저장해 끊겨도 이어서 하고,
  429/quota 응답은 키 교대(`GMS_API_KEY`, `GMS_API_KEY_2`…) → 전부 소진 시 KST 자정까지 자동 대기. 키별 오늘 요청 수는
  해시로 `output/quota_state.json`에 기록하고, `GMS_DAILY_REQUEST_LIMIT`을 알면 그 전에 스스로 키를 바꾼다.
  실행기 `run-A/B/C.bat`·`.command`, 단위 테스트 10개.

## 결정과 이유
- **생성 직후 기본 목적지는 지도+투표 설정 모달**: 사용자가 "지금 바로 투표를 안 만들 수도 있다"고 했으므로 강제 이동 대신
  닫을 수 있는 모달. develop이 만든 `intent` 선택은 존중해 route/ai를 고른 경우에는 모달을 띄우지 않는다.
- **GMS 하루 한도를 가정하지 않음**: 공개 수치가 없어 응답(429/quota)으로 판단하고, 확인된 값은 env로 주입한다.
- **파트를 지역 단위로 크게**: 3명이 서로 겹치지 않고, 같은 덤프면 누가 계산해도 같은 분배가 나오게 결정적 greedy.

## 검증
- frontend: `npx vitest run` 415 passed, `npm run build` OK. root: `harness:index`, `harness:check` 통과.
- backend tools: `python -m unittest test_place_tagging.py` 10 OK, `test_jeju_tagging.py` OK. 덤프 없는 환경에서 `[설정 문제]` 메시지 확인.

### 라이브 확인 후 고친 것
- 머지된 UI에서 생성 → 지도+투표 설정 모달 → 나중에 → 투표 시작 → 스티커 → 닫기(빨간 경고) 흐름을 Playwright로 재확인.
- 버그: 초기 설정 통합이 기간을 일정 DAY 그룹으로 저장해 설정 모달이 항상 "2일로 가정"이었다 → 여행 상세에 날짜가 없으면
  일정 DAY 그룹으로 일수를 센다(`TripVoteFlow.countItineraryDays`). 4일 여행 → 선정 12곳 확인.

## 남은 일
- 실제 덤프로 `plan` 실행해 A/B/C 장소 수 확인(이 컴퓨터에는 덤프가 없음).
