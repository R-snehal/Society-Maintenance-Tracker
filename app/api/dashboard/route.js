import { pool } from "../../../lib/db";
import { getUserFromRequest } from "../../../lib/auth";
import { getOverdueThresholdDays } from "../../../lib/overdue";

// GET /api/dashboard - admin only. Simple aggregate counts for the
// dashboard: total by status, total by category, and overdue count.
export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const byStatus = await pool.query(
    `SELECT status, COUNT(*)::int AS count FROM complaints GROUP BY status`
  );
  const byCategory = await pool.query(
    `SELECT category, COUNT(*)::int AS count FROM complaints GROUP BY category`
  );
  const thresholdDays = getOverdueThresholdDays();
  const overdue = await pool.query(
    `SELECT COUNT(*)::int AS count FROM complaints
     WHERE status != 'Resolved' AND created_at < now() - ($1 || ' days')::interval`,
    [thresholdDays]
  );
  const total = await pool.query(`SELECT COUNT(*)::int AS count FROM complaints`);

  return Response.json({
    total: total.rows[0].count,
    byStatus: byStatus.rows,
    byCategory: byCategory.rows,
    overdueCount: overdue.rows[0].count,
    overdueThresholdDays: thresholdDays,
  });
}
