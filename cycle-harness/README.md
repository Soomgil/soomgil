# 단기 사이클 하네스 (2026-08-31 준비 → 이후 실행)

가입→여행생성→투표→일정초안 강제 유저 플로우 구현을 위한 **1회성 작업 하네스**다.
`.agent/` 장기 하네스와 별개이며, 이 폴더만 들고 다른 컴퓨터에서 이어서 작업할 수 있다.

## 사용법 (다음 세션의 Claude에게)

1. **이 README와 `CONTEXT.md`를 먼저 읽는다.** 환경·계정·검증된 사실이 다 있다.
2. 사용자가 `QUESTIONS.md`에 답을 적어온다. 답을 읽고 브리프의 해당 결정을 채운다.
3. 사용자가 "B2 해" / "온보딩 작업 해" 라고 하면 `INDEX.md`에서 해당 브리프의
   **읽기 목록만** 읽고 바로 구현한다. 탐색성 grep을 다시 하지 말 것 — 경로·라인·패턴이 브리프에 있다.
4. `data/`의 JSON은 실제 API/DB에서 뽑은 실측값이다. 다시 조사하지 말고 그대로 쓴다.

## 폴더 구성

| 파일 | 내용 |
| :--- | :--- |
| `CONTEXT.md` | 환경, 실행 명령, 테스트 계정, 검증된 사실, 미커밋 변경분 |
| `QUESTIONS.md` | 사용자가 답해야 하는 결정 (체크박스) |
| `INDEX.md` | 작업 ID → 읽을 파일 최소 목록 |
| `briefs/B0~B7` | 작업 묶음별 상세 브리프 (경로/패턴/스켈레톤/완료 기준) |
| `data/award-photos.json` | 수상작 95건 원본 스냅샷 (2026-08-31 실측) |
| `data/award-place-matches.json` | 수상작→KTO 관광지 매칭 95건 전수 결과 |
| `data/usable-award-place-pairs.json` | 사용 가능한 매칭 73쌍 (exact/enriched 플래그) |
| `data/area-bboxes.json` | KTO 지역코드 17개 전부의 실측 bbox + 법정동 시도코드 매핑 |
| `data/onboarding-candidates.md` | 온보딩 10선 제안 |

## 작업 순서 (의존 관계)

```
B0 블로커 ──┬─→ B4 투표 ─→ B5 초안 생성
            └─→ B3 여행 마법사
B1 수상작 파이프라인 ─→ B2 온보딩, B3 마법사(목적지 미정 분기), B7 홈/랜딩
B6 탭 정리 (독립, 아무 때나)
```

권장: B0 → B1 → B2 → B6 → B3 → B4 → B5 → B7

## 마이그레이션 번호 예약 (충돌 방지)

| 번호 | 용도 | 브리프 |
| :--- | :--- | :--- |
| V44 | `trip.trips.stage` 준비 단계 컬럼 | B0 |
| V45 | `auth.users.onboarding_completed_at` | B2 |
| V46 | 수상작 매칭 시드 (선택 — Q4 결정에 따라) | B1 |
| V47 | `vote` 스키마 (세션/후보/투표/진행) | B4 |
| V48 | `preference.user_award_photo_likes` | B7 |

## 브랜치

1차 히어로 구현 + 이 폴더는 세 repo 모두 `feature/award-photo-hero` 브랜치로 푸시돼 있다 (develop 미머지).
후속 작업은 이 브랜치에서 이어가거나, PR 머지 후 `feature/guided-trip-flow`로 새로 분기한다.
