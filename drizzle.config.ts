import { defineConfig } from "drizzle-kit";
import { env } from "./src/config/env";

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
    ssl: env.NODE_ENV === "production",
  },
  verbose: true,
  strict: true,
});
