# B1 — 수상작 파이프라인 (매칭 데이터 서빙)

의존: 없음. 관련 질문: **Q2** (저장 방식).
1차 구현(홈 히어로 + `GET /award-photos`)은 **이미 완료** — CONTEXT.md "1차 구현 완료분" 참조.

## 남은 목표

수상작 → KTO 관광지 연결 정보를 API로 노출한다.
B3(목적지 미정 → 수상작 선택 → 지역 확정)과 B7(이미지 좋아요 → 장소 LIKE 승격)이 이걸 소비한다.

## 매칭 데이터는 이미 완성돼 있다

`data/award-place-matches.json` — 95건 전수 매칭 실측 (2026-08-31):

- EXACT 36 + PARTIAL 37 = 73쌍 사용 가능, NO_RESULT 22.
- 각 항목: awardContentId, placeName, matches[]{contentId, title, contentTypeId, areaCode, addr1, mapx/mapy, exact, contains, enriched}.
- `data/usable-award-place-pairs.json` — 수상작당 최적 후보 1개로 압축한 73쌍.

## 작업 (Q2 권장안 = 리소스 파일 기준)

1. `data/usable-award-place-pairs.json`을 다듬어
   `backend/src/main/resources/tourism-source/award-place-matches.json`으로 복사.
   형식 제안: `[{"awardContentId":"...","placeContentId":"...","placeName":"...","areaCode":"...","exact":true}]`
   PARTIAL 중 명백한 오매칭은 눈으로 걸러낸다 (73건, 5분 검수).
2. 신규 `place/infrastructure/external/AwardPlaceMatchCatalog.java` —
   기동 시 classpath 리소스 로드, `Optional<AwardPlaceMatch> findByAwardContentId(String)`.
3. `AwardPhoto` DTO에 매칭 필드 추가:
   `String matchedPlaceContentId, String matchedPlaceName, String matchedAreaCode, String matchedLegalSidoCode`.
   (KTO areaCode → 법정 시도코드 역매핑은 B0의 `KtoAreaCatalog` 사용. B0 미완이면 `data/area-bboxes.json`의 맵을 뒤집어 상수로.)
4. `KtoListAwardPhotosQueryHandler.toAwardPhoto()`에서 카탈로그 조회해 채움. 매칭 없으면 null.
5. 프론트 `types/award.ts` 필드 추가.

## Q2가 "V46 테이블 시드"라면

`contest_award_photos`에 컬럼 추가(award_content_id UNIQUE, org_image_url, thumb_image_url,
film_location_text, film_day, photographer_name, award_division, copyright_div_code) +
`contest_award_photo_matches`에 kto_content_id 기반 INSERT 시드. 마이그레이션은 V46.
`TourismSourcePlaceImageMapper.findAwardImage`(mappers/place/TourismSourcePlaceImageMapper.xml)의
필터(upload_status='UPLOADED', rights_status='APPROVED')와 충돌하니 시드에 두 값 명시 필요.
→ 공수가 3배라 권장하지 않음. 리소스 파일이면 충분.

## 테스트 / 완료 기준

- `KtoListAwardPhotosQueryHandlerTest`에 매칭 필드 케이스 추가 (기존 테스트 파일에 이어서).
- `GET /api/v1/award-photos?limit=5` 응답에 matchedPlaceContentId가 (매칭 있는 항목에) 채워짐.
- 프론트 홈 히어로 정상 (vitest 259개 기준선 유지).

## 참고 읽기 목록 (구현 시)

- `backend/.../place/application/query/handler/KtoListAwardPhotosQueryHandler.java` (1차 구현)
- `backend/.../place/api/dto/AwardPhoto.java`
- `backend/.../tourismsource/imports/TourismSourceImportManifestLoader.java` — classpath JSON 로더 기존 패턴
