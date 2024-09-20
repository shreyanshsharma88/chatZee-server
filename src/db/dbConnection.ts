import { Pool } from "pg";
import { DB_PASS } from "../utils/constants";
export const pool = new Pool({
  connectionString: `postgresql://neondb_owner:${DB_PASS}@ep-gentle-waterfall-a5jytag7.us-east-2.aws.neon.tech/neondb?sslmode=require`,
});
