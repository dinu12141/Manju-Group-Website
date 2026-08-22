import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  products,
  brands,
  categories,
  productImages,
  productVariants,
} from "../../drizzle/schema";
import { and, asc, desc, eq, gte, lte, like, or, sql, type SQL } from "drizzle-orm";

// Shape returned to the frontend for a single product. Mirrors the legacy
// App-API-backed shape so client components don't need to change.
type WebsiteProduct = {
  id: number;
  slug: string;
  sku: string;
  name: string;
  shortDescription: string;
  description: string | null;
  basePrice: number;
  salePrice: number | null;
  currency: string;
  stockQuantity: number;
  isInStock: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  warrantyMonths: number;
  specifications: unknown;
  tags: unknown;
  brandId: number;
  categoryId: number;
  brandName: string;
  brandSlug: string;
  brandTagline: string | null;
  categoryName: string;
  categorySlug: string;
  createdAt: Date;
  imageUrl: string | null;
  images: Array<{
    id: number;
    productId: number;
    url: string;
    isPrimary: boolean;
    sortOrder: number;
  }>;
  variants: Array<{
    id: number;
    productId: number;
    sku: string;
    name: string;
    options: unknown;
    price: number;
    salePrice: number | null;
    stockQuantity: number;
    isActive: boolean;
  }>;
  reviews: never[];
};

// Row shape produced by the base select-with-joins query used by list/bySlug/etc.
type ProductJoinRow = {
  product: typeof products.$inferSelect;
  brand: typeof brands.$inferSelect | null;
  category: typeof categories.$inferSelect | null;
};

function mapProductRow(
  row: ProductJoinRow,
  images: (typeof productImages.$inferSelect)[],
  variants: (typeof productVariants.$inferSelect)[]
): WebsiteProduct {
  const { product, brand, category } = row;

  const sortedImages = [...images].sort((a, b) => {
    if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  });
  const primaryImage = sortedImages[0] ?? null;

  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    shortDescription: product.shortDescription || "",
    description: product.description,
    basePrice: Number(product.basePrice),
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    currency: product.currency,
    stockQuantity: product.stockQuantity,
    isInStock: product.isInStock,
    isFeatured: product.isFeatured,
    isBestSeller: product.isBestSeller,
    isNew: product.isNew,
    warrantyMonths: product.warrantyMonths ?? 0,
    specifications: product.specifications,
    tags: product.tags,
    brandId: product.brandId,
    categoryId: product.categoryId,
    brandName: brand?.name ?? "Unknown Brand",
    brandSlug: brand?.slug ?? "unknown",
    brandTagline: brand?.tagline ?? null,
    categoryName: category?.name ?? "Uncategorized",
    categorySlug: category?.slug ?? "uncategorized",
    createdAt: product.createdAt,
    imageUrl: primaryImage?.url ?? null,
    images: sortedImages.map(img => ({
      id: img.id,
      productId: img.productId,
      url: img.url,
      isPrimary: img.isPrimary,
      sortOrder: img.sortOrder ?? 0,
    })),
    variants: variants.map(v => ({
      id: v.id,
      productId: v.productId,
      sku: v.sku,
      name: v.name,
      options: v.options,
      price: Number(v.price),
      salePrice: v.salePrice ? Number(v.salePrice) : null,
      stockQuantity: v.stockQuantity,
      isActive: v.isActive,
    })),
    reviews: [],
  };
}

// Fetch images/variants for a set of product ids and group them so callers
// can build the final WebsiteProduct shape without N+1 queries.
async function loadImagesAndVariants(
  db: NonNullable<Awaited<ReturnType<typeof getDb>>>,
  productIds: number[]
) {
  const imagesByProduct = new Map<
    number,
    (typeof productImages.$inferSelect)[]
  >();
  const variantsByProduct = new Map<
    number,
    (typeof productVariants.$inferSelect)[]
  >();

  if (productIds.length === 0) {
    return { imagesByProduct, variantsByProduct };
  }

  const [allImages, allVariants] = await Promise.all([
    db
      .select()
      .from(productImages)
      .where(or(...productIds.map(id => eq(productImages.productId, id)))),
    db
      .select()
      .from(productVariants)
      .where(or(...productIds.map(id => eq(productVariants.productId, id)))),
  ]);

  for (const img of allImages) {
    const list = imagesByProduct.get(img.productId) ?? [];
    list.push(img);
    imagesByProduct.set(img.productId, list);
  }
  for (const v of allVariants) {
    const list = variantsByProduct.get(v.productId) ?? [];
    list.push(v);
    variantsByProduct.set(v.productId, list);
  }

  return { imagesByProduct, variantsByProduct };
}

async function hydrateRows(
  db: NonNullable<Awaited<ReturnType<typeof getDb>>>,
  rows: ProductJoinRow[]
): Promise<WebsiteProduct[]> {
  const ids = rows.map(r => r.product.id);
  const { imagesByProduct, variantsByProduct } = await loadImagesAndVariants(
    db,
    ids
  );
  return rows.map(row =>
    mapProductRow(
      row,
      imagesByProduct.get(row.product.id) ?? [],
      variantsByProduct.get(row.product.id) ?? []
    )
  );
}

