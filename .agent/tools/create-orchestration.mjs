#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const TOOL_VERSION = "1.0.0";
const DEFAULT_CONFIG_LABEL = ".agent/bootstrap/project.example.json";
const TOOL_DIR = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_ROOT = path.resolve(TOOL_DIR, "../..");
const DEFAULT_CONFIG = path.resolve(TOOL_DIR, "../bootstrap/project.example.json");

function printHelp() {
  console.log(`AI Harness Orchestration Bootstrap ${TOOL_VERSION}

사용법:
  node .agent/tools/create-orchestration.mjs init [옵션]
  node .agent/tools/create-orchestration.mjs doctor --target <경로>

init 옵션:
  --config <파일>       프로젝트 설정 JSON (기본: ${DEFAULT_CONFIG_LABEL})
  --target <경로>       생성할 디렉터리 (기본: 설정의 targetDirectory)
  --dry-run             파일과 Git 작업 계획만 출력
  --skip-submodules     active 워크스페이스도 연결하지 않고 안내만 출력
  --no-git              git init과 submodule 연결을 생략
  --allow-existing      비어 있지 않은 대상 디렉터리 허용 (파일 덮어쓰기 금지)

doctor 옵션:
  --target <경로>       검사할 orchestration 저장소 (기본: 현재 디렉터리)

예시:
  node .agent/tools/create-orchestration.mjs init \\
    --config .agent/bootstrap/project.example.json \\
    --target ../my-product
  node .agent/tools/create-orchestration.mjs init --dry-run
  node .agent/tools/create-orchestration.mjs doctor --target ../my-product
`);
}

function parseArgs(argv) {
  const [command = "help", ...tokens] = argv;
  const options = {};
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token.startsWith("--")) throw new Error(`알 수 없는 인자입니다: ${token}`);
    const [rawName, inlineValue] = token.slice(2).split("=", 2);
    if (inlineValue !== undefined) {
      options[rawName] = inlineValue;
      continue;
    }
    const next = tokens[index + 1];
    if (next && !next.startsWith("--")) {
      options[rawName] = next;
      index += 1;
    } else {
      options[rawName] = true;
    }
  }
  return { command, options };
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

