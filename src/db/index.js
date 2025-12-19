
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log("📀 PostgreSQL connected:", res.rows[0].now);
  } catch (err) {
    console.error("❌ Database connection FAILED:");
    console.error(err.message);
  }
}
