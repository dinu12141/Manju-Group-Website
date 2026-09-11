import { getDb } from './server/db.js';
import { contactMessages } from './drizzle/schema.js';

async function test() {
  const db = await getDb();
  await db.insert(contactMessages).values({
    name: 'Test Customer',
    email: 'test@example.com',
    phone: '+94711234567',
    subject: '[Product Inquiry & Pricing] Test Message from Node',
    message: 'This is a test message generated to ensure the backend integration is working correctly.'
  });
  console.log('Inserted successfully!');
  process.exit(0);
}
test();
