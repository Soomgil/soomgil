# Orchestration 프로젝트 부트스트랩 가이드

`create-orchestration.mjs`는 Soomgil에서 사용한 root AI 하네스 + 제품 저장소 submodule 패턴을 새 프로젝트에 생성하는 Node.js 20+ 도구입니다. 외부 npm 패키지를 사용하지 않아 macOS와 Windows에서 같은 설정 JSON을 사용합니다.

## 준비

1. `.agent/bootstrap/project.example.json`을 복사해 프로젝트 이름과 workspace를 수정합니다.
2. 원격 저장소와 추적 브랜치가 실제로 준비된 workspace만 `status`를 `active`로 바꿉니다.
3. 아직 원격이 없는 workspace는 `planned`로 둡니다. 도구는 submodule 자리에 일반 폴더를 만들지 않습니다.
4. 실행 전에 `--dry-run`으로 생성 파일과 Git 명령을 확인합니다.

예제는 workspace의 역할, 프레임워크, 언어, 패키지 관리자와 빌드 도구를 정하지 않습니다. 필요한 기술 정보와 검증 명령은 실제 제품 저장소가 결정된 뒤 사용자가 명시한 경우에만 추가합니다.

상대 `--target` 경로와 설정의 `targetDirectory`는 현재 Soomgil 루트를 기준으로 해석합니다. 어디서 명령을 실행해도 결과 경로가 달라지지 않습니다.

## 실행

macOS:

```bash
./.agent/bootstrap/create-project.command --target ../my-product --dry-run
./.agent/bootstrap/create-project.command --target ../my-product
```

Windows Command Prompt 또는 PowerShell:

```bat
.agent\bootstrap\create-project.cmd --target ..\my-product --dry-run
.agent\bootstrap\create-project.cmd --target ..\my-product
```

운영체제 공통:

```bash
node .agent/tools/create-orchestration.mjs init --config <config.json> --target <directory>
```

## 안전 동작

- 기본적으로 비어 있지 않은 대상 디렉터리를 거부합니다.
- `--allow-existing`을 주어도 기존 파일을 덮어쓰지 않습니다.
- commit, push, 원격 저장소 생성, branch protection 변경은 하지 않습니다.
- submodule URL이나 branch가 잘못되어 Git 작업이 중단되면 성공한 앞 단계는 유지하고 정확한 실패 명령을 출력합니다.
- `--skip-submodules`는 하네스 파일만 먼저 만들 때 사용합니다.
- `--no-git`는 Git 저장소 초기화까지 생략합니다.

## 설정의 verify 명령

명령은 shell 문자열이 아니라 인자 배열입니다. 공통 명령은 `command`, Windows 전용 실행 파일이 필요한 경우 `windowsCommand`에 둡니다.

```json
{
  "name": "verify",
  "command": ["<executable>", "<argument>"],
  "windowsCommand": ["<windows-executable>", "<argument>"]
}
```

검증 명령이 정해지지 않았다면 `verify`를 빈 배열로 둡니다.

## 생성 후

```bash
npm --prefix .agent run harness:check
npm --prefix .agent run workspace:verify
git add .
git commit -m "chore(orchestration): initialize AI harness"
git switch -c develop
```

최초 commit 뒤 integration 브랜치를 만들고 원격 보호 규칙을 설정합니다. 이후 child 저장소 PR을 먼저 merge하고 root 저장소가 검증된 submodule commit pointer를 따라가도록 합니다.

Node.js를 쓸 수 없거나 다른 AI 도구로 구조를 만들 때는 `.agent/bootstrap/AI_PROJECT_BOOTSTRAP.md`를 전달합니다.

도구 자체 smoke test는 `npm --prefix .agent run project:bootstrap:test`로 실행합니다. `.github/workflows/orchestration-bootstrap.yml`이 같은 검사를 macOS와 Windows에서 반복하고 각 운영체제용 launcher도 확인합니다.
