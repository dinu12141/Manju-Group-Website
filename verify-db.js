import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  try {
    const [rows] = await connection.execute('SHOW COLUMNS FROM `users`');
    console.log("Columns in users table:");
    console.log(rows.map(r => r.Field).join(', '));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await connection.end();
  }
}

main();
