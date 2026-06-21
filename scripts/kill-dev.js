const { execSync } = require("child_process");

if (process.platform !== "win32") process.exit(0);

try {
  const out = execSync('netstat -ano | findstr ":3000 :3001"', {
    encoding: "utf8",
  });
  const pids = new Set();
  for (const line of out.split("\n")) {
    const m = line.trim().match(/\s(\d+)\s*$/);
    if (m) pids.add(m[1]);
  }
  for (const pid of pids) {
    try {
      execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
      console.log("Stopped process PID", pid);
    } catch {
      // already gone
    }
  }
} catch {
  // no processes on those ports
}
