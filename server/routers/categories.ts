import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { categories } from "../../drizzle/schema";
import { asc, eq } from "drizzle-orm";

function mapCategory(c: typeof categories.$inferSelect) {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    imageUrl: c.imageUrl,
    parentId: c.parentId,
    sortOrder: c.sortOrder ?? 0,
  };
}

export const categoriesRouter = router({
  // Flat list of active categories ordered by sortOrder. Supports nested
  // categories via `parentId` if/when seeded data includes parent/child
  // relationships — until then this returns a flat list.
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const rows = await db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.sortOrder));

    return rows.map(mapCategory);
  }),

  getAll: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const rows = await db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.sortOrder));

    return rows.map(mapCategory);
  }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const [row] = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, input.slug))
        .limit(1);

      return row ? mapCategory(row) : null;
    }),
});
