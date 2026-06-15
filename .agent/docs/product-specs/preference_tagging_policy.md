# Preference Tagging Policy

이 문서는 장소 태그, 스와이프 기반 선호도, 추천 점수, 50개 페르소나 기반 초기 스와이프 데이터 생성 정책을 정의한다.

이 정책은 선호도/추천 도메인 개발 전 반드시 읽어야 한다. 구현자는 사용자에게 이 흐름을 설명하고, 테스트를 먼저 작성한 뒤 구현한다.

## 목표

숨길의 추천은 사용자가 평소 스와이프한 장소 반응을 기반으로 취향을 학습해야 한다.

초기에는 실제 사용자 반응이 없으므로 모델 기반 태깅과 페르소나 기반 합성 스와이프 데이터로 cold-start를 해결한다. 이후 실제 사용자 반응이 충분히 쌓이면 초기 합성 통계와 모델 기본값은 추천 serving 경로에서 제거하고, 실제 반응 기반 통계로 재계산한다.

최종 설명 목표는 다음과 같다.

```text
초기 cold-start에서는 모델이 추출한 태그의 confidence/weight와 50개 고정 페르소나 스와이프 데이터를 사용했다.
사용자 반응 데이터가 충분히 확보된 뒤 preference_discrimination을 실제 스와이프 로그에서 재계산했다.
이후 추천 정확도는 baseline 대비 uplift %로 측정했다.
```

uplift 숫자는 실제 오프라인 평가 또는 A/B 결과가 있을 때만 기록한다. 임의 숫자를 문서나 발표에 넣지 않는다.

## 핵심 값

추천 태그는 세 값만 중심으로 사용한다.

| 값 | 의미 | 책임 |
| :--- | :--- | :--- |
| `confidence` | 이 장소에 이 태그가 맞는 정도 | 모델 태깅/enrichment 결과 |
| `weight` | 이 장소에서 이 태그가 얼마나 중심적인지 | 모델 태깅/enrichment 결과 |
| `preference_discrimination` | 이 태그가 사용자 취향을 얼마나 잘 가르는지 | 스와이프 반응 통계 |

`rarity`, `semantic_specificity`, tree depth 기반 점수는 MVP 추천 점수의 필수 입력으로 사용하지 않는다.

태그 사전은 아래의 고정 whitelist만 사용한다. 모델이 whitelist 밖의 태그를 출력하면 확정 태그로 저장하지 않는다.

## 고정 태그 사전

태깅은 아래 코드 안에서만 이루어진다. 일단 추가와 삭제는 하지 않는다.

상위 그룹도 고정이다.

```text
nature_scene 자연/경관
nature: 자연
park: 공원
arboretum: 수목원
garden: 정원
forest: 숲
mountain: 산
coast: 바다/해안
island: 섬
lake_pond: 연못/호수
waterfront: 수변경관
valley_stream: 계곡
waterfall: 폭포
flower_plant: 꽃/식물
scenic_view: 풍경좋은
rural_landscape: 농촌풍경
fishing_village: 어촌/포구
night_view: 야경
sunset: 노을
stargazing: 별보기
autumn_foliage: 단풍
snow_scene: 설경

history_culture 역사/문화
history: 역사
traditional: 전통적인
traditional_architecture: 전통건축
palace_fortress: 궁궐/성곽
temple_shrine: 사찰/종교공간
heritage_site: 문화유산
local_culture: 지역문화
museum: 박물관
gallery_exhibition: 전시/미술
science_education: 과학/교육
cultural_space: 문화공간
performance_venue: 공연공간
architecture: 건축
industrial_heritage: 산업유산/재생공간

activity 활동
walking: 산책
hiking: 등산
cycling: 자전거
photo_spot: 사진명소
viewing: 관람
hands_on_experience: 체험
learning: 학습
performance_viewing: 공연관람
picnic: 피크닉
leisure_activity: 레저활동
water_activity: 수상활동
camping: 캠핑
hot_spring: 온천
animal_viewing: 동물관람
rides: 놀이기구
festival: 축제
bookshop: 서점

mood 분위기
healing: 힐링
quiet: 조용한
lively: 활기찬
romantic: 로맨틱
educational: 교육적인
active: 활동적인
unique: 이색적인
nostalgic: 레트로/향수
artistic: 예술적인
open_feeling: 개방감
modern: 현대적인
futuristic: 미래적인

space_context 공간/환경
outdoor: 야외
indoor: 실내
urban: 도심
nature_escape: 도심속자연
landmark: 랜드마크
theme_park: 테마파크
observatory: 전망공간
street_alley: 거리/골목
```

