import { NextFunction, Request, Response, Router } from "express";
import { groupMap, userMap } from "../store";

export const getGroupsRouter = Router();
getGroupsRouter.get(
  "/:id",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (!userMap.has(id)) {
        return res.status(404).send("User not found");
      }

      const groups = Array.from(groupMap.entries())
        .filter((group) => group[1].isDm === false)
        .map(([groupId, value]) => {
          console.log(value.groupName, value.users);

          return {
            groupName: value.groupName,
            id: groupId,
            alreadyExists: value?.users?.some((user) => user.id === id),
          };
        });
      return res.status(200).send(groups);
    } catch (error) {
      return res.status(500).send(error);
    }
  }
);
