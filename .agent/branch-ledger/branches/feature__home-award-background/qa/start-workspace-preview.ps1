# 프론트엔드와 백엔드를 현재 기능 worktree로 실행합니다. V51 기록 삭제 migration이 적용됩니다.
docker compose -f D:/vscode-workspace/soomgil/compose.yaml -f "$PSScriptRoot/compose.home-preview.yaml" --profile full up -d --build --no-deps frontend backend
exit $LASTEXITCODE
