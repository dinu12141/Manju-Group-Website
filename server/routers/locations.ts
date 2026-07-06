import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { locations } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const locationsRouter = router({
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(locations)
      .where(eq(locations.isActive, true))
      .orderBy(locations.sortOrder);
  }),
});
