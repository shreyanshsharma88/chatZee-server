import { Router } from "express";
import { getChats } from "../controllers/chatController";

export const chatRouter = Router();

chatRouter.get("/:group_id", getChats);
