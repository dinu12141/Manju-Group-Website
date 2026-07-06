import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { carts, cartItems, products, productImages, brands } from "../../drizzle/schema";
import { eq, and, inArray } from "drizzle-orm";

async function getOrCreateCart(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, userId?: number, sessionId?: string) {
  if (userId) {
    const [existing] = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
    if (existing) return existing;
    await db.insert(carts).values({ userId });
    const [created] = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
    return created!;
  }
  if (sessionId) {
    const [existing] = await db.select().from(carts).where(eq(carts.sessionId, sessionId)).limit(1);
    if (existing) return existing;
    await db.insert(carts).values({ sessionId });
    const [created] = await db.select().from(carts).where(eq(carts.sessionId, sessionId)).limit(1);
    return created!;
  }
  throw new Error("No userId or sessionId");
}

export const cartRouter = router({
  get: publicProcedure
    .input(z.object({ sessionId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { items: [], total: 0, itemCount: 0 };

      const userId = ctx.user?.id;
      const sessionId = input.sessionId;
      if (!userId && !sessionId) return { items: [], total: 0, itemCount: 0 };

      const cart = await getOrCreateCart(db, userId, sessionId);
      const items = await db
        .select({
          id: cartItems.id,
          cartId: cartItems.cartId,
          productId: cartItems.productId,
          variantId: cartItems.variantId,
          quantity: cartItems.quantity,
          unitPrice: cartItems.unitPrice,
          productName: products.name,
          productSlug: products.slug,
          brandName: brands.name,
          isInStock: products.isInStock,
        })
        .from(cartItems)
        .leftJoin(products, eq(cartItems.productId, products.id))
        .leftJoin(brands, eq(products.brandId, brands.id))
        .where(eq(cartItems.cartId, cart.id));

      const productIds = items.map((i) => i.productId);
      const images = productIds.length > 0
        ? await db.select().from(productImages).where(and(inArray(productImages.productId, productIds), eq(productImages.isPrimary, true)))
        : [];
      const imageMap = new Map(images.map((img) => [img.productId, img.url]));

      const enriched = items.map((i) => ({ ...i, imageUrl: imageMap.get(i.productId) || null }));
      const total = enriched.reduce((sum, i) => sum + Number(i.unitPrice) * i.quantity, 0);
      const itemCount = enriched.reduce((sum, i) => sum + i.quantity, 0);

      return { items: enriched, total, itemCount };
    }),

  addItem: publicProcedure
    .input(z.object({
      productId: z.number(),
      variantId: z.number().optional(),
      quantity: z.number().min(1).default(1),
      unitPrice: z.number(),
      sessionId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      const userId = ctx.user?.id;
      const sessionId = input.sessionId;
      if (!userId && !sessionId) throw new Error("No session");

      const cart = await getOrCreateCart(db, userId, sessionId);

      const [existing] = await db
        .select()
        .from(cartItems)
        .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, input.productId)))
        .limit(1);

      if (existing) {
        await db.update(cartItems).set({ quantity: existing.quantity + input.quantity }).where(eq(cartItems.id, existing.id));
      } else {
        await db.insert(cartItems).values({
          cartId: cart.id,
          productId: input.productId,
          variantId: input.variantId,
          quantity: input.quantity,
          unitPrice: String(input.unitPrice),
        });
      }
      return { success: true };
    }),

  updateItem: publicProcedure
    .input(z.object({ itemId: z.number(), quantity: z.number().min(0), sessionId: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      if (input.quantity === 0) {
        await db.delete(cartItems).where(eq(cartItems.id, input.itemId));
      } else {
        await db.update(cartItems).set({ quantity: input.quantity }).where(eq(cartItems.id, input.itemId));
      }
      return { success: true };
    }),

  removeItem: publicProcedure
    .input(z.object({ itemId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.delete(cartItems).where(eq(cartItems.id, input.itemId));
      return { success: true };
    }),

  clear: publicProcedure
    .input(z.object({ sessionId: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      const userId = ctx.user?.id;
      const sessionId = input.sessionId;
      if (!userId && !sessionId) return { success: true };

      const [cart] = userId
        ? await db.select().from(carts).where(eq(carts.userId, userId)).limit(1)
        : await db.select().from(carts).where(eq(carts.sessionId, sessionId!)).limit(1);

      if (cart) {
        await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
      }
      return { success: true };
    }),
});
