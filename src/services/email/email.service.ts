import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private testAccountPromise: Promise<nodemailer.TestAccount> | null = null;

  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) return this.transporter;

    const host = process.env.SMTP_HOST || '';
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER || '';
    const pass = process.env.SMTP_PASS || '';

    if (host && user && pass) {
      // Production: Use configured SMTP
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    } else {
      // Development: Create an Ethereal test account (free email testing)
      if (!this.testAccountPromise) {
        this.testAccountPromise = nodemailer.createTestAccount();
      }
      const testAccount = await this.testAccountPromise;
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    return this.transporter;
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; previewUrl?: string; error?: string }> {
    try {
      const transporter = await this.getTransporter();
      const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@eduguard.ai';
      const appName = process.env.NEXT_PUBLIC_APP_NAME || 'EduGuard AI';

      const info = await transporter.sendMail({
        from: `"${appName}" <${from}>`,
        to: options.to,
        subject: options.subject,
        text: options.text || '',
        html: options.html,
      });

      // Ethereal gives a preview URL for development
      const previewUrl = nodemailer.getTestMessageUrl(info);

      return {
        success: true,
        previewUrl: previewUrl ? String(previewUrl) : undefined,
      };
    } catch (error) {
      console.error('[EmailService] Failed to send email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
      };
    }
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<{ success: boolean; previewUrl?: string; error?: string }> {
    const appName = process.env.NEXT_PUBLIC_APP_NAME || 'EduGuard AI';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetLink = `${appUrl}/reset-password?token=${resetToken}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; margin-top: 40px; margin-bottom: 40px;">
    <tr>
      <td style="padding: 40px 30px;">
        <h1 style="color: #f1f5f9; font-size: 24px; margin: 0 0 8px 0; text-align: center;">
          🔐 Password Reset Request
        </h1>
        <p style="color: #94a3b8; font-size: 14px; text-align: center; margin: 0 0 30px 0;">
          ${appName}
        </p>

        <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          We received a request to reset the password for your account.
        </p>
        <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
          Click the button below to set a new password. This link will expire in <strong style="color: #f59e0b;">1 hour</strong>.
        </p>

        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center">
              <a href="${resetLink}" style="display: inline-block; padding: 14px 40px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
                Reset Password
              </a>
            </td>
          </tr>
        </table>

        <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 30px 0 10px 0;">
          If the button doesn't work, copy and paste this link into your browser:
        </p>
        <p style="color: #60a5fa; font-size: 13px; word-break: break-all; margin: 0 0 30px 0;">
          ${resetLink}
        </p>

        <hr style="border: none; border-top: 1px solid #334155; margin: 30px 0;">

        <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0;">
          If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>
        <p style="color: #475569; font-size: 12px; margin: 20px 0 0 0; text-align: center;">
          &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const text = `
Password Reset Request
${appName}

We received a request to reset the password for your account.

Click the link below to set a new password. This link will expire in 1 hour.

${resetLink}

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

© ${new Date().getFullYear()} ${appName}. All rights reserved.
`;

    return this.sendEmail({
      to,
      subject: `Reset Your Password — ${appName}`,
      html,
      text,
    });
  }
}

export const emailService = new EmailService();
