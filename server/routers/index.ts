import { z } from "zod";
import * as db from "../db";
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

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => {
      if (!opts.ctx.user) return null;
      const { passwordHash, ...safeUser } = opts.ctx.user;
      return safeUser;
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
