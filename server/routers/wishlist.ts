import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  wishlists,
  products,
  brands,
  productImages,
} from "../../drizzle/schema";
import { eq, and, inArray } from "drizzle-orm";

// In-memory fallback for guests or if DB is offline
const MOCK_WISHLISTS: Array<{
  id: number;
  userId?: number;
  sessionId?: string;
  productId: string;
}> = [];
let mockWishlistIdCounter = 1;

export const wishlistRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          sessionId: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user?.id;
      const sessionId = input?.sessionId;

      if (!userId && !sessionId) {
        return [];
      }

      let rawItems: Array<{ id: number; productId: string }> = [];

      try {
        if (!db || !userId) {
          rawItems = MOCK_WISHLISTS.filter(w =>
            userId ? w.userId === userId : w.sessionId === sessionId
          );
        } else {
          rawItems = await db
            .select({
              id: wishlists.id,
              productId: wishlists.productId,
            })
            .from(wishlists)
            .where(eq(wishlists.userId, userId));
        }
      } catch (err) {
        console.warn("DB wishlist lookup failed, using memory fallback:", err);
        rawItems = MOCK_WISHLISTS.filter(w =>
          userId ? w.userId === userId : w.sessionId === sessionId
        );
      }

      if (rawItems.length === 0) return [];

      const productIds = rawItems
        .map(i => Number(i.productId))
        .filter(id => !isNaN(id) && id > 0);

      let productMap: Record<number, any> = {};
      let brandMap: Record<number, any> = {};
      let imageMap: Record<number, string> = {};

      if (db && productIds.length > 0) {
        const pRows = await db
          .select({
            product: products,
            brand: brands,
          })
          .from(products)
          .leftJoin(brands, eq(products.brandId, brands.id))
          .where(inArray(products.id, productIds));

        for (const row of pRows) {
          productMap[row.product.id] = row.product;
          if (row.brand) {
            brandMap[row.product.id] = row.brand;
          }
        }

        const imgRows = await db
          .select()
          .from(productImages)
          .where(inArray(productImages.productId, productIds))
          .orderBy(productImages.sortOrder);

        for (const img of imgRows) {
          if (!imageMap[img.productId]) {
            imageMap[img.productId] = img.url;
          }
        }
      }

      return rawItems.map(item => {
        const numId = Number(item.productId);
        const p = productMap[numId];
        const b = brandMap[numId];
        const img = imageMap[numId];

        return {
          id: item.id,
          productId: item.productId,
          productName: p?.name ?? `Product #${item.productId}`,
          productSlug: p?.slug ?? "products",
          basePrice: p?.basePrice ? Number(p.basePrice) : 0,
          salePrice: p?.salePrice ? Number(p.salePrice) : null,
          currency: "LKR",
          isInStock: p ? p.isInStock : true,
          brandName: b?.name ?? "Manju Group",
          imageUrl: img || null,
        };
      });
    }),

  toggle: publicProcedure
    .input(
      z.object({
        productId: z.union([z.string(), z.number()]),
        sessionId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user?.id;
      const sessionId = input.sessionId;
      const prodIdStr = String(input.productId);

      if (!userId && !sessionId) {
        throw new Error("User session required for wishlist");
      }

      if (!db || !userId) {
        const existingIdx = MOCK_WISHLISTS.findIndex(w =>
          userId
            ? w.userId === userId && w.productId === prodIdStr
            : w.sessionId === sessionId && w.productId === prodIdStr
        );

        if (existingIdx >= 0) {
          MOCK_WISHLISTS.splice(existingIdx, 1);
          return { added: false };
        } else {
          MOCK_WISHLISTS.push({
            id: mockWishlistIdCounter++,
            userId,
            sessionId,
            productId: prodIdStr,
          });
          return { added: true };
        }
      }

      const [existing] = await db
        .select()
        .from(wishlists)
        .where(
          and(eq(wishlists.userId, userId), eq(wishlists.productId, prodIdStr))
        )
        .limit(1);

      if (existing) {
        await db.delete(wishlists).where(eq(wishlists.id, existing.id));
        return { added: false };
      } else {
        await db.insert(wishlists).values({
          userId,
          productId: prodIdStr,
        });
        return { added: true };
      }
    }),

  isWishlisted: publicProcedure
    .input(
      z.object({
        productId: z.union([z.string(), z.number()]),
        sessionId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user?.id;
      const sessionId = input.sessionId;
      const prodIdStr = String(input.productId);

      if (!userId && !sessionId) return false;

      if (!db || !userId) {
        return MOCK_WISHLISTS.some(w =>
          userId
            ? w.userId === userId && w.productId === prodIdStr
            : w.sessionId === sessionId && w.productId === prodIdStr
        );
      }

      const [item] = await db
        .select()
        .from(wishlists)
        .where(
          and(eq(wishlists.userId, userId), eq(wishlists.productId, prodIdStr))
        )
        .limit(1);

      return !!item;
    }),
});
