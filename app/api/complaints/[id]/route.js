import { pool } from "../../../../lib/db";
import { getUserFromRequest } from "../../../../lib/auth";
import { withOverdueFlag } from "../../../../lib/overdue";

// GET /api/complaints/:id - fetch a single complaint (owner or admin only)
export async function GET(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const result = await pool.query("SELECT * FROM complaints WHERE id = $1", [params.id]);
  const complaint = result.rows[0];
  if (!complaint) return Response.json({ error: "Not found" }, { status: 404 });

  if (user.role === "resident" && complaint.resident_id !== user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  return Response.json({ complaint: withOverdueFlag(complaint) });
}

// PATCH /api/complaints/:id - admin sets priority
export async function PATCH(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== "admin") {
    return Response.json({ error: "Only admins can update priority" }, { status: 403 });
  }

  const { priority } = await request.json();
  if (!["Low", "Medium", "High"].includes(priority)) {
    return Response.json({ error: "Invalid priority" }, { status: 400 });
  }

  const result = await pool.query(
    "UPDATE complaints SET priority = $1 WHERE id = $2 RETURNING *",
    [priority, params.id]
  );
  if (!result.rows[0]) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json({ complaint: withOverdueFlag(result.rows[0]) });
}
