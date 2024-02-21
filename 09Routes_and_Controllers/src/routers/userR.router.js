import { Router } from "express";
import { userM } from "../controllers/userM.controller.js";

const router = Router();

router.route("/register").post(userM);

export { router };
