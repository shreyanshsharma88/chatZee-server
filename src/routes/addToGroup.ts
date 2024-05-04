import { NextFunction, Request, Response, Router } from "express";
import { IGroupMap, groupMap, userMap } from "../store";

export const addUserToGroupRouter = Router()
addUserToGroupRouter.post(
    "/",
    (req: Request, res: Response, next: NextFunction) => {
      try {
        const { groupId, userId } = req.body as {
          groupId: string;
          userId: string;
        };
        if (groupMap.has(groupId) && userMap.has(userId)) {
          const group = groupMap.get(groupId);
          group?.users?.push({
            id: userId,
            userName: userMap.get(userId)?.userName ?? '',
          });
          groupMap.set(groupId, group as IGroupMap);
          return res.status(200).send(group?.users);
        }
      } catch (err) {
        return res.status(500).send(err);
      }
    }
  );