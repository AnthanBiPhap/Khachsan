import { Schema, model } from "mongoose";

const invoiceSchema = new Schema(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Cần liên kết với booking"],
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User", // tham chiếu bản ghi user
    },
    totalAmount: {
      type: Number,
      required: [true, "Tổng tiền hóa đơn là bắt buộc"],
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model("Invoice", invoiceSchema);
