import { NextFunction, Response, Request } from "express";
import jsonwebtoken from "jsonwebtoken";
import { JWT_SECRET } from "./constants";
import User from "../models/user";

export const AuthChecker = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = (req.headers as any)["userid"];
    const token = (req.headers as any)["token"];
    if (!user_id) {
      return res.status(401).send({
        message: "Please send user id in the header",
        status: 401,
      });
    }

    jsonwebtoken.verify(token, JWT_SECRET, async (err: any, jwtUser: any) => {
      if (err) {
        return res.status(401).send({
          message: "Invalid token",
          status: 401,
        });
      }

      const { id } = jwtUser;

      // const user = await pool.query("select * from users where id = $1", [id]);
      const user = await User.findOne({
        where: {
          id : id
        }
      })

      console.log({user});
      if (user === null) {
        return res.status(401).send({
          message: "User not found",
          status: 401,
        });
      }
      req.body.user_id = user_id;
      req.body.user = user;
      next();
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
