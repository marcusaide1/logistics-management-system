import { spawnSync } from "node:child_process";

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

run("npx", ["prisma", "db", "push"]);
run("node", ["./src/seed.js"]);
run("node", ["./src/server.js"]);
