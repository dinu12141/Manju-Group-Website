#!/usr/bin/env node
// PostToolUse dispatcher for Write|Edit. Reads hook JSON from stdin, inspects the
// edited file path, and runs the right project automation (prettier / tsc / reminders).
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (raw += chunk));
process.stdin.on("end", () => {
  let input;
  try {
    input = JSON.parse(raw || "{}");
  } catch {
    process.exit(0);
  }

  const filePath =
    input.tool_response?.filePath || input.tool_input?.file_path || "";
  if (!filePath) process.exit(0);

  const rel = path.relative(process.cwd(), filePath).replace(/\\/g, "/");
  const messages = [];

  const isDrizzle =
    /^drizzle\//.test(rel) || /schema.*\.ts$/i.test(rel) || /drizzle\.config\.ts$/.test(rel);
  const isServerCode =
    /^server\/.*\.ts$/.test(rel) && !/\.test\.ts$/.test(rel);
  const isClientCode = /^client\/src\/.*\.(ts|tsx)$/.test(rel);
  const isPackageJson = rel === "package.json";

  if (isDrizzle) {
    messages.push(
      `[database-admin] Schema/migration file changed: ${rel}. Review required; run \`pnpm db:push\` if the schema shape changed.`
    );
  }

  if (/^server\//.test(rel)) {
    try {
      fs.mkdirSync(path.join(process.cwd(), ".claude"), { recursive: true });
      fs.writeFileSync(path.join(process.cwd(), ".claude", ".server-touched"), "1");
    } catch {
      // best-effort marker
    }
  }

  if (isServerCode) {
    try {
      execFileSync("pnpm", ["check"], {
        stdio: "pipe",
        cwd: process.cwd(),
        shell: true,
      });
      messages.push(`[backend-engineer] pnpm check passed after editing ${rel}.`);
    } catch (err) {
      const out = (err.stdout || "").toString().slice(-4000);
      messages.push(
        `[backend-engineer] pnpm check FAILED after editing ${rel}:\n${out}`
      );
    }
  }

  if (isClientCode) {
    try {
      const prettierJs = path.join(
        process.cwd(),
        "node_modules",
        "prettier",
        "bin",
        "prettier.cjs"
      );
      execFileSync(process.execPath, [prettierJs, "--write", filePath], {
        stdio: "pipe",
        cwd: process.cwd(),
      });
    } catch {
      // formatting failure shouldn't block the turn
    }
  }

  if (isPackageJson) {
    messages.push(
      `[devops-engineer] package.json changed. Verify pnpm-lock.yaml, patches/, and pnpm.overrides still apply (run \`pnpm install\`).`
    );
  }

  if (messages.length) {
    console.log(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PostToolUse",
          additionalContext: messages.join("\n\n"),
        },
      })
    );
  }
  process.exit(0);
});
