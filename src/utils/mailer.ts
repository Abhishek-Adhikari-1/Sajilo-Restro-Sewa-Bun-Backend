import nodemailer from "nodemailer";
import { env } from "../config/env";

// ─── Transporter ──────────────────────────────────────────────────────────────

export const mailer = nodemailer.createTransport({
  service: env.SMTP_SERVICE,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

// ─── Base HTML Template ───────────────────────────────────────────────────────

function baseTemplate(title: string, body: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background: #f0f2f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .wrapper { max-width: 580px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); padding: 36px 40px; text-align: center; }
    .header-icon { font-size: 40px; display: block; margin-bottom: 12px; }
    .header h1 { margin: 0; color: #fff; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
    .header p  { margin: 6px 0 0; color: rgba(255,255,255,.55); font-size: 13px; }
    .content { padding: 40px; color: #374151; font-size: 15px; line-height: 1.7; }
    .content p { margin: 0 0 16px; }
    .greeting { font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 20px !important; }
    .btn { display: inline-block; margin: 12px 0 24px; padding: 15px 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff !important; text-decoration: none; border-radius: 10px; font-size: 15px; font-weight: 600; letter-spacing: 0.2px; }
    .btn:hover { opacity: 0.9; }
    .code-box { display: block; margin: 16px 0 24px; padding: 16px 24px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.5; color: #1a1a2e; word-break: break-all; }
    .credential-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
    .credential-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #9ca3af; font-weight: 600; }
    .credential-value { font-size: 14px; color: #111827; font-weight: 600; }
    .warning-box { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 10px; padding: 16px 20px; margin: 20px 0; }
    .warning-box p { margin: 0; color: #92400e; font-size: 13px; }
    .divider { height: 1px; background: #f3f4f6; margin: 24px 0; }
    .muted { color: #6b7280; font-size: 13px; }
    .footer { padding: 24px 40px; background: #f9fafb; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; line-height: 1.6; text-align: center; }
    .footer a { color: #6366f1; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <span class="header-icon">🍽️</span>
      <h1>Sajilo Restro Sewa</h1>
      <p>Restaurant Management Platform</p>
    </div>
    <div class="content">
      ${body}
    </div>
    <div class="footer">
      <p>You received this email because an action was taken on your Sajilo Restro Sewa account.</p>
      <p>If you did not perform this action, you can safely ignore this email.</p>
      <p>&copy; ${new Date().getFullYear()} Sajilo Restro Sewa. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

// ─── Template Renderers ───────────────────────────────────────────────────────

export interface EmailVerificationParams {
  to: string;
  firstName: string;
  verificationUrl: string;
}

export function renderEmailVerification({
  firstName,
  verificationUrl,
}: Omit<EmailVerificationParams, "to">): string {
  const body = `
    <p class="greeting">Dear ${firstName},</p>
    <p>Welcome to <strong>Sajilo Restro Sewa</strong>! We're excited to have you on board.</p>
    <p>Please verify your email address to activate your account and get started:</p>
    <p style="text-align:center;">
      <a href="${verificationUrl}" class="btn">Verify Email Address</a>
    </p>
    <p class="muted">This link will expire in <strong>24 hours</strong>.</p>
    <div class="divider"></div>
    <p class="muted">Or copy and paste this URL into your browser:<br/>
      <span class="code-box">${verificationUrl}</span>
    </p>
    <p class="muted">If you did not create an account, you can safely ignore this email.</p>
  `;
  return baseTemplate("Verify Your Email", body);
}

// ─────────────────────────────────────────────────────────────────────────────

export interface AccountCreatedParams {
  to: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  loginUrl: string;
}

export function renderAccountCreated({
  firstName,
  lastName,
  email,
  password,
  role,
  loginUrl,
}: Omit<AccountCreatedParams, "to">): string {
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const body = `
    <p class="greeting">Dear ${firstName} ${lastName},</p>
    <p>Your account has been created on <strong>Sajilo Restro Sewa</strong> by an administrator.</p>
    <p>Here are your login credentials:</p>

    <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:10px; padding:20px 24px; margin:16px 0;">
      <div class="credential-row">
        <span class="credential-label">Email Address</span>
        <span class="credential-value">${email}</span>
      </div>
      <div class="credential-row">
        <span class="credential-label">Temporary Password</span>
        <span class="credential-value" style="font-family:monospace; font-size:16px; letter-spacing:1px;">${password}</span>
      </div>
      <div class="credential-row" style="border-bottom:none;">
        <span class="credential-label">Role</span>
        <span class="credential-value">${roleLabel}</span>
      </div>
    </div>

    <div class="warning-box">
      <p>⚠️ <strong>Important:</strong> This is a temporary password generated by the system. Please log in and change it immediately for your security.</p>
    </div>

    <p style="text-align:center;">
      <a href="${loginUrl}" class="btn">🚀 Login to Your Account</a>
    </p>

    <div class="divider"></div>
    <p class="muted">If you have any questions or need help, please contact your administrator.</p>
  `;
  return baseTemplate("Your Account Has Been Created", body);
}

// ─────────────────────────────────────────────────────────────────────────────

export interface CustomEmailParams {
  to: string;
  recipientName: string;
  recipientEmail: string;
  subject: string;
  body: string;
}

export function renderCustomEmail({
  recipientName,
  recipientEmail,
  body,
}: Omit<CustomEmailParams, "to" | "subject">): string {
  // Replace placeholders: {{name}}, {{email}}
  const processedBody = body
    .replace(/\{\{name\}\}/gi, recipientName)
    .replace(/\{\{email\}\}/gi, recipientEmail)
    // Convert newlines to <br> for HTML display
    .replace(/\n/g, "<br/>");

  const htmlBody = `
    <p class="greeting">Dear ${recipientName},</p>
    <div style="margin:8px 0 24px; padding:0; line-height:1.8;">
      ${processedBody}
    </div>
    <div class="divider"></div>
    <p class="muted">This message was sent by the Sajilo Restro Sewa administration team.</p>
  `;
  return baseTemplate("Message from Sajilo Restro Sewa", htmlBody);
}

// ─────────────────────────────────────────────────────────────────────────────

export interface PasswordResetParams {
  to: string;
  firstName: string;
  resetUrl: string;
}

export function renderPasswordReset({
  firstName,
  resetUrl,
}: Omit<PasswordResetParams, "to">): string {
  const body = `
    <p class="greeting">Dear ${firstName},</p>
    <p>We received a request to reset the password for your Sajilo Restro Sewa account.</p>
    <p style="text-align:center;">
      <a href="${resetUrl}" class="btn">🔑 Reset My Password</a>
    </p>
    <p class="muted">This link will expire in <strong>1 hour</strong>.</p>
    <div class="divider"></div>
    <p class="muted">Or copy and paste this URL into your browser:<br/>
      <span class="code-box">${resetUrl}</span>
    </p>
    <p class="muted">If you did not request a password reset, please ignore this email — your password will not be changed.</p>
  `;
  return baseTemplate("Reset Your Password", body);
}

// ─── Raw sendMail helper (used by the worker) ─────────────────────────────────

export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  await mailer.sendMail({
    from: env.SMTP_FROM,
    to,
    subject,
    html,
  });
}