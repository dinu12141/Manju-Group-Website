import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { products, productImages, productVariants, brands, categories, reviews } from "../../drizzle/schema";
import { eq, and, like, or, desc, asc, sql, inArray } from "drizzle-orm";

export const productsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(12),
        brandId: z.number().optional(),
        categoryId: z.number().optional(),
        search: z.string().optional(),
        sortBy: z.enum(["newest", "price_asc", "price_desc", "popular"]).default("newest"),
        isFeatured: z.boolean().optional(),
        isBestSeller: z.boolean().optional(),
        isNew: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { items: [], total: 0 };

      const conditions = [eq(products.isActive, true)];
      if (input.brandId) conditions.push(eq(products.brandId, input.brandId));
      if (input.categoryId) conditions.push(eq(products.categoryId, input.categoryId));
      if (input.isFeatured) conditions.push(eq(products.isFeatured, true));
      if (input.isBestSeller) conditions.push(eq(products.isBestSeller, true));
      if (input.isNew) conditions.push(eq(products.isNew, true));
      if (input.search) {
        conditions.push(
          or(
            like(products.name, `%${input.search}%`),
            like(products.shortDescription, `%${input.search}%`)
          )!
        );
      }

      const orderBy =
        input.sortBy === "price_asc"
          ? asc(products.basePrice)
          : input.sortBy === "price_desc"
          ? desc(products.basePrice)
          : input.sortBy === "popular"
          ? desc(products.isBestSeller)
          : desc(products.createdAt);

      const offset = (input.page - 1) * input.limit;

      const [items, countResult] = await Promise.all([
        db
          .select({
            id: products.id,
            slug: products.slug,
            sku: products.sku,
            name: products.name,
            shortDescription: products.shortDescription,
            basePrice: products.basePrice,
            salePrice: products.salePrice,
            currency: products.currency,
            stockQuantity: products.stockQuantity,
            isInStock: products.isInStock,
            isFeatured: products.isFeatured,
            isBestSeller: products.isBestSeller,
            isNew: products.isNew,
            warrantyMonths: products.warrantyMonths,
            brandId: products.brandId,
            categoryId: products.categoryId,
            brandName: brands.name,
            brandSlug: brands.slug,
            categoryName: categories.name,
            categorySlug: categories.slug,
            createdAt: products.createdAt,
          })
          .from(products)
          .leftJoin(brands, eq(products.brandId, brands.id))
          .leftJoin(categories, eq(products.categoryId, categories.id))
          .where(and(...conditions))
          .orderBy(orderBy)
          .limit(input.limit)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(products)
          .where(and(...conditions)),
      ]);

      // Fetch primary images
      const productIds = items.map((p) => p.id);
      const images =
        productIds.length > 0
          ? await db
              .select()
              .from(productImages)
              .where(and(inArray(productImages.productId, productIds), eq(productImages.isPrimary, true)))
          : [];

      const imageMap = new Map(images.map((img) => [img.productId, img.url]));

      return {
        items: items.map((p) => ({ ...p, imageUrl: imageMap.get(p.id) || null })),
        total: Number(countResult[0]?.count ?? 0),
      };
    }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const [product] = await db
        .select({
          id: products.id,
          slug: products.slug,
          sku: products.sku,
          name: products.name,
          shortDescription: products.shortDescription,
          description: products.description,
          basePrice: products.basePrice,
          salePrice: products.salePrice,
          currency: products.currency,
          stockQuantity: products.stockQuantity,
          isInStock: products.isInStock,
          isFeatured: products.isFeatured,
          isBestSeller: products.isBestSeller,
          isNew: products.isNew,
          warrantyMonths: products.warrantyMonths,
          specifications: products.specifications,
          tags: products.tags,
          brandId: products.brandId,
          categoryId: products.categoryId,
          brandName: brands.name,
          brandSlug: brands.slug,
          brandTagline: brands.tagline,
          categoryName: categories.name,
          categorySlug: categories.slug,
          createdAt: products.createdAt,
        })
        .from(products)
        .leftJoin(brands, eq(products.brandId, brands.id))
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(and(eq(products.slug, input.slug), eq(products.isActive, true)))
        .limit(1);

      if (!product) return null;

      const [images, variants, productReviews] = await Promise.all([
        db.select().from(productImages).where(eq(productImages.productId, product.id)).orderBy(asc(productImages.sortOrder)),
        db.select().from(productVariants).where(and(eq(productVariants.productId, product.id), eq(productVariants.isActive, true))),
        db.select().from(reviews).where(and(eq(reviews.productId, product.id), eq(reviews.isApproved, true))).limit(10),
      ]);

      return { ...product, images, variants, reviews: productReviews };
    }),

  related: publicProcedure
    .input(z.object({ productId: z.number(), brandId: z.number(), categoryId: z.number(), limit: z.number().default(4) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const items = await db
        .select({
          id: products.id,
          slug: products.slug,
          name: products.name,
          basePrice: products.basePrice,
          salePrice: products.salePrice,
          currency: products.currency,
          isInStock: products.isInStock,
          brandName: brands.name,
        })
        .from(products)
        .leftJoin(brands, eq(products.brandId, brands.id))
        .where(
          and(
            eq(products.isActive, true),
            eq(products.brandId, input.brandId),
            sql`${products.id} != ${input.productId}`
          )
        )
        .limit(input.limit);

      const productIds = items.map((p) => p.id);
      const images =
        productIds.length > 0
          ? await db
              .select()
              .from(productImages)
              .where(and(inArray(productImages.productId, productIds), eq(productImages.isPrimary, true)))
          : [];
      const imageMap = new Map(images.map((img) => [img.productId, img.url]));

      return items.map((p) => ({ ...p, imageUrl: imageMap.get(p.id) || null }));
    }),

  search: publicProcedure
    .input(z.object({ query: z.string(), limit: z.number().default(8) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db || !input.query.trim()) return [];

      const items = await db
        .select({
          id: products.id,
          slug: products.slug,
          name: products.name,
          basePrice: products.basePrice,
          salePrice: products.salePrice,
          brandName: brands.name,
        })
        .from(products)
        .leftJoin(brands, eq(products.brandId, brands.id))
        .where(
          and(
            eq(products.isActive, true),
            or(
              like(products.name, `%${input.query}%`),
              like(products.shortDescription, `%${input.query}%`)
            )
          )
        )
        .limit(input.limit);

      const productIds = items.map((p) => p.id);
      const images =
        productIds.length > 0
          ? await db
              .select()
              .from(productImages)
              .where(and(inArray(productImages.productId, productIds), eq(productImages.isPrimary, true)))
          : [];
      const imageMap = new Map(images.map((img) => [img.productId, img.url]));

      return items.map((p) => ({ ...p, imageUrl: imageMap.get(p.id) || null }));
    }),
});
