// Sends email via the Resend REST API using plain fetch - no SDK dependency
// needed. Swap this out for Nodemailer/SendGrid if you prefer; the calling
// code only depends on sendEmail(to, subject, html).

// export async function sendEmail(to, subject, html) {
//   if (!process.env.BREVO_API_KEY) {
//     console.warn("BREVO_API_KEY not set - skipping email send:", subject);
//     return;
//   }

//   try {
//     const res = await fetch("https://api.brevo.com/v3/smtp/emails", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         sender: {
//           name: "Society Maintenance Tracker",
//           email: process.env.EMAIL_FROM,
//         },
//         to: [
//           {
//             email: to,
//           },
//         ],
//         subject,
//         htmlContent: html,
//       }),
//     });
//     if (!res.ok) {
//       console.error("Email send failed:", await res.text());
//       return;
//     }
//     console.log("Email sent successfully to: ", to)
//   } catch (err) {
//     // Never let an email failure break the request that triggered it.
//     console.error("Email send error:", err);
//   }
// }

// export function complaintStatusEmail(complaint, note) {
//   return {
//     subject: `Your complaint #${complaint.id} is now ${complaint.status}`,
//     html: `
//       <p>Hi,</p>
//       <p>Your complaint "<strong>${complaint.description}</strong>" (category: ${complaint.category})
//       has been updated to status: <strong>${complaint.status}</strong>.</p>
//       ${note ? `<p>Note from admin: ${note}</p>` : ""}
//       <p>You can view the full history in your dashboard.</p>
//     `,
//   };
// }

// export function importantNoticeEmail(notice) {
//   return {
//     subject: `Important Notice: ${notice.title}`,
//     html: `
//       <p>A new important notice has been posted:</p>
//       <h3>${notice.title}</h3>
//       <p>${notice.body}</p>
//     `,
//   };
// }


export async function sendEmail(to, subject, html) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("SENDGRID_API_KEY not set - skipping email:", subject);
    return;
  }

  try {
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }],
          },
        ],
        from: {
          email: process.env.EMAIL_FROM,
          name: "Society Maintenance Tracker",
        },
        subject,
        content: [
          {
            type: "text/html",
            value: html,
          },
        ],
      }),
    });

    if (!res.ok) {
      console.error("Email send failed:", res.status, await res.text());
      return;
    }

    console.log("Email sent successfully to:", to);
  } catch (err) {
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