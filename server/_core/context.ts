import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { supabase } from "../supabase";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const authHeader = opts.req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const { data, error } = await supabase.auth.getUser(token);
      
      if (!error && data?.user) {
        // Fetch full user record from our database using the Supabase auth ID
        const db = await getDb();
        if (db) {
          let result = await db
            .select()
            .from(users)
            .where(eq(users.openId, data.user.id))
            .limit(1);
            
          if (result.length === 0) {
            // Auto-create user
            await db.insert(users).values({
              openId: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "User",
              loginMethod: "supabase",
              lastSignedIn: new Date(),
            });
            
            result = await db
              .select()
              .from(users)
              .where(eq(users.openId, data.user.id))
              .limit(1);
          }
          
          if (result.length > 0) {
            user = result[0];
          }
        }
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
