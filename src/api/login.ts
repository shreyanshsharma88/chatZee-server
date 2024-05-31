import { NextFunction, Request, Response, Router } from "express";
import { v4 as uuid } from "uuid";
import { userMap } from "../store";

export const loginRouter = Router();

loginRouter.post("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userName: userNameReq } = req.body as { userName: string };

    for (const [_, { userName }] of userMap.entries()) {
      if (userName === userNameReq) {
        return res.status(401).send("user already exists");
      }
    }

    const id = uuid();

    userMap.set(id, { userName: userNameReq });

    return res.status(200).send({ id });
  } catch (error) {
    return res.status(500).send(error);
  }
});
