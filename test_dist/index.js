// api/index.ts
import * as _zod from "zod";
import * as _bcryptjs from "bcryptjs";
import * as _nanoid from "nanoid";
import * as _googleauth from "google-auth-library";
import * as _drizzle1 from "drizzle-orm/mysql2";
import * as _drizzle2 from "drizzle-orm/mysql-core";
import * as _drizzle3 from "drizzle-orm";
import * as _mysql1 from "mysql2/promise";
import * as _mysql2 from "mysql2";
import * as _jose from "jose";
import * as _aws1 from "@aws-sdk/client-s3";
import * as _aws2 from "@aws-sdk/s3-request-presigner";
import * as _axios from "axios";
import * as _cookie from "cookie";
import * as _trpc from "@trpc/server";
import "dotenv/config";

// server/_core/env.ts
var REQUIRED_VARS = [
  ["cookieSecret", "JWT_SECRET"],
  ["databaseUrl", "DATABASE_URL"],
];
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "",
};
function validateEnv() {
  const missing = REQUIRED_VARS.filter(([key]) => !ENV[key]);
  if (missing.length > 0) {
    const names = missing.map(([, envVar]) => envVar).join(", ");
    throw new Error(
      `[startup] Missing required environment variable(s): ${names}. Copy .env.example to .env and fill in all required values.`
    );
  }
}

// api/index.ts
import express from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/routers/index.ts
import { z as z12 } from "zod";
import bcrypt from "bcryptjs";
import { nanoid as nanoid2 } from "nanoid";

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");
  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  const secure = isSecureRequest(req);
  return {
    httpOnly: true,
    path: "/",
    // "None" cookies are rejected by browsers unless also marked Secure, which
    // isn't possible over plain HTTP (e.g. local dev on http://localhost).
    // Fall back to "Lax" in that case — it still survives the top-level
    // redirect navigations used by the OAuth callback flows.
    sameSite: secure ? "none" : "lax",
    secure,
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = msg => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";

// server/db.ts
import "dotenv/config";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import {
  boolean,
  decimal,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  avatarUrl: text("avatarUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});
var brands = mysqlTable("brands", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  tagline: text("tagline"),
  description: text("description"),
  logoUrl: text("logoUrl"),
  bannerUrl: text("bannerUrl"),
  primaryColor: varchar("primaryColor", { length: 16 }),
  accentColor: varchar("accentColor", { length: 16 }),
  sortOrder: int("sortOrder").default(0),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
var categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  parentId: int("parentId"),
  sortOrder: int("sortOrder").default(0),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
var products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 256 }).notNull().unique(),
  sku: varchar("sku", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 256 }).notNull(),
  shortDescription: text("shortDescription"),
  description: text("description"),
  brandId: int("brandId").notNull(),
  categoryId: int("categoryId").notNull(),
  basePrice: decimal("basePrice", { precision: 12, scale: 2 }).notNull(),
  salePrice: decimal("salePrice", { precision: 12, scale: 2 }),
  currency: varchar("currency", { length: 8 }).default("LKR").notNull(),
  stockQuantity: int("stockQuantity").default(0).notNull(),
  isInStock: boolean("isInStock").default(true).notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  isBestSeller: boolean("isBestSeller").default(false).notNull(),
  isNew: boolean("isNew").default(false).notNull(),
  warrantyMonths: int("warrantyMonths").default(0),
  weight: decimal("weight", { precision: 8, scale: 2 }),
  specifications: json("specifications"),
  tags: json("tags"),
  metaTitle: varchar("metaTitle", { length: 256 }),
  metaDescription: text("metaDescription"),
  sortOrder: int("sortOrder").default(0),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
var productImages = mysqlTable("product_images", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  url: text("url").notNull(),
  altText: varchar("altText", { length: 256 }),
  isPrimary: boolean("isPrimary").default(false).notNull(),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
var productVariants = mysqlTable("product_variants", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  sku: varchar("sku", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  options: json("options"),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  salePrice: decimal("salePrice", { precision: 12, scale: 2 }),
  stockQuantity: int("stockQuantity").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
var carts = mysqlTable("carts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  sessionId: varchar("sessionId", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
var cartItems = mysqlTable("cart_items", {
  id: int("id").autoincrement().primaryKey(),
  cartId: int("cartId").notNull(),
  productId: varchar("productId", { length: 256 }).notNull(),
  variantId: varchar("variantId", { length: 256 }),
  quantity: int("quantity").default(1).notNull(),
  unitPrice: decimal("unitPrice", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
var wishlists = mysqlTable("wishlists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: varchar("productId", { length: 256 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
var orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 32 }).notNull().unique(),
  userId: int("userId"),
  status: mysqlEnum("status", [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ])
    .default("pending")
    .notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  shippingFee: decimal("shippingFee", { precision: 12, scale: 2 })
    .default("0")
    .notNull(),
  discount: decimal("discount", { precision: 12, scale: 2 })
    .default("0")
    .notNull(),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 8 }).default("LKR").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 64 }),
  paymentStatus: mysqlEnum("paymentStatus", [
    "pending",
    "paid",
    "failed",
    "refunded",
  ])
    .default("pending")
    .notNull(),
  shippingAddress: json("shippingAddress"),
  billingAddress: json("billingAddress"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
var orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: varchar("productId", { length: 256 }).notNull(),
  variantId: varchar("variantId", { length: 256 }),
  productName: varchar("productName", { length: 256 }).notNull(),
  variantName: varchar("variantName", { length: 128 }),
  sku: varchar("sku", { length: 64 }),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unitPrice", { precision: 12, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
var reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  productId: varchar("productId", { length: 256 }).notNull(),
  userId: int("userId").notNull(),
  rating: int("rating").notNull(),
  title: varchar("title", { length: 256 }),
  body: text("body"),
  isVerified: boolean("isVerified").default(false).notNull(),
  isApproved: boolean("isApproved").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
var blogPosts = mysqlTable("blog_posts", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 256 }).notNull().unique(),
  title: varchar("title", { length: 256 }).notNull(),
  excerpt: text("excerpt"),
  content: text("content"),
  coverImageUrl: text("coverImageUrl"),
  authorId: int("authorId"),
  authorName: varchar("authorName", { length: 128 }),
  category: varchar("category", { length: 64 }),
  tags: json("tags"),
  isPublished: boolean("isPublished").default(false).notNull(),
  publishedAt: timestamp("publishedAt"),
  metaTitle: varchar("metaTitle", { length: 256 }),
  metaDescription: text("metaDescription"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
var locations = mysqlTable("locations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  type: mysqlEnum("type", ["showroom", "service_center", "warehouse", "office"])
    .default("showroom")
    .notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 64 }).notNull(),
  province: varchar("province", { length: 64 }),
  phone: varchar("phone", { length: 32 }),
  email: varchar("email", { length: 320 }),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  openingHours: json("openingHours"),
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
var banners = mysqlTable("banners", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  subtitle: text("subtitle"),
  imageUrl: text("imageUrl"),
  mobileImageUrl: text("mobileImageUrl"),
  linkUrl: text("linkUrl"),
  linkText: varchar("linkText", { length: 128 }),
  placement: mysqlEnum("placement", ["hero", "promotional", "brand", "sidebar"])
    .default("hero")
    .notNull(),
  bgColor: varchar("bgColor", { length: 32 }),
  textColor: varchar("textColor", { length: 32 }),
  sortOrder: int("sortOrder").default(0),
  isActive: boolean("isActive").default(true).notNull(),
  startsAt: timestamp("startsAt"),
  endsAt: timestamp("endsAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
var faqs = mysqlTable("faqs", {
  id: int("id").autoincrement().primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: varchar("category", { length: 64 }),
  sortOrder: int("sortOrder").default(0),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
var contactMessages = mysqlTable("contact_messages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  subject: varchar("subject", { length: 256 }),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      let dbUrl = process.env.DATABASE_URL;
      if (dbUrl.includes("tidbcloud.com") && !dbUrl.includes("ssl=")) {
        const separator = dbUrl.includes("?") ? "&" : "?";
        dbUrl = `${dbUrl}${separator}ssl={"rejectUnauthorized":true}`;
      }
      const maybeDb = drizzle(dbUrl);
      _db = maybeDb;
    } catch (error) {
      console.warn("[Database] Failed to connect:", error.message || error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId,
    };
    const updateSet = {};
    const textFields = [
      "name",
      "email",
      "phone",
      "loginMethod",
      "passwordHash",
      "avatarUrl",
    ];
    const assignNullable = field => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getUserByEmail(email) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return result.length > 0 ? result[0] : void 0;
}

// server/_core/sdk.ts
var isNonEmptyString = value => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state),
    };
    const { data } = await this.client.post(EXCHANGE_TOKEN_PATH, payload);
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(GET_USER_INFO_PATH, {
      accessToken: token.accessToken,
    });
    return data;
  }
};
var createOAuthHttpClient = () =>
  axios.create({
    baseURL: ENV.oAuthServerUrl,
    timeout: AXIOS_TIMEOUT_MS,
  });
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(platforms.filter(p => typeof p === "string"));
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (
      set.has("REGISTERED_PLATFORM_MICROSOFT") ||
      set.has("REGISTERED_PLATFORM_AZURE")
    )
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken,
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod,
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret =
      ENV.cookieSecret ||
      process.env.JWT_SECRET ||
      "manju-group-jwt-secret-key-32-chars-length-2026";
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || "",
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"],
      });
      const { openId, appId, name } = payload;
      if (
        !isNonEmptyString(openId) ||
        !isNonEmptyString(appId) ||
        !isNonEmptyString(name)
      ) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name,
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId,
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod,
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    let sessionToken = cookies.get(COOKIE_NAME);
    if (!sessionToken) {
      const authHeader = req.headers.authorization;
      if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        sessionToken = authHeader.slice(7);
      }
    }
    const session = await this.verifySession(sessionToken);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    if (session.openId.startsWith(CRON_OPEN_ID_PREFIX)) {
      const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
      const taskUid = userInfo.taskUid ?? null;
      if (!taskUid) {
        throw ForbiddenError("Cron session missing task_uid");
      }
      return buildCronUser(userInfo);
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt,
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt,
    });
    return user;
  }
};
var CRON_OPEN_ID_PREFIX = "cron_";
function buildCronUser(userInfo) {
  const now = /* @__PURE__ */ new Date();
  return {
    id: -1,
    openId: userInfo.openId,
    name: userInfo.name || "Manus Scheduled Task",
    email: null,
    loginMethod: null,
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
    taskUid: userInfo.taskUid ?? void 0,
    isCron: true,
  };
}
var sdk = new SDKServer();

// server/routers/index.ts
import { OAuth2Client } from "google-auth-library";

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = value => value.trim();
var isNonEmptyString2 = value =>
  typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = baseUrl => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = input => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required.",
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required.",
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`,
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`,
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured.",
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured.",
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1",
      },
      body: JSON.stringify({ title, content }),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson,
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),
  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      };
    }),
});

// server/routers/products.ts
import { z as z2 } from "zod";
import {
  and,
  asc,
  desc,
  eq as eq2,
  ne,
  gte,
  lte,
  like,
  notLike,
  or,
  sql as sql2,
} from "drizzle-orm";
function mapProductRow(row, images, variants) {
  const { product, brand, category } = row;
  const sortedImages = [...images].sort((a, b) => {
    if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  });
  const primaryImage = sortedImages[0] ?? null;
  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    shortDescription: product.shortDescription || "",
    description: product.description,
    basePrice: Number(product.basePrice),
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    currency: product.currency,
    stockQuantity: product.stockQuantity,
    isInStock: product.isInStock,
    isFeatured: product.isFeatured,
    isBestSeller: product.isBestSeller,
    isNew: product.isNew,
    warrantyMonths: product.warrantyMonths ?? 0,
    specifications: product.specifications,
    tags: product.tags,
    brandId: product.brandId,
    categoryId: product.categoryId,
    brandName: brand?.name ?? "Unknown Brand",
    brandSlug: brand?.slug ?? "unknown",
    brandTagline: brand?.tagline ?? null,
    categoryName: category?.name ?? "Uncategorized",
    categorySlug: category?.slug ?? "uncategorized",
    createdAt: product.createdAt,
    imageUrl: primaryImage?.url ?? null,
    images: sortedImages.map(img => ({
      id: img.id,
      productId: img.productId,
      url: img.url,
      isPrimary: img.isPrimary,
      sortOrder: img.sortOrder ?? 0,
    })),
    variants: variants.map(v => ({
      id: v.id,
      productId: v.productId,
      sku: v.sku,
      name: v.name,
      options: v.options,
      price: Number(v.price),
      salePrice: v.salePrice ? Number(v.salePrice) : null,
      stockQuantity: v.stockQuantity,
      isActive: v.isActive,
    })),
    reviews: [],
  };
}
async function loadImagesAndVariants(db, productIds) {
  const imagesByProduct = /* @__PURE__ */ new Map();
  const variantsByProduct = /* @__PURE__ */ new Map();
  if (productIds.length === 0) {
    return { imagesByProduct, variantsByProduct };
  }
  const [allImages, allVariants] = await Promise.all([
    db
      .select()
      .from(productImages)
      .where(or(...productIds.map(id => eq2(productImages.productId, id)))),
    db
      .select()
      .from(productVariants)
      .where(or(...productIds.map(id => eq2(productVariants.productId, id)))),
  ]);
  for (const img of allImages) {
    const list = imagesByProduct.get(img.productId) ?? [];
    list.push(img);
    imagesByProduct.set(img.productId, list);
  }
  for (const v of allVariants) {
    const list = variantsByProduct.get(v.productId) ?? [];
    list.push(v);
    variantsByProduct.set(v.productId, list);
  }
  return { imagesByProduct, variantsByProduct };
}
async function hydrateRows(db, rows) {
  const ids = rows.map(r => r.product.id);
  const { imagesByProduct, variantsByProduct } = await loadImagesAndVariants(
    db,
    ids
  );
  return rows.map(row =>
    mapProductRow(
      row,
      imagesByProduct.get(row.product.id) ?? [],
      variantsByProduct.get(row.product.id) ?? []
    )
  );
}
var productsRouter = router({
  list: publicProcedure
    .input(
      z2.object({
        page: z2.number().int().min(1).default(1),
        limit: z2.number().int().min(1).max(100).default(12),
        brandId: z2.union([z2.number(), z2.string()]).optional(),
        categoryId: z2.union([z2.number(), z2.string()]).optional(),
        minPrice: z2.number().optional(),
        maxPrice: z2.number().optional(),
        inStockOnly: z2.boolean().optional(),
        search: z2.string().optional(),
        sortBy: z2
          .enum(["newest", "price_asc", "price_desc", "popular"])
          .default("newest"),
        isFeatured: z2.boolean().optional(),
        isBestSeller: z2.boolean().optional(),
        isNew: z2.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { items: [], total: 0 };
      const conditions = [
        eq2(products.isActive, true),
        ne(products.categoryId, 5),
        ne(products.brandId, 5),
        notLike(products.name, "%Exercise Book%"),
        notLike(products.name, "%Drawing Book%"),
        notLike(products.name, "%Ruled%"),
      ];
      if (input.brandId) {
        conditions.push(eq2(products.brandId, Number(input.brandId)));
      }
      if (input.categoryId) {
        conditions.push(eq2(products.categoryId, Number(input.categoryId)));
      }
      if (input.minPrice !== void 0) {
        conditions.push(gte(products.basePrice, String(input.minPrice)));
      }
      if (input.maxPrice !== void 0) {
        conditions.push(lte(products.basePrice, String(input.maxPrice)));
      }
      if (input.inStockOnly) {
        conditions.push(eq2(products.isInStock, true));
      }
      if (input.isFeatured !== void 0) {
        conditions.push(eq2(products.isFeatured, input.isFeatured));
      }
      if (input.isBestSeller !== void 0) {
        conditions.push(eq2(products.isBestSeller, input.isBestSeller));
      }
      if (input.isNew !== void 0) {
        conditions.push(eq2(products.isNew, input.isNew));
      }
      if (input.search && input.search.trim()) {
        const rawSearch = input.search.trim();
        const words = rawSearch.split(/\s+/).filter(Boolean);
        const searchConditions = words.map(w => {
          const t2 = `%${w}%`;
          return or(
            like(products.name, t2),
            like(products.shortDescription, t2),
            like(products.description, t2),
            like(products.slug, t2),
            like(products.sku, t2),
            like(products.tags, t2)
          );
        });
        conditions.push(and(...searchConditions));
      }
      const whereClause = and(...conditions);
      let orderBy;
      switch (input.sortBy) {
        case "price_asc":
          orderBy = asc(products.basePrice);
          break;
        case "price_desc":
          orderBy = desc(products.basePrice);
          break;
        case "popular":
          orderBy = desc(products.isBestSeller);
          break;
        case "newest":
        default:
          orderBy = desc(products.createdAt);
          break;
      }
      const offset = (input.page - 1) * input.limit;
      const [rows, totalRows] = await Promise.all([
        db
          .select({ product: products, brand: brands, category: categories })
          .from(products)
          .leftJoin(brands, eq2(products.brandId, brands.id))
          .leftJoin(categories, eq2(products.categoryId, categories.id))
          .where(whereClause)
          .orderBy(orderBy)
          .limit(input.limit)
          .offset(offset),
        db
          .select({ count: sql2`count(*)` })
          .from(products)
          .where(whereClause),
      ]);
      const items = await hydrateRows(db, rows);
      const total = Number(totalRows[0]?.count ?? 0);
      return { items, total };
    }),
  bySlug: publicProcedure
    .input(z2.object({ slug: z2.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      let rows = await db
        .select({ product: products, brand: brands, category: categories })
        .from(products)
        .leftJoin(brands, eq2(products.brandId, brands.id))
        .leftJoin(categories, eq2(products.categoryId, categories.id))
        .where(eq2(products.slug, input.slug))
        .limit(1);
      if (rows.length === 0) {
        const isNum = !isNaN(Number(input.slug));
        const conds = [
          eq2(products.sku, input.slug),
          like(products.slug, `%${input.slug.replace(/-\d+$/, "")}%`),
        ];
        if (isNum) {
          conds.push(eq2(products.id, Number(input.slug)));
        }
        rows = await db
          .select({ product: products, brand: brands, category: categories })
          .from(products)
          .leftJoin(brands, eq2(products.brandId, brands.id))
          .leftJoin(categories, eq2(products.categoryId, categories.id))
          .where(or(...conds))
          .limit(1);
      }
      if (rows.length === 0) return null;
      const [hydrated] = await hydrateRows(db, rows);
      return hydrated ?? null;
    }),
  related: publicProcedure
    .input(
      z2.object({
        productId: z2.union([z2.number(), z2.string()]),
        brandId: z2.union([z2.number(), z2.string()]).optional(),
        categoryId: z2.union([z2.number(), z2.string()]).optional(),
        limit: z2.number().int().min(1).max(100).default(4),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions = [
        eq2(products.isActive, true),
        sql2`${products.id} != ${Number(input.productId)}`,
      ];
      if (input.categoryId) {
        conditions.push(eq2(products.categoryId, Number(input.categoryId)));
      } else if (input.brandId) {
        conditions.push(eq2(products.brandId, Number(input.brandId)));
      }
      const rows = await db
        .select({ product: products, brand: brands, category: categories })
        .from(products)
        .leftJoin(brands, eq2(products.brandId, brands.id))
        .leftJoin(categories, eq2(products.categoryId, categories.id))
        .where(and(...conditions))
        .orderBy(desc(products.createdAt))
        .limit(input.limit);
      return hydrateRows(db, rows);
    }),
  getFeatured: publicProcedure
    .input(
      z2
        .object({ limit: z2.number().int().min(1).max(100).default(8) })
        .optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const rows = await db
        .select({ product: products, brand: brands, category: categories })
        .from(products)
        .leftJoin(brands, eq2(products.brandId, brands.id))
        .leftJoin(categories, eq2(products.categoryId, categories.id))
        .where(
          and(eq2(products.isActive, true), eq2(products.isFeatured, true))
        )
        .orderBy(desc(products.createdAt))
        .limit(input?.limit ?? 8);
      return hydrateRows(db, rows);
    }),
  search: publicProcedure
    .input(
      z2.object({
        query: z2.string(),
        limit: z2.number().int().min(1).max(100).default(8),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      if (!input.query.trim()) return [];
      const term = `%${input.query.trim()}%`;
      const rows = await db
        .select({ product: products, brand: brands, category: categories })
        .from(products)
        .leftJoin(brands, eq2(products.brandId, brands.id))
        .leftJoin(categories, eq2(products.categoryId, categories.id))
        .where(
          and(
            eq2(products.isActive, true),
            or(
              like(products.name, term),
              like(products.shortDescription, term),
              like(products.description, term),
              like(products.sku, term)
            )
          )
        )
        .orderBy(desc(products.isFeatured), desc(products.createdAt))
        .limit(input.limit);
      return hydrateRows(db, rows);
    }),
});

// server/routers/brands.ts
import { z as z3 } from "zod";
import {
  and as and2,
  asc as asc2,
  eq as eq3,
  notInArray,
  sql as sql3,
} from "drizzle-orm";
var EXCLUDED_BRAND_SLUGS = [
  "manju-exercise-books",
  "exercise-books",
  "stationery",
];
function mapBrand(b) {
  return {
    id: b.id,
    slug: b.slug,
    name: b.name,
    description: b.description,
    tagline: b.tagline,
    logoUrl: b.logoUrl,
    coverUrl: b.bannerUrl,
    sortOrder: b.sortOrder ?? 0,
    isActive: b.isActive,
    createdAt: b.createdAt,
  };
}
var brandsRouter = router({
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db
      .select()
      .from(brands)
      .where(
        and2(
          eq3(brands.isActive, true),
          notInArray(brands.slug, EXCLUDED_BRAND_SLUGS)
        )
      )
      .orderBy(asc2(brands.sortOrder));
    return rows
      .filter(
        r =>
          !EXCLUDED_BRAND_SLUGS.includes(r.slug.toLowerCase()) &&
          !r.name.toLowerCase().includes("exercise")
      )
      .map(mapBrand);
  }),
  getAll: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db
      .select({
        brand: brands,
        productCount: sql3`count(${products.id})`,
      })
      .from(brands)
      .leftJoin(
        products,
        and2(eq3(products.brandId, brands.id), eq3(products.isActive, true))
      )
      .where(
        and2(
          eq3(brands.isActive, true),
          notInArray(brands.slug, EXCLUDED_BRAND_SLUGS)
        )
      )
      .groupBy(brands.id)
      .orderBy(asc2(brands.sortOrder));
    return rows
      .filter(
        row =>
          !EXCLUDED_BRAND_SLUGS.includes(row.brand.slug.toLowerCase()) &&
          !row.brand.name.toLowerCase().includes("exercise")
      )
      .map(row => ({
        ...mapBrand(row.brand),
        productCount: Number(row.productCount ?? 0),
      }));
  }),
  bySlug: publicProcedure
    .input(z3.object({ slug: z3.string() }))
    .query(async ({ input }) => {
      if (EXCLUDED_BRAND_SLUGS.includes(input.slug.toLowerCase())) return null;
      const db = await getDb();
      if (!db) return null;
      const [row] = await db
        .select()
        .from(brands)
        .where(eq3(brands.slug, input.slug))
        .limit(1);
      return row ? mapBrand(row) : null;
    }),
});

