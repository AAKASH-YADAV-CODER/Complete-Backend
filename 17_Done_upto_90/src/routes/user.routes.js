import { Router } from "express";
import {
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  registerUser,
  renewAccessToken,
  updateAccountInfo,
  updateAvatar,
  updateCoverImage,
  updatePassword,
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

//These routes are possible when user is loggedIn so that's why verifyJWT
router.route("/refresh-token").post(renewAccessToken);
router.route("/current-user").get(jwtVerify, getCurrentUser);
router.route("/update-password").post(jwtVerify, updatePassword);
router.route("/update-account").post(jwtVerify, updateAccountInfo);

//Here is patch because i only update one file
router.route("/avatar").patch(jwtVerify, upload.single("avatar"), updateAvatar);
router
  .route("/cover-image")
  .patch(jwtVerify, upload.single("coverImage"), updateCoverImage);

//These data we get from aggregation pipeline method
router.route("/channel/:username").get(jwtVerify, getUserChannelProfile);
router.route("/history").get(jwtVerify, getWatchHistory);

export default router;
