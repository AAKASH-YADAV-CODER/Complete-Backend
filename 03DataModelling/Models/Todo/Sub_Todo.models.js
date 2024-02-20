import mongoose from "mongoose";

const SubTodoSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      require: [true, "Please Provide Content to your todo list"],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
export const SubTodo = mongoose.Model("SubTodo", SubTodoSchema);
