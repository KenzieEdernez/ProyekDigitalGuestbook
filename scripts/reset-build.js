const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync } = require("child_process");

const projectRoot = process.cwd();

function isJunction(p) {
  try {
    execSync(`fsutil reparsepoint query "${p}"`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function removeLink(linkPath) {
  if (!fs.existsSync(linkPath)) return;
  try {
    if (process.platform === "win32" && isJunction(linkPath)) {
      execSync(`cmd /c rmdir "${linkPath}"`, { stdio: "ignore" });
    } else {
      fs.rmSync(linkPath, { recursive: true, force: true });
    }
  } catch {
    // ignore
  }
}

const externalNext = path.join(
  process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local"),
  "digital-guestbook",
  ".next"
);
try {
  fs.rmSync(externalNext, { recursive: true, force: true });
} catch {
  // ignore
}

const externalCache = path.join(
  process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local"),
  "digital-guestbook",
  "cache"
);
try {
  fs.rmSync(externalCache, { recursive: true, force: true });
} catch {
  // ignore
}

removeLink(path.join(projectRoot, ".next"));
removeLink(path.join(projectRoot, "node_modules", ".cache"));

require("./ensure-local-build");

console.log("Build folders direset dan diarahkan ke folder lokal.");
