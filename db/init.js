// Run with: npm run db:init
// Reads db/schema.sql and executes it against DATABASE_URL.
// Uses Node's built-in --env-file flag (Node 20.6+) - no dotenv dependency needed.
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await pool.query(sql);
  console.log("Schema applied successfully.");
  await pool.end();
}

main().catch((err) => {
  console.error("Failed to apply schema:", err);
  process.exit(1);
});
