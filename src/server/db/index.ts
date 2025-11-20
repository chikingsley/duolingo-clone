import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL not set - database will not work');
}

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
const db = sql ? drizzle(sql, { schema }) : null as any;

export default db;
