import { Pool } from "pg";

// Reuse a single pool across hot reloads / serverless invocations.
let pool = global._pgPool;
if (!pool) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes("sslmode=require")
      ? { rejectUnauthorized: false }
      : undefined,
  });
  global._pgPool = pool;
}

export { pool };
