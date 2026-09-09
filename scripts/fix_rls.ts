import "dotenv/config";
import postgres from "postgres";

const TABLES_TO_FIX = [
  "products",
  "product_variants",
  "carts",
  "brands",
  "cart_items",
  "banners",
  "blog_posts",
  "contact_messages",
  "faqs",
  "locations",
  "order_items",
  "orders",
  "product_images",
  "categories",
  "reviews",
  "users",
  "wishlists",
  "site_settings",
];

// Publicly readable tables (catalog / marketing data)
const PUBLIC_READ_TABLES = [
  "products",
  "product_variants",
  "brands",
  "categories",
  "product_images",
  "banners",
  "blog_posts",
  "faqs",
  "locations",
  "reviews",
];

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL not found in environment!");
    process.exit(1);
  }

  const sql = postgres(dbUrl, {
    ssl: "require",
    prepare: false,
  });

  try {
    console.log("=== Checking current RLS status ===");
    const existingTables = await sql`
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;

    console.log(`Found ${existingTables.length} tables in public schema:`);
    for (const t of existingTables) {
      console.log(`  - ${t.tablename}: rowsecurity = ${t.rowsecurity}`);
    }

    console.log("\n=== Enabling Row Level Security (RLS) ===");
    for (const tableName of TABLES_TO_FIX) {
      const exists = existingTables.some(t => t.tablename === tableName);
      if (!exists) {
        console.log(`Skipping ${tableName} (does not exist in database)`);
        continue;
      }

      console.log(`Enabling RLS on: public.${tableName}`);
      await sql.unsafe(`ALTER TABLE public."${tableName}" ENABLE ROW LEVEL SECURITY;`);

      // If it's a public read table, ensure a SELECT policy exists so PostgREST read doesn't break if ever queried
      if (PUBLIC_READ_TABLES.includes(tableName)) {
        const policyName = `public_read_${tableName}`;
        // Drop existing policy if present, then recreate
        await sql.unsafe(`DROP POLICY IF EXISTS "${policyName}" ON public."${tableName}";`);
        await sql.unsafe(`
          CREATE POLICY "${policyName}" ON public."${tableName}"
          FOR SELECT
          USING (true);
        `);
        console.log(`  -> Added public SELECT policy: ${policyName}`);
      }
    }

    console.log("\n=== Verifying updated RLS status ===");
    const updatedTables = await sql`
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;

    let allFixed = true;
    for (const t of updatedTables) {
      console.log(`  - ${t.tablename}: rowsecurity = ${t.rowsecurity}`);
      if (!t.rowsecurity) {
        allFixed = false;
      }
    }

    if (allFixed) {
      console.log("\n SUCCESS: All tables in public schema now have Row Level Security enabled!");
    } else {
      console.log("\n⚠️ WARNING: Some tables still have rowsecurity = false.");
    }
  } catch (err: any) {
    console.error("Error applying RLS:", err.message || err);
  } finally {
    await sql.end();
  }
}

main();
