import { NextFunction, Request, Response } from "express";
import app from "../app";
import { groupMap } from "../store";

app.get("/getGroups", (req: Request, res: Response, next: NextFunction) => {
    try {
      const groups = Array.from(groupMap.entries())
        .filter((group) => group[1].isDm === false)
        .map((value) => ({
          groupName: value[1].groupName,
          id: value[0],
        }));
      return res.status(200).send(groups);
    } catch (error) {
      return res.status(500).send(error);
    }
  });