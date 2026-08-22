import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { brands, products } from "../../drizzle/schema";
import { and, asc, eq, sql } from "drizzle-orm";

function mapBrand(b: typeof brands.$inferSelect) {
  return {
    id: b.id,
    slug: b.slug,
    name: b.name,
    description: b.description,
    tagline: b.tagline,
    logoUrl: b.logoUrl,
    coverUrl: b.bannerUrl,
    sortOrder: b.sortOrder ?? 0,
    isActive: b.isActive,
    createdAt: b.createdAt,
  };
}

export const brandsRouter = router({
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const rows = await db
      .select()
      .from(brands)
      .where(eq(brands.isActive, true))
      .orderBy(asc(brands.sortOrder));

    return rows.map(mapBrand);
  }),

  getAll: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const rows = await db
      .select({
        brand: brands,
        productCount: sql<number>`count(${products.id})`,
      })
      .from(brands)
      .leftJoin(
        products,
        and(eq(products.brandId, brands.id), eq(products.isActive, true))
      )
      .where(eq(brands.isActive, true))
      .groupBy(brands.id)
      .orderBy(asc(brands.sortOrder));

    return rows.map(row => ({
      ...mapBrand(row.brand),
      productCount: Number(row.productCount ?? 0),
    }));
  }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const [row] = await db
        .select()
        .from(brands)
        .where(eq(brands.slug, input.slug))
        .limit(1);

      return row ? mapBrand(row) : null;
    }),
});
