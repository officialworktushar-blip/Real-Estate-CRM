import { config } from "../config";
import { logger } from "../utils/logger";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const GOLD = "#d4a843";
const DARK = "#0f172a";
const DARK_LIGHTER = "#1e293b";
const TEXT_LIGHT = "#f1f5f9";
const TEXT_MUTED = "#94a3b8";
const BORDER = "#334155";

function baseLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Oryntal Estate</title>
</head>
<body style="margin:0;padding:0;background-color:${DARK};font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${DARK};padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${DARK_LIGHTER};border-radius:12px;overflow:hidden;border:1px solid ${BORDER};">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid ${BORDER};text-align:center;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="padding-right:10px;vertical-align:middle;">
                    <div style="width:36px;height:36px;background:${GOLD};border-radius:8px;text-align:center;line-height:36px;font-size:18px;font-weight:700;color:${DARK};">O</div>
                  </td>
                  <td style="vertical-align:middle;">
                    <span style="font-size:20px;font-weight:700;color:${TEXT_LIGHT};letter-spacing:-0.5px;">Oryntal Estate</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid ${BORDER};text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:${TEXT_MUTED};">
                Oryntal Estate &mdash; Premium Real Estate CRM
              </p>
              <p style="margin:0;font-size:11px;color:${TEXT_MUTED};">
                This email was sent to you because you have an account on Oryntal Estate.
                <br/>
                <a href="${config.frontend.url}/settings" style="color:${GOLD};text-decoration:none;">Manage preferences</a>
                &nbsp;&middot;&nbsp;
                <a href="${config.frontend.url}" style="color:${GOLD};text-decoration:none;">Visit Dashboard</a>
              </p>
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
  return `
    <a href="${url}" target="_blank" style="
      display:inline-block;
      padding:14px 32px;
      background:${GOLD};
      color:${DARK};
      text-decoration:none;
      border-radius:8px;
      font-size:15px;
      font-weight:700;
      letter-spacing:0.3px;
      margin-top:8px;
    ">${label}</a>`;
}

function divider(): string {
  return `<div style="height:1px;background:${BORDER};margin:28px 0;"></div>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:${TEXT_LIGHT};letter-spacing:-0.5px;">${text}</h1>`;
}

function subheading(text: string): string {
  return `<p style="margin:0 0 24px;font-size:15px;color:${TEXT_MUTED};line-height:1.6;">${text}</p>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:14px;color:${TEXT_LIGHT};line-height:1.7;">${text}</p>`;
}

