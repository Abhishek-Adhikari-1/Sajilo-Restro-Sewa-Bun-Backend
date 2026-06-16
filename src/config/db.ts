import { env } from "../config/env";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../db/index";
import { readFileSync } from "fs";
import { join } from "path";

const ca = readFileSync(join(process.cwd(), ".certs", "ca.pem"), "utf8");

const client = postgres({
  database: env.DATABASE_NAME,
  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
  user: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  max: env.NODE_ENV === "production" ? 20 : 5,
  ssl: {
    ca,
    rejectUnauthorized: true,
  },
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, {
  schema,
  // logger: env.NODE_ENV !== "production",
});
export type DB = typeof db;
export type TX = Parameters<Parameters<typeof db.transaction>[0]>[0];
