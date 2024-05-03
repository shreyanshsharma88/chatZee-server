import { NextFunction, Request, Response, Router } from "express";
import { groupMap, userMap } from "../store";

const getGroupsRouter = Router();
getGroupsRouter.get("/:id", (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!userMap.has(id)){
        return res.status(404).send("User not found");
      }
      const groups = Array.from(groupMap.entries())
        .filter((group) => group[1].isDm === false)
        .map(([id, value]) => ({
          groupName: value.groupName,
          id: id,
          alreadyExists: value?.users?.some((user) => user.id === id),
        }));
      return res.status(200).send(groups);
    } catch (error) {
      return res.status(500).send(error);
    }
  });
  export default getGroupsRouter;