import { Request, Response } from "express";
import { pool } from "../db/dbConnection";
import bcrypt from "bcrypt";

export const signup = async (req: Request, res: Response) => {
  try {
    const { userName, password } = req.body as any;

    const { exist } = await checkUserExist(userName);

    if (exist)
      return res.status(400).send({
        message: "User exists",
        status: 400,
      });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await pool.query(
      "insert into users(username, password_hash) values($1, $2) returning *",
      [userName, passwordHash]
    );
    return res.status(201).send({
      status: 200,
      message: "User created",
      id: user.rows[0].id,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send({
      message: "Error",
      status: 500,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { userName, password } = req.body as any;
    const { exist, user } = await checkUserExist(userName);
    if (exist === false) {
      return res.status(400).send({
        status: 400,
        message: "User not found",
      });
    }

    if (exist === null) {
      throw new Error("Error");
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(400).send({
        status: 400,
        message: "Invalid password",
      });
    }
    return res.status(200).send({
      status: 200,
      message: "Login successful",
      id: user.id,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send({
      message: "Error",
      status: 500,
    });
  }
};


export const getUser = async (req: Request, res: Response) => {
  try {
    const id  = (req.headers as any)['userid'];

    const { exist, user } = await getUserById(id);
    console.log({
      exist,
      id
    });
    
    if (exist === null) {
      throw new Error("Error");
    }
    if (exist === false ) {
      return res.status(404).send({
        status: 401,
        message: "User not found",
      });
    }
    return res.status(200).send({
      status: 200,
      user: {
        id: user.id,
        userName: user.username,
      },
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send({
      message: "Error",
      status: 500,
      e
    });
  }
};



export const checkUserExist = async (userName: string) => {
  try {
    const user = await pool.query("select * from users where username = $1", [
      userName,
    ]);
    if (!!user.rows[0].id) return { exist: true, user: user.rows[0] };
    return { exist: false, user: null };
  } catch (e) {
    return { exist: null, user: null };
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await pool.query("select * from users where id = $1", [id]);
    if (!!user.rows[0].id) return { exist: true, user: user.rows[0] };
    return { exist: false, user: null };
  } catch (e) {
    return { exist: null, user: null };
  }
};
