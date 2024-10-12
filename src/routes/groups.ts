import { Router } from "express";
import { addGroup, addUserToGroup, getAllGroups, getGroup } from "../controllers/groupController";

// export const getAllGroupsRouter = Router();
export const groupRouter = Router()

// getAllGroupsRouter.get("/", getAllGroups );

groupRouter.get("/", getAllGroups );

groupRouter.get("/:groupId",getGroup )

groupRouter.put("/:group_id", addUserToGroup)

groupRouter.post("/", addGroup)