import { Pool } from "pg";

// Single shared pool across hot reloads / requests. The connection string is
// the same Neon database the spotify-seasonal workflow writes to daily.
let pool: Pool | null = null;

export function getDb(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    pool = new Pool({ connectionString });
  }
  return pool;
}
