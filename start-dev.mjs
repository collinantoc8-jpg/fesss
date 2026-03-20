import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const processes = [
  ["api", ["pnpm", "--filter", "@workspace/api-server", "run", "dev"]],
  ["web", ["pnpm", "--filter", "@workspace/faculty-eval", "run", "dev"]],
];

console.log("Starting Faculty Eval local dev servers:");
console.log("  API: http://localhost:3001");
console.log("  Web: http://localhost:5173");

let shuttingDown = false;

function spawnPackageManager(args) {
  if (process.platform === "win32") {
    return spawn("cmd.exe", ["/c", "corepack", ...args], {
      cwd: rootDir,
      stdio: "inherit",
      env: process.env,
    });
  }

  return spawn("corepack", args, {
    cwd: rootDir,
    stdio: "inherit",
    env: process.env,
  });
}

const children = processes.map(([, args]) => spawnPackageManager(args));

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGINT");
    }
  }

  setTimeout(() => process.exit(exitCode), 250);
}

for (const child of children) {
  child.on("exit", (code) => {
    if (!shuttingDown) {
      shutdown(code ?? 0);
    }
  });
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
