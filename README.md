# 숨길(Soomgil)

스와이프로 취향을 모으고, 지도 위에서 함께 계획하는 그룹 여행 서비스입니다.

이 저장소는 제품 코드를 직접 담는 repo가 아니라, `frontend`와 `backend` 서브모듈을 묶어 로컬 실행과 통합 관리를 담당하는 orchestration repo입니다.

## 서비스 개요

숨길은 여러 사람이 함께 가는 여행을 더 쉽게 정하는 서비스입니다. 각 사용자는 장소를 스와이프하며 취향을 남기고, 여행방에서는 멤버들의 선호를 바탕으로 갈 만한 장소를 추천받습니다. 추천된 장소는 지도 위 일정으로 바로 옮길 수 있고, 멤버들은 같은 여행방에서 경로, 메모, 체크리스트, 채팅을 함께 관리합니다.

숨길의 기본 사용 흐름은 다음과 같습니다.

1. 여행방을 만들고 멤버를 초대합니다.
2. 각자 장소를 스와이프해 취향 데이터를 쌓습니다.
3. 여행방 지도에서 멤버 취향 기반 장소를 추천받습니다.
4. 추천 장소를 일정에 추가하고 경로를 조정합니다.
5. 여행 중 기록을 남기고, 완성된 여행은 커뮤니티에 공유합니다.

## 주요 기능

| 기능 | 설명 |
| :--- | :--- |
| 여행방 | 멤버 초대, 여행 정보 관리, 역할 기반 접근 |
| 취향 수집 | 장소 스와이프와 슈퍼라이크 기반 선호도 학습 |
| 장소 추천 | 현재 지도 범위와 멤버 취향을 반영한 추천 |
| 지도 일정 | 일정 편집, 경로 연결, 지도 그림, 3D/테마 지도 보기 |
| 협업 도구 | 여행방 채팅, AI 가이드, 메모, 체크리스트 |
| 기록/커뮤니티 | 여행 사진 기록, 여행기 발행, 좋아요, 리트립 |

## 저장소 구성

| 경로 | 역할 |
| :--- | :--- |
| `frontend/` | Vue 기반 웹 앱 서브모듈 |
| `backend/` | Spring Boot API 서버 서브모듈 |
| `.agent/` | AI 작업 문서, 계약, 하네스 |
| `compose.yaml` | 로컬 통합 실행 환경 |

## 빠른 실행

Docker Desktop과 Node.js 18 이상이 필요합니다.

```bash
cp .env.example .env
docker compose --profile full up --build -d
```

접속 주소:

| 서비스 | 주소 |
| :--- | :--- |
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8080 |
| Mailpit | http://localhost:8025 |
| MinIO Console | http://localhost:9001 |

중지:

```bash
docker compose --profile full down
```

## 자주 쓰는 명령

| 명령 | 설명 |
| :--- | :--- |
| `node start-soomgil.mjs both` | 프론트엔드와 백엔드 실행 |
| `node start-soomgil.mjs frontend` | 프론트엔드만 실행 |
| `node start-soomgil.mjs backend` | 백엔드와 필수 인프라 실행 |
| `node start-soomgil.mjs reset` | 로컬 데모 DB 초기화 |
| `node start-soomgil.mjs stop` | 전체 컨테이너 종료 |

Windows에서는 `start-soomgil.bat`, macOS에서는 `start-soomgil.command`를 사용할 수 있습니다.

## 개발 메모

- 실제 제품 코드는 각 서브모듈 repo에서 커밋합니다.
- 이 루트 repo는 서브모듈 포인터와 통합 실행 설정을 관리합니다.
- Git Flow와 서브모듈 운영 규칙은 `.agent/docs/process/git_workflow.md`를 따릅니다.
- 실제 환경변수 파일인 `.env`는 커밋하지 않습니다.
