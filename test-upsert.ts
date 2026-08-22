import "dotenv/config";
import { upsertUser, getUserByOpenId } from "./server/db";
import { getDb } from "./server/db";

async function testUpsert() {
  try {
    const db = await getDb();
    if (!db) {
      console.log("No DB connection");
      process.exit(1);
    }

    console.log("Testing upsertUser...");
    await upsertUser({
      openId: "google_test123",
      name: "Test User",
      email: "test@example.com",
      loginMethod: "google",
      lastSignedIn: new Date(),
    });

    console.log("Upsert succeeded!");

    const user = await getUserByOpenId("google_test123");
    console.log("User fetched:", user);

    process.exit(0);
  } catch (error) {
    console.error("CRASH:", error);
    process.exit(1);
  }
}

testUpsert();
