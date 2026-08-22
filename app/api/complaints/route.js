import { pool } from "../../../lib/db";
import { getUserFromRequest } from "../../../lib/auth";
import { withOverdueFlag } from "../../../lib/overdue";

// GET /api/complaints
// - Resident: returns only their own complaints.
// - Admin: returns all complaints, supports ?category=&status=&from=&to=
//   and sorts overdue complaints to the top.
export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const conditions = [];
  const values = [];

  if (user.role === "resident") {
    values.push(user.id);
    conditions.push(`resident_id = $${values.length}`);
  }
  if (category) {
    values.push(category);
    conditions.push(`category = $${values.length}`);
  }
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }
  if (from) {
    values.push(from);
    conditions.push(`created_at >= $${values.length}`);
  }
  if (to) {
    values.push(to);
    conditions.push(`created_at <= $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const result = await pool.query(
    `SELECT * FROM complaints ${where} ORDER BY created_at DESC`,
    values
  );

  let complaints = result.rows.map(withOverdueFlag);

  // Admin view: overdue complaints surface at the top.
  if (user.role === "admin") {
    complaints = complaints.sort((a, b) => (b.is_overdue ? 1 : 0) - (a.is_overdue ? 1 : 0));
  }

  return Response.json({ complaints });
}

// POST /api/complaints
// Residents raise a new complaint. Also writes the first history row
// (status = Open) so every complaint's history starts consistently.
export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== "resident") {
    return Response.json({ error: "Only residents can raise complaints" }, { status: 403 });
  }

  const { category, description, photoUrl } = await request.json();
  if (!category || !description) {
    return Response.json({ error: "category and description are required" }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const complaintResult = await client.query(
      `INSERT INTO complaints (resident_id, category, description, photo_url)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user.id, category, description, photoUrl || null]
    );
    const complaint = complaintResult.rows[0];

    await client.query(
      `INSERT INTO complaint_history (complaint_id, status, actor_id, note)
       VALUES ($1, $2, $3, $4)`,
      [complaint.id, "Open", user.id, "Complaint raised"]
    );

    await client.query("COMMIT");
    return Response.json({ complaint });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return Response.json({ error: "Failed to create complaint" }, { status: 500 });
  } finally {
    client.release();
  }
}