태그 검증 규칙:

- `preference.preference_tags` seed 데이터는 위 목록과 1:1로 맞춘다.
- 장소 태깅 결과는 위 `tag_code`만 허용한다.
- whitelist 밖 후보는 `place_tag_enrichment_tags`의 확정 태그로 저장하지 않는다.
- 후보 전체 보존 테이블을 만들 경우 whitelist 밖 후보는 `REJECTED_OUT_OF_DICTIONARY` 상태로만 남길 수 있다.
- 동의 없이 새 태그를 추가하거나 기존 태그를 삭제하지 않는다.

트리나 parent 관계는 점수 계산의 주 입력이 아니라 다음 용도로만 사용한다.

- 중복 제거
- 부모/자식 태그 정리
- UI 그룹핑
- 검색/필터 확장

## 데이터 책임

현재 DBML 이름을 기준으로 책임을 둔다. 실제 구현 전 필요한 필드는 migration으로 반영한다.

| 저장소 | 책임 |
| :--- | :--- |
| `tourism_source.sidos`, `tourism_source.guguns`, `tourism_source.contenttypes`, `tourism_source.attractions` | 태그 추출에 사용하는 관광지 원천 DB. 서비스 production 장소 마스터와 분리한다. |
| `tourism_source.attraction_images` | 관광지별 일반 이미지 후보를 저장한다. 콘텐츠랩 수상작 사진과 섞어 보여줄 때 기본 4장 후보로 사용한다. |
| `tourism_source.contest_award_photos`, `tourism_source.contest_award_photo_matches` | 콘텐츠랩 공모전 수상작 사진 metadata와 관광지/지역 매칭 후보를 저장한다. 태그 추출/추천 display 후보로 사용할 수 있다. |
| `preference.preference_tags` | 고정 태그 사전. 위 whitelist의 `code`, `display_name`, group, parent 관계, 활성 여부를 관리한다. |
| `preference.place_tag_enrichments` | 장소 태깅 실행 기록. provider/place/model/prompt/dictionary version/status를 기록한다. |
| `preference.place_tag_enrichment_candidates` | 모델이 출력한 후보 전체를 저장한다. whitelist 밖 후보는 `REJECTED_OUT_OF_DICTIONARY`로 남긴다. |
| `preference.place_tag_enrichment_tags` | whitelist 안에서 확정된 serving 태그와 `confidence`, `weight`, 선택 당시 `preference_discrimination` snapshot을 저장한다. |
| `preference.tag_statistic_runs` | `AI_ONLY_DEFAULT`, `SYNTHETIC_PERSONA`, `REAL_USER` 통계 계산 run과 serving 여부를 기록한다. |
| `preference.tag_statistics` | 태그별 `preference_discrimination`, smoothing 결과, sample count를 저장한다. |
| `preference.synthetic_personas` | 50개 고정 페르소나 정의를 저장한다. |
| `preference.synthetic_persona_tag_preferences` | 각 페르소나가 어떤 태그를 hard/soft like/dislike하는지 저장한다. |
| `preference.synthetic_swipe_events` | 페르소나 기반 cold-start 합성 스와이프 이벤트를 실제 사용자 이벤트와 분리해 저장한다. |
| `preference.user_swipe_events` | 모든 스와이프 이벤트 원본 로그. 통계 재계산의 기준이다. |
| `preference.user_place_reactions` | 사용자-장소 최종 반응 상태. 빠른 조회와 중복 반응 처리에 사용한다. |
| `preference.user_preference_tag_weights` | 사용자별 현재 태그 선호도 projection. 추천 API는 이 projection을 읽는다. |

원본 실행 로그와 후보 태그는 감사/재계산을 위해 보관한다. 다만 cold-start용 합성 통계와 모델 기본값은 실제 사용자 통계가 안정화되면 추천 serving 경로에서 제외한다.

태그 사전 seed 검증은 필수다. seed에 whitelist 밖 코드가 있거나 whitelist 코드가 빠지면 backend test 또는 harness check가 실패해야 한다.

## preference_discrimination 계산

`preference_discrimination`은 태그가 실제 사용자 취향을 얼마나 잘 구분하는지 나타낸다.

이 값은 태그가 드문지를 보는 값이 아니다. 태그가 붙은 장소에서 긍정 반응률이 전체 평균과 얼마나 다르게 나타나는지를 본다.

긍정 반응은 다음과 같이 정의한다.

```text
positive = LIKE 또는 SUPER_LIKE
negative = NOPE
```

