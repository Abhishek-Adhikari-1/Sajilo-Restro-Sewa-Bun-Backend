import { Queue } from "bullmq";
import { env } from "../config/env";

// ─── Job Data Types ───────────────────────────────────────────────────────────

export type EmailJobData =
  | {
      type: "email_verification";
      to: string;
      firstName: string;
      verificationUrl: string;
    }
  | {
      type: "account_created";
      to: string;
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      role: string;
      loginUrl: string;
    }
  | {
      type: "custom";
      to: string;
      recipientName: string;
      recipientEmail: string;
      subject: string;
      body: string;
    }
  | {
      type: "password_reset";
      to: string;
      firstName: string;
      resetUrl: string;
    };

// ─── Connection config (passed as plain URL so BullMQ uses its own ioredis) ──

export const bullmqConnection = {
  url: env.REDIS_URL,
} as const;

// ─── Queue Instance ───────────────────────────────────────────────────────────

export const emailQueue = new Queue<EmailJobData>("email-queue", {
  connection: bullmqConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000, // 5s → 25s → 125s
    },
    removeOnComplete: {
      age: 60 * 60 * 24, // keep completed jobs for 24h
      count: 200,
    },
    removeOnFail: {
      age: 60 * 60 * 24 * 7, // keep failed jobs for 7 days
      count: 500,
    },
  },
});

// ─── Enqueue Helper ───────────────────────────────────────────────────────────

export async function enqueueEmail(data: EmailJobData): Promise<void> {
  await emailQueue.add("send-email", data, {
    jobId: `${data.type}:${data.to}:${Date.now()}`,
  });
  console.log(`📧 Queued email job [${data.type}] → ${data.to}`);
}
