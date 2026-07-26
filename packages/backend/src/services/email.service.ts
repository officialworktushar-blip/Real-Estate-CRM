import { config } from "../config";
import { logger } from "../utils/logger";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

async function sendEmail(options: EmailOptions): Promise<void> {
  if (!config.email.resendApiKey) {
    logger.warn("Email not configured — skipping send to:", options.to);
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.email.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.email.from,
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Email API error ${response.status}: ${body}`);
    }

    logger.info(`Email sent to ${options.to}: ${options.subject}`);
  } catch (err) {
    logger.error("Failed to send email:", (err as Error).message);
  }
}

export const emailService = {
  async sendWelcome(to: string, fullName: string) {
    await sendEmail({
      to,
      subject: "Welcome to Oryntal Estate",
      html: `
        <h2>Welcome, ${fullName}!</h2>
        <p>Your account has been created successfully.</p>
        <p>You can now log in and start managing your real estate business.</p>
        <p>If you have any questions, reply to this email.</p>
      `,
    });
  },

  async sendPasswordReset(to: string, resetUrl: string) {
    await sendEmail({
      to,
      subject: "Reset Your Password",
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#d4a843;color:#000;text-decoration:none;border-radius:6px;font-weight:bold;">Reset Password</a>
        <p style="margin-top:16px;color:#666;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      `,
      text: `Reset your password: ${resetUrl}`,
    });
  },

  async sendInvoice(to: string, fullName: string, amount: number, plan: string) {
    await sendEmail({
      to,
      subject: `Oryntal Estate — Invoice for ${plan} Plan`,
      html: `
        <h2>Invoice</h2>
        <p>Hi ${fullName},</p>
        <p>Your payment of <strong>$${(amount / 100).toFixed(2)}</strong> for the <strong>${plan}</strong> plan has been received.</p>
        <p>Thank you for your subscription!</p>
      `,
    });
  },

  async sendPaymentFailed(to: string, fullName: string) {
    await sendEmail({
      to,
      subject: "Oryntal Estate — Payment Failed",
      html: `
        <h2>Payment Failed</h2>
        <p>Hi ${fullName},</p>
        <p>We were unable to process your payment. Please update your billing information to avoid service interruption.</p>
        <a href="${config.frontend.url}/settings/billing" style="display:inline-block;padding:12px 24px;background:#d4a843;color:#000;text-decoration:none;border-radius:6px;font-weight:bold;">Update Billing</a>
      `,
    });
  },

  async sendSubscriptionCancelled(to: string, fullName: string) {
    await sendEmail({
      to,
      subject: "Oryntal Estate — Subscription Cancelled",
      html: `
        <h2>Subscription Cancelled</h2>
        <p>Hi ${fullName},</p>
        <p>Your subscription has been cancelled. You will continue to have access until the end of your billing period.</p>
        <p>We'd love to hear your feedback on how we can improve.</p>
      `,
    });
  },
};
