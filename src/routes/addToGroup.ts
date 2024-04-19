import { NextFunction, Request, Response } from "express";
import app from "../app";
import { IGroupMap, groupMap, userMap } from "../store";
app.post(
    "/addUserToGroup/",
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
            userName: userMap.get(userId).userName,
          });
          groupMap.set(groupId, group as IGroupMap);
          return res.status(200).send(group?.users);
        }
      } catch (err) {
        return res.status(500).send(err);
      }
    }
  );