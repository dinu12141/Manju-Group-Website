import postgres from "postgres";
import * as dotenv from "dotenv";
dotenv.config();

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });

async function syncSequences() {
  console.log("Synchronizing PostgreSQL sequences with max(id)...");
  const tables = [
    "products",
    "product_images",
    "product_variants",
    "brands",
    "categories",
    "orders",
    "order_items",
    "users",
    "contact_messages",
    "wishlists",
    "carts",
    "cart_items",
    "reviews",
    "site_settings",
  ];

  for (const table of tables) {
    try {
      const res = await sql`
        SELECT setval(
          pg_get_serial_sequence(${table}, 'id'),
          coalesce((SELECT max(id) FROM ${sql(table)}), 1)
        );
      `;
      console.log(`Synced sequence for ${table}:`, res);
    } catch (e: any) {
      console.log(`Notice for ${table}:`, e.message);
    }
  }

  await sql.end();
}

syncSequences().catch(err => {
  console.error("Error syncing sequences:", err);
  process.exit(1);
});
