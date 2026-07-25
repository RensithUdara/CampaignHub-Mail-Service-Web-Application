import { app, BrowserWindow, dialog } from "electron";
import path from "node:path";
import http from "node:http";
import fs from "node:fs";
import { ChildProcess, spawn } from "node:child_process";

process.on("uncaughtException", (err) => {
  console.error(err);
  try {
    dialog.showErrorBox(
      "CampaignHub failed to start",
      err instanceof Error ? err.message : String(err)
    );
  } finally {
    app.exit(1);
  }
});

const PORT = Number(process.env.PORT) || 3000;
const APP_URL = `http://localhost:${PORT}`;
const ICON_PATH = path.join(__dirname, "assets", "logo.png");

let mainWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;
let serverProcess: ChildProcess | null = null;

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 320,
    height: 220,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    show: false,
    icon: ICON_PATH,
    webPreferences: { contextIsolation: true },
  });
  splashWindow.loadFile(path.join(__dirname, "splash.html"));
  splashWindow.once("ready-to-show", () => splashWindow?.show());
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 960,
    minHeight: 640,
    show: false,
    icon: ICON_PATH,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.once("ready-to-show", () => {
    splashWindow?.close();
    splashWindow = null;
    mainWindow?.show();
  });

  mainWindow.loadURL(APP_URL);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
}

/** Resolve the Next.js standalone server entry produced by `npm run build`. */
function resolveStandaloneServerPath(): string {
  const packaged = path.join(process.resourcesPath, "standalone", "server.js");
  if (fs.existsSync(packaged)) return packaged;

  const unpackaged = path.join(
    __dirname,
    "..",
    ".next-build",
    "standalone",
    "server.js"
  );
  return unpackaged;
}

function startNextServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    const serverPath = resolveStandaloneServerPath();

    if (!fs.existsSync(serverPath)) {
      reject(
        new Error(
          `Next.js standalone server not found at ${serverPath}. Run "npm run build" first.`
        )
      );
      return;
    }

    serverProcess = spawn(process.execPath, [serverPath], {
      cwd: path.dirname(serverPath),
      env: {
        ...process.env,
        PORT: String(PORT),
        HOSTNAME: "localhost",
        NODE_ENV: "production",
        ELECTRON_RUN_AS_NODE: "1",
      },
      stdio: "pipe",
    });

    serverProcess.stdout?.on("data", (data) => {
      console.log(`[next] ${data.toString().trim()}`);
    });
    serverProcess.stderr?.on("data", (data) => {
      console.error(`[next] ${data.toString().trim()}`);
    });
    serverProcess.on("exit", (code, signal) => {
      console.log(`Next.js server exited with code ${code} signal ${signal}`);
    });
    serverProcess.on("error", reject);

    waitForServerReady().then(resolve).catch(reject);
  });
}

function waitForServerReady(timeoutMs = 30000): Promise<void> {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(APP_URL, (res) => {
        res.resume();
        resolve();
      });
      req.on("error", () => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error("Timed out waiting for the Next.js server to start."));
          return;
        }
        setTimeout(check, 300);
      });
    };
    check();
  });
}

// `app.isPackaged` can't tell "npm run electron:dev, with `next dev` already
// listening on 3000" apart from "running the raw electron binary against an
// unpacked build for local testing" — both report isPackaged=false. Only the
// dev workflow should skip spawning our own server, so it sets this env var
// explicitly (see package.json).
const hasExternalServer = process.env.NEXT_SERVER_EXTERNAL === "true";

async function bootstrap() {
  createSplashWindow();

  try {
    if (hasExternalServer) {
      await waitForServerReady();
    } else {
      await startNextServer();
    }
    createMainWindow();
  } catch (err) {
    console.error(err);
    splashWindow?.close();
    dialog.showErrorBox(
      "CampaignHub failed to start",
      err instanceof Error ? err.message : String(err)
    );
    app.quit();
  }
}

app.whenReady().then(bootstrap);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on("before-quit", () => {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill();
  }
});
