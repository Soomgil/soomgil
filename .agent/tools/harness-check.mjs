import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const failures = [];
const textExtensions = new Set([".css", ".html", ".js", ".json", ".md", ".mjs", ".ts", ".vue", ".svg", ".txt"]);
const ignoredDirs = new Set([".git", "node_modules", "dist"]);

function recordFailure(filePath, message) {
  failures.push(`${filePath} - ${message}`);
}

async function pathExists(projectPath) {
  try {
    await stat(path.join(rootDir, projectPath));
    return true;
  } catch {
    return false;
  }
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name)) continue;
      files.push(...await walk(fullPath));
      continue;
    }
    if (entry.isFile()) files.push(fullPath);
  }

  return files;
}

function toProjectPath(filePath) {
  return path.relative(rootDir, filePath).split(path.sep).join("/");
}

async function readJson(projectPath) {
  return JSON.parse(await readFile(path.join(rootDir, projectPath), "utf8"));
}

async function checkRequiredFiles() {
  const required = [
    "AGENTS.md",
    "README.md",
    ".agent/AGENTS.md",
    ".agent/ARCHITECTURE.md",
    ".agent/workspaces.json",
    ".agent/contracts/README.md",
    ".agent/contracts/backend_contract_decisions.md",
    ".agent/contracts/openapi.yaml",
    ".agent/contracts/schema.dbml",
    ".agent/docs/index.md",
    ".agent/docs/api/index.md",
    ".agent/docs/api/api_spec.md",
    ".agent/docs/architecture/index.md",
    ".agent/docs/harness/ai_harness_guide.md",
    ".agent/docs/harness/index.md",
    ".agent/docs/process/index.md",
    ".agent/docs/process/git_workflow.md",
    ".agent/docs/process/branching_agent_docs.md",
    ".agent/docs/architecture/architecture_guide.md",
    ".agent/docs/frontend/index.md",
    ".agent/docs/frontend/page_map.md",
    ".agent/docs/frontend/component_guide.md",
    ".agent/docs/frontend/carousel_guide.md",
    ".agent/docs/frontend/style_effects_guide.md",
    ".agent/docs/product-specs/index.md",
    ".agent/docs/product-specs/functional_spec.md",
    ".agent/docs/generated/branch_ledger.md",
    ".agent/docs/generated/branch_ledger.json",
    ".agent/docs/generated/ui_inventory.md",
    ".agent/docs/generated/ui_inventory.json",
    ".agent/branch-ledger/README.md",
    ".agent/tools/build-ui-knowledge.mjs",
    ".agent/tools/agent-ledger.mjs",
    ".agent/tools/harness-check.mjs",
    ".agent/tools/smoke-local.mjs",
  ];

  for (const filePath of required) {
    if (!await pathExists(filePath)) {
      recordFailure(filePath, "필수 파일이 없습니다.");
    }
  }
}

async function checkDocsArchitecture() {
  const docsDir = path.join(rootDir, ".agent", "docs");
  const entries = await readdir(docsDir, { withFileTypes: true });
  const allowedRootFiles = new Set(["index.md"]);

  for (const entry of entries) {
    if (entry.isFile() && !allowedRootFiles.has(entry.name)) {
      recordFailure(
        `.agent/docs/${entry.name}`,
        "OpenAI Harness Engineering 원칙에 따라 .agent/docs 루트에는 index.md만 둡니다. 역할별 하위 폴더로 이동하세요.",
      );
    }
  }
}

async function checkRootBoundary() {
  const forbidden = ["index.html", "pages", "assets", "src", "soomgil-frontend"];
  for (const item of forbidden) {
    if (await pathExists(item)) {
      recordFailure(item, "루트는 상위 하네스만 담당합니다. 제품 코드는 frontend/ 또는 backend/에 둡니다.");
    }
  }

  const rootGuide = await readFile(path.join(rootDir, "AGENTS.md"), "utf8");
  if (!rootGuide.includes(".agent/") || !rootGuide.includes("frontend/") || !rootGuide.includes("backend/")) {
    recordFailure("AGENTS.md", "루트 AGENTS.md는 .agent/, frontend/, backend/ 경계를 안내해야 합니다.");
  }

  const readme = await readFile(path.join(rootDir, "README.md"), "utf8");
  for (const term of [".agent/workspaces.json", ".agent/contracts/backend_contract_decisions.md", ".agent/branch-ledger/", "frontend/", "backend/"]) {
    if (!readme.includes(term)) {
      recordFailure("README.md", `${term} 안내가 필요합니다.`);
    }
  }
}

