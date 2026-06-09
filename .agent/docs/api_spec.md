# API 명세 초안

백엔드는 추후 `backend/` 서브모듈로 연결됩니다. 이 문서는 frontend API 클라이언트와 backend endpoint가 맞아야 할 큰 경계를 정의합니다.

## 공통

| 항목 | 기준 |
| :--- | :--- |
| Base URL | `/api/v1` |
| 인증 | `Authorization: Bearer {accessToken}` |
| 응답 | JSON |
| 시간 | ISO 8601 |
| 페이지네이션 | `page`, `size`, `sort` |

## 리소스

| 영역 | 주요 endpoint |
| :--- | :--- |
| Auth | `POST /auth/login`, `POST /auth/register`, `POST /auth/logout`, `GET /me` |
| Trips | `GET /trips`, `POST /trips`, `GET /trips/{tripId}`, `PATCH /trips/{tripId}` |
| Members | `POST /trips/{tripId}/members`, `PATCH /trips/{tripId}/members/{userId}` |
| Places | `GET /places`, `GET /places/{placeId}` |
| Swipe | `POST /trips/{tripId}/places/{placeId}/reactions`, `GET /trips/{tripId}/preference-summary` |
| Itinerary | `GET /trips/{tripId}/itinerary`, `PUT /trips/{tripId}/itinerary` |
| AI | `POST /trips/{tripId}/ai/route-draft`, `POST /trips/{tripId}/ai/chat` |
| Community | `GET /stories`, `POST /stories`, `GET /stories/{storyId}`, `POST /stories/{storyId}/comments` |
| Media | `POST /media`, `DELETE /media/{mediaId}` |

## 하네스 확장 기준

backend가 active가 되면 다음 검사를 추가합니다.

- frontend `src/api/*.ts` 함수와 backend endpoint 매칭.
- 인증 필요 endpoint와 router guard 정책 매칭.
- API schema 또는 OpenAPI 문서 최신성.
- backend test/build와 frontend build를 같은 상위 하네스에서 실행.
