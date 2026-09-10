import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { brands, products } from "../../drizzle/schema";
import { and, asc, eq, notInArray, sql } from "drizzle-orm";

const EXCLUDED_BRAND_SLUGS = [
  "manju-exercise-books",
  "exercise-books",
  "stationery",
];

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
      .where(
        and(
          eq(brands.isActive, true),
          notInArray(brands.slug, EXCLUDED_BRAND_SLUGS)
        )
      )
      .orderBy(asc(brands.sortOrder));

    return rows
      .filter(
        r =>
          !EXCLUDED_BRAND_SLUGS.includes(r.slug.toLowerCase()) &&
          !r.name.toLowerCase().includes("exercise")
      )
      .map(mapBrand);
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
      .where(
        and(
          eq(brands.isActive, true),
          notInArray(brands.slug, EXCLUDED_BRAND_SLUGS)
        )
      )
      .groupBy(brands.id)
      .orderBy(asc(brands.sortOrder));

    return rows
      .filter(
        row =>
          !EXCLUDED_BRAND_SLUGS.includes(row.brand.slug.toLowerCase()) &&
          !row.brand.name.toLowerCase().includes("exercise")
      )
      .map(row => ({
        ...mapBrand(row.brand),
        productCount: Number(row.productCount ?? 0),
      }));
  }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      if (EXCLUDED_BRAND_SLUGS.includes(input.slug.toLowerCase())) return null;

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
