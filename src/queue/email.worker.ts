import { Worker, type Job } from "bullmq";
import { bullmqConnection } from "./email.queue";
import {
  sendMail,
  renderEmailVerification,
  renderAccountCreated,
  renderCustomEmail,
  renderPasswordReset,
} from "../utils/mailer";
import type { EmailJobData } from "./email.queue";

// ─── Worker ───────────────────────────────────────────────────────────────────

async function processEmailJob(job: Job<EmailJobData>): Promise<void> {
  const data = job.data;

  console.log(`⚙️  Processing email job [${data.type}] → ${data.to} (attempt ${job.attemptsMade + 1})`);

  switch (data.type) {
    case "email_verification": {
      const html = renderEmailVerification({
        firstName: data.firstName,
        verificationUrl: data.verificationUrl,
      });
      await sendMail({
        to: data.to,
        subject: "Verify your email — Sajilo Restro Sewa",
        html,
      });
      break;
    }

    case "account_created": {
      const html = renderAccountCreated({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: data.role,
        loginUrl: data.loginUrl,
      });
      await sendMail({
        to: data.to,
        subject: "Your account has been created — Sajilo Restro Sewa",
        html,
      });
      break;
    }

    case "custom": {
      const html = renderCustomEmail({
        recipientName: data.recipientName,
        recipientEmail: data.recipientEmail,
        body: data.body,
      });
      await sendMail({
        to: data.to,
        subject: data.subject,
        html,
      });
      break;
    }

    case "password_reset": {
      const html = renderPasswordReset({
        firstName: data.firstName,
        resetUrl: data.resetUrl,
      });
      await sendMail({
        to: data.to,
        subject: "Reset your password — Sajilo Restro Sewa",
        html,
      });
      break;
    }

    default: {
      // Exhaustive check
      const _exhaustive: never = data;
      throw new Error(`Unknown email job type: ${(_exhaustive as any).type}`);
    }
  }

  console.log(`✅ Email sent [${data.type}] → ${data.to}`);
}

// ─── Worker factory (call once on server boot) ────────────────────────────────

export function startEmailWorker(): Worker<EmailJobData> {
  const worker = new Worker<EmailJobData>(
    "email-queue",
    processEmailJob,
    {
      connection: bullmqConnection,
      concurrency: 5, // process up to 5 emails concurrently
    },
  );

  worker.on("completed", (job) => {
    console.log(`📬 Email job completed [${job.data.type}] → ${job.data.to}`);
  });

  worker.on("failed", (job, err) => {
    console.error(
      `❌ Email job failed [${job?.data?.type}] → ${job?.data?.to}: ${err.message}`,
    );
  });

  worker.on("error", (err) => {
    console.error("❌ Email worker error:", err.message);
  });

  console.log("🔧 Email worker started (concurrency: 5)");
  return worker;
}
