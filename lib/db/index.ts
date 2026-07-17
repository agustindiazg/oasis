import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { oasisPool?: mysql.Pool };

const pool = globalForDb.oasisPool ?? mysql.createPool({
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "oasis_local_db",
  connectionLimit: 10,
  enableKeepAlive: true,
});

if (process.env.NODE_ENV !== "production") globalForDb.oasisPool = pool;

export const db = drizzle({ client: pool, schema, mode: "default" });
export { pool };
