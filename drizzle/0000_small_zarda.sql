CREATE TABLE "banners" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(256) NOT NULL,
	"subtitle" text,
	"imageUrl" text,
	"mobileImageUrl" text,
	"linkUrl" text,
	"linkText" varchar(128),
	"placement" varchar(64) DEFAULT 'hero' NOT NULL,
	"bgColor" varchar(32),
	"textColor" varchar(32),
	"sortOrder" integer DEFAULT 0,
	"isActive" boolean DEFAULT true NOT NULL,
	"startsAt" timestamp,
	"endsAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(256) NOT NULL,
	"title" varchar(256) NOT NULL,
	"excerpt" text,
	"content" text,
	"coverImageUrl" text,
	"authorId" integer,
	"authorName" varchar(128),
	"category" varchar(64),
	"tags" json,
	"isPublished" boolean DEFAULT false NOT NULL,
	"publishedAt" timestamp,
	"metaTitle" varchar(256),
	"metaDescription" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(128) NOT NULL,
	"name" varchar(128) NOT NULL,
	"tagline" text,
	"description" text,
	"logoUrl" text,
	"bannerUrl" text,
	"primaryColor" varchar(16),
	"accentColor" varchar(16),
	"sortOrder" integer DEFAULT 0,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "brands_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"cartId" integer NOT NULL,
	"productId" varchar(256) NOT NULL,
	"variantId" varchar(256),
	"quantity" integer DEFAULT 1 NOT NULL,
	"unitPrice" numeric(12, 2) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"sessionId" varchar(128),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(128) NOT NULL,
	"name" varchar(128) NOT NULL,
	"description" text,
	"imageUrl" text,
	"parentId" integer,
	"sortOrder" integer DEFAULT 0,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"email" varchar(320) NOT NULL,
	"phone" varchar(32),
	"subject" varchar(256),
	"message" text NOT NULL,
	"isRead" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" serial PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"category" varchar(64),
	"sortOrder" integer DEFAULT 0,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"type" varchar(64) DEFAULT 'showroom' NOT NULL,
	"address" text NOT NULL,
	"city" varchar(64) NOT NULL,
	"province" varchar(64),
	"phone" varchar(32),
	"email" varchar(320),
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"openingHours" json,
	"isActive" boolean DEFAULT true NOT NULL,
	"sortOrder" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"orderId" integer NOT NULL,
	"productId" varchar(256) NOT NULL,
	"variantId" varchar(256),
	"productName" varchar(256) NOT NULL,
	"variantName" varchar(128),
	"sku" varchar(64),
	"quantity" integer NOT NULL,
	"unitPrice" numeric(12, 2) NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"orderNumber" varchar(32) NOT NULL,
	"userId" integer,
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL,
	"shippingFee" numeric(12, 2) DEFAULT '0' NOT NULL,
	"discount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"total" numeric(12, 2) NOT NULL,
	"currency" varchar(8) DEFAULT 'LKR' NOT NULL,
	"paymentMethod" varchar(64),
	"paymentStatus" varchar(32) DEFAULT 'pending' NOT NULL,
	"shippingAddress" json,
	"billingAddress" json,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_orderNumber_unique" UNIQUE("orderNumber")
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"url" text NOT NULL,
	"altText" varchar(256),
	"isPrimary" boolean DEFAULT false NOT NULL,
	"sortOrder" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"sku" varchar(64) NOT NULL,
	"name" varchar(128) NOT NULL,
	"options" json,
	"price" numeric(12, 2) NOT NULL,
	"salePrice" numeric(12, 2),
	"stockQuantity" integer DEFAULT 0 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_variants_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(256) NOT NULL,
	"sku" varchar(64) NOT NULL,
	"name" varchar(256) NOT NULL,
	"shortDescription" text,
	"description" text,
	"brandId" integer NOT NULL,
	"categoryId" integer NOT NULL,
	"basePrice" numeric(12, 2) NOT NULL,
	"salePrice" numeric(12, 2),
	"currency" varchar(8) DEFAULT 'LKR' NOT NULL,
	"stockQuantity" integer DEFAULT 0 NOT NULL,
	"isInStock" boolean DEFAULT true NOT NULL,
	"isFeatured" boolean DEFAULT false NOT NULL,
	"isBestSeller" boolean DEFAULT false NOT NULL,
	"isNew" boolean DEFAULT false NOT NULL,
	"warrantyMonths" integer DEFAULT 0,
	"weight" numeric(8, 2),
	"specifications" json,
	"tags" json,
	"metaTitle" varchar(256),
	"metaDescription" text,
	"sortOrder" integer DEFAULT 0,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug"),
	CONSTRAINT "products_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" varchar(256) NOT NULL,
	"userId" integer NOT NULL,
	"rating" integer NOT NULL,
	"title" varchar(256),
	"body" text,
	"isVerified" boolean DEFAULT false NOT NULL,
	"isApproved" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(128) NOT NULL,
	"value" json NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "site_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"phone" varchar(32),
	"loginMethod" varchar(64),
	"passwordHash" varchar(255),
	"resetToken" varchar(255),
	"resetTokenExpiry" timestamp,
	"role" varchar(64) DEFAULT 'user' NOT NULL,
	"avatarUrl" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
CREATE TABLE "wishlists" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"productId" varchar(256) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
