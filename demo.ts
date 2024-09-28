// app.js
const postgres = require('postgres');
// require('dotenv').config();

// let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;
// PGPASSWORD = decodeURIComponent(PGPASSWORD);
const PGHOST='ep-gentle-waterfall-a5jytag7.us-east-2.aws.neon.tech';
const PGDATABASE='neondb';
const PGUSER='neondb_owner';
const PGPASSWORD='6swIvLl0nceJ';
const ENDPOINT_ID='ep-gentle-waterfall-a5jytag7';

const sql = postgres({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: 'require',
  connection: {
    options: `project=${ENDPOINT_ID}`,
  },
});
console.log(sql)

async function getPgVersion() {
  try {
    const result = await sql`select version()`;
  console.log(result);
  } catch (error) {
    console.log("Getting error", error);
  }
}

getPgVersion();