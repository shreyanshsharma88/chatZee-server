import { Router } from "express";
import { signup } from "../controllers/profileController";

export const signupRoute = Router()
signupRoute.post('/', signup)