const { spawnSync } = require("node:child_process");

const distDir = process.env.VERCEL ? ".next" : ".next-build";
const env = { ...process.env, NEXT_DIST_DIR: distDir };
const shell = process.platform === "win32";

function run(command, args) {
  const result = spawnSync(command, args, {
    env,
    shell,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

run("next", ["build"]);
run("node", ["scripts/prepare-standalone.js"]);
