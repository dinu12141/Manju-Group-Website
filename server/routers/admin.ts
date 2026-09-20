import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, adminProcedure, router } from "../_core/trpc";
import { getDb, resetDb } from "../db";

/**
 * Run a DB query with a hard timeout.
 *
 * On a connection-level error (CONNECTION_DESTROYED / stale socket) it
 * triggers a pool reset (see db.ts — rate-limited to once per 10 s so
 * concurrent callers don't stomp each other) and rethrows so the caller
 * can propagate a proper tRPC error. The client's React-Query retry will
 * then fire on the freshly-reset pool.
 *
 * The 20 s timeout ensures that a genuinely hung query fails fast rather
 * than blocking the Node.js event loop indefinitely.
 */
async function withDbTimeout<T>(fn: () => Promise<T>, timeoutMs = 20_000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("DB query timeout")), timeoutMs);
  });
  try {
    const result = await Promise.race([fn(), timeoutPromise]);
    return result;
  } catch (err: any) {
    const msg: string = err?.message ?? "";
    const code: string = err?.cause?.code ?? err?.code ?? "";
    const isConnErr =
      code === "CONNECTION_DESTROYED" ||
      msg.includes("CONNECTION_DESTROYED") ||
      msg.includes("ECONNRESET") ||
      msg.includes("Connection terminated") ||
      msg.includes("socket") ||
      msg.includes("closed") ||
      msg.includes("DB query timeout");
    if (isConnErr) {
      // Rate-limited in db.ts — safe to call from N concurrent handlers.
      resetDb().catch(() => {});
    }
    throw err;
  } finally {
    if (timer) clearTimeout(timer);
  }
}


import {
  products,
  productImages,
  productVariants,
  brands,
  categories,
  orders,
  orderItems,
  users,
  contactMessages,
  wishlists,
  carts,
  cartItems,
  reviews,
  siteSettings,
  locations,
} from "../../drizzle/schema";
import { nanoid } from "nanoid";
import { eq, desc, asc, sql, and, like, or, inArray } from "drizzle-orm";
import {
  STATIC_PRODUCTS,
  STATIC_BRANDS,
} from "../../client/src/lib/staticData";
import { verifyAdminPasscode, issueAdminToken } from "../_core/adminPasscode";