function projectPath(value, label) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} 값이 필요합니다.`);
  const normalized = value.replaceAll("\\", "/").replace(/^\.\//, "").replace(/\/$/, "");
  if (path.posix.isAbsolute(normalized) || normalized === ".." || normalized.startsWith("../") || normalized.includes("/../")) {
    throw new Error(`${label}에는 프로젝트 밖 경로를 사용할 수 없습니다: ${value}`);
  }
  if (normalized === "." || normalized.includes("//")) throw new Error(`${label} 경로가 올바르지 않습니다: ${value}`);
  if (!/^[A-Za-z0-9._/-]+$/.test(normalized) || normalized.split("/").some((part) => part === "." || part === ".." || part === ".git")) {
    throw new Error(`${label}에는 영문, 숫자, 점, 밑줄, 하이픈과 경로 구분자만 사용할 수 있습니다: ${value}`);
  }
  return normalized;
}

function gitBranch(value, label) {
  if (typeof value !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(value) || value.includes("..") || value.includes("@{") || value.endsWith(".") || value.endsWith("/")) {
    throw new Error(`${label}이 안전한 Git 브랜치 이름이 아닙니다: ${value}`);
  }
  return value;
}

function validateConfig(config) {
  if (config.schemaVersion !== 1) throw new Error("지원하는 schemaVersion은 1입니다.");
  const project = config.project || {};
  for (const key of ["name", "displayName", "description", "defaultBranch", "integrationBranch"]) {
    if (typeof project[key] !== "string" || !project[key].trim()) throw new Error(`project.${key} 값이 필요합니다.`);
  }
  gitBranch(project.defaultBranch, "project.defaultBranch");
  gitBranch(project.integrationBranch, "project.integrationBranch");
  if (!/^[a-z0-9][a-z0-9._-]*$/i.test(project.name)) throw new Error("project.name은 영문, 숫자, 점, 밑줄, 하이픈만 사용할 수 있습니다.");
  if (config.git?.remoteUrl !== undefined && typeof config.git.remoteUrl !== "string") throw new Error("git.remoteUrl은 문자열이어야 합니다.");
  const workspaces = config.workspaces;
  if (!Array.isArray(workspaces) || workspaces.length === 0) throw new Error("workspaces에는 한 개 이상의 항목이 필요합니다.");
  const names = new Set();
  const paths = new Set();
  for (const workspace of workspaces) {
    if (!workspace || typeof workspace !== "object") throw new Error("workspace 항목은 객체여야 합니다.");
    if (!/^[a-z0-9][a-z0-9._-]*$/i.test(workspace.name || "")) throw new Error(`workspace.name이 올바르지 않습니다: ${workspace.name}`);
    workspace.path = projectPath(workspace.path, `workspace(${workspace.name}).path`);
    if (workspace.path === ".agent" || workspace.path.startsWith(".agent/")) throw new Error(`${workspace.name} 경로는 .agent 아래일 수 없습니다.`);
    if (!["active", "planned"].includes(workspace.status)) throw new Error(`${workspace.name}.status는 active 또는 planned여야 합니다.`);
    if (workspace.status === "active" && !workspace.repoUrl) throw new Error(`active workspace ${workspace.name}에는 repoUrl이 필요합니다.`);
    if (workspace.repoUrl !== undefined && typeof workspace.repoUrl !== "string") throw new Error(`${workspace.name}.repoUrl은 문자열이어야 합니다.`);
    if (workspace.branch !== undefined) gitBranch(workspace.branch, `${workspace.name}.branch`);
    if (names.has(workspace.name)) throw new Error(`중복 workspace 이름: ${workspace.name}`);
    if (paths.has(workspace.path)) throw new Error(`중복 workspace 경로: ${workspace.path}`);
    names.add(workspace.name);
    paths.add(workspace.path);
    if (workspace.verify !== undefined && !Array.isArray(workspace.verify)) throw new Error(`${workspace.name}.verify는 배열이어야 합니다.`);
    for (const check of workspace.verify || []) {
      if (!check.name || !Array.isArray(check.command) || check.command.length === 0) {
        throw new Error(`${workspace.name}.verify 항목에는 name과 command 배열이 필요합니다.`);
      }
      if (check.windowsCommand !== undefined && (!Array.isArray(check.windowsCommand) || check.windowsCommand.length === 0)) {
        throw new Error(`${workspace.name}.verify.windowsCommand는 비어 있지 않은 배열이어야 합니다.`);
      }
      if (![...check.command, ...(check.windowsCommand || [])].every((part) => typeof part === "string" && part.length > 0)) {
        throw new Error(`${workspace.name}.verify 명령의 모든 인자는 비어 있지 않은 문자열이어야 합니다.`);
      }
      if ([...check.command, ...(check.windowsCommand || [])].some((part) => /[\r\n"&|<>^%]/.test(part))) {
        throw new Error(`${workspace.name}.verify 명령에는 줄바꿈, 따옴표 또는 shell 제어 문자를 사용할 수 없습니다.`);
      }
    }
  }
  for (const left of paths) for (const right of paths) {
    if (left !== right && right.startsWith(`${left}/`)) throw new Error(`workspace 경로를 서로 중첩할 수 없습니다: ${left}, ${right}`);
  }
  return config;
}

function run(command, args, options = {}) {
  const printable = [command, ...args].map((part) => /\s/.test(part) ? JSON.stringify(part) : part).join(" ");
  if (options.dryRun) {
    console.log(`[dry-run] (${options.cwd}) ${printable}`);
    return "";
  }
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    encoding: "utf8",
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
    shell: false,
  });
  if (result.error) throw new Error(`${printable} 실행 실패: ${result.error.message}`);
  if (result.status !== 0) {
    const detail = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    throw new Error(`${printable} 실행 실패 (exit ${result.status})${detail ? `\n${detail}` : ""}`);
  }
  return (result.stdout || "").trim();
}

function yamlString(value) {
  return JSON.stringify(String(value));
}

function workspacesManifest(config) {
  return {
    version: 1,
    rootRole: "orchestration-repo",
    project: {
      name: config.project.name,
      displayName: config.project.displayName,
      defaultBranch: config.project.defaultBranch,
      integrationBranch: config.project.integrationBranch,
    },
    workspaces: config.workspaces.map((workspace) => ({
      name: workspace.name,
      path: workspace.path,
      status: workspace.status,
      repoRole: "submodule",
      repoUrl: workspace.repoUrl || "",
      branch: workspace.branch || config.project.integrationBranch,
      verify: workspace.verify || [],
    })),
  };
}

function rootAgents(config) {
  const workspaceList = config.workspaces.map((workspace) => `\`${workspace.path}/\``).join("와 ");
  return `# 에이전트 전용

AI 에이전트용 맥락, 문서, 계약, 검사 스크립트는 \`.agent/\` 아래에서 관리합니다.

이 파일은 짧은 지도 역할만 하며 상세 지식은 \`.agent/docs/\`와 \`.agent/contracts/\`에 둡니다.

Git Flow, commit convention, submodule 운영 정책은 \`.agent/docs/process/git_workflow.md\`를 따릅니다.

브랜치별 AI 문맥은 \`.agent/branch-ledger/branches/<currentBranchKey>/\`에만 기록합니다. 기능 브랜치에서는 다른 브랜치 ledger를 읽거나 수정하지 않습니다.

루트는 orchestration repo이며 ${workspaceList}는 별도 저장소 submodule로 관리합니다.

루트에는 제품 런타임 코드를 두지 않습니다. 각 제품 코드는 해당 workspace 안에서만 변경하고 커밋합니다.
`;
}

