import Elysia from "elysia";
import { authPlugin } from "../../middleware/auth.plugin";
import { authorizationPlugin } from "../../middleware/authorization-plugin";
import { enqueueEmail } from "../../queue/email.queue";
import { UserRepo } from "../user/user.repository";
import { AppError } from "../../utils/app-error";
import { HTTP_STATUS } from "../../utils/http-status";
import z from "zod";

const router = new Elysia({
  name: "email-router",
  prefix: "/emails",
  tags: ["Emails"],
})
  .use(authPlugin)
  .use(authorizationPlugin);

// ─── POST /emails/send-custom ─────────────────────────────────────────────────
// Admin-only: send a custom email to a specific staff member.
// Recipient MUST exist as a user in the database.

router.post(
  "/send-custom",
  async ({ body }) => {
    // ── 1. Verify the recipient exists in the DB ──────────────────────────────
    const recipient = await UserRepo.findUserByEmail(body.to);

    if (!recipient) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        `No user with email "${body.to}" was found. Only registered staff members can receive emails.`,
      );
    }

    // ── 2. Enqueue the email ──────────────────────────────────────────────────
    const recipientName = `${recipient.firstName} ${recipient.lastName}`;

    await enqueueEmail({
      type: "custom",
      to: recipient.email,
      recipientName,
      recipientEmail: recipient.email,
      subject: body.subject,
      body: body.body,
    });

    return {
      message: `Email queued for ${recipientName} (${recipient.email}).`,
      recipient: {
        id: recipient.id,
        name: recipientName,
        email: recipient.email,
        role: recipient.role,
      },
    };
  },
  {
    body: z.object({
      to: z.email("Must be a valid email address"),
      subject: z.string().min(1, "Subject is required").max(255),
      body: z
        .string()
        .min(1, "Email body is required")
        .max(10000)
        .describe(
          "Supports {{name}} and {{email}} placeholders — replaced with the recipient's name and email.",
        ),
    }),
    restrictTo: ["admin"],
    detail: {
      summary: "Send a custom email to a staff member (admin only)",
      description:
        "Queue a custom email to a registered user. Throws 404 if the email address is not in the system. Supports `{{name}}` and `{{email}}` template placeholders.",
    },
  },
);

// ─── POST /emails/send-bulk ───────────────────────────────────────────────────
// Admin-only: send a custom email to ALL staff members that exist in the DB.
// Only users that are found in the database receive the email.

router.post(
  "/send-bulk",
  async ({ body }) => {
    // ── 1. Fetch all users from DB ────────────────────────────────────────────
    const allUsers = await UserRepo.findAllUsers();

    if (allUsers.length === 0) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        "No staff members found in the database.",
      );
    }

    // ── 2. Enqueue one job per verified DB user ───────────────────────────────
    const jobs = allUsers.map((u) =>
      enqueueEmail({
        type: "custom",
        to: u.email,
        recipientName: `${u.firstName} ${u.lastName}`,
        recipientEmail: u.email,
        subject: body.subject,
        body: body.body,
      }).catch((err) =>
        console.error(`Failed to enqueue email to ${u.email}:`, err),
      ),
    );

    await Promise.all(jobs);

    return {
      message: `Email queued for ${allUsers.length} staff member(s).`,
      recipientCount: allUsers.length,
      recipients: allUsers.map((u) => ({
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        role: u.role,
      })),
    };
  },
  {
    body: z.object({
      subject: z.string().min(1, "Subject is required").max(255),
      body: z
        .string()
        .min(1, "Email body is required")
        .max(10000)
        .describe("Supports {{name}} and {{email}} placeholders."),
    }),
    restrictTo: ["admin"],
    detail: {
      summary: "Send a custom email to ALL staff members (admin only)",
      description:
        "Queue a custom email for every user in the database. Supports `{{name}}` and `{{email}}` template placeholders.",
    },
  },
);

export { router as email_router };
