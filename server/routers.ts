import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { productsRouter } from "./routers/products";
import { brandsRouter } from "./routers/brands";
import { cartRouter } from "./routers/cart";
import { ordersRouter } from "./routers/orders";
import { wishlistRouter } from "./routers/wishlist";
import { locationsRouter } from "./routers/locations";
import { blogRouter } from "./routers/blog";
import { faqRouter } from "./routers/faq";
import { contactRouter } from "./routers/contact";
import { adminRouter } from "./routers/admin";
import { aiRouter } from "./routers/ai";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  products: productsRouter,
  brands: brandsRouter,
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