function agentAgents(config) {
  const rows = config.workspaces.map((workspace) => `| \`${workspace.path}/\` | ${workspace.status} | 독립 제품 저장소 submodule |`).join("\n");
  return `# ${config.project.displayName} AI 작업 지도

이 저장소의 루트는 제품 코드가 아니라 AI 하네스와 workspace 경계를 관리합니다.

## 먼저 할 일

1. \`.agent/workspaces.json\`에서 workspace 상태와 경계를 확인합니다.
2. \`npm --prefix .agent run branch:status\`로 현재 브랜치에서 읽을 수 있는 AI 문맥을 확인합니다.
3. 제품 코드는 해당 submodule 브랜치에서 수정·검증·커밋합니다.
4. 공통 계약과 정책은 orchestration repo의 \`.agent/\`에서 관리합니다.
5. 완료 전 \`npm --prefix .agent run harness:check\`와 \`npm --prefix .agent run workspace:verify\`를 실행합니다.

## Workspace

| 경로 | 상태 | 역할 |
| :--- | :--- | :--- |
${rows}

## 문맥 경계

- 기능 브랜치는 자기 branch ledger만 읽고 씁니다.
- \`develop\`/\`main\`과 설정된 통합 브랜치에서만 전체 ledger를 통합합니다.
- 공통 지식은 \`.agent/docs/\`, API·schema 계약은 \`.agent/contracts/\`에 둡니다.
- \`.agent/docs/\` 루트에는 \`index.md\`만 두고 상세 문서는 역할별 하위 폴더에 둡니다.
`;
}

function architecture(config) {
  const rows = config.workspaces.map((workspace) => `| \`${workspace.path}/\` | ${workspace.status} | 독립 제품 저장소 |`).join("\n");
  return `# ${config.project.displayName} 상위 아키텍처

${config.project.description}

루트는 여러 제품 저장소를 하나의 정책과 검증 흐름으로 묶는 orchestration repo입니다.

| 경로 | 상태 | 역할 |
| :--- | :--- | :--- |
| \`.agent/\` | active | AI 문서, 계약, workspace manifest, 검사 도구 |
${rows}

## 경계 원칙

- 루트는 제품 런타임 코드를 소유하지 않습니다.
- 제품 변경은 각 submodule에서 먼저 커밋하고, 루트는 검증된 commit pointer를 기록합니다.
- \`.agent/workspaces.json\`을 workspace 경계의 단일 진실 공급원으로 사용합니다.
- branch ledger로 동시 AI 작업의 문맥 오염과 중앙 문서 충돌을 줄입니다.
- 공통 계약을 먼저 갱신하고 각 제품 저장소가 같은 계약을 구현하도록 검증합니다.
`;
}

