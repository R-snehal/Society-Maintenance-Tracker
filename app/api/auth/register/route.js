import { pool } from "../../../../lib/db";
import { hashPassword, signToken } from "../../../../lib/auth";

export async function POST(request) {
  const { name, email, password, role } = await request.json();

  if (!name || !email || !password) {
    return Response.json({ error: "name, email, and password are required" }, { status: 400 });
  }

  // Only allow self-registration as "resident". Admin accounts should be
  // created manually/seeded - never let a client register itself as admin.
  const safeRole = role === "admin" ? "resident" : "resident";

  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rows.length > 0) {
    return Response.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4) RETURNING id, name, email, role`,
    [name, email, passwordHash, safeRole]
  );

  const user = result.rows[0];
  const token = signToken(user);
  return Response.json({ user, token });
}
