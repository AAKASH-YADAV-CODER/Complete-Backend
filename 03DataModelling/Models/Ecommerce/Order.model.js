import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const orderSchema = new mongoose.Schema(
  {
    orderPrice: {
      type: Number,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    address: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "CANCELLED", "DELIVERED"],
      default: "PENDING",
    },
    orderItem: {
      type: [orderItemSchema],
    },
  },
  { timestamps: true }
);
export const Order = mongoose.Model("Order", orderSchema);