function gitWorkflow(config) {
  const workspaceRows = config.workspaces.map((workspace) => `| \`${workspace.path}\` | ${workspace.name} 제품 코드와 자체 테스트 |`).join("\n");
  return `# Git 및 기능 개발 운영 정책

## 저장소 책임

| 저장소 | 책임 |
| :--- | :--- |
| root | \`.agent/\`, 계약, 통합 설정, submodule pointer |
${workspaceRows}

제품 코드 변경은 해당 submodule에서 커밋합니다. 루트 PR은 관련 child PR/commit과 검증 결과를 연결합니다.

## Git Flow

- production: \`${config.project.defaultBranch}\`
- integration: \`${config.project.integrationBranch}\`
- 기능: \`feature/<ticket>-<slug>\`
- 개발 버그: \`bugfix/<ticket>-<slug>\`
- 정책·하네스: \`chore/<slug>\`
- 배포: \`release/<version>\`
- 긴급 수정: \`hotfix/<version>-<slug>\`

기능·bugfix·chore 브랜치는 \`${config.project.integrationBranch}\`에서 시작해 같은 브랜치로 PR을 보냅니다. release는 \`${config.project.defaultBranch}\`와 \`${config.project.integrationBranch}\`에 모두 반영하고, hotfix도 두 브랜치에 역병합합니다. 보호 브랜치에는 직접 push하지 않습니다.

## 기능 개발 흐름

1. 티켓과 동일한 slug로 필요한 root/child 브랜치를 만듭니다.
2. \`npm --prefix .agent run branch:status\`로 현재 AI 문맥 경계를 확인합니다.
3. API·DB·이벤트 경계가 바뀌면 \`.agent/contracts/\` 계약을 먼저 합의합니다.
4. 각 submodule에서 test-first로 제품 코드를 구현하고 커밋·push·PR합니다.
5. child PR이 merge되면 root에서 \`git submodule update --remote <path>\` 또는 명시한 commit으로 pointer를 이동합니다.
6. root에서 \`npm --prefix .agent run harness:check\`와 \`npm --prefix .agent run workspace:verify\`를 실행합니다.
7. root PR에 child PR/commit, 계약 변경, 검증 결과를 기록합니다.
8. 통합 브랜치 merge 후 \`npm --prefix .agent run branch:index\`로 ledger 인덱스를 재생성합니다.

## Commit Convention

Conventional Commits 형식 \`<type>(<scope>): <summary>\`를 사용합니다. 한 커밋은 한 목적만 담고, root 제품 pointer 변경은 \`chore(submodules): ...\`로 기록합니다.

## 새 clone

\`git clone --recurse-submodules <root-url>\` 후 \`git submodule update --init --recursive\`를 실행합니다.
`;
}

function branchingDocs(config) {
  return `# 브랜치별 AI 문서 운영

여러 브랜치와 여러 AI 세션의 문맥이 섞이지 않도록 append-only branch ledger를 사용합니다.

- 공통 문서: \`AGENTS.md\`, \`.agent/AGENTS.md\`, \`.agent/docs/\`, \`.agent/contracts/\`
- 브랜치 고유 문맥: \`.agent/branch-ledger/branches/<currentBranchKey>/\`
- 통합 인덱스: \`.agent/docs/generated/branch_ledger.*\`
- 통합 브랜치: \`${config.project.defaultBranch}\`, \`${config.project.integrationBranch}\`

기능 브랜치는 자기 디렉터리에 새 note만 추가하고 다른 branch ledger와 통합 인덱스를 수정하지 않습니다. merge 후 통합 브랜치가 인덱스를 다시 생성하고, 반복 사용될 지식만 공통 문서로 승격합니다.
`;
}

function readme(config) {
  const rows = config.workspaces.map((workspace) => `| \`${workspace.path}/\` | ${workspace.status} | ${workspace.name} 제품 저장소 |`).join("\n");
  return `# ${config.project.displayName}

${config.project.description}

이 저장소는 제품 코드를 직접 담는 저장소가 아니라 submodule을 묶어 정책, AI 문맥, 계약과 통합 검증을 관리하는 orchestration repo입니다.

| 경로 | 상태 | 역할 |
| :--- | :--- | :--- |
| \`.agent/\` | active | AI 하네스와 공통 계약 |
${rows}

## 시작

\`git clone --recurse-submodules <root-repo-url>\`

이미 clone했다면 \`git submodule update --init --recursive\`를 실행합니다.

## 검사

- \`npm --prefix .agent run branch:status\`: 현재 AI 문맥 경계
- \`npm --prefix .agent run harness:check\`: root와 submodule 구조 검사
- \`npm --prefix .agent run workspace:verify\`: 설정된 workspace build/test 실행

세부 흐름은 \`.agent/docs/process/git_workflow.md\`를 따릅니다.
`;
}

function gitignore() {
  return `# OS
.DS_Store
Thumbs.db
[Dd]esktop.ini
$RECYCLE.BIN/

# editors
.idea/
.vscode/*
!.vscode/settings.json

# dependencies and build
node_modules/
dist/
build/
coverage/
.cache/

# local environment and secrets
.env
.env.*
!.env.example
!.env.*.example
*.pem
*.key

# logs
*.log
npm-debug.log*
`;
}