export const productsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(12),
        brandId: z.union([z.number(), z.string()]).optional(),
        categoryId: z.union([z.number(), z.string()]).optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        inStockOnly: z.boolean().optional(),
        search: z.string().optional(),
        sortBy: z
          .enum(["newest", "price_asc", "price_desc", "popular"])
          .default("newest"),
        isFeatured: z.boolean().optional(),
        isBestSeller: z.boolean().optional(),
        isNew: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { items: [], total: 0 };

      const conditions: SQL[] = [eq(products.isActive, true)];

      if (input.brandId) {
        conditions.push(eq(products.brandId, Number(input.brandId)));
      }
      if (input.categoryId) {
        conditions.push(eq(products.categoryId, Number(input.categoryId)));
      }
      if (input.minPrice !== undefined) {
        conditions.push(gte(products.basePrice, String(input.minPrice)));
      }
      if (input.maxPrice !== undefined) {
        conditions.push(lte(products.basePrice, String(input.maxPrice)));
      }
      if (input.inStockOnly) {
        conditions.push(eq(products.isInStock, true));
      }
      if (input.isFeatured !== undefined) {
        conditions.push(eq(products.isFeatured, input.isFeatured));
      }
      if (input.isBestSeller !== undefined) {
        conditions.push(eq(products.isBestSeller, input.isBestSeller));
      }
      if (input.isNew !== undefined) {
        conditions.push(eq(products.isNew, input.isNew));
      }
      if (input.search && input.search.trim()) {
        const term = `%${input.search.trim()}%`;
        conditions.push(
          or(
            like(products.name, term),
            like(products.shortDescription, term),
            like(products.description, term)
          ) as SQL
        );
      }

      const whereClause = and(...conditions);

      let orderBy;
      switch (input.sortBy) {
        case "price_asc":
          orderBy = asc(products.basePrice);
          break;
        case "price_desc":
          orderBy = desc(products.basePrice);
          break;
        case "popular":
          orderBy = desc(products.isBestSeller);
          break;
        case "newest":
        default:
          orderBy = desc(products.createdAt);
          break;
      }

      const offset = (input.page - 1) * input.limit;

      const [rows, totalRows] = await Promise.all([
        db
          .select({ product: products, brand: brands, category: categories })
          .from(products)
          .leftJoin(brands, eq(products.brandId, brands.id))
          .leftJoin(categories, eq(products.categoryId, categories.id))
          .where(whereClause)
          .orderBy(orderBy)
          .limit(input.limit)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(products)
          .where(whereClause),
      ]);

      const items = await hydrateRows(db, rows);
      const total = Number(totalRows[0]?.count ?? 0);

      return { items, total };
    }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const rows = await db
        .select({ product: products, brand: brands, category: categories })
        .from(products)
        .leftJoin(brands, eq(products.brandId, brands.id))
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(eq(products.slug, input.slug))
        .limit(1);

      if (rows.length === 0) return null;

      const [hydrated] = await hydrateRows(db, rows);
      return hydrated ?? null;
    }),

  related: publicProcedure
    .input(
      z.object({
        productId: z.union([z.number(), z.string()]),
        brandId: z.union([z.number(), z.string()]).optional(),
        categoryId: z.union([z.number(), z.string()]).optional(),
        limit: z.number().default(4),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions: SQL[] = [
        eq(products.isActive, true),
        sql`${products.id} != ${Number(input.productId)}`,
      ];

      if (input.categoryId) {
        conditions.push(eq(products.categoryId, Number(input.categoryId)));
      } else if (input.brandId) {
        conditions.push(eq(products.brandId, Number(input.brandId)));
      }

      const rows = await db
        .select({ product: products, brand: brands, category: categories })
        .from(products)
        .leftJoin(brands, eq(products.brandId, brands.id))
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(and(...conditions))
        .orderBy(desc(products.createdAt))
        .limit(input.limit);

      return hydrateRows(db, rows);
    }),

  getFeatured: publicProcedure
    .input(z.object({ limit: z.number().default(8) }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const rows = await db
        .select({ product: products, brand: brands, category: categories })
        .from(products)
        .leftJoin(brands, eq(products.brandId, brands.id))
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(and(eq(products.isActive, true), eq(products.isFeatured, true)))
        .orderBy(desc(products.createdAt))
        .limit(input?.limit ?? 8);

      return hydrateRows(db, rows);
    }),

  search: publicProcedure
    .input(z.object({ query: z.string(), limit: z.number().default(8) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      if (!input.query.trim()) return [];

      const term = `%${input.query.trim()}%`;

      const rows = await db
        .select({ product: products, brand: brands, category: categories })
        .from(products)
        .leftJoin(brands, eq(products.brandId, brands.id))
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(
          and(
            eq(products.isActive, true),
            or(
              like(products.name, term),
              like(products.shortDescription, term),
              like(products.description, term),
              like(products.sku, term)
            )
          )
        )
        .orderBy(desc(products.isFeatured), desc(products.createdAt))
        .limit(input.limit);

      return hydrateRows(db, rows);
    }),
});
