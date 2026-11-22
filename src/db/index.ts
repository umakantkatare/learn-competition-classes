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

type DatabaseInstance = ReturnType<typeof createDatabase>;

const globalForDb = globalThis as typeof globalThis & {
  dbInstance?: DatabaseInstance;
};

function getDatabase(): DatabaseInstance {
  if (!globalForDb.dbInstance) {
    globalForDb.dbInstance = createDatabase();
  }

  return globalForDb.dbInstance;
}

export const db = new Proxy({} as DatabaseInstance["db"], {
  get(_target, property) {
    const database = getDatabase().db;

    return Reflect.get(database, property, database);
  },
});

export const pool = new Proxy({} as Pool, {
  get(_target, property) {
    const databasePool = getDatabase().pool;

    const value = Reflect.get(databasePool, property, databasePool);

    return typeof value === "function"
      ? value.bind(databasePool)
      : value;
  },
});
