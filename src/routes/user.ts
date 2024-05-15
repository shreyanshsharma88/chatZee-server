import { Router } from "express";
import { userMap } from "../store";

export const getUserDetailsRouter = Router();
getUserDetailsRouter.get("/:id", (req, res) => {
  try {
    const { id } = req.params;
    if (!userMap.has(id)) {
      return res.status(404).send("User not found");
    }
    const user = userMap.get(id);
    return res.status(200).send(user);
  } catch (error) {
    return res;
  }
});
