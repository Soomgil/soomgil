import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const generatedDir = path.join(rootDir, ".agent", "docs", "generated");
const jsonPath = path.join(generatedDir, "ui_inventory.json");
const mdPath = path.join(generatedDir, "ui_inventory.md");
const workspacePath = path.join(rootDir, ".agent", "workspaces.json");
const checkOnly = process.argv.includes("--check");

function projectPath(filePath) {
  return path.relative(rootDir, filePath).split(path.sep).join("/");
}

async function pathExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir, extensions) {
  if (!await pathExists(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      files.push(...await walk(fullPath, extensions));
      continue;
    }
    if (entry.isFile() && extensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function stripTags(value) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function attrValue(attrs, name) {
  const pattern = new RegExp(`(?:^|\\s)${name}\\s*=\\s*["']([^"']*)["']`, "i");
  return attrs.match(pattern)?.[1] ?? "";
}

function extractClassNames(text) {
  return unique(
    [...text.matchAll(/\bclass\s*=\s*["']([^"']+)["']/g)]
      .flatMap((match) => match[1].split(/\s+/))
      .map((name) => name.trim()),
  );
}

function extractPublicRefs(text) {
  return unique([
    ...[...text.matchAll(/["'`]\/([^"'`)\s]+\.(?:png|jpe?g|svg|webp|gif|xlsx|json))["'`]/gi)].map((match) => `/${match[1]}`),
    ...[...text.matchAll(/["'`]@\/assets\/([^"'`)]+)["'`]/g)].map((match) => `@/assets/${match[1]}`),
  ]);
}

async function inspectVue(filePath, workspaceRoot) {
  const text = await readFile(filePath, "utf8");
  const template = text.match(/<template>([\s\S]*?)<\/template>/i)?.[1] ?? "";
  const scriptTag = text.match(/<script\b([^>]*)>/i)?.[1] ?? "";
  const headings = [...template.matchAll(/<h([1-6])\b([^>]*)>([\s\S]*?)<\/h\1>/gi)].map((match) => ({
    level: Number(match[1]),
    id: attrValue(match[2], "id"),
    text: stripTags(match[3]),
  }));
  const images = [...template.matchAll(/<img\b([^>]*)>/gi)].map((match) => ({
    src: attrValue(match[1], "src") || attrValue(match[1], ":src"),
    alt: attrValue(match[1], "alt") || attrValue(match[1], ":alt"),
  }));
  const forms = [...template.matchAll(/<form\b/gi)].length;

  return {
    path: projectPath(filePath),
    relativePath: path.relative(workspaceRoot, filePath).split(path.sep).join("/"),
    kind: filePath.includes(`${path.sep}pages${path.sep}`) ? "page" : "component",
    scriptLang: attrValue(scriptTag, "lang") || "js",
    scriptSetup: /<script\s+setup\b/i.test(text),
    headings,
    images,
    forms,
    classNames: extractClassNames(template).slice(0, 80),
    assetRefs: extractPublicRefs(text),
  };
}

async function inspectSourceFile(filePath, workspaceRoot) {
  const text = await readFile(filePath, "utf8");
  return {
    path: projectPath(filePath),
    relativePath: path.relative(workspaceRoot, filePath).split(path.sep).join("/"),
    imports: unique([...text.matchAll(/from\s+["']([^"']+)["']/g)].map((match) => match[1])),
    exports: unique([...text.matchAll(/export\s+(?:async\s+)?(?:function|const|class|interface|type)\s+([A-Za-z0-9_]+)/g)].map((match) => match[1])),
  };
}

async function inspectStyle(filePath, workspaceRoot) {
  const text = await readFile(filePath, "utf8");
  return {
    path: projectPath(filePath),
    relativePath: path.relative(workspaceRoot, filePath).split(path.sep).join("/"),
    importsTailwind: text.includes('@import "tailwindcss"') || text.includes("@import 'tailwindcss'"),
    tokens: unique([...text.matchAll(/--([a-zA-Z0-9_-]+)\s*:/g)].map((match) => `--${match[1]}`)),
    classes: unique([...text.matchAll(/\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g)].map((match) => match[1])).slice(0, 120),
    animations: unique([...text.matchAll(/@keyframes\s+([_a-zA-Z][_a-zA-Z0-9-]*)/g)].map((match) => match[1])),
  };
}

async function inspectRouter(workspaceRoot) {
  const routerPath = path.join(workspaceRoot, "src", "router", "index.ts");
  if (!await pathExists(routerPath)) return [];
  const text = await readFile(routerPath, "utf8");
  return [...text.matchAll(/\{\s*path:\s*["']([^"']+)["'][\s\S]*?name:\s*["']([^"']+)["'][\s\S]*?component:\s*\(\)\s*=>\s*import\(["']@\/pages\/([^"']+)["']\)([\s\S]*?)\}/g)]
    .map((match) => ({
      path: match[1],
      name: match[2],
      page: `src/pages/${match[3]}`,
      requiresAuth: /requiresAuth:\s*true/.test(match[4]),
      guestOnly: /guestOnly:\s*true/.test(match[4]),
    }));
}

async function inspectFrontend(workspace) {
  const workspaceRoot = path.join(rootDir, workspace.path);
  const packageJson = JSON.parse(await readFile(path.join(workspaceRoot, "package.json"), "utf8"));
  const vueFiles = await walk(path.join(workspaceRoot, "src"), new Set([".vue"]));
  const sourceFiles = await walk(path.join(workspaceRoot, "src"), new Set([".ts", ".js"]));
  const styleFiles = await walk(path.join(workspaceRoot, "src", "styles"), new Set([".css"]));
  const routes = await inspectRouter(workspaceRoot);

  const vueModules = await Promise.all(vueFiles.map((file) => inspectVue(file, workspaceRoot)));
  const sourceModules = await Promise.all(sourceFiles.map((file) => inspectSourceFile(file, workspaceRoot)));
  const styles = await Promise.all(styleFiles.map((file) => inspectStyle(file, workspaceRoot)));

  const tsCount = sourceFiles.filter((file) => file.endsWith(".ts")).length
    + vueModules.filter((module) => module.scriptLang === "ts").length;

  return {
    ...workspace,
    packageName: packageJson.name,
    language: tsCount > 0 ? "TypeScript" : "JavaScript",
    dependencies: Object.keys(packageJson.dependencies || {}).sort(),
    devDependencies: Object.keys(packageJson.devDependencies || {}).sort(),
    routes,
    vueModules,
    sourceModules,
    styles,
    summary: {
      routes: routes.length,
      pages: vueModules.filter((module) => module.kind === "page").length,
      components: vueModules.filter((module) => module.kind === "component").length,
      sourceFiles: sourceModules.length,
      styleFiles: styles.length,
      typeScriptSignals: tsCount,
    },
  };
}

async function buildInventory() {
  const workspaceConfig = JSON.parse(await readFile(workspacePath, "utf8"));
  const inspected = [];

  for (const workspace of workspaceConfig.workspaces) {
    if (workspace.status === "active" && workspace.type === "frontend") {
      inspected.push(await inspectFrontend(workspace));
      continue;
    }
    inspected.push({
      ...workspace,
      summary: { status: workspace.status },
    });
  }

  return {
    generatedAt: "stable",
    source: "node .agent/tools/build-ui-knowledge.mjs",
    rootRole: workspaceConfig.rootRole,
    workspaces: inspected,
  };
}

function renderMarkdown(inventory) {
  const lines = [];
  lines.push("# UI / 워크스페이스 인벤토리");
  lines.push("");
  lines.push("이 문서는 `.agent/tools/build-ui-knowledge.mjs`가 상위 워크스페이스를 읽고, frontend가 active일 때 Vue UI까지 분석해 생성한 에이전트용 지도입니다.");
  lines.push("");
  lines.push("## 워크스페이스");
  lines.push("");
  lines.push("| 이름 | 타입 | 경로 | 상태 | 프레임워크 | 언어 | 요약 |");
  lines.push("| :--- | :--- | :--- | :--- | :--- | :--- | :--- |");
  for (const workspace of inventory.workspaces) {
    const summary = workspace.type === "frontend" && workspace.status === "active"
      ? `routes ${workspace.summary.routes}, pages ${workspace.summary.pages}, components ${workspace.summary.components}`
      : workspace.summary.status;
    lines.push(`| ${workspace.name} | ${workspace.type} | \`${workspace.path}\` | ${workspace.status} | ${workspace.framework} | ${workspace.language || "-"} | ${summary} |`);
  }

  const frontend = inventory.workspaces.find((workspace) => workspace.type === "frontend" && workspace.status === "active");
  if (frontend) {
    lines.push("");
    lines.push("## Frontend");
    lines.push("");
    lines.push(`- package: \`${frontend.packageName}\``);
    lines.push(`- language: ${frontend.language}`);
    lines.push(`- dependencies: ${frontend.dependencies.map((name) => `\`${name}\``).join(", ") || "없음"}`);
    lines.push(`- devDependencies: ${frontend.devDependencies.map((name) => `\`${name}\``).join(", ") || "없음"}`);
    lines.push("");
    lines.push("### 라우트");
    lines.push("");
    lines.push("| 경로 | 이름 | Page | 인증 | Guest only |");
    lines.push("| :--- | :--- | :--- | :--- | :--- |");
    for (const route of frontend.routes) {
      lines.push(`| \`${route.path}\` | ${route.name} | \`${route.page}\` | ${route.requiresAuth ? "필요" : "공개"} | ${route.guestOnly ? "예" : "아니오"} |`);
    }
    lines.push("");
    lines.push("### Vue 모듈");
    for (const module of frontend.vueModules) {
      lines.push("");
      lines.push(`#### ${module.path}`);
      lines.push("");
      lines.push(`- 종류: ${module.kind}`);
      lines.push(`- script: ${module.scriptSetup ? "setup" : "classic"} / ${module.scriptLang}`);
      lines.push(`- headings: ${module.headings.slice(0, 6).map((heading) => `h${heading.level} ${heading.text || heading.id || "-"}`).join(", ") || "없음"}`);
      lines.push(`- forms: ${module.forms}, images: ${module.images.length}`);
      lines.push(`- asset refs: ${module.assetRefs.map((asset) => `\`${asset}\``).join(", ") || "없음"}`);
      lines.push(`- classes: ${module.classNames.slice(0, 30).map((name) => `\`${name}\``).join(", ") || "없음"}`);
    }
    lines.push("");
    lines.push("### Styles");
    for (const style of frontend.styles) {
      lines.push("");
      lines.push(`#### ${style.path}`);
      lines.push("");
      lines.push(`- Tailwind import: ${style.importsTailwind ? "있음" : "없음"}`);
      lines.push(`- tokens: ${style.tokens.map((token) => `\`${token}\``).join(", ") || "없음"}`);
      lines.push(`- animations: ${style.animations.map((name) => `\`${name}\``).join(", ") || "없음"}`);
    }
  }

  lines.push("");
  lines.push("## 하네스 사용법");
  lines.push("");
  lines.push("- 구조 변경 후 `npm --prefix .agent run harness:index`로 재생성합니다.");
  lines.push("- `npm --prefix .agent run harness:check`는 워크스페이스 경계를 확인하고, frontend가 active일 때 라우트, 빌드, SPA smoke까지 확인합니다.");
  lines.push("");
  return `${lines.join("\n")}\n`;
}

async function run() {
  const inventory = await buildInventory();
  const json = `${JSON.stringify(inventory, null, 2)}\n`;
  const markdown = renderMarkdown(inventory);

  if (checkOnly) {
    const [currentJson, currentMarkdown] = await Promise.all([
      readFile(jsonPath, "utf8").catch(() => ""),
      readFile(mdPath, "utf8").catch(() => ""),
    ]);
    if (currentJson !== json || currentMarkdown !== markdown) {
      console.error("UI 인벤토리가 최신 상태가 아닙니다. `npm --prefix .agent run harness:index`를 실행하세요.");
      process.exitCode = 1;
      return;
    }
    console.log("UI 인벤토리 최신성 확인: 통과");
    return;
  }

  await mkdir(generatedDir, { recursive: true });
  await Promise.all([
    writeFile(jsonPath, json),
    writeFile(mdPath, markdown),
  ]);
  console.log(`UI 인벤토리 생성 완료: ${projectPath(mdPath)}, ${projectPath(jsonPath)}`);
}

run().catch((error) => {
  console.error("UI 인벤토리 생성 중 오류가 발생했습니다.");
  console.error(error);
  process.exitCode = 1;
});
