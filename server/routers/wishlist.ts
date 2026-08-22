import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { wishlists } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import axios from "axios";

const APP_API_URL = process.env.APP_API_URL || "http://localhost:3001/api/v1";

export const wishlistRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const items = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.userId, ctx.user.id));

    if (items.length === 0) return [];

    const enriched = await Promise.all(
      items.map(async i => {
        try {
          const res = await axios.get(`${APP_API_URL}/products/${i.productId}`);
          const p = res.data?.data;
          if (!p) throw new Error("Product not found");

          // Map brandName
          let brandName = "Manju Exercise Books";
          const brandSlugLower = p.brand?.slug?.toLowerCase();
          const catSlugLower = p.category?.slug?.toLowerCase() || "";
          if (
            brandSlugLower === "dewac" ||
            brandSlugLower === "dew-plus-ac" ||
            catSlugLower === "dew-air-conditioners" ||
            catSlugLower === "air-conditioners" ||
            catSlugLower === "dew-plus-ac"
          ) {
            brandName = "DEW+ AC";
          } else if (
            brandSlugLower === "dew-motors" ||
            catSlugLower === "electric-bike" ||
            catSlugLower === "dew-motors" ||
            catSlugLower === "electric-bikes"
          ) {
            brandName = "Dew Motors";
          } else if (
            brandSlugLower === "dew-plus" ||
            catSlugLower === "smart-tv" ||
            catSlugLower === "dew-plus" ||
            catSlugLower === "smart-tvs"
          ) {
            brandName = "Dew Plus";
          } else if (
            brandSlugLower === "manju-dew-super" ||
            catSlugLower.startsWith("ro-") ||
            catSlugLower.includes("water-filter") ||
            catSlugLower.includes("filter")
          ) {
            brandName = "Manju Dew Super";
          }

          return {
            ...i,
            productName: p.name,
            productSlug: p.slug,
            basePrice: Number(p.price) || 0,
            salePrice: p.salePrice ? Number(p.salePrice) : null,
            currency: "LKR",
            isInStock: p.stock > 0,
            brandName: brandName,
            imageUrl: p.productImages?.[0]?.url || p.images?.[0] || null,
          };
        } catch (e) {
          return {
            ...i,
            productName: "Unknown Product",
            productSlug: "#",
            basePrice: 0,
            salePrice: null,
            currency: "LKR",
            isInStock: false,
            brandName: "Unknown Brand",
            imageUrl: null,
          };
        }
      })
    );

    return enriched;
  }),

  toggle: protectedProcedure
    .input(z.object({ productId: z.union([z.string(), z.number()]) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      const [existing] = await db
        .select()
        .from(wishlists)
        .where(
          and(
            eq(wishlists.userId, ctx.user.id),
            eq(wishlists.productId, String(input.productId))
          )
        )
        .limit(1);

      if (existing) {
        await db.delete(wishlists).where(eq(wishlists.id, existing.id));
        return { added: false };
      } else {
        await db
          .insert(wishlists)
          .values({ userId: ctx.user.id, productId: String(input.productId) });
        return { added: true };
      }
    }),

  isWishlisted: protectedProcedure
    .input(z.object({ productId: z.union([z.string(), z.number()]) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return false;
      const [item] = await db
        .select()
        .from(wishlists)
        .where(
          and(
            eq(wishlists.userId, ctx.user.id),
            eq(wishlists.productId, String(input.productId))
          )
        )
        .limit(1);
      return !!item;
    }),
});
