import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const shouldUseSsl =
  process.env.NODE_ENV === 'production' ||
  process.env.DATABASE_URL?.includes('supabase.co');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;
