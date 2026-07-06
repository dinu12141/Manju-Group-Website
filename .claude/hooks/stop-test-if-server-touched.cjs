#!/usr/bin/env node
// Stop hook: if this session touched server/, run pnpm test and surface failures.
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const markerPath = path.join(process.cwd(), ".claude", ".server-touched");

if (!fs.existsSync(markerPath)) process.exit(0);
fs.unlinkSync(markerPath);

try {
  execFileSync("pnpm", ["test"], {
    stdio: "pipe",
    cwd: process.cwd(),
    shell: true,
  });
  console.log(
    JSON.stringify({
      systemMessage:
        "[qa-engineer] pnpm test passed (server/ was touched this session).",
    })
  );
} catch (err) {
  const out = (err.stdout || "").toString().slice(-4000);
  console.log(
    JSON.stringify({
      decision: "block",
      reason: `[qa-engineer] pnpm test FAILED after server/ changes this session:\n${out}`,
    })
  );
}
process.exit(0);
