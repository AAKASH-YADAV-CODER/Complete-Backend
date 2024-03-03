import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/uploadOnCloud.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

//This is function to create Access and refresh token
const generateAccessRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); //Don't check password during creation of tokens we already did

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something wrong during generating access and refresh token"
    );
  }
};

//This is options for cookies to not accessible on client side
const options = {
  httpOnly: true,
  secure: true,
};

const registerUser = asyncHandler(async (req, res) => {
  // 1> get user's data from frontend
  const { username, email, fullName, password } = req.body;
  // console.log(email);
  // 2> validation this is normally comes in every logic building step
  // 3> check its not empty
  if (
    [username, email, fullName, password].some(
      (field) => field?.trim() === ""
    ) &&
    !email.include("@")
  ) {
    throw new ApiError(400, "Please Provide valid data");
  }
  // 4> check it already exist or not
  const existedData = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedData) {
    throw new ApiError(409, "This Data is Already existed");
  }
  // 5> required fields are valid ic case of File  like avatar and image check avatar
  //Now like req.body have access of user's data so multer give access of req.files
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  if (!avatarLocalPath) {
    throw new ApiError(409, "This Avatar file is Not Valid");
  }
  // console.log(req.files);

  // 6> upload them to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(409, "This Data is Not Valid");
  }
  // 7> create user object - create entry in db
  const user = await User.create({
    fullName,
    email,
    password,
    username: username.toLowerCase(),
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });
  // 8> remove password and refresh token field from response because its encrypted
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  // 9> check for user creation
  if (!createdUser) {
    throw new ApiError(500, "Something Went Wrong in Server");
  }
  // 10> if its correct return result other wise error return
  return res.status(200).json(new ApiResponse(200, "SuccessFull", createdUser));
});

const loginUser = asyncHandler(async (req, res) => {
  /*
  STEPS TO CREATE LOGIN USER 
  1> req data from database
  2> check username and email 
  3> find user in db using above data fields
  4> compare password 
  5> generate access token and refresh token 
  6> send cookie
  */
  // 1> req data from database
  const { email, username, password } = req.body;

  // 2> check username and email
  if (!(email || username)) {
    throw new ApiError(401, "Provide correct Credentials");
  }

  // 3> find user in db using above data fields
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (!user) {
    throw new ApiError(404, "Could't find user invalid email or username");
  }
  // 4> compare password using middleware by db instance
  const passwordCorrect = await user.isPasswordCorrect(password);
  if (!passwordCorrect) {
    throw new ApiError(401, "InCorrect Password");
  }

  // 5> generate Access and Refresh Token using custom hook(middleware)
  const { accessToken, refreshToken } = await generateAccessRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // 6> return cookie
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "SuccessFull Logged In", {
        user: loggedInUser,
        accessToken,
        refreshToken,
      })
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "SuccessFull Logged out", {}));
});

const renewAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      (await req.cookies?.refreshToken) || req.body?.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "refreshToken Invalid");
    }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.refreshToken
    );
    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(400, "Not found User");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError("Refresh Token not Valid");
    }

    const { accessToken, newRefreshToken } = await generateAccessRefreshToken(
      user._id
    );
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(200, "Successfully Refreshed Access Token", {
          accessToken,
          refreshToken: newRefreshToken,
        })
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Unauthorized user");
  }
});

//Now we write code for updating information of user like image ,name ,email ,password etc

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, "Current User got Successfully", user));
});

const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const passwordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!passwordCorrect) {
    throw new ApiError(400, "Old Password in Not Correct!");
  }
  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "Password inCorrect!");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, "Successfully change Password", {}));
});

const updateAccountInfo = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!(fullName || email)) {
    throw new ApiError(400, "Please Provide valid Detail");
  }

  //Here directly doing update without checking previous data is same or not if you want you can try like firstly find user destruct information match them if there are not equal then directly update it this is small concept i have try
  /*
  const {newFullName,newEmail}=req.body;
  validate here
  const {fullName,email}=getCurrentUser;
  if(fullName===newFullName){
  threw new Error
  }
  if(email===newEmail){
  threw new Error
  }
  user.email=newEmail;
  user.fullName=newFullName;
  user.save({ validateBeforeSave: false })
  */

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, "SuccessFully Updated Information", user));
});

const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover Image Not found");
  }

  //TODO delete previous coverImage
  const userForCoverImage = await User.findById(req.user?._id).select(
    "coveImage"
  );
  if (userForCoverImage?.avatar) {
    // Extract the public ID of the old image from the avatar URL
    const publicId = extractPublicId(userForCoverImage.coverImage);

    // Delete the old image from Cloudinary
    await deleteFromCloudinary(publicId);
  }
  function extractPublicId(url) {
    const parts = url.split("/");
    console.log(parts);
    const filename = parts.pop().split(".")[0];
    console.log(filename);
    return filename;
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage.url) {
    throw new ApiError("Image Not Found on Cloundinary");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, "Successfully change CoverImage", user));
});

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar Image Not found");
  }
  //TODO :- delete old image

  const userForAvatar = await User.findById(req.user?._id).select("avatar");
  if (userForAvatar?.avatar) {
    // Extract the public ID of the old image from the avatar URL
    const publicId = extractPublicId(userForAvatar.avatar);

    // Delete the old image from Cloudinary
    await deleteFromCloudinary(publicId);
  }
  function extractPublicId(url) {
    const parts = url.split("/");
    const filename = parts.pop().split(".")[0];
    return filename;
  }

  //Here we are uploading
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError("Avatar Not Found on Cloundinary");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, "Successfully change AvatarImage", user));
});

//Aggregate Pipelines to extract information of user
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username.trim()) {
    throw new ApiError(400, "User Not Found");
  }
  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        countSubscriber: {
          $size: "$subscribers",
        },
        countChannel: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        username: 1,
        fullName: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
        countSubscriber: 1,
        countChannel: 1,
        isSubscribed: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "channel does't exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "SuccessFully fetch User Profile", channel[0]));
});

// Here i write Sub pipeline and stage operations also
const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);
  if (!user?.length) {
    throw new ApiError("Could't Find Watch History");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Successfully fetch Watch History",
        user[0].watchHistory
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  renewAccessToken,
  getCurrentUser,
  updatePassword,
  updateAccountInfo,
  updateCoverImage,
  updateAvatar,
  getUserChannelProfile,
  getWatchHistory,
};
