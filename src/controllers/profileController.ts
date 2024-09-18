import { Request, Response } from "express";
import { pool } from "../db/dbConnection";
import bcrypt from "bcrypt"

export const signup = async (req: Request, res: Response) => {
  const { userName , password} = req as any;
  const exists = await checkUserExist(userName);
  if (exists)
    return res.status(400).send({
      message: "User exists",
      status: 400,
    });

    const passwordHash = bcrypt.hash(password, 10)
    const user = await pool.query(
        'insert into users(username, password_hash) values($1, $2) returning *',
        [userName, passwordHash]
    )
    return res.status(201).send({
        status: 200,
        message: "User created",
        id: user.rows[0].id
    })
};

export const checkUserExist = async (userName: string) => {
  const user = await pool.query("select * from users where username = $1", [
    userName,
  ]);
  console.log(user.rows);
  if (!!user.rows) return true;
  return false;
};
