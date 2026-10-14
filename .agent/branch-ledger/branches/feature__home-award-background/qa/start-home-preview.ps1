# 새 홈 worktree를 기존 로컬 Docker 스택의 frontend로 실행합니다.
docker compose -f D:/vscode-workspace/soomgil/compose.yaml -f "$PSScriptRoot/compose.home-preview.yaml" --profile full up -d --build --no-deps frontend
exit $LASTEXITCODE
