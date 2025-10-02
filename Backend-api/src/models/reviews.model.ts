import { Schema, model } from "mongoose";

const reviewSchema = new Schema(
  {
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Thiếu thông tin người đánh giá"],
    },
    targetType: {
      type: String,
      enum: ["room", "service", "location"], // loại đối tượng được đánh giá
      required: [true, "Thiếu loại đối tượng"],
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: [true, "Thiếu ID của đối tượng được đánh giá"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Thiếu số sao đánh giá"],
    },
    comment: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "hidden", "deleted"],
      default: "active",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model("Review", reviewSchema);
