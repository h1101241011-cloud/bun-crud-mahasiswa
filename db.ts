import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: "localhost",      // Ganti ke "mysql" jika pakai Docker Compose di Codespaces
  user: "root",
  password: "root",       // Sesuaikan password MySQL kamu
  database: "kampus",
  waitForConnections: true,
  connectionLimit: 10,
});