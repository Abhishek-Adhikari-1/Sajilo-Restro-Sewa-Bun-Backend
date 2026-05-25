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
});

const parsed = envSchema.safeParse(Bun.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export type Env = z.infer<typeof envSchema>;
