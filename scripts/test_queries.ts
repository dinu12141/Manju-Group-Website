import { appRouter } from "../server/routers";

async function testAll() {
  const caller = appRouter.createCaller({
    user: null,
    req: {} as any,
    res: {} as any,
  });

  try {
    const me = await caller.auth.me();
    console.log("auth.me success:", me);
  } catch (e: any) {
    console.error("auth.me error:", e.message || e);
  }

  try {
    const wishlist = await caller.wishlist.list({ sessionId: "guest_123" });
    console.log("wishlist.list success:", wishlist);
  } catch (e: any) {
    console.error("wishlist.list error:", e.message || e);
  }

  try {
    const cart = await caller.cart.get({ sessionId: "guest_123" });
    console.log("cart.get success:", cart);
  } catch (e: any) {
    console.error("cart.get error:", e.message || e);
  }
}

testAll()
  .then(() => process.exit(0))
  .catch(e => {
    console.error("Fatal:", e);
    process.exit(1);
  });
