import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const tool = path.join(root, ".agent", "tools", "create-orchestration.mjs");

function run(command, args, cwd, options = {}) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
    shell: false,
    env: { ...process.env, ...(options.env || {}) },
  });
  if (options.expectFailure) {
    if (result.status === 0) throw new Error(`실패해야 하는 명령이 성공했습니다: ${command} ${args.join(" ")}`);
    return `${result.stdout || ""}\n${result.stderr || ""}`;
  }
  if (result.error || result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} 실패${result.error ? `: ${result.error.message}` : ` (exit ${result.status})`}`);
  }
  return result.stdout || "";
}

const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "orchestration-bootstrap-"));

try {
  const childRepo = path.join(temporaryRoot, "web-remote");
  const target = path.join(temporaryRoot, "root-repo");
  const configPath = path.join(temporaryRoot, "project.json");

  run("git", ["init", "-b", "develop", childRepo], temporaryRoot);
  run("git", ["config", "user.name", "Bootstrap Test"], childRepo);
  run("git", ["config", "user.email", "bootstrap@example.invalid"], childRepo);
  await writeFile(path.join(childRepo, "README.md"), "# Web workspace\n", "utf8");
  run("git", ["add", "README.md"], childRepo);
  run("git", ["commit", "-m", "chore: initialize workspace"], childRepo);

  const config = {
    schemaVersion: 1,
    project: {
      name: "bootstrap-smoke",
      displayName: "Bootstrap Smoke",
      description: "Cross-platform orchestration bootstrap smoke test.",
      defaultBranch: "main",
      integrationBranch: "develop",
    },
    git: { remoteUrl: "" },
    workspaces: [
      {
        name: "web",
        path: "web",
        status: "active",
        repoUrl: pathToFileURL(childRepo).href,
        branch: "develop",
        verify: [{ name: "node", command: [process.execPath, "--version"] }],
      },
    ],
  };
  await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");

  run(process.execPath, [tool, "init", "--config", configPath, "--target", target], root, {
    env: { GIT_ALLOW_PROTOCOL: "file" },
  });
  run(process.execPath, [path.join(target, ".agent", "tools", "harness-check.mjs")], target);
  run(process.execPath, [path.join(target, ".agent", "tools", "verify-workspaces.mjs")], target);
  run(process.execPath, [path.join(target, ".agent", "tools", "branch-ledger.mjs"), "new", "--title", "smoke"], target);
  run(process.execPath, [path.join(target, ".agent", "tools", "branch-ledger.mjs"), "check"], target);
  run(process.execPath, [path.join(target, ".agent", "tools", "branch-ledger.mjs"), "index"], target);
  run(process.execPath, [tool, "doctor", "--target", target], root);

  const gitmodules = await readFile(path.join(target, ".gitmodules"), "utf8");
  if (!gitmodules.includes("path = web") || !gitmodules.includes("branch = develop")) {
    throw new Error("생성된 .gitmodules에 workspace path/branch가 없습니다.");
  }

  const collisionOutput = run(
    process.execPath,
    [tool, "init", "--config", configPath, "--target", target, "--allow-existing"],
    root,
    { capture: true, expectFailure: true },
  );
  if (!collisionOutput.includes("덮어쓰지 않습니다")) throw new Error("기존 파일 비덮어쓰기 오류를 확인하지 못했습니다.");

  console.log(`Orchestration bootstrap smoke 통과: ${process.platform}`);
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
