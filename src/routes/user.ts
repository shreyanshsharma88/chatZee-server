import { Router } from "express";
import { getUser } from "../controllers/profileController";

export const getUserDetailRouter = Router();
getUserDetailRouter.get("/", getUser );

export const getAllUsersRouter = Router();