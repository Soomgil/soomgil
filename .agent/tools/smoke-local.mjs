import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const distDir = path.join(rootDir, "frontend", "dist");
const inventoryPath = path.join(rootDir, ".agent", "docs", "generated", "ui_inventory.json");

function contentType(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

function routeToSmokePath(routePath) {
  return routePath
    .replace(/:pathMatch\(\.\*\)\*/g, "")
    .replace(/:([A-Za-z0-9_]+)/g, "sample")
    .replace(/\/+/g, "/") || "/";
}

async function createStaticServer() {
  const server = createServer(async (request, response) => {
    const url = new URL(request.url || "/", "http://127.0.0.1");
    const decoded = decodeURIComponent(url.pathname);
    const relative = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
    let target = path.join(distDir, relative);

    if (!await exists(target)) {
      target = path.join(distDir, "index.html");
    }

    response.writeHead(200, { "content-type": contentType(target) });
    createReadStream(target).pipe(response);
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return server;
}

async function run() {
  const inventory = JSON.parse(await readFile(inventoryPath, "utf8"));
  const frontend = inventory.workspaces.find((workspace) => workspace.name === "frontend");
  if (frontend?.status !== "active") {
    console.log("프론트 smoke 검사 건너뜀: frontend 워크스페이스가 active 상태가 아닙니다.");
    return;
  }

  if (!await exists(path.join(distDir, "index.html"))) {
    console.error("frontend/dist/index.html이 없습니다. 먼저 `npm --prefix frontend run build`를 실행하세요.");
    process.exitCode = 1;
    return;
  }

  const routes = frontend.routes
    .filter((route) => !route.path.includes(":pathMatch"))
    .map((route) => routeToSmokePath(route.path));

  const server = await createStaticServer();
  const { port } = server.address();

  try {
    for (const routePath of routes) {
      const response = await fetch(`http://127.0.0.1:${port}${routePath}`);
      if (!response.ok) {
        throw new Error(`${routePath} 응답 실패: ${response.status}`);
      }
      const text = await response.text();
      if (!text.includes('id="app"')) {
        throw new Error(`${routePath} 응답에서 Vue mount 대상 #app을 찾지 못했습니다.`);
      }
    }
    console.log(`프론트 smoke 검사 통과: frontend/dist와 SPA 라우트 ${routes.length}개를 확인했습니다.`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

run().catch((error) => {
  console.error("프론트 smoke 검사 실패");
  console.error(error);
  process.exitCode = 1;
});
