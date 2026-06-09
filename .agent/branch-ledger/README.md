# 브랜치 AI Ledger

여러 브랜치가 동시에 작업할 때 AI 에이전트 문맥이 서로 섞이지 않도록 관리하는 Flyway식 기록소입니다.

## 원칙

- 기능 브랜치는 자기 브랜치 디렉터리에 새 기록 파일만 추가합니다.
- 다른 브랜치의 ledger는 읽거나 수정하지 않습니다.
- `develop` 또는 `main` 같은 통합 브랜치에서만 모든 ledger를 읽고 통합 인덱스를 재생성합니다.
- 공통 AI 문서 변경은 가능하면 통합 브랜치에서 수행합니다.
- 기능 브랜치의 특수 맥락은 `.agent/branch-ledger/branches/<branchKey>/` 아래에 기록합니다.

## 명령

| 명령 | 역할 |
| :--- | :--- |
| `npm --prefix .agent run branch:status` | 현재 브랜치에서 읽어도 되는 AI 문맥 확인 |
| `npm --prefix .agent run branch:note -- --title "제목" --scope frontend` | 현재 브랜치용 기록 파일 생성 |
| `npm --prefix .agent run branch:check` | 다른 브랜치 ledger 수정 여부 검사 |
| `npm --prefix .agent run branch:index` | 통합 브랜치에서 전체 ledger 인덱스 생성 |

## 병합 방식

1. 기능 브랜치에서 작업 시작 전 `branch:status`를 확인합니다.
2. 기능 브랜치에서는 필요한 맥락을 `branch:note`로 새 파일에 남깁니다.
3. merge 전 `branch:check`와 `harness:check`를 실행합니다.
4. `develop`에 merge한 뒤 `branch:index`를 실행해 통합 인덱스를 갱신합니다.
5. 통합 결과가 공통 규칙이 되어야 하면 `develop`에서 `.agent/docs/` 문서에 반영합니다.

## 충돌 회피

- 브랜치별 기록은 파일명이 timestamp + branchKey라 서로 다른 파일로 쌓입니다.
- 기능 브랜치에서는 중앙 인덱스를 수정하지 않으므로 같은 파일을 두 브랜치가 동시에 고칠 일이 줄어듭니다.
- 통합 브랜치에서 생성 파일을 다시 만들면 누락된 기록을 한 번에 볼 수 있습니다.
