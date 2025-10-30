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
    paidAmount: {
      type: Number,
      default: 0,
    },
    remainingAmount: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "partial_paid", "paid", "failed", "refunded", "refund_requested", "cancelled"],
      default: "pending",
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