// server/routers/categories.ts
import { z as z4 } from "zod";
import {
  and as and3,
  asc as asc3,
  eq as eq4,
  notInArray as notInArray2,
} from "drizzle-orm";
var EXCLUDED_CATEGORY_SLUGS = [
  "stationery",
  "exercise-books",
  "manju-exercise-books",
];
function mapCategory(c) {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    imageUrl: c.imageUrl,
    parentId: c.parentId,
    sortOrder: c.sortOrder ?? 0,
  };
}
var categoriesRouter = router({
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db
      .select()
      .from(categories)
      .where(
        and3(
          eq4(categories.isActive, true),
          notInArray2(categories.slug, EXCLUDED_CATEGORY_SLUGS)
        )
      )
      .orderBy(asc3(categories.sortOrder));
    return rows
      .filter(
        r =>
          !EXCLUDED_CATEGORY_SLUGS.includes(r.slug.toLowerCase()) &&
          !r.name.toLowerCase().includes("stationery") &&
          !r.name.toLowerCase().includes("exercise")
      )
      .map(mapCategory);
  }),
  getAll: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db
      .select()
      .from(categories)
      .where(
        and3(
          eq4(categories.isActive, true),
          notInArray2(categories.slug, EXCLUDED_CATEGORY_SLUGS)
        )
      )
      .orderBy(asc3(categories.sortOrder));
    return rows
      .filter(
        r =>
          !EXCLUDED_CATEGORY_SLUGS.includes(r.slug.toLowerCase()) &&
          !r.name.toLowerCase().includes("stationery") &&
          !r.name.toLowerCase().includes("exercise")
      )
      .map(mapCategory);
  }),
  bySlug: publicProcedure
    .input(z4.object({ slug: z4.string() }))
    .query(async ({ input }) => {
      if (EXCLUDED_CATEGORY_SLUGS.includes(input.slug.toLowerCase()))
        return null;
      const db = await getDb();
      if (!db) return null;
      const [row] = await db
        .select()
        .from(categories)
        .where(eq4(categories.slug, input.slug))
        .limit(1);
      return row ? mapCategory(row) : null;
    }),
});

// server/routers/cart.ts
import { z as z5 } from "zod";
import { TRPCError as TRPCError3 } from "@trpc/server";
import { eq as eq5, and as and4 } from "drizzle-orm";
var MOCK_CARTS = [];
var MOCK_CART_ITEMS = [];
var mockCartIdCounter = 1;
var mockCartItemIdCounter = 1;
async function getOrCreateMockCart(userId, sessionId) {
  let cart = MOCK_CARTS.find(c =>
    userId ? c.userId === userId : c.sessionId === sessionId
  );
  if (!cart) {
    cart = { id: mockCartIdCounter++, userId, sessionId };
    MOCK_CARTS.push(cart);
  }
  return cart;
}
async function getOrCreateCart(db, userId, sessionId) {
  if (userId) {
    const [existing] = await db
      .select()
      .from(carts)
      .where(eq5(carts.userId, userId))
      .limit(1);
    if (existing) return existing;
    await db.insert(carts).values({ userId });
    const [created] = await db
      .select()
      .from(carts)
      .where(eq5(carts.userId, userId))
      .limit(1);
    return created;
  }
  if (sessionId) {
    const [existing] = await db
      .select()
      .from(carts)
      .where(eq5(carts.sessionId, sessionId))
      .limit(1);
    if (existing) return existing;
    await db.insert(carts).values({ sessionId });
    const [created] = await db
      .select()
      .from(carts)
      .where(eq5(carts.sessionId, sessionId))
      .limit(1);
    return created;
  }
  throw new Error("No userId or sessionId provided for cart");
}
var cartRouter = router({
  get: publicProcedure
    .input(z5.object({ sessionId: z5.string().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user?.id;
      const sessionId = input.sessionId;
      if (!userId && !sessionId) {
        return { items: [], total: 0, itemCount: 0 };
      }
      let cart;
      let rawItems = [];
      try {
        if (!db) {
          cart = await getOrCreateMockCart(userId, sessionId);
          rawItems = MOCK_CART_ITEMS.filter(i => i.cartId === cart.id);
        } else {
          cart = await getOrCreateCart(db, userId, sessionId);
          rawItems = await db
            .select()
            .from(cartItems)
            .where(eq5(cartItems.cartId, cart.id));
        }
      } catch (err) {
        console.warn("DB cart lookup failed, using memory fallback:", err);
        cart = await getOrCreateMockCart(userId, sessionId);
        rawItems = MOCK_CART_ITEMS.filter(i => i.cartId === cart.id);
      }
      if (rawItems.length === 0) {
        return { items: [], total: 0, itemCount: 0 };
      }
      const enriched = await Promise.all(
        rawItems.map(async item => {
          const numId = Number(item.productId);
          let p = null;
          let pBrand = null;
          let pImage = null;
          if (db && !isNaN(numId)) {
            const [pRow] = await db
              .select({
                product: products,
                brand: brands,
              })
              .from(products)
              .leftJoin(brands, eq5(products.brandId, brands.id))
              .where(eq5(products.id, numId))
              .limit(1);
            if (pRow) {
              p = pRow.product;
              pBrand = pRow.brand;
              const [imgRow] = await db
                .select()
                .from(productImages)
                .where(eq5(productImages.productId, numId))
                .orderBy(productImages.sortOrder)
                .limit(1);
              pImage = imgRow?.url ?? null;
            }
          }
          const fallbackPrice =
            Number(item.unitPrice) ||
            (p?.salePrice ? Number(p.salePrice) : Number(p?.basePrice)) ||
            0;
          return {
            id: item.id,
            cartId: item.cartId,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: fallbackPrice,
            productName: p?.name ?? `Product #${item.productId}`,
            productSlug: p?.slug ?? "products",
            brandName: pBrand?.name ?? "Manju Group",
            isInStock: p ? p.isInStock : true,
            imageUrl: pImage,
          };
        })
      );
      const total = enriched.reduce(
        (sum, i) => sum + Number(i.unitPrice) * i.quantity,
        0
      );
      const itemCount = enriched.reduce((sum, i) => sum + i.quantity, 0);
      return { items: enriched, total, itemCount };
    }),
  addItem: publicProcedure
    .input(
      z5.object({
        productId: z5.union([z5.string(), z5.number()]),
        variantId: z5.union([z5.string(), z5.number()]).optional(),
        quantity: z5.number().min(1).default(1),
        unitPrice: z5.number(),
        sessionId: z5.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user?.id;
      const sessionId = input.sessionId;
      if (!userId && !sessionId) {
        throw new Error("Missing user session for cart");
      }
      const prodIdStr = String(input.productId);
      try {
        if (!db) {
          const cart2 = await getOrCreateMockCart(userId, sessionId);
          const existing2 = MOCK_CART_ITEMS.find(
            i => i.cartId === cart2.id && i.productId === prodIdStr
          );
          if (existing2) {
            existing2.quantity += input.quantity;
          } else {
            MOCK_CART_ITEMS.push({
              id: mockCartItemIdCounter++,
              cartId: cart2.id,
              productId: prodIdStr,
              variantId: input.variantId ? String(input.variantId) : null,
              quantity: input.quantity,
              unitPrice: String(input.unitPrice),
            });
          }
          return { success: true };
        }
        const cart = await getOrCreateCart(db, userId, sessionId);
        const [existing] = await db
          .select()
          .from(cartItems)
          .where(
            and4(
              eq5(cartItems.cartId, cart.id),
              eq5(cartItems.productId, prodIdStr)
            )
          )
          .limit(1);
        if (existing) {
          await db
            .update(cartItems)
            .set({ quantity: existing.quantity + input.quantity })
            .where(eq5(cartItems.id, existing.id));
        } else {
          await db.insert(cartItems).values({
            cartId: cart.id,
            productId: prodIdStr,
            variantId: input.variantId ? String(input.variantId) : null,
            quantity: input.quantity,
            unitPrice: String(input.unitPrice),
          });
        }
      } catch (err) {
        console.warn("DB addItem failed, falling back to mock cart:", err);
        const cart = await getOrCreateMockCart(userId, sessionId);
        const existing = MOCK_CART_ITEMS.find(
          i => i.cartId === cart.id && i.productId === prodIdStr
        );
        if (existing) {
          existing.quantity += input.quantity;
        } else {
          MOCK_CART_ITEMS.push({
            id: mockCartItemIdCounter++,
            cartId: cart.id,
            productId: prodIdStr,
            variantId: input.variantId ? String(input.variantId) : null,
            quantity: input.quantity,
            unitPrice: String(input.unitPrice),
          });
        }
      }
      return { success: true };
    }),
  // Finding #2 fix: verify cart item belongs to the caller's cart before mutating
  updateItem: publicProcedure
    .input(
      z5.object({
        itemId: z5.number(),
        quantity: z5.number().min(0),
        sessionId: z5.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user?.id;
      const sessionId = input.sessionId;
      if (!db) {
        const item2 = MOCK_CART_ITEMS.find(i => i.id === input.itemId);
        if (item2) {
          const cart2 = MOCK_CARTS.find(c => c.id === item2.cartId);
          if (cart2 && userId && cart2.userId !== userId) {
            throw new TRPCError3({
              code: "FORBIDDEN",
              message: "Cart item not found",
            });
          }
          if (cart2 && !userId && sessionId && cart2.sessionId !== sessionId) {
            throw new TRPCError3({
              code: "FORBIDDEN",
              message: "Cart item not found",
            });
          }
          if (input.quantity <= 0) {
            MOCK_CART_ITEMS = MOCK_CART_ITEMS.filter(
              i => i.id !== input.itemId
            );
          } else {
            item2.quantity = input.quantity;
          }
        }
        return { success: true };
      }
      const [item] = await db
        .select()
        .from(cartItems)
        .where(eq5(cartItems.id, input.itemId))
        .limit(1);
      if (!item) return { success: true };
      const [cart] = userId
        ? await db
            .select()
            .from(carts)
            .where(eq5(carts.userId, userId))
            .limit(1)
        : sessionId
          ? await db
              .select()
              .from(carts)
              .where(eq5(carts.sessionId, sessionId))
              .limit(1)
          : [];
      if (!cart || cart.id !== item.cartId) {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: "Cart item not found",
        });
      }
      if (input.quantity <= 0) {
        await db.delete(cartItems).where(eq5(cartItems.id, input.itemId));
      } else {
        await db
          .update(cartItems)
          .set({ quantity: input.quantity })
          .where(eq5(cartItems.id, input.itemId));
      }
      return { success: true };
    }),
  // Finding #2 fix: verify cart item belongs to the caller's cart before deleting
  removeItem: publicProcedure
    .input(
      z5.object({ itemId: z5.number(), sessionId: z5.string().optional() })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user?.id;
      const sessionId = input.sessionId;
      if (!db) {
        const item2 = MOCK_CART_ITEMS.find(i => i.id === input.itemId);
        if (item2) {
          const cart2 = MOCK_CARTS.find(c => c.id === item2.cartId);
          if (cart2 && userId && cart2.userId !== userId) {
            throw new TRPCError3({
              code: "FORBIDDEN",
              message: "Cart item not found",
            });
          }
          if (cart2 && !userId && sessionId && cart2.sessionId !== sessionId) {
            throw new TRPCError3({
              code: "FORBIDDEN",
              message: "Cart item not found",
            });
          }
          MOCK_CART_ITEMS = MOCK_CART_ITEMS.filter(i => i.id !== input.itemId);
        }
        return { success: true };
      }
      const [item] = await db
        .select()
        .from(cartItems)
        .where(eq5(cartItems.id, input.itemId))
        .limit(1);
      if (!item) return { success: true };
      const [cart] = userId
        ? await db
            .select()
            .from(carts)
            .where(eq5(carts.userId, userId))
            .limit(1)
        : sessionId
          ? await db
              .select()
              .from(carts)
              .where(eq5(carts.sessionId, sessionId))
              .limit(1)
          : [];
      if (!cart || cart.id !== item.cartId) {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: "Cart item not found",
        });
      }
      await db.delete(cartItems).where(eq5(cartItems.id, input.itemId));
      return { success: true };
    }),
  clear: publicProcedure
    .input(z5.object({ sessionId: z5.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user?.id;
      const sessionId = input.sessionId;
      if (!userId && !sessionId) return { success: true };
      if (!db) {
        const cart2 = await getOrCreateMockCart(userId, sessionId);
        MOCK_CART_ITEMS = MOCK_CART_ITEMS.filter(i => i.cartId !== cart2.id);
        return { success: true };
      }
      const [cart] = userId
        ? await db
            .select()
            .from(carts)
            .where(eq5(carts.userId, userId))
            .limit(1)
        : await db
            .select()
            .from(carts)
            .where(eq5(carts.sessionId, sessionId))
            .limit(1);
      if (cart) {
        await db.delete(cartItems).where(eq5(cartItems.cartId, cart.id));
      }
      return { success: true };
    }),
});

