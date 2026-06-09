import { execFileSync } from "node:child_process";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const agentDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rootDir = path.resolve(agentDir, "..");
const ledgerDir = path.join(agentDir, "branch-ledger");
const branchRoot = path.join(ledgerDir, "branches");
const generatedDir = path.join(agentDir, "docs", "generated");
const integrationBranches = new Set(["develop", "main", "master"]);

function git(args, options = {}) {
  try {
    return execFileSync("git", args, {
      cwd: rootDir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", options.quiet ? "ignore" : "pipe"],
    }).trim();
  } catch {
    return "";
  }
}

function currentBranch() {
  const branch = git(["branch", "--show-current"], { quiet: true });
  if (branch) return branch;
  const sha = git(["rev-parse", "--short", "HEAD"], { quiet: true }) || "unknown";
  return `detached-${sha}`;
}

function branchKey(branch) {
  return branch.replace(/[^A-Za-z0-9._-]+/g, "__").replace(/^[-_.]+|[-_.]+$/g, "") || "unnamed";
}

function timestamp() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function parseArgs(rawArgs) {
  const args = {};
  for (let index = 0; index < rawArgs.length; index += 1) {
    const token = rawArgs[index];
    if (!token.startsWith("--")) continue;
    const [name, inlineValue] = token.slice(2).split("=", 2);
    if (inlineValue != null) {
      args[name] = inlineValue;
      continue;
    }
    const next = rawArgs[index + 1];
    if (next && !next.startsWith("--")) {
      args[name] = next;
      index += 1;
    } else {
      args[name] = true;
    }
  }
  return args;
}

function slugify(input) {
  const slug = String(input || "")
    .normalize("NFKD")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return slug || "note";
}

async function pathExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listMarkdownEntries() {
  if (!await pathExists(branchRoot)) return [];
  const branchDirs = await readdir(branchRoot, { withFileTypes: true });
  const entries = [];

  for (const branchDir of branchDirs) {
    if (!branchDir.isDirectory()) continue;
    const files = await readdir(path.join(branchRoot, branchDir.name), { withFileTypes: true });
    for (const file of files) {
      if (!file.isFile() || !file.name.endsWith(".md")) continue;
      const projectPath = `.agent/branch-ledger/branches/${branchDir.name}/${file.name}`;
      const text = await readFile(path.join(rootDir, projectPath), "utf8");
      entries.push({
        branchKey: branchDir.name,
        file: projectPath,
        frontmatter: parseFrontmatter(text),
        title: parseTitle(text),
      });
    }
  }

  return entries.sort((left, right) => left.file.localeCompare(right.file));
}

function parseFrontmatter(text) {
  if (!text.startsWith("---\n")) return {};
  const end = text.indexOf("\n---", 4);
  if (end === -1) return {};
  const frontmatter = {};
  for (const line of text.slice(4, end).split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    frontmatter[key] = value;
  }
  return frontmatter;
}

function parseTitle(text) {
  const match = text.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() || "Untitled branch note";
}

function changedFiles() {
  const files = new Set();
  for (const args of [
    ["diff", "--name-only"],
    ["diff", "--cached", "--name-only"],
    ["ls-files", "--others", "--exclude-standard"],
  ]) {
    const output = git(args, { quiet: true });
    output.split(/\r?\n/).filter(Boolean).forEach((file) => files.add(file));
  }
  return [...files].map((file) => file.split(path.sep).join("/"));
}

function printStatus() {
  const branch = currentBranch();
  const safeBranch = branchKey(branch);
  const isIntegration = integrationBranches.has(branch);
  console.log(`현재 브랜치: ${branch}`);
  console.log(`브랜치 ledger: .agent/branch-ledger/branches/${safeBranch}/`);
  console.log(`통합 브랜치 여부: ${isIntegration ? "예" : "아니오"}`);
  console.log("");
  console.log("허용되는 AI 문맥:");
  console.log("- 공통 하네스 문서: AGENTS.md, .agent/AGENTS.md, .agent/docs/");
  console.log(`- 현재 브랜치 기록: .agent/branch-ledger/branches/${safeBranch}/`);
  if (isIntegration) {
    console.log("- 통합 작업 중에는 모든 브랜치 ledger를 읽고 .agent/docs/generated/branch_ledger.*를 재생성할 수 있습니다.");
  } else {
    console.log("- 다른 브랜치 ledger는 읽거나 수정하지 않습니다. 통합은 develop/main에서만 합니다.");
  }
}

async function createNote(rawArgs) {
  const args = parseArgs(rawArgs);
  const branch = currentBranch();
  const safeBranch = branchKey(branch);
  const createdAt = new Date().toISOString();
  const id = `${timestamp()}-${safeBranch}-${slugify(args.title || "note")}`;
  const scope = args.scope || "shared";
  const title = args.title || "작업 기록";
  const dir = path.join(branchRoot, safeBranch);
  const file = path.join(dir, `${id}.md`);
  await mkdir(dir, { recursive: true });

  const content = `---
id: ${id}
branch: ${branch}
branchKey: ${safeBranch}
createdAt: ${createdAt}
baseRef: develop
scope: ${scope}
status: draft
---

# ${title}

## 배경

- 이 브랜치에서만 필요한 AI 문맥을 기록합니다.
- 다른 브랜치의 ledger를 참조하지 않습니다.

## 변경 요약

- 

## 에이전트 주의사항

- 

## develop 통합 시 반영할 내용

- 
`;

  await writeFile(file, content, "utf8");
  console.log(`브랜치 ledger 생성: ${path.relative(rootDir, file).split(path.sep).join("/")}`);
}

