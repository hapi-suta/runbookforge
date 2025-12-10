// Email service using Resend
// Add RESEND_API_KEY to your environment variables

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

interface EnrollmentEmailData {
  studentEmail: string;
  studentName?: string;
  batchTitle: string;
  accessUrl: string;
  instructorName?: string;
}

// Send email using Resend API
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.warn('RESEND_API_KEY not configured - email not sent');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: options.from || process.env.EMAIL_FROM || 'RunbookForge <onboarding@resend.dev>',
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Email send failed:', error);
      return { success: false, error: error.message || 'Failed to send email' };
    }

    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

// Email templates
export function getEnrollmentEmailHtml(data: EnrollmentEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Enrolled!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0f1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0f1a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; overflow: hidden; border: 1px solid #334155;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">🎓 You're Enrolled!</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 32px;">
              <p style="margin: 0 0 20px; color: #e2e8f0; font-size: 16px; line-height: 1.6;">
                Hi${data.studentName ? ` ${data.studentName}` : ''},
              </p>
              
              <p style="margin: 0 0 24px; color: #94a3b8; font-size: 16px; line-height: 1.6;">
                You've been enrolled in a new training course:
              </p>
              
              <!-- Course Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="margin: 0 0 8px; color: #a78bfa; font-size: 20px; font-weight: 600;">
                      ${data.batchTitle}
                    </h2>
                    ${data.instructorName ? `<p style="margin: 0; color: #64748b; font-size: 14px;">Instructor: ${data.instructorName}</p>` : ''}
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 8px 0 32px;">
                    <a href="${data.accessUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(139, 92, 246, 0.4);">
                      Access Your Training →
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 16px; color: #64748b; font-size: 14px; line-height: 1.6;">
                Or copy this link to your browser:
              </p>
              <p style="margin: 0 0 24px; padding: 12px 16px; background: #0f172a; border-radius: 8px; border: 1px solid #334155;">
                <a href="${data.accessUrl}" style="color: #38bdf8; text-decoration: none; word-break: break-all; font-size: 13px;">${data.accessUrl}</a>
              </p>
              
              <hr style="border: none; border-top: 1px solid #334155; margin: 32px 0;">
              
              <p style="margin: 0; color: #475569; font-size: 13px; line-height: 1.6;">
                This email was sent to ${data.studentEmail}. If you didn't expect this email, you can safely ignore it.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background: #0f172a; border-top: 1px solid #1e293b;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin: 0; color: #64748b; font-size: 14px; font-weight: 600;">RunbookForge</p>
                    <p style="margin: 4px 0 0; color: #475569; font-size: 12px;">Create amazing learning experiences</p>
                  </td>
                  <td align="right">
                    <p style="margin: 0; color: #475569; font-size: 12px;">a SUTA company</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Send enrollment notification email
export async function sendEnrollmentEmail(data: EnrollmentEmailData): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to: data.studentEmail,
    subject: `You're enrolled in: ${data.batchTitle}`,
    html: getEnrollmentEmailHtml(data),
  });
}

