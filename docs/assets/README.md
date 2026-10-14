# README 이미지 출처

## 생성한 오프닝과 아키텍처

| 파일 (`readme/` 기준) | 제작 기준 |
| --- | --- |
| `overview/opening-banner.png` | [숨길 랜딩페이지](https://soomgil.me/)의 궁궐 야경·남색 배경·기존 로고·한국어 문구를 참고해 built-in ImageGen으로 제작한 README 배너 |
| `architecture/system-architecture.png` | 현재 서브모듈과 `compose.yaml`의 애플리케이션 연결을 기준으로 built-in ImageGen으로 제작한 구성도 |

오프닝은 랜딩페이지 화면 캡처, 제품의 `frontend/public/images/랜딩페이지/korea_hero.png`, 기존 숨길 로고를 참고했습니다. 생성한 배너는 실제 앱 화면 캡처와 구분합니다. 아키텍처는 README에 접어 둔 Mermaid 원본과 같은 연결을 표시하며, MinIO와 Mailpit을 로컬 환경으로 표기했습니다.

## 현재 README에 사용한 기능설명서 이미지

현재 README의 기능 화면 20개는 사용자가 제공한 `숨길 - 2026 관광데이터 활용 공모전 웹앱 개발 부문 기능설명서_.pptx`에서 추출했습니다.

아래 파일은 PPTX의 `ppt/media/`에 포함된 PNG 원본을 그대로 복사했습니다. 자르기, 리사이즈, 화면 합성이나 이미지 생성 없이 README의 표시 너비만 지정했습니다. 따라서 슬라이드에서 일부만 보이도록 잘린 이미지도 README에서는 전체 원본 화면을 보여줍니다.

| README 이미지 (`readme/` 기준) | PPTX 슬라이드 | PPTX 원본 |
| --- | --- | --- |
| `features/discovery/award-photo-home.png` | 7 | `ppt/media/image15.png` |
| `features/discovery/preference-swipe.png` | 7 | `ppt/media/image14.png` |
| `features/discovery/integrated-search.png` | 8 | `ppt/media/image16.png` |
| `features/discovery/place-recommendation.png` | 8 | `ppt/media/image17.png` |
| `features/group/member-invite.png` | 9 | `ppt/media/image19.png` |
| `features/group/sticker-vote.png` | 10 | `ppt/media/image24.png` |
| `features/group/group-recommendation.png` | 9 | `ppt/media/image21.png` |
| `features/map/collaborative-map.png` | 11 | `ppt/media/image25.png` |
| `features/map/transport-route.png` | 11 | `ppt/media/image26.png` |
| `features/map/three-dimensional-map.png` | 12 | `ppt/media/image27.png` |
| `features/map/map-theme.png` | 12 | `ppt/media/image28.png` |
| `features/ai/travel-guide.png` | 13 | `ppt/media/image29.png` |
| `features/ai/checklist-request.png` | 13 | `ppt/media/image30.png` |
| `features/ai/generated-checklist.png` | 13 | `ppt/media/image31.png` |
| `features/collaboration/room-chat.png` | 14 | `ppt/media/image33.png` |
| `features/collaboration/shared-note.png` | 14 | `ppt/media/image34.png` |
| `features/collaboration/member-checklist.png` | 14 | `ppt/media/image36.png` |
| `features/community/travel-community.png` | 15 | `ppt/media/image37.png` |
| `features/community/travel-post-editor.png` | 15 | `ppt/media/image38.png` |
| `features/community/retrip.png` | 15 | `ppt/media/image39.png` |

로고는 아래에 기록한 기존 제품 원본을 유지했습니다. 관광사진과 지도 등 이미지 안의 출처·저작자 표시도 원본대로 유지합니다. 기능 화면은 제공된 기능설명서의 소개 화면이며, 현재 버전의 모든 기능에 대한 실행 검증 결과를 뜻하지 않습니다.

## 기존 로고와 로컬 데모 화면

로고는 `soomgil-frontend`의 `public/images/soomgil_logo_extract.png` 원본을 사용했습니다. 기준 커밋은 `d6f20588c5b93ec29fa5dddf7f97f84e6c841b26`입니다.

아래 기능 화면은 이전 README에서 사용한 프로젝트 포트폴리오용 로컬 앱 캡처입니다. 현재 README의 PPTX 화면과 구분해 출처를 보존합니다.

| 파일 | 원본·설명 |
| :--- | :--- |
| `features/swipe.png` | `05-swipe.png` · 취향 수집 화면, 브라우저 75% 배율 |
| `features/route.png` | `11-route.png` · 프로젝트 소개 PDF 9쪽의 기존 지도 손그림 화면. 브라우저 상단만 제외한 원본이며 최신 버전 재촬영은 아닙니다. |
| `features/discover.png` | `13-discover.png` · 장소 탐색과 일정 추가 패널 |
| `features/planning.png` | `14-planning.png` · 로컬 데모 공동 메모 |
| `features/checklist.png` | `17-checklist.png` · 로컬 데모 준비물 체크리스트 |
| `features/community.png` | `06-community.png` · 기존 여행기 목록 UI를 로컬에서 촬영한 데모 |

메모·체크리스트·여행기 내용은 촬영용 예시이며 실제 이용 실적을 뜻하지 않습니다. 화면 캡처는 다중 사용자 동시 편집이나 외부 AI 응답의 종합 검증 결과를 뜻하지 않습니다.

커뮤니티 사진은 한국관광공사 관광사진 공모전 수상작 API에서 조회한 Type1 사진입니다. 원작자 정보와 원본 URL은 [사진 출처](PHOTO-CREDITS.md)에 보존했습니다. 사진을 프로젝트 참여자가 직접 촬영한 것으로 표시하지 않습니다. 기존 제품 사진과 지도 저작자 표시는 화면에 보존되어 있습니다. 이 문서는 이미지에 새로운 라이선스를 부여하지 않습니다.
