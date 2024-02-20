import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    courses: {
      type: String,
      enum: ["B-TECH", "AIML", "BBA", "MBA", "M-TECH", "BA", "CHOOSE"],
      default: "CHOOSE",
      required: true,
    },
    studentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  },
  { timestamps: true }
);

export const Course = mongoose.Model("Course", courseSchema);
