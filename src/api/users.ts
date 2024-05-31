import { NextFunction, Request, Response, Router } from "express";
import app from ".";
import { groupMap, userMap } from "../store";

export const getUsersRouter = Router();
getUsersRouter.get(
  "/:userId",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      if (userMap.has(userId)) {
        {
          const users = Array.from(userMap.entries()).map((value) => {
            if (value[0] !== userId)
              return {
                name: value[1].userName,
                id: value[0],
                isDmExisting:
                  groupMap.has(`${userId}**${value[0]}`) ||
                  groupMap.has(`${value[0]}**${userId}`),
                dmID: groupMap.has(`${userId}**${value[0]}`)
                  ? `${userId}**${value[0]}`
                  : `${value[0]}**${userId}`,
              };
          });

          return res.status(200).send(users);
        }
        return res.status(401).send("User not found");
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  }
);
