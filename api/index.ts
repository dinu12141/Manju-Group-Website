import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { registerGoogleOAuthRoutes } from "../server/_core/googleAuth";
import { registerStorageProxy } from "../server/_core/storageProxy";

const app = express();

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

// tRPC API Handler (Support both /api/trpc and /trpc)
app.use(
  ["/api/trpc", "/trpc"],
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

export default app;
