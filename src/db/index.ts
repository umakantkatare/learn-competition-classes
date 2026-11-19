// import { neon } from "@neondatabase/serverless";
// import { drizzle } from "drizzle-orm/neon-http";

// const databaseUrl = process.env.DATABASE_URL;

// if (!databaseUrl) {
//   throw new Error("DATABASE_URL is not configured");
// }

// const sql = neon(databaseUrl);

// export const db = drizzle({
//   client: sql,
// });

// export type Database = typeof db;


import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

function createDatabase() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

  const db = drizzle({
    client: pool,
    logger: process.env.NODE_ENV === "development",
  });

  return { db, pool };
}

const globalForDb = globalThis as typeof globalThis & {
  dbInstance?: ReturnType<typeof createDatabase>;
};

const dbInstance = globalForDb.dbInstance ?? createDatabase();

if (process.env.NODE_ENV !== "production") {
  globalForDb.dbInstance = dbInstance;
}

export const db = dbInstance.db;
export const pool = dbInstance.pool;