async function writeIndex() {
  const branch = currentBranch();
  if (!integrationBranches.has(branch)) {
    console.error(`branch:index는 통합 브랜치에서만 실행합니다. 현재 브랜치: ${branch}`);
    process.exitCode = 1;
    return;
  }

  const entries = await listMarkdownEntries();
  await mkdir(generatedDir, { recursive: true });

  const json = {
    generatedAt: new Date().toISOString(),
    integrationBranch: branch,
    entries: entries.map((entry) => ({
      id: entry.frontmatter.id || path.basename(entry.file, ".md"),
      branch: entry.frontmatter.branch || entry.branchKey,
      branchKey: entry.frontmatter.branchKey || entry.branchKey,
      createdAt: entry.frontmatter.createdAt || "",
      scope: entry.frontmatter.scope || "",
      status: entry.frontmatter.status || "",
      title: entry.title,
      file: entry.file,
    })),
  };

  const markdown = [
    "# 브랜치 AI Ledger 통합 인덱스",
    "",
    `생성 시각: ${json.generatedAt}`,
    `통합 브랜치: ${branch}`,
    "",
    "이 파일은 통합 브랜치에서 `npm --prefix .agent run branch:index`로 재생성합니다.",
    "기능 브랜치에서는 이 파일을 수정하지 않습니다.",
    "",
    "## 기록",
    "",
    ...json.entries.map((entry) => `- ${entry.createdAt || "unknown"} | ${entry.branch} | ${entry.scope || "scope 없음"} | ${entry.title} | ${entry.file}`),
    json.entries.length === 0 ? "- 아직 브랜치별 기록이 없습니다." : "",
    "",
  ].filter((line, index, array) => !(line === "" && array[index - 1] === "")).join("\n");

  await writeFile(path.join(generatedDir, "branch_ledger.json"), `${JSON.stringify(json, null, 2)}\n`, "utf8");
  await writeFile(path.join(generatedDir, "branch_ledger.md"), `${markdown}\n`, "utf8");
  console.log(`브랜치 ledger 인덱스 생성 완료: ${json.entries.length}개 기록`);
}

async function check() {
  const branch = currentBranch();
  const safeBranch = branchKey(branch);
  const isIntegration = integrationBranches.has(branch);
  const files = changedFiles();
  const failures = [];
  const warnings = [];

  if (!await pathExists(path.join(ledgerDir, "README.md"))) {
    failures.push(".agent/branch-ledger/README.md - 브랜치 ledger 운영 문서가 필요합니다.");
  }

  for (const file of files) {
    const ledgerPrefix = ".agent/branch-ledger/branches/";
    if (file.startsWith(ledgerPrefix)) {
      const rest = file.slice(ledgerPrefix.length);
      const targetBranch = rest.split("/")[0];
      if (targetBranch && targetBranch !== safeBranch && !isIntegration) {
        failures.push(`${file} - 현재 브랜치(${branch})에서는 다른 브랜치 ledger를 수정할 수 없습니다.`);
      }
    }

    if (!isIntegration && file.startsWith(".agent/docs/generated/branch_ledger.")) {
      failures.push(`${file} - 통합 인덱스는 develop/main에서만 재생성합니다.`);
    }

    const sharedDoc = file === "AGENTS.md" ||
      file === ".agent/AGENTS.md" ||
      file.startsWith(".agent/docs/") ||
      file === ".agent/ARCHITECTURE.md";
    if (!isIntegration && sharedDoc && !file.startsWith(".agent/docs/generated/ui_inventory.")) {
      warnings.push(`${file} - 기능 브랜치에서 공통 AI 문서를 바꿨습니다. 가능하면 branch ledger에 기록하고 develop에서 통합하세요.`);
    }
  }

  if (warnings.length > 0) {
    console.warn("브랜치 ledger 경고");
    warnings.forEach((warning) => console.warn(`- ${warning}`));
  }

  if (failures.length > 0) {
    console.error("브랜치 ledger 검사 실패");
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exitCode = 1;
    return;
  }

  console.log(`브랜치 ledger 검사 통과: ${branch} (${isIntegration ? "integration" : "feature"})`);
}

async function main() {
  const [command = "status", ...rawArgs] = process.argv.slice(2);
  if (command === "status") {
    printStatus();
    return;
  }
  if (command === "new") {
    await createNote(rawArgs);
    return;
  }
  if (command === "index" || command === "integrate") {
    await writeIndex();
    return;
  }
  if (command === "check") {
    await check();
    return;
  }

  console.error(`알 수 없는 명령입니다: ${command}`);
  console.error("사용 가능: status, new, check, index");
  process.exitCode = 1;
}

main().catch((error) => {
  console.error("브랜치 ledger 도구 실행 중 오류가 발생했습니다.");
  console.error(error);
  process.exitCode = 1;
});