function harnessCheckSource() {
  return `import { execFileSync } from "node:child_process";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const failures = [];

async function exists(relative) {
  try { await stat(path.join(root, relative)); return true; } catch { return false; }
}

function git(args) {
  try { return execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); }
  catch { return ""; }
}

async function main() {
  const required = ["AGENTS.md", "README.md", ".agent/AGENTS.md", ".agent/ARCHITECTURE.md", ".agent/workspaces.json", ".agent/docs/index.md", ".agent/docs/process/git_workflow.md", ".agent/docs/process/branching_agent_docs.md", ".agent/contracts/README.md"];
  for (const file of required) if (!await exists(file)) failures.push(\`\${file}: 필수 파일 없음\`);

  if (await exists(".agent/docs")) {
    const entries = await readdir(path.join(root, ".agent/docs"), { withFileTypes: true });
    for (const entry of entries) if (entry.isFile() && entry.name !== "index.md") failures.push(\`.agent/docs/\${entry.name}: docs 루트에는 index.md만 허용\`);
  }

  const manifest = JSON.parse(await readFile(path.join(root, ".agent/workspaces.json"), "utf8"));
  const rootHasGit = await exists(".git");
  const seen = new Set();
  for (const workspace of manifest.workspaces || []) {
    if (seen.has(workspace.path)) failures.push(\`\${workspace.path}: workspace 경로 중복\`);
    seen.add(workspace.path);
    if (workspace.status === "active") {
      if (!await exists(workspace.path)) failures.push(\`\${workspace.path}: active workspace 경로 없음\`);
      const stage = git(["ls-files", "--stage", "--", workspace.path]);
      if (!rootHasGit) failures.push(".git: active submodule을 관리할 root Git 저장소 없음");
      else if (!stage.startsWith("160000 ")) failures.push(\`\${workspace.path}: Git submodule pointer가 아님\`);
    }
  }

  const rootEntries = await readdir(root, { withFileTypes: true });
  const allowedDirs = new Set([".agent", ".git", ...manifest.workspaces.map((item) => item.path.split("/")[0])]);
  for (const entry of rootEntries) {
    if (entry.isDirectory() && ["src", "pages", "assets"].includes(entry.name) && !allowedDirs.has(entry.name)) failures.push(\`\${entry.name}/: 제품 코드는 workspace 안에 둬야 함\`);
    if (entry.isFile() && entry.name === "index.html") failures.push("index.html: 제품 코드는 workspace 안에 둬야 함");
  }

  if (failures.length) {
    console.error("하네스 검사 실패");
    failures.forEach((failure) => console.error(\`- \${failure}\`));
    process.exitCode = 1;
  } else {
    console.log("하네스 검사 통과: root 경계, 문서 구조, workspace 상태를 확인했습니다.");
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
`;
}

function verifyWorkspacesSource() {
  return `import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const manifest = JSON.parse(await readFile(path.join(root, ".agent/workspaces.json"), "utf8"));
let failed = false;

function resolveCommand(parts) {
  let executable = parts[0];
  const args = parts.slice(1);
  if (process.platform !== "win32") return { executable, args };
  if (!/\\.(?:bat|cmd)$/i.test(executable)) return { executable, args };
  const commandLine = [executable, ...args].map((part) => \`"\${part}"\`).join(" ");
  return { executable: process.env.ComSpec || "cmd.exe", args: ["/d", "/s", "/c", commandLine] };
}

for (const workspace of manifest.workspaces || []) {
  if (workspace.status !== "active") { console.log(\`SKIP \${workspace.name}: planned\`); continue; }
  for (const check of workspace.verify || []) {
    const parts = process.platform === "win32" && check.windowsCommand ? check.windowsCommand : check.command;
    const { executable, args } = resolveCommand(parts);
    console.log(\`RUN  \${workspace.name}/\${check.name}: \${parts.join(" ")}\`);
    const result = spawnSync(executable, args, { cwd: root, stdio: "inherit", shell: false });
    if (result.error || result.status !== 0) {
      console.error(\`FAIL \${workspace.name}/\${check.name}\${result.error ? \`: \${result.error.message}\` : ""}\`);
      failed = true;
      break;
    }
  }
}

if (failed) process.exitCode = 1;
else console.log("Workspace 검증 완료");
`;
}

