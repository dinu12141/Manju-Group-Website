import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { supabase } from "../supabase";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { verifyAdminToken } from "./adminPasscode";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  isAdminByPasscode: boolean;
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
            // Auto-create user as a regular customer account.
            await db.insert(users).values({
              openId: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "User",
              loginMethod: "supabase",
              role: "user",
              lastSignedIn: new Date(),
            });

            result = await db
              .select()
              .from(users)
              .where(eq(users.openId, data.user.id))
              .limit(1);
          }

          if (result && result.length > 0) {
            user = result[0];
          }
        }

        // Fallback user object from Supabase if DB record was not found or DB was slow
        if (!user && data.user) {
          user = {
            id: 0,
            openId: data.user.id,
            name:
              data.user.user_metadata?.full_name ||
              data.user.email?.split("@")[0] ||
              "User",
            email: data.user.email || null,
            phone: data.user.phone || null,
            loginMethod: "supabase",
            passwordHash: null,
            resetToken: null,
            resetTokenExpiry: null,
            role: "user",
            avatarUrl: data.user.user_metadata?.avatar_url || null,
            createdAt: new Date(data.user.created_at || Date.now()),
            updatedAt: new Date(),
            lastSignedIn: new Date(),
          };
        }
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  const adminTokenHeader = opts.req.headers["x-admin-token"];
  const adminToken = Array.isArray(adminTokenHeader)
    ? adminTokenHeader[0]
    : adminTokenHeader;
  const isAdminByPasscode = verifyAdminToken(adminToken);

  return {
    req: opts.req,
    res: opts.res,
    user,
    isAdminByPasscode,
  };
}
