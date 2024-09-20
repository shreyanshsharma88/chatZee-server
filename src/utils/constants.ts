import { config } from "dotenv";
config();
export const DB_PASS = process.env.DATA_BASE_PASSWORD;
export const DATA_BASE_HOST= process.env.DATA_BASE_HOST
export const DATA_BASE_USER = process.env.DATA_BASE_USER
export const JWT_SECRET = `${process.env.JWT_SECRET}`