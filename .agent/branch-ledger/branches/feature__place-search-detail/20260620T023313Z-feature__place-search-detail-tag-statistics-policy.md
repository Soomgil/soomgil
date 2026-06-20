---
id: 20260620T023313Z-feature__place-search-detail-tag-statistics-policy
branch: feature/place-search-detail
branchKey: feature__place-search-detail
createdAt: 2026-06-20T02:33:13.044Z
baseRef: develop
scope: preference
status: ready
---

# 태그 좋아요 통계 정책

## 배경

- 태그가 얼마나 좋아요를 받는지와 호불호가 얼마나 갈리는지를 분리해 저장한다.
- 반복 클릭으로 통계가 왜곡되지 않도록 이벤트 전체가 아니라 사용자-장소별 최종 반응을 사용한다.

## 변경 요약

- `LIKE`, `SUPER_LIKE`는 positive, `NOPE`는 negative로 집계한다.
- 보정 좋아요율은 `(태그 positive 수 + alpha * 전체 positive 비율) / (태그 반응 수 + alpha)`로 계산한다.
- 반응 균형은 `4 * 보정 좋아요율 * (1 - 보정 좋아요율)`로 계산한다.
- 표본 신뢰도는 `태그 반응 수 / (태그 반응 수 + alpha)`로 계산한다.
- `preference_discrimination`은 `반응 균형 * 표본 신뢰도`로 저장한다.
- 통계 run은 `REAL_USER`, `SUCCEEDED`, `is_serving=true`로 승격하며 serving run은 하나만 허용한다.
- backend migration은 develop 통합 후 `V18__create_tag_statistic_tables.sql`이다.
- 한 장소의 태그 근거는 `confidence * weight` 비율로 나누고 합계를 정확히 1로 맞춘다.
- 최종 `LIKE`, `SUPER_LIKE`는 positive evidence, `NOPE`는 negative evidence에 반영한다.
- 반응 변경 시 이전 장소 근거를 제거한 뒤 새 최종 반응 근거만 적용한다.
- 사용자 태그 사전 강도는 `(1 - preference_discrimination) / preference_discrimination`이다.
- 사용자 태그 선호도는 `(사전 강도 * 보정 좋아요율 + positive evidence) / (사전 강도 + positive evidence + negative evidence)`다.
- 사용자 근거 migration은 develop 통합 후 `V19__create_user_preference_tag_weights.sql`이다.
- 멤버별 장소 점수는 `사용자 태그 선호도 * 장소 내 정규화 태그 근거`의 가중합이다.
- 그룹 추천 점수는 active trip member의 멤버별 장소 점수를 합산한다.
- matched member는 멤버 점수가 중립 `0.5`보다 `0.15` 이상 높은 `0.65`부터다.
- `SUPER_LIKE` 장소 우선순위는 기본 추천 점수에 더하지 않고 별도 tab에서 처리한다.
- `GET /api/v1/trips/{tripId}/place-recommendations`는 active trip member에게만 제공한다.
- 기본 추천은 필수 `bbox` 안의 장소를 그룹 점수 내림차순으로 정렬하고 거리는 동점 처리에만 사용한다.
- `SUPER_LIKE` tab은 active member의 최종 SUPER_LIKE 수를 우선하고 그룹 태그 점수를 동점 처리에 사용한다.
- 추천 응답은 matched member의 id, display name, profile image만 반환하고 내부 점수는 노출하지 않는다.
- 실제 PostgreSQL 통합 테스트까지 통과한 backend 구현 commit은 `d61411d`다.
- 합성 페르소나 catalog는 generator version마다 정확히 50명이어야 한다.
- 페르소나 key 중복, hard like/dislike 태그 충돌, `0.05` 초과 noise rate는 생성 전에 거부한다.
- 합성 페르소나 catalog 검증 backend commit은 `d632c4e`다.
- 합성 반응 threshold는 `SUPER_LIKE >= 1.20`, `LIKE >= 0.35`, `NOPE <= -0.35`다.
- hard like는 최소 LIKE를 보장하고 hard dislike는 항상 NOPE다.
- 중립 구간은 persona, provider, place, seed의 SHA-256으로 결정해 재실행 결과를 고정한다.
- 합성 페르소나 결정적 반응 생성 backend commit은 `01322b2`다.
- 합성 장소 점수의 hard 성향 강도는 `±1.50`, soft 성향 강도는 `±0.60`이다.
- 기본 catalog는 10개 여행 성향의 5개 고정 variant로 정확히 50명을 제공한다.
- soft 잡음은 persona/place/seed SHA-256을 사용해 최대 `0.05`만 적용하며 hard 성향은 변경하지 않는다.
- 합성 persona, tag preference, swipe event 테이블은 `V20__create_synthetic_persona_tables.sql`에서 생성한다.
- 같은 generator version, persona, place, seed의 합성 이벤트는 upsert해 재실행 시 중복되지 않는다.
- 합성 통계는 활성 persona가 정확히 50명이고 모든 persona에 이벤트가 있을 때만 serving 승격할 수 있다.
- `SYNTHETIC_PERSONA`와 `REAL_USER` 반응은 별도 집계 query를 사용하며 한 run에서 섞지 않는다.
- 합성 점수/catalog commit은 `0557055`, 이벤트 저장 commit은 `0a71bcc`, source 분리 commit은 `eae3d07`다.
- REAL_USER 자동 serving 전환은 최종 반응 총 `10,000`건 이상과 모든 활성·선택 가능 태그별 `100`건 이상을 함께 요구한다.
- 표본 기준 미달 전환은 검증된 offline evaluation에 대한 명시적 운영자 승인일 때만 허용한다.
- REAL_USER serving 전환 gate backend commit은 `2ada369`다.
- 서버 태그 selector는 `confidence * 0.50 + weight * 0.30 + preference_discrimination * 0.20`으로 정렬한다.
- confidence `0.55` 미만, 비활성/사전 밖 태그, 중복 태그를 거부하고 장소당 최대 10개만 확정한다.
- 확정 태그에는 serving run의 discrimination과 run ID, selection score를 snapshot으로 저장한다.
- 합성 통계 serving은 모든 활성·선택 가능 태그가 최소 50개 합성 반응을 가져야 한다.
- offline 품질 평가는 Precision@K, Recall@K, NDCG@K, HitRate@K, SUPER_LIKE HitRate@K를 계산한다.
- uplift는 동일 dataset/K의 실제 baseline metric이 0보다 클 때만 퍼센트로 계산한다.
- 추천 정책값은 `soomgil.preference` configuration properties로 운영 override할 수 있다.
- SUPER_LIKE 동률은 count, 그룹 태그 점수, 최신 반응 시각, 거리 순으로 정렬한다.
- 전역 스와이프/저장 계약으로 대체된 trip-scoped 미구현 endpoint는 제거했다.
- 서버 selector commit은 `f517f7d`, 합성 tag coverage gate는 `09c6f2a`, 품질 평가는 `1fe70b2`다.
- 정책 설정/정렬 commit은 `4f368c2`, obsolete endpoint 제거 commit은 `014a5d4`다.
- `AI_ONLY_DEFAULT`도 활성·선택 가능 태그 전체에 좋아요율 `0.5`, 호불호 `0.5`를 기록하는 감사 가능한 serving run으로 생성한다.
- 통계 source는 `AI_ONLY_DEFAULT -> SYNTHETIC_PERSONA -> REAL_USER` 순서로만 승격하며 상위 source를 하위 source로 되돌리지 않는다.
- 통계 source 단방향 전환 backend commit은 `a6a4978`다.
- media는 `POST /media/upload-urls -> object storage 직접 PUT -> POST /media/files` 순서로 등록한다.
- 업로드 목적별 MIME/크기 제한, 사용자 소유 object key, 저장소 HEAD와 magic bytes/이미지 크기 교차 검증을 적용한다.
- private 여행 기록은 public URL을 노출하지 않고, 삭제는 `DELETED` 전환 후 7일 뒤 object purge를 예약한다.
- media object key uniqueness migration은 `V21`, 정책 commit은 `c3da3a9`, 수직 API/S3/DB 구현 commit은 `2f7f6f9`다.
- PUBLIC 프로필 follow는 즉시 `ACTIVE`, PRIVATE 프로필 follow는 `PENDING`이며 self-follow는 거부한다.
- follow 요청 목록/승인/거절과 unfollow를 구현하고 삭제 관계는 `DELETED`로 보존한다.
- social follow migration은 `V22`, 수직 CRUD 구현 commit은 `1bbf6c6`다.
- 민경철 소유 TODO의 구현과 테스트 대조를 완료했으며 담당 모듈에는 미구현 endpoint가 남아 있지 않다.
- 2026-06-21 최종 감사에서 민경철 TODO 15개별 전용 테스트와 전체 backend 315개 테스트가 모두 통과했다.
- `common/cqrs`, `place`, `tourismsource`, `preference`, `social`, `media`, `global/storage`의 미구현/TODO/FIXME 검색 결과는 0개다.

