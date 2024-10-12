import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import { JWT_SECRET } from "../utils/constants";
import { paginateData } from "../utils/paginator";
import { PrismaClient } from "@prisma/client";
import { checkUserExist, dmAlreadyExists } from "../utils/user";
import jwt from "jsonwebtoken"

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
        username: user.username,
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

export const getUser = async (req: Request, res: Response) => {
  try {
    const { all, page, limit, search } = req.query;
    const { user, user_id } = req.body;
    if (all === "true" && (page || limit)) {
      const users = await prisma.users.findMany({
        where: {
          NOT: {
            id: user_id,
          },
          username: {
            contains: `${search}`,
          },
        },
      });

      const paginatedData = paginateData({
        data: users,
        limit: Number(limit),
        page: Number(page),
      });
      const response = await Promise.all(
        paginatedData.map(async (user: any) => {
          if (user.id === user_id) return;

          const isDm = await dmAlreadyExists({
            id: user.id,
            userId: user_id,
          });
          if (isDm === null) throw new Error();

          return {
            id: user.id,
            userName: user.username,
            alreadyAddedInDm: isDm.exist,
            dmId: isDm.groupId,
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

// const logout = async (req: Request, res: Response) => {
//   try{

//     const token = (req.headers as any)["token"]
//     jwt.
    

//   }
//   catch(e){
//     console.log(e);
//     return res.status(500).send({
//       message: "Error",
//       status: 500,
//       e,
//     });
//   }
// }
