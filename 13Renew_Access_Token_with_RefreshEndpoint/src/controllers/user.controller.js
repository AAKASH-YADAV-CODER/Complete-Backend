import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/uploadOnCloud.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

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
      $set: {
        refreshToken: undefined,
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

export { registerUser, loginUser, logoutUser, renewAccessToken };
