import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    workingTime: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const teacherSchema = new mongoose.Schema(
  {
    teacherName: {
      type: String,
      required: true,
      lowercase: true,
    },
    officialEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phoneNo: {
      type: Number,
      unique: true,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    collegeName: [{ collegeSchema }],
    courseTeach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
  },
  { timestamps: true }
);

export const Teacher = mongoose.Model("Teacher", teacherSchema);
