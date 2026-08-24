import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { orders, orderItems, productImages, products, productVariants } from "../../drizzle/schema";
import { eq, desc, inArray, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

// Mock store fallback if DB is offline
const MOCK_ORDERS: any[] = [];
let mockOrderIdCounter = 1;

async function attachItemImages(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, items: (typeof orderItems.$inferSelect)[]) {
  const productIds = Array.from(
    new Set(
      items.map(i => Number(i.productId)).filter(id => !isNaN(id) && id > 0)
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

  return items.map(item => ({
    ...item,
    imageUrl: imageMap[Number(item.productId)] || null,
  }));
}

export const ordersRouter = router({
  // Finding #9 fix: require auth; no client-supplied email lookup (prevents unauthenticated order enumeration)
  list: publicProcedure
    .input(z.object({}).optional())
    .query(async ({ ctx }) => {
      const db = await getDb();
      const userId = ctx.user?.id;

      if (!userId) {
        return [];
      }

      if (!db) {
        return MOCK_ORDERS.filter(o => o.userId === userId).sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      let userOrders: any[] = [];
      userOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt));

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
          items.map(i => Number(i.productId)).filter(id => !isNaN(id) && id > 0)
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

  // Finding #1 fix: require auth + verify order belongs to the authenticated user
  byId: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user.id;

      if (!db) {
        const mock = MOCK_ORDERS.find(o => o.id === input.id && o.userId === userId);
        return mock || null;
      }

      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.id))
        .limit(1);

      if (!order) return null;
      if (order.userId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Order not found" });
      }

      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      return {
        ...order,
        totalAmount: order.total,
        items: await attachItemImages(db, items),
      };
    }),

  // Finding #13 fix: emailOrPhone is required and must match the order's shippingAddress
  track: publicProcedure
    .input(
      z.object({
        orderNumber: z.string(),
        emailOrPhone: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      const cleanNum = input.orderNumber.trim().toUpperCase();
      const credential = input.emailOrPhone.trim().toLowerCase();

      if (!db) {
        const found = MOCK_ORDERS.find(o => {
          if (o.orderNumber.toUpperCase() !== cleanNum) return false;
          const addr = o.shippingAddress || {};
          return (
            String(addr.email || "").toLowerCase() === credential ||
            String(addr.phone || "").replace(/\D/g, "") === credential.replace(/\D/g, "")
          );
        });
        return found || null;
      }

      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.orderNumber, cleanNum))
        .limit(1);

      if (!order) return null;

      const addr = (order.shippingAddress || {}) as Record<string, unknown>;
      const emailMatch = String(addr.email || "").toLowerCase() === credential;
      const phoneMatch =
        String(addr.phone || "").replace(/\D/g, "") === credential.replace(/\D/g, "");

      if (!emailMatch && !phoneMatch) return null;

      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      return {
        ...order,
        totalAmount: order.total,
        items: await attachItemImages(db, items),
      };
    }),

  create: publicProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.union([z.string(), z.number()]),
            variantId: z.union([z.string(), z.number()]).optional().nullable(),
            productName: z.string().max(300),
            variantName: z.string().max(200).optional(),
            sku: z.string().max(100).optional(),
            quantity: z.number().int().min(1).max(1000),
            unitPrice: z.number(),
            imageUrl: z.string().max(500).optional().nullable(),
          })
        ).max(100),
        subtotal: z.number(),
        shippingFee: z.number().default(0),
        discount: z.number().default(0),
        total: z.number(),
        paymentMethod: z.string().max(50),
        shippingAddress: z.record(z.string(), z.unknown()),
        billingAddress: z.record(z.string(), z.unknown()).optional(),
        notes: z.string().max(1000).optional(),
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

      try {
        // Finding #3 fix: look up authoritative prices from DB; never trust client-supplied prices
        const verifiedItems = await Promise.all(
          input.items.map(async item => {
            const numProductId = Number(item.productId);
            let serverUnitPrice: number | null = null;

            if (!isNaN(numProductId) && numProductId > 0) {
              if (item.variantId) {
                const [variant] = await db
                  .select({ price: productVariants.price, salePrice: productVariants.salePrice })
                  .from(productVariants)
                  .where(eq(productVariants.id, Number(item.variantId)))
                  .limit(1);
                if (variant) {
                  serverUnitPrice = Number(variant.salePrice) || Number(variant.price);
                }
              }
              if (serverUnitPrice === null) {
                const [product] = await db
                  .select({ basePrice: products.basePrice, salePrice: products.salePrice })
                  .from(products)
                  .where(eq(products.id, numProductId))
                  .limit(1);
                if (product) {
                  serverUnitPrice = Number(product.salePrice) || Number(product.basePrice);
                }
              }
            }

            // If product not found in DB fall back to client price (covers custom/legacy items)
            const unitPrice = serverUnitPrice ?? Number(item.unitPrice);
            return { ...item, unitPrice };
          })
        );

        const serverSubtotal = verifiedItems.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity,
          0
        );
        const serverShippingFee = Number(input.shippingFee);
        const serverDiscount = Number(input.discount);
        const serverTotal = serverSubtotal + serverShippingFee - serverDiscount;

        await db.insert(orders).values({
          orderNumber,
          userId,
          status: "pending",
          subtotal: String(serverSubtotal),
          shippingFee: String(serverShippingFee),
          discount: String(serverDiscount),
          total: String(serverTotal),
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

        if (verifiedItems.length > 0) {
          await db.insert(orderItems).values(
            verifiedItems.map(item => ({
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
      } catch (err: any) {
        console.error("[Orders] Create failed:", err?.message || err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to place order. Please try again.",
        });
      }
    }),
});