function infoBox(rows: { label: string; value: string }[]): string {
  const cells = rows
    .map(
      (r) => `
      <tr>
        <td style="padding:10px 16px;font-size:13px;color:${TEXT_MUTED};border-bottom:1px solid ${BORDER};">${r.label}</td>
        <td style="padding:10px 16px;font-size:13px;color:${TEXT_LIGHT};font-weight:600;text-align:right;border-bottom:1px solid ${BORDER};">${r.value}</td>
      </tr>`
    )
    .join("");
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:${DARK};border:1px solid ${BORDER};border-radius:8px;overflow:hidden;margin:16px 0;">
      ${cells}
    </table>`;
}

async function sendEmail(options: EmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!config.email.resendApiKey) {
    logger.warn("Email not configured — skipping send to:", options.to);
    return { success: false, error: "Email not configured" };
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

    const body = await response.json();

    if (!response.ok) {
      throw new Error(`Resend API ${response.status}: ${JSON.stringify(body)}`);
    }

    logger.info(`Email sent to ${options.to}: ${options.subject} (id: ${body.id})`);
    return { success: true, id: body.id };
  } catch (err) {
    const msg = (err as Error).message;
    logger.error("Failed to send email:", msg);
    return { success: false, error: msg };
  }
}

export const emailService = {
  async sendWelcome(to: string, fullName: string) {
    const html = baseLayout(`
      ${heading("Welcome aboard, " + fullName.split(" ")[0] + "!")}
      ${subheading("Your real estate empire starts here.")}
      ${paragraph(
        "Your Oryntal Estate account is now active. You have access to powerful tools for managing leads, properties, deals, and your entire pipeline — all from one beautiful dashboard."
      )}
      ${divider()}
      ${infoBox([
        { label: "Account", value: to },
        { label: "Plan", value: "Starter (Free)" },
        { label: "Status", value: "Active" },
      ])}
      ${paragraph("Here's what you can do right away:")}
      <table cellpadding="0" cellspacing="0" style="margin:12px 0 24px;">
        <tr>
          <td style="padding:6px 0;font-size:14px;color:${TEXT_LIGHT};">&#10003;&nbsp;&nbsp;Add your first property listing</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:14px;color:${TEXT_LIGHT};">&#10003;&nbsp;&nbsp;Capture and track leads automatically</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:14px;color:${TEXT_LIGHT};">&#10003;&nbsp;&nbsp;Build your deal pipeline</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:14px;color:${TEXT_LIGHT};">&#10003;&nbsp;&nbsp;Schedule meetings and showings</td>
        </tr>
      </table>
      <div style="text-align:center;margin-top:24px;">
        ${button("Go to Dashboard", config.frontend.url + "/dashboard")}
      </div>
    `);

    return sendEmail({
      to,
      subject: "Welcome to Oryntal Estate \u2014 Your Account is Ready",
      html,
      text: `Welcome to Oryntal Estate, ${fullName}! Your account is ready. Log in at ${config.frontend.url}/dashboard`,
    });
  },

  async sendPasswordReset(to: string, resetUrl: string) {
    const html = baseLayout(`
      ${heading("Password Reset")}
      ${subheading("We received a request to reset your password.")}
      ${paragraph(
        "Click the button below to set a new password. This link will expire in <strong>60 minutes</strong> for security reasons."
      )}
      <div style="text-align:center;margin:32px 0;">
        ${button("Reset My Password", resetUrl)}
      </div>
      ${divider()}
      <p style="margin:0;font-size:13px;color:${TEXT_MUTED};line-height:1.6;">
        If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
      </p>
    `);

    return sendEmail({
      to,
      subject: "Oryntal Estate \u2014 Reset Your Password",
      html,
      text: `Reset your password: ${resetUrl}. Link expires in 60 minutes.`,
    });
  },

  async sendSubscriptionSuccess(to: string, fullName: string, plan: string, amount: number) {
    const monthlyPrice = plan === "professional" ? "$79" : plan === "enterprise" ? "$199" : "$29";
    const html = baseLayout(`
      ${heading("Subscription Confirmed")}
      ${subheading("Thank you for upgrading to " + plan.charAt(0).toUpperCase() + plan.slice(1) + "!")}
      ${paragraph(
        "Your payment has been processed successfully. You now have access to all the features included in your plan."
      )}
      ${infoBox([
        { label: "Plan", value: plan.charAt(0).toUpperCase() + plan.slice(1) },
        { label: "Amount Charged", value: "$" + (amount / 100).toFixed(2) },
        { label: "Billing Cycle", value: "Monthly (" + monthlyPrice + "/mo)" },
        { label: "Account Holder", value: fullName },
      ])}
      ${divider()}
      ${paragraph("Your plan includes:")}
      <table cellpadding="0" cellspacing="0" style="margin:12px 0 24px;">
        <tr>
          <td style="padding:6px 0;font-size:14px;color:${TEXT_LIGHT};">&#10003;&nbsp;&nbsp;Unlimited lead management</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:14px;color:${TEXT_LIGHT};">&#10003;&nbsp;&nbsp;Advanced deal pipeline</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:14px;color:${TEXT_LIGHT};">&#10003;&nbsp;&nbsp;Priority support</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:14px;color:${TEXT_LIGHT};">&#10003;&nbsp;&nbsp;Analytics &amp; reporting</td>
        </tr>
      </table>
      <div style="text-align:center;margin-top:24px;">
        ${button("Go to Dashboard", config.frontend.url + "/dashboard")}
      </div>
    `);

    return sendEmail({
      to,
      subject: "Oryntal Estate \u2014 Subscription Confirmed (" + plan.charAt(0).toUpperCase() + plan.slice(1) + ")",
      html,
      text: `Hi ${fullName}, your ${plan} subscription is confirmed. Amount: $${(amount / 100).toFixed(2)}/mo.`,
    });
  },

  async sendInvoice(to: string, fullName: string, amount: number, plan: string) {
    const now = new Date();
    const invoiceDate = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const invoiceId = "INV-" + now.getFullYear() + String(now.getMonth() + 1).padStart(2, "0") + String(now.getDate()).padStart(2, "0") + "-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    const html = baseLayout(`
      ${heading("Payment Receipt")}
      ${subheading("Your payment has been processed successfully.")}
      ${infoBox([
        { label: "Invoice", value: invoiceId },
        { label: "Date", value: invoiceDate },
        { label: "Plan", value: plan.charAt(0).toUpperCase() + plan.slice(1) },
        { label: "Amount", value: "$" + (amount / 100).toFixed(2) },
        { label: "Status", value: '<span style="color:#4ade80;">&#9679; Paid</span>' },
      ])}
      ${divider()}
      ${paragraph(
        "This email serves as your payment receipt. You can also view and download invoices from your billing settings."
      )}
      <div style="text-align:center;margin-top:24px;">
        ${button("View Billing", config.frontend.url + "/settings/billing")}
      </div>
    `);

    return sendEmail({
      to,
      subject: "Oryntal Estate \u2014 Invoice " + invoiceId,
      html,
      text: `Invoice ${invoiceId}: $${(amount / 100).toFixed(2)} for ${plan} plan. Paid.`,
    });
  },

  async sendPaymentFailed(to: string, fullName: string) {
    const html = baseLayout(`
      ${heading("Payment Failed")}
      ${subheading("We couldn't process your latest payment.")}
      ${paragraph(
        "Hi " + fullName + ", we were unable to charge your payment method for your Oryntal Estate subscription. Please update your billing information to avoid any interruption to your service."
      )}
      ${infoBox([
        { label: "Account", value: fullName },
        { label: "Status", value: '<span style="color:#f87171;">&#9679; Payment Failed</span>' },
      ])}
      <div style="text-align:center;margin:32px 0;">
        ${button("Update Billing Info", config.frontend.url + "/settings/billing")}
      </div>
      ${divider()}
      <p style="margin:0;font-size:13px;color:${TEXT_MUTED};line-height:1.6;">
        If your payment method has expired or you need help, please contact our support team at
        <a href="mailto:support.oryntal@agency.org.in" style="color:${GOLD};text-decoration:none;">support.oryntal@agency.org.in</a>
      </p>
    `);

    return sendEmail({
      to,
      subject: "Oryntal Estate \u2014 Action Required: Payment Failed",
      html,
      text: `Hi ${fullName}, your latest payment failed. Please update your billing info at ${config.frontend.url}/settings/billing`,
    });
  },

  async sendSubscriptionCancelled(to: string, fullName: string) {
    const html = baseLayout(`
      ${heading("Subscription Cancelled")}
      ${subheading("Your subscription has been cancelled.")}
      ${paragraph(
        "Hi " + fullName + ", your Oryntal Estate subscription has been cancelled. You will continue to have access to your account until the end of your current billing period."
      )}
      ${infoBox([
        { label: "Account", value: fullName },
        { label: "Status", value: '<span style="color:${TEXT_MUTED};">&#9679; Cancelled</span>' },
      ])}
      ${divider()}
      ${paragraph("We're sorry to see you go. Here are a few things you'll lose access to:")}
      <table cellpadding="0" cellspacing="0" style="margin:12px 0 24px;">
        <tr>
          <td style="padding:6px 0;font-size:14px;color:${TEXT_MUTED};">&#10007;&nbsp;&nbsp;Advanced analytics &amp; reporting</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:14px;color:${TEXT_MUTED};">&#10007;&nbsp;&nbsp;Priority support</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:14px;color:${TEXT_MUTED};">&#10007;&nbsp;&nbsp;Unlimited leads &amp; properties</td>
        </tr>
      </table>
      ${paragraph("If you'd like to resubscribe, you can do so anytime from your dashboard.")}
      <div style="text-align:center;margin-top:24px;">
        ${button("Resubscribe", config.frontend.url + "/pricing")}
      </div>
    `);

    return sendEmail({
      to,
      subject: "Oryntal Estate \u2014 Your Subscription Has Been Cancelled",
      html,
      text: `Hi ${fullName}, your Oryntal Estate subscription has been cancelled. Resubscribe at ${config.frontend.url}/pricing`,
    });
  },

  async sendTest(to: string) {
    const html = baseLayout(`
      ${heading("Test Email")}
      ${subheading("Your email configuration is working correctly.")}
      ${infoBox([
        { label: "Provider", value: "Resend" },
        { label: "From", value: config.email.from },
        { label: "Sent At", value: new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) },
      ])}
      ${paragraph(
        "This is a test email sent from the Oryntal Estate backend. If you received this, your Resend API key and email configuration are set up correctly."
      )}
      <div style="text-align:center;margin-top:24px;">
        ${button("Go to Dashboard", config.frontend.url + "/dashboard")}
      </div>
    `);

    return sendEmail({
      to,
      subject: "Oryntal Estate \u2014 Test Email",
      html,
      text: "This is a test email from Oryntal Estate. Your email configuration is working.",
    });
  },
};
