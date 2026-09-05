import { Pool, QueryResultRow } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var ehrPool: Pool | undefined;
}

export const pool =
  global.ehrPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL
  });

if (process.env.NODE_ENV !== "production") {
  global.ehrPool = pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []) {
  return pool.query<T>(text, params);
}
