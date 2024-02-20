import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema(
  {
    collegeName: {
      type: String,
      required: true,
      lowercase: true,
    },
    collegeBranch: {
      type: String,
      enum: ["DELHI", "U.P", "GURUGRAM", "CHOOSE"],
      default: "CHOOSE",
    },
  },
  { timestamps: true }
);

export const College = mongoose.Model("College", collegeSchema);
