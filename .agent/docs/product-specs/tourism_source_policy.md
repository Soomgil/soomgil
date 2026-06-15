# Tourism Source Policy

이 문서는 관광지 원천 DB, 한국관광공사 콘텐츠랩 공모전 수상작 사진, S3 저장, 관광지 매칭, 이미지 노출 정책을 정의한다.

이 정책의 핵심은 서비스 production 데이터와 태그 추출용 원천 데이터를 섞지 않는 것이다. 관광지 원천 데이터는 추천과 태그 추출을 돕는 enrichment 데이터이며, 사용자 여행/커뮤니티/업로드 미디어의 소유권 정책과 분리한다.

## 원칙

- `tourism_source.*`는 서비스 production 장소 마스터가 아니다.
- 서비스 도메인은 장소를 `provider + external_place_id`로 참조한다.
- 관광지 상세 원천 데이터는 태그 추출, 원천 검색, 이미지 후보 생성, 공모전 사진 매칭에만 사용한다.
- `tourism_source.*`는 배포 시 production 서비스 DB와 물리적으로 다른 DB로 둘 수 있다.
- DBML에서는 전체 계약을 한눈에 보기 위해 같은 파일 안에 `tourism_source` namespace로 표현한다.
- 사용자 업로드 미디어, 여행 기록 미디어, 커뮤니티 게시글 미디어와 관광공사/공모전 원천 이미지는 같은 소유권 모델로 취급하지 않는다.

## 원천 관광지 데이터

SSAFY/KTO 스타일 원천 테이블은 `tourism_source`에 보관한다.

| 테이블 | 책임 |
| :--- | :--- |
| `tourism_source.sidos` | 시도 코드와 이름 원천 데이터 |
| `tourism_source.guguns` | 시도 하위 구군 코드와 이름 원천 데이터 |
| `tourism_source.contenttypes` | 관광공사 콘텐츠 타입 사전 |
| `tourism_source.attractions` | 관광지 원천 상세 데이터 |
| `tourism_source.attraction_images` | 일반 관광지 이미지 후보 |

`tourism_source.attractions.content_id`가 있으면 서비스의 `external_place_id` 후보로 사용한다. 단, 이 값이 있다고 해서 production 서비스 schema에 관광지 마스터 row를 복제하지 않는다.

일반 관광지 이미지는 `first_image1`, `first_image2`, 상세 이미지, 수동 보정 이미지 등을 `tourism_source.attraction_images`로 정규화한다. 노출 후보는 `is_active = true`인 이미지로 제한하고, 기본 정렬은 `display_order ASC`, `created_at ASC`를 따른다.

## 콘텐츠랩 수상작 사진

한국관광공사 콘텐츠랩 공모전 수상작 사진은 source metadata와 실제 파일을 분리해 관리한다.

| 저장 위치 | 책임 |
| :--- | :--- |
| S3 호환 object storage | 실제 이미지 바이너리 |
| `tourism_source.photo_contests` | 공모전 회차, 연도, 출처 |
| `tourism_source.contest_award_photos` | 수상작 사진 metadata와 S3 object key |
| `tourism_source.region_aliases` | 파일명/지역명 매칭용 alias 사전 |
| `tourism_source.contest_award_photo_matches` | 사진과 관광지 또는 지역의 매칭 후보/확정 상태 |

repository에는 공모전 사진 바이너리를 commit하지 않는다. repository에는 import manifest, S3 object metadata manifest, matching rule만 둔다.

`contest_award_photos.upload_status`는 다음 의미로 사용한다.

| 값 | 의미 |
| :--- | :--- |
| `DOWNLOADED` | 로컬에 파일은 있으나 S3 업로드 또는 검증 전 |
| `UPLOADED` | S3 업로드와 metadata 저장이 완료됨 |
| `FAILED` | 업로드 또는 metadata 검증 실패 |

public serving 후보는 원칙적으로 `upload_status = UPLOADED`이고 `object_key` 또는 serving URL이 유효한 사진으로 제한한다.

`contest_award_photos.rights_status`는 다음 의미로 사용한다.

| 값 | 의미 |
| :--- | :--- |
| `PENDING_REVIEW` | 권리/출처/라이선스 검토 전 |
| `APPROVED` | public serving 사용 가능 |
| `REJECTED` | public serving 사용 금지 |

수상작 사진은 `upload_status = UPLOADED`와 `rights_status = APPROVED`를 모두 만족해야 public serving 후보가 될 수 있다.

## 매칭 정책

공모전 사진은 정확한 관광지에 연결될 수도 있고, 지역 수준으로만 연결되거나, 연결되지 않을 수도 있다.

매칭 scope는 다음과 같이 사용한다.

| scope | 의미 | public serving 사용 |
| :--- | :--- | :--- |
| `ATTRACTION` | 특정 관광지와 연결됨 | 사용 가능 |
| `REGION` | 시도/구군 지역 수준으로만 연결됨 | 같은 지역 fallback으로 사용 가능 |
| `UNMATCHED` | 현재 연결 불가 | 사용 금지 |

매칭 status는 다음과 같이 사용한다.

| status | 의미 |
| :--- | :--- |
| `CANDIDATE` | 자동 규칙이 만든 후보 |
| `SELECTED` | serving 또는 enrichment에 사용할 확정 매칭 |
| `REJECTED` | 검토 후 연결하지 않기로 한 후보 |
| `AMBIGUOUS` | 후보가 여러 개라 자동 확정할 수 없음 |

파일명에 지역명이 포함되어 있어도 자동으로 관광지 확정 매칭하지 않는다. 파일명/지역명 기반 규칙은 후보 생성을 위한 1차 신호다.

