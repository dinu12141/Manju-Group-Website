import "dotenv/config";
import express from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
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
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
