import { NextFunction, Request, Response } from "express";
import app from "../app";
import { IGroupMap, groupMap, userMap } from "../store";

app.get(
  "/getGroupDetails/:groupId",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { groupId } = req.params;
      if (groupMap.has(groupId)) {
        const group = groupMap.get(groupId);
        return res.status(200).send(group);
      } else {
        return res.status(401).send("Group not found");
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  }
);
