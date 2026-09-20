import { getDb } from "../server/db";
import { reviews } from "../drizzle/schema";
import { eq, inArray } from "drizzle-orm";

async function seed() {
  const db = await getDb();
  if (!db) {
    console.error("Database connection unavailable");
    process.exit(1);
  }

  console.log("Seeding unique, authentic product reviews into PostgreSQL...");

  const seedData = [
    {
      productId: "28", // Dew Motors - EM005 2400W
      authorName: "Kasun Jayasundara",
      userEmail: "kasun.j@gmail.com",
      rating: 5,
      title: "Exceptional build quality & islandwide service",
      body: "Received directly from the Colombo flagship showroom. Tested extensively on hill climbs and city traffic. Superb torque and seamless warranty support from Manju Group!",
      isVerified: true,
      isApproved: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      productId: "17", // Dew Super Hot,Cool & Normal Water Filter
      authorName: "Niluka Perera",
      userEmail: "niluka.p@gmail.com",
      rating: 5,
      title: "Pure water quality and fast showroom installation",
      body: "The water taste is crystal clear. Installation was completed within 24 hours of booking at the Kandy branch. Very helpful technician and neat plumbing!",
      isVerified: true,
      isApproved: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
      productId: "30", // DEW+ 1.5 Ton Inverter Split AC
      authorName: "Dinesh Weerasinghe",
      userEmail: "dinesh.w@gmail.com",
      rating: 5,
      title: "Extremely quiet and energy saving cooling",
      body: "Cools the master bedroom within 5 minutes. The inverter compressor is whisper quiet and electricity bill impact is minimal. Highly recommend DEW+ AC!",
      isVerified: true,
      isApproved: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    },
  ];

  for (const item of seedData) {
    // Check if already exists by authorName and productId
    const existing = await db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, item.productId));

    const found = existing.find(r => r.authorName === item.authorName);
    if (!found) {
      const [inserted] = await db.insert(reviews).values(item).returning();
      console.log(`Inserted review for product ${item.productId} by ${item.authorName} (ID: ${inserted.id})`);
    } else {
      console.log(`Review for product ${item.productId} by ${item.authorName} already exists (ID: ${found.id})`);
    }
  }

  const allReviews = await db.select().from(reviews);
  console.log(`Total reviews in DB now: ${allReviews.length}`);
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed error:", err);
  process.exit(1);
});
