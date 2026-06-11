// import nodemailer from "nodemailer";
// import { env } from "./env";

// // ─── Transporter ──────────────────────────────────────────────────────────────

// export const mailer = nodemailer.createTransport({
//   host: env.SMTP_HOST,
//   port: env.SMTP_PORT,
//   secure: env.SMTP_SECURE,
//   auth: {
//     user: env.SMTP_USER,
//     pass: env.SMTP_PASS,
//   },
// });

// // ─── Template helpers ─────────────────────────────────────────────────────────

// function baseTemplate(title: string, body: string): string {
//   return `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8" />
//   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//   <title>${title}</title>
//   <style>
//     body { margin: 0; padding: 0; background: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
//     .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
//     .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px 40px; text-align: center; }
//     .header h1 { margin: 0; color: #fff; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
//     .header p  { margin: 6px 0 0; color: rgba(255,255,255,.6); font-size: 13px; }
//     .content { padding: 40px; color: #374151; font-size: 15px; line-height: 1.6; }
//     .content p { margin: 0 0 16px; }
//     .btn { display: inline-block; margin: 8px 0 24px; padding: 14px 28px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff !important; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600; }
//     .code { display: inline-block; padding: 12px 20px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; font-family: monospace; font-size: 20px; letter-spacing: 4px; font-weight: 700; color: #1a1a2e; }
//     .footer { padding: 24px 40px; background: #f9fafb; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; line-height: 1.5; }
//     .muted { color: #6b7280; font-size: 13px; }
//   </style>
// </head>
// <body>
//   <div class="wrapper">
//     <div class="header">
//       <h1>🍽️ Sajilo Restro Sewa</h1>
//       <p>Restaurant Management Platform</p>
//     </div>
//     <div class="content">
//       ${body}
//     </div>
//     <div class="footer">
//       <p>You received this email because an action was taken on your Sajilo Restro Sewa account.</p>
//       <p>If you did not perform this action, you can safely ignore this email.</p>
//       <p>&copy; ${new Date().getFullYear()} Sajilo Restro Sewa. All rights reserved.</p>
//     </div>
//   </div>
// </body>
// </html>`;
// }

// // ─── Email senders ────────────────────────────────────────────────────────────

// interface SendEmailVerificationParams {
//   to: string;
//   firstName: string;
//   verificationUrl: string;
// }

// export async function sendEmailVerification({
//   to,
//   firstName,
//   verificationUrl,
// }: SendEmailVerificationParams): Promise<void> {
//   const body = `
//     <p>Hi <strong>${firstName}</strong>,</p>
//     <p>Welcome to <strong>Sajilo Restro Sewa</strong>! Please verify your email address to activate your account.</p>
//     <p>
//       <a href="${verificationUrl}" class="btn">Verify Email Address</a>
//     </p>
//     <p class="muted">This link will expire in <strong>24 hours</strong>.</p>
//     <p class="muted">Or copy and paste this URL into your browser:<br/>
//       <span style="word-break:break-all;">${verificationUrl}</span>
//     </p>
//   `;

//   await mailer.sendMail({
//     from: env.SMTP_FROM,
//     to,
//     subject: "Verify your email — Sajilo Restro Sewa",
//     html: baseTemplate("Verify Your Email", body),
//   });
// }

// interface SendPasswordResetParams {
//   to: string;
//   firstName: string;
//   resetUrl: string;
// }

// export async function sendPasswordReset({
//   to,
//   firstName,
//   resetUrl,
// }: SendPasswordResetParams): Promise<void> {
//   const body = `
//     <p>Hi <strong>${firstName}</strong>,</p>
//     <p>We received a request to reset the password for your Sajilo Restro Sewa account.</p>
//     <p>
//       <a href="${resetUrl}" class="btn">Reset Password</a>
//     </p>
//     <p class="muted">This link will expire in <strong>1 hour</strong>.</p>
//     <p class="muted">If you did not request a password reset, please ignore this email — your password will not be changed.</p>
//     <p class="muted">Or copy and paste this URL into your browser:<br/>
//       <span style="word-break:break-all;">${resetUrl}</span>
//     </p>
//   `;

//   await mailer.sendMail({
//     from: env.SMTP_FROM,
//     to,
//     subject: "Reset your password — Sajilo Restro Sewa",
//     html: baseTemplate("Reset Your Password", body),
//   });
// }

export async function sendEmail(data?: any) {
  console.log("Sending email...");
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));