전체 긍정 반응률:

```text
global_positive_rate =
전체 positive 이벤트 수 / 전체 스와이프 이벤트 수
```

태그별 긍정 반응률은 표본이 적을 때 과대평가되지 않도록 Bayesian smoothing을 적용한다.

```text
smoothed_tag_positive_rate =
(tag_positive_count + alpha * global_positive_rate)
/
(tag_reaction_count + alpha)
```

초기 `alpha` 기본값은 `100`으로 둔다. 실험 결과에 따라 조정할 수 있지만, 조정 이유와 전후 metric을 기록해야 한다.

전체 평균과 얼마나 다른지 계산한다.

```text
distance =
abs(smoothed_tag_positive_rate - global_positive_rate)
```

0~1 범위로 정규화한다.

```text
preference_discrimination =
distance / max(global_positive_rate, 1 - global_positive_rate)
```

해석:

```text
0에 가까움:
이 태그가 붙어도 반응이 전체 평균과 거의 같다.
취향을 잘 가르지 못한다.

1에 가까움:
이 태그가 붙으면 반응이 전체 평균과 크게 달라진다.
취향을 잘 가른다.
```

중요한 점은 이 값이 "좋아하는 태그"를 의미하지 않는다는 것이다. 평균보다 훨씬 싫어하는 태그도 취향을 잘 가르는 태그다. 좋아함/싫어함의 방향은 사용자별 `user_preference_tag_weights.raw_score`가 표현한다.

## cold-start 정책

초기에는 실제 사용자 반응이 없으므로 단계별 source를 명확히 구분한다.

| 단계 | source | 사용 방식 |
| :--- | :--- | :--- |
| 1 | `AI_ONLY_DEFAULT` | 태그별 `preference_discrimination`을 중립값 `0.5`로 둔다. |
| 2 | `SYNTHETIC_PERSONA` | 50개 고정 페르소나가 생성한 스와이프 이벤트로 통계를 계산한다. |
| 3 | `REAL_USER` | 실제 사용자 스와이프 이벤트로 통계를 재계산한다. |

실제 사용자 데이터가 충분히 쌓이면 `AI_ONLY_DEFAULT`와 `SYNTHETIC_PERSONA` 통계는 추천 serving 경로에서 제거한다. 원본 로그는 검증과 재현을 위해 보관할 수 있지만, 운영 추천 점수에는 사용하지 않는다.

`REAL_USER` 전환 기준은 구현 전에 테스트 가능한 값으로 고정한다. 초기 후보는 다음과 같다.

```text
전체 실제 스와이프 이벤트 수 >= 10,000
각 핵심 태그별 실제 반응 수 >= 100
또는 서비스 운영자가 승인한 offline evaluation 통과
```

## 태그 선택 점수

모델이 후보 태그를 여러 개 뽑으면 서버 selector가 확정 태그를 선택한다.

확정 태그 선택 점수:

```text
selection_score =
confidence * 0.50
+ weight * 0.30
+ preference_discrimination * 0.20
```

cold-start 1단계에서는 `preference_discrimination = 0.5`를 사용한다.

cold-start 2단계에서는 50개 페르소나 합성 이벤트에서 계산한 값을 사용한다.

cold-start 3단계 이후에는 실제 사용자 이벤트에서 계산한 값을 사용한다.

장소별 확정 태그 수는 너무 많아지면 모든 장소가 비슷해지므로 제한한다.

```text
확정 태그: 최대 10개
핵심 태그: 상위 3~4개
보조 태그: 나머지 6~7개
```

`confidence`가 낮은 태그는 `preference_discrimination`이 높아도 확정하지 않는다. 즉, 취향을 잘 가르는 태그라도 그 장소에 맞지 않으면 탈락한다.

## 사용자 선호도 누적

사용자가 스와이프하면 해당 장소의 확정 태그만 사용자 선호도에 반영한다.

초기 reaction weight:

```text
SUPER_LIKE = +2.0
LIKE = +1.0
NOPE = -1.0
```

태그별 delta:

```text
tag_importance =
0.7 + 0.3 * preference_discrimination

user_tag_delta =
reaction_weight
* confidence
* weight
* tag_importance
```

`raw_score`는 누적하고, 추천에는 제한된 `normalized_score`를 사용한다.

```text
normalized_score =
tanh(raw_score / scale)
```

`scale`은 운영 튜닝값이다. 변경 시 이전/이후 추천 metric을 기록한다.

## 추천 점수

