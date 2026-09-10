import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from "../../shared/const";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

import { resetDb } from "../db";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

const dbRetryMiddleware = t.middleware(async opts => {
  const executeWithTimeout = async () => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("DB query timeout")), 15000);
    });
    
    // Prevent unhandled promise rejection crash if timeoutPromise wins the race
    // and this promise rejects later in the background.
    const nextPromise = opts.next();
    nextPromise.catch(() => {}); 
    
    try {
      return await Promise.race([nextPromise, timeoutPromise]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  };

  let attempt = 0;
  while (true) {
    try {
      return await executeWithTimeout();
    } catch (err: any) {
      attempt++;
      // Stringify the entire error object (including nested causes) to safely
      // detect connection drops, even if wrapped by Drizzle or tRPC multiple times.
      const errString = err && typeof err === 'object' 
        ? (err.stack || '') + ' ' + (err.message || '') + ' ' + (err.cause?.stack || '') + ' ' + (err.cause?.cause?.stack || '')
        : String(err);
        
      const isConnErr = 
        errString.includes("CONNECTION_DESTROYED") ||
        errString.includes("ECONNRESET") ||
        errString.includes("Connection terminated") ||
        errString.includes("socket") ||
        errString.includes("closed") ||
        errString.includes("DB query timeout") ||
        errString.includes("read ECONNRESET") ||
        errString.includes("Database not available") ||
        errString.includes("canceling statement due to statement timeout");

      if (isConnErr && attempt <= 2) {
        console.warn(`[tRPC] DB connection error in ${opts.path} (attempt ${attempt}). Resetting pool and retrying...`);
        await resetDb();
        // Exponential backoff: 500ms, then 1000ms
        await new Promise(resolve => setTimeout(resolve, 500 * attempt));
        continue;
      }
      throw err;
    }
  }
});

export const router = t.router;
export const publicProcedure = t.procedure.use(dbRetryMiddleware);

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = publicProcedure.use(requireUser);

export const adminProcedure = publicProcedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    const isAdminUser = !!ctx.user && ctx.user.role === "admin";

    if (!isAdminUser && !ctx.isAdminByPasscode) {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({ ctx });
  })
);
