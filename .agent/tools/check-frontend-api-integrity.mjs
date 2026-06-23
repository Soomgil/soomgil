import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const toolDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(toolDir, "..", "..");
const sourceDir = path.join(rootDir, "frontend", "src");
const apiDir = path.join(sourceDir, "api");
const requireFromFrontend = createRequire(path.join(rootDir, "frontend", "package.json"));
const ts = requireFromFrontend("typescript");

const allowedDelegates = new Map([
  ["frontend/src/api/community.api.ts#toggleLike", "likedByMe에 따라 같은 client의 like/unlike HTTP method로 위임"],
]);

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return listFiles(absolute);
    return /\.(?:ts|vue)$/.test(entry.name) ? [absolute] : [];
  }));
  return nested.flat();
}

function relative(filePath) {
  return path.relative(rootDir, filePath).replaceAll(path.sep, "/");
}

function methodName(property, sourceFile) {
  if (property.name && ts.isIdentifier(property.name)) return property.name.text;
  if (property.name && ts.isStringLiteral(property.name)) return property.name.text;
  return property.name?.getText(sourceFile) ?? "<unknown>";
}

function functionNode(property) {
  if (ts.isMethodDeclaration(property)) return property;
  if (ts.isPropertyAssignment(property)
    && (ts.isArrowFunction(property.initializer) || ts.isFunctionExpression(property.initializer))) {
    return property.initializer;
  }
  return null;
}

function hasAsyncModifier(node) {
  return node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword) ?? false;
}

function containsNetworkBoundary(node) {
  let found = false;
  function visit(current) {
    if (found) return;
    if (ts.isCallExpression(current)) {
      const target = current.expression.getText();
      if (/^(?:http\.(?:get|post|put|patch|delete|request)|fetch)$/.test(target)) found = true;
    }
    ts.forEachChild(current, visit);
  }
  visit(node);
  return found;
}

const failures = [];
const productionFiles = (await listFiles(sourceDir)).filter((filePath) => (
  !/\.(?:test|spec)\.[^.]+$/.test(filePath) && !filePath.includes(`${path.sep}mocks${path.sep}`)
));

for (const filePath of productionFiles) {
  const source = await readFile(filePath, "utf8");
  if (/from\s+["']@\/mocks(?:\/|["'])|import\s*\(["']@\/mocks(?:\/|["'])/.test(source)) {
    failures.push(`${relative(filePath)}: production 코드에서 @/mocks import를 사용합니다.`);
  }
}

const apiFiles = productionFiles.filter((filePath) => filePath.startsWith(apiDir) && filePath.endsWith(".ts"));
for (const filePath of apiFiles) {
  const source = await readFile(filePath, "utf8");
  const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement) || !statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !declaration.initializer || !ts.isObjectLiteralExpression(declaration.initializer)) continue;
      for (const property of declaration.initializer.properties) {
        const callable = functionNode(property);
        if (!callable || !hasAsyncModifier(callable)) continue;
        const key = `${relative(filePath)}#${methodName(property, sourceFile)}`;
        if (!containsNetworkBoundary(callable) && !allowedDelegates.has(key)) {
          failures.push(`${key}: async API method에 HTTP/fetch 호출이 없습니다. hard-coded 응답이면 제거하세요.`);
        }
      }
    }
  }
}

if (failures.length > 0) {
  console.error("프론트 API integrity 검사 실패:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`프론트 API integrity 검사 통과: production ${productionFiles.length}개, API client ${apiFiles.length}개 파일`);
for (const [key, reason] of allowedDelegates) {
  console.log(`허용 예외: ${key} - ${reason}`);
}
