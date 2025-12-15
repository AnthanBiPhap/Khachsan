import { Schema, model } from "mongoose";

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Tên là bắt buộc"],
      trim: true,
    },
    contact: {
      type: String,
      required: [true, "Email hoặc số điện thoại là bắt buộc"],
      trim: true,
    },
    subject: {
      type: String,
      enum: ["booking", "service", "issue", "feedback", "general"],
      default: "general",
    },
    message: {
      type: String,
      required: [true, "Nội dung tin nhắn là bắt buộc"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["new", "read", "replied", "archived"],
      default: "new",
    },
    repliedAt: {
      type: Date,
      default: null,
    },
    repliedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    replyMessage: {
      type: String,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model("Contact", contactSchema);

