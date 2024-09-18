import { Client, Pool } from "pg";
import { DATA_BASE_HOST, DATA_BASE_USER, DB_PASS } from "../utils/constants";

export const pool = new Pool({
  user: DATA_BASE_USER,
  host: DATA_BASE_HOST,
  database: "neondb",
  password: DB_PASS,
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool
  .connect()
  .then(() => console.log("successfully connected to db"))
  .catch((e) => console.log(e, "error"));
