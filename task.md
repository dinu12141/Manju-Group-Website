# UI/UX Redesign — Task Plan

Goal: a professional, "smart" UI/UX pass across the whole Manju Group site, without regressing existing functionality (tRPC data flow, admin CRUD, tests).

Produced by tech-lead + frontend-engineer discussion (see decision log below). Work is split into a **foundation phase** (must land first, one owner each, sequential) and a **parallel page phase** (multiple workers, independent files, dispatched together once foundation lands).

## Decision log

- **Design system audit finding**: `client/src/index.css` is missing `.section-label`, `.section-title`, `.section-subtitle` utility classes that `Home.tsx` already references — every homepage section heading is currently rendering unstyled. This is fixed as part of the token pass, first, before any page work, so parallel workers don't each "fix" it differently.
- **Shared-file conflict avoidance**: `ProductCard.tsx` (used by Home, Products, ProductDetail, BrandPage) and the `Header`/`Footer`/`MainLayout` shell are each owned by exactly one worker and land before/independently of page-specific work — never split across two parallel workers.
- **Token policy**: pages currently mix raw Tailwind grays (`text-gray-800`, `bg-blue-50`) with semantic tokens (`--color-foreground`, `--color-border`). Decision: semantic tokens win for anything reused; raw Tailwind utility classes are fine for one-off spacing/layout, not for color.
- **Admin.tsx** is a single 1084-line file (page + two dialogs). Decision: one owner for the whole file, not split by tab, to avoid merge conflicts on shared state/imports.

## Foundation phase (sequential, land before parallel dispatch)

| #   | Task                                                                                                                                                                                         | Owner             | Files                                                                                       |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------- |
| F1  | Fix/extend design tokens: add missing section-* classes, consolidate shadow scale (drop ad-hoc `shadow-md/lg/xl` in favor of `--shadow-card/nav/modal`), confirm dark-mode variant readiness | frontend-engineer | `client/src/index.css`                                                                      |
| F2  | Redesign `ProductCard` (image treatment, badge stacking, hover/quick-add interaction, list vs grid density)                                                                                  | frontend-engineer | `client/src/components/ProductCard.tsx`                                                     |
| F3  | Redesign shell: `Header` (nav polish, search, mega menu), `Footer`, `MainLayout`                                                                                                             | frontend-engineer | `client/src/components/Header.tsx`, `Footer.tsx`, `MainLayout.tsx`                          |
| F4  | Add shared `EmptyState` pattern (audit unused `components/ui/empty.tsx`); extract Admin's repeated table/stat-card markup into shared internal components                                    | frontend-engineer | `client/src/components/ui/empty.tsx`, `Admin.tsx` (extraction only, no visual redesign yet) |

## Parallel phase (dispatched together once F1–F4 land, one worker per row, independent files)

| #   | Page                                                                             | Priority | Owner                        | Files                                |
| --- | -------------------------------------------------------------------------------- | -------- | ---------------------------- | ------------------------------------ |
| P1  | Admin dashboard/products/orders/customers UI polish                              | Tier 1   | frontend-engineer (worker A) | `client/src/pages/Admin.tsx`         |
| P2  | Home page (hero, brand showcase, categories, best-sellers, promo banners, stats) | Tier 1   | frontend-engineer (worker B) | `client/src/pages/Home.tsx`          |
| P3  | Product detail page (gallery, variant selector, tabs, trust signals)             | Tier 1   | frontend-engineer (worker C) | `client/src/pages/ProductDetail.tsx` |
| P4  | Product listing (filters sidebar, sort, pagination)                              | Tier 2   | frontend-engineer (worker D) | `client/src/pages/Products.tsx`      |
| P5  | Cart page (empty state, summary card)                                            | Tier 2   | frontend-engineer (worker E) | `client/src/pages/Cart.tsx`          |

## Sequential cleanup phase (after parallel phase, low risk, inherits foundation improvements)

- About, Contact, FAQ, Locations, News/NewsDetail, Brands/BrandPage, Account — light visual pass only, reusing the by-then-fixed tokens/ProductCard/shell.
- NotFound, ComponentShowcase — skip unless time permits (dev/utility pages).

## QA gate (blocks commit)

- `pnpm check` clean
- `pnpm test` green (18 existing tests)
- Manual pass: verify each redesigned page renders without console errors, existing interactions (add to cart, admin CRUD, order status) still work
- Visual consistency check across all pages (tokens/spacing/shadow usage matches foundation decisions)

## Delivery

- Commit to git, push to GitHub remote (existing repo, URL provided by user)
