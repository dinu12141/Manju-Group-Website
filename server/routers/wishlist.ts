import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  wishlists,
  products,
  productImages,
  brands,
} from "../../drizzle/schema";
import { eq, and, inArray } from "drizzle-orm";

export const wishlistRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const items = await db
      .select({
        id: wishlists.id,
        productId: wishlists.productId,
        productName: products.name,
        productSlug: products.slug,
        basePrice: products.basePrice,
        salePrice: products.salePrice,
        currency: products.currency,
        isInStock: products.isInStock,
        brandName: brands.name,
        createdAt: wishlists.createdAt,
      })
      .from(wishlists)
      .leftJoin(products, eq(wishlists.productId, products.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(eq(wishlists.userId, ctx.user.id));

    const productIds = items.map(i => i.productId);
    const images =
      productIds.length > 0
        ? await db
            .select()
            .from(productImages)
            .where(
              and(
                inArray(productImages.productId, productIds),
                eq(productImages.isPrimary, true)
              )
            )
        : [];
    const imageMap = new Map(images.map(img => [img.productId, img.url]));

    return items.map(i => ({
      ...i,
      imageUrl: imageMap.get(i.productId) || null,
    }));
  }),

  toggle: protectedProcedure
    .input(z.object({ productId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      const [existing] = await db
        .select()
        .from(wishlists)
        .where(
          and(
            eq(wishlists.userId, ctx.user.id),
            eq(wishlists.productId, input.productId)
          )
        )
        .limit(1);

      if (existing) {
        await db.delete(wishlists).where(eq(wishlists.id, existing.id));
        return { added: false };
      } else {
        await db
          .insert(wishlists)
          .values({ userId: ctx.user.id, productId: input.productId });
        return { added: true };
      }
    }),

  isWishlisted: protectedProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return false;
      const [item] = await db
        .select()
        .from(wishlists)
        .where(
          and(
            eq(wishlists.userId, ctx.user.id),
            eq(wishlists.productId, input.productId)
          )
        )
        .limit(1);
      return !!item;
    }),
});
