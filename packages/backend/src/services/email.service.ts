import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { config } from "../config";
import { logger } from "../utils/logger";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    const smtp = config.email.smtp;
    transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: { user: smtp.user, pass: smtp.pass },
    });
  }
  return transporter;
}

function baseLayout(title: string, content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:24px;background:#0f172a;color:#ffffff;font-size:18px;font-weight:700;text-align:center;">
              Oryntal Estate
            </td>
          </tr>
          <tr>
            <td style="padding:32px 24px;font-size:14px;line-height:1.7;color:#334155;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;text-align:center;">
              &copy; ${new Date().getFullYear()} Oryntal Estate
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(label: string, url: string): string {
  return `<p style="margin:24px 0;"><a href="${url}" style="display:inline-block;padding:12px 28px;background:#d4a843;color:#0f172a;text-decoration:none;border-radius:6px;font-weight:700;">${label}</a></p>`;
}

async function sendEmail(options: EmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  const smtp = config.email.smtp;
  if (!smtp.host || !smtp.user || !smtp.pass) {
    logger.warn("SMTP not configured — skipping send to:", options.to);
    return { success: false, error: "SMTP not configured" };
  }

  try {
    const info = await getTransporter().sendMail({
      from: config.email.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    logger.info(`Email sent to ${options.to}: ${options.subject} (id: ${info.messageId})`);
    return { success: true, id: info.messageId };
  } catch (err) {
    const msg = (err as Error).message;
    logger.error("Failed to send email:", msg);
    return { success: false, error: msg };
  }
}

export const emailService = {
  async sendWelcome(to: string, fullName: string) {
    const firstName = fullName.trim().split(/\s+/)[0] || fullName;
    const html = baseLayout(
      "Welcome to Oryntal Estate",
      `
        <p>Hi ${firstName},</p>
        <p>Welcome to Oryntal Estate! Your account is ready. You can now manage your leads, properties, deals, and entire pipeline from one dashboard.</p>
        ${button("Go to Dashboard", config.frontend.url + "/dashboard")}
        <p>If you need any help getting started, just reply to this email.</p>
      `
    );

    return sendEmail({
      to,
      subject: "Welcome to Oryntal Estate",
      html,
      text: `Hi ${firstName}, welcome to Oryntal Estate! Your account is ready. Log in at ${config.frontend.url}/dashboard`,
    });
  },

  async sendPasswordReset(to: string, resetUrl: string) {
    const html = baseLayout(
      "Reset your password",
      `
        <p>We received a request to reset your password.</p>
        <p>Click the button below to choose a new password. This link will expire in <strong>60 minutes</strong>.</p>
        ${button("Reset Password", resetUrl)}
        <p>If you didn't request this, you can safely ignore this email. Your password will remain unchanged.</p>
      `
    );

    return sendEmail({
      to,
      subject: "Reset your Oryntal Estate password",
      html,
      text: `Reset your Oryntal Estate password: ${resetUrl}. This link expires in 60 minutes.`,
    });
  },

  async sendNotification(to: string, subject: string, message: string) {
    const html = baseLayout(subject, `<p>${message}</p>`);

    return sendEmail({
      to,
      subject,
      html,
      text: message,
    });
  },

  async sendTest(to: string) {
    const html = baseLayout(
      "Test Email",
      `
        <p>This is a test email from Oryntal Estate.</p>
        <p>If you received this, your SMTP email configuration is working correctly.</p>
      `
    );

    return sendEmail({
      to,
      subject: "Oryntal Estate \u2014 Test Email",
      html,
      text: "This is a test email from Oryntal Estate. Your email configuration is working.",
    });
  },
};
