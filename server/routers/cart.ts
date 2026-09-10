import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  carts,
  cartItems,
  products,
  brands,
  productImages,
} from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

// In-memory fallback if MySQL is offline
type MockCart = { id: number; userId?: number; sessionId?: string };
type MockCartItem = {
  id: number;
  cartId: number;
  productId: string;
  variantId: string | null;
  quantity: number;
  unitPrice: string;
};
const MOCK_CARTS: MockCart[] = [];
let MOCK_CART_ITEMS: MockCartItem[] = [];
let mockCartIdCounter = 1;
let mockCartItemIdCounter = 1;

async function getOrCreateMockCart(userId?: number, sessionId?: string) {
  let cart = MOCK_CARTS.find(c =>
    userId ? c.userId === userId : c.sessionId === sessionId
  );
  if (!cart) {
    cart = { id: mockCartIdCounter++, userId, sessionId };
    MOCK_CARTS.push(cart);
  }
  return cart;
}

async function getOrCreateCart(
  db: NonNullable<Awaited<ReturnType<typeof getDb>>>,
  userId?: number,
  sessionId?: string
) {
  if (userId) {
    const [existing] = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, userId))
      .limit(1);
    if (existing) return existing;
    await db.insert(carts).values({ userId });
    const [created] = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, userId))
      .limit(1);
    return created!;
  }
  if (sessionId) {
    const [existing] = await db
      .select()
      .from(carts)
      .where(eq(carts.sessionId, sessionId))
      .limit(1);
    if (existing) return existing;
    await db.insert(carts).values({ sessionId });
    const [created] = await db
      .select()
      .from(carts)
      .where(eq(carts.sessionId, sessionId))
      .limit(1);
    return created!;
  }
  throw new Error("No userId or sessionId provided for cart");
}

