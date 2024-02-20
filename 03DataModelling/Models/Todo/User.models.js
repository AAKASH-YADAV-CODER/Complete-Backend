import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please Enter UserName"],
      unique: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      unique: [true, "Please Provide Unique Password"],
      lowercase: true,
    },
  },
  { timestamps: [true] }
);

export const User = mongoose.Model("User", UserSchema);

/*
1> Firstly we have to create schema with help of new and then export it as we done above this model ask two thing first is name and the schema means structure and this is same at every design of data modelling.

2>in Schema define your data points or which are the fields and there types which kind of data we need to store like normally we 
mongoose.Schema({
    name:String,
    email:String,
    Phone:Integer,
    password:String
}) But as above we done some advanced thing by using object property

3> timestamps :- this give information about two things which is createdAt,updatedAt 
mangoose supports timestamps options which give information about documentation when it is created and on which date it is updated 

4> Important so this model name we provided in singular as above but mongoose in there working table it take it plural and in lowercase like users . it ask in interview
*/