자동 후보 생성은 다음 순서로 처리한다.

1. 파일명과 metadata에서 지역명 후보를 추출한다.
2. 추출 문자열을 정규화해 `tourism_source.region_aliases.normalized_alias`와 비교한다.
3. alias가 시도/구군으로 해석되면 `REGION` 후보를 만든다.
4. 사진 제목, 파일명, 관광지 title이 강하게 일치하면 `ATTRACTION` 후보를 만들 수 있다.
5. 후보가 없으면 `UNMATCHED`로 보관한다.

자동 규칙으로 `SELECTED`를 만들 수 있는 경우는 하나로 제한한다.

- 후보가 정확히 1개다.
- `match_scope = ATTRACTION`이다.
- `confidence >= 0.9000`이다.
- 같은 사진에 이미 `SELECTED` 후보가 없다.

그 외에는 `CANDIDATE` 또는 `AMBIGUOUS`로 보관하고, 운영자가 검토해 `SELECTED`로 승격한다.

`UNMATCHED` 사진은 삭제하지 않는다. 추후 alias, 지역 사전, 관광지 원천 데이터가 보강되면 다시 매칭할 수 있도록 보존한다. 단, `UNMATCHED` 사진은 사용자에게 노출하지 않는다.

## 이미지 노출 정책

관광지 이미지 구성의 기본 목표는 5장이다.

```text
일반 관광지 이미지 4장 + 콘텐츠랩 수상작 사진 1장
```

노출 후보 생성 순서:

1. 현재 관광지의 `tourism_source.attraction_images`에서 일반 이미지 후보를 가져온다.
2. 같은 관광지에 `SELECTED ATTRACTION` 수상작 사진이 있으면 수상작 후보로 사용한다.
3. 정확한 관광지 수상작이 없으면 같은 시도/구군의 `SELECTED REGION` 수상작 사진을 fallback 후보로 사용한다.
4. 수상작 후보가 여러 장이면 `award_year DESC`, `award_rank ASC`, `created_at DESC` 순으로 1장을 선택한다.
5. 일반 이미지 후보는 최대 4장을 선택한다.
6. 수상작 후보가 있으면 일반 이미지 뒤에 1장을 추가한다.
7. 수상작 후보가 없으면 일반 이미지와 보유 이미지로만 구성한다.

일반 이미지가 4장보다 적으면 있는 만큼만 사용한다. 수상작 사진을 여러 장 넣어서 부족한 일반 이미지를 채우지 않는다. V1의 수상작 사진 slot은 최대 1장이다.

같은 API 응답 안에서 같은 수상작 사진이 여러 관광지에 반복 노출되는 것은 가능하면 피한다. 다만 지역 fallback 후보가 적은 경우 중복보다 이미지 공백 방지를 우선한다.

public serving에 사용할 수 없는 사진:

- `upload_status != UPLOADED`
- `rights_status != APPROVED`
- S3 object key 또는 serving URL이 없음
- `match_scope = UNMATCHED`
- `match_status != SELECTED`
- 권리/출처/라이선스 검토가 끝나지 않음

## 태그 추출과 추천 사용

`tourism_source` 데이터는 태그 추출 입력으로 사용할 수 있다.

태그 추출 입력 후보:

- 관광지 title
- 관광지 content type
- 주소와 지역
- overview
- homepage에서 정제된 텍스트
- 일반 관광지 이미지 metadata
- 확정 매칭된 수상작 사진 metadata

태그 저장은 반드시 `preference_tagging_policy.md`의 고정 whitelist 안에서만 이루어진다. 원천 데이터에 새로운 표현이 있어도 whitelist 밖 태그를 확정 태그로 저장하지 않는다.

공모전 수상작 사진은 추천 카드의 시각적 품질을 높이는 display 후보로 사용할 수 있다. 그러나 수상작 사진이 있다는 이유만으로 장소 추천 점수를 직접 올리지 않는다. 추천 점수는 사용자 스와이프 기반 선호도와 확정 태그 매칭을 기준으로 계산한다.

## 구현 전 필수 확인

관광지 원천/공모전 사진 관련 개발을 시작하기 전 다음을 사용자에게 설명하고 test-first로 진행한다.

- 어떤 source 데이터를 import할지
- production 서비스 DB와 source DB를 어떻게 분리할지
- 어떤 매칭 규칙이 후보만 만들고, 어떤 조건에서 확정되는지
- 수상작 사진이 없을 때 어떤 fallback을 사용할지
- public serving에서 제외되는 사진 조건은 무엇인지

필수 테스트:

- whitelist 밖 태그가 확정 태그로 저장되지 않는 테스트
- `UNMATCHED` 수상작 사진이 public image 후보에 나오지 않는 테스트
- `SELECTED ATTRACTION` 사진이 `SELECTED REGION` 사진보다 우선되는 테스트
- 같은 지역 수상작이 여러 장이면 `award_year DESC`, `award_rank ASC`, `created_at DESC`로 선택되는 테스트
- 일반 이미지 4장과 수상작 1장 제한이 지켜지는 테스트
- 수상작 사진이 없으면 일반 이미지 fallback만 반환되는 테스트

## 금지 사항

- 공모전 사진 바이너리를 repository에 commit하지 않는다.
- `tourism_source` 데이터를 사용자 업로드 미디어로 취급하지 않는다.
- 파일명에 지역명이 있다는 이유만으로 자동 public 노출하지 않는다.
- `UNMATCHED`, `CANDIDATE`, `AMBIGUOUS` 사진을 public serving에 사용하지 않는다.
- whitelist 밖 태그를 확정 태그로 저장하지 않는다.
- 수상작 사진 존재 여부를 추천 점수에 직접 가산하지 않는다.
