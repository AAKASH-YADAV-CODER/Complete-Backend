import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  renewAccessToken,
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import jwtVerify from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login").post(loginUser);

//Secure Routes
router.route("/logout").post(jwtVerify, logoutUser);
router.route("/refresh-token").post(renewAccessToken);

export default router;
