import { pool } from "../../../../../lib/db";
import { getUserFromRequest } from "../../../../../lib/auth";
import { sendEmail, complaintStatusEmail } from "../../../../../lib/mailer";

const VALID_STATUSES = ["Open", "In Progress", "Resolved"];

// PATCH /api/complaints/:id/status
// Admin-only. Updates complaint.status, appends a complaint_history row
// with timestamp + actor + optional note, and emails the resident.
// Marking Resolved also stamps resolved_at, which closes the complaint.
export async function PATCH(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== "admin") {
    return Response.json({ error: "Only admins can update status" }, { status: 403 });
  }

  const { status, note } = await request.json();
  if (!VALID_STATUSES.includes(status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const updateResult = await client.query(
      `UPDATE complaints
       SET status = $1, resolved_at = CASE WHEN $1 = 'Resolved' THEN now() ELSE resolved_at END
       WHERE id = $2 RETURNING *`,
      [status, params.id]
    );
    const complaint = updateResult.rows[0];
    if (!complaint) {
      await client.query("ROLLBACK");
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    await client.query(
      `INSERT INTO complaint_history (complaint_id, status, actor_id, note)
       VALUES ($1, $2, $3, $4)`,
      [complaint.id, status, user.id, note || null]
    );

    const residentResult = await client.query("SELECT email FROM users WHERE id = $1", [
      complaint.resident_id,
    ]);

    await client.query("COMMIT");

    const residentEmail = residentResult.rows[0]?.email;
    if (residentEmail) {
      const { subject, html } = complaintStatusEmail(complaint, note);
      // Fire and forget - a failed email must never fail the status update.
      sendEmail(residentEmail, subject, html);
    }

    return Response.json({ complaint });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return Response.json({ error: "Failed to update status" }, { status: 500 });
  } finally {
    client.release();
  }
}
