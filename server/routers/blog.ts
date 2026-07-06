import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { blogPosts } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const blogRouter = router({
  list: publicProcedure
    .input(
      z.object({ limit: z.number().default(10), page: z.number().default(1) })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { items: [], total: 0 };
      const offset = (input.page - 1) * input.limit;
      const items = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.isPublished, true))
        .orderBy(desc(blogPosts.publishedAt))
        .limit(input.limit)
        .offset(offset);
      return { items, total: items.length };
    }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [post] = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.slug, input.slug))
        .limit(1);
      return post ?? null;
    }),
});
