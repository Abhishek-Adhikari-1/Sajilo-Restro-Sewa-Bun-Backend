import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(8000),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  ALLOWED_ORIGINS: z
    .string()
    .default("*")
    .transform((val) =>
      val === "*" ? ["*"] : val.split(",").map((v) => v.trim()),
    ),

  DATABASE_NAME: z.string(),
  DATABASE_HOST: z.string(),
  DATABASE_PORT: z.coerce.number().default(5432),
  DATABASE_USER: z.string(),
  DATABASE_PASSWORD: z.string(),

  SESSION_EXPIRES_DAYS: z.coerce.number().default(7),
  EMAIL_VERIFICATION_EXPIRES_HOURS: z.coerce.number().default(24),
  PASSWORD_RESET_EXPIRES_HOURS: z.coerce.number().default(1),

  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),

  // ─── Redis ──────────────────────────────────────────────────────────────────
  REDIS_URL: z.string().default("redis://127.0.0.1:6379"),

  // ─── Frontend ───────────────────────────────────────────────────────────────
  FRONTEND_URL: z.string().default("http://localhost:3000"),

  // ─── SMTP ───────────────────────────────────────────────────────────────────
  SMTP_SERVICE: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),
  SMTP_FROM: z.string().default("Sajilo Restro Sewa <noreply@sajilorestro.com>"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export type Env = z.infer<typeof envSchema>;
