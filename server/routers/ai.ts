import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { products, brands, categories } from "../../drizzle/schema";
import { eq, like, or, and } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

const SYSTEM_PROMPT = `You are a helpful customer service assistant for Manju Group, a leading Sri Lankan multi-brand company. 
You help customers find products, compare specifications, and answer questions about:

Manju Group Brands:
1. Dew Motors - Electric Bikes (EM005 2400W, YW06 2000W) - eco-friendly electric motorcycles
2. Dew Plus - Smart TVs (32", 43", 55", 65") - premium Android smart televisions
3. DEW+ AC - Air Conditioners (1 Ton, 1.5 Ton, 2 Ton) - inverter split ACs with R32 gas
4. Manju Dew Super - Water Filters (RO, RO+, Hot & Cold) - advanced purification systems
5. Manju Exercise Books - School stationery (exercise books, various sizes and rulings)

Key information:
- Island-wide delivery across Sri Lanka
- Payment methods: Cash on delivery, bank transfer, credit/debit cards, PayHere
- Warranty: 12 months for electronics, 5 years compressor warranty for ACs
- Free installation for DEW+ AC units
- Showrooms in Colombo, Kandy, Galle, Kurunegala, Jaffna, Matara, Anuradhapura, Negombo
- Contact: info@manjugroup.lk

Be friendly, concise, and helpful. If asked about pricing, mention that prices are in Sri Lankan Rupees (LKR).
Always recommend visiting the website or a showroom for the latest pricing and availability.`;

export const aiRouter = router({
  chat: publicProcedure
    .input(z.object({
      message: z.string().min(1).max(500),
      history: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })).default([]),
    }))
    .mutation(async ({ input }) => {
      try {
        const messages = [
          ...input.history.slice(-6).map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
          { role: "user" as const, content: input.message },
        ];

        const allMessages = [
          { role: "system" as const, content: SYSTEM_PROMPT },
          ...messages,
        ];

        const response = await invokeLLM({
          model: "gpt-4o-mini",
          messages: allMessages,
          maxTokens: 400,
        });

        const reply = response.choices?.[0]?.message?.content;
        const replyText = typeof reply === "string" ? reply : Array.isArray(reply) ? reply.map(p => typeof p === "string" ? p : (p as {type:string;text?:string}).text || "").join("") : "";
        return { reply: replyText || "I'm sorry, I couldn't process your request. Please try again." };
      } catch (error) {
        console.error("AI chat error:", error);
        return { reply: "I'm having trouble connecting right now. Please contact us at info@manjugroup.lk or call +94 11 234 5678." };
      }
    }),
});
