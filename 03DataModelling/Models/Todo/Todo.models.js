import mongoose from "mongoose";

const TodoSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    subTodos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubTodo",
      },
    ], //Here we have Todo which further have lots of subTodo that's why it store in array
  },
  { timestamps: true }
);
export const Todo = mongoose.Model("Todo", TodoSchema);

/**
 1> createdBy give the reference where it come from means who is created this like User have created there todo list so there will be lots of users are there

 2>subTodos: in Todos like have some more todos like youtube ,gym,job,home etc so that's here, i provided two reference and remember this is the exact way to provide any reference type: mongoose.Schema.Types.ObjectId,
 */
