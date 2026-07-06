# Manju Group E-Commerce Platform

## Stack
- **Frontend**: React 19, wouter (routing), TanStack Query, tRPC client, Tailwind CSS v4, Radix UI, shadcn-style components (`components.json`), Framer Motion, recharts.
- **Backend**: Express + tRPC server (`server/routers/*.ts`), Node/tsx.
- **Database**: MySQL via Drizzle ORM (`drizzle/`, `drizzle.config.ts`, `server/db.ts`).
- **Build**: Vite (client), esbuild (server bundle for prod).
- **Testing**: Vitest (`server/*.test.ts`).
- **Package manager**: pnpm (has patches + overrides — do not switch to npm/yarn).

## Structure
- `client/src/pages/` — route-level pages (Admin.tsx, ProductDetail.tsx, etc.)
- `client/src/components/` — shared UI components
- `client/src/contexts/` — React contexts (e.g. CartContext)
- `server/routers/` — one tRPC router per domain: products, cart, orders, wishlist, admin, locations, blog, faq, contact, ai, brands
- `server/db.ts`, `server/storage.ts` — DB client and storage helpers
- `shared/` — types/constants shared between client and server
- `todo.md` — running feature/bug checklist for this project (source of truth for what's done vs. placeholder)

## Conventions
- tRPC procedures are the only way client talks to server — no ad hoc REST routes.
- Zod schemas validate all tRPC inputs.
- Drizzle schema changes go through `pnpm db:push` (generate + migrate), never hand-edited SQL against prod.
- Run `pnpm check` (tsc --noEmit) and `pnpm test` (vitest) before considering backend/shared changes done.
- Run `pnpm format` (prettier) on touched files.
- Known placeholders as of last audit: Admin product add/edit/delete are UI-only stubs; Order detail view in Admin is a placeholder. Check `todo.md` before assuming something is unfinished — it may have been completed since.

## Team workflow
This project uses a multi-agent team defined in `.claude/agents/`. See `ORCHESTRATION.md` for how the lead/PM and specialist agents collaborate and reach decisions. Hooks in `.claude/settings.json` auto-run relevant agents/checks on file changes.
