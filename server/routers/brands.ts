import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { brands, products, productImages } from "../../drizzle/schema";
import { eq, and, inArray } from "drizzle-orm";

export const brandsRouter = router({
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(brands)
      .where(eq(brands.isActive, true))
      .orderBy(brands.sortOrder);
  }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [brand] = await db
        .select()
        .from(brands)
        .where(eq(brands.slug, input.slug))
        .limit(1);
      return brand ?? null;
    }),
});
