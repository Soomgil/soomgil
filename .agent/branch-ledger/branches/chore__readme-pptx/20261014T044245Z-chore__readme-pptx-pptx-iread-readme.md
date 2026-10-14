---
id: 20261014T044245Z-chore__readme-pptx-pptx-iread-readme
branch: chore/readme-pptx
branchKey: chore__readme-pptx
createdAt: 2026-10-14T04:42:45.013Z
baseRef: develop
scope: orchestration
status: complete
---

# PPTX와 iRead 구성을 참고한 숨길 README 개편

## 배경

- 사용자는 iRead README 형식을 참고해 Soomgil README를 수정하고 제공한 공모전 PPTX의 이미지를 활용하도록 요청했다.
- 후속 요청에 따라 기술 스택을 모두 뱃지로 통일하고, soomgil.me 랜딩페이지를 참고한 오프닝 배너와 시스템 아키텍처 이미지를 제작했다.

## 변경 요약

- 서비스 소개, 팀, 다섯 기능 묶음, 기술 스택, 아키텍처, ERD/API, 핵심 기술, 관광데이터, 발전 계획, 접힌 개발자 가이드로 README를 구성했다.
- PPTX에서 기능 화면 20개를 PNG 원본 그대로 추출하고 docs/assets/readme/features/에 배치했다. 이미지 바이트가 원본과 동일함을 SHA-256으로 확인했다.
- 기술 항목 30개를 Shields.io의 for-the-badge 스타일로 통일했다.
- built-in image_gen.imagegen으로 오프닝 배너와 시스템 아키텍처를 생성해 docs/assets/readme/에 복사했다.
- 아키텍처는 현재 저장소 연결을 표현하며 Mapbox 호출 방향을 검토했다. 수정 가능한 Mermaid 원본도 README에 보존했다.
- 기존 로컬 데모 사진 출처를 보존하면서 PPTX 화면과 생성 이미지의 출처를 구분했다.

## 검증

- npm --prefix .agent run harness:index: 통과, 생성 인벤토리 변경 없음.
- npm --prefix .agent run harness:check: 통과. 이미지 인벤토리 테스트, 구조, API integrity, branch ledger, SPA 19개 라우트 smoke 확인.
- README의 로컬 링크·목차 앵커 확인 통과. 기술 뱃지 30개가 모두 동일한 스타일이며 일반 텍스트로 남은 기술 항목이 없음.
- PPTX 기능 화면 20개의 SHA-256이 원본과 동일함을 최종 확인했다.
- 브라우저에서 이미지 53개(로컬 이미지 23개·기술 뱃지 30개)가 모두 표시되고, Mermaid 2개가 렌더링됨을 확인했다. 배너·뱃지·아키텍처 배치를 시각적으로 검토했다.
- git -c core.whitespace=cr-at-eol diff --check 통과. 기존 사진 출처 문서의 CRLF를 보존했다.

## 에이전트 주의사항

- 제품 서브모듈과 환경변수는 변경하지 않았다.
- 팀원 세부 직무와 개발 기간을 새로 추정하지 않았다.
- OpenAPI 협의 초안과 Swagger 구현 명세를 구분했다.
- 관광지 원본 사진을 따로 추출하지 않고 PPTX의 앱 화면을 사용했다.
- 다른 브랜치 ledger와 통합 branch_ledger 인덱스를 읽거나 수정하지 않는다.

## develop 통합 시 반영할 내용

- README 및 docs/assets/의 문서·이미지를 함께 반영한다.
- merge 후 통합 브랜치에서 branch:index를 실행한다.

## 이미지 생성 프롬프트

도구: built-in image_gen.imagegen. 최종 이미지의 기준 프롬프트를 보존한다.

### 오프닝 배너

