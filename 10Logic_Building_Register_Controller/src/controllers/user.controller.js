import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/uploadOnCloud.js";
import { ApiResponse } from "../utils/apiResponse.js";
const registerUser = asyncHandler(async (req, res) => {
  res.status(200).json({ message: "ok" });

  // 1> get user's data from frontend
  const { username, email, fullName, password } = req.body;

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
  const existedData = await User.findOne([
    {
      $or: [{ email }, { username }],
    },
  ]);
  if (existedData) {
    throw new ApiError(409, "This Data is Already existed");
  }

  // 5> required fields are valid ic case of File  like avatar and image check avatar
  //Now like req.body have access of user's data so multer give access of req.files
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(409, "This Data is Not Valid");
  }
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
    username: username.toLoweCase(),
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

export { registerUser };

/* 
  //Firstly Write your steps of you logic how you gonna implement your process like here for creating registration of user we need to steps given :-
  // 1> get user's data from frontend
  // 2> validation this is normally comes in every logic building step
  // 3> check its not empty
  // 4> check it already exist or not
  // 5> required fields are valid or not like avatar and image
  // 6> upload them to cloudinary
  // 7> create user object - create entry in db
  // 8> remove password and refresh token field from response because its encrypted
  // 9> check for user creation
  // 10> if its correct return result other wise error return

*/
