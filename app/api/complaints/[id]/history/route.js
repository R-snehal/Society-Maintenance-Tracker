import { pool } from "../../../../../lib/db";
import { getUserFromRequest } from "../../../../../lib/auth";

// GET /api/complaints/:id/history - full timestamped status history
export async function GET(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const complaintResult = await pool.query("SELECT resident_id FROM complaints WHERE id = $1", [
    params.id,
  ]);
  const complaint = complaintResult.rows[0];
  if (!complaint) return Response.json({ error: "Not found" }, { status: 404 });
  if (user.role === "resident" && complaint.resident_id !== user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const history = await pool.query(
    `SELECT h.*, u.name AS actor_name
     FROM complaint_history h
     JOIN users u ON u.id = h.actor_id
     WHERE h.complaint_id = $1
     ORDER BY h.created_at ASC`,
    [params.id]
  );

  return Response.json({ history: history.rows });
}