Use case: ads-marketing.
Asset type: the opening banner of the Korean Soomgil tourism web application's GitHub README, a finished wide raster banner, approximately 2560x1100.
Primary request: create an elegant panoramic brand opening inspired closely by the real landing page shown in reference image 1.
Input images: Image 1 is the actual live landing page screenshot, a layout and mood reference only. Image 2 is the original palace nightscape background, visual subject reference. Image 3 is the official existing transparent Soomgil logo, identity insert to preserve faithfully.
Scene/backdrop: an expansive nighttime Korean palace courtyard with glowing warm golden historic roofs, contemporary Seoul city skyline, a deep navy subtly starry sky; preserve the recognizable photographic subject and atmosphere of image 2, reframe horizontally to fit the banner. Apply the subtle dark navy overlay seen in the real landing.
Composition: balanced and centered, photographic panorama edge to edge, enough quiet sky for the small official logo in the upper center and for a strong centered headline below it. Keep palace architecture visible beneath the text. Wide cinematic landscape, generous margins. Use only the supplied official Soomgil S-and-leaf mark and wordmark, maintain the original proportions, leaf and blue-to-purple gradient. No black rectangle behind the logo.
Text, verbatim: one small line "함께 고르고, 함께 만드는 여행". Then a large, impeccably legible two-line Korean headline "함께 그리는 설렘," on the first line and "여행의 모든 순간" on the second. No other text. The main headline should use beautiful clean Korean serif typography, white first line and very pale blue second line, as on the supplied landing screenshot. Center all copy.
Constraints: this is a README opening banner, not a UI screenshot. No buttons, browser chrome, menus, navigation, cards, extra labels, extra logos, invented slogans or watermark. Do not redesign the brand mark. Keep all exact Korean spelling and clear high contrast. Polished natural photographic finish. Opaque background.

### 시스템 아키텍처

Use case: infographic-diagram.
Asset type: a finished accurate raster system architecture image for the Soomgil GitHub README.
Primary request: a professional software architecture diagram of the actual Soomgil application and its local support services. Landscape 2400x1350, crisp readable typography, white background, slate text, restrained blue and violet accents matching the Soomgil brand, generous spacing. Diagram first, no decorative city, no fake dashboard. Large clear labels, clean orthogonal connectors, arrows with unambiguous endpoints, consistent box spacing.
Title exact: "Soomgil System Architecture".
Components and exact text: "Users"; "Web App" with "Vue 3 · TypeScript" and "Pinia · Vue Router"; "Backend API" with "Java 21 · Spring Boot" and "Spring Security · WebSocket"; "Map Rendering" with "Mapbox GL JS"; "Route Matching" with "Mapbox Map Matching API"; "AI Travel Guide" with "Spring AI · Google Gemini"; "Database" with "PostgreSQL 16"; "Cache" with "Redis 7"; "Object Storage" with "S3 compatible / local MinIO"; "Mail Service" with "SMTP / local Mailpit".
Required connections, no others: Users -> Web App. Web App <-> Backend API, label this connector "REST / WebSocket · STOMP". Web App -> Map Rendering. Backend API -> Route Matching. Backend API -> AI Travel Guide. Backend API -> Database. Backend API -> Cache. Backend API -> Object Storage. Backend API -> Mail Service.
Layout: three levels to prevent crossing. Top external Map Rendering above Web App and Route Matching above Backend API, each linked only to the corresponding component. Middle main horizontal application flow Users at far left, Web App at left center, Backend API at center, AI Travel Guide at right. Bottom row four support components Database, Cache, Object Storage, Mail Service connected through a tidy distribution line from Backend API with a distinct terminating arrow to each. The four support boxes have a subtle shared boundary with exact section label "Data & Support Services". Keep application nodes larger than support nodes. Use familiar small simple technology/service symbols only as visual aids.
Accuracy: no Map Rendering-to-Backend line, no direct Web App-to-Database line, no Gemini-to-Database line, no chain between support services. Each label appears exactly once. Clearly indicate "local MinIO" and "local Mailpit" in their text to avoid implying they are production deployment. No AWS, Kubernetes, Nginx, invented network infrastructure, deployment claims, decorative badges, unexplained dotted connections or watermark. All component and connection labels must be faithfully readable and correctly spelled.

### 아키텍처 화살표 방향 수정

Edit the supplied Soomgil System Architecture image. Preserve the entire layout, all component boxes, service icons, exact text, colors, typography, sizes, positions, bottom distribution bus and every other arrow completely unchanged. Correct ONLY the direction of the two vertical connectors at the top: (1) the connector between Web App and Map Rendering must point UPWARD from Web App into the bottom of Map Rendering; remove the downward arrowhead at Web App. (2) the connector between Backend API and Route Matching must point UPWARD from Backend API into the bottom of Route Matching; remove the downward arrowhead at Backend API. Each of these two connectors must have exactly one arrowhead, at its TOP endpoint. Keep the bidirectional horizontal Web App/Backend API connector, Users-to-Web App arrow, Backend API-to-AI Travel Guide arrow and all four downward support-service arrows unchanged. Do not add any elements, alter words, crop or otherwise redesign the image.
