import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { orders, orderItems } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export const ordersRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(orders)
      .where(eq(orders.userId, ctx.user.id))
      .orderBy(desc(orders.createdAt));
  }),

  byId: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.id))
        .limit(1);
      if (!order || order.userId !== ctx.user.id) return null;
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));
      return { ...order, items };
    }),

  create: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.number(),
            variantId: z.number().optional(),
            productName: z.string(),
            variantName: z.string().optional(),
            sku: z.string().optional(),
            quantity: z.number(),
            unitPrice: z.number(),
          })
        ),
        subtotal: z.number(),
        shippingFee: z.number().default(0),
        discount: z.number().default(0),
        total: z.number(),
        paymentMethod: z.string(),
        shippingAddress: z.record(z.string(), z.unknown()),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      const orderNumber = `MG-${Date.now()}-${nanoid(4).toUpperCase()}`;

      await db.insert(orders).values({
        orderNumber,
        userId: ctx.user.id,
        subtotal: String(input.subtotal),
        shippingFee: String(input.shippingFee),
        discount: String(input.discount),
        total: String(input.total),
        paymentMethod: input.paymentMethod,
        shippingAddress: input.shippingAddress,
        notes: input.notes,
      });

      const [newOrder] = await db
        .select()
        .from(orders)
        .where(eq(orders.orderNumber, orderNumber))
        .limit(1);
      if (!newOrder) throw new Error("Order creation failed");

      await db.insert(orderItems).values(
        input.items.map(item => ({
          orderId: newOrder.id,
          productId: item.productId,
          variantId: item.variantId,
          productName: item.productName,
          variantName: item.variantName,
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: String(item.unitPrice),
          subtotal: String(item.unitPrice * item.quantity),
        }))
      );

      return { success: true, orderId: newOrder.id, orderNumber };
    }),
});
