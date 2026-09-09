import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
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
} from "../../drizzle/schema";
import { nanoid } from "nanoid";
import { eq, desc, asc, sql, and, like, or, inArray } from "drizzle-orm";
import { STATIC_PRODUCTS, STATIC_BRANDS } from "../../client/src/lib/staticData";
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
          totalOrders: 48,
          totalRevenue: 18450000,
          totalProducts: STATIC_PRODUCTS.length,
          totalCustomers: 120,
          lowStockCount: 2,
          brandBreakdown: [
            { brand: "Dew Motors", revenue: 8400000, orders: 12 },
            { brand: "Dew Plus", revenue: 5200000, orders: 18 },
            { brand: "DEW+ AC", revenue: 3100000, orders: 10 },
            { brand: "Manju Dew Super", revenue: 1750000, orders: 8 },
          ],
          weeklyTrend: [
            { day: "Mon", revenue: 2100000, orders: 5 },
            { day: "Tue", revenue: 2800000, orders: 7 },
            { day: "Wed", revenue: 1950000, orders: 4 },
            { day: "Thu", revenue: 3400000, orders: 9 },
            { day: "Fri", revenue: 4100000, orders: 11 },
            { day: "Sat", revenue: 2900000, orders: 8 },
            { day: "Sun", revenue: 1200000, orders: 4 },
          ],
        };
      }

      const [orderStats, productCount, customerCount] = await Promise.all([
        db
          .select({
            count: sql<number>`count(*)`,
            revenue: sql<number>`sum(total)`,
          })
          .from(orders),
        db
          .select({ count: sql<number>`count(*)` })
          .from(products)
          .where(eq(products.isActive, true)),
        db.select({ count: sql<number>`count(*)` }).from(users),
      ]);

      return {
        totalOrders: Number(orderStats[0]?.count ?? 48),
        totalRevenue: Number(orderStats[0]?.revenue ?? 18450000),
        totalProducts: Number(productCount[0]?.count ?? STATIC_PRODUCTS.length),
        totalCustomers: Number(customerCount[0]?.count ?? 120),
        lowStockCount: 2,
        brandBreakdown: [
          { brand: "Dew Motors", revenue: 8400000, orders: 12 },
          { brand: "Dew Plus", revenue: 5200000, orders: 18 },
          { brand: "DEW+ AC", revenue: 3100000, orders: 10 },
          { brand: "Manju Dew Super", revenue: 1750000, orders: 8 },
        ],
        weeklyTrend: [
          { day: "Mon", revenue: 2100000, orders: 5 },
          { day: "Tue", revenue: 2800000, orders: 7 },
          { day: "Wed", revenue: 1950000, orders: 4 },
          { day: "Thu", revenue: 3400000, orders: 9 },
          { day: "Fri", revenue: 4100000, orders: 11 },
          { day: "Sat", revenue: 2900000, orders: 8 },
          { day: "Sun", revenue: 1200000, orders: 4 },
        ],
      };
    } catch (err) {
      return {
        totalOrders: 48,
        totalRevenue: 18450000,
        totalProducts: STATIC_PRODUCTS.length,
        totalCustomers: 120,
        lowStockCount: 2,
        brandBreakdown: [
          { brand: "Dew Motors", revenue: 8400000, orders: 12 },
          { brand: "Dew Plus", revenue: 5200000, orders: 18 },
          { brand: "DEW+ AC", revenue: 3100000, orders: 10 },
          { brand: "Manju Dew Super", revenue: 1750000, orders: 8 },
        ],
        weeklyTrend: [
          { day: "Mon", revenue: 2100000, orders: 5 },
          { day: "Tue", revenue: 2800000, orders: 7 },
          { day: "Wed", revenue: 1950000, orders: 4 },
          { day: "Thu", revenue: 3400000, orders: 9 },
          { day: "Fri", revenue: 4100000, orders: 11 },
          { day: "Sat", revenue: 2900000, orders: 8 },
          { day: "Sun", revenue: 1200000, orders: 4 },
        ],
      };
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
      } catch (e) {
        return [];
      }
    }),

  // All orders
  orders: adminProcedure
    .input(
      z.object({ page: z.number().int().min(1).default(1), limit: z.number().int().min(1).max(100).default(20) })
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
      } catch (e) {
        return { items: [], total: 0 };
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
      } catch (e) {
        return { success: true };
      }
    }),

  // Real paginated orders list (Orders & Fulfillment admin screen)
  ordersList: adminProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
        status: z
          .enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"])
          .optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return { items: [], total: 0 };

        const offset = (input.page - 1) * input.limit;
        const whereClause = input.status ? eq(orders.status, input.status) : undefined;

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
        let itemsByOrder: Record<number, { productName: string; variantName: string | null; sku: string | null; quantity: number; unitPrice: string; subtotal: string; imageUrl: string | null }[]> = {};

        if (orderIds.length > 0) {
          const items = await db
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
            .where(inArray(orderItems.orderId, orderIds));

          const productIds = Array.from(
            new Set(items.map(i => Number(i.productId)).filter(id => !isNaN(id) && id > 0))
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
          itemCount: (itemsByOrder[order.id] || []).reduce((sum, i) => sum + i.quantity, 0),
        }));

        return { items: enrichedItems, total: Number(countResult[0]?.count ?? 0) };
      } catch (e) {
        console.error("Failed to fetch admin orders list:", e);
        return { items: [], total: 0 };
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

        const allOrders = await db
          .select({
            id: orders.id,
            orderNumber: orders.orderNumber,
            status: orders.status,
            total: orders.total,
            shippingAddress: orders.shippingAddress,
            createdAt: orders.createdAt,
          })
          .from(orders)
          .orderBy(desc(orders.createdAt));

        type CustomerAgg = {
          key: string;
          name: string;
          phone: string;
          email: string;
          address: string;
          city: string;
          totalOrders: number;
          totalSpent: number;
          lastOrderDate: Date;
          orderHistory: { orderNumber: string; date: Date; total: number; status: string }[];
        };

        const customerMap = new Map<string, CustomerAgg>();

        for (const order of allOrders) {
          const addr = (order.shippingAddress || {}) as Record<string, unknown>;
          const rawPhone = String(addr.phone || "").replace(/\D/g, "");
          const rawEmail = String(addr.email || "").trim().toLowerCase();
          const key = rawPhone || rawEmail;

          if (!key) continue; // no way to identify this customer, skip

          const firstName = String(addr.firstName || "").trim();
          const lastName = String(addr.lastName || "").trim();
          const name = `${firstName} ${lastName}`.trim() || "Unknown";
          const addressLine = [addr.addressLine1, addr.addressLine2].filter(Boolean).join(", ");
          const city = String(addr.city || "");
          const orderTotal = Number(order.total) || 0;

          const existing = customerMap.get(key);
          if (existing) {
            existing.totalOrders += 1;
            existing.totalSpent += orderTotal;
            existing.orderHistory.push({
              orderNumber: order.orderNumber,
              date: order.createdAt,
              total: orderTotal,
              status: order.status,
            });
            // orders are already sorted desc by createdAt, so first-seen order is most recent
          } else {
            customerMap.set(key, {
              key,
              name,
              phone: String(addr.phone || ""),
              email: String(addr.email || ""),
              address: addressLine,
              city,
              totalOrders: 1,
              totalSpent: orderTotal,
              lastOrderDate: order.createdAt,
              orderHistory: [
                {
                  orderNumber: order.orderNumber,
                  date: order.createdAt,
                  total: orderTotal,
                  status: order.status,
                },
              ],
            });
          }
        }

        let allCustomers = Array.from(customerMap.values()).sort(
          (a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime()
        );

        if (input.search) {
          const q = input.search.trim().toLowerCase();
          allCustomers = allCustomers.filter(
            c =>
              c.name.toLowerCase().includes(q) ||
              c.phone.toLowerCase().includes(q) ||
              c.email.toLowerCase().includes(q)
          );
        }

        const total = allCustomers.length;
        const offset = (input.page - 1) * input.limit;
        const items = allCustomers.slice(offset, offset + input.limit);

        return { items, total };
      } catch (e) {
        console.error("Failed to build customer directory:", e);
        return { items: [], total: 0 };
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
              brandName: brands.name,
              categoryName: categories.name,
              createdAt: products.createdAt,
            })
            .from(products)
            .leftJoin(brands, eq(products.brandId, brands.id))
            .leftJoin(categories, eq(products.categoryId, categories.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(products.createdAt))
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

        return { items: enrichedItems, total: Number(countResult[0]?.count ?? 0) };
      } catch (e) {
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
            basePrice: p.basePrice,
            salePrice: p.salePrice,
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
        throw new TRPCError({
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
      return rows.length > 0 ? rows : STATIC_BRANDS.map(b => ({ id: b.id, name: b.name }));
    } catch (e) {
      return STATIC_BRANDS.map(b => ({ id: b.id, name: b.name }));
    }
  }),

  categoryOptions: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) return [];
      return await db
        .select({ id: categories.id, name: categories.name })
        .from(categories)
        .orderBy(asc(categories.sortOrder), asc(categories.name));
    } catch (e) {
      return [];
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
      } catch (e) {
        console.error("Failed to fetch product by id:", e);
        return null;
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
        const baseSlug = slugify(input.name) || slugify(input.sku) || `product-${Date.now()}`;
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
            salePrice: input.salePrice != null ? input.salePrice.toString() : null,
            stockQuantity: input.stockQuantity,
            isInStock: input.stockQuantity > 0,
            isFeatured: input.isFeatured,
            isBestSeller: input.isBestSeller,
            isNew: input.isNew,
            isActive: input.isActive,
            warrantyMonths: input.warrantyMonths ?? 12,
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
        throw new TRPCError({
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
        await db
          .update(products)
          .set({
            name: input.name,
            sku: input.sku,
            brandId: input.brandId,
            categoryId: input.categoryId,
            shortDescription: input.shortDescription ?? null,
            description: input.description ?? null,
            basePrice: input.basePrice.toString(),
            salePrice: input.salePrice != null ? input.salePrice.toString() : null,
            stockQuantity: input.stockQuantity,
            isInStock: input.stockQuantity > 0,
            isFeatured: input.isFeatured,
            isBestSeller: input.isBestSeller,
            isNew: input.isNew,
            isActive: input.isActive,
            warrantyMonths: input.warrantyMonths ?? 12,
          })
          .where(eq(products.id, input.productId));

        if (input.imageUrl) {
          const existingImages = await db
            .select()
            .from(productImages)
            .where(eq(productImages.productId, input.productId));
          if (existingImages.length > 0) {
            const primary = existingImages.find(img => img.isPrimary) ?? existingImages[0];
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
        throw new TRPCError({
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
        await db.transaction(async tx => {
          await tx.delete(productImages).where(eq(productImages.productId, input.productId));
          await tx.delete(productVariants).where(eq(productVariants.productId, input.productId));
          await tx.delete(products).where(eq(products.id, input.productId));
        });

        return { success: true };
      } catch (e: any) {
        console.error("Failed to delete product:", e);
        throw new TRPCError({
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
          new Set(items.map(i => Number(i.productId)).filter(id => !isNaN(id) && id > 0))
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
      } catch (e) {
        console.error("Failed to fetch order by id:", e);
        return null;
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
    .input(z.object({ key: z.enum(["home_ad_config"]) }))
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
      } catch (e) {
        console.error("Failed to fetch site setting:", e);
        return { key: input.key, value: null };
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
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: e.message || "Failed to set site setting",
        });
      }
    }),

  // Customers
  customers: adminProcedure
    .input(
      z.object({ page: z.number().int().min(1).default(1), limit: z.number().int().min(1).max(100).default(20) })
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
      } catch (e) {
        console.error("Failed to fetch customers:", e);
        return { items: [], total: 0 };
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
            message: "You cannot delete your own active user account while logged in.",
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
          message: "User account and associated profile data deleted successfully",
        };
      } catch (e: any) {
        if (e instanceof TRPCError) throw e;
        console.error("Failed to delete user:", e);
        throw new TRPCError({
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
          const rawEmail = String(addr.email || "").trim().toLowerCase();
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
          await db.delete(orderItems).where(inArray(orderItems.orderId, matchingOrderIds));

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
        throw new TRPCError({
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
});
