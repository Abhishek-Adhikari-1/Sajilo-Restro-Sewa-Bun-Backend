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

  API_URL: z.string().default("http://localhost:8000"),
  FRONTEND_URL: z.string().default("http://localhost:3000"),

  ACCESS_TOKEN_EXPIRES_MINUTES: z.coerce.number().default(15),
  REFRESH_TOKEN_EXPIRES_DAYS: z.coerce.number().default(30),
  SESSION_EXPIRES_DAYS: z.coerce.number().default(7),
  EMAIL_VERIFICATION_EXPIRES_HOURS: z.coerce.number().default(24),
  PASSWORD_RESET_EXPIRES_HOURS: z.coerce.number().default(1),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export type Env = z.infer<typeof envSchema>;
