# Team Orchestration

This project uses specialist subagents defined in `.claude/agents/`. Read `CLAUDE.md` first for stack/conventions.

## Roster

| Agent               | Owns                                                              |
| ------------------- | ----------------------------------------------------------------- |
| `tech-lead`         | Cross-cutting decisions, conflict resolution, architecture review |
| `project-manager`   | Task breakdown, sequencing, todo.md sync, status tracking         |
| `frontend-engineer` | `client/src/**` — React, wouter, Tailwind, Radix, forms           |
| `backend-engineer`  | `server/**` (excl. schema) — tRPC routers, business logic         |
| `database-admin`    | Drizzle schema, migrations, indexes                               |
| `devops-engineer`   | Build config, deps, env vars, CI                                  |
| `qa-engineer`       | Tests, typecheck, verification of others' work                    |

## How a request flows

1. **project-manager** turns the request into an ordered task list with one owner per task, flags cross-task dependencies (e.g. schema before router).
2. Each owner does their task. If a task touches another domain (e.g. frontend needs a new tRPC procedure), the owner states what it needs rather than faking it, and that becomes a new task for the right owner.
3. If two agents propose conflicting approaches, **tech-lead** decides — states the choice and the one-sentence reason, referencing existing repo patterns. Business/product questions (not implementation) escalate to the human user instead.
4. **qa-engineer** verifies: runs `pnpm check`/`pnpm test`, traces the actual code path, reports pass/fail with specifics. Nothing is "done" until qa-engineer confirms or the human accepts a stated limitation (e.g. "can't verify in-browser").
5. **project-manager** updates `todo.md` to reflect the new state.

## How this maps onto Claude Code today

Subagents are isolated tool-calling contexts, not persistent processes with real-time chat — there's no literal cross-talk between them. In practice: I (the orchestrating session) act as the message bus. I dispatch a task to an agent via the Agent tool, read back what it found/proposed, and either dispatch the next step or bring a conflict to tech-lead for a ruling, then relay the decision back. "Team" here means a fixed division of responsibility + a fixed decision procedure, not literal parallel chat between agent processes.

## Hooks (`.claude/settings.json`, scripts in `.claude/hooks/`)

- Any Write/Edit → `post-edit-dispatch.cjs` inspects the path and:
  - `drizzle/**` / schema files → reminds database-admin review + possible `pnpm db:push`
  - `server/**/*.ts` (non-test) → runs `pnpm check`, surfaces tsc errors
  - `client/src/**/*.{ts,tsx}` → runs prettier `--write` on the file
  - `package.json` → reminds devops-engineer to check lockfile/patches/overrides
- End of turn → `stop-test-if-server-touched.cjs` runs `pnpm test` if `server/` was touched this session, blocking with failure detail if tests fail.
