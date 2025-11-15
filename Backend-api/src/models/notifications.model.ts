import { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    type: {
      type: String,
      required: [true, "Loại thông báo là bắt buộc"],
      enum: ["new_booking", "booking_updated", "payment_received", "booking_cancelled", "booking_paid", "booking_refunded", "booking_refund_requested", "group_booking_approved", "group_booking_quoted", "group_booking_paid", "group_booking_confirmed", "group_booking_refund_requested", "group_booking_refunded", "other"],
      default: "new_booking",
    },
    title: {
      type: String,
      required: [true, "Tiêu đề thông báo là bắt buộc"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Nội dung thông báo là bắt buộc"],
      trim: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    // Lưu trữ thông tin booking để hiển thị nhanh
    bookingData: {
      bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
      customerId: { type: Schema.Types.ObjectId, ref: "User" },
      roomId: { type: Schema.Types.ObjectId, ref: "Room" },
      checkIn: { type: Date },
      checkOut: { type: Date },
      totalPrice: { type: Number },
      paymentStatus: { type: String },
      source: { type: String },
      guestCount: { type: Number },
      guests: { type: Array, default: [] },
    },
    // Đối tượng nhận thông báo (admin, staff, hoặc user cụ thể)
    recipients: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["admin", "staff", "customer"] },
        read: { type: Boolean, default: false },
        readAt: { type: Date },
      },
    ],
    // Trạng thái thông báo
    status: {
      type: String,
      enum: ["active", "archived", "deleted"],
      default: "active",
    },
    // Metadata
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index để tìm kiếm nhanh
notificationSchema.index({ bookingId: 1 });
notificationSchema.index({ userId: 1 });
notificationSchema.index({ "recipients.userId": 1 });
notificationSchema.index({ "recipients.role": 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ createdAt: -1 });

export default model("Notification", notificationSchema);

