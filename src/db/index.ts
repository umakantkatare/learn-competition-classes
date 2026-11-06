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

// import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle({
  client: pool,
});
