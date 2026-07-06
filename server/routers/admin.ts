import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  products, productImages, brands, categories, orders, orderItems,
  users, contactMessages, blogPosts
} from "../../drizzle/schema";
import { nanoid } from "nanoid";
import { eq, desc, asc, sql, and, like, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const adminRouter = router({
  // Dashboard stats
  stats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { totalOrders: 0, totalRevenue: 0, totalProducts: 0, totalCustomers: 0 };

    const [orderStats, productCount, customerCount] = await Promise.all([
      db.select({
        count: sql<number>`count(*)`,
        revenue: sql<number>`sum(total)`,
      }).from(orders),
      db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.isActive, true)),
      db.select({ count: sql<number>`count(*)` }).from(users),
    ]);

    return {
      totalOrders: Number(orderStats[0]?.count ?? 0),
      totalRevenue: Number(orderStats[0]?.revenue ?? 0),
      totalProducts: Number(productCount[0]?.count ?? 0),
      totalCustomers: Number(customerCount[0]?.count ?? 0),
    };
  }),

  // Recent orders
  recentOrders: adminProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(orders).orderBy(desc(orders.createdAt)).limit(input.limit);
    }),

  // All orders
  orders: adminProcedure
    .input(z.object({ page: z.number().default(1), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { items: [], total: 0 };
      const offset = (input.page - 1) * input.limit;
      const [items, countResult] = await Promise.all([
        db.select().from(orders).orderBy(desc(orders.createdAt)).limit(input.limit).offset(offset),
        db.select({ count: sql<number>`count(*)` }).from(orders),
      ]);
      return { items, total: Number(countResult[0]?.count ?? 0) };
    }),

  // Update order status
  updateOrderStatus: adminProcedure
    .input(z.object({
      orderId: z.number(),
      status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.update(orders).set({ status: input.status }).where(eq(orders.id, input.orderId));
      return { success: true };
    }),

  // Products management
  products: adminProcedure
    .input(z.object({ page: z.number().default(1), limit: z.number().default(20), search: z.string().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { items: [], total: 0 };
      const offset = (input.page - 1) * input.limit;
      const conditions = input.search
        ? [or(like(products.name, `%${input.search}%`), like(products.sku, `%${input.search}%`))]
        : [];

      const [items, countResult] = await Promise.all([
        db.select({
          id: products.id,
          slug: products.slug,
          sku: products.sku,
          name: products.name,
          basePrice: products.basePrice,
          salePrice: products.salePrice,
          stockQuantity: products.stockQuantity,
          isInStock: products.isInStock,
          isFeatured: products.isFeatured,
          isBestSeller: products.isBestSeller,
          isActive: products.isActive,
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
      return { items, total: Number(countResult[0]?.count ?? 0) };
    }),

  // Toggle product active
  toggleProductActive: adminProcedure
    .input(z.object({ productId: z.number(), isActive: z.boolean() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.update(products).set({ isActive: input.isActive }).where(eq(products.id, input.productId));
      return { success: true };
    }),

  // Brand/category lookups for product form dropdowns
  brandOptions: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select({ id: brands.id, name: brands.name }).from(brands).orderBy(asc(brands.name));
  }),

  categoryOptions: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.name));
  }),

  productById: adminProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [product] = await db.select().from(products).where(eq(products.id, input.productId)).limit(1);
      return product ?? null;
    }),

  createProduct: adminProcedure
    .input(z.object({
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
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const baseSlug = input.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const slug = `${baseSlug}-${nanoid(6)}`;
      await db.insert(products).values({
        slug,
        sku: input.sku,
        name: input.name,
        shortDescription: input.shortDescription,
        description: input.description,
        brandId: input.brandId,
        categoryId: input.categoryId,
        basePrice: String(input.basePrice),
        salePrice: input.salePrice != null ? String(input.salePrice) : null,
        stockQuantity: input.stockQuantity,
        isInStock: input.stockQuantity > 0,
        isFeatured: input.isFeatured,
        isBestSeller: input.isBestSeller,
        isNew: input.isNew,
        isActive: input.isActive,
      });
      return { success: true, slug };
    }),

  updateProduct: adminProcedure
    .input(z.object({
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
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.update(products).set({
        name: input.name,
        sku: input.sku,
        brandId: input.brandId,
        categoryId: input.categoryId,
        shortDescription: input.shortDescription,
        description: input.description,
        basePrice: String(input.basePrice),
        salePrice: input.salePrice != null ? String(input.salePrice) : null,
        stockQuantity: input.stockQuantity,
        isInStock: input.stockQuantity > 0,
        isFeatured: input.isFeatured,
        isBestSeller: input.isBestSeller,
        isNew: input.isNew,
        isActive: input.isActive,
      }).where(eq(products.id, input.productId));
      return { success: true };
    }),

  deleteProduct: adminProcedure
    .input(z.object({ productId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.delete(products).where(eq(products.id, input.productId));
      return { success: true };
    }),

  // Order detail (admin-scoped, no ownership check)
  orderById: adminProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [order] = await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
      if (!order) return null;

      const [items, customer] = await Promise.all([
        db.select().from(orderItems).where(eq(orderItems.orderId, order.id)),
        order.userId
          ? db.select({ id: users.id, name: users.name, email: users.email, phone: users.phone })
              .from(users).where(eq(users.id, order.userId)).limit(1)
          : Promise.resolve([]),
      ]);

      return { ...order, items, customer: customer[0] ?? null };
    }),

  // Customers
  customers: adminProcedure
    .input(z.object({ page: z.number().default(1), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { items: [], total: 0 };
      const offset = (input.page - 1) * input.limit;
      const [items, countResult] = await Promise.all([
        db.select().from(users).orderBy(desc(users.createdAt)).limit(input.limit).offset(offset),
        db.select({ count: sql<number>`count(*)` }).from(users),
      ]);
      return { items, total: Number(countResult[0]?.count ?? 0) };
    }),

  // Contact messages
  contactMessages: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(50);
  }),

  markMessageRead: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.update(contactMessages).set({ isRead: true }).where(eq(contactMessages.id, input.id));
      return { success: true };
    }),

  // Revenue chart data (last 7 days)
  revenueChart: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db.select({
      date: sql<string>`DATE(createdAt)`,
      revenue: sql<number>`sum(total)`,
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .groupBy(sql`DATE(createdAt)`)
    .orderBy(sql`DATE(createdAt) DESC`)
    .limit(7);
    return rows.reverse();
  }),
});
