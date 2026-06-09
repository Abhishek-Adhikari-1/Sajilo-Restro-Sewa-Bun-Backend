import { env } from "../config/env";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

const migrationClient = postgres({
  database: env.DATABASE_NAME,
  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
  user: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  max: 1,
  ssl: env.NODE_ENV === "production",
});

async function main() {
  await migrate(drizzle(migrationClient), {
    migrationsFolder: "./drizzle",
  });

  await migrationClient.end();
}

main();
