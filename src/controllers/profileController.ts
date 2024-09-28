import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import { JWT_SECRET } from "../utils/constants";
import { paginateData } from "../utils/paginator";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
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
    // const user = await pool.query(
    // "insert into users(username, password_hash) values($1, $2) returning *",
    // [userName, passwordHash]
    // );

    const user = await prisma.users.create({
      data: {
        username: userName,
        password_hash: passwordHash,
      },
    });

    const token = jsonwebtoken.sign(
      {
        id: user.id,
        socket: null,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(201).send({
      status: 200,
      message: "User created",
      id: user.id,
      token,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send({
      message: "Error",
      status: 500,
      e,
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

    const passwordMatch = await bcrypt.compare(
      password,
      user?.password_hash || ""
    );
    if (!passwordMatch) {
      return res.status(400).send({
        status: 400,
        message: "Invalid password",
      });
    }
    const token = jsonwebtoken.sign(
      { id: user?.id, socket: null },
      JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );
    return res.status(200).send({
      status: 200,
      message: "Login successful",
      id: user?.id,
      token,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send({
      message: "Error",
      status: 500,
      e,
    });
  }
};

// TODO: ADD PAGINATION
export const getUser = async (req: Request, res: Response) => {
  try {
    const { all, page, limit } = req.query;
    const { user, user_id } = req.body;
    if (all === "true") {
      // const users = await pool.query("select * from users");
      const users = await prisma.users.findMany();

      // const userDetails = await Promise.all(
      //   users.rows.map(async (user: any) => {
      //     const { exist, user: userData } = await getUserById(user.user_id);
      //     if (exist === false) return;
      //     return {
      //       id: userData.id,
      //       userName: userData.username,
      //     };
      //   })
      // );
      const paginatedData = paginateData({
        data: users,
        limit: Number(limit),
        page: Number(page),
      });
      const response = await Promise.all(
        paginatedData.map(async (user: any) => {
          if (user.id === user_id) return;
          // TODO: LOGIC FOR ALREADY EXISTS
          // const dmAlreadyExists = await pool.query('select * from group_users where ')
          return {
            id: user.id,
            userName: user.username,
          };
        })
      );
      return res.status(200).send({
        status: 200,
        users: response,
        total: users.length,
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
      e,
    });
  }
};

export const checkUserExist = async (userName: string) => {
  try {
    // const user = await pool.query("select * from users where username = $1", [
    //   userName,
    // ]);

    const user = await prisma.users.findFirst({
      where: {
        username: userName,
      },
    });
    if (!!user?.id) return { exist: true, user: user };
    return { exist: false, user: null };
  } catch (e) {
    return { exist: null, user: null };
  }
};

export const getUserById = async (id: string) => {
  try {
    // const user = await pool.query("select * from users where id = $1", [id]);
    // const user = await User.findOne({
    // where: {
    // id: id,
    // },
    // });

    const user = await prisma.users.findUnique({
      where: {
        id: id,
      },
    });

    if (!!user?.id) return { exist: true, user: user };
    return { exist: false, user: null };
  } catch (e) {
    return { exist: null, user: null };
  }
};
