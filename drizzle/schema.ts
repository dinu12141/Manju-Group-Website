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

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  resetToken: varchar("resetToken", { length: 255 }),
  resetTokenExpiry: timestamp("resetTokenExpiry"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  avatarUrl: text("avatarUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Brands ───────────────────────────────────────────────────────────────────
export const brands = mysqlTable("brands", {
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

export type Brand = typeof brands.$inferSelect;
export type InsertBrand = typeof brands.$inferInsert;

// ─── Categories ───────────────────────────────────────────────────────────────
export const categories = mysqlTable("categories", {
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

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// ─── Products ─────────────────────────────────────────────────────────────────
export const products = mysqlTable("products", {
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

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ─── Product Images ───────────────────────────────────────────────────────────
export const productImages = mysqlTable("product_images", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  url: text("url").notNull(),
  altText: varchar("altText", { length: 256 }),
  isPrimary: boolean("isPrimary").default(false).notNull(),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProductImage = typeof productImages.$inferSelect;

// ─── Product Variants ─────────────────────────────────────────────────────────
export const productVariants = mysqlTable("product_variants", {
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

export type ProductVariant = typeof productVariants.$inferSelect;

// ─── Cart ─────────────────────────────────────────────────────────────────────
export const carts = mysqlTable("carts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  sessionId: varchar("sessionId", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Cart = typeof carts.$inferSelect;

export const cartItems = mysqlTable("cart_items", {
  id: int("id").autoincrement().primaryKey(),
  cartId: int("cartId").notNull(),
  productId: varchar("productId", { length: 256 }).notNull(),
  variantId: varchar("variantId", { length: 256 }),
  quantity: int("quantity").default(1).notNull(),
  unitPrice: decimal("unitPrice", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CartItem = typeof cartItems.$inferSelect;

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export const wishlists = mysqlTable("wishlists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: varchar("productId", { length: 256 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Wishlist = typeof wishlists.$inferSelect;

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orders = mysqlTable("orders", {
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

export type Order = typeof orders.$inferSelect;

export const orderItems = mysqlTable("order_items", {
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

export type OrderItem = typeof orderItems.$inferSelect;

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const reviews = mysqlTable("reviews", {
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

export type Review = typeof reviews.$inferSelect;

// ─── Blog Posts ───────────────────────────────────────────────────────────────
export const blogPosts = mysqlTable("blog_posts", {
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

export type BlogPost = typeof blogPosts.$inferSelect;

// ─── Locations ────────────────────────────────────────────────────────────────
export const locations = mysqlTable("locations", {
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

export type Location = typeof locations.$inferSelect;

// ─── Banners ──────────────────────────────────────────────────────────────────
export const banners = mysqlTable("banners", {
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

export type Banner = typeof banners.$inferSelect;

// ─── FAQ ──────────────────────────────────────────────────────────────────────
export const faqs = mysqlTable("faqs", {
  id: int("id").autoincrement().primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: varchar("category", { length: 64 }),
  sortOrder: int("sortOrder").default(0),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Faq = typeof faqs.$inferSelect;

// ─── Contact Messages ─────────────────────────────────────────────────────────
export const contactMessages = mysqlTable("contact_messages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  subject: varchar("subject", { length: 256 }),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
