import { Router } from "express";
import { login, signup } from "../controllers/profileController";

export const signupRoute = Router();
export const loginRoute = Router();
signupRoute.post("", signup);
loginRoute.post("", login);
