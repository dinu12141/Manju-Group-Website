import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { contactMessages } from "../../drizzle/schema";

export const contactRouter = router({
  submit: publicProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100),
        email: z.string().email().max(254),
        phone: z.string().max(30).optional(),
        subject: z.string().max(200).optional(),
        message: z.string().min(10).max(5000),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.insert(contactMessages).values(input);
      return { success: true };
    }),
});
