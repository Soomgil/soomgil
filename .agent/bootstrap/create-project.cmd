@echo off
setlocal
set "BOOTSTRAP_DIR=%~dp0"
node "%BOOTSTRAP_DIR%..\tools\create-orchestration.mjs" init --config "%BOOTSTRAP_DIR%project.example.json" %*
exit /b %ERRORLEVEL%
