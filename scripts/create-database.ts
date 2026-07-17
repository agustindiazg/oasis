import { config } from "dotenv";
import mysql from "mysql2/promise";

config({ path: ".env.local" });

const database = process.env.DB_NAME;
if (!database || !/^[a-zA-Z0-9_]+$/.test(database)) {
  throw new Error("DB_NAME debe contener solo letras, números y guiones bajos.");
}

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await connection.end();
  console.log(`Base ${database} disponible.`);
}

main().catch((error) => { console.error(error); process.exit(1); });
