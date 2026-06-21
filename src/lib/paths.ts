import fs from "fs";
import os from "os";
import path from "path";

const APP_FOLDER = "digital-guestbook";

/** Runtime files live outside OneDrive to avoid EPERM/sync locks on Windows. */
export function getLocalAppDir(...segments: string[]): string {
  const base =
    process.platform === "win32"
      ? path.join(os.homedir(), "AppData", "Local", APP_FOLDER)
      : path.join(os.tmpdir(), APP_FOLDER);

  const dir = path.join(base, ...segments);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function getNextDistDir(): string {
  return getLocalAppDir(".next");
}

export function getDataDir(): string {
  return getLocalAppDir("data");
}

export function getUploadsDir(): string {
  return getLocalAppDir("uploads");
}
