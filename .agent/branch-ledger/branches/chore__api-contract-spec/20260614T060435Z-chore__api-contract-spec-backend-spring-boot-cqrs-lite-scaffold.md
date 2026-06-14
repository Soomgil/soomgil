---
id: 20260614T060435Z-chore__api-contract-spec-backend-spring-boot-cqrs-lite-scaffold
branch: chore/api-contract-spec
branchKey: chore__api-contract-spec
createdAt: 2026-06-14T06:04:35.214Z
baseRef: develop
scope: shared
status: draft
---

# Backend Spring Boot CQRS-lite scaffold

## 배경

- 이 브랜치에서만 필요한 AI 문맥을 기록합니다.
- 다른 브랜치의 ledger를 참조하지 않습니다.

## 변경 요약

- `backend/`를 Spring Initializr 기반 Spring Boot 3.5.15 / Java 21 / Gradle 프로젝트로 scaffold했습니다.
- 백엔드는 CQRS-lite 기준으로 도메인 루트 패키지(`auth`, `trip`, `itinerary`, `community` 등)마다 `api`, `application/command`, `application/query`, `domain`, `infrastructure` 구조를 갖습니다.
- PostgreSQL, Redis, Flyway, Spring Security, OAuth2 Client/Resource Server, WebSocket, Springdoc OpenAPI, Spring Modulith, Testcontainers, MapStruct, Lombok 의존성을 포함했습니다.
- `backend/compose.yaml`은 PostgreSQL, Redis, Mailpit, MinIO를 포함하며 macOS/Windows 협업 환경에서 같은 compose stack을 사용합니다.
- macOS 로컬에는 Homebrew로 `docker`, `docker-compose`, `colima`를 설치하고 Colima 기반 Docker context를 시작했습니다.
- Testcontainers는 macOS Colima socket이 있으면 Gradle test task가 자동으로 `DOCKER_HOST`와 `TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE`를 설정합니다. Windows Docker Desktop에서는 기본 Docker context를 사용합니다.
- 루트 README, `.agent/workspaces.json`, architecture guide, generated UI inventory에서 backend 상태를 `active`로 갱신했습니다.

## 에이전트 주의사항

- 이 변경은 `backend/` submodule 내부 제품 코드와 orchestration repo 문서를 함께 바꿉니다.
- 현재 로컬 환경은 JDK 21, Colima, Docker CLI/Compose가 준비되어 있고 `./gradlew test` 및 `./gradlew bootRun` health check를 통과했습니다.
- Windows 협업자는 Docker Desktop with WSL2 backend, JDK 21, `.\gradlew.bat` 명령을 사용합니다.
- Spring Modulith 경계 검증을 고려해 도메인 패키지를 `com.soomgil.{domain}` 형태로 두었습니다.

## develop 통합 시 반영할 내용

- develop/main에서 branch ledger generated index를 재생성해 이 스캐폴드 변경을 통합 문맥에 반영합니다.
- backend scaffold가 확정되면 DBML/OpenAPI 기준으로 첫 Flyway migration과 auth/trip 도메인 구현을 이어갑니다.