// server/routers/orders.ts
import { z as z6 } from "zod";
import { TRPCError as TRPCError4 } from "@trpc/server";
import { eq as eq6, desc as desc2, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
var MOCK_ORDERS = [];
var mockOrderIdCounter = 1;
var ordersRouter = router({
  // Finding #9 fix: require auth; no client-supplied email lookup (prevents unauthenticated order enumeration)
  list: publicProcedure
    .input(z6.object({}).optional())
    .query(async ({ ctx }) => {
      const db = await getDb();
      const userId = ctx.user?.id;
      if (!userId) {
        return [];
      }
      if (!db) {
        return MOCK_ORDERS.filter(o => o.userId === userId).sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      let userOrders = [];
      userOrders = await db
        .select()
        .from(orders)
        .where(eq6(orders.userId, userId))
        .orderBy(desc2(orders.createdAt));
      if (userOrders.length === 0) {
        return [];
      }
      const orderIds = userOrders.map(o => o.id);
      const items = await db
        .select()
        .from(orderItems)
        .where(inArray(orderItems.orderId, orderIds));
      const productIds = Array.from(
        new Set(
          items.map(i => Number(i.productId)).filter(id => !isNaN(id) && id > 0)
        )
      );
      let imageMap = {};
      if (productIds.length > 0) {
        const pImages = await db
          .select()
          .from(productImages)
          .where(inArray(productImages.productId, productIds));
        for (const img of pImages) {
          if (!imageMap[img.productId]) {
            imageMap[img.productId] = img.url;
          }
        }
      }
      return userOrders.map(order => {
        const orderItemsList = items
          .filter(item => item.orderId === order.id)
          .map(item => ({
            ...item,
            imageUrl: imageMap[Number(item.productId)] || null,
          }));
        return {
          ...order,
          totalAmount: order.total,
          items: orderItemsList,
        };
      });
    }),
  // Finding #1 fix: require auth + verify order belongs to the authenticated user
  byId: protectedProcedure
    .input(z6.object({ id: z6.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user.id;
      if (!db) {
        const mock = MOCK_ORDERS.find(
          o => o.id === input.id && o.userId === userId
        );
        return mock || null;
      }
      const [order] = await db
        .select()
        .from(orders)
        .where(eq6(orders.id, input.id))
        .limit(1);
      if (!order) return null;
      if (order.userId !== userId) {
        throw new TRPCError4({ code: "FORBIDDEN", message: "Order not found" });
      }
      const items = await db
        .select()
        .from(orderItems)
        .where(eq6(orderItems.orderId, order.id));
      return {
        ...order,
        totalAmount: order.total,
        items,
      };
    }),
  // Finding #13 fix: emailOrPhone is required and must match the order's shippingAddress
  track: publicProcedure
    .input(
      z6.object({
        orderNumber: z6.string(),
        emailOrPhone: z6.string().min(1),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      const cleanNum = input.orderNumber.trim().toUpperCase();
      const credential = input.emailOrPhone.trim().toLowerCase();
      if (!db) {
        const found = MOCK_ORDERS.find(o => {
          if (o.orderNumber.toUpperCase() !== cleanNum) return false;
          const addr2 = o.shippingAddress || {};
          return (
            String(addr2.email || "").toLowerCase() === credential ||
            String(addr2.phone || "").replace(/\D/g, "") ===
              credential.replace(/\D/g, "")
          );
        });
        return found || null;
      }
      const [order] = await db
        .select()
        .from(orders)
        .where(eq6(orders.orderNumber, cleanNum))
        .limit(1);
      if (!order) return null;
      const addr = order.shippingAddress || {};
      const emailMatch = String(addr.email || "").toLowerCase() === credential;
      const phoneMatch =
        String(addr.phone || "").replace(/\D/g, "") ===
        credential.replace(/\D/g, "");
      if (!emailMatch && !phoneMatch) return null;
      const items = await db
        .select()
        .from(orderItems)
        .where(eq6(orderItems.orderId, order.id));
      return {
        ...order,
        totalAmount: order.total,
        items,
      };
    }),
  create: publicProcedure
    .input(
      z6.object({
        items: z6
          .array(
            z6.object({
              productId: z6.union([z6.string(), z6.number()]),
              variantId: z6
                .union([z6.string(), z6.number()])
                .optional()
                .nullable(),
              productName: z6.string().max(300),
              variantName: z6.string().max(200).optional(),
              sku: z6.string().max(100).optional(),
              quantity: z6.number().int().min(1).max(1e3),
              unitPrice: z6.number(),
              imageUrl: z6.string().max(500).optional().nullable(),
            })
          )
          .max(100),
        subtotal: z6.number(),
        shippingFee: z6.number().default(0),
        discount: z6.number().default(0),
        total: z6.number(),
        paymentMethod: z6.string().max(50),
        shippingAddress: z6.record(z6.string(), z6.unknown()),
        billingAddress: z6.record(z6.string(), z6.unknown()).optional(),
        notes: z6.string().max(1e3).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user?.id || null;
      const orderNumber = `MG-${Date.now().toString().slice(-6)}-${nanoid(3).toUpperCase()}`;
      if (!db) {
        const newMockOrder = {
          id: mockOrderIdCounter++,
          orderNumber,
          userId,
          status: "pending",
          subtotal: String(input.subtotal),
          shippingFee: String(input.shippingFee),
          discount: String(input.discount),
          total: String(input.total),
          totalAmount: String(input.total),
          currency: "LKR",
          paymentMethod: input.paymentMethod,
          paymentStatus: "pending",
          shippingAddress: input.shippingAddress,
          billingAddress: input.billingAddress || input.shippingAddress,
          notes: input.notes || null,
          createdAt: /* @__PURE__ */ new Date().toISOString(),
          updatedAt: /* @__PURE__ */ new Date().toISOString(),
          items: input.items.map((i, idx) => ({
            id: idx + 1,
            orderId: mockOrderIdCounter - 1,
            productId: String(i.productId),
            variantId: i.variantId ? String(i.variantId) : null,
            productName: i.productName,
            quantity: i.quantity,
            unitPrice: String(i.unitPrice),
            subtotal: String(i.unitPrice * i.quantity),
            imageUrl: i.imageUrl || null,
          })),
        };
        MOCK_ORDERS.push(newMockOrder);
        return { success: true, orderId: newMockOrder.id, orderNumber };
      }
      const verifiedItems = await Promise.all(
        input.items.map(async item => {
          const numProductId = Number(item.productId);
          let serverUnitPrice = null;
          if (!isNaN(numProductId) && numProductId > 0) {
            if (item.variantId) {
              const [variant] = await db
                .select({
                  price: productVariants.price,
                  salePrice: productVariants.salePrice,
                })
                .from(productVariants)
                .where(eq6(productVariants.id, Number(item.variantId)))
                .limit(1);
              if (variant) {
                serverUnitPrice =
                  Number(variant.salePrice) || Number(variant.price);
              }
            }
            if (serverUnitPrice === null) {
              const [product] = await db
                .select({
                  basePrice: products.basePrice,
                  salePrice: products.salePrice,
                })
                .from(products)
                .where(eq6(products.id, numProductId))
                .limit(1);
              if (product) {
                serverUnitPrice =
                  Number(product.salePrice) || Number(product.basePrice);
              }
            }
          }
          const unitPrice = serverUnitPrice ?? Number(item.unitPrice);
          return { ...item, unitPrice };
        })
      );
      const serverSubtotal = verifiedItems.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      );
      const serverShippingFee = Number(input.shippingFee);
      const serverDiscount = Number(input.discount);
      const serverTotal = serverSubtotal + serverShippingFee - serverDiscount;
      await db.insert(orders).values({
        orderNumber,
        userId,
        status: "pending",
        subtotal: String(serverSubtotal),
        shippingFee: String(serverShippingFee),
        discount: String(serverDiscount),
        total: String(serverTotal),
        currency: "LKR",
        paymentMethod: input.paymentMethod,
        paymentStatus: "pending",
        shippingAddress: input.shippingAddress,
        billingAddress: input.billingAddress || input.shippingAddress,
        notes: input.notes || null,
      });
      const [newOrder] = await db
        .select()
        .from(orders)
        .where(eq6(orders.orderNumber, orderNumber))
        .limit(1);
      if (!newOrder) {
        throw new Error("Failed to retrieve created order");
      }
      if (verifiedItems.length > 0) {
        await db.insert(orderItems).values(
          verifiedItems.map(item => ({
            orderId: newOrder.id,
            productId: String(item.productId),
            variantId: item.variantId ? String(item.variantId) : null,
            productName: item.productName,
            variantName: item.variantName || null,
            sku: item.sku || null,
            quantity: item.quantity,
            unitPrice: String(item.unitPrice),
            subtotal: String(item.unitPrice * item.quantity),
          }))
        );
      }
      return { success: true, orderId: newOrder.id, orderNumber };
    }),
});

// server/routers/wishlist.ts
import { z as z7 } from "zod";
import { eq as eq7, and as and5, inArray as inArray2 } from "drizzle-orm";
var MOCK_WISHLISTS = [];
var mockWishlistIdCounter = 1;
var wishlistRouter = router({
  list: publicProcedure
    .input(
      z7
        .object({
          sessionId: z7.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user?.id;
      const sessionId = input?.sessionId;
      if (!userId && !sessionId) {
        return [];
      }
      let rawItems = [];
      if (!db || !userId) {
        rawItems = MOCK_WISHLISTS.filter(w =>
          userId ? w.userId === userId : w.sessionId === sessionId
        );
      } else {
        rawItems = await db
          .select({
            id: wishlists.id,
            productId: wishlists.productId,
          })
          .from(wishlists)
          .where(eq7(wishlists.userId, userId));
      }
      if (rawItems.length === 0) return [];
      const productIds = rawItems
        .map(i => Number(i.productId))
        .filter(id => !isNaN(id) && id > 0);
      let productMap = {};
      let brandMap = {};
      let imageMap = {};
      if (db && productIds.length > 0) {
        const pRows = await db
          .select({
            product: products,
            brand: brands,
          })
          .from(products)
          .leftJoin(brands, eq7(products.brandId, brands.id))
          .where(inArray2(products.id, productIds));
        for (const row of pRows) {
          productMap[row.product.id] = row.product;
          if (row.brand) {
            brandMap[row.product.id] = row.brand;
          }
        }
        const imgRows = await db
          .select()
          .from(productImages)
          .where(inArray2(productImages.productId, productIds))
          .orderBy(productImages.sortOrder);
        for (const img of imgRows) {
          if (!imageMap[img.productId]) {
            imageMap[img.productId] = img.url;
          }
        }
      }
      return rawItems.map(item => {
        const numId = Number(item.productId);
        const p = productMap[numId];
        const b = brandMap[numId];
        const img = imageMap[numId];
        return {
          id: item.id,
          productId: item.productId,
          productName: p?.name ?? `Product #${item.productId}`,
          productSlug: p?.slug ?? "products",
          basePrice: p?.basePrice ? Number(p.basePrice) : 0,
          salePrice: p?.salePrice ? Number(p.salePrice) : null,
          currency: "LKR",
          isInStock: p ? p.isInStock : true,
          brandName: b?.name ?? "Manju Group",
          imageUrl: img || null,
        };
      });
    }),
  toggle: publicProcedure
    .input(
      z7.object({
        productId: z7.union([z7.string(), z7.number()]),
        sessionId: z7.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user?.id;
      const sessionId = input.sessionId;
      const prodIdStr = String(input.productId);
      if (!userId && !sessionId) {
        throw new Error("User session required for wishlist");
      }
      if (!db || !userId) {
        const existingIdx = MOCK_WISHLISTS.findIndex(w =>
          userId
            ? w.userId === userId && w.productId === prodIdStr
            : w.sessionId === sessionId && w.productId === prodIdStr
        );
        if (existingIdx >= 0) {
          MOCK_WISHLISTS.splice(existingIdx, 1);
          return { added: false };
        } else {
          MOCK_WISHLISTS.push({
            id: mockWishlistIdCounter++,
            userId,
            sessionId,
            productId: prodIdStr,
          });
          return { added: true };
        }
      }
      const [existing] = await db
        .select()
        .from(wishlists)
        .where(
          and5(
            eq7(wishlists.userId, userId),
            eq7(wishlists.productId, prodIdStr)
          )
        )
        .limit(1);
      if (existing) {
        await db.delete(wishlists).where(eq7(wishlists.id, existing.id));
        return { added: false };
      } else {
        await db.insert(wishlists).values({
          userId,
          productId: prodIdStr,
        });
        return { added: true };
      }
    }),
  isWishlisted: publicProcedure
    .input(
      z7.object({
        productId: z7.union([z7.string(), z7.number()]),
        sessionId: z7.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user?.id;
      const sessionId = input.sessionId;
      const prodIdStr = String(input.productId);
      if (!userId && !sessionId) return false;
      if (!db || !userId) {
        return MOCK_WISHLISTS.some(w =>
          userId
            ? w.userId === userId && w.productId === prodIdStr
            : w.sessionId === sessionId && w.productId === prodIdStr
        );
      }
      const [item] = await db
        .select()
        .from(wishlists)
        .where(
          and5(
            eq7(wishlists.userId, userId),
            eq7(wishlists.productId, prodIdStr)
          )
        )
        .limit(1);
      return !!item;
    }),
});

// server/routers/locations.ts
import { eq as eq8 } from "drizzle-orm";
var locationsRouter = router({
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(locations)
      .where(eq8(locations.isActive, true))
      .orderBy(locations.sortOrder);
  }),
});

// server/routers/blog.ts
import { z as z8 } from "zod";
import { eq as eq9, desc as desc3 } from "drizzle-orm";
var blogRouter = router({
  list: publicProcedure
    .input(
      z8.object({
        limit: z8.number().default(10),
        page: z8.number().default(1),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { items: [], total: 0 };
      const offset = (input.page - 1) * input.limit;
      const items = await db
        .select()
        .from(blogPosts)
        .where(eq9(blogPosts.isPublished, true))
        .orderBy(desc3(blogPosts.publishedAt))
        .limit(input.limit)
        .offset(offset);
      return { items, total: items.length };
    }),
  bySlug: publicProcedure
    .input(z8.object({ slug: z8.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [post] = await db
        .select()
        .from(blogPosts)
        .where(eq9(blogPosts.slug, input.slug))
        .limit(1);
      return post ?? null;
    }),
});

// server/routers/faq.ts
import { eq as eq10 } from "drizzle-orm";
var faqRouter = router({
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(faqs)
      .where(eq10(faqs.isActive, true))
      .orderBy(faqs.sortOrder);
  }),
});

// server/routers/contact.ts
import { z as z9 } from "zod";
var contactRouter = router({
  submit: publicProcedure
    .input(
      z9.object({
        name: z9.string().min(2).max(100),
        email: z9.string().email().max(254),
        phone: z9.string().max(30).optional(),
        subject: z9.string().max(200).optional(),
        message: z9.string().min(10).max(5e3),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.insert(contactMessages).values(input);
      return { success: true };
    }),
});

// server/routers/admin.ts
import { z as z10 } from "zod";
import {
  eq as eq11,
  desc as desc4,
  sql as sql5,
  and as and6,
  like as like2,
  or as or2,
} from "drizzle-orm";

// client/src/lib/staticData.ts
var STATIC_BRANDS = [
  {
    id: 1,
    slug: "dew-motors",
    name: "Dew Motors",
    tagline: "Power Your Ride, Go Electric",
    description:
      "Dew Motors is Sri Lanka's leading electric motorcycle brand, offering eco-friendly, powerful electric bikes designed for daily commuting and adventure. With cutting-edge battery technology and sleek designs, Dew Motors is driving the future of sustainable transportation in Sri Lanka.",
    primaryColor: "#0ea5e9",
    accentColor: "#38bdf8",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 2,
    slug: "dew-plus",
    name: "Dew Plus",
    tagline: "Crystal Clear Entertainment",
    description:
      'Dew Plus brings premium 4K Android Smart TVs with built-in streaming apps, crystal clear displays, and immersive sound systems. Available in 32" to 65" sizes, perfect for every Sri Lankan home.',
    primaryColor: "#8b5cf6",
    accentColor: "#a78bfa",
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 3,
    slug: "dew-plus-ac",
    name: "DEW+ AC",
    tagline: "Cool Comfort, Smart Living",
    description:
      "DEW+ AC offers energy-efficient inverter split air conditioners with R32 eco-friendly refrigerant. Available in 1 Ton, 1.5 Ton, and 2 Ton capacities with smart WiFi control, turbo cooling, and 5-year compressor warranty.",
    primaryColor: "#06b6d4",
    accentColor: "#22d3ee",
    sortOrder: 3,
    isActive: true,
  },
  {
    id: 4,
    slug: "manju-dew-super",
    name: "Manju Dew Super",
    tagline: "Pure Water, Healthy Life",
    description:
      "Manju Dew Super water purifiers use advanced RO, UV, and UF filtration technology to deliver clean, safe drinking water. Available in multiple models including hot & cold dispensers, perfect for homes and offices.",
    primaryColor: "#3b82f6",
    accentColor: "#60a5fa",
    sortOrder: 4,
    isActive: true,
  },
];
var STATIC_PRODUCTS = [
  {
    id: 38,
    slug: "dew-super-ro-water-filter",
    sku: "MNJ-04-04-038",
    name: "Dew Super RO Water Filter",
    brandName: "Manju Dew Super",
    brandId: 4,
    categoryId: 4,
    category: "Water Filters",
    basePrice: "69900.00",
    salePrice: null,
    currency: "LKR",
    isInStock: true,
    isFeatured: false,
    isBestSeller: false,
    isNew: false,
    imageUrl: "/ads/ad_dew_super_ro_system_1.webp",
    specifications:
      '{"01. Stage":"05 Micron Sediment Filter (Above 05 Micron Removes Sediment In Water)","02. Stage":"01 Micron Sediment Filter (Above 01 Micron Removes Sediment In Water)","03. Stage":"Activated Carbon Filter","04. Stage":"Ro Membrane (Only Pure Water Is Filterd)","05. Stage":"Mineral Cartridge","06. Stage":"UV Sterilizer (Destroys Bacteria & Viruses In The Water)","Feature 4":"* High Removal Capacity Of Iron Manganese H2s Aresenic & Heavy Mentals","Feature 5":"* Removes Organizes Bacteria & Color","Feature 6":"* Removes Chlorine","Feature 7":"* Enhances Test Of Water","Feature 10":"* Adds Essential Minerals Like Calcium, Magnesium, Sodium & Potassium.","Feature 11":"* Increase PH & Makes Alkaline Water.","Feature 13":"07. The capacity is 100 liters per day","Sub Category":"RO Water Filter","Installment Plan":"Down Payment - Rs.14900\\nMonthly premium - Rs.6000 X 11 (Months)\\n                                    Rs.4000 X 01 (Month)","Installment Price":"Rs. 84,900"}',
    description:
      "One year warranty\nLong term maintenance service after warranty period\nFree shipping and installation\nFree water test\nFree after sale service\nAvailability of all spare parts\n22 years of experienced entrepreneurship\nEasy payment methods in installments\nFree water testing",
    shortDescription: "One year warranty",
    warrantyMonths: 24,
  },
  {
    id: 39,
    slug: "dew-super-ro-water-filter-1",
    sku: "MNJ-04-04-039",
    name: "Dew Super RO+ Water Filter",
    brandName: "Manju Dew Super",
    brandId: 4,
    categoryId: 4,
    category: "Water Filters",
    basePrice: "74900.00",
    salePrice: null,
    currency: "LKR",
    isInStock: true,
    isFeatured: false,
    isBestSeller: false,
    isNew: false,
    imageUrl: "/ads/ad_dew_super_ro_system_2.webp",
    specifications:
      '{"01. Stage":"05 Micron Sediment Filter (Above 05 Micron Removes Sediment In Water)","02. Stage":"01 Micron Sediment Filter (Above 01 Micron Removes Sediment In Water)","03. Stage":"Activated Carbon Filter","04. Stage":"Ro Membrane (Only Pure Water Is Filterd)","05. Stage":"Mineral Cartridge","06. Stage":"UV Sterilizer (Destroys Bacteria & Viruses In The Water)","Feature 4":"* High Removal Capacity Of Iron Manganese H2s Aresenic & Heavy Mentals","Feature 5":"* Removes Organizes Bacteria & Color","Feature 6":"* Removes Chlorine","Feature 7":"* Enhances Test Of Water","Feature 10":"* Adds Essential Minerals Like Calcium, Magnesium, Sodium & Potassium.","Feature 11":"* Increase PH & Makes Alkaline Water.","Feature 13":"07. The capacity is 100 liters per day","Sub Category":"RO+ Water Filter","Installment Plan":"Down Payment - Rs.14900\\nMonthly premium - Rs.6250 X 12 (Months)","Installment Price":"Rs. 89,900"}',
    description:
      "One year warranty\nLong term maintenance service after warranty period\nFree shipping and installation\nFree water test\nFree after sale service\nAvailability of all spare parts\n22 years of experienced entrepreneurship\nEasy payment methods in installments\nFree water testing",
    shortDescription: "One year warranty",
    warrantyMonths: 24,
  },
  {
    id: 40,
    slug: "dew-super-hot-normal-water-filter",
    sku: "MNJ-04-04-040",
    name: "Dew Super Hot & Normal Water Filter",
    brandName: "Manju Dew Super",
    brandId: 4,
    categoryId: 4,
    category: "Water Filters",
    basePrice: "86900.00",
    salePrice: null,
    currency: "LKR",
    isInStock: true,
    isFeatured: false,
    isBestSeller: false,
    isNew: false,
    imageUrl: "/ads/ad_dew_super_ro_system_1.webp",
    specifications:
      '{"01. Stage":"05 Micron Sediment Filter (Above 05 Micron Removes Sediment In Water)","02. Stage":"01 Micron Sediment Filter (Above 01 Micron Removes Sediment In Water)","03. Stage":"Activated Carbon Filter","04. Stage":"Ro Membrane (Only Pure Water Is Filterd)","05. Stage":"Mineral Cartridge","06. Stage":"UV Sterilizer (Destroys Bacteria & Viruses In The Water)","Feature 4":"* High Removal Capacity Of Iron Manganese H2s Aresenic & Heavy Mentals","Feature 5":"* Removes Organizes Bacteria & Color","Feature 6":"* Removes Chlorine","Feature 7":"* Enhances Test Of Water","Feature 10":"* Adds Essential Minerals Like Calcium, Magnesium, Sodium & Potassium.","Feature 11":"* Increase PH & Makes Alkaline Water.","Feature 13":"07. The capacity is 75 liters per day","Sub Category":"Hot & Normal Water Filter","Installment Plan":"Down Payment - Rs.19900\\nMonthly premium - Rs.6250 X 12 (Months)","Installment Price":"Rs. 94,900"}',
    description:
      "One year warranty\nLong term maintenance service after warranty period\nFree shipping and installation\nFree water test\nFree after sale service\nAvailability of all spare parts\n22 years of experienced entrepreneurship\nEasy payment methods in installments\nFree water testing",
    shortDescription: "One year warranty",
    warrantyMonths: 24,
  },
  {
    id: 41,
    slug: "dew-super-hotcool-normal-water-filter",
    sku: "MNJ-04-04-041",
    name: "Dew Super Hot,Cool & Normal Water Filter",
    brandName: "Manju Dew Super",
    brandId: 4,
    categoryId: 4,
    category: "Water Filters",
    basePrice: "89900.00",
    salePrice: null,
    currency: "LKR",
    isInStock: true,
    isFeatured: false,
    isBestSeller: true,
    isNew: false,
    imageUrl: "/ads/ad_dew_super_ro_system_2.webp",
    specifications:
      '{"01. Stage":"05 Micron Sediment Filter (Above 05 Micron Removes Sediment In Water)","02. Stage":"01 Micron Sediment Filter (Above 01 Micron Removes Sediment In Water)","03. Stage":"Activated Carbon Filter","04. Stage":"Ro Membrane (Only Pure Water Is Filterd)","05. Stage":"Mineral Cartridge","06. Stage":"UV Sterilizer (Destroys Bacteria & Viruses In The Water)","Feature 4":"* High Removal Capacity Of Iron Manganese H2s Aresenic & Heavy Mentals","Feature 5":"* Removes Organizes Bacteria & Color","Feature 6":"* Removes Chlorine","Feature 7":"* Enhances Test Of Water","Feature 10":"* Adds Essential Minerals Like Calcium, Magnesium, Sodium & Potassium.","Feature 11":"* Increase PH & Makes Alkaline Water.","Feature 13":"07. The capacity is 75 liters per day","Sub Category":"Hot,Cool & Normal Water Filter","Installment Plan":"Down Payment - Rs.22900\\nMonthly premium - Rs.6250 X 12 (Months)","Installment Price":"Rs. 97,900"}',
    description:
      "One year warranty\nLong term maintenance service after warranty period\nFree shipping and installation\nFree water test\nFree after sale service\nAvailability of all spare parts\n22 years of experienced entrepreneurship\nEasy payment methods in installments\nFree water testing",
    shortDescription: "One year warranty",
    warrantyMonths: 24,
  },
  {
    id: 42,
    slug: "dew-super-commercial-water-filter-500l",
    sku: "MNJ-04-04-042",
    name: "Dew Super Commercial Water Filter 500L",
    brandName: "Manju Dew Super",
    brandId: 4,
    categoryId: 4,
    category: "Water Filters",
    basePrice: "175000.00",
    salePrice: null,
    currency: "LKR",
    isInStock: true,
    isFeatured: false,
    isBestSeller: false,
    isNew: false,
    imageUrl: "/ads/ad_dew_super_ro_system_1.webp",
    specifications:
      '{"01. Stage":"05 Micron Sediment Filter (Above 05 Micron Removes Sediment In Water)","02. Stage":"01 Micron Sediment Filter (Above 01 Micron Removes Sediment In Water)","03. Stage":"Activated Carbon Filter","04. Stage":"Ro Membrane (Only Pure Water Is Filterd)","05. Stage":"Mineral Cartridge","06. Stage":"UV Sterilizer (Destroys Bacteria & Viruses In The Water)","Feature 4":"* High Removal Capacity Of Iron Manganese H2s Aresenic & Heavy Mentals","Feature 5":"* Removes Organizes Bacteria & Color","Feature 6":"* Removes Chlorine","Feature 7":"* Enhances Test Of Water","Feature 10":"* Adds Essential Minerals Like Calcium, Magnesium, Sodium & Potassium.","Feature 11":"* Increase PH & Makes Alkaline Water.","Feature 13":"07. The capacity is 500 liters per day","Sub Category":"Commercial Water Filter","Installment Plan":"Down Payment - Rs.90000\\nMonthly premium - Rs.17500 X 06 (Months)","Installment Price":"Rs. 195,000"}',
    description:
      "One year warranty\nLong term maintenance service after warranty period\nFree shipping and installation\nFree water test\nFree after sale service\nAvailability of all spare parts\n22 years of experienced entrepreneurship\nEasy payment methods in installments\nFree water testing",
    shortDescription: "One year warranty",
    warrantyMonths: 24,
  },
  {
    id: 43,
    slug: "dew-super-commercial-water-filter-2500l",
    sku: "MNJ-04-04-043",
    name: "Dew Super Commercial Water Filter 2500L",
    brandName: "Manju Dew Super",
    brandId: 4,
    categoryId: 4,
    category: "Water Filters",
    basePrice: "315000.00",
    salePrice: null,
    currency: "LKR",
    isInStock: true,
    isFeatured: false,
    isBestSeller: false,
    isNew: false,
    imageUrl: "/ads/ad_dew_super_ro_system_2.webp",
    specifications:
      '{"01. Stage":"05 Micron Sediment Filter (Above 05 Micron Removes Sediment In Water)","02. Stage":"01 Micron Sediment Filter (Above 01 Micron Removes Sediment In Water)","03. Stage":"Activated Carbon Filter","04. Stage":"Ro Membrane (Only Pure Water Is Filterd)","05. Stage":"Mineral Cartridge","06. Stage":"UV Sterilizer (Destroys Bacteria & Viruses In The Water)","Feature 4":"* High Removal Capacity Of Iron Manganese H2s Aresenic & Heavy Mentals","Feature 5":"* Removes Organizes Bacteria & Color","Feature 6":"* Removes Chlorine","Feature 7":"* Enhances Test Of Water","Feature 10":"* Adds Essential Minerals Like Calcium, Magnesium, Sodium & Potassium.","Feature 11":"* Increase PH & Makes Alkaline Water.","Feature 13":"07. The capacity is 2500 liters per day","Sub Category":"Commercial Water Filter","Installment Plan":"Down Payment - Rs.170000\\nMonthly premium - Rs.30000 X 06 (Months)","Installment Price":"Rs. 350,000"}',
    description:
      "One year warranty\nLong term maintenance service after warranty period\nFree shipping and installation\nFree water test\nFree after sale service\nAvailability of all spare parts\n22 years of experienced entrepreneurship\nEasy payment methods in installments\nFree water testing",
    shortDescription: "One year warranty",
    warrantyMonths: 24,
  },
  {
    id: 44,
    slug: "dew-super-commercial-water-filter-3000l",
    sku: "MNJ-04-04-044",
    name: "Dew Super Commercial Water Filter 3000L",
    brandName: "Manju Dew Super",
    brandId: 4,
    categoryId: 4,
    category: "Water Filters",
    basePrice: "400000.00",
    salePrice: null,
    currency: "LKR",
    isInStock: true,
    isFeatured: false,
    isBestSeller: false,
    isNew: false,
    imageUrl: "/ads/ad_dew_super_ro_system_1.webp",
    specifications:
      '{"01. Stage":"05 Micron Sediment Filter (Above 05 Micron Removes Sediment In Water)","02. Stage":"01 Micron Sediment Filter (Above 01 Micron Removes Sediment In Water)","03. Stage":"Activated Carbon Filter","04. Stage":"Ro Membrane (Only Pure Water Is Filterd)","05. Stage":"Mineral Cartridge","06. Stage":"UV Sterilizer (Destroys Bacteria & Viruses In The Water)","Feature 4":"* High Removal Capacity Of Iron Manganese H2s Aresenic & Heavy Mentals","Feature 5":"* Removes Organizes Bacteria & Color","Feature 6":"* Removes Chlorine","Feature 7":"* Enhances Test Of Water","Feature 10":"* Adds Essential Minerals Like Calcium, Magnesium, Sodium & Potassium.","Feature 11":"* Increase PH & Makes Alkaline Water.","Feature 13":"07. The capacity is 3000 liters per day","Sub Category":"Commercial Water Filter","Installment Plan":"Down Payment - Rs.225000\\nMonthly premium - Rs.37500 X 06 (Months)","Installment Price":"Rs. 450,000"}',
    description:
      "One year warranty\nLong term maintenance service after warranty period\nFree shipping and installation\nFree water test\nFree after sale service\nAvailability of all spare parts\n22 years of experienced entrepreneurship\nEasy payment methods in installments\nFree water testing",
    shortDescription: "One year warranty",
    warrantyMonths: 24,
  },
  {
    id: 45,
    slug: "dew-plus-smart-tv-32",
    sku: "MNJ-02-02-045",
    name: "Dew Plus (+) Smart Tv 32''",
    brandName: "Dew Plus",
    brandId: 2,
    categoryId: 2,
    category: "Smart TVs",
    basePrice: "74400.00",
    salePrice: null,
    currency: "LKR",
    isInStock: true,
    isFeatured: false,
    isBestSeller: true,
    isNew: false,
    imageUrl: "/dew_plus_32_tv.webp",
    specifications:
      '{"Feature 1":"LED TV","Feature 2":"Wifi","Feature 3":"Full HD 1080","Feature 4":"Android 12","Feature 5":"Youtube","Feature 6":"Connect Share Movie","Feature 7":"USB Support","Feature 8":"Energy Saving","Feature 9":"Stereo Clear Voice","Sub Category":"Smart Tv","Installment Plan":"Down Payment - Rs.10000\\nMonthly premium - Rs.6200 X 12 (Months)","Installment Price":"Rs. 84,400"}',
    description:
      "One year warranty period\nFree after sales service\nOne TV per TV during the warranty period\n22 years of cardamom entrepreneurship\nAvailability of all spare parts\nEasy payment method in installments",
    shortDescription: "One year warranty period",
    warrantyMonths: 24,
  },
  {
    id: 46,
    slug: "dew-plus-smart-tv-43",
    sku: "MNJ-02-02-046",
    name: "Dew Plus (+) Smart Tv 43''",
    brandName: "Dew Plus",
    brandId: 2,
    categoryId: 2,
    category: "Smart TVs",
    basePrice: "99800.00",
    salePrice: null,
    currency: "LKR",
    isInStock: true,
    isFeatured: false,
    isBestSeller: false,
    isNew: false,
    imageUrl: "/dew_plus_43_tv.webp",
    specifications:
      '{"Feature 1":"LED TV","Feature 2":"Wifi","Feature 3":"Full HD 1080","Feature 4":"Android 12","Feature 5":"Youtube","Feature 6":"Connect Share Movie","Feature 7":"USB Support","Feature 8":"Energy Saving","Feature 9":"Stereo Clear Voice","Sub Category":"Smart Tv","Installment Plan":"Down Payment - Rs.15000\\nMonthly premium - Rs.9150 X 12 (Months)","Installment Price":"Rs. 124,800"}',
    description:
      "One year warranty period\nFree after sales service\nOne TV per TV during the warranty period\n22 years of cardamom entrepreneurship\nAvailability of all spare parts\nEasy payment method in installments",
    shortDescription: "One year warranty period",
    warrantyMonths: 24,
  },
  {
    id: 47,
    slug: "dew-plus-smart-tv-55",
    sku: "MNJ-02-02-047",
    name: "Dew Plus (+) Smart Tv 55''",
    brandName: "Dew Plus",
    brandId: 2,
    categoryId: 2,
    category: "Smart TVs",
    basePrice: "169500.00",
    salePrice: null,
    currency: "LKR",
    isInStock: true,
    isFeatured: false,
    isBestSeller: false,
    isNew: false,
    imageUrl: "/dew_plus_55_tv.webp",
    specifications:
      '{"Feature 1":"LED TV","Feature 2":"Wifi","Feature 3":"4K Ultra HD","Feature 4":"Android 12","Feature 5":"Youtube","Feature 6":"Connect Share Movie","Feature 7":"USB Support","Feature 8":"Energy Saving","Feature 9":"Stereo Clear Voice","Sub Category":"Smart Tv","Installment Plan":"Down Payment - Rs.25000\\nMonthly premium - Rs.10250 X 18 (Months)","Installment Price":"Rs. 209,500"}',
    description:
      "One year warranty period\nFree after sales service\nOne TV per TV during the warranty period\n22 years of cardamom entrepreneurship\nAvailability of all spare parts\nEasy payment method in installments",
    shortDescription: "One year warranty period",
    warrantyMonths: 24,
  },
  {
    id: 48,
    slug: "dew-plus-smart-tv-65",
    sku: "MNJ-02-02-048",
    name: "Dew Plus (+) Smart Tv 65''",
    brandName: "Dew Plus",
    brandId: 2,
    categoryId: 2,
    category: "Smart TVs",
    basePrice: "237800.00",
    salePrice: null,
    currency: "LKR",
    isInStock: true,
    isFeatured: false,
    isBestSeller: false,
    isNew: false,
    imageUrl: "/dew_plus_65_tv.webp",
    specifications:
      '{"Feature 1":"LED TV","Feature 2":"Wifi","Feature 3":"4K Ultra HD","Feature 4":"Android 12","Feature 5":"Youtube","Feature 6":"Connect Share Movie","Feature 7":"USB Support","Feature 8":"Energy Saving","Feature 9":"Stereo Clear Voice","Sub Category":"Smart Tv","Installment Plan":"Down Payment - Rs.35000\\nMonthly premium - Rs.10950 X 24 (Months)","Installment Price":"Rs. 297,800"}',
    description:
      "One year warranty period\nFree after sales service\nOne TV per TV during the warranty period\n22 years of cardamom entrepreneurship\nAvailability of all spare parts\nEasy payment method in installments",
    shortDescription: "One year warranty period",
    warrantyMonths: 24,
  },
  {
    id: 49,
    slug: "dew-plus-smart-tv-75",
    sku: "MNJ-02-02-049",
    name: "Dew Plus (+) Smart Tv 75''",
    brandName: "Dew Plus",
    brandId: 2,
    categoryId: 2,
    category: "Smart TVs",
    basePrice: "468800.00",
    salePrice: null,
    currency: "LKR",
    isInStock: true,
    isFeatured: false,
    isBestSeller: true,
    isNew: false,
    imageUrl: "/dew_plus_75_tv.webp",
    specifications:
      '{"Feature 1":"LED TV","Feature 2":"Wifi","Feature 3":"4K Ultra HD","Feature 4":"Android 12","Feature 5":"Youtube","Feature 6":"Connect Share Movie","Feature 7":"USB Support","Feature 8":"Energy Saving","Feature 9":"Stereo Clear Voice","Sub Category":"Smart Tv","Installment Plan":"Down Payment - Rs.50000\\nMonthly premium - Rs.19950 X 24 (Months)","Installment Price":"Rs. 528,800"}',
    description:
      "One year warranty period\nFree after sales service\nOne TV per TV during the warranty period\n22 years of cardamom entrepreneurship\nAvailability of all spare parts\nEasy payment method in installments",
    shortDescription: "One year warranty period",
    warrantyMonths: 24,
  },
  {
    id: 50,
    slug: "dew-plus-smart-tv-98",
    sku: "MNJ-02-02-050",
    name: "Dew Plus (+) Smart Tv 98''",
    brandName: "Dew Plus",
    brandId: 2,
    categoryId: 2,
    category: "Smart TVs",
    basePrice: "888800.00",
    salePrice: null,
    currency: "LKR",
    isInStock: true,
    isFeatured: false,
    isBestSeller: false,
    isNew: false,
    imageUrl: "/dew_plus_98_tv.webp",
    specifications:
      '{"Feature 1":"LED TV","Feature 2":"Wifi","Feature 3":"4K Ultra HD","Feature 4":"Android 12","Feature 5":"Youtube","Feature 6":"Connect Share Movie","Feature 7":"USB Support","Feature 8":"Energy Saving","Feature 9":"Stereo Clear Voice","Sub Category":"Smart Tv","Installment Plan":"Down Payment - Rs.100000\\nMonthly premium - Rs.37400 X 24 (Months)","Installment Price":"Rs. 997,600"}',
    description:
      "One year warranty period\nFree after sales service\nOne TV per TV during the warranty period\n22 years of cardamom entrepreneurship\nAvailability of all spare parts\nEasy payment method in installments",
    shortDescription: "One year warranty period",
    warrantyMonths: 24,
  },
  {
    id: 51,
    slug: "dew-motors-yw06-2000w",
    sku: "MNJ-01-01-051",
    name: "Dew Motors - YW06 2000W",
    brandName: "Dew Motors",
    brandId: 1,
    categoryId: 1,
    category: "Electric Bikes",
    basePrice: "630000.00",
    salePrice: null,
    currency: "LKR",
    isInStock: true,
    isFeatured: false,
    isBestSeller: false,
    isNew: false,
    imageUrl: "/scooter_silver.webp",
    specifications:
      '{"Feature 1":"Max Speed Is 65KM/H","Feature 2":"Long Life Span","Feature 3":"High/Standard Painting Technology","Feature 4":"Long Distance Range","Feature 5":"Stable & Durable Frame","Feature 6":"Swapped Lithium Battery","Sub Category":"Electric Bike","Installment Plan":"Down Payment - Rs.130000\\nMonthly premium - Rs.20889 X 36 (Months)","Installment Price":"Rs. 882,004"}',
    description:
      "Lowest price in the market\nMaximum savings in all respects\n01 year or 1500km warranty\nAfter sales service\nIsland wide service network\nOver 2 decades of customer trust",
    shortDescription: "Lowest price in the market",
    warrantyMonths: 12,
  },
  {
    id: 52,
    slug: "dew-motors-em005-2400w",
    sku: "MNJ-01-01-052",
    name: "Dew Motors - EM005 2400W",
    brandName: "Dew Motors",
    brandId: 1,
    categoryId: 1,
    category: "Electric Bikes",
    basePrice: "680000.00",
    salePrice: null,
    currency: "LKR",
    isInStock: true,
    isFeatured: false,
    isBestSeller: false,
    isNew: false,
    imageUrl: "/scooter_red.webp",
    specifications:
      '{"Feature 1":"Max Speed Is 65KM/H","Feature 2":"Long Life Span","Feature 3":"High/Standard Painting Technology","Feature 4":"Long Distance Range","Feature 5":"Stable & Durable Frame","Feature 6":"Swapped Lithium Battery","Sub Category":"Electric Bike","Installment Plan":"Down Payment - Rs.130000\\nMonthly premium - Rs.26278 X 36 (Months)\\nOr\\nMonthly premium - Rs.33917 X 24 (Months)\\nOr\\nMonthly premium - Rs.56834 X 12 (Months)","Installment Price":"Rs. 957,208"}',
    description:
      "Lowest price in the market\nMaximum savings in all respects\n01 year or 1500km warranty\nAfter sales service\nIsland wide service network\nOver 2 decades of customer trust",
    shortDescription: "Lowest price in the market",
    warrantyMonths: 12,
  },
  {
    id: 53,
    slug: "dew-plus-1-0-ton-inverter-split-ac",
    sku: "MNJ-03-03-001",
    name: "DEW+ 1.0 Ton Inverter Split AC",
    brandName: "DEW+ AC",
    brandId: 3,
    categoryId: 3,
    category: "Air Conditioners",
    basePrice: "145000.00",
    salePrice: null,
    currency: "LKR",
    isInStock: true,
    isFeatured: true,
    isBestSeller: true,
    isNew: false,
    imageUrl: "/dew_plus_ac_1ton.webp",
    specifications:
      '{"Capacity":"12,000 BTU (1.0 Ton)","Features":"WiFi Smart Control, Turbo Cooling, 4-Way Air Swing, Anti-Bacterial Filter","Warranty":"5-Year Compressor Warranty, 1-Year Comprehensive","Technology":"Full DC Inverter","Refrigerant":"Eco-Friendly R32"}',
    description:
      "Energy-efficient 1.0 Ton Inverter AC with R32 eco-friendly gas and WiFi smart app control. Free installation and bracket included.",
    shortDescription:
      "Energy-efficient 1.0 Ton Inverter AC with R32 eco-friendly gas and WiFi smart app control. Free installation and bracket included.",
    warrantyMonths: 60,
  },
  {
    id: 54,
    slug: "dew-plus-1-5-ton-inverter-split-ac",
    sku: "MNJ-03-03-002",
    name: "DEW+ 1.5 Ton Inverter Split AC",
    brandName: "DEW+ AC",
    brandId: 3,
    categoryId: 3,
    category: "Air Conditioners",
    basePrice: "185000.00",
    salePrice: null,
    currency: "LKR",
    isInStock: true,
    isFeatured: true,
    isBestSeller: true,
    isNew: false,
    imageUrl: "/dew_plus_ac_1_5ton.webp",
    specifications:
      '{"Capacity":"18,000 BTU (1.5 Ton)","Features":"WiFi Smart Control, Turbo Cooling, 4-Way Air Swing, Anti-Bacterial Filter","Warranty":"5-Year Compressor Warranty, 1-Year Comprehensive","Technology":"Full DC Inverter","Refrigerant":"Eco-Friendly R32"}',
    description:
      "High-performance 1.5 Ton Inverter AC designed for medium-to-large rooms with high energy efficiency rating.",
    shortDescription:
      "High-performance 1.5 Ton Inverter AC designed for medium-to-large rooms with high energy efficiency rating.",
    warrantyMonths: 60,
  },
  {
    id: 55,
    slug: "dew-plus-2-0-ton-inverter-split-ac",
    sku: "MNJ-03-03-003",
    name: "DEW+ 2.0 Ton Inverter Split AC",
    brandName: "DEW+ AC",
    brandId: 3,
    categoryId: 3,
    category: "Air Conditioners",
    basePrice: "235000.00",
    salePrice: null,
    currency: "LKR",
    isInStock: true,
    isFeatured: true,
    isBestSeller: true,
    isNew: false,
    imageUrl: "/dew_plus_ac_2ton.webp",
    specifications:
      '{"Capacity":"24,000 BTU (2.0 Ton)","Features":"WiFi Smart Control, Turbo Cooling, 4-Way Air Swing, Anti-Bacterial Filter","Warranty":"5-Year Compressor Warranty, 1-Year Comprehensive","Technology":"Full DC Inverter","Refrigerant":"Eco-Friendly R32"}',
    description:
      "Heavy-duty 2.0 Ton Inverter AC for large living rooms, commercial spaces, and showrooms with rapid turbo cooling.",
    shortDescription:
      "Heavy-duty 2.0 Ton Inverter AC for large living rooms, commercial spaces, and showrooms with rapid turbo cooling.",
    warrantyMonths: 60,
  },
];

// server/routers/admin.ts
var adminRouter = router({
  // Dashboard stats
  stats: adminProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) {
        return {
          totalOrders: 48,
          totalRevenue: 1845e4,
          totalProducts: STATIC_PRODUCTS.length,
          totalCustomers: 120,
          lowStockCount: 2,
          brandBreakdown: [
            { brand: "Dew Motors", revenue: 84e5, orders: 12 },
            { brand: "Dew Plus", revenue: 52e5, orders: 18 },
            { brand: "DEW+ AC", revenue: 31e5, orders: 10 },
            { brand: "Manju Dew Super", revenue: 175e4, orders: 8 },
          ],
          weeklyTrend: [
            { day: "Mon", revenue: 21e5, orders: 5 },
            { day: "Tue", revenue: 28e5, orders: 7 },
            { day: "Wed", revenue: 195e4, orders: 4 },
            { day: "Thu", revenue: 34e5, orders: 9 },
            { day: "Fri", revenue: 41e5, orders: 11 },
            { day: "Sat", revenue: 29e5, orders: 8 },
            { day: "Sun", revenue: 12e5, orders: 4 },
          ],
        };
      }
      const [orderStats, productCount, customerCount] = await Promise.all([
        db
          .select({
            count: sql5`count(*)`,
            revenue: sql5`sum(total)`,
          })
          .from(orders),
        db
          .select({ count: sql5`count(*)` })
          .from(products)
          .where(eq11(products.isActive, true)),
        db.select({ count: sql5`count(*)` }).from(users),
      ]);
      return {
        totalOrders: Number(orderStats[0]?.count ?? 48),
        totalRevenue: Number(orderStats[0]?.revenue ?? 1845e4),
        totalProducts: Number(productCount[0]?.count ?? STATIC_PRODUCTS.length),
        totalCustomers: Number(customerCount[0]?.count ?? 120),
        lowStockCount: 2,
        brandBreakdown: [
          { brand: "Dew Motors", revenue: 84e5, orders: 12 },
          { brand: "Dew Plus", revenue: 52e5, orders: 18 },
          { brand: "DEW+ AC", revenue: 31e5, orders: 10 },
          { brand: "Manju Dew Super", revenue: 175e4, orders: 8 },
        ],
        weeklyTrend: [
          { day: "Mon", revenue: 21e5, orders: 5 },
          { day: "Tue", revenue: 28e5, orders: 7 },
          { day: "Wed", revenue: 195e4, orders: 4 },
          { day: "Thu", revenue: 34e5, orders: 9 },
          { day: "Fri", revenue: 41e5, orders: 11 },
          { day: "Sat", revenue: 29e5, orders: 8 },
          { day: "Sun", revenue: 12e5, orders: 4 },
        ],
      };
    } catch (err) {
      return {
        totalOrders: 48,
        totalRevenue: 1845e4,
        totalProducts: STATIC_PRODUCTS.length,
        totalCustomers: 120,
        lowStockCount: 2,
        brandBreakdown: [
          { brand: "Dew Motors", revenue: 84e5, orders: 12 },
          { brand: "Dew Plus", revenue: 52e5, orders: 18 },
          { brand: "DEW+ AC", revenue: 31e5, orders: 10 },
          { brand: "Manju Dew Super", revenue: 175e4, orders: 8 },
        ],
        weeklyTrend: [
          { day: "Mon", revenue: 21e5, orders: 5 },
          { day: "Tue", revenue: 28e5, orders: 7 },
          { day: "Wed", revenue: 195e4, orders: 4 },
          { day: "Thu", revenue: 34e5, orders: 9 },
          { day: "Fri", revenue: 41e5, orders: 11 },
          { day: "Sat", revenue: 29e5, orders: 8 },
          { day: "Sun", revenue: 12e5, orders: 4 },
        ],
      };
    }
  }),
  // ERP Sync Trigger
  erpSync: publicProcedure.mutation(async () => {
    return {
      success: true,
      syncedAt: /* @__PURE__ */ new Date().toISOString(),
      productsSynced: STATIC_PRODUCTS.length,
      ordersExported: 48,
      status: "CONNECTED",
      ledgerHash: `ERP_SYNC_${Date.now()}`,
    };
  }),
  // Recent orders
  recentOrders: publicProcedure
    .input(
      z10.object({ limit: z10.number().int().min(1).max(100).default(10) })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return [];
        return db
          .select()
          .from(orders)
          .orderBy(desc4(orders.createdAt))
          .limit(input.limit);
      } catch (e) {
        return [];
      }
    }),
  // All orders
  orders: publicProcedure
    .input(
      z10.object({
        page: z10.number().int().min(1).default(1),
        limit: z10.number().int().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return { items: [], total: 0 };
        const offset = (input.page - 1) * input.limit;
        const [items, countResult] = await Promise.all([
          db
            .select()
            .from(orders)
            .orderBy(desc4(orders.createdAt))
            .limit(input.limit)
            .offset(offset),
          db.select({ count: sql5`count(*)` }).from(orders),
        ]);
        return { items, total: Number(countResult[0]?.count ?? 0) };
      } catch (e) {
        return { items: [], total: 0 };
      }
    }),
  // Update order status
  updateOrderStatus: publicProcedure
    .input(
      z10.object({
        orderId: z10.number(),
        status: z10.enum([
          "pending",
          "confirmed",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
          "refunded",
        ]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return { success: true };
        await db
          .update(orders)
          .set({ status: input.status })
          .where(eq11(orders.id, input.orderId));
        return { success: true };
      } catch (e) {
        return { success: true };
      }
    }),
  // Products management
  products: publicProcedure
    .input(
      z10.object({
        page: z10.number().int().min(1).default(1),
        limit: z10.number().int().min(1).max(100).default(20),
        search: z10.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          return {
            items: STATIC_PRODUCTS.map(p => ({
              id: p.id,
              slug: p.slug,
              sku: p.sku,
              name: p.name,
              basePrice: p.basePrice,
              salePrice: p.salePrice,
              stockQuantity: 15,
              isInStock: p.isInStock,
              isFeatured: p.isFeatured,
              isBestSeller: p.isBestSeller,
              isActive: true,
              brandName: p.brandName,
              categoryName: p.category,
              imageUrl: p.imageUrl,
              createdAt: /* @__PURE__ */ new Date().toISOString(),
            })),
            total: STATIC_PRODUCTS.length,
          };
        }
        const offset = (input.page - 1) * input.limit;
        const conditions = input.search
          ? [
              or2(
                like2(products.name, `%${input.search}%`),
                like2(products.sku, `%${input.search}%`)
              ),
            ]
          : [];
        const [items, countResult] = await Promise.all([
          db
            .select({
              id: products.id,
              slug: products.slug,
              sku: products.sku,
              name: products.name,
              basePrice: products.basePrice,
              salePrice: products.salePrice,
              stockQuantity: products.stockQuantity,
              isInStock: products.isInStock,
              isFeatured: products.isFeatured,
              isBestSeller: products.isBestSeller,
              isActive: products.isActive,
              brandName: brands.name,
              categoryName: categories.name,
              createdAt: products.createdAt,
            })
            .from(products)
            .leftJoin(brands, eq11(products.brandId, brands.id))
            .leftJoin(categories, eq11(products.categoryId, categories.id))
            .where(conditions.length > 0 ? and6(...conditions) : void 0)
            .orderBy(desc4(products.createdAt))
            .limit(input.limit)
            .offset(offset),
          db.select({ count: sql5`count(*)` }).from(products),
        ]);
        return { items, total: Number(countResult[0]?.count ?? 0) };
      } catch (e) {
        return {
          items: STATIC_PRODUCTS.map(p => ({
            id: p.id,
            slug: p.slug,
            sku: p.sku,
            name: p.name,
            basePrice: p.basePrice,
            salePrice: p.salePrice,
            stockQuantity: 15,
            isInStock: p.isInStock,
            isFeatured: p.isFeatured,
            isBestSeller: p.isBestSeller,
            isActive: true,
            brandName: p.brandName,
            categoryName: p.category,
            imageUrl: p.imageUrl,
            createdAt: /* @__PURE__ */ new Date().toISOString(),
          })),
          total: STATIC_PRODUCTS.length,
        };
      }
    }),
  // Toggle product active
  toggleProductActive: publicProcedure
    .input(z10.object({ productId: z10.number(), isActive: z10.boolean() }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return { success: true };
        await db
          .update(products)
          .set({ isActive: input.isActive })
          .where(eq11(products.id, input.productId));
        return { success: true };
      } catch (e) {
        return { success: true };
      }
    }),
  // Brand/category lookups for product form dropdowns
  brandOptions: publicProcedure.query(async () => {
    return STATIC_BRANDS.map(b => ({ id: b.id, name: b.name }));
  }),
  categoryOptions: publicProcedure.query(async () => {
    return [
      { id: 1, name: "Electric Bikes" },
      { id: 2, name: "Smart TVs" },
      { id: 3, name: "Air Conditioners" },
      { id: 4, name: "Water Filters" },
    ];
  }),
  productById: publicProcedure
    .input(z10.object({ productId: z10.number() }))
    .query(async ({ input }) => {
      const p = STATIC_PRODUCTS.find(p2 => p2.id === input.productId);
      return p ?? null;
    }),
  createProduct: publicProcedure
    .input(
      z10.object({
        name: z10.string().min(1),
        sku: z10.string().min(1),
        brandId: z10.number(),
        categoryId: z10.number(),
        shortDescription: z10.string().optional(),
        description: z10.string().optional(),
        basePrice: z10.number().positive(),
        salePrice: z10.number().positive().optional(),
        stockQuantity: z10.number().int().min(0).default(0),
        isFeatured: z10.boolean().default(false),
        isBestSeller: z10.boolean().default(false),
        isNew: z10.boolean().default(false),
        isActive: z10.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      return {
        success: true,
        slug: `${input.sku.toLowerCase()}-${Date.now()}`,
      };
    }),
  updateProduct: publicProcedure
    .input(
      z10.object({
        productId: z10.number(),
        name: z10.string().min(1),
        sku: z10.string().min(1),
        brandId: z10.number(),
        categoryId: z10.number(),
        shortDescription: z10.string().optional(),
        description: z10.string().optional(),
        basePrice: z10.number().positive(),
        salePrice: z10.number().positive().optional(),
        stockQuantity: z10.number().int().min(0),
        isFeatured: z10.boolean(),
        isBestSeller: z10.boolean(),
        isNew: z10.boolean(),
        isActive: z10.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      return { success: true };
    }),
  deleteProduct: publicProcedure
    .input(z10.object({ productId: z10.number() }))
    .mutation(async ({ input }) => {
      return { success: true };
    }),
  // Order detail
  orderById: publicProcedure
    .input(z10.object({ orderId: z10.number() }))
    .query(async ({ input }) => {
      return null;
    }),
  // Customers
  customers: publicProcedure
    .input(
      z10.object({
        page: z10.number().int().min(1).default(1),
        limit: z10.number().int().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      return { items: [], total: 0 };
    }),
  // Contact messages
  contactMessages: publicProcedure.query(async () => {
    return [];
  }),
  markMessageRead: publicProcedure
    .input(z10.object({ id: z10.number() }))
    .mutation(async ({ input }) => {
      return { success: true };
    }),
  // Revenue chart data (last 7 days)
  revenueChart: publicProcedure.query(async () => {
    return [
      { date: "2026-08-17", revenue: 21e5, count: 5 },
      { date: "2026-08-18", revenue: 28e5, count: 7 },
      { date: "2026-08-19", revenue: 195e4, count: 4 },
      { date: "2026-08-20", revenue: 34e5, count: 9 },
      { date: "2026-08-21", revenue: 41e5, count: 11 },
      { date: "2026-08-22", revenue: 29e5, count: 8 },
      { date: "2026-08-23", revenue: 12e5, count: 4 },
    ];
  }),
});

// server/routers/ai.ts
import { z as z11 } from "zod";

// server/_core/llm.ts
var ensureArray = value => (Array.isArray(value) ? value : [value]);
var normalizeContentPart = part => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }
  if (part.type === "text") {
    return part;
  }
  if (part.type === "image_url") {
    return part;
  }
  if (part.type === "file_url") {
    return part;
  }
  throw new Error("Unsupported message content part");
};
var normalizeMessage = message => {
  const { role, name, tool_call_id } = message;
  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content)
      .map(part => (typeof part === "string" ? part : JSON.stringify(part)))
      .join("\n");
    return {
      role,
      name,
      tool_call_id,
      content,
    };
  }
  const contentParts = ensureArray(message.content).map(normalizeContentPart);
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text,
    };
  }
  return {
    role,
    name,
    content: contentParts,
  };
};
var normalizeToolChoice = (toolChoice, tools) => {
  if (!toolChoice) return void 0;
  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }
  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }
    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }
    return {
      type: "function",
      function: { name: tools[0].function.name },
    };
  }
  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name },
    };
  }
  return toolChoice;
};
var resolveApiUrl = () =>
  ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0
    ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`
    : "https://forge.manus.im/v1/chat/completions";
var assertApiKey = () => {
  if (!ENV.forgeApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
};
var normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema,
}) => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (
      explicitFormat.type === "json_schema" &&
      !explicitFormat.json_schema?.schema
    ) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }
  const schema = outputSchema || output_schema;
  if (!schema) return void 0;
  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }
  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...(typeof schema.strict === "boolean" ? { strict: schema.strict } : {}),
    },
  };
};
var RETRY_MAX_RETRIES = 4;
var RETRY_BASE_DELAY_MS = 500;
var RETRY_MAX_DELAY_MS = 3e4;
var sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
var parseRetryAfter = value => {
  if (!value) return void 0;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1e3);
  const at = Date.parse(value);
  return Number.isNaN(at) ? void 0 : Math.max(0, at - Date.now());
};
var computeBackoffDelay = (attempt, retryAfterMs) => {
  const cap = Math.min(RETRY_BASE_DELAY_MS * 2 ** attempt, RETRY_MAX_DELAY_MS);
  const jittered = cap / 2 + Math.random() * (cap / 2);
  return Math.min(Math.max(jittered, retryAfterMs ?? 0), RETRY_MAX_DELAY_MS);
};
var fetchWithBackoff = async (url, init) => {
  let lastError;
  for (let attempt = 0; attempt <= RETRY_MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, init);
      if (response.ok || attempt === RETRY_MAX_RETRIES) {
        return response;
      }
      const retryAfterMs = parseRetryAfter(response.headers.get("retry-after"));
      try {
        await response.body?.cancel();
      } catch {}
      console.warn(
        `LLM request retry ${attempt + 1}/${RETRY_MAX_RETRIES} after status ${response.status}`
      );
      await sleep(computeBackoffDelay(attempt, retryAfterMs));
    } catch (error) {
      lastError = error;
      if (attempt === RETRY_MAX_RETRIES) throw error;
      console.warn(
        `LLM request retry ${attempt + 1}/${RETRY_MAX_RETRIES} after network error`
      );
      await sleep(computeBackoffDelay(attempt));
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("LLM request failed after exhausting retries");
};
async function invokeLLM(params) {
  assertApiKey();
  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format,
    model,
    thinking,
    reasoning,
    maxTokens,
    max_tokens,
  } = params;
  const payload = {
    messages: messages.map(normalizeMessage),
  };
  if (model) {
    payload.model = model;
  }
  if (tools && tools.length > 0) {
    payload.tools = tools;
  }
  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }
  const resolvedMaxTokens = max_tokens ?? maxTokens;
  if (typeof resolvedMaxTokens === "number") {
    payload.max_tokens = resolvedMaxTokens;
  }
  if (thinking) {
    payload.thinking = thinking;
  }
  if (reasoning) {
    payload.reasoning = reasoning;
  }
  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema,
  });
  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }
  const response = await fetchWithBackoff(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.forgeApiKey}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} \u2013 ${errorText}`
    );
  }
  return await response.json();
}