function branchLedgerSource() {
  return `import { execFileSync } from "node:child_process";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const agent = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = path.resolve(agent, "..");
const branchesDir = path.join(agent, "branch-ledger", "branches");
const generatedDir = path.join(agent, "docs", "generated");
const config = JSON.parse(await readFile(path.join(agent, "workspaces.json"), "utf8"));
const integration = new Set([config.project.defaultBranch, config.project.integrationBranch, "main", "master", "develop"]);

function git(args) { try { return execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch { return ""; } }
function branch() { return git(["branch", "--show-current"]) || \`detached-\${git(["rev-parse", "--short", "HEAD"]) || "unknown"}\`; }
function key(value) { return value.replace(/[^A-Za-z0-9._-]+/g, "__").replace(/^[-_.]+|[-_.]+$/g, "") || "unnamed"; }
function slug(value) { return String(value || "note").normalize("NFKD").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "note"; }
function timestamp() { return new Date().toISOString().replace(/[-:]/g, "").replace(/\\.\\d{3}Z$/, "Z"); }
async function exists(file) { try { await stat(file); return true; } catch { return false; } }
function args(tokens) { const result = {}; for (let i = 0; i < tokens.length; i += 1) { if (!tokens[i].startsWith("--")) continue; const name = tokens[i].slice(2); result[name] = tokens[i + 1] && !tokens[i + 1].startsWith("--") ? tokens[++i] : true; } return result; }
function changed() { const set = new Set(); for (const command of [["diff", "--name-only"], ["diff", "--cached", "--name-only"], ["ls-files", "--others", "--exclude-standard"]]) git(command).split(/\\r?\\n/).filter(Boolean).forEach((file) => set.add(file.replaceAll("\\\\", "/"))); return [...set]; }

async function note(tokens) {
  const options = args(tokens); const current = branch(); const branchKey = key(current); const now = new Date().toISOString();
  const id = \`\${timestamp()}-\${branchKey}-\${slug(options.title)}\`; const dir = path.join(branchesDir, branchKey); await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, \`\${id}.md\`), \`---\\nid: \${id}\\nbranch: \${current}\\nbranchKey: \${branchKey}\\ncreatedAt: \${now}\\nbaseRef: \${config.project.integrationBranch}\\nscope: \${options.scope || "shared"}\\nstatus: draft\\n---\\n\\n# \${options.title || "작업 기록"}\\n\\n## 배경\\n\\n- \\n\\n## 변경 요약\\n\\n- \\n\\n## 에이전트 주의사항\\n\\n- \\n\\n## 통합 시 반영할 내용\\n\\n- \\n\`, "utf8");
  console.log(\`.agent/branch-ledger/branches/\${branchKey}/\${id}.md 생성\`);
}

async function index() {
  const current = branch(); if (!integration.has(current)) throw new Error(\`통합 브랜치에서만 index를 생성합니다: \${current}\`);
  const entries = []; if (await exists(branchesDir)) for (const dir of await readdir(branchesDir, { withFileTypes: true })) { if (!dir.isDirectory()) continue; for (const file of await readdir(path.join(branchesDir, dir.name))) if (file.endsWith(".md")) entries.push(\`.agent/branch-ledger/branches/\${dir.name}/\${file}\`); }
  entries.sort(); await mkdir(generatedDir, { recursive: true }); const data = { generatedAt: new Date().toISOString(), integrationBranch: current, entries };
  await writeFile(path.join(generatedDir, "branch_ledger.json"), \`\${JSON.stringify(data, null, 2)}\\n\`, "utf8");
  await writeFile(path.join(generatedDir, "branch_ledger.md"), ["# 브랜치 AI Ledger 통합 인덱스", "", \`생성 시각: \${data.generatedAt}\`, "", ...entries.map((file) => \`- \${file}\`), entries.length ? "" : "- 아직 기록이 없습니다.", ""].join("\\n"), "utf8");
  console.log(\`ledger \${entries.length}개 통합\`);
}

function check() {
  const current = branch(); const branchKey = key(current); const failures = [];
  if (!integration.has(current)) for (const file of changed()) { const match = file.match(/^\\.agent\\/branch-ledger\\/branches\\/([^/]+)\\//); if (match && match[1] !== branchKey) failures.push(\`\${file}: 다른 브랜치 ledger 수정\`); if (file.startsWith(".agent/docs/generated/branch_ledger.")) failures.push(\`\${file}: 기능 브랜치에서 통합 인덱스 수정\`); }
  if (failures.length) { failures.forEach((item) => console.error(\`- \${item}\`)); process.exitCode = 1; } else console.log(\`branch ledger 검사 통과: \${current}\`);
}

const [command = "status", ...tokens] = process.argv.slice(2); const current = branch();
if (command === "status") console.log(\`현재 브랜치: \${current}\\n허용 ledger: .agent/branch-ledger/branches/\${key(current)}/\\n통합 브랜치: \${integration.has(current) ? "예" : "아니오"}\`);
else if (command === "new") await note(tokens);
else if (command === "check") check();
else if (command === "index") await index();
else throw new Error(\`알 수 없는 명령: \${command}\`);
`;
}

