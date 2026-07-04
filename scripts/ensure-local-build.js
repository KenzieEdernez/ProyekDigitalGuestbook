const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync } = require("child_process");

if (process.env.VERCEL || process.platform !== "win32") {
  console.log("Build/cache Next.js memakai default project.");
  process.exit(0);
}

const projectRoot = process.cwd();
const localRoot = path.join(
  process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local"),
  "digital-guestbook"
);

function isJunction(targetPath) {
  if (process.platform !== "win32") return false;
  try {
    execSync(`fsutil reparsepoint query "${targetPath}"`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function removePath(targetPath) {
  if (!fs.existsSync(targetPath)) return;

  if (process.platform === "win32" && isJunction(targetPath)) {
    execSync(`cmd /c rmdir "${targetPath}"`, { stdio: "ignore" });
    return;
  }

  fs.rmSync(targetPath, { recursive: true, force: true });
}

function ensureJunction(linkPath, targetPath) {
  fs.mkdirSync(targetPath, { recursive: true });
  fs.mkdirSync(path.dirname(linkPath), { recursive: true });

  if (fs.existsSync(linkPath)) {
    if (isJunction(linkPath)) return;
    removePath(linkPath);
  }

  if (process.platform === "win32") {
    execSync(`cmd /c mklink /J "${linkPath}" "${targetPath}"`, {
      stdio: "ignore",
    });
  } else {
    fs.symlinkSync(targetPath, linkPath, "dir");
  }
}

ensureJunction(path.join(projectRoot, ".next"), path.join(localRoot, ".next"));

const nodeModulesPath = path.join(projectRoot, "node_modules");
if (fs.existsSync(nodeModulesPath)) {
  ensureJunction(path.join(localRoot, "node_modules"), nodeModulesPath);
  ensureJunction(
    path.join(nodeModulesPath, ".cache"),
    path.join(localRoot, "cache")
  );
}

console.log("Build/cache Next.js diarahkan ke folder lokal Windows.");
