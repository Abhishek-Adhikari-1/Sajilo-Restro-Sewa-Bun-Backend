import { env } from "../config/env";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { readFileSync } from "fs";
import { join } from "path";

const ca = readFileSync(join(process.cwd(), ".certs", "ca.pem"), "utf8");

const migrationClient = postgres({
  database: env.DATABASE_NAME,
  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
  user: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  max: 1,
  ssl: {
    ca,
    rejectUnauthorized: true,
  },
});

async function main() {
  await migrate(drizzle(migrationClient), {
    migrationsFolder: "./drizzle",
  });

  await migrationClient.end();
}

main();