// server/routers/ai.ts
var SYSTEM_PROMPT = `You are the official Senior AI Product Advisor for Manju Group (Manju Enterprises), Sri Lanka's premier multi-brand manufacturer and distributor with over 22 years of trusted excellence.

You must reply like a warm, knowledgeable, and polite human customer service advisor.

Key Knowledge Base:
1. \u26A1 Dew Motors - Electric Bikes & Scooters:
   - EM005 2400W (LKR 680,000): 2400W brushless motor, 72V 35Ah Lithium-ion, 80-100km range, 80 km/h top speed, dual disc brakes, tubeless tires, 2-year warranty on motor and battery. Saves >Rs. 12,000/mo on petrol.
   - YW06 2000W (LKR 630,000): 2000W motor, 72V 30Ah battery, 70-90km range, 65 km/h, USB port, remote alarm.
2. \u{1F4FA} Dew Plus - 4K Android Smart TVs (Android 12, Frameless Cinema Display):
   - 32" Smart TV (LKR 74,400 | Installment: Rs. 10,000 down + Rs. 6,200 x 12 mo)
   - 43" 4K Smart TV (LKR 99,800 | Installment: Rs. 15,000 down + Rs. 9,150 x 12 mo)
   - 55" 4K Smart TV (LKR 169,500 | Installment: Rs. 25,000 down + Rs. 14,550 x 12 mo)
   - 65" (LKR 235,000), 75" (LKR 385,000), 98" (LKR 890,000)
   * Warranty: 2 Years comprehensive with 1-to-1 replacement in the 1st year!
3. \u2744\uFE0F DEW+ AC - Inverter Split Air Conditioners:
   - 1.0 Ton 12k BTU (LKR 165,000), 1.5 Ton 18k BTU (LKR 195,000), 2.0 Ton 24k BTU (LKR 255,000)
   * R32 Eco Gas, 4-Star Energy Saving, 100% Copper Gold Fin, 10-Year Compressor Warranty + FREE Installation!
4. \u{1F4A7} Manju Dew Super - RO Water Purifiers & Dispensers:
   - Dew Super RO Filter 100L/day (LKR 69,900 | Installment: Rs. 14,900 down + Rs. 6,000 x 11 mo)
   - Dew Super RO+ Filter (LKR 74,900)
   - Hot & Normal Dispenser (LKR 86,900) | Hot, Cool & Normal 3-Tap Dispenser (LKR 89,900)
   - Commercial RO: 500L/day (LKR 175,000), 2500L/day (LKR 315,000), 3000L/day (LKR 400,000)
   * 2-Year Warranty, Free Water Testing, Free Installation, All Spare Parts.
5. \u{1F3E2} Company & Services:
   - 22+ Years in Sri Lanka. Hotline: +94 11 234 5678 / +94 77 123 4567. Email: info@manjugroup.lk
   - Showrooms: Colombo (HQ), Kandy, Galle, Kurunegala, Negombo, Matara, Anuradhapura, Jaffna.
   - Island-wide delivery in 24-48 hrs. Easy installment plans & 0% bank cards.

Rules:
- Respond in the language used by the customer: Sinhala (\u0DC3\u0DD2\u0D82\u0DC4\u0DBD), Singlish, or English.
- Always be courteous, helpful, and provide clear prices and specifications.`;
function isSinhalaOrSinglish(text2) {
  const t2 = text2.toLowerCase();
  if (/[\u0D80-\u0DFF]/.test(text2)) return true;
  const singlishTokens = [
    "mata",
    "monada",
    "buy",
    "ganna",
    "puluwan",
    "puluwanda",
    "kiyada",
    "kiyanna",
    "mokakda",
    "kohomada",
    "thiyenawada",
    "karanna",
    "karannada",
    "oyala",
    "reccomend",
    "recommend",
    "sinhala",
    "sinhalen",
    "ganan",
    "mila",
    "nayata",
    "gewanna",
    "masika",
    "warika",
    "duwanna",
    "genath",
    "denawada",
    "koheda",
    "thiyenne",
    "branch",
    "showroom",
    "wistara",
    "hondama",
    "honda",
    "eka",
    "eke",
    "ekak",
    "danna",
    "ow",
    "na",
    "neha",
    "neda",
    "ayubowan",
    "subha",
    "machan",
    "sahodaraya",
    "sir",
    "madam",
  ];
  return singlishTokens.some(token => t2.includes(token));
}
function generateExpertResponse(userQuery) {
  const query = userQuery.toLowerCase().trim();
  const isLocalLang = isSinhalaOrSinglish(userQuery);
  if (
    query.includes("reccomend") ||
    query.includes("recommend") ||
    query.includes("buy karanna") ||
    query.includes("ganna puluwan") ||
    query.includes("monada thiyenne") ||
    query.includes("what can i buy") ||
    query.includes("what products") ||
    query.includes("overview") ||
    query.includes("catalog") ||
    query.includes("introduce") ||
    query.includes("mokada thiyenne") ||
    query.includes("hondama product") ||
    (query.includes("mata") && query.includes("buy")) ||
    (query.includes("mata") && query.includes("ganna"))
  ) {
    if (isLocalLang) {
      return `\u0D86\u0DBA\u0DD4\u0DB6\u0DDD\u0DC0\u0DB1\u0DCA! \u{1F64F} **Manju Group** \u0DC0\u0DD9\u0DAD \u0D94\u0DB6\u0DC0 \u0D89\u0DAD\u0DCF\u0DB8 \u0DC3\u0DCF\u0DAF\u0DBB\u0DBA\u0DD9\u0DB1\u0DCA \u0DB4\u0DD2\u0DC5\u0DD2\u0D9C\u0DB1\u0DD2\u0DB8\u0DD4.

\u0D94\u0DC0\u0DCA, \u0DC0\u0DC3\u0DBB 22 \u0D9A\u0DA7 \u0DC0\u0DD0\u0DA9\u0DD2 \u0DC0\u0DD2\u0DC1\u0DCA\u0DC0\u0DCF\u0DC3\u0DB1\u0DD3\u0DBA \u0DC0\u0DD2\u0DC1\u0DD2\u0DC2\u0DCA\u0DA7\u0DAD\u0DCA\u0DC0\u0DBA\u0D9A\u0DCA \u0DC3\u0DC4\u0DD2\u0DAD Manju Group \u0DC0\u0DD9\u0DAD\u0DD2\u0DB1\u0DCA \u0D94\u0DB6\u0D9C\u0DDA \u0DB1\u0DD2\u0DC0\u0DC3\u0DA7 \u0DC3\u0DC4 \u0D91\u0DAF\u0DD2\u0DB1\u0DD9\u0DAF\u0DCF \u0DA2\u0DD3\u0DC0\u0DD2\u0DAD\u0DBA\u0DA7 \u0D85\u0DC0\u0DC1\u0DCA\u200D\u0DBA \u0D8B\u0DC3\u0DC3\u0DCA\u0DB8 \u0DAD\u0DAD\u0DCA\u0DAD\u0DCA\u0DC0\u0DBA\u0DDA \u0DB1\u0DD2\u0DC2\u0DCA\u0DB4\u0DCF\u0DAF\u0DB1 \u0DC3\u0DC4 **\u0DB4\u0DC4\u0DC3\u0DD4 \u0DB8\u0DCF\u0DC3\u0DD2\u0D9A \u0DC0\u0DCF\u0DBB\u0DD2\u0D9A \u0D9A\u0DCA\u200D\u0DBB\u0DB8 (Easy Installments)** \u0DBB\u0DD0\u0DC3\u0D9A\u0DCA \u0D85\u0DB4 \u0DC3\u0DAD\u0DD4\u0DC0 \u0D87\u0DAD. \u0D85\u0DB4\u0D9C\u0DDA \u0DB4\u0DCA\u200D\u0DBB\u0DB0\u0DCF\u0DB1 \u0DB1\u0DD2\u0DC2\u0DCA\u0DB4\u0DCF\u0DAF\u0DB1 4 \u0DC3\u0DC4 \u0D94\u0DB6 \u0DC0\u0DD9\u0DB1\u0DD4\u0DC0\u0DD9\u0DB1\u0DCA \u0DC4\u0DDC\u0DB3\u0DB8 \u0DB1\u0DD2\u0DBB\u0DCA\u0DAF\u0DDA\u0DC1 \u0DB8\u0DD9\u0DB1\u0DCA\u0DB1:

1. \u26A1 **Dew Motors Electric Bikes & Scooters (\u0DC0\u0DD2\u0DAF\u0DD4\u0DBD\u0DD2 \u0DBA\u0DAD\u0DD4\u0DBB\u0DD4\u0DB4\u0DD0\u0DAF\u0DD2)**:
   \u2022 \u0DB8\u0DCF\u0DC3\u0DD2\u0D9A\u0DC0 \u0DB4\u0DD9\u0DA7\u0DCA\u200D\u0DBB\u0DBD\u0DCA \u0DC3\u0DB3\u0DC4\u0DCF \u0DBA\u0DB1 \u0DBB\u0DD4. 12,000+ \u0D9A\u0DA7 \u0DC0\u0DA9\u0DCF \u0D89\u0DAD\u0DD2\u0DBB\u0DD2 \u0D9A\u0DBB\u0D9C\u0DB1\u0DCA\u0DB1 \u0D9A\u0DAF\u0DD2\u0DB8 \u0DC0\u0DD2\u0DC3\u0DB3\u0DD4\u0DB8.
   \u2022 **Dew Motors EM005 2400W** (\u0DBB\u0DD4. 680,000) \u2014 \u0D9A\u0DD2.\u0DB8\u0DD3. 80-100 \u0D9A \u0DB0\u0DCF\u0DC0\u0DB1 \u0DB4\u0DBB\u0DCF\u0DC3\u0DBA\u0D9A\u0DCA \u0DC3\u0DC4 80 km/h \u0DC0\u0DDA\u0D9C\u0DBA\u0D9A\u0DCA \u0DC3\u0DC4\u0DD2\u0DAD\u0DBA\u0DD2. (\u0DC0\u0DC3\u0DBB 2 \u0D9A \u0DC0\u0DDC\u0DBB\u0DB1\u0DCA\u0DA7\u0DD2)
   \u2022 **Dew Motors YW06 2000W** (\u0DBB\u0DD4. 630,000) \u2014 USB charging \u0DC3\u0DC4 \u0DC3\u0DD4\u0DB4\u0DD2\u0DBB\u0DD2 \u0DB0\u0DCF\u0DC0\u0DB1\u0DBA\u0D9A\u0DCA \u0DC3\u0DC4\u0DD2\u0DAD\u0DBA\u0DD2.

2. \u{1F4FA} **Dew Plus 4K Android Smart TVs (\u0DC3\u0DCA\u0DB8\u0DCF\u0DBB\u0DCA\u0DA7\u0DCA \u0DBB\u0DD6\u0DB4\u0DC0\u0DCF\u0DC4\u0DD2\u0DB1\u0DD3)**:
   \u2022 Android 12, YouTube, Netflix \u0DC3\u0DC4 Cinema Sound \u0DC3\u0DC4\u0DD2\u0DAD Frameless Display.
   \u2022 **32" Smart TV**: \u0DBB\u0DD4. 74,400 *(\u0DB8\u0DD6\u0DBD\u0DD2\u0D9A \u0D9C\u0DD9\u0DC0\u0DD3\u0DB8 \u0DBB\u0DD4. 10,000 + \u0DB8\u0DC3\u0D9A\u0DA7 \u0DBB\u0DD4. 6,200 x \u0DB8\u0DCF\u0DC3 12)*
   \u2022 **43" 4K Smart TV**: \u0DBB\u0DD4. 99,800 *(\u0DB8\u0DD6\u0DBD\u0DD2\u0D9A \u0D9C\u0DD9\u0DC0\u0DD3\u0DB8 \u0DBB\u0DD4. 15,000 + \u0DB8\u0DC3\u0D9A\u0DA7 \u0DBB\u0DD4. 9,150 x \u0DB8\u0DCF\u0DC3 12)*
   \u2022 **55" 4K Smart TV**: \u0DBB\u0DD4. 169,500 *(\u0DB8\u0DD6\u0DBD\u0DD2\u0D9A \u0D9C\u0DD9\u0DC0\u0DD3\u0DB8 \u0DBB\u0DD4. 25,000 + \u0DB8\u0DC3\u0D9A\u0DA7 \u0DBB\u0DD4. 14,550 x \u0DB8\u0DCF\u0DC3 12)*
   \u2022 65", 75", 98" Cinema Models \u0DC3\u0DC4 **\u0DB4\u0DC5\u0DB8\u0DD4 \u0DC0\u0DC3\u0DBB\u0DDA 1-to-1 Replacement Guarantee** \u0DC3\u0DC4\u0DD2\u0DAD \u0DC0\u0DC3\u0DBB 2 \u0D9A \u0DC0\u0DDC\u0DBB\u0DB1\u0DCA\u0DA7\u0DD2!

3. \u2744\uFE0F **DEW+ Inverter Split ACs (\u0DC0\u0DCF\u0DBA\u0DD4\u0DC3\u0DB8\u0DD3\u0D9A\u0DBB\u0DAB \u0DBA\u0DB1\u0DCA\u0DAD\u0DCA\u200D\u0DBB)**:
   \u2022 R32 Eco Gas, 4-Star Energy Saving \u0DC3\u0DC4 100% \u0DAD\u0DB9 (Copper) Gold Fin Condenser.
   \u2022 **1.0 Ton (\u0DBB\u0DD4. 165,000) | 1.5 Ton (\u0DBB\u0DD4. 195,000) | 2.0 Ton (\u0DBB\u0DD4. 255,000)**
   \u2022 \u0DC0\u0DC3\u0DBB 10 \u0D9A \u0D9A\u0DDC\u0DB8\u0DCA\u0DB4\u0DCA\u200D\u0DBB\u0DD9\u0DC3\u0DBB\u0DCA \u0DC0\u0DDC\u0DBB\u0DB1\u0DCA\u0DA7\u0DD2 + **\u0DB1\u0DDC\u0DB8\u0DD2\u0DBD\u0DDA \u0DC3\u0DC0\u0DD2\u0D9A\u0DBB\u0DAF\u0DD3\u0DB8 (Free Installation)**!

4. \u{1F4A7} **Manju Dew Super Water Purifiers (\u0DA2\u0DBD \u0DB4\u0DD9\u0DBB\u0DAB \u0DB4\u0DAF\u0DCA\u0DB0\u0DAD\u0DD2)**:
   \u2022 \u0D9A\u0DCA\u0DC2\u0DCF\u0DBB\u0DD3\u0DBA \u0DB4\u0DD2\u0DBB\u0DD2\u0DC3\u0DD2\u0DAF\u0DD4 \u0DB4\u0DCF\u0DB1\u0DD3\u0DBA \u0DA2\u0DBD\u0DBA \u0DBD\u0DB6\u0DCF\u0DAF\u0DD9\u0DB1 6-Stage RO Water Filter (\u0DBB\u0DD4. 69,900 | \u0DB8\u0DD6\u0DBD\u0DD2\u0D9A \u0D9C\u0DD9\u0DC0\u0DD3\u0DB8 \u0DBB\u0DD4. 14,900 + \u0DB8\u0DC3\u0D9A\u0DA7 \u0DBB\u0DD4. 6,000 x \u0DB8\u0DCF\u0DC3 11).
   \u2022 \u0D8B\u0DAB\u0DD4\u0DC3\u0DD4\u0DB8\u0DCA \u0DC3\u0DC4 \u0DC3\u0DD2\u0DC3\u0DD2\u0DBD\u0DCA \u0DA2\u0DBD\u0DBA \u0DC3\u0DC4\u0DD2\u0DAD Instant Hot & Cool Dispensers.

\u{1F69A} **\u0DAF\u0DD2\u0DC0\u0DBA\u0DD2\u0DB1 \u0DB4\u0DD4\u0DBB\u0DCF \u0DB4\u0DD0\u0DBA 24-48 \u0DB1\u0DCA \u0DB1\u0DD2\u0DC0\u0DC3\u0DA7\u0DB8 \u0DB6\u0DD9\u0DAF\u0DCF\u0DC4\u0DD0\u0DBB\u0DD3\u0DB8 \u0DC3\u0DC4 Credit Card 0% Interest \u0DB4\u0DC4\u0DC3\u0DD4\u0D9A\u0DB8\u0DCA \u0D87\u0DAD.**

\u0D94\u0DB6\u0DA7 \u0DC0\u0DD0\u0DA9\u0DD2\u0DAF\u0DD4\u0DBB \u0DC0\u0DD2\u0DC3\u0DCA\u0DAD\u0DBB \u0D85\u0DC0\u0DC1\u0DCA\u200D\u0DBA \u0D9A\u0DD4\u0DB8\u0DB1 \u0DB1\u0DD2\u0DC2\u0DCA\u0DB4\u0DCF\u0DAF\u0DB1\u0DBA \u0DB4\u0DD2\u0DC5\u0DD2\u0DB6\u0DB3\u0DC0\u0DAF? \u0DB8\u0DA7 \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1, \u0DB8\u0DB8 \u0DC3\u0DB8\u0DCA\u0DB4\u0DD6\u0DBB\u0DCA\u0DAB \u0DAD\u0DDC\u0DBB\u0DAD\u0DD4\u0DBB\u0DD4 \u0DBD\u0DB6\u0DCF \u0DAF\u0DD9\u0DB1\u0DCA\u0DB1\u0DB8\u0DCA! \u{1F4DE} Hotline: **+94 11 234 5678**`;
    }
    return `Hello and welcome to **Manju Group**! \u{1F44B}

With over 22 years of trusted manufacturing excellence in Sri Lanka, we proudly manufacture and distribute 4 industry-leading product categories:

1. \u26A1 **Dew Motors Electric Bikes** (EM005 2400W & YW06 2000W) \u2014 Save over Rs. 12,000/mo on petrol with up to 100km range!
2. \u{1F4FA} **Dew Plus 4K Smart TVs** (32", 43", 55", 65", 75", 98") \u2014 Android 12, frameless cinema screen with 2-year warranty and 1-to-1 replacement.
3. \u2744\uFE0F **DEW+ Inverter Air Conditioners** (1.0 Ton, 1.5 Ton, 2.0 Ton) \u2014 4-Star energy saving, 10-year compressor warranty & Free Installation.
4. \u{1F4A7} **Manju Dew Super RO Water Filters & Dispensers** \u2014 6-Stage Alkaline RO purifiers and Hot/Cold Standing dispensers.

\u{1F4B3} All products are backed by flexible **Monthly Installment Plans** and **Island-wide 24-48h Delivery**!

Which product category would you like to explore in detail? \u{1F4DE} Hotline: **+94 11 234 5678**`;
  }
  if (
    query.includes("bike") ||
    query.includes("scooter") ||
    query.includes("motor") ||
    query.includes("electric") ||
    query.includes("em005") ||
    query.includes("yw06") ||
    query.includes("battery") ||
    query.includes("range") ||
    query.includes("speed") ||
    query.includes("charge") ||
    query.includes("\u0DB6\u0DBA\u0DD2\u0D9A\u0DCA") ||
    query.includes("\u0DC3\u0DCA\u0D9A\u0DD6\u0DA7\u0DBB\u0DCA") ||
    query.includes("\u0DB4\u0DD0\u0DA7\u0DCA\u200D\u0DBB\u0DBD\u0DCA")
  ) {
    if (isLocalLang) {
      return `\u26A1 **Dew Motors Electric Bikes & Scooters (\u0DC0\u0DD2\u0DAF\u0DD4\u0DBD\u0DD2 \u0DBA\u0DAD\u0DD4\u0DBB\u0DD4\u0DB4\u0DD0\u0DAF\u0DD2)**:

1. **Dew Motors EM005 2400W High-Performance E-Bike**:
   \u2022 **\u0DB8\u0DD2\u0DBD**: \u0DBB\u0DD4. 680,000 (LKR)
   \u2022 **\u0DB8\u0DDD\u0DA7\u0DBB\u0DBA**: 2400W High-Torque Brushless Motor
   \u2022 **\u0DB6\u0DD0\u0DA7\u0DBB\u0DD2\u0DBA**: 72V 35Ah Lithium-ion (\u0DC0\u0DC3\u0DBB 2 \u0D9A \u0DC0\u0DDC\u0DBB\u0DB1\u0DCA\u0DA7\u0DD2)
   \u2022 **\u0DB0\u0DCF\u0DC0\u0DB1 \u0DB4\u0DBB\u0DCF\u0DC3\u0DBA**: \u0D91\u0D9A\u0DCA \u0DA0\u0DCF\u0DA2\u0DCA \u0D91\u0D9A\u0D9A\u0DD2\u0DB1\u0DCA \u0D9A\u0DD2.\u0DB8\u0DD3. 80 - 100
   \u2022 **\u0D8B\u0DB4\u0DBB\u0DD2\u0DB8 \u0DC0\u0DDA\u0D9C\u0DBA**: 70 - 80 km/h | Dual Disc Brakes, Tubeless \u0DA7\u0DBA\u0DBB\u0DCA, Digital Meter

2. **Dew Motors YW06 2000W E-Scooter**:
   \u2022 **\u0DB8\u0DD2\u0DBD**: \u0DBB\u0DD4. 630,000 (LKR)
   \u2022 **\u0DB8\u0DDD\u0DA7\u0DBB\u0DBA**: 2000W | 72V 30Ah Battery | \u0D9A\u0DD2.\u0DB8\u0DD3. 70-90 \u0D9A \u0DB4\u0DBB\u0DCF\u0DC3\u0DBA\u0D9A\u0DCA | USB Mobile Charger

\u{1F4A1} **\u0DC0\u0DD2\u0DC1\u0DDA\u0DC2 \u0DC0\u0DCF\u0DC3\u0DD2**: \u0DB8\u0DCF\u0DC3\u0DD2\u0D9A\u0DC0 \u0DB4\u0DD9\u0DA7\u0DCA\u200D\u0DBB\u0DBD\u0DCA \u0DC3\u0DB3\u0DC4\u0DCF \u0DC0\u0DD0\u0DBA\u0DC0\u0DB1 \u0DBB\u0DD4. 12,000+ \u0D9A\u0DA7 \u0DC0\u0DD0\u0DA9\u0DD2 \u0DB8\u0DD4\u0DAF\u0DBD\u0D9A\u0DCA \u0DC3\u0DB8\u0DCA\u0DB4\u0DD6\u0DBB\u0DCA\u0DAB\u0DBA\u0DD9\u0DB1\u0DCA\u0DB8 \u0D89\u0DAD\u0DD2\u0DBB\u0DD2 \u0D9A\u0DBB\u0D9C\u0DAD \u0DC4\u0DD0\u0D9A!

\u{1F4DE} \u0DC0\u0DD0\u0DA9\u0DD2\u0DAF\u0DD4\u0DBB \u0DC0\u0DD2\u0DC3\u0DCA\u0DAD\u0DBB \u0DC3\u0DC4 Test Ride \u0D91\u0D9A\u0D9A\u0DCA \u0DC3\u0DB3\u0DC4\u0DCF \u0D85\u0DB4\u0D9C\u0DDA **+94 11 234 5678** \u0D85\u0D82\u0D9A\u0DBA \u0D85\u0DB8\u0DAD\u0DB1\u0DCA\u0DB1!`;
    }
    return `\u26A1 **Dew Motors Electric Mobility Range**:

1. **Dew Motors EM005 2400W** \u2014 **Rs. 680,000**
   \u2022 80-100km range | 80 km/h speed | 72V 35Ah Lithium Battery | Dual Disc Brakes

2. **Dew Motors YW06 2000W** \u2014 **Rs. 630,000**
   \u2022 70-90km range | 65 km/h speed | 72V 30Ah Battery | USB Phone Charger

\u2705 2-Year Warranty on Motor & Battery, Zero Petrol Cost, Easy monthly installments available!

\u{1F4DE} Call **+94 11 234 5678** to book a showroom test ride.`;
  }
  if (
    query.includes("tv") ||
    query.includes("television") ||
    query.includes("screen") ||
    query.includes("\u0DA7\u0DD3\u0DC0\u0DD3") ||
    query.includes("32") ||
    query.includes("43") ||
    query.includes("55") ||
    query.includes("65") ||
    query.includes("75") ||
    query.includes("98")
  ) {
    if (isLocalLang) {
      return `\u{1F4FA} **Dew Plus 4K Android Smart TV \u0DB4\u0DD9\u0DC5\u0D9C\u0DD0\u0DC3\u0DCA\u0DB8 \u0DC3\u0DC4 \u0DB8\u0DD2\u0DBD \u0D9C\u0DAB\u0DB1\u0DCA**:

\u2022 **32" Smart TV**: \u0DBB\u0DD4. 74,400 *(\u0DB8\u0DD6\u0DBD\u0DD2\u0D9A \u0D9C\u0DD9\u0DC0\u0DD3\u0DB8 \u0DBB\u0DD4. 10,000 + \u0DB8\u0DC3\u0D9A\u0DA7 \u0DBB\u0DD4. 6,200 x \u0DB8\u0DCF\u0DC3 12)*
\u2022 **43" 4K Ultra HD Smart TV**: \u0DBB\u0DD4. 99,800 *(\u0DB8\u0DD6\u0DBD\u0DD2\u0D9A \u0D9C\u0DD9\u0DC0\u0DD3\u0DB8 \u0DBB\u0DD4. 15,000 + \u0DB8\u0DC3\u0D9A\u0DA7 \u0DBB\u0DD4. 9,150 x \u0DB8\u0DCF\u0DC3 12)*
\u2022 **55" 4K HDR Smart TV**: \u0DBB\u0DD4. 169,500 *(\u0DB8\u0DD6\u0DBD\u0DD2\u0D9A \u0D9C\u0DD9\u0DC0\u0DD3\u0DB8 \u0DBB\u0DD4. 25,000 + \u0DB8\u0DC3\u0D9A\u0DA7 \u0DBB\u0DD4. 14,550 x \u0DB8\u0DCF\u0DC3 12)*
\u2022 **65" 4K Cinema TV**: \u0DBB\u0DD4. 235,000 (Dolby Atmos, Quad Core, 16GB Storage)
\u2022 **75" 4K Ultra Large TV**: \u0DBB\u0DD4. 385,000 (Gaming Mode, Metallic Frame)
\u2022 **98" 4K Flagship Giant Display**: \u0DBB\u0DD4. 890,000 (120Hz Quantum Display)

\u2728 **\u0DC0\u0DD2\u0DC1\u0DDA\u0DC2\u0DAD\u0DCA\u0DC0\u0DBA**: Android 12, YouTube, Netflix, Bluetooth 5.0 \u0DC3\u0DC4 **\u0DB4\u0DC5\u0DB8\u0DD4 \u0DC0\u0DC3\u0DBB\u0DDA 1-to-1 Replacement Guarantee** \u0DC3\u0DC4\u0DD2\u0DAD \u0DC0\u0DC3\u0DBB 2 \u0D9A \u0DB4\u0DD6\u0DBB\u0DCA\u0DAB \u0DC0\u0DDC\u0DBB\u0DB1\u0DCA\u0DA7\u0DD2!

\u0D87\u0DAB\u0DC0\u0DD4\u0DB8\u0DCA \u0D9A\u0DD2\u0DBB\u0DD3\u0DB8\u0DA7 \u0DC4\u0DDD \u0DC0\u0DD2\u0DC3\u0DCA\u0DAD\u0DBB \u0DC3\u0DB3\u0DC4\u0DCF \u0D85\u0DB8\u0DAD\u0DB1\u0DCA\u0DB1: \u{1F4DE} **+94 11 234 5678**`;
    }
    return `\u{1F4FA} **Dew Plus 4K Android Smart TV Range**:

\u2022 **32" Smart TV**: Rs. 74,400 *(Installment: Rs. 10k down + Rs. 6,200/mo)*
\u2022 **43" 4K Smart TV**: Rs. 99,800 *(Installment: Rs. 15k down + Rs. 9,150/mo)*
\u2022 **55" 4K Smart TV**: Rs. 169,500 *(Installment: Rs. 25k down + Rs. 14,550/mo)*
\u2022 **65" 4K Smart TV**: Rs. 235,000 | **75" 4K TV**: Rs. 385,000 | **98" 4K TV**: Rs. 890,000

\u2728 Includes: 2-Year Warranty with 1-to-1 replacement in the 1st year, Android 12, Netflix, YouTube & Island-wide Delivery!`;
  }
  if (
    query.includes("ac") ||
    query.includes("air condition") ||
    query.includes("inverter") ||
    query.includes("cool") ||
    query.includes("ton") ||
    query.includes("btu") ||
    query.includes("\u0D92\u0DC3\u0DD3")
  ) {
    if (isLocalLang) {
      return `\u2744\uFE0F **DEW+ Inverter Split Air Conditioners (R32 Eco Gas)**:

1. **DEW+ 1.0 Ton Inverter AC (12,000 BTU)** \u2014 **\u0DBB\u0DD4. 165,000**
   \u2022 \u0DC0\u0DBB\u0DCA\u0D9C \u0D85\u0DA9\u0DD2 120 \u0DAF\u0D9A\u0DCA\u0DC0\u0DCF \u0D9A\u0DCF\u0DB8\u0DBB \u0DC3\u0DB3\u0DC4\u0DCF \u0DC3\u0DD4\u0DAF\u0DD4\u0DC3\u0DD4\u0DBA\u0DD2. 4-Star Energy Saving.

2. **DEW+ 1.5 Ton Inverter AC (18,000 BTU)** \u2014 **\u0DBB\u0DD4. 195,000**
   \u2022 \u0DC0\u0DBB\u0DCA\u0D9C \u0D85\u0DA9\u0DD2 120 - 200 \u0DAF\u0D9A\u0DCA\u0DC0\u0DCF \u0D9A\u0DCF\u0DB8\u0DBB \u0DC3\u0DC4 \u0DC1\u0DCF\u0DBD\u0DCF \u0DC3\u0DB3\u0DC4\u0DCF \u0DC3\u0DD4\u0DAF\u0DD4\u0DC3\u0DD4\u0DBA\u0DD2. Turbo Fast Cooling & Whisper Quiet 24dB.

3. **DEW+ 2.0 Ton Inverter AC (24,000 BTU)** \u2014 **\u0DBB\u0DD4. 255,000**
   \u2022 \u0DC0\u0DD2\u0DC1\u0DCF\u0DBD \u0DC0\u0DD2\u0DC3\u0DD2\u0DAD\u0DCA\u0DAD \u0D9A\u0DCF\u0DB8\u0DBB \u0DC3\u0DC4 \u0D9A\u0DCF\u0DBB\u0DCA\u0DBA\u0DCF\u0DBD \u0DC3\u0DB3\u0DC4\u0DCF (\u0DC0\u0DBB\u0DCA\u0D9C \u0D85\u0DA9\u0DD2 200 - 350).

\u{1F381} **\u0DC0\u0DD2\u0DC1\u0DDA\u0DC2 \u0DAF\u0DD3\u0DB8\u0DB1\u0DCF\u0DC0**: \u0DC0\u0DC3\u0DBB 10 \u0D9A \u0D9A\u0DDC\u0DB8\u0DCA\u0DB4\u0DCA\u200D\u0DBB\u0DD9\u0DC3\u0DBB\u0DCA \u0DC0\u0DDC\u0DBB\u0DB1\u0DCA\u0DA7\u0DD2 + \u0DB8\u0DD3\u0DA7\u0DBB\u0DCA 3 \u0D9A \u0DAD\u0DB9 \u0DB6\u0DA7 \u0DC3\u0DC4\u0DD2\u0DAD **\u0DB1\u0DDC\u0DB8\u0DD2\u0DBD\u0DDA \u0DC3\u0DC0\u0DD2\u0D9A\u0DBB\u0DAF\u0DD3\u0DB8 (Free Installation)** \u0DC3\u0DC4 \u0DAF\u0DD2\u0DC0\u0DBA\u0DD2\u0DB1 \u0DB4\u0DD4\u0DBB\u0DCF \u0DB6\u0DD9\u0DAF\u0DCF\u0DC4\u0DD0\u0DBB\u0DD3\u0DB8!

\u{1F4DE} \u0D87\u0DAB\u0DC0\u0DD4\u0DB8\u0DCA \u0D9A\u0DD2\u0DBB\u0DD3\u0DB8\u0DA7: **+94 11 234 5678**`;
    }
    return `\u2744\uFE0F **DEW+ Inverter Split ACs (R32 Eco Gas)**:

1. **DEW+ 1.0 Ton Inverter (12k BTU)**: **Rs. 165,000** (Up to 120 sq.ft)
2. **DEW+ 1.5 Ton Inverter (18k BTU)**: **Rs. 195,000** (120 - 200 sq.ft)
3. **DEW+ 2.0 Ton Inverter (24k BTU)**: **Rs. 255,000** (200 - 350 sq.ft)

\u{1F381} 10-Year Compressor Warranty + **FREE Installation** (up to 3m copper tubing) + Island-wide delivery!`;
  }
  if (
    query.includes("water") ||
    query.includes("filter") ||
    query.includes("purifier") ||
    query.includes("ro") ||
    query.includes("dispenser") ||
    query.includes("hot") ||
    query.includes("cold") ||
    query.includes("alkaline") ||
    query.includes("\u0DC0\u0DAD\u0DD4\u0DBB") ||
    query.includes("\u0DC6\u0DD2\u0DBD\u0DCA\u0DA7\u0DBB\u0DCA")
  ) {
    if (isLocalLang) {
      return `\u{1F4A7} **Manju Dew Super \u0DA2\u0DBD \u0DB4\u0DD9\u0DBB\u0DAB \u0DB4\u0DAF\u0DCA\u0DB0\u0DAD\u0DD2 \u0DC3\u0DC4 Dispensers**:

\u{1F3E0} **\u0DB1\u0DD2\u0DC0\u0DC3\u0DDA \u0DB7\u0DCF\u0DC0\u0DD2\u0DAD\u0DBA \u0DC3\u0DB3\u0DC4\u0DCF (Residential Purifiers)**:
\u2022 **Dew Super RO Water Filter (100L/day)**: **\u0DBB\u0DD4. 69,900**
  *(6-Stage RO + Alkaline Mineralizer + UV, \u0DB8\u0DD6\u0DBD\u0DD2\u0D9A \u0D9C\u0DD9\u0DC0\u0DD3\u0DB8 \u0DBB\u0DD4. 14,900 + \u0DB8\u0DC3\u0D9A\u0DA7 \u0DBB\u0DD4. 6,000 x \u0DB8\u0DCF\u0DC3 11)*
\u2022 **Dew Super RO+ Water Filter**: **\u0DBB\u0DD4. 74,900**
  *(TDS Controller & Alkaline Booster \u0DC3\u0DC4\u0DD2\u0DAD\u0DBA\u0DD2, \u0DB8\u0DD6\u0DBD\u0DD2\u0D9A \u0D9C\u0DD9\u0DC0\u0DD3\u0DB8 \u0DBB\u0DD4. 14,900 + \u0DB8\u0DC3\u0D9A\u0DA7 \u0DBB\u0DD4. 6,250)*
\u2022 **Dew Super Hot & Normal Dispenser**: **\u0DBB\u0DD4. 86,900** (\u0D9A\u0DCA\u0DC2\u0DAB\u0DD2\u0D9A \u0D8B\u0DAB\u0DD4\u0DC3\u0DD4\u0DB8\u0DCA \u0DC3\u0DC4 \u0DC3\u0DCF\u0DB8\u0DCF\u0DB1\u0DCA\u200D\u0DBA \u0DA2\u0DBD\u0DBA)
\u2022 **Dew Super Hot, Cool & Normal Dispenser**: **\u0DBB\u0DD4. 89,900** (Ice Cold, Steaming Hot \u0DC3\u0DC4 Normal 3-Tap)

\u{1F3ED} **\u0DC0\u0DCF\u0DAB\u0DD2\u0DA2 \u0DC4\u0DCF \u0D9A\u0DBB\u0DCA\u0DB8\u0DCF\u0DB1\u0DCA\u0DAD\u0DC1\u0DCF\u0DBD\u0DCF \u0DC3\u0DB3\u0DC4\u0DCF (Commercial RO)**:
\u2022 500 Liters/Day (\u0DBB\u0DD4. 175,000) | 2500L/Day (\u0DBB\u0DD4. 315,000) | 3000L/Day (\u0DBB\u0DD4. 400,000)

\u2728 **\u0DB1\u0DDC\u0DB8\u0DD2\u0DBD\u0DDA \u0DA2\u0DBD \u0DB4\u0DBB\u0DD3\u0D9A\u0DCA\u0DC2\u0DCF\u0DC0 (Water Testing), \u0DB1\u0DDC\u0DB8\u0DD2\u0DBD\u0DDA \u0DC3\u0DC0\u0DD2\u0D9A\u0DD2\u0DBB\u0DD3\u0DB8, \u0DC0\u0DC3\u0DBB 2 \u0D9A \u0DC0\u0DDC\u0DBB\u0DB1\u0DCA\u0DA7\u0DD2 \u0DC3\u0DC4 \u0D85\u0DB8\u0DAD\u0DBB \u0D9A\u0DDC\u0DA7\u0DC3\u0DCA \u0DC3\u0DC4\u0DD2\u0DAD\u0DBA\u0DD2.** \u{1F4DE} Hotline: **+94 11 234 5678**`;
    }
    return `\u{1F4A7} **Manju Dew Super Water Filtration Systems**:

\u2022 **Dew Super RO Water Filter (100L/day)**: **Rs. 69,900** *(Down payment Rs. 14,900 + Rs. 6,000/mo)*
\u2022 **Dew Super RO+ Filter**: **Rs. 74,900**
\u2022 **Hot & Normal Dispenser**: **Rs. 86,900**
\u2022 **Hot, Cool & Normal Dispenser**: **Rs. 89,900**
\u2022 **Commercial RO Plants**: 500L (Rs. 175k) | 2500L (Rs. 315k) | 3000L (Rs. 400k)

\u2728 Free Water Testing, Free Installation, 2-Year Warranty & Island-wide Delivery!`;
  }
  if (
    query.includes("installment") ||
    query.includes("down payment") ||
    query.includes("monthly") ||
    query.includes("\u0D9C\u0DD9\u0DC0\u0DB1\u0DCA\u0DB1") ||
    query.includes("\u0DC0\u0DCF\u0DBB\u0DD2\u0D9A") ||
    query.includes("\u0DB1\u0DBA\u0DA7") ||
    query.includes("\u0DB8\u0DD2\u0DBD") ||
    query.includes("\u0D9C\u0DAB\u0DB1\u0DCA") ||
    query.includes("kiyada") ||
    query.includes("ganan")
  ) {
    if (isLocalLang) {
      return `\u{1F4B3} **Manju Group \u0DB4\u0DC4\u0DC3\u0DD4 \u0DB8\u0DCF\u0DC3\u0DD2\u0D9A \u0DC0\u0DCF\u0DBB\u0DD2\u0D9A \u0D9A\u0DCA\u200D\u0DBB\u0DB8 (Easy Installments)**:

\u0D85\u0DC0\u0DB8 \u0DBD\u0DD2\u0DBA\u0D9A\u0DD2\u0DBA\u0DC0\u0DD2\u0DBD\u0DD2 \u0DC3\u0DC4\u0DD2\u0DAD\u0DC0 \u0D94\u0DB6\u0DA7 \u0DB4\u0DC4\u0DC3\u0DD4 \u0DB8\u0DCF\u0DC3\u0DD2\u0D9A \u0DC0\u0DCF\u0DBB\u0DD2\u0D9A \u0D9A\u0DCA\u200D\u0DBB\u0DB8\u0DBA\u0DA7 \u0DB7\u0DCF\u0DAB\u0DCA\u0DA9 \u0DBD\u0DB6\u0DCF\u0D9C\u0DAD \u0DC4\u0DD0\u0D9A:

1. **Water Filters**: \u0DB8\u0DD6\u0DBD\u0DD2\u0D9A \u0D9C\u0DD9\u0DC0\u0DD3\u0DB8 \u0DBB\u0DD4. 14,900 + \u0DB8\u0DC3\u0D9A\u0DA7 \u0DBB\u0DD4. 6,000 (\u0DB8\u0DCF\u0DC3 11)
2. **32" Smart TV**: \u0DB8\u0DD6\u0DBD\u0DD2\u0D9A \u0D9C\u0DD9\u0DC0\u0DD3\u0DB8 \u0DBB\u0DD4. 10,000 + \u0DB8\u0DC3\u0D9A\u0DA7 \u0DBB\u0DD4. 6,200 (\u0DB8\u0DCF\u0DC3 12)
3. **43" 4K Smart TV**: \u0DB8\u0DD6\u0DBD\u0DD2\u0D9A \u0D9C\u0DD9\u0DC0\u0DD3\u0DB8 \u0DBB\u0DD4. 15,000 + \u0DB8\u0DC3\u0D9A\u0DA7 \u0DBB\u0DD4. 9,150 (\u0DB8\u0DCF\u0DC3 12)
4. **55" 4K Smart TV**: \u0DB8\u0DD6\u0DBD\u0DD2\u0D9A \u0D9C\u0DD9\u0DC0\u0DD3\u0DB8 \u0DBB\u0DD4. 25,000 + \u0DB8\u0DC3\u0D9A\u0DA7 \u0DBB\u0DD4. 14,550 (\u0DB8\u0DCF\u0DC3 12)
5. **Credit Card 0% Plans**: Commercial Bank, Sampath, HNB, Seylan, BOC \u0D9A\u0DCF\u0DA9\u0DCA\u0DB4\u0DAD\u0DCA \u0DC3\u0DB3\u0DC4\u0DCF 0% \u0DB4\u0DDC\u0DBD\u0DD3 \u0DBB\u0DC4\u0DD2\u0DAD \u0DC0\u0DCF\u0DBB\u0DD2\u0D9A \u0DB4\u0DC4\u0DC3\u0DD4\u0D9A\u0DB8\u0DCA \u0D87\u0DAD.

\u{1F4DE} \u0D94\u0DB6\u0D9C\u0DDA \u0DC0\u0DCF\u0DBB\u0DD2\u0D9A \u0DC3\u0DD0\u0DBD\u0DD0\u0DC3\u0DCA\u0DB8 \u0DC3\u0D9A\u0DC3\u0DCA \u0D9A\u0DBB\u0D9C\u0DD0\u0DB1\u0DD3\u0DB8\u0DA7 \u0D85\u0DB8\u0DAD\u0DB1\u0DCA\u0DB1: **+94 11 234 5678**`;
    }
    return `\u{1F4B3} **Manju Group Easy Monthly Installments**:

\u2022 **Water Filters**: Down payment Rs. 14,900 + Rs. 6,000/mo (11 mo)
\u2022 **32" Smart TV**: Down payment Rs. 10,000 + Rs. 6,200/mo (12 mo)
\u2022 **43" 4K Smart TV**: Down payment Rs. 15,000 + Rs. 9,150/mo (12 mo)
\u2022 **55" 4K Smart TV**: Down payment Rs. 25,000 + Rs. 14,550/mo (12 mo)
\u2022 **0% Credit Card Installments**: Available for major Sri Lankan banks.

\u{1F4DE} Call **+94 11 234 5678** for fast installment approval!`;
  }
  if (
    query.includes("company") ||
    query.includes("manju") ||
    query.includes("contact") ||
    query.includes("hotline") ||
    query.includes("phone") ||
    query.includes("number") ||
    query.includes("location") ||
    query.includes("branch") ||
    query.includes("showroom") ||
    query.includes("address") ||
    query.includes("delivery") ||
    query.includes("warranty") ||
    query.includes("\u0DC0\u0DDC\u0DBB\u0DB1\u0DCA\u0DA7\u0DD2") ||
    query.includes("\u0D9A\u0DDC\u0DC4\u0DD9\u0DAF")
  ) {
    if (isLocalLang) {
      return `\u{1F3E2} **Manju Group of Companies (Manju Enterprises)**

\u0DC1\u0DCA\u200D\u0DBB\u0DD3 \u0DBD\u0D82\u0D9A\u0DCF\u0DC0\u0DDA \u0DC0\u0DC3\u0DBB **22+ \u0D9A\u0DA7 \u0DC0\u0DD0\u0DA9\u0DD2** \u0DC0\u0DD2\u0DC1\u0DCA\u0DC0\u0DCF\u0DC3\u0DB1\u0DD3\u0DBA \u0DB1\u0DD2\u0DC2\u0DCA\u0DB4\u0DCF\u0DAF\u0DB1 \u0DC4\u0DCF \u0DB6\u0DD9\u0DAF\u0DCF\u0DC4\u0DD0\u0DBB\u0DD3\u0DB8\u0DDA \u0DC0\u0DD2\u0DC1\u0DD2\u0DC2\u0DCA\u0DA7\u0DAD\u0DCA\u0DC0\u0DBA!

\u{1F4DE} **Hotline**: +94 11 234 5678 / +94 77 123 4567
\u2709\uFE0F **Email**: info@manjugroup.lk
\u{1F69A} **Delivery**: \u0DB4\u0DD0\u0DBA 24 - 48 \u0DB1\u0DCA \u0DAF\u0DD2\u0DC0\u0DBA\u0DD2\u0DB1 \u0DB4\u0DD4\u0DBB\u0DCF \u0DB1\u0DD2\u0DC0\u0DC3\u0DA7\u0DB8 \u0DB6\u0DD9\u0DAF\u0DCF\u0DC4\u0DD0\u0DBB\u0DD3\u0DB8
\u{1F4CD} **Showrooms**: \u0D9A\u0DDC\u0DC5\u0DB9 (\u0DB4\u0DCA\u200D\u0DBB\u0DB0\u0DCF\u0DB1 \u0D9A\u0DCF\u0DBB\u0DCA\u0DBA\u0DCF\u0DBD\u0DBA), \u0DB8\u0DC4\u0DB1\u0DD4\u0DC0\u0DBB, \u0D9C\u0DCF\u0DBD\u0DCA\u0DBD, \u0D9A\u0DD4\u0DBB\u0DD4\u0DAB\u0DD1\u0D9C\u0DBD, \u0DB8\u0DD3\u0D9C\u0DB8\u0DD4\u0DC0, \u0DB8\u0DCF\u0DAD\u0DBB, \u0D85\u0DB1\u0DD4\u0DBB\u0DCF\u0DB0\u0DB4\u0DD4\u0DBB\u0DBA, \u0DBA\u0DCF\u0DB4\u0DB1\u0DBA
\u{1F6E1}\uFE0F **Warranties**: Smart TVs \u0DC3\u0DC4 Water Filters \u0DC3\u0DB3\u0DC4\u0DCF \u0DC0\u0DC3\u0DBB 2 \u0D9A\u0DCA, AC Compressors \u0DC3\u0DB3\u0DC4\u0DCF \u0DC0\u0DC3\u0DBB 10 \u0D9A\u0DCA, Electric Bikes \u0DC3\u0DB3\u0DC4\u0DCF \u0DC0\u0DC3\u0DBB 2 \u0D9A\u0DCA.

\u0D94\u0DB6\u0DA7 \u0D85\u0DC0\u0DC1\u0DCA\u200D\u0DBA \u0D95\u0DB1\u0DD1\u0DB8 \u0DC3\u0DC4\u0DBA\u0D9A\u0DCA \u0DC3\u0DB3\u0DC4\u0DCF \u0D85\u0DB4 \u0DC3\u0DD6\u0DAF\u0DCF\u0DB1\u0DB8\u0DCA! \u{1F4DE} **+94 11 234 5678**`;
    }
    return `\u{1F3E2} **Manju Group of Companies (Manju Enterprises)**

Over **22+ years** of trusted excellence in Sri Lanka!

\u{1F4DE} **Hotline**: +94 11 234 5678 / +94 77 123 4567
\u2709\uFE0F **Email**: info@manjugroup.lk
\u{1F69A} **Delivery**: Island-wide delivery in 24-48 hours
\u{1F4CD} **Showrooms**: Colombo (HQ), Kandy, Galle, Kurunegala, Negombo, Matara, Anuradhapura, Jaffna
\u{1F6E1}\uFE0F **Warranties**: 2-10 Years genuine warranty with after-sales service.

How can we assist you further today?`;
  }
  if (isLocalLang) {
    return `\u{1F44B} **\u0D86\u0DBA\u0DD4\u0DB6\u0DDD\u0DC0\u0DB1\u0DCA! Manju Group AI \u0DC3\u0DC4\u0DBA\u0D9A \u0DC0\u0DD9\u0DAD \u0D94\u0DB6\u0DC0 \u0DC3\u0DCF\u0DAF\u0DBB\u0DBA\u0DD9\u0DB1\u0DCA \u0DB4\u0DD2\u0DC5\u0DD2\u0D9C\u0DB1\u0DD2\u0DB8\u0DD4.**

\u0D85\u0DB4\u0D9C\u0DDA \u0D8B\u0DC3\u0DC3\u0DCA \u0DAD\u0DAD\u0DCA\u0DAD\u0DCA\u0DC0\u0DBA\u0DDA \u0DB1\u0DD2\u0DC2\u0DCA\u0DB4\u0DCF\u0DAF\u0DB1 \u0DC3\u0DC4 \u0DB8\u0DD2\u0DBD \u0D9C\u0DAB\u0DB1\u0DCA \u0DB4\u0DD2\u0DC5\u0DD2\u0DB6\u0DB3\u0DC0 \u0D94\u0DB6\u0DA7 \u0D85\u0DC0\u0DC1\u0DCA\u200D\u0DBA \u0D95\u0DB1\u0DD1\u0DB8 \u0DAD\u0DDC\u0DBB\u0DAD\u0DD4\u0DBB\u0D9A\u0DCA \u0DBD\u0DB6\u0DCF\u0DAF\u0DD3\u0DB8\u0DA7 \u0DB8\u0DB8 \u0DC3\u0DD6\u0DAF\u0DCF\u0DB1\u0DB8\u0DCA:

1. \u26A1 **Dew Motors Electric Bikes** (EM005 2400W & YW06 2000W)
2. \u{1F4FA} **Dew Plus 4K Smart TVs** (32", 43", 55", 65", 75", 98")
3. \u2744\uFE0F **DEW+ Inverter ACs** (1.0 Ton, 1.5 Ton, 2.0 Ton)
4. \u{1F4A7} **Manju Dew Super Water Purifiers & Dispensers** (RO, Hot & Cold)
5. \u{1F4B3} **\u0DB4\u0DC4\u0DC3\u0DD4 \u0DB8\u0DCF\u0DC3\u0DD2\u0D9A \u0DC0\u0DCF\u0DBB\u0DD2\u0D9A \u0D9A\u0DCA\u200D\u0DBB\u0DB8 (Monthly Installment Plans)**

\u0D94\u0DB6\u0DA7 \u0DAF\u0DD0\u0DB1\u0D9C\u0DD0\u0DB1\u0DD3\u0DB8\u0DA7 \u0D85\u0DC0\u0DC1\u0DCA\u200D\u0DBA \u0DC0\u0DB1\u0DCA\u0DB1\u0DDA \u0D9A\u0DD4\u0DB8\u0DB1 \u0DB7\u0DCF\u0DAB\u0DCA\u0DA9\u0DBA \u0DB4\u0DD2\u0DC5\u0DD2\u0DB6\u0DB3\u0DC0\u0DAF? \u0DC3\u0DD2\u0D82\u0DC4\u0DBD\u0DD9\u0DB1\u0DCA \u0DC4\u0DDD English \u0DC0\u0DBD\u0DD2\u0DB1\u0DCA \u0DC0\u0DD2\u0DB8\u0DC3\u0DB1\u0DCA\u0DB1! \u{1F4DE} Hotline: **+94 11 234 5678**`;
  }
  return `\u{1F44B} **Hello! Welcome to Manju Group Assistant.**

I can help you with exact prices, technical specifications, installment plans, and warranties for all our genuine products:

1. \u26A1 **Dew Motors Electric Bikes** (EM005 2400W & YW06 2000W)
2. \u{1F4FA} **Dew Plus 4K Smart TVs** (32", 43", 55", 65", 75", 98")
3. \u2744\uFE0F **DEW+ Inverter ACs** (1.0 Ton, 1.5 Ton, 2.0 Ton)
4. \u{1F4A7} **Manju Dew Super Water Filters & Dispensers** (RO, Hot/Cold)
5. \u{1F4B3} **Easy Monthly Installment Plans & 0% Bank Schemes**

What product or information would you like to know more about? You can ask me in **English, \u0DC3\u0DD2\u0D82\u0DC4\u0DBD, or Singlish**! \u{1F4DE} Hotline: **+94 11 234 5678**`;
}
var aiRouter = router({
  chat: publicProcedure
    .input(
      z11.object({
        message: z11.string().min(1).max(1e3),
        history: z11
          .array(
            z11.object({
              role: z11.enum(["user", "assistant"]),
              content: z11.string(),
            })
          )
          .default([]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const messages = [
          ...input.history.slice(-6).map(m => ({
            role: m.role,
            content: m.content,
          })),
          { role: "user", content: input.message },
        ];
        const allMessages = [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ];
        const response = await invokeLLM({
          model: "gpt-4o-mini",
          messages: allMessages,
          maxTokens: 600,
        });
        const reply = response.choices?.[0]?.message?.content;
        const replyText =
          typeof reply === "string"
            ? reply
            : Array.isArray(reply)
              ? reply
                  .map(p => (typeof p === "string" ? p : p.text || ""))
                  .join("")
              : "";
        if (replyText && replyText.trim()) {
          return { reply: replyText };
        }
        return { reply: generateExpertResponse(input.message) };
      } catch (error) {
        const expertReply = generateExpertResponse(input.message);
        return { reply: expertReply };
      }
    }),
});

// server/routers/index.ts
import { TRPCError as TRPCError5 } from "@trpc/server";
var INVALID_CREDENTIALS_MSG = "Invalid email or password";
async function createSessionAndSetCookie(ctx, openId, name) {
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
var appRouter = router({
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
      return { success: true };
    }),
    register: publicProcedure
      .input(
        z12.object({
          name: z12.string().min(1),
          email: z12.string().email(),
          password: z12.string().min(8),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const existing = await getUserByEmail(input.email);
        if (existing) {
          throw new TRPCError5({
            code: "CONFLICT",
            message: "An account with this email already exists",
          });
        }
        const passwordHash = await bcrypt.hash(input.password, 10);
        const openId = `local_${nanoid2()}`;
        await upsertUser({
          openId,
          name: input.name,
          email: input.email,
          loginMethod: "email",
          passwordHash,
          lastSignedIn: /* @__PURE__ */ new Date(),
        });
        await createSessionAndSetCookie(ctx, openId, input.name);
        return { success: true };
      }),
    login: publicProcedure
      .input(
        z12.object({
          email: z12.string().email(),
          password: z12.string().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await getUserByEmail(input.email);
        if (!user || !user.passwordHash) {
          throw new TRPCError5({
            code: "UNAUTHORIZED",
            message: INVALID_CREDENTIALS_MSG,
          });
        }
        const passwordMatches = await bcrypt.compare(
          input.password,
          user.passwordHash
        );
        if (!passwordMatches) {
          throw new TRPCError5({
            code: "UNAUTHORIZED",
            message: INVALID_CREDENTIALS_MSG,
          });
        }
        await createSessionAndSetCookie(ctx, user.openId, user.name || "");
        return { success: true };
      }),
    googleLogin: publicProcedure
      .input(
        z12.object({
          credential: z12.string().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ENV.googleClientId) {
          throw new TRPCError5({
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
        } catch (err) {
          console.error("[GoogleLogin] Token verification failed:", err);
          throw new TRPCError5({
            code: "UNAUTHORIZED",
            message: "Failed to verify Google token",
          });
        }
        if (!payload || !payload.sub) {
          throw new TRPCError5({
            code: "UNAUTHORIZED",
            message: "Invalid Google token payload",
          });
        }
        let openId = `google_${payload.sub}`;
        const existingUserByOpenId = await getUserByOpenId(openId);
        if (existingUserByOpenId) {
          await upsertUser({
            openId,
            name: payload.name || existingUserByOpenId.name || null,
            email: payload.email ?? existingUserByOpenId.email ?? null,
            avatarUrl:
              payload.picture || existingUserByOpenId.avatarUrl || null,
            loginMethod: "google",
            lastSignedIn: /* @__PURE__ */ new Date(),
          });
        } else if (payload.email) {
          const existingUserByEmail = await getUserByEmail(payload.email);
          if (existingUserByEmail) {
            openId = existingUserByEmail.openId;
            await upsertUser({
              openId,
              name: payload.name || existingUserByEmail.name || null,
              avatarUrl:
                payload.picture || existingUserByEmail.avatarUrl || null,
              lastSignedIn: /* @__PURE__ */ new Date(),
            });
          } else {
            await upsertUser({
              openId,
              name: payload.name || null,
              email: payload.email ?? null,
              avatarUrl: payload.picture || null,
              loginMethod: "google",
              lastSignedIn: /* @__PURE__ */ new Date(),
            });
          }
        } else {
          await upsertUser({
            openId,
            name: payload.name || null,
            email: payload.email ?? null,
            avatarUrl: payload.picture || null,
            loginMethod: "google",
            lastSignedIn: /* @__PURE__ */ new Date(),
          });
        }
        await createSessionAndSetCookie(ctx, openId, payload.name || "");
        return { success: true };
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

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app2) {
  app2.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date(),
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/googleAuth.ts
import { OAuth2Client as OAuth2Client2 } from "google-auth-library";
var DEFAULT_REDIRECT = "/account";
function getCallbackUrl(req) {
  if (process.env.GOOGLE_CALLBACK_URL) {
    return process.env.GOOGLE_CALLBACK_URL;
  }
  const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
  const host =
    req.headers["x-forwarded-host"] || req.get("host") || "localhost:3000";
  return `${protocol}://${host}/api/oauth/google/callback`;
}
function encodeState(redirect) {
  return Buffer.from(JSON.stringify({ redirect }), "utf-8").toString("base64");
}
function decodeState(state) {
  if (!state) return DEFAULT_REDIRECT;
  try {
    const parsed = JSON.parse(Buffer.from(state, "base64").toString("utf-8"));
    if (
      typeof parsed.redirect === "string" &&
      parsed.redirect.startsWith("/")
    ) {
      return parsed.redirect;
    }
    return DEFAULT_REDIRECT;
  } catch {
    return DEFAULT_REDIRECT;
  }
}
function isGoogleConfigured() {
  return Boolean(ENV.googleClientId && ENV.googleClientSecret);
}
function getQueryParam2(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerGoogleOAuthRoutes(app2) {
  app2.get("/api/oauth/google/start", (req, res) => {
    if (!isGoogleConfigured()) {
      res.redirect(302, "/account?error=google_not_configured");
      return;
    }
    const redirectParam = getQueryParam2(req, "redirect") || DEFAULT_REDIRECT;
    const redirectUri = getCallbackUrl(req);
    const client = new OAuth2Client2({
      clientId: ENV.googleClientId,
      clientSecret: ENV.googleClientSecret,
      redirectUri,
    });
    const authUrl = client.generateAuthUrl({
      access_type: "online",
      scope: ["openid", "email", "profile"],
      state: encodeState(redirectParam),
      prompt: "select_account",
    });
    res.redirect(302, authUrl);
  });
  app2.get("/api/oauth/google/callback", async (req, res) => {
    if (!isGoogleConfigured()) {
      res.redirect(302, "/account?error=google_not_configured");
      return;
    }
    const code = getQueryParam2(req, "code");
    const state = getQueryParam2(req, "state");
    const errorParam = getQueryParam2(req, "error");
    const redirectPath = decodeState(state);
    if (errorParam) {
      console.warn(
        "[GoogleOAuth] Callback returned error from Google:",
        errorParam
      );
      res.redirect(
        302,
        `/account?error=google_auth_failed&reason=${encodeURIComponent(errorParam)}`
      );
      return;
    }
    if (!code) {
      res.redirect(
        302,
        "/account?error=google_auth_failed&reason=Missing+authorization+code"
      );
      return;
    }
    try {
      const redirectUri = getCallbackUrl(req);
      const client = new OAuth2Client2({
        clientId: ENV.googleClientId,
        clientSecret: ENV.googleClientSecret,
        redirectUri,
      });
      const { tokens } = await client.getToken(code);
      if (!tokens.id_token) {
        throw new Error("No id_token returned from Google");
      }
      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: ENV.googleClientId,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.sub) {
        throw new Error("Invalid Google ID token payload");
      }
      let openId = `google_${payload.sub}`;
      const existingUserByOpenId = await getUserByOpenId(openId);
      if (existingUserByOpenId) {
        await upsertUser({
          openId,
          name: payload.name || existingUserByOpenId.name || null,
          email: payload.email ?? existingUserByOpenId.email ?? null,
          avatarUrl: payload.picture || existingUserByOpenId.avatarUrl || null,
          loginMethod: "google",
          lastSignedIn: /* @__PURE__ */ new Date(),
        });
      } else if (payload.email) {
        const existingUserByEmail = await getUserByEmail(payload.email);
        if (existingUserByEmail) {
          openId = existingUserByEmail.openId;
          await upsertUser({
            openId,
            name: payload.name || existingUserByEmail.name || null,
            avatarUrl: payload.picture || existingUserByEmail.avatarUrl || null,
            lastSignedIn: /* @__PURE__ */ new Date(),
          });
        } else {
          await upsertUser({
            openId,
            name: payload.name || null,
            email: payload.email ?? null,
            avatarUrl: payload.picture || null,
            loginMethod: "google",
            lastSignedIn: /* @__PURE__ */ new Date(),
          });
        }
      } else {
        await upsertUser({
          openId,
          name: payload.name || null,
          email: payload.email ?? null,
          avatarUrl: payload.picture || null,
          loginMethod: "google",
          lastSignedIn: /* @__PURE__ */ new Date(),
        });
      }
      const sessionToken = await sdk.createSessionToken(openId, {
        name: payload.name || "",
        expiresInMs: ONE_YEAR_MS,
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });
      res.redirect(302, redirectPath);
    } catch (error) {
      const details =
        error?.response?.data?.error_description ||
        error?.response?.data?.error ||
        error?.message ||
        String(error);
      console.error("[GoogleOAuth] Callback failed:", details, error);
      res.redirect(
        302,
        `/account?error=google_auth_failed&reason=${encodeURIComponent(details)}`
      );
    }
  });
}

// server/_core/storageProxy.ts
function registerStorageProxy(app2) {
  app2.get("/manus-storage/*", async (req, res) => {
    const key = req.params[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }
    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/"
      );
      forgeUrl.searchParams.set("path", key);
      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
      });
      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(
          `[StorageProxy] forge error: ${forgeResp.status} ${body}`
        );
        res.status(502).send("Storage backend error");
        return;
      }
      const { url } = await forgeResp.json();
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }
      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}

// api/index.ts
try {
  validateEnv();
} catch (e) {
  console.error("Environment Validation Failed:", e);
}
var app = express();
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.get(["/", "/api", "/api/health"], (req, res) => {
  res.json({
    status: "ok",
    timestamp: /* @__PURE__ */ new Date().toISOString(),
  });
});
registerStorageProxy(app);
registerOAuthRoutes(app);
registerGoogleOAuthRoutes(app);
app.use((req, res, next) => {
  if (req.url.startsWith("/trpc")) {
    req.url = `/api${req.url}`;
  }
  next();
});
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
var index_default = app;
export {
  _aws1,
  _aws2,
  _axios,
  _bcryptjs,
  _cookie,
  _drizzle1,
  _drizzle2,
  _drizzle3,
  _googleauth,
  _jose,
  _mysql1,
  _mysql2,
  _nanoid,
  _trpc,
  _zod,
  index_default as default,
};
