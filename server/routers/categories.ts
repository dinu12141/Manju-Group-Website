import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { categories, products } from "../../drizzle/schema";
import { and, asc, eq, notInArray, sql } from "drizzle-orm";

const EXCLUDED_CATEGORY_SLUGS = [
  "stationery",
  "exercise-books",
  "manju-exercise-books",
];

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mapCategory(c: typeof categories.$inferSelect) {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    imageUrl: c.imageUrl,
    parentId: c.parentId,
    sortOrder: c.sortOrder ?? 0,
    isActive: c.isActive,
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

  adminList: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const rows = await db
      .select({
        id: categories.id,
        slug: categories.slug,
        name: categories.name,
        description: categories.description,
        imageUrl: categories.imageUrl,
        parentId: categories.parentId,
        sortOrder: categories.sortOrder,
        isActive: categories.isActive,
        createdAt: categories.createdAt,
      })
      .from(categories)
      .orderBy(asc(categories.sortOrder), asc(categories.name));

    // Get product counts per category
    const countRows = await db
      .select({
        categoryId: products.categoryId,
        count: sql<number>`count(*)`,
      })
      .from(products)
      .groupBy(products.categoryId);

    const countMap = new Map<number, number>();
    for (const r of countRows) {
      countMap.set(r.categoryId, Number(r.count || 0));
    }

    return rows.map(cat => ({
      ...cat,
      sortOrder: cat.sortOrder ?? 0,
      productCount: countMap.get(cat.id) ?? 0,
    }));
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

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(2, "Category name must be at least 2 characters"),
        slug: z.string().optional(),
        description: z.string().optional().nullable(),
        imageUrl: z.string().optional().nullable(),
        sortOrder: z.number().optional().default(0),
        isActive: z.boolean().optional().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection unavailable",
        });
      }

      let slug = (input.slug && input.slug.trim()) || generateSlug(input.name);
      if (!slug) {
        slug = `category-${Date.now()}`;
      }

      // Check if slug already exists
      const existing = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, slug))
        .limit(1);

      if (existing.length > 0) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }

      const [newCategory] = await db
        .insert(categories)
        .values({
          name: input.name.trim(),
          slug,
          description: input.description?.trim() || null,
          imageUrl: input.imageUrl?.trim() || null,
          sortOrder: input.sortOrder ?? 0,
          isActive: input.isActive ?? true,
        })
        .returning();

      return newCategory;
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(2, "Category name must be at least 2 characters"),
        slug: z.string().optional(),
        description: z.string().optional().nullable(),
        imageUrl: z.string().optional().nullable(),
        sortOrder: z.number().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection unavailable",
        });
      }

      const patch: Partial<typeof categories.$inferInsert> = {
        name: input.name.trim(),
      };
      if (input.slug) patch.slug = input.slug.trim();
      if (input.description !== undefined)
        patch.description = input.description?.trim() || null;
      if (input.imageUrl !== undefined)
        patch.imageUrl = input.imageUrl?.trim() || null;
      if (input.sortOrder !== undefined) patch.sortOrder = input.sortOrder;
      if (input.isActive !== undefined) patch.isActive = input.isActive;

      const [updated] = await db
        .update(categories)
        .set(patch)
        .where(eq(categories.id, input.id))
        .returning();

      return updated;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection unavailable",
        });
      }

      // Check if products exist in this category
      const productCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(eq(products.categoryId, input.id));

      const count = Number(productCount[0]?.count ?? 0);
      if (count > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Cannot delete category: ${count} product(s) are currently assigned to it. Please reassign or delete those products first.`,
        });
      }

      await db.delete(categories).where(eq(categories.id, input.id));
      return { success: true, id: input.id };
    }),
});
