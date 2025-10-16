import { Schema, model } from "mongoose";

const bookingStatusLogSchema = new Schema(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Cần chỉ định booking"],
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: "User", // user bình thường (customer)
      required: false,
    },
    actorName: {
      type: String, // admin/staff hoặc tên user nếu cần
      trim: true,
      required: false,
    },
    action: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "cancelled",
        "checked_in",
        "checked_out",
        "extend",
        "extend_check_out",
        "paid",
        "failed",
        "refunded",
        "refund_requested",
      ],
      required: [true, "Thiếu thông tin hành động"],
    },
    note: {
      type: String,
      trim: true, // ghi chú (nếu có)
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model("BookingStatusLog", bookingStatusLogSchema);