function filesFor(config) {
  const manifest = workspacesManifest(config);
  const generatedAt = new Date().toISOString();
  return new Map([
    ["AGENTS.md", rootAgents(config)],
    ["README.md", readme(config)],
    [".gitignore", gitignore()],
    [".agent/AGENTS.md", agentAgents(config)],
    [".agent/ARCHITECTURE.md", architecture(config)],
    [".agent/workspaces.json", `${JSON.stringify(manifest, null, 2)}\n`],
    [".agent/package.json", `${JSON.stringify({ name: `${config.project.name}-ai-harness`, private: true, type: "module", scripts: { "branch:status": "node tools/branch-ledger.mjs status", "branch:note": "node tools/branch-ledger.mjs new", "branch:check": "node tools/branch-ledger.mjs check", "branch:index": "node tools/branch-ledger.mjs index", "harness:check": "node tools/harness-check.mjs && npm run branch:check", "workspace:verify": "node tools/verify-workspaces.mjs", lint: "npm run harness:check" }, engines: { node: ">=20" } }, null, 2)}\n`],
    [".agent/tools/harness-check.mjs", harnessCheckSource()],
    [".agent/tools/verify-workspaces.mjs", verifyWorkspacesSource()],
    [".agent/tools/branch-ledger.mjs", branchLedgerSource()],
    [".agent/contracts/README.md", "# 공통 계약\n\nAPI, database schema, event와 제품 저장소 사이의 합의 사항을 둡니다. 구현보다 계약 변경을 먼저 검토합니다.\n"],
    [".agent/docs/index.md", "# AI 하네스 문서 인덱스\n\n- `architecture/`: workspace 책임과 경계\n- `harness/`: AI 작업 루프와 검사\n- `process/`: Git, branch ledger, 기능 개발 정책\n- `generated/`: 통합 브랜치에서 재생성하는 인덱스\n"],
    [".agent/docs/architecture/index.md", "# 아키텍처 문서\n\n상위 구조와 workspace 책임을 기록합니다. 시작점은 `.agent/ARCHITECTURE.md`입니다.\n"],
    [".agent/docs/harness/index.md", "# 하네스 문서\n\nAI 작업 시작, 구현, 검증, 인계 흐름을 기록합니다.\n"],
    [".agent/docs/harness/ai_harness_guide.md", "# AI 하네스 가이드\n\n1. workspaces manifest와 branch status를 읽습니다.\n2. 계약과 영향 workspace를 정합니다.\n3. 제품 코드는 각 submodule에서 구현·검증합니다.\n4. branch note에 결정과 다음 작업을 남깁니다.\n5. root harness와 workspace 검증을 통과시킵니다.\n6. child PR merge 후 root pointer를 갱신합니다.\n"],
    [".agent/docs/process/index.md", "# 프로세스 문서\n\n- `git_workflow.md`: Git Flow, submodule, 기능 개발 흐름\n- `branching_agent_docs.md`: 브랜치별 AI 문맥 격리\n"],
    [".agent/docs/process/git_workflow.md", gitWorkflow(config)],
    [".agent/docs/process/branching_agent_docs.md", branchingDocs(config)],
    [".agent/docs/generated/branch_ledger.json", `${JSON.stringify({ generatedAt, integrationBranch: config.project.integrationBranch, entries: [] }, null, 2)}\n`],
    [".agent/docs/generated/branch_ledger.md", `# 브랜치 AI Ledger 통합 인덱스\n\n생성 시각: ${generatedAt}\n\n- 아직 기록이 없습니다.\n`],
    [".agent/branch-ledger/README.md", "# 브랜치 AI Ledger\n\n기능 브랜치는 자기 브랜치 디렉터리에 append-only note를 추가합니다. 다른 브랜치 기록과 generated 인덱스는 통합 브랜치에서만 다룹니다.\n"],
    [".agent/branch-ledger/branches/.gitkeep", ""],
  ]);
}

async function assertTarget(target, options) {
  if (!await exists(target)) return;
  const entries = await readdir(target);
  if (entries.length > 0 && !options["allow-existing"]) {
    throw new Error(`대상 디렉터리가 비어 있지 않습니다: ${target}\n기존 프로젝트에 추가하려면 --allow-existing을 명시하세요.`);
  }
}

async function writeGeneratedFiles(target, files, options) {
  const collisions = [];
  for (const relative of files.keys()) if (await exists(path.join(target, relative))) collisions.push(relative);
  if (collisions.length > 0) throw new Error(`기존 파일을 덮어쓰지 않습니다:\n${collisions.map((item) => `- ${item}`).join("\n")}`);

  for (const [relative, content] of files) {
    const destination = path.join(target, relative);
    if (options["dry-run"]) {
      console.log(`[dry-run] create ${relative}`);
      continue;
    }
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, content.endsWith("\n") || content === "" ? content : `${content}\n`, "utf8");
  }
}

