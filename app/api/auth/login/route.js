import { pool } from "../../../../lib/db";
import { verifyPassword, signToken } from "../../../../lib/auth";

export async function POST(request) {
  const { email, password } = await request.json();

  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  const user = result.rows[0];
  if (!user) {
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = signToken(user);
  return Response.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  });
}
