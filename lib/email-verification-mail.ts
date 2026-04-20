// lib/email-verification-mail.ts
import { resend } from "@/lib/resend";

function buildVerifyEmailHtml(verifyUrl: string) {
  return `
  <div style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
      <tr>
        <td align="center">

          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:30px;max-width:600px;">
            
            <tr>
              <td style="text-align:center;padding-bottom:20px;">
                <h2 style="margin:0;color:#111;font-size:24px;">
                  Verify your VelvetLynk email
                </h2>
              </td>
            </tr>

            <tr>
              <td style="font-size:15px;color:#333;line-height:1.6;">
                <p style="margin-top:0;">
                  Welcome to <strong>VelvetLynk</strong>.
                </p>

                <p>
                  Before you can fully use your account, we need to confirm that this email address belongs to you.
                </p>

                <p>
                  Verifying your email helps us keep the platform secure, prevents unauthorized account access,
                  and ensures you receive important account notifications.
                </p>

                <p style="margin-top:25px;text-align:center;">
                  <a
                    href="${verifyUrl}"
                    style="display:inline-block;background:#111;color:#ffffff;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;"
                  >
                    Verify Email Address
                  </a>
                </p>

                <p style="margin-top:25px;">
                  This verification link will expire in <strong>24 hours</strong> and can only be used once.
                </p>

                <p>
                  If the button above does not work, copy and paste the link below into your browser:
                </p>

                <p style="word-break:break-all;color:#555;font-size:13px;">
                  ${verifyUrl}
                </p>

                <hr style="border:none;border-top:1px solid #eee;margin:30px 0;" />

                <p style="font-size:13px;color:#666;">
                  If you did not create a VelvetLynk account, you can safely ignore this email.
                  No further action is required.
                </p>

                <p style="font-size:13px;color:#666;">
                  This email was sent automatically by VelvetLynk. Please do not reply to this message.
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

export async function sendEmailVerificationEmail(params: {
  to: string;
  verifyUrl: string;
}) {
  console.log("RESEND_API_KEY present:", Boolean(process.env.RESEND_API_KEY));
  console.log(
    "RESEND_FROM_EMAIL:",
    process.env.RESEND_FROM_EMAIL || "VelvetLynk <noreply@velvetlynk.com>"
  );
  console.log("Sending verification email to:", params.to);

  const result = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "VelvetLynk <noreply@velvetlynk.com>",
    to: params.to,
    subject: "Verify your VelvetLynk email address",
    html: buildVerifyEmailHtml(params.verifyUrl),
  });

  console.log("Resend verification email result:", result);

  if ((result as any)?.error) {
    console.error(
      "Resend verification email error:",
      (result as any).error
    );
    throw new Error("Verification email failed to send");
  }

  return result;
}