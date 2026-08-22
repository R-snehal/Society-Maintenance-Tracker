import { pool } from "../../../lib/db";
import { getUserFromRequest } from "../../../lib/auth";
import { sendEmail, importantNoticeEmail } from "../../../lib/mailer";

// GET /api/notices - anyone logged in can view the notice board.
// Important notices are pinned to the top, then newest first.
export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const result = await pool.query(
    `SELECT n.*, u.name AS author_name
     FROM notices n JOIN users u ON u.id = n.author_id
     ORDER BY n.is_important DESC, n.created_at DESC`
  );
  return Response.json({ notices: result.rows });
}

// POST /api/notices - admin only. Emails all residents if isImportant.
export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== "admin") {
    return Response.json({ error: "Only admins can post notices" }, { status: 403 });
  }

  const { title, body, isImportant } = await request.json();
  if (!title || !body) {
    return Response.json({ error: "title and body are required" }, { status: 400 });
  }

  const result = await pool.query(
    `INSERT INTO notices (title, body, is_important, author_id)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [title, body, !!isImportant, user.id]
  );
  const notice = result.rows[0];

  if (notice.is_important) {
    const residents = await pool.query("SELECT email FROM users WHERE role = 'resident'");
    const { subject, html } = importantNoticeEmail(notice);
    // Fire and forget for each resident - keep the API response fast.
    for (const r of residents.rows) {
      sendEmail(r.email, subject, html);
    }
  }

  return Response.json({ notice });
}
