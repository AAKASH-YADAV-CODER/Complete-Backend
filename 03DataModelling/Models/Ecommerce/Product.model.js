import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    productImage: {
      type: String,
      required: true,
    },
    productPrice: {
      type: Number,
      required: true,
    },
    categoryName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  },
  { timestamps: true }
);
export const Product = mongoose.Model("Product", productSchema);
