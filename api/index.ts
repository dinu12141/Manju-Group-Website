// Force Vercel nft to trace all backend dependencies
// (nft fails to trace TypeScript files with "type": "module" if imports are stripped by esbuild)
export * as _zod from "zod";
export * as _bcryptjs from "bcryptjs";
export * as _nanoid from "nanoid";
export * as _googleauth from "google-auth-library";
export * as _drizzle1 from "drizzle-orm/mysql2";
export * as _drizzle2 from "drizzle-orm/mysql-core";
export * as _drizzle3 from "drizzle-orm";
export * as _mysql1 from "mysql2/promise";
export * as _mysql2 from "mysql2";
export * as _jose from "jose";
export * as _aws1 from "@aws-sdk/client-s3";
export * as _aws2 from "@aws-sdk/s3-request-presigner";
export * as _axios from "axios";
export * as _cookie from "cookie";
export * as _trpc from "@trpc/server";

import "dotenv/config";
import { validateEnv } from "../server/_core/env";
try {
  validateEnv();
} catch (e) {
  console.error("Environment Validation Failed:", e);
}

import express from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers/index";
import { createContext } from "../server/_core/context";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { registerGoogleOAuthRoutes } from "../server/_core/googleAuth";
import { registerStorageProxy } from "../server/_core/storageProxy";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Health Check
app.get(["/", "/api", "/api/health"], (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Register routes
registerStorageProxy(app);
registerOAuthRoutes(app);
registerGoogleOAuthRoutes(app);

// Normalize path so /api/trpc, /trpc, and Vercel serverless rewrites are all handled cleanly
app.use((req, res, next) => {
  if (req.url.startsWith("/trpc")) {
    req.url = `/api${req.url}`;
  }
  next();
});

// tRPC API Handler (Support /api/trpc, /trpc, and serverless rewrites)
app.use(
  ["/api/trpc", "/trpc"],
  createExpressMiddleware({
    router: appRouter,
    createContext,
    onError({ error, path }) {
      console.error(`[tRPC Error on ${path}]:`, error);
    },
  })
);

// Fallback JSON error handler — ensure server never returns raw HTML on errors
app.use((err, req, res, next) => {
  console.error("[API Error Handler]", err);
  if (res.headersSent) return next(err);
  res.status(err?.status || 500).json({
    error: {
      message: err?.message || "Internal Server Error",
      code: "INTERNAL_SERVER_ERROR",
    },
  });
});

export default app;