## 에이전트 주의사항

- `smoothed_positive_rate`는 태그가 얼마나 좋아요를 받는지 나타낸다.
- `preference_discrimination`은 좋아함의 방향이 아니라 충분한 표본에서 호불호가 갈리는 정도다.
- `user_swipe_events`는 감사와 projection 재생성용으로 유지하되 통계 투표 수에는 중복 반영하지 않는다.
- `alpha=100`은 실제 태그 반응 100개와 전체 평균 사전값을 50:50으로 반영한다는 뜻이며 운영 config로 조정해야 한다.
- 호불호 점수가 0이면 보정 좋아요율을 유지하고, 1이면 개인 근거만 사용한다.
- 개인 근거가 없으면 호불호와 관계없이 보정 좋아요율을 반환한다.
- `SUPER_LIKE`는 V1 근거량을 임의로 2배 하지 않고 별도 count로 보존한다.
- 점수 계산 version은 `preference-score-odds-v1`이다.
- serving 태그 통계가 바뀌면 기존 사용자 projection 전체를 재생성해야 한다.
- 장소 태그 근거 합이 1이 아니면 추천 점수 계산을 거부한다.
- 다른 멤버의 세부 preference score는 응답에 노출하지 않고 matched member 요약만 반환한다.

## develop 통합 시 반영할 내용

- `.agent/docs/exec-plans/active/2026-06-15-recommendation-weight-plan.md`의 기존 distance 기반 공식을 새 공식으로 교체한다.
- `.agent/docs/product-specs/preference_tagging_policy.md`에 최종 반응 기반 통계와 좋아요율/호불호 분리를 반영한다.
- 통합 후 branch ledger index를 재생성한다.