async function initGit(target, config, options) {
  if (options["no-git"]) return;
  const dryRun = Boolean(options["dry-run"]);
  if (!dryRun && spawnSync("git", ["--version"], { stdio: "ignore" }).status !== 0) throw new Error("Git을 찾을 수 없습니다.");
  const hasOwnGitDir = dryRun ? false : await exists(path.join(target, ".git"));
  if (!hasOwnGitDir) {
    const result = spawnSync("git", ["init", "-b", config.project.defaultBranch], { cwd: target, encoding: "utf8", stdio: dryRun ? "ignore" : "inherit" });
    if (dryRun) console.log(`[dry-run] (${target}) git init -b ${config.project.defaultBranch}`);
    else if (result.status !== 0) {
      run("git", ["init"], { cwd: target });
      run("git", ["symbolic-ref", "HEAD", `refs/heads/${config.project.defaultBranch}`], { cwd: target });
    }
  }
  if (config.git?.remoteUrl) {
    const remotes = dryRun ? "" : run("git", ["remote"], { cwd: target, capture: true });
    if (!remotes.split(/\r?\n/).includes("origin")) run("git", ["remote", "add", "origin", config.git.remoteUrl], { cwd: target, dryRun });
  }
  if (options["skip-submodules"]) return;
  for (const workspace of config.workspaces.filter((item) => item.status === "active")) {
    const workspaceTarget = path.join(target, workspace.path);
    if (!dryRun && await exists(path.join(workspaceTarget, ".git"))) {
      console.log(`SKIP ${workspace.path}: 이미 Git workspace가 있습니다.`);
      continue;
    }
    const branchName = workspace.branch || config.project.integrationBranch;
    run("git", ["submodule", "add", "-b", branchName, "--", workspace.repoUrl, workspace.path], { cwd: target, dryRun });
  }
}

async function init(options) {
  const configFile = path.resolve(SOURCE_ROOT, String(options.config || DEFAULT_CONFIG));
  const config = validateConfig(JSON.parse(await readFile(configFile, "utf8")));
  const targetValue = options.target || config.targetDirectory;
  if (!targetValue) throw new Error("--target 또는 설정의 targetDirectory가 필요합니다.");
  const target = path.resolve(SOURCE_ROOT, String(targetValue));
  await assertTarget(target, options);
  if (!options["dry-run"]) await mkdir(target, { recursive: true });
  console.log(`프로젝트: ${config.project.displayName}`);
  console.log(`대상: ${target}`);
  await writeGeneratedFiles(target, filesFor(config), options);
  await initGit(target, config, options);
  console.log(options["dry-run"] ? "\nDry-run 완료: 실제 파일이나 Git 상태는 변경하지 않았습니다." : `\n생성 완료: ${target}`);
  console.log("다음 단계:");
  console.log(`1. cd ${JSON.stringify(target)}`);
  console.log("2. npm --prefix .agent run harness:check");
  console.log("3. npm --prefix .agent run workspace:verify");
  console.log(`4. git add . && git commit -m ${JSON.stringify("chore(orchestration): initialize AI harness")}`);
  console.log(`5. git switch -c ${config.project.integrationBranch} (최초 commit 후)`);
}

async function doctor(options) {
  const target = path.resolve(SOURCE_ROOT, String(options.target || "."));
  const required = ["AGENTS.md", ".agent/AGENTS.md", ".agent/ARCHITECTURE.md", ".agent/workspaces.json", ".agent/tools/harness-check.mjs", ".agent/docs/process/git_workflow.md"];
  const failures = [];
  for (const relative of required) if (!await exists(path.join(target, relative))) failures.push(`${relative}: 없음`);
  if (failures.length) {
    console.error(`doctor 실패: ${target}`);
    failures.forEach((item) => console.error(`- ${item}`));
    process.exitCode = 1;
    return;
  }
  run(process.execPath, [".agent/tools/harness-check.mjs"], { cwd: target });
  console.log(`doctor 통과: ${target}`);
}

async function main() {
  const { command, options } = parseArgs(process.argv.slice(2));
  if (command === "help" || options.help) return printHelp();
  if (command === "init") return init(options);
  if (command === "doctor") return doctor(options);
  throw new Error(`지원하지 않는 명령입니다: ${command}`);
}

main().catch((error) => {
  console.error(`오류: ${error.message}`);
  process.exitCode = 1;
});
