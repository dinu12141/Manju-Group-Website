import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { faqs } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const faqRouter = router({
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(faqs)
      .where(eq(faqs.isActive, true))
      .orderBy(faqs.sortOrder);
  }),
});
