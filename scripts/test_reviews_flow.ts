import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { getDb } from "../server/db";
import { reviews } from "../drizzle/schema";
import { eq } from "drizzle-orm";

async function run() {
  console.log("=== Testing Reviews & Live Updates Flow ===");

  const adminCtx = {
    user: {
      id: 1,
      role: "admin",
      openId: "admin",
      name: "Admin",
      email: "admin@manjugroup.lk",
      lastSignedIn: new Date(),
    } as any,
    isAdminByPasscode: true,
    req: {} as any,
    res: {} as any,
  };
  const publicCtx = {
    user: null,
    isAdminByPasscode: false,
    req: {} as any,
    res: {} as any,
  };

  const adminCaller = appRouter.createCaller(adminCtx);
  const publicCaller = appRouter.createCaller(publicCtx);

  // 1. Check initial admin review list
  console.log("1. Checking Admin Reviews List...");
  const initialAdminList = await adminCaller.admin.reviewsList({ page: 1, limit: 10 });
  console.log(`Initial total reviews in admin: ${initialAdminList.total}`);
  const firstItem = initialAdminList.items[0];
  if (firstItem) {
    console.log("First review product info:", {
      productName: firstItem.productName,
      productSlug: firstItem.productSlug,
      productSku: firstItem.productSku,
      brandName: firstItem.brandName,
      categoryName: firstItem.categoryName,
      productImageUrl: firstItem.productImageUrl,
    });
    if (!firstItem.productSlug || !firstItem.productImageUrl) {
      throw new Error("Missing product slug or image in admin review item!");
    }
  }

  // 2. Query public reviews for product 24 (Dew Plus Smart TV 65)
  console.log("\n2. Checking Public Reviews for Product 24...");
  const initialPublicReviews = await publicCaller.products.reviews({ productId: 24 });
  const initialCount = initialPublicReviews.length;
  console.log(`Initial public reviews count for product 24: ${initialCount}`);

  // 3. Post a new live customer review
  console.log("\n3. Posting a new Customer Review...");
  const testReview = await publicCaller.products.addReview({
    productId: 24,
    authorName: "Kasun Perera",
    rating: 5,
    title: "Exceptional 4K clarity & fast delivery",
    body: "Purchased this TV yesterday and the delivery was on time. The picture quality is amazing for Netflix and YouTube.",
    userEmail: "kasun.test@gmail.com",
  });
  console.log(`Review posted successfully with ID: ${testReview.id}, isApproved: ${testReview.isApproved}`);

  // 4. Verify public reviews immediately reflect the new review
  console.log("\n4. Verifying Public Reviews updated in real-time...");
  const updatedPublicReviews = await publicCaller.products.reviews({ productId: 24 });
  console.log(`Updated public reviews count: ${updatedPublicReviews.length}`);
  if (updatedPublicReviews.length !== initialCount + 1) {
    throw new Error(`Expected review count to be ${initialCount + 1}, got ${updatedPublicReviews.length}`);
  }
  const foundNew = updatedPublicReviews.find(r => r.id === testReview.id);
  if (!foundNew) {
    throw new Error("Newly added review not found in public reviews list!");
  }
  console.log("Verified newly added review in public list:", foundNew.title);

  // 5. Verify admin review list immediately contains new review with full product metadata
  console.log("\n5. Verifying Admin Reviews List contains new review with full product details...");
  const updatedAdminList = await adminCaller.admin.reviewsList({ page: 1, limit: 10 });
  const adminNew = updatedAdminList.items.find(r => r.id === testReview.id);
  if (!adminNew) {
    throw new Error("Newly added review not found in admin reviews list!");
  }
  console.log("Admin review item product metadata:", {
    productName: adminNew.productName,
    productSlug: adminNew.productSlug,
    productSku: adminNew.productSku,
    brandName: adminNew.brandName,
    categoryName: adminNew.categoryName,
    productImageUrl: adminNew.productImageUrl,
  });

  if (adminNew.productSlug !== "dew-plus-smart-tv-65") {
    throw new Error(`Expected slug 'dew-plus-smart-tv-65', got ${adminNew.productSlug}`);
  }
  if (!adminNew.productImageUrl) {
    throw new Error("Expected productImageUrl to be defined!");
  }

  // 6. Test slug-based review query matching
  console.log("\n6. Testing query by slug 'dew-plus-smart-tv-65'...");
  const slugReviews = await publicCaller.products.reviews({ productId: "dew-plus-smart-tv-65" });
  console.log(`Reviews fetched by slug: ${slugReviews.length}`);
  if (slugReviews.length !== updatedPublicReviews.length) {
    throw new Error(`Query by slug returned ${slugReviews.length} reviews, expected ${updatedPublicReviews.length}`);
  }

  // Clean up test review
  console.log("\n7. Cleaning up test review...");
  const db = await getDb();
  if (db) {
    await db.delete(reviews).where(eq(reviews.id, testReview.id));
    console.log("Test review removed cleanly.");
  }

  console.log("\n=== ALL REAL-TIME REVIEWS & PRODUCT PREVIEW TESTS PASSED! ===");
  process.exit(0);
}

run().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
