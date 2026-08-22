// Sends email via the Resend REST API using plain fetch - no SDK dependency
// needed. Swap this out for Nodemailer/SendGrid if you prefer; the calling
// code only depends on sendEmail(to, subject, html).

export async function sendEmail(to, subject, html) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set - skipping email send:", subject);
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "onboarding@resend.dev",
        to,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      console.error("Email send failed:", await res.text());
    }
  } catch (err) {
    // Never let an email failure break the request that triggered it.
    console.error("Email send error:", err);
  }
}

export function complaintStatusEmail(complaint, note) {
  return {
    subject: `Your complaint #${complaint.id} is now ${complaint.status}`,
    html: `
      <p>Hi,</p>
      <p>Your complaint "<strong>${complaint.description}</strong>" (category: ${complaint.category})
      has been updated to status: <strong>${complaint.status}</strong>.</p>
      ${note ? `<p>Note from admin: ${note}</p>` : ""}
      <p>You can view the full history in your dashboard.</p>
    `,
  };
}

export function importantNoticeEmail(notice) {
  return {
    subject: `Important Notice: ${notice.title}`,
    html: `
      <p>A new important notice has been posted:</p>
      <h3>${notice.title}</h3>
      <p>${notice.body}</p>
    `,
  };
}
