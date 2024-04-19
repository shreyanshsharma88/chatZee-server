import { NextFunction, Request, Response } from "express";
import app from "../app";
import { groupMap, userMap } from "../store";
import { v4 as uuid } from "uuid";

app.post("/addGroup", (req: Request, res: Response, next: NextFunction) => {
    try {
      const { groupName, uniqueId, isDm, uniqueId2 } = req.body as {
        groupName: string;
        uniqueId: string;
        isDm: boolean;
        uniqueId2?: string;
      };
  
      if (userMap.has(uniqueId)) {
        if (isDm && uniqueId2) {
          const [user1, user2] = groupName.split("**");
          if (
            groupMap.has(`${user1}**${user2}`) ||
            groupMap.has(`${user2}**${user1}`)
          ) {
            return res.status(401).send("Group already exists");
          }
          const id = `${uniqueId}**${uniqueId2}`;
          groupMap.set(id, {
            groupName,
            users: [
              {
                id: uniqueId,
                userName: userMap.get(uniqueId).userName,
              },
              {
                id: uniqueId2,
                userName: userMap.get(uniqueId2).userName,
              },
            ],
            chat: [],
            isDm,
          });
          const groups = Array.from(groupMap.entries()).map((value) => ({
            groupName: value[1].groupName,
            id: value[0],
          }));
          return res.status(200).send(groups);
        } else {
          for (const [_, { groupName: groupNameMap }] of groupMap.entries()) {
            if (groupNameMap === groupName) {
              return res
                .status(401)
                .send("Try another group name, this one already exists!");
            }
          }
          const id = uuid();
          groupMap.set(id, { groupName, users: [], chat: [], isDm });
          const groups = Array.from(groupMap.entries()).map((value) => ({
            groupName: value[1].groupName,
            id: value[0],
          }));
          return res.status(200).send(groups);
        }
      } else {
        return res.status(401).send("User not found");
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  });
  