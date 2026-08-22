// Creates one admin user. Run with:
//   node --env-file=.env db/seed-admin.js "Admin Name" admin@example.com somePassword123
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

async function main() {
  const [, , name, email, password] = process.argv;
  if (!name || !email || !password) {
    console.error("Usage: node db/seed-admin.js <name> <email> <password>");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const passwordHash = await bcrypt.hash(password, 10);

  await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin'`,
    [name, email, passwordHash]
  );

  console.log(`Admin user ready: ${email}`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
