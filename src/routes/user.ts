import { Router } from "express";
import { getUser } from "../controllers/profileController";

export const userDetailRouter = Router();
userDetailRouter.get("/", getUser);

export const getAllUsersRouter = Router();
