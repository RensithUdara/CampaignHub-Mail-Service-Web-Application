// Copies the assets Next.js's standalone output needs but doesn't include by
// default (public/ and static assets), so electron/main.ts can spawn
// standalone/server.js as a fully self-contained production server.
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const distDirName = process.env.NEXT_DIST_DIR || ".next";
const distDir = path.join(root, distDirName);
const standaloneDir = path.join(distDir, "standalone");

if (!fs.existsSync(standaloneDir)) {
  console.error(
    `${distDirName}/standalone not found. Make sure next.config.mjs has output: "standalone" and run "next build" first.`
  );
  process.exit(1);
}

const publicSrc = path.join(root, "public");
const publicDest = path.join(standaloneDir, "public");
if (fs.existsSync(publicSrc)) {
  fs.cpSync(publicSrc, publicDest, { recursive: true });
  console.log(`Copied public/ -> ${distDirName}/standalone/public`);
}

const staticSrc = path.join(distDir, "static");
const staticDest = path.join(standaloneDir, distDirName, "static");
if (fs.existsSync(staticSrc)) {
  fs.cpSync(staticSrc, staticDest, { recursive: true });
  console.log(`Copied ${distDirName}/static -> ${distDirName}/standalone/${distDirName}/static`);
}

// Next's standalone server reads process.env directly; it doesn't run through
// the Next CLI's own .env.local loading, so secrets have to be copied in by hand.
const envSrc = path.join(root, ".env.local");
const envDest = path.join(standaloneDir, ".env.local");
if (fs.existsSync(envSrc)) {
  fs.copyFileSync(envSrc, envDest);
  console.log(`Copied .env.local -> ${distDirName}/standalone/.env.local`);
}

console.log(`Standalone output is ready at ${distDirName}/standalone`);
