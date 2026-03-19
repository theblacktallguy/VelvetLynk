import { resend } from "@/lib/resend";

function buildApprovedHtml(params: { userSlug: string }) {
  return `
  <div style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:30px;max-width:600px;">
            <tr>
              <td style="text-align:center;padding-bottom:20px;">
                <h2 style="margin:0;color:#111;font-size:24px;">
                  Your Level 2 verification was approved
                </h2>
              </td>
            </tr>

            <tr>
              <td style="font-size:15px;color:#333;line-height:1.6;">
                <p style="margin-top:0;">
                  Hello <strong>@${params.userSlug}</strong>,
                </p>

                <p>
                  Your VelvetLynk Level 2 verification request has been approved.
                </p>

                <p>
                  Your profile now carries the verification badge, which gives visitors an extra trust signal on your account.
                </p>

                <p>
                  You can continue using your account normally.
                </p>

                <hr style="border:none;border-top:1px solid #eee;margin:30px 0;" />

                <p style="font-size:13px;color:#666;">
                  This email was sent automatically by VelvetLynk. Please do not reply directly to this message.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
  `;
}

function buildRejectedHtml(params: { userSlug: string; reviewNote?: string | null }) {
  return `
  <div style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:30px;max-width:600px;">
            <tr>
              <td style="text-align:center;padding-bottom:20px;">
                <h2 style="margin:0;color:#111;font-size:24px;">
                  Your Level 2 verification was not approved
                </h2>
              </td>
            </tr>

            <tr>
              <td style="font-size:15px;color:#333;line-height:1.6;">
                <p style="margin-top:0;">
                  Hello <strong>@${params.userSlug}</strong>,
                </p>

                <p>
                  We reviewed your VelvetLynk Level 2 verification request, but we could not approve it at this time.
                </p>

                ${
                  params.reviewNote
                    ? `<p><strong>Reason:</strong> ${params.reviewNote}</p>`
                    : ""
                }

                <p>
                  You can return to your verification page, correct the issue, and submit a new verification request.
                </p>

                <p>
                  To improve your chances of approval, make sure:
                </p>

                <ul style="padding-left:20px;margin-top:0;">
                  <li>Your selfie is clear and well-lit</li>
                  <li>Your proof photo clearly shows your username and the current date</li>
                  <li>Your face is fully visible</li>
                </ul>

                <hr style="border:none;border-top:1px solid #eee;margin:30px 0;" />

                <p style="font-size:13px;color:#666;">
                  This email was sent automatically by VelvetLynk. Please do not reply directly to this message.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
  `;
}

function buildVerificationBonusHtml(params: {
  userSlug: string;
  credits: number;
}) {
  return `
  <div style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:30px;max-width:600px;">
            <tr>
              <td style="text-align:center;padding-bottom:20px;">
                <h2 style="margin:0;color:#111;font-size:24px;">
                  ${params.credits.toLocaleString()} credits added 🎉
                </h2>
              </td>
            </tr>

            <tr>
              <td style="font-size:15px;color:#333;line-height:1.6;">
                <p>Hello <strong>@${params.userSlug}</strong>,</p>

                <p>
                  You have received <strong>${params.credits.toLocaleString()} credits</strong>
                  for completing verification.
                </p>

                <p>You can now use these credits to post and promote ads.</p>

                <div style="margin-top:20px;text-align:center;">
                  <a
                    href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/account"
                    style="background:#111;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold;"
                  >
                    Go to your account
                  </a>
                </div>

                <hr style="margin:30px 0;" />

                <p style="font-size:13px;color:#666;">
                  This email was sent automatically by VelvetLynk.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
  `;
}

export async function sendLevelTwoApprovedEmail(params: {
  to: string;
  userSlug: string;
}) {
  const result = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
    to: params.to,
    subject: "Your VelvetLynk verification was approved",
    html: buildApprovedHtml(params),
  });

  if ((result as any)?.error) {
    console.error("Approved email error:", (result as any).error);
    throw new Error("Approved email failed");
  }

  return result;
}

export async function sendLevelTwoRejectedEmail(params: {
  to: string;
  userSlug: string;
  reviewNote?: string | null;
}) {
  const result = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
    to: params.to,
    subject: "Your VelvetLynk verification was not approved",
    html: buildRejectedHtml(params),
  });

  if ((result as any)?.error) {
    console.error("Rejected email error:", (result as any).error);
    throw new Error("Rejected email failed");
  }

  return result;
}

export async function sendVerificationBonusCreditedEmail(params: {
  to: string;
  userSlug: string;
  credits: number;
}) {
  const result = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
    to: params.to,
    subject: `${params.credits} credits added to your VelvetLynk wallet`,
    html: buildVerificationBonusHtml(params),
  });

  if ((result as any)?.error) {
    console.error("Bonus email error:", (result as any).error);
    throw new Error("Bonus email failed");
  }

  return result;
}