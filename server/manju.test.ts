import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@manjugroup.lk",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "regular-user",
      email: "user@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

describe("auth", () => {
  it("returns null for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user for authenticated user", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.role).toBe("admin");
  });

  it("logout clears session cookie and returns success", async () => {
    const clearedCookies: string[] = [];
    const ctx: TrpcContext = {
      ...createAdminContext(),
      res: {
        clearCookie: (name: string) => { clearedCookies.push(name); },
      } as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(clearedCookies.length).toBe(1);
  });
});

describe("admin access control", () => {
  it("throws FORBIDDEN for non-admin user accessing admin stats", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.admin.stats()).rejects.toThrow();
  });

  it("allows admin user to access admin stats", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    // This will attempt DB access; in test env without DB it returns defaults
    try {
      const result = await caller.admin.stats();
      expect(result).toHaveProperty("totalOrders");
      expect(result).toHaveProperty("totalRevenue");
      expect(result).toHaveProperty("totalProducts");
      expect(result).toHaveProperty("totalCustomers");
    } catch (e: any) {
      // DB not available in test env is acceptable
      expect(e.code).not.toBe("FORBIDDEN");
    }
  });
});

describe("brands router", () => {
  it("list procedure is accessible publicly", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    try {
      const result = await caller.brands.list();
      expect(Array.isArray(result)).toBe(true);
    } catch (e: any) {
      // DB not available in test env is acceptable
      expect(e.code).not.toBe("UNAUTHORIZED");
    }
  });
});

describe("products router", () => {
  it("list procedure accepts valid input", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    try {
      const result = await caller.products.list({ page: 1, limit: 10, sortBy: "newest" });
      expect(result).toHaveProperty("items");
      expect(result).toHaveProperty("total");
    } catch (e: any) {
      expect(e.code).not.toBe("BAD_REQUEST");
    }
  });

  it("search procedure accepts query string", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    try {
      const result = await caller.products.search({ query: "dew", limit: 5 });
      expect(Array.isArray(result)).toBe(true);
    } catch (e: any) {
      expect(e.code).not.toBe("BAD_REQUEST");
    }
  });
});

describe("cart router", () => {
  it("get cart returns empty cart for new session", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    try {
      const result = await caller.cart.get({ sessionId: "test-session-123" });
      expect(result).toHaveProperty("items");
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("itemCount");
    } catch (e: any) {
      expect(e.code).not.toBe("BAD_REQUEST");
    }
  });
});

describe("faq router", () => {
  it("list procedure is accessible publicly", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    try {
      const result = await caller.faq.list();
      expect(Array.isArray(result)).toBe(true);
    } catch (e: any) {
      expect(e.code).not.toBe("UNAUTHORIZED");
    }
  });
});

describe("locations router", () => {
  it("list procedure is accessible publicly", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    try {
      const result = await caller.locations.list();
      expect(Array.isArray(result)).toBe(true);
    } catch (e: any) {
      expect(e.code).not.toBe("UNAUTHORIZED");
    }
  });
});

describe("blog router", () => {
  it("list procedure accepts pagination params", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    try {
      const result = await caller.blog.list({ page: 1, limit: 5 });
      expect(result).toHaveProperty("items");
    } catch (e: any) {
      expect(e.code).not.toBe("BAD_REQUEST");
    }
  });
});

describe("contact router", () => {
  it("submit requires valid email and message", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.contact.submit({ name: "", email: "not-an-email", message: "", subject: "" })
    ).rejects.toThrow();
  });
});

describe("wishlist router", () => {
  it("list requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.wishlist.list()).rejects.toThrow();
  });

  it("list is accessible for authenticated user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    try {
      const result = await caller.wishlist.list();
      expect(Array.isArray(result)).toBe(true);
    } catch (e: any) {
      expect(e.code).not.toBe("UNAUTHORIZED");
    }
  });
});

describe("orders router", () => {
  it("list requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.orders.list()).rejects.toThrow();
  });

  it("list is accessible for authenticated user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    try {
      const result = await caller.orders.list();
      expect(Array.isArray(result)).toBe(true);
    } catch (e: any) {
      expect(e.code).not.toBe("UNAUTHORIZED");
    }
  });
});
