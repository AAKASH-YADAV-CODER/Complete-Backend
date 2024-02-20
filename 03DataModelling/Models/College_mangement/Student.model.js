import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
    classHours: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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
    studyAt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
    },
    courseUsed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      teacherUsed: { teacherSchema },
    },
  },
  { timestamps: true }
);

export const Student = mongoose.Model("Student", studentSchema);