후보 장소 추천 점수는 사용자 선호도와 장소 확정 태그의 일치도를 합산한다.

```text
recommendation_score =
sum(
  user_preference_tag_weights.normalized_score
  * place_tag.confidence
  * place_tag.weight
  * (0.7 + 0.3 * preference_discrimination)
)
```

그룹 여행방 추천에서는 멤버별 점수를 합산하되, 활동량이 많은 한 명이 전체 추천을 지배하지 않도록 사용자별 normalized score를 사용한다.

다른 멤버의 raw score, normalized score, 세부 태그 가중치는 API와 UI에 노출하지 않는다. 추천 카드에는 matched member avatar 수준만 노출한다.

## 50개 페르소나 스와이프 데이터 정책

초기 스와이프 데이터는 반드시 50개 고정 페르소나를 기반으로 생성한다.

각 페르소나는 다음 필드를 가진다.

```text
persona_id
display_name
description
hard_like_tags
hard_dislike_tags
soft_like_tags
soft_dislike_tags
neutral_tags
reaction_thresholds
noise_rate
seed
```

페르소나 생성 규칙:

- 페르소나는 정확히 50개여야 한다.
- 각 페르소나는 서로 다른 취향 축을 가져야 한다.
- `hard_like_tags`와 `hard_dislike_tags`는 절대 위반하지 않는다.
- `soft_*` 취향에는 작은 noise를 허용할 수 있지만 `noise_rate <= 0.05`로 제한한다.
- 같은 `persona_id`, place, seed 조합은 항상 같은 반응을 생성해야 한다.
- 생성된 모든 합성 이벤트에는 `persona_id`, `source=SYNTHETIC_PERSONA`, generator version을 남긴다.

페르소나 반응 생성 기본식:

```text
persona_place_score =
sum(
  persona_tag_preference[tag_code]
  * place_tag.confidence
  * place_tag.weight
)
```

초기 threshold 후보:

```text
persona_place_score >= 1.20 -> SUPER_LIKE
persona_place_score >= 0.35 -> LIKE
persona_place_score <= -0.35 -> NOPE
그 외 -> 페르소나별 neutral 정책에 따라 LIKE 또는 NOPE를 결정
```

합성 데이터 품질 검사는 필수다.

```text
페르소나 수 = 50
hard_like/hard_dislike 위반 = 0
각 페르소나 최소 스와이프 수 충족
각 핵심 태그 최소 반응 수 충족
같은 seed 재실행 결과 동일
```

위 조건을 만족하지 못하면 합성 스와이프 데이터를 통계 계산에 사용하지 않는다.

## 정확도 상승 측정

추천 정확도 상승률은 반드시 baseline과 비교해 계산한다.

초기 baseline:

```text
confidence + weight 기반 추천
```

개선 모델:

```text
confidence + weight + preference_discrimination 기반 추천
```

평가 metric 후보:

```text
Precision@K
Recall@K
NDCG@K
HitRate@K
SUPER_LIKE HitRate@K
```

uplift 계산:

```text
uplift_percent =
(new_metric - baseline_metric) / baseline_metric * 100
```

서비스 설명이나 발표에서는 실제 측정된 metric과 데이터 source를 함께 말한다.

```text
나쁜 표현:
추천 정확도가 올랐다.

좋은 표현:
페르소나 cold-start baseline 대비 NDCG@10이 X% 상승했다.
실제 사용자 전환 후 Precision@10이 Y% 상승했다.
```

## 구현 전 필수 테스트

추천/태깅 구현 전 다음 테스트 계획을 사용자에게 설명하고 먼저 작성한다.

- `preference_discrimination` smoothing 계산 테스트
- 표본 수가 작은 태그가 과대평가되지 않는 테스트
- `confidence`가 낮은 태그는 확정 태그에서 탈락하는 테스트
- 50개 페르소나 수와 hard constraint 검증 테스트
- 같은 seed에서 합성 스와이프가 재현되는 테스트
- `SYNTHETIC_PERSONA` 통계와 `REAL_USER` 통계가 serving 경로에서 섞이지 않는 테스트
- baseline 대비 uplift 계산 테스트

## 금지사항

- 런타임 추천 API에서 모델을 매번 호출하지 않는다.
- `rarity` 하나로 태그 중요도를 결정하지 않는다.
- 페르소나 정의를 무시한 무작위 스와이프 데이터를 만들지 않는다.
- 합성 데이터와 실제 사용자 데이터를 source 구분 없이 섞지 않는다.
- 검증되지 않은 정확도 상승률을 문서나 발표에 쓰지 않는다.