export const cartRouter = router({
  get: publicProcedure
    .input(z.object({ sessionId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user?.id;
      const sessionId = input.sessionId;

      if (!userId && !sessionId) {
        return { items: [], total: 0, itemCount: 0 };
      }

      let cart: any;
      let rawItems: any[] = [];

      try {
        if (!db) {
          cart = await getOrCreateMockCart(userId, sessionId);
          rawItems = MOCK_CART_ITEMS.filter(i => i.cartId === cart.id);
        } else {
          cart = await getOrCreateCart(db, userId, sessionId);
          rawItems = await db
            .select()
            .from(cartItems)
            .where(eq(cartItems.cartId, cart.id));
        }
      } catch (err) {
        console.warn("DB cart lookup failed, using memory fallback:", err);
        cart = await getOrCreateMockCart(userId, sessionId);
        rawItems = MOCK_CART_ITEMS.filter(i => i.cartId === cart.id);
      }

      if (rawItems.length === 0) {
        return { items: [], total: 0, itemCount: 0 };
      }

      // Enrich items directly from local DB
      const enriched = await Promise.all(
        rawItems.map(async item => {
          const numId = Number(item.productId);
          let p: any = null;
          let pBrand: any = null;
          let pImage: string | null = null;

          if (db && !isNaN(numId)) {
            const [pRow] = await db
              .select({
                product: products,
                brand: brands,
              })
              .from(products)
              .leftJoin(brands, eq(products.brandId, brands.id))
              .where(eq(products.id, numId))
              .limit(1);

            if (pRow) {
              p = pRow.product;
              pBrand = pRow.brand;

              const [imgRow] = await db
                .select()
                .from(productImages)
                .where(eq(productImages.productId, numId))
                .orderBy(productImages.sortOrder)
                .limit(1);
              pImage = imgRow?.url ?? null;
            }
          }

          const fallbackPrice =
            Number(item.unitPrice) ||
            (p?.salePrice ? Number(p.salePrice) : Number(p?.basePrice)) ||
            0;

          return {
            id: item.id,
            cartId: item.cartId,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: fallbackPrice,
            productName: p?.name ?? `Product #${item.productId}`,
            productSlug: p?.slug ?? "products",
            brandName: pBrand?.name ?? "Manju Group",
            isInStock: p ? p.isInStock : true,
            imageUrl: pImage,
          };
        })
      );

      const total = enriched.reduce(
        (sum, i) => sum + Number(i.unitPrice) * i.quantity,
        0
      );
      const itemCount = enriched.reduce((sum, i) => sum + i.quantity, 0);

      return { items: enriched, total, itemCount };
    }),

  addItem: publicProcedure
    .input(
      z.object({
        productId: z.union([z.string(), z.number()]),
        variantId: z.union([z.string(), z.number()]).optional(),
        quantity: z.number().min(1).default(1),
        unitPrice: z.number(),
        sessionId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user?.id;
      const sessionId = input.sessionId;

      if (!userId && !sessionId) {
        throw new Error("Missing user session for cart");
      }

      const prodIdStr = String(input.productId);

      try {
        if (!db) {
          const cart = await getOrCreateMockCart(userId, sessionId);
          const existing = MOCK_CART_ITEMS.find(
            i => i.cartId === cart.id && i.productId === prodIdStr
          );
          if (existing) {
            existing.quantity += input.quantity;
          } else {
            MOCK_CART_ITEMS.push({
              id: mockCartItemIdCounter++,
              cartId: cart.id,
              productId: prodIdStr,
              variantId: input.variantId ? String(input.variantId) : null,
              quantity: input.quantity,
              unitPrice: String(input.unitPrice),
            });
          }
          return { success: true };
        }

        const cart = await getOrCreateCart(db, userId, sessionId);

        const [existing] = await db
          .select()
          .from(cartItems)
          .where(
            and(
              eq(cartItems.cartId, cart.id),
              eq(cartItems.productId, prodIdStr)
            )
          )
          .limit(1);

        if (existing) {
          await db
            .update(cartItems)
            .set({ quantity: existing.quantity + input.quantity })
            .where(eq(cartItems.id, existing.id));
        } else {
          await db.insert(cartItems).values({
            cartId: cart.id,
            productId: prodIdStr,
            variantId: input.variantId ? String(input.variantId) : null,
            quantity: input.quantity,
            unitPrice: String(input.unitPrice),
          });
        }
      } catch (err) {
        console.warn("DB addItem failed, falling back to mock cart:", err);
        const cart = await getOrCreateMockCart(userId, sessionId);
        const existing = MOCK_CART_ITEMS.find(
          i => i.cartId === cart.id && i.productId === prodIdStr
        );
        if (existing) {
          existing.quantity += input.quantity;
        } else {
          MOCK_CART_ITEMS.push({
            id: mockCartItemIdCounter++,
            cartId: cart.id,
            productId: prodIdStr,
            variantId: input.variantId ? String(input.variantId) : null,
            quantity: input.quantity,
            unitPrice: String(input.unitPrice),
          });
        }
      }

      return { success: true };
    }),

  // Finding #2 fix: verify cart item belongs to the caller's cart before mutating
  updateItem: publicProcedure
    .input(
      z.object({
        itemId: z.number(),
        quantity: z.number().min(0),
        sessionId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user?.id;
      const sessionId = input.sessionId;

      if (!db) {
        const item = MOCK_CART_ITEMS.find(i => i.id === input.itemId);
        if (item) {
          const cart = MOCK_CARTS.find(c => c.id === item.cartId);
          if (cart && userId && cart.userId !== userId) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Cart item not found",
            });
          }
          if (cart && !userId && sessionId && cart.sessionId !== sessionId) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Cart item not found",
            });
          }
          if (input.quantity <= 0) {
            MOCK_CART_ITEMS = MOCK_CART_ITEMS.filter(
              i => i.id !== input.itemId
            );
          } else {
            item.quantity = input.quantity;
          }
        }
        return { success: true };
      }

      const [item] = await db
        .select()
        .from(cartItems)
        .where(eq(cartItems.id, input.itemId))
        .limit(1);

      if (!item) return { success: true };

      const [cart] = userId
        ? await db.select().from(carts).where(eq(carts.userId, userId)).limit(1)
        : sessionId
          ? await db
              .select()
              .from(carts)
              .where(eq(carts.sessionId, sessionId))
              .limit(1)
          : [];

      if (!cart || cart.id !== item.cartId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cart item not found",
        });
      }

      if (input.quantity <= 0) {
        await db.delete(cartItems).where(eq(cartItems.id, input.itemId));
      } else {
        await db
          .update(cartItems)
          .set({ quantity: input.quantity })
          .where(eq(cartItems.id, input.itemId));
      }

      return { success: true };
    }),

  // Finding #2 fix: verify cart item belongs to the caller's cart before deleting
  removeItem: publicProcedure
    .input(z.object({ itemId: z.number(), sessionId: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user?.id;
      const sessionId = input.sessionId;

      if (!db) {
        const item = MOCK_CART_ITEMS.find(i => i.id === input.itemId);
        if (item) {
          const cart = MOCK_CARTS.find(c => c.id === item.cartId);
          if (cart && userId && cart.userId !== userId) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Cart item not found",
            });
          }
          if (cart && !userId && sessionId && cart.sessionId !== sessionId) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Cart item not found",
            });
          }
          MOCK_CART_ITEMS = MOCK_CART_ITEMS.filter(i => i.id !== input.itemId);
        }
        return { success: true };
      }

      const [item] = await db
        .select()
        .from(cartItems)
        .where(eq(cartItems.id, input.itemId))
        .limit(1);

      if (!item) return { success: true };

      const [cart] = userId
        ? await db.select().from(carts).where(eq(carts.userId, userId)).limit(1)
        : sessionId
          ? await db
              .select()
              .from(carts)
              .where(eq(carts.sessionId, sessionId))
              .limit(1)
          : [];

      if (!cart || cart.id !== item.cartId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cart item not found",
        });
      }

      await db.delete(cartItems).where(eq(cartItems.id, input.itemId));
      return { success: true };
    }),

  clear: publicProcedure
    .input(z.object({ sessionId: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user?.id;
      const sessionId = input.sessionId;

      if (!userId && !sessionId) return { success: true };

      if (!db) {
        const cart = await getOrCreateMockCart(userId, sessionId);
        MOCK_CART_ITEMS = MOCK_CART_ITEMS.filter(i => i.cartId !== cart.id);
        return { success: true };
      }

      const [cart] = userId
        ? await db.select().from(carts).where(eq(carts.userId, userId)).limit(1)
        : await db
            .select()
            .from(carts)
            .where(eq(carts.sessionId, sessionId!))
            .limit(1);

      if (cart) {
        await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
      }

      return { success: true };
    }),
});
