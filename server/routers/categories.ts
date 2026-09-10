import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { categories } from "../../drizzle/schema";
import { and, asc, eq, notInArray } from "drizzle-orm";

const EXCLUDED_CATEGORY_SLUGS = [
  "stationery",
  "exercise-books",
  "manju-exercise-books",
];

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
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const rows = await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.isActive, true),
          notInArray(categories.slug, EXCLUDED_CATEGORY_SLUGS)
        )
      )
      .orderBy(asc(categories.sortOrder));

    return rows
      .filter(
        r =>
          !EXCLUDED_CATEGORY_SLUGS.includes(r.slug.toLowerCase()) &&
          !r.name.toLowerCase().includes("stationery") &&
          !r.name.toLowerCase().includes("exercise")
      )
      .map(mapCategory);
  }),

  getAll: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const rows = await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.isActive, true),
          notInArray(categories.slug, EXCLUDED_CATEGORY_SLUGS)
        )
      )
      .orderBy(asc(categories.sortOrder));

    return rows
      .filter(
        r =>
          !EXCLUDED_CATEGORY_SLUGS.includes(r.slug.toLowerCase()) &&
          !r.name.toLowerCase().includes("stationery") &&
          !r.name.toLowerCase().includes("exercise")
      )
      .map(mapCategory);
  }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      if (EXCLUDED_CATEGORY_SLUGS.includes(input.slug.toLowerCase()))
        return null;

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