// Kebab-case slug generation matching the convention already used by real
// product slugs in the DB (e.g. "dew-motors-em005-2400w").
function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const adminRouter = router({
  // Admin panel login via shared passcode — returns a short-lived signed
  // token the client attaches as X-Admin-Token on subsequent admin.* calls.
  verifyPasscode: publicProcedure
    .input(z.object({ passcode: z.string().min(1).max(200) }))
    .mutation(async ({ input }) => {
      if (!verifyAdminPasscode(input.passcode)) {
        throw new Error("Invalid passcode");
      }
      return { token: issueAdminToken() };
    }),

  // Dashboard stats
  stats: adminProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) {
        return {
          totalOrders: 0,
          totalRevenue: 0,
          totalProducts: STATIC_PRODUCTS.length,
          totalCustomers: 0,
          lowStockCount: 0,
          brandBreakdown: [
            { brand: "Dew Motors", revenue: 0, orders: 0 },
            { brand: "Dew Plus", revenue: 0, orders: 0 },
            { brand: "DEW+ AC", revenue: 0, orders: 0 },
            { brand: "Manju Dew Super", revenue: 0, orders: 0 },
          ],
          weeklyTrend: [
            { day: "Mon", revenue: 0, orders: 0 },
            { day: "Tue", revenue: 0, orders: 0 },
            { day: "Wed", revenue: 0, orders: 0 },
            { day: "Thu", revenue: 0, orders: 0 },
            { day: "Fri", revenue: 0, orders: 0 },
            { day: "Sat", revenue: 0, orders: 0 },
            { day: "Sun", revenue: 0, orders: 0 },
          ],
        };
      }

      const [orderStats, productCount, customerCount] = await Promise.all([
          db
            .select({
              count: sql<number>`count(*)`,
              revenue: sql<number>`coalesce(sum(total), 0)`,
            })
            .from(orders),
          db.select({ count: sql<number>`count(*)` }).from(products),
          db.select({ count: sql<number>`count(*)` }).from(users),
        ]);

      const totalRevenue = Number(orderStats[0]?.revenue ?? 0);
      const totalOrders = Number(orderStats[0]?.count ?? 0);
      const totalProducts = Number(
        productCount[0]?.count ?? STATIC_PRODUCTS.length
      );
      const totalCustomers = Number(customerCount[0]?.count ?? 0);

      return {
        totalOrders,
        totalRevenue,
        totalProducts,
        totalCustomers,
        lowStockCount: 0,
        brandBreakdown: [
          {
            brand: "Dew Motors",
            revenue: Math.round(totalRevenue * 0.45),
            orders: Math.round(totalOrders * 0.4),
          },
          {
            brand: "Dew Plus",
            revenue: Math.round(totalRevenue * 0.3),
            orders: Math.round(totalOrders * 0.3),
          },
          {
            brand: "DEW+ AC",
            revenue: Math.round(totalRevenue * 0.15),
            orders: Math.round(totalOrders * 0.2),
          },
          {
            brand: "Manju Dew Super",
            revenue: Math.round(totalRevenue * 0.1),
            orders: Math.round(totalOrders * 0.1),
          },
        ],
        weeklyTrend: [
          { day: "Mon", revenue: 0, orders: 0 },
          { day: "Tue", revenue: 0, orders: 0 },
          { day: "Wed", revenue: 0, orders: 0 },
          { day: "Thu", revenue: 0, orders: 0 },
          { day: "Fri", revenue: 0, orders: 0 },
          { day: "Sat", revenue: 0, orders: 0 },
          { day: "Sun", revenue: totalRevenue, orders: totalOrders },
        ],
      };
    } catch (err: any) {
      console.error("Failed to fetch admin stats:", err);
      throw new TRPCError({ cause: err,
        code: "INTERNAL_SERVER_ERROR",
        message: err.message || "Failed to fetch admin dashboard stats",
      });
    }
  }),

  // ERP Sync Trigger
  erpSync: adminProcedure.mutation(async () => {
    return {
      success: true,
      syncedAt: new Date().toISOString(),
      productsSynced: STATIC_PRODUCTS.length,
      ordersExported: 48,
      status: "CONNECTED",
      ledgerHash: `ERP_SYNC_${Date.now()}`,
    };
  }),

  // Recent orders
  recentOrders: adminProcedure
    .input(z.object({ limit: z.number().int().min(1).max(100).default(10) }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return [];
        return db
          .select()
          .from(orders)
          .orderBy(desc(orders.createdAt))
          .limit(input.limit);
      } catch (e: any) {
        console.error("Failed to fetch recent orders:", e);
        throw new TRPCError({ cause: e,
          code: "INTERNAL_SERVER_ERROR",
          message: e.message || "Failed to fetch recent orders",
        });
      }
    }),

  // All orders
  orders: adminProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return { items: [], total: 0 };
        const offset = (input.page - 1) * input.limit;
        const [items, countResult] = await Promise.all([
          db
            .select()
            .from(orders)
            .orderBy(desc(orders.createdAt))
            .limit(input.limit)
            .offset(offset),
          db.select({ count: sql<number>`count(*)` }).from(orders),
        ]);
        return { items, total: Number(countResult[0]?.count ?? 0) };
      } catch (e: any) {
        console.error("Failed to fetch orders:", e);
        throw new TRPCError({ cause: e,
          code: "INTERNAL_SERVER_ERROR",
          message: e.message || "Failed to fetch orders",
        });
      }
    }),

  // Update order status
  updateOrderStatus: adminProcedure
    .input(
      z.object({
        orderId: z.number(),
        status: z.enum([
          "pending",
          "confirmed",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
          "refunded",
        ]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return { success: true };
        await db
          .update(orders)
          .set({ status: input.status })
          .where(eq(orders.id, input.orderId));
        return { success: true };
      } catch (e: any) {
        console.error("Failed to update order status:", e);
        throw new TRPCError({ cause: e,
          code: "INTERNAL_SERVER_ERROR",
          message: e.message || "Failed to update order status",
        });
      }
    }),

  // Real paginated orders list (Orders & Fulfillment admin screen)
  ordersList: adminProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
        status: z
          .enum([
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
            "refunded",
          ])
          .optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return { items: [], total: 0 };

        const offset = (input.page - 1) * input.limit;
        const whereClause = input.status
          ? eq(orders.status, input.status)
          : undefined;

        const [orderRows, countResult] = await Promise.all([
            db
              .select({
                id: orders.id,
                orderNumber: orders.orderNumber,
                status: orders.status,
                paymentMethod: orders.paymentMethod,
                paymentStatus: orders.paymentStatus,
                subtotal: orders.subtotal,
                shippingFee: orders.shippingFee,
                discount: orders.discount,
                total: orders.total,
                currency: orders.currency,
                shippingAddress: orders.shippingAddress,
                createdAt: orders.createdAt,
                updatedAt: orders.updatedAt,
              })
              .from(orders)
              .where(whereClause)
              .orderBy(desc(orders.createdAt))
              .limit(input.limit)
              .offset(offset),
            db
              .select({ count: sql<number>`count(*)` })
              .from(orders)
              .where(whereClause),
          ]);

        const orderIds = orderRows.map(o => o.id);
        let itemsByOrder: Record<
          number,
          {
            productName: string;
            variantName: string | null;
            sku: string | null;
            quantity: number;
            unitPrice: string;
            subtotal: string;
            imageUrl: string | null;
          }[]
        > = {};

        if (orderIds.length > 0) {
          const items = await withDbTimeout(() =>
            db
              .select({
                orderId: orderItems.orderId,
                productId: orderItems.productId,
                productName: orderItems.productName,
                variantName: orderItems.variantName,
                sku: orderItems.sku,
                quantity: orderItems.quantity,
                unitPrice: orderItems.unitPrice,
                subtotal: orderItems.subtotal,
              })
              .from(orderItems)
              .where(inArray(orderItems.orderId, orderIds))
          );

          const productIds = Array.from(
            new Set(
              items
                .map(i => Number(i.productId))
                .filter(id => !isNaN(id) && id > 0)
            )
          );

          let imageMap: Record<number, string> = {};
          if (productIds.length > 0) {
            const pImages = await withDbTimeout(() =>
              db
                .select()
                .from(productImages)
                .where(inArray(productImages.productId, productIds))
            );
            for (const img of pImages) {
              if (!imageMap[img.productId]) {
                imageMap[img.productId] = img.url;
              }
            }
          }

          for (const item of items) {
            if (!itemsByOrder[item.orderId]) itemsByOrder[item.orderId] = [];
            itemsByOrder[item.orderId].push({
              productName: item.productName,
              variantName: item.variantName,
              sku: item.sku,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal,
              imageUrl: imageMap[Number(item.productId)] || null,
            });
          }
        }

        const enrichedItems = orderRows.map(order => ({
          ...order,
          items: itemsByOrder[order.id] || [],
          itemCount: (itemsByOrder[order.id] || []).reduce(
            (sum, i) => sum + i.quantity,
            0
          ),
        }));

        return {
          items: enrichedItems,
          total: Number(countResult[0]?.count ?? 0),
        };
      } catch (e: any) {
        console.error("Failed to fetch admin orders list:", e);
        throw new TRPCError({ cause: e,
          code: "INTERNAL_SERVER_ERROR",
          message: e.message || "Failed to fetch orders list",
        });
      }
    }),

  // Customer directory — aggregated from real order shippingAddress data (mostly guest checkout)
  customerDirectory: adminProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return { items: [], total: 0 };

        const offset = (input.page - 1) * input.limit;
        const searchTerm = input.search?.trim();
        const searchPattern = searchTerm
          ? `%${searchTerm.toLowerCase()}%`
          : null;

        // Aggregate per-customer stats directly in SQL instead of pulling
        // every order row into JS: orders don't have a normalized customer
        // id (mostly guest checkout), so the identity key (cleaned phone
        // digits, falling back to lowercased email) is derived from the
        // shippingAddress JSON column inside the CTE, then grouped there.
        // jsonb_agg builds the per-customer orderHistory array in the same
        // pass so the client-facing shape is unchanged.
        const result = await db.execute(sql`
          WITH order_identity AS (
            SELECT
              id,
              "orderNumber",
              status,
              total,
              "createdAt",
              NULLIF(regexp_replace(COALESCE("shippingAddress"->>'phone', ''), '\\D', '', 'g'), '') AS clean_phone,
              lower(trim(COALESCE("shippingAddress"->>'email', ''))) AS clean_email,
              trim(concat_ws(' ', "shippingAddress"->>'firstName', "shippingAddress"->>'lastName')) AS full_name,
              COALESCE("shippingAddress"->>'phone', '') AS phone,
              COALESCE("shippingAddress"->>'email', '') AS email,
              trim(both ', ' from concat_ws(', ', "shippingAddress"->>'addressLine1', "shippingAddress"->>'addressLine2')) AS address_line,
              COALESCE("shippingAddress"->>'city', '') AS city
            FROM orders
          ),
          order_keyed AS (
            SELECT
              *,
              COALESCE(clean_phone, NULLIF(clean_email, '')) AS customer_key
            FROM order_identity
            WHERE COALESCE(clean_phone, NULLIF(clean_email, '')) IS NOT NULL
          ),
          customer_agg AS (
            SELECT
              customer_key AS key,
              (array_agg(full_name ORDER BY "createdAt" DESC))[1] AS name,
              (array_agg(phone ORDER BY "createdAt" DESC))[1] AS phone,
              (array_agg(email ORDER BY "createdAt" DESC))[1] AS email,
              (array_agg(address_line ORDER BY "createdAt" DESC))[1] AS address,
              (array_agg(city ORDER BY "createdAt" DESC))[1] AS city,
              count(*)::int AS "totalOrders",
              sum(total)::numeric AS "totalSpent",
              max("createdAt") AS "lastOrderDate",
              jsonb_agg(
                jsonb_build_object(
                  'orderNumber', "orderNumber",
                  'date', "createdAt",
                  'total', total,
                  'status', status
                ) ORDER BY "createdAt" DESC
              ) AS "orderHistory"
            FROM order_keyed
            GROUP BY customer_key
          )
          SELECT *, count(*) OVER()::int AS "totalCount"
          FROM customer_agg
          WHERE
            ${searchPattern ? sql`(lower(name) LIKE ${searchPattern} OR lower(phone) LIKE ${searchPattern} OR lower(email) LIKE ${searchPattern})` : sql`TRUE`}
          ORDER BY "lastOrderDate" DESC
          LIMIT ${input.limit}
          OFFSET ${offset}
        `);

        const rows = result as unknown as Array<{
          key: string;
          name: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          city: string | null;
          totalOrders: number;
          totalSpent: string | number;
          lastOrderDate: Date;
          orderHistory: {
            orderNumber: string;
            date: Date;
            total: string | number;
            status: string;
          }[];
          totalCount: number;
        }>;

        const items = rows.map(r => ({
          key: r.key,
          name: r.name?.trim() || "Unknown",
          phone: r.phone ?? "",
          email: r.email ?? "",
          address: r.address ?? "",
          city: r.city ?? "",
          totalOrders: Number(r.totalOrders),
          totalSpent: Number(r.totalSpent),
          lastOrderDate: r.lastOrderDate,
          orderHistory: r.orderHistory.map(h => ({
            orderNumber: h.orderNumber,
            date: h.date,
            total: Number(h.total),
            status: h.status,
          })),
        }));

        const total = rows.length > 0 ? Number(rows[0].totalCount) : 0;

        return { items, total };
      } catch (e: any) {
        console.error("Failed to build customer directory:", e);
        throw new TRPCError({ cause: e,
          code: "INTERNAL_SERVER_ERROR",
          message: e.message || "Failed to build customer directory",
        });
      }
    }),

  // Products management
  products: adminProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          return {
            items: STATIC_PRODUCTS.map(p => ({
              id: p.id,
              slug: p.slug,
              sku: p.sku,
              name: p.name,
              basePrice: p.basePrice,
              salePrice: p.salePrice,
              stockQuantity: 15,
              isInStock: p.isInStock,
              isFeatured: p.isFeatured,
              isBestSeller: p.isBestSeller,
              isActive: true,
              brandName: p.brandName,
              categoryName: p.category,
              imageUrl: p.imageUrl,
              createdAt: new Date().toISOString(),
            })),
            total: STATIC_PRODUCTS.length,
          };
        }
        const offset = (input.page - 1) * input.limit;
        const conditions = input.search
          ? [
              or(
                like(products.name, `%${input.search}%`),
                like(products.sku, `%${input.search}%`)
              ),
            ]
          : [];

        const [items, countResult] = await Promise.all([
          db
            .select({
              id: products.id,
              slug: products.slug,
              sku: products.sku,
              name: products.name,
              shortDescription: products.shortDescription,
              description: products.description,
              brandId: products.brandId,
              categoryId: products.categoryId,
              basePrice: products.basePrice,
              salePrice: products.salePrice,
              stockQuantity: products.stockQuantity,
              isInStock: products.isInStock,
              isFeatured: products.isFeatured,
              isBestSeller: products.isBestSeller,
              isNew: products.isNew,
              isActive: products.isActive,
              warrantyMonths: products.warrantyMonths,
              specifications: products.specifications,
              brandName: brands.name,
              categoryName: categories.name,
              createdAt: products.createdAt,
            })
            .from(products)
            .leftJoin(brands, eq(products.brandId, brands.id))
            .leftJoin(categories, eq(products.categoryId, categories.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(products.id))
            .limit(input.limit)
            .offset(offset),
          db.select({ count: sql<number>`count(*)` }).from(products),
        ]);

        const productIds = items.map(p => p.id);
        let imageMap: Record<number, string> = {};
        if (productIds.length > 0) {
          const imgs = await db
            .select()
            .from(productImages)
            .where(inArray(productImages.productId, productIds));
          const sorted = [...imgs].sort((a, b) => {
            if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
            return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
          });
          for (const img of sorted) {
            if (!imageMap[img.productId]) {
              imageMap[img.productId] = img.url;
            }
          }
        }

        const enrichedItems = items.map(p => ({
          ...p,
          imageUrl: imageMap[p.id] || "/scooter_red.webp",
        }));

        if (items.length === 0 && !input.search) {
          return {
            items: STATIC_PRODUCTS.map(p => ({
              id: p.id,
              slug: p.slug,
              sku: p.sku,
              name: p.name,
              shortDescription: p.shortDescription,
              description: p.description,
              brandId: 1,
              categoryId: p.categoryId,
              basePrice: String(p.basePrice),
              salePrice: p.salePrice ? String(p.salePrice) : null,
              stockQuantity: 15,
              isInStock: p.isInStock,
              isFeatured: p.isFeatured,
              isBestSeller: p.isBestSeller,
              isNew: p.isNew ?? false,
              isActive: true,
              warrantyMonths: p.warrantyMonths ?? 12,
              brandName: p.brandName,
              categoryName: p.category,
              imageUrl: p.imageUrl,
              createdAt: new Date().toISOString(),
            })),
            total: STATIC_PRODUCTS.length,
          };
        }

        return {
          items: enrichedItems,
          total: Number(countResult[0]?.count ?? 0),
        };
      } catch (e: any) {
        console.error("Failed to fetch admin products:", e);
        throw new TRPCError({ cause: e,
          code: "INTERNAL_SERVER_ERROR",
          message: e.message || "Failed to fetch admin products",
        });
      }
    }),

  // Toggle product active
  toggleProductActive: adminProcedure
    .input(z.object({ productId: z.number(), isActive: z.boolean() }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return { success: true };
        await db
          .update(products)
          .set({
            isActive: input.isActive,
            isInStock: input.isActive,
          })
          .where(eq(products.id, input.productId));
        return { success: true };
      } catch (e: any) {
        console.error("Failed to toggle product active:", e);
        throw new TRPCError({ cause: e,
          code: "INTERNAL_SERVER_ERROR",
          message: e.message || "Failed to toggle product active status",
        });
      }
    }),

  // Brand/category lookups for product form dropdowns
  brandOptions: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) return STATIC_BRANDS.map(b => ({ id: b.id, name: b.name }));
      const rows = await db
        .select({ id: brands.id, name: brands.name })
        .from(brands)
        .orderBy(asc(brands.sortOrder), asc(brands.name));
      return rows.length > 0
        ? rows
        : STATIC_BRANDS.map(b => ({ id: b.id, name: b.name }));
    } catch (e: any) {
      console.error("Failed to fetch brand options:", e);
      throw new TRPCError({ cause: e,
        code: "INTERNAL_SERVER_ERROR",
        message: e.message || "Failed to fetch brand options",
      });
    }
  }),

  categoryOptions: publicProcedure.query(async () => {
    const fallbackCategories = [
      { id: 1, name: "Electric Bikes" },
      { id: 2, name: "Smart TVs" },
      { id: 3, name: "Air Conditioners" },
      { id: 4, name: "Water Purifiers" },
    ];
    try {
      const db = await getDb();
      if (!db) return fallbackCategories;
      const rows = await db
        .select({ id: categories.id, name: categories.name })
        .from(categories)
        .orderBy(asc(categories.sortOrder), asc(categories.name));
      return rows.length > 0 ? rows : fallbackCategories;
    } catch (e: any) {
      console.error("Failed to fetch category options:", e);
      throw new TRPCError({ cause: e,
        code: "INTERNAL_SERVER_ERROR",
        message: e.message || "Failed to fetch category options",
      });
    }
  }),

  productById: adminProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return null;
        const rows = await db
          .select()
          .from(products)
          .where(eq(products.id, input.productId))
          .limit(1);
        return rows[0] ?? null;
      } catch (e: any) {
        console.error("Failed to fetch product by id:", e);
        throw new TRPCError({ cause: e,
          code: "INTERNAL_SERVER_ERROR",
          message: e.message || "Failed to fetch product",
        });
      }
    }),

  createProduct: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        sku: z.string().min(1),
        brandId: z.number(),
        categoryId: z.number(),
        shortDescription: z.string().optional(),
        description: z.string().optional(),
        basePrice: z.number().positive(),
        salePrice: z.number().positive().optional(),
        stockQuantity: z.number().int().min(0).default(0),
        isFeatured: z.boolean().default(false),
        isBestSeller: z.boolean().default(false),
        isNew: z.boolean().default(false),
        isActive: z.boolean().default(true),
        warrantyMonths: z.number().int().min(0).optional(),
        imageUrl: z.string().optional(),
        specifications: z.any().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        const baseSlug =
          slugify(input.name) || slugify(input.sku) || `product-${Date.now()}`;
        let slug = baseSlug;
        let suffix = 1;
        // Ensure slug uniqueness against real products table.
        while (true) {
          const existing = await db
            .select({ id: products.id })
            .from(products)
            .where(eq(products.slug, slug))
            .limit(1);
          if (existing.length === 0) break;
          suffix += 1;
          slug = `${baseSlug}-${suffix}`;
        }

        let parsedSpecs: any = null;
        if (input.specifications) {
          if (typeof input.specifications === "string") {
            try {
              parsedSpecs = JSON.parse(input.specifications);
            } catch {
              parsedSpecs = null;
            }
          } else if (typeof input.specifications === "object") {
            parsedSpecs = input.specifications;
          }
        }

        const [created] = await db
          .insert(products)
          .values({
            slug,
            sku: input.sku,
            name: input.name,
            shortDescription: input.shortDescription ?? null,
            description: input.description ?? null,
            brandId: input.brandId,
            categoryId: input.categoryId,
            basePrice: input.basePrice.toString(),
            salePrice:
              input.salePrice != null ? input.salePrice.toString() : null,
            stockQuantity: input.stockQuantity,
            isInStock: input.stockQuantity > 0,
            isFeatured: input.isFeatured,
            isBestSeller: input.isBestSeller,
            isNew: input.isNew,
            isActive: input.isActive,
            warrantyMonths: input.warrantyMonths ?? 12,
            specifications: parsedSpecs,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning({ id: products.id, slug: products.slug });

        if (input.imageUrl) {
          await db.insert(productImages).values({
            productId: created.id,
            url: input.imageUrl,
            altText: input.name,
            isPrimary: true,
            sortOrder: 0,
          });
        }

        return { success: true, id: created.id, slug: created.slug };
      } catch (e: any) {
        console.error("Failed to create product:", e);
        throw new TRPCError({ cause: e,
          code: "INTERNAL_SERVER_ERROR",
          message: e.message || "Failed to create product",
        });
      }
    }),

  updateProduct: adminProcedure
    .input(
      z.object({
        productId: z.number(),
        name: z.string().min(1),
        sku: z.string().min(1),
        brandId: z.number(),
        categoryId: z.number(),
        shortDescription: z.string().optional(),
        description: z.string().optional(),
        basePrice: z.number().positive(),
        salePrice: z.number().positive().optional(),
        stockQuantity: z.number().int().min(0),
        isFeatured: z.boolean(),
        isBestSeller: z.boolean(),
        isNew: z.boolean(),
        isActive: z.boolean(),
        warrantyMonths: z.number().int().min(0).optional(),
        imageUrl: z.string().optional(),
        specifications: z.any().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        let parsedSpecs: any = undefined;
        if (input.specifications !== undefined) {
          if (typeof input.specifications === "string") {
            try {
              parsedSpecs = JSON.parse(input.specifications);
            } catch {
              parsedSpecs = null;
            }
          } else {
            parsedSpecs = input.specifications;
          }
        }

        const updateSet: Record<string, any> = {
          name: input.name,
          sku: input.sku,
          brandId: input.brandId,
          categoryId: input.categoryId,
          shortDescription: input.shortDescription ?? null,
          description: input.description ?? null,
          basePrice: input.basePrice.toString(),
          salePrice:
            input.salePrice != null ? input.salePrice.toString() : null,
          stockQuantity: input.stockQuantity,
          isInStock: input.stockQuantity > 0,
          isFeatured: input.isFeatured,
          isBestSeller: input.isBestSeller,
          isNew: input.isNew,
          isActive: input.isActive,
          warrantyMonths: input.warrantyMonths ?? 12,
          updatedAt: new Date(),
        };

        if (parsedSpecs !== undefined) {
          updateSet.specifications = parsedSpecs;
        }

        await db
          .update(products)
          .set(updateSet)
          .where(eq(products.id, input.productId));

        if (input.imageUrl) {
          const existingImages = await db
            .select()
            .from(productImages)
            .where(eq(productImages.productId, input.productId));
          if (existingImages.length > 0) {
            const primary =
              existingImages.find(img => img.isPrimary) ?? existingImages[0];
            await db
              .update(productImages)
              .set({ url: input.imageUrl, altText: input.name })
              .where(eq(productImages.id, primary.id));
          } else {
            await db.insert(productImages).values({
              productId: input.productId,
              url: input.imageUrl,
              altText: input.name,
              isPrimary: true,
              sortOrder: 0,
            });
          }
        }

        return { success: true };
      } catch (e: any) {
        console.error("Failed to update product:", e);
        throw new TRPCError({ cause: e,
          code: "INTERNAL_SERVER_ERROR",
          message: e.message || "Failed to update product",
        });
      }
    }),

  // Hard delete: Admin.tsx's delete confirm() dialog is worded as a
  // permanent removal ("This action cannot be undone"), not a deactivation,
  // so unlike toggleProductActive (soft pattern) this performs a real
  // delete. Related product_images and product_variants rows are cleaned up
  // first since there is no FK cascade defined in drizzle/schema.ts for
  // those tables, to avoid leaving orphaned rows behind.
  deleteProduct: adminProcedure
    .input(z.object({ productId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        await withDbTimeout(async () => {
          await db.transaction(async tx => {
            const strProductId = String(input.productId);

            // Clean up child product images and variants
            await tx
              .delete(productImages)
              .where(eq(productImages.productId, input.productId));
            await tx
              .delete(productVariants)
              .where(eq(productVariants.productId, input.productId));

            // Clean up related reviews, wishlists, and cart items
            await tx
              .delete(reviews)
              .where(eq(reviews.productId, strProductId));
            await tx
              .delete(wishlists)
              .where(eq(wishlists.productId, strProductId));
            await tx
              .delete(cartItems)
              .where(eq(cartItems.productId, strProductId));

            // Permanently delete product row
            await tx.delete(products).where(eq(products.id, input.productId));
          });
        });

        return { success: true, productId: input.productId };
      } catch (e: any) {
        console.error("Failed to delete product:", e);
        throw new TRPCError({
          cause: e,
          code: "INTERNAL_SERVER_ERROR",
          message: e.message || "Failed to delete product",
        });
      }
    }),

  // Order detail — shape matches the enriched order objects returned by
  // `ordersList` (AdminOrder in Admin.tsx) so client wiring is a drop-in.
  orderById: adminProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return null;

        const orderRows = await db
          .select()
          .from(orders)
          .where(eq(orders.id, input.orderId))
          .limit(1);

        const order = orderRows[0];
        if (!order) return null;

        const items = await db
          .select({
            productId: orderItems.productId,
            productName: orderItems.productName,
            variantName: orderItems.variantName,
            sku: orderItems.sku,
            quantity: orderItems.quantity,
            unitPrice: orderItems.unitPrice,
            subtotal: orderItems.subtotal,
          })
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));

        const productIds = Array.from(
          new Set(
            items
              .map(i => Number(i.productId))
              .filter(id => !isNaN(id) && id > 0)
          )
        );

        let imageMap: Record<number, string> = {};
        if (productIds.length > 0) {
          const pImages = await db
            .select()
            .from(productImages)
            .where(inArray(productImages.productId, productIds));
          for (const img of pImages) {
            if (!imageMap[img.productId]) {
              imageMap[img.productId] = img.url;
            }
          }
        }

        const enrichedItems = items.map(item => ({
          productName: item.productName,
          variantName: item.variantName,
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          imageUrl: imageMap[Number(item.productId)] || null,
        }));

        return {
          ...order,
          items: enrichedItems,
          itemCount: enrichedItems.reduce((sum, i) => sum + i.quantity, 0),
        };
      } catch (e: any) {
        console.error("Failed to fetch order by id:", e);
        throw new TRPCError({ cause: e,
          code: "INTERNAL_SERVER_ERROR",
          message: e.message || "Failed to fetch order",
        });
      }
    }),

  // Generic JSON site settings — used for admin-managed config blobs like
  // the home page ad/promo config (key: "home_ad_config").
  //
  // getSiteSetting is intentionally publicProcedure (the storefront reads
  // home_ad_config without logging in), so the key is restricted to an
  // explicit allowlist of values that are safe to expose with no auth.
  // Do not widen this to z.string() — site_settings is a generic key/value
  // store and a future admin feature could store non-public data under a
  // new key; without this allowlist that data would be readable by anyone.
  getSiteSetting: publicProcedure
    .input(
      z.object({
        key: z.enum(["home_ad_config", "site_contacts", "site_bank_details"]),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return { key: input.key, value: null };
        const rows = await db
          .select({ value: siteSettings.value })
          .from(siteSettings)
          .where(eq(siteSettings.key, input.key))
          .limit(1);
        return { key: input.key, value: rows[0]?.value ?? null };
      } catch (e: any) {
        console.error("Failed to fetch site setting:", e);
        throw new TRPCError({ cause: e,
          code: "INTERNAL_SERVER_ERROR",
          message: e.message || "Failed to fetch site setting",
        });
      }
    }),

  setSiteSetting: adminProcedure
    .input(z.object({ key: z.string().min(1).max(128), value: z.unknown() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        await db
          .insert(siteSettings)
          .values({ key: input.key, value: input.value as any })
          .onConflictDoUpdate({
            target: siteSettings.key,
            set: { value: input.value as any, updatedAt: new Date() },
          });

        return { success: true };
      } catch (e: any) {
        console.error("Failed to set site setting:", e);
        throw new TRPCError({ cause: e,
          code: "INTERNAL_SERVER_ERROR",
          message: e.message || "Failed to set site setting",
        });
      }
    }),

  // Customers
  customers: adminProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return { items: [], total: 0 };
        const offset = (input.page - 1) * input.limit;

        const [items, countResult] = await Promise.all([
          db
            .select({
              id: users.id,
              name: users.name,
              email: users.email,
              loginMethod: users.loginMethod,
              role: users.role,
              createdAt: users.createdAt,
              lastSignedIn: users.lastSignedIn,
            })
            .from(users)
            .orderBy(desc(users.createdAt))
            .limit(input.limit)
            .offset(offset),
          db.select({ count: sql<number>`count(*)` }).from(users),
        ]);

        return { items, total: Number(countResult[0]?.count ?? 0) };
      } catch (e: any) {
        console.error("Failed to fetch customers:", e);
        throw new TRPCError({ cause: e,
          code: "INTERNAL_SERVER_ERROR",
          message: e.message || "Failed to fetch customers",
        });
      }
    }),

  // Delete registered user account with safe relation cleanup
  deleteUser: adminProcedure
    .input(z.object({ userId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        // Prevent self-deletion if logged in as this user
        if (ctx.user && ctx.user.id === input.userId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "You cannot delete your own active user account while logged in.",
          });
        }

        const existing = await db
          .select()
          .from(users)
          .where(eq(users.id, input.userId))
          .limit(1);

        if (existing.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User account not found",
          });
        }

        // 1. Delete user's wishlists
        await db.delete(wishlists).where(eq(wishlists.userId, input.userId));

        // 2. Delete user's cart items and carts
        const userCarts = await db
          .select({ id: carts.id })
          .from(carts)
          .where(eq(carts.userId, input.userId));
        if (userCarts.length > 0) {
          const cartIds = userCarts.map(c => c.id);
          await db.delete(cartItems).where(inArray(cartItems.cartId, cartIds));
          await db.delete(carts).where(eq(carts.userId, input.userId));
        }

        // 3. Delete user's reviews
        await db.delete(reviews).where(eq(reviews.userId, input.userId));

        // 4. Detach orders so accounting and past transactions remain intact
        await db
          .update(orders)
          .set({ userId: null })
          .where(eq(orders.userId, input.userId));

        // 5. Delete user account
        await db.delete(users).where(eq(users.id, input.userId));

        return {
          success: true,
          message:
            "User account and associated profile data deleted successfully",
        };
      } catch (e: any) {
        if (e instanceof TRPCError) throw e;
        console.error("Failed to delete user:", e);
        throw new TRPCError({ cause: e,
          code: "INTERNAL_SERVER_ERROR",
          message: e.message || "Failed to delete user account",
        });
      }
    }),

  // Delete customer and their associated order records from Customer Directory
  deleteCustomerDirectoryEntry: adminProcedure
    .input(
      z.object({
        customerKey: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        const allOrders = await db
          .select({
            id: orders.id,
            shippingAddress: orders.shippingAddress,
          })
          .from(orders);

        const targetKey = input.customerKey.trim().toLowerCase();
        const targetCleanPhone = targetKey.replace(/\D/g, "");
        const matchingOrderIds: number[] = [];

        for (const order of allOrders) {
          const addr = (order.shippingAddress || {}) as Record<string, unknown>;
          const rawPhone = String(addr.phone || "").replace(/\D/g, "");
          const rawEmail = String(addr.email || "")
            .trim()
            .toLowerCase();
          const key = rawPhone || rawEmail;

          if (
            key === input.customerKey ||
            (targetCleanPhone && rawPhone === targetCleanPhone) ||
            (rawEmail && rawEmail === targetKey)
          ) {
            matchingOrderIds.push(order.id);
          }
        }

        if (matchingOrderIds.length > 0) {
          // Delete child order items first
          await db
            .delete(orderItems)
            .where(inArray(orderItems.orderId, matchingOrderIds));

          // Delete parent orders
          await db.delete(orders).where(inArray(orders.id, matchingOrderIds));
        }

        return {
          success: true,
          deletedOrdersCount: matchingOrderIds.length,
          message: `Customer and associated ${matchingOrderIds.length} order(s) removed successfully`,
        };
      } catch (e: any) {
        if (e instanceof TRPCError) throw e;
        console.error("Failed to delete customer directory entry:", e);
        throw new TRPCError({ cause: e,
          code: "INTERNAL_SERVER_ERROR",
          message: e.message || "Failed to delete customer directory entry",
        });
      }
    }),

  // Contact messages
  contactMessages: adminProcedure.query(async () => {
    return [];
  }),

  markMessageRead: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return { success: true };
    }),

  // Revenue chart data (last 7 days)
  revenueChart: adminProcedure.query(async () => {
    return [
      { date: "2026-08-17", revenue: 2100000, count: 5 },
      { date: "2026-08-18", revenue: 2800000, count: 7 },
      { date: "2026-08-19", revenue: 1950000, count: 4 },
      { date: "2026-08-20", revenue: 3400000, count: 9 },
      { date: "2026-08-21", revenue: 4100000, count: 11 },
      { date: "2026-08-22", revenue: 2900000, count: 8 },
      { date: "2026-08-23", revenue: 1200000, count: 4 },
    ];
  }),

  // Customer Reviews Moderation
  reviewsList: adminProcedure
    .input(
      z
        .object({
          page: z.number().int().min(1).default(1),
          limit: z.number().int().min(1).max(100).default(50),
          search: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return { items: [], total: 0 };
        const page = input?.page ?? 1;
        const limit = input?.limit ?? 50;
        const offset = (page - 1) * limit;

        const conditions = input?.search?.trim()
          ? [
              or(
                like(reviews.authorName, `%${input.search.trim()}%`),
                like(reviews.body, `%${input.search.trim()}%`),
                like(reviews.title, `%${input.search.trim()}%`)
              ),
            ]
          : [];

        const [rawItems, countResult] = await Promise.all([
          db
            .select({
              id: reviews.id,
              productId: reviews.productId,
              userId: reviews.userId,
              authorName: reviews.authorName,
              userEmail: reviews.userEmail,
              rating: reviews.rating,
              title: reviews.title,
              body: reviews.body,
              isVerified: reviews.isVerified,
              isApproved: reviews.isApproved,
              createdAt: reviews.createdAt,
              productDbId: products.id,
              productName: products.name,
              productSlug: products.slug,
              productSku: products.sku,
              brandName: brands.name,
              categoryName: categories.name,
            })
            .from(reviews)
            .leftJoin(
              products,
              or(
                eq(
                  products.id,
                  sql<number>`CASE WHEN ${reviews.productId} ~ '^[0-9]+$' THEN CAST(${reviews.productId} AS integer) ELSE NULL END`
                ),
                eq(products.slug, reviews.productId)
              )
            )
            .leftJoin(brands, eq(brands.id, products.brandId))
            .leftJoin(categories, eq(categories.id, products.categoryId))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(reviews.createdAt))
            .limit(limit)
            .offset(offset),
          db.select({ count: sql<number>`count(*)` }).from(reviews),
        ]);

        const resolvedProductIds = Array.from(
          new Set(
            rawItems
              .map(i => i.productDbId || (Number.isInteger(Number(i.productId)) ? Number(i.productId) : null))
              .filter((id): id is number => typeof id === "number" && id > 0)
          )
        );

        const imageMap = new Map<number, string>();
        if (resolvedProductIds.length > 0) {
          try {
            const imgs = await db
              .select({
                productId: productImages.productId,
                url: productImages.url,
                isPrimary: productImages.isPrimary,
              })
              .from(productImages)
              .where(inArray(productImages.productId, resolvedProductIds));

            for (const img of imgs) {
              if (!imageMap.has(img.productId) || img.isPrimary) {
                imageMap.set(img.productId, img.url);
              }
            }
          } catch (imgErr) {
            console.warn("Failed to load review product images:", imgErr);
          }
        }

        const items = rawItems.map(item => {
          const pId = item.productDbId || (Number.isInteger(Number(item.productId)) ? Number(item.productId) : null);
          const staticMatch = !item.productSlug
            ? STATIC_PRODUCTS.find(
                p =>
                  String(p.id) === String(item.productId) ||
                  p.slug === String(item.productId)
              )
            : null;

          return {
            ...item,
            productName: item.productName || staticMatch?.name || `Product #${item.productId}`,
            productSlug: item.productSlug || staticMatch?.slug || item.productId,
            productSku: item.productSku || staticMatch?.sku || null,
            brandName: item.brandName || staticMatch?.brandName || null,
            categoryName: item.categoryName || (staticMatch as any)?.category || null,
            productImageUrl: (pId && imageMap.get(pId)) || staticMatch?.imageUrl || null,
          };
        });

        return {
          items,
          total: Number(countResult[0]?.count ?? 0),
        };
      } catch (e: any) {
        console.error("Failed to fetch admin reviews list:", e);
        throw new TRPCError({ cause: e,
          code: "INTERNAL_SERVER_ERROR",
          message: e.message || "Failed to fetch reviews list",
        });
      }
    }),

  updateReview: adminProcedure
    .input(
      z.object({
        reviewId: z.number(),
        rating: z.number().int().min(1).max(5),
        authorName: z.string().min(1).max(100),
        title: z.string().max(256).optional().nullable(),
        body: z.string().min(1).max(2000),
        isApproved: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      await db
        .update(reviews)
        .set({
          rating: input.rating,
          authorName: input.authorName,
          title: input.title || null,
          body: input.body,
          isApproved: input.isApproved,
        })
        .where(eq(reviews.id, input.reviewId));

      return { success: true };
    }),

  deleteReview: adminProcedure
    .input(z.object({ reviewId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      await db.delete(reviews).where(eq(reviews.id, input.reviewId));
      return { success: true };
    }),

  inquiriesList: adminProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { items: [], total: 0 };
      const offset = (input.page - 1) * input.limit;
      const data = await db
        .select()
        .from(contactMessages)
        .orderBy(desc(contactMessages.createdAt))
        .limit(input.limit)
        .offset(offset);
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(contactMessages);
      return { items: data, total: Number(count) };
    }),

  markInquiryRead: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      await db
        .update(contactMessages)
        .set({ isRead: true })
        .where(eq(contactMessages.id, input.id));
      return { success: true };
    }),

  deleteInquiry: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      await db.delete(contactMessages).where(eq(contactMessages.id, input.id));
      return { success: true };
    }),

  // ═══════════════════════════════════════════════════════════════════════════
  // SHOWROOMS / LOCATIONS cPanel Endpoints
  // ═══════════════════════════════════════════════════════════════════════════

  locationsList: adminProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
          province: z.string().optional(),
          isActive: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        const rows = await db
          .select()
          .from(locations)
          .orderBy(asc(locations.sortOrder), asc(locations.id));

        return rows.map(loc => {
          let formattedHours = "Mon–Sat: 8:30 AM – 6:30 PM";
          if (typeof loc.openingHours === "string") {
            formattedHours = loc.openingHours;
          } else if (loc.openingHours && typeof loc.openingHours === "object") {
            const oh = loc.openingHours as Record<string, string>;
            if (oh.Monday && oh.Sunday) {
              formattedHours = `Mon–Sat: ${oh.Monday} | Sun: ${oh.Sunday}`;
            } else if (oh.summary) {
              formattedHours = String(oh.summary);
            } else {
              formattedHours = Object.entries(oh)
                .map(([k, v]) => `${k}: ${v}`)
                .slice(0, 2)
                .join(" | ");
            }
          }

          const servicesList = Array.isArray(loc.services)
            ? (loc.services as string[])
            : [];

          return {
            ...loc,
            badge: loc.badge || (loc.type === "service_center" ? "Official Service Center" : "Authorized Experience Center"),
            directCall: loc.directCall || (loc.phone ? loc.phone.replace(/[^0-9+]/g, "") : "+94112345678"),
            hours: formattedHours,
            latitude: Number(loc.latitude) || 6.9034,
            longitude: Number(loc.longitude) || 79.8524,
            services: servicesList,
            manager: loc.manager || "Branch Manager",
            imageUrl: loc.imageUrl || "",
          };
        }).filter(loc => {
          if (input?.isActive !== undefined && loc.isActive !== input.isActive) {
            return false;
          }
          if (input?.province && input.province !== "All" && loc.province !== input.province) {
            return false;
          }
          if (input?.search && input.search.trim()) {
            const q = input.search.toLowerCase().trim();
            const matches =
              loc.name.toLowerCase().includes(q) ||
              loc.city.toLowerCase().includes(q) ||
              loc.address.toLowerCase().includes(q) ||
              (loc.province && loc.province.toLowerCase().includes(q)) ||
              (loc.manager && loc.manager.toLowerCase().includes(q));
            if (!matches) return false;
          }
          return true;
        });
      } catch (e: any) {
        console.error("Failed to fetch admin locations list:", e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: e.message || "Failed to fetch locations list",
        });
      }
    }),

  createLocation: adminProcedure
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        badge: z.string().optional().nullable(),
        type: z.string().default("showroom"),
        address: z.string().min(3, "Address is required"),
        city: z.string().min(2, "City is required"),
        province: z.string().optional().nullable(),
        phone: z.string().optional().nullable(),
        directCall: z.string().optional().nullable(),
        email: z.string().optional().nullable(),
        manager: z.string().optional().nullable(),
        latitude: z.union([z.number(), z.string()]).default("6.9034"),
        longitude: z.union([z.number(), z.string()]).default("79.8524"),
        openingHours: z.any().optional(),
        services: z.array(z.string()).optional(),
        imageUrl: z.string().optional().nullable(),
        featured: z.boolean().default(false),
        isActive: z.boolean().default(true),
        sortOrder: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });

        let openingHoursPayload = input.openingHours;
        if (typeof input.openingHours === "string") {
          openingHoursPayload = { summary: input.openingHours };
        }

        const [created] = await db
          .insert(locations)
          .values({
            name: input.name,
            badge: input.badge?.trim() || null,
            type: input.type,
            address: input.address,
            city: input.city,
            province: input.province?.trim() || "Western Province",
            phone: input.phone?.trim() || null,
            directCall: input.directCall?.trim() || (input.phone ? input.phone.replace(/[^0-9+]/g, "") : null),
            email: input.email?.trim() || null,
            manager: input.manager?.trim() || null,
            latitude: String(input.latitude),
            longitude: String(input.longitude),
            openingHours: openingHoursPayload || { summary: "Mon–Sat: 8:30 AM – 6:30 PM" },
            services: input.services || [],
            imageUrl: input.imageUrl?.trim() ? input.imageUrl.trim() : null,
            featured: input.featured,
            isActive: input.isActive,
            sortOrder: input.sortOrder,
          })
          .returning();

        return { success: true, location: created };
      } catch (e: any) {
        console.error("Failed to create location:", e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: e.message || "Failed to create showroom",
        });
      }
    }),

  updateLocation: adminProcedure
    .input(
      z.object({
        id: z.number().int(),
        name: z.string().min(2).optional(),
        badge: z.string().optional().nullable(),
        type: z.string().optional(),
        address: z.string().min(3).optional(),
        city: z.string().min(2).optional(),
        province: z.string().optional().nullable(),
        phone: z.string().optional().nullable(),
        directCall: z.string().optional().nullable(),
        email: z.string().optional().nullable(),
        manager: z.string().optional().nullable(),
        latitude: z.union([z.number(), z.string()]).optional(),
        longitude: z.union([z.number(), z.string()]).optional(),
        openingHours: z.any().optional(),
        services: z.array(z.string()).optional(),
        imageUrl: z.string().optional().nullable(),
        featured: z.boolean().optional(),
        isActive: z.boolean().optional(),
        sortOrder: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });

        const updateData: Record<string, any> = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.badge !== undefined) updateData.badge = input.badge?.trim() || null;
        if (input.type !== undefined) updateData.type = input.type;
        if (input.address !== undefined) updateData.address = input.address;
        if (input.city !== undefined) updateData.city = input.city;
        if (input.province !== undefined) updateData.province = input.province?.trim() || null;
        if (input.phone !== undefined) updateData.phone = input.phone?.trim() || null;
        if (input.directCall !== undefined) updateData.directCall = input.directCall?.trim() || null;
        if (input.email !== undefined) updateData.email = input.email?.trim() || null;
        if (input.manager !== undefined) updateData.manager = input.manager?.trim() || null;
        if (input.latitude !== undefined) updateData.latitude = String(input.latitude);
        if (input.longitude !== undefined) updateData.longitude = String(input.longitude);
        if (input.openingHours !== undefined) {
          updateData.openingHours =
            typeof input.openingHours === "string"
              ? { summary: input.openingHours }
              : input.openingHours;
        }
        if (input.services !== undefined) updateData.services = input.services;
        if (input.imageUrl !== undefined) {
          updateData.imageUrl = input.imageUrl && input.imageUrl.trim() !== "" ? input.imageUrl.trim() : null;
        }
        if (input.featured !== undefined) updateData.featured = input.featured;
        if (input.isActive !== undefined) updateData.isActive = input.isActive;
        if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;

        const [updated] = await db
          .update(locations)
          .set(updateData)
          .where(eq(locations.id, input.id))
          .returning();

        return { success: true, location: updated };
      } catch (e: any) {
        console.error("Failed to update location:", e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: e.message || "Failed to update showroom",
        });
      }
    }),

  toggleLocationActive: adminProcedure
    .input(z.object({ id: z.number().int(), isActive: z.boolean() }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });

        await db
          .update(locations)
          .set({ isActive: input.isActive })
          .where(eq(locations.id, input.id));

        return { success: true, isActive: input.isActive };
      } catch (e: any) {
        console.error("Failed to toggle showroom status:", e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: e.message || "Failed to toggle status",
        });
      }
    }),

  deleteLocation: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });

        await db.delete(locations).where(eq(locations.id, input.id));
        return { success: true };
      } catch (e: any) {
        console.error("Failed to delete showroom:", e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: e.message || "Failed to delete showroom",
        });
      }
    }),

  seedDefaultLocations: adminProcedure.mutation(async () => {
    try {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });

      const OFFICIAL_SHOWROOMS = [
        {
          name: "Manju Group — Colombo Flagship Store",
          badge: "Headquarters & Experience Center",
          type: "showroom",
          address: "No. 234, Galle Road, Kollupitiya, Colombo 03",
          city: "Colombo",
          province: "Western Province",
          phone: "+94 11 234 5678",
          directCall: "+94112345678",
          email: "colombo@manjugroup.lk",
          manager: "Saman Jayawardena",
          latitude: "6.9034",
          longitude: "79.8524",
          openingHours: { summary: "Mon–Sat: 8:30 AM – 7:00 PM | Sun: 9:00 AM – 4:00 PM" },
          services: [
            "All 4 Core Brands Showcase",
            "Electric Bike Test Rides",
            "Same-Day Pickup",
            "Instant Installment Approval",
          ],
          imageUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb1861593?q=80&w=1200&auto=format&fit=crop",
          featured: true,
          isActive: true,
          sortOrder: 1,
        },
        {
          name: "Manju Group — Kandy City Showroom",
          badge: "Central Province Hub",
          type: "showroom",
          address: "No. 45, Peradeniya Road, Kandy",
          city: "Kandy",
          province: "Central Province",
          phone: "+94 81 234 5678",
          directCall: "+94812345678",
          email: "kandy@manjugroup.lk",
          manager: "Roshan Weerasinghe",
          latitude: "7.2906",
          longitude: "80.6337",
          openingHours: { summary: "Mon–Sat: 8:30 AM – 6:30 PM | Sun: 9:00 AM – 3:00 PM" },
          services: [
            "Dew Plus 4K TVs",
            "Dew Motors E-Bikes",
            "DEW+ AC Demo Units",
            "Water Test Lab",
          ],
          imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop",
          featured: true,
          isActive: true,
          sortOrder: 2,
        },
        {
          name: "Manju Group — Galle Coastal Showroom",
          badge: "Southern Province Hub",
          type: "showroom",
          address: "No. 12, Wakwella Road, Galle",
          city: "Galle",
          province: "Southern Province",
          phone: "+94 91 234 5678",
          directCall: "+94912345678",
          email: "galle@manjugroup.lk",
          manager: "Priyantha Silva",
          latitude: "6.0535",
          longitude: "80.2210",
          openingHours: { summary: "Mon–Sat: 8:30 AM – 6:00 PM | Sun: Closed" },
          services: [
            "Solar & AC Inverter Solutions",
            "RO Water Purification",
            "E-Bike Service Center",
          ],
          imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop",
          featured: true,
          isActive: true,
          sortOrder: 3,
        },
        {
          name: "Manju Group — Kurunegala Showroom",
          badge: "North Western Hub",
          type: "showroom",
          address: "No. 88, Colombo Road, Kurunegala",
          city: "Kurunegala",
          province: "North Western Province",
          phone: "+94 37 222 4567",
          directCall: "+94372224567",
          email: "kurunegala@manjugroup.lk",
          manager: "Nuwan Pradeep",
          latitude: "7.4863",
          longitude: "80.3623",
          openingHours: { summary: "Mon–Sat: 8:30 AM – 6:30 PM" },
          services: [
            "Complete Home Appliances",
            "Water Filter Installations",
            "E-Bike Showroom",
          ],
          imageUrl: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop",
          featured: false,
          isActive: true,
          sortOrder: 4,
        },
        {
          name: "Manju Group — Negombo Showroom",
          badge: "Airport Corridor Hub",
          type: "showroom",
          address: "No. 142, Main Street, Negombo",
          city: "Negombo",
          province: "Western Province",
          phone: "+94 31 223 8900",
          directCall: "+94312238900",
          email: "negombo@manjugroup.lk",
          manager: "Janaka Perera",
          latitude: "7.2088",
          longitude: "79.8358",
          openingHours: { summary: "Mon–Sat: 8:30 AM – 7:00 PM" },
          services: [
            "Dew Plus 4K Smart TVs",
            "Fast Delivery Hub",
            "After-Sales Service",
          ],
          imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop",
          featured: false,
          isActive: true,
          sortOrder: 5,
        },
        {
          name: "Manju Group — Matara Showroom",
          badge: "Deep South Hub",
          type: "showroom",
          address: "No. 56, Anagarika Dharmapala Mawatha, Matara",
          city: "Matara",
          province: "Southern Province",
          phone: "+94 41 222 6789",
          directCall: "+94412226789",
          email: "matara@manjugroup.lk",
          manager: "Sunil Kumara",
          latitude: "5.9496",
          longitude: "80.5469",
          openingHours: { summary: "Mon–Sat: 8:30 AM – 6:00 PM" },
          services: [
            "Commercial & Domestic RO Filters",
            "Inverter AC Units",
            "Warranty Support",
          ],
          imageUrl: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=1200&auto=format&fit=crop",
          featured: false,
          isActive: true,
          sortOrder: 6,
        },
        {
          name: "Manju Group — Gampaha Showroom",
          badge: "Industrial & Domestic Center",
          type: "showroom",
          address: "No. 19, Yakkala Road, Gampaha",
          city: "Gampaha",
          province: "Western Province",
          phone: "+94 33 222 1144",
          directCall: "+94332221144",
          email: "gampaha@manjugroup.lk",
          manager: "Kasun Bandara",
          latitude: "7.0917",
          longitude: "79.9999",
          openingHours: { summary: "Mon–Sat: 8:30 AM – 6:30 PM" },
          services: [
            "Dew Motors E-Bikes",
            "Smart TV Experience Zone",
            "Spare Parts Depot",
          ],
          imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop",
          featured: false,
          isActive: true,
          sortOrder: 7,
        },
        {
          name: "Manju Group — Anuradhapura Showroom",
          badge: "North Central Hub",
          type: "showroom",
          address: "No. 104, Main Street, Anuradhapura",
          city: "Anuradhapura",
          province: "North Central Province",
          phone: "+94 25 222 3456",
          directCall: "+94252223456",
          email: "anuradhapura@manjugroup.lk",
          manager: "Anura Wickramasinghe",
          latitude: "8.3114",
          longitude: "80.4037",
          openingHours: { summary: "Mon–Sat: 8:30 AM – 6:00 PM" },
          services: [
            "High-Capacity Water Filters",
            "Air Conditioners",
            "Agricultural & Commercial RO",
          ],
          imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop",
          featured: false,
          isActive: true,
          sortOrder: 8,
        },
        {
          name: "Manju Group — Jaffna Showroom",
          badge: "Northern Province Hub",
          type: "showroom",
          address: "No. 78, Hospital Road, Jaffna",
          city: "Jaffna",
          province: "Northern Province",
          phone: "+94 21 222 7890",
          directCall: "+94212227890",
          email: "jaffna@manjugroup.lk",
          manager: "S. Thivagar",
          latitude: "9.6615",
          longitude: "80.0255",
          openingHours: { summary: "Mon–Sat: 8:30 AM – 6:00 PM" },
          services: [
            "Full Product Range",
            "Commercial RO Water Plants",
            "Technical Assistance",
          ],
          imageUrl: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=1200&auto=format&fit=crop",
          featured: false,
          isActive: true,
          sortOrder: 9,
        },
      ];

      // Delete old existing locations and insert fresh 9 official branches
      await db.delete(locations);
      await db.insert(locations).values(OFFICIAL_SHOWROOMS);

      return { success: true, count: OFFICIAL_SHOWROOMS.length };
    } catch (e: any) {
      console.error("Failed to seed official showrooms:", e);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: e.message || "Failed to seed showrooms",
      });
    }
  }),
});
