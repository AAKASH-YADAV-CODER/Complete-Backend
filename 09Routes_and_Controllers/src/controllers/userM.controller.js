import { asyncHandler } from "../utils/asyncHandler.js";

const userM = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "Hello Kasse Ho 👱🏻‍♀️",
  });
});

// const userM = async (req, res) => {
//   res.status(200).json({ message: "yes" });
// };

export { userM };
