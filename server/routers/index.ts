import { COOKIE_NAME, ONE_YEAR_MS } from "../../shared/const";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { getSessionCookieOptions } from "../_core/cookies";
import { sdk } from "../_core/sdk";
import * as db from "../db";
import { OAuth2Client } from "google-auth-library";
import { ENV } from "../_core/env";
import { systemRouter } from "../_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { productsRouter } from "./products";
import { brandsRouter } from "./brands";
import { categoriesRouter } from "./categories";
import { cartRouter } from "./cart";
import { ordersRouter } from "./orders";
import { wishlistRouter } from "./wishlist";
import { locationsRouter } from "./locations";
import { blogRouter } from "./blog";
import { faqRouter } from "./faq";
import { contactRouter } from "./contact";
import { adminRouter } from "./admin";
import { aiRouter } from "./ai";
import { TRPCError } from "@trpc/server";

const INVALID_CREDENTIALS_MSG = "Invalid email or password";

async function createSessionAndSetCookie(
  ctx: { req: any; res: any },
  openId: string,
  name: string
) {
  const sessionToken = await sdk.createSessionToken(openId, {
    name,
    expiresInMs: ONE_YEAR_MS,
  });
  const cookieOptions = getSessionCookieOptions(ctx.req);
  ctx.res.cookie(COOKIE_NAME, sessionToken, {
    ...cookieOptions,
    maxAge: ONE_YEAR_MS,
  });
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => {
      if (!opts.ctx.user) return null;
      const { passwordHash, ...safeUser } = opts.ctx.user;
      return safeUser;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    register: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          email: z.string().email(),
          password: z.string().min(8),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const existing = await db.getUserByEmail(input.email);
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "An account with this email already exists",
          });
        }

        const passwordHash = await bcrypt.hash(input.password, 10);
        const openId = `local_${nanoid()}`;

        await db.upsertUser({
          openId,
          name: input.name,
          email: input.email,
          loginMethod: "email",
          passwordHash,
          lastSignedIn: new Date(),
        });

        await createSessionAndSetCookie(ctx, openId, input.name);

        return { success: true } as const;
      }),
    login: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByEmail(input.email);
        if (!user || !user.passwordHash) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: INVALID_CREDENTIALS_MSG,
          });
        }

        const passwordMatches = await bcrypt.compare(
          input.password,
          user.passwordHash
        );
        if (!passwordMatches) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: INVALID_CREDENTIALS_MSG,
          });
        }

        await createSessionAndSetCookie(ctx, user.openId, user.name || "");

        return { success: true } as const;
      }),
    googleLogin: publicProcedure
      .input(
        z.object({
          credential: z.string().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ENV.googleClientId) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Google Client ID is not configured",
          });
        }

        const client = new OAuth2Client(ENV.googleClientId);
        let payload;
        try {
          const ticket = await client.verifyIdToken({
            idToken: input.credential,
            audience: ENV.googleClientId,
          });
          payload = ticket.getPayload();
        } catch (err: any) {
          console.error("[GoogleLogin] Token verification failed:", err);
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Failed to verify Google token",
          });
        }

        if (!payload || !payload.sub) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid Google token payload",
          });
        }

        let openId = `google_${payload.sub}`;
        const existingUserByOpenId = await db.getUserByOpenId(openId);

        if (existingUserByOpenId) {
          await db.upsertUser({
            openId,
            name: payload.name || existingUserByOpenId.name || null,
            email: payload.email ?? existingUserByOpenId.email ?? null,
            avatarUrl:
              payload.picture || existingUserByOpenId.avatarUrl || null,
            loginMethod: "google",
            lastSignedIn: new Date(),
          });
        } else if (payload.email) {
          const existingUserByEmail = await db.getUserByEmail(payload.email);
          if (existingUserByEmail) {
            openId = existingUserByEmail.openId;
            await db.upsertUser({
              openId,
              name: payload.name || existingUserByEmail.name || null,
              avatarUrl:
                payload.picture || existingUserByEmail.avatarUrl || null,
              lastSignedIn: new Date(),
            });
          } else {
            await db.upsertUser({
              openId,
              name: payload.name || null,
              email: payload.email ?? null,
              avatarUrl: payload.picture || null,
              loginMethod: "google",
              lastSignedIn: new Date(),
            });
          }
        } else {
          await db.upsertUser({
            openId,
            name: payload.name || null,
            email: payload.email ?? null,
            avatarUrl: payload.picture || null,
            loginMethod: "google",
            lastSignedIn: new Date(),
          });
        }

        await createSessionAndSetCookie(ctx, openId, payload.name || "");

        return { success: true } as const;
      }),
  }),
  products: productsRouter,
  brands: brandsRouter,
  categories: categoriesRouter,
  cart: cartRouter,
  orders: ordersRouter,
  wishlist: wishlistRouter,
  locations: locationsRouter,
  blog: blogRouter,
  faq: faqRouter,
  contact: contactRouter,
  admin: adminRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
