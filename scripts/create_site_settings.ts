import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

async function run() {
  console.log('Creating site_settings table if not exists...');
  await sql`
    CREATE TABLE IF NOT EXISTS public.site_settings (
      id SERIAL PRIMARY KEY,
      key VARCHAR(128) UNIQUE NOT NULL,
      value JSON NOT NULL,
      "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `;
  await sql`ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;`;
  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'allow_read_site_settings'
      ) THEN
        CREATE POLICY "allow_read_site_settings" ON public.site_settings FOR SELECT USING (true);
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'service_role_site_settings'
      ) THEN
        CREATE POLICY "service_role_site_settings" ON public.site_settings FOR ALL TO service_role USING (true) WITH CHECK (true);
      END IF;
    END $$;
  `;
  const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_name = 'site_settings';`;
  console.log('site_settings table status:', tables);
  await sql.end();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