async function checkWorkspaceConfig() {
  const config = await readJson(".agent/workspaces.json");
  const names = new Set(config.workspaces?.map((workspace) => workspace.name));
  if (!names.has("frontend") || !names.has("backend")) {
    recordFailure(".agent/workspaces.json", "frontend와 backend 워크스페이스가 모두 선언되어야 합니다.");
  }

  const frontend = config.workspaces.find((workspace) => workspace.name === "frontend");
  if (!["planned", "active"].includes(frontend?.status) || frontend?.path !== "frontend") {
    recordFailure(".agent/workspaces.json", "frontend는 planned 또는 active 상태의 frontend/ 경로여야 합니다.");
  }

  const backend = config.workspaces.find((workspace) => workspace.name === "backend");
  if (!["planned", "active"].includes(backend?.status)) {
    recordFailure(".agent/workspaces.json", "backend는 planned 또는 active 상태여야 합니다.");
  }
}

async function checkFrontend() {
  const config = await readJson(".agent/workspaces.json");
  const frontendWorkspace = config.workspaces.find((workspace) => workspace.name === "frontend");
  if (frontendWorkspace?.status !== "active") {
    return;
  }

  let missingRequiredFrontendFile = false;
  for (const filePath of ["frontend/package.json", "frontend/index.html", "frontend/src/app/main.ts", "frontend/src/router/index.ts", "frontend/.env.example"]) {
    if (!await pathExists(filePath)) {
      recordFailure(filePath, "frontend active 상태에서는 필수 파일이 필요합니다.");
      missingRequiredFrontendFile = true;
    }
  }
  if (missingRequiredFrontendFile) return;

  const packageJson = await readJson("frontend/package.json");
  const deps = { ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) };
  for (const dependency of ["vue", "vue-router", "vite", "@vitejs/plugin-vue"]) {
    if (!deps[dependency]) recordFailure("frontend/package.json", `${dependency} 의존성이 필요합니다.`);
  }
  if (!packageJson.scripts?.dev || !packageJson.scripts?.build) {
    recordFailure("frontend/package.json", "dev/build 스크립트가 필요합니다.");
  }

  if (await pathExists("frontend/.env")) {
    recordFailure("frontend/.env", "실제 환경 파일은 커밋 대상이 아닙니다. frontend/.env.local을 사용하고 .env.example만 남깁니다.");
  }

  const indexHtml = await readFile(path.join(rootDir, "frontend", "index.html"), "utf8");
  if (!/<div\s+id=["']app["']><\/div>/i.test(indexHtml)) {
    recordFailure("frontend/index.html", "Vue mount 대상 #app이 필요합니다.");
  }

  const inventory = await readJson(".agent/docs/generated/ui_inventory.json");
  const frontend = inventory.workspaces.find((workspace) => workspace.name === "frontend");
  if (!frontend) {
    recordFailure(".agent/docs/generated/ui_inventory.json", "frontend 인벤토리가 필요합니다.");
    return;
  }
  if (frontend.summary.routes < 10 || frontend.summary.pages < 10) {
    recordFailure("frontend/src/router/index.ts", "프론트 라우트와 페이지 인벤토리가 부족합니다.");
  }

  for (const route of frontend.routes) {
    if (route.path.includes(":pathMatch")) continue;
    if (!await pathExists(path.join("frontend", route.page))) {
      recordFailure("frontend/src/router/index.ts", `라우트 페이지 파일이 없습니다: ${route.page}`);
    }
  }

  for (const module of frontend.vueModules) {
    for (const image of module.images) {
      if (!image.alt) {
        recordFailure(module.path, "이미지에는 alt 또는 :alt가 필요합니다.");
      }
    }
  }
}

async function checkConflictMarkers(files) {
  for (const file of files) {
    if (!textExtensions.has(path.extname(file))) continue;
    const projectPath = toProjectPath(file);
    const text = await readFile(file, "utf8");
    const lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      if (/^(<<<<<<<|>>>>>>>)($|\s)/.test(line) || /^=======$/.test(line)) {
        recordFailure(`${projectPath}:${index + 1}`, "병합 충돌 표식이 남아 있습니다.");
      }
    });
  }
}

async function run() {
  const files = await walk(rootDir);

  await checkRequiredFiles();
  await checkDocsArchitecture();
  await checkRootBoundary();
  await checkWorkspaceConfig();
  await checkFrontend();
  await checkConflictMarkers(files);

  if (failures.length > 0) {
    console.error("AI 하네스 검사 실패");
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exitCode = 1;
    return;
  }

  console.log("AI 하네스 검사 통과: 상위 워크스페이스 경계와 planned/active 워크스페이스 정책을 확인했습니다.");
}

run().catch((error) => {
  console.error("AI 하네스 검사 실행 중 오류가 발생했습니다.");
  console.error(error);
  process.exitCode = 1;
});
