import { defineConfig } from "drizzle-kit";
import { env } from "./src/config/env";
import { readFileSync } from "fs";
import { join } from "path";

const ca = readFileSync(join(process.cwd(), ".certs", "ca.pem"), "utf8");

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    database: env.DATABASE_NAME,
    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    ssl: {
      ca,
      rejectUnauthorized: true,
    },
  },
  verbose: true,
  strict: true,
});
