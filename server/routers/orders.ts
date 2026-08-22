import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { orders, orderItems, productImages } from "../../drizzle/schema";
import { eq, desc, inArray, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

// Mock store fallback if DB is offline
const MOCK_ORDERS: any[] = [];
let mockOrderIdCounter = 1;

export const ordersRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          email: z.string().optional(),
          phone: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user?.id;
      const email = input?.email || ctx.user?.email;

      if (!userId && !email) {
        return [];
      }

      if (!db) {
        return MOCK_ORDERS.filter(o =>
          userId ? o.userId === userId : o.shippingAddress?.email === email
        ).sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      let userOrders: any[] = [];
      if (userId && email) {
        userOrders = await db
          .select()
          .from(orders)
          .where(
            sql`${orders.userId} = ${userId} OR JSON_UNQUOTE(JSON_EXTRACT(${orders.shippingAddress}, '$.email')) = ${email}`
          )
          .orderBy(desc(orders.createdAt));
      } else if (userId) {
        userOrders = await db
          .select()
          .from(orders)
          .where(eq(orders.userId, userId))
          .orderBy(desc(orders.createdAt));
      } else if (email) {
        userOrders = await db
          .select()
          .from(orders)
          .where(
            sql`JSON_UNQUOTE(JSON_EXTRACT(${orders.shippingAddress}, '$.email')) = ${email}`
          )
          .orderBy(desc(orders.createdAt));
      }

      if (userOrders.length === 0) {
        return [];
      }

      // Fetch items for all user orders
      const orderIds = userOrders.map(o => o.id);
      const items = await db
        .select()
        .from(orderItems)
        .where(inArray(orderItems.orderId, orderIds));

      // Fetch images for product thumbnails
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

      return userOrders.map(order => {
        const orderItemsList = items
          .filter(item => item.orderId === order.id)
          .map(item => ({
            ...item,
            imageUrl: imageMap[Number(item.productId)] || null,
          }));

        return {
          ...order,
          totalAmount: order.total,
          items: orderItemsList,
        };
      });
    }),

  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        const mock = MOCK_ORDERS.find(o => o.id === input.id);
        return mock || null;
      }

      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.id))
        .limit(1);

      if (!order) return null;

      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      return {
        ...order,
        totalAmount: order.total,
        items,
      };
    }),

  track: publicProcedure
    .input(
      z.object({
        orderNumber: z.string(),
        emailOrPhone: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      const cleanNum = input.orderNumber.trim().toUpperCase();

      if (!db) {
        const found = MOCK_ORDERS.find(
          o => o.orderNumber.toUpperCase() === cleanNum
        );
        return found || null;
      }

      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.orderNumber, cleanNum))
        .limit(1);

      if (!order) return null;

      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      return {
        ...order,
        totalAmount: order.total,
        items,
      };
    }),

  create: publicProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.union([z.string(), z.number()]),
            variantId: z.union([z.string(), z.number()]).optional().nullable(),
            productName: z.string(),
            variantName: z.string().optional(),
            sku: z.string().optional(),
            quantity: z.number().min(1),
            unitPrice: z.number(),
            imageUrl: z.string().optional().nullable(),
          })
        ),
        subtotal: z.number(),
        shippingFee: z.number().default(0),
        discount: z.number().default(0),
        total: z.number(),
        paymentMethod: z.string(),
        shippingAddress: z.record(z.string(), z.unknown()),
        billingAddress: z.record(z.string(), z.unknown()).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user?.id || null;
      const orderNumber = `MG-${Date.now().toString().slice(-6)}-${nanoid(3).toUpperCase()}`;

      if (!db) {
        const newMockOrder = {
          id: mockOrderIdCounter++,
          orderNumber,
          userId,
          status: "pending",
          subtotal: String(input.subtotal),
          shippingFee: String(input.shippingFee),
          discount: String(input.discount),
          total: String(input.total),
          totalAmount: String(input.total),
          currency: "LKR",
          paymentMethod: input.paymentMethod,
          paymentStatus: "pending",
          shippingAddress: input.shippingAddress,
          billingAddress: input.billingAddress || input.shippingAddress,
          notes: input.notes || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          items: input.items.map((i, idx) => ({
            id: idx + 1,
            orderId: mockOrderIdCounter - 1,
            productId: String(i.productId),
            variantId: i.variantId ? String(i.variantId) : null,
            productName: i.productName,
            quantity: i.quantity,
            unitPrice: String(i.unitPrice),
            subtotal: String(i.unitPrice * i.quantity),
            imageUrl: i.imageUrl || null,
          })),
        };
        MOCK_ORDERS.push(newMockOrder);
        return { success: true, orderId: newMockOrder.id, orderNumber };
      }

      await db.insert(orders).values({
        orderNumber,
        userId,
        status: "pending",
        subtotal: String(input.subtotal),
        shippingFee: String(input.shippingFee),
        discount: String(input.discount),
        total: String(input.total),
        currency: "LKR",
        paymentMethod: input.paymentMethod,
        paymentStatus: "pending",
        shippingAddress: input.shippingAddress,
        billingAddress: input.billingAddress || input.shippingAddress,
        notes: input.notes || null,
      });

      const [newOrder] = await db
        .select()
        .from(orders)
        .where(eq(orders.orderNumber, orderNumber))
        .limit(1);

      if (!newOrder) {
        throw new Error("Failed to retrieve created order");
      }

      if (input.items.length > 0) {
        await db.insert(orderItems).values(
          input.items.map(item => ({
            orderId: newOrder.id,
            productId: String(item.productId),
            variantId: item.variantId ? String(item.variantId) : null,
            productName: item.productName,
            variantName: item.variantName || null,
            sku: item.sku || null,
            quantity: item.quantity,
            unitPrice: String(item.unitPrice),
            subtotal: String(item.unitPrice * item.quantity),
          }))
        );
      }

      return { success: true, orderId: newOrder.id, orderNumber };
    }),
});
