import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

const host = process.env.DB_HOST ?? "127.0.0.1";
const port = Number(process.env.DB_PORT ?? 3306);
const user = process.env.DB_USER ?? "root";
const password = process.env.DB_PASSWORD ?? "";
const database = process.env.DB_NAME ?? "oasis_local_db";

export default defineConfig({
  dialect: "mysql",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { host, port, user, password, database },
  verbose: true,
  strict: true,
});
