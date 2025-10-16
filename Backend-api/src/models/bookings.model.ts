import { Schema, model } from "mongoose";

const bookingSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    guestInfo: {
      fullName: {
        type: String,
        required: function (this: any) {
          return !this.customerId;
        },
      },
      idNumber: {
        type: String,
        required: function (this: any) {
          return !this.customerId;
        },
      },
      age: {
        type: Number,
        required: function (this: any) {
          return !this.customerId;
        },
      },
      phoneNumber: {
        type: String,
        required: function (this: any) {
          return !this.customerId;
        },
      },
      email: { type: String },
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Thiếu thông tin phòng"],
    },
    checkIn: {
      type: Date,
      required: [true, "Ngày nhận phòng là bắt buộc"],
    },
    checkOut: {
      type: Date,
      required: [true, "Ngày trả phòng là bắt buộc"],
    },
    guests: {
      type: Number,
      required: [true, "Cần khai báo số lượng khách"],
      min: 1,
    },
    services: [
      {
        serviceId: { type: Schema.Types.ObjectId, ref: "Service" },
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, default: 1, min: 1 },
      },
    ],
    source: {
      type: String,
      enum: ["online", "walk_in"],
      default: "walk_in",
    },
    totalPrice: {
      type: Number,
      required: [true, "Tổng tiền là bắt buộc"],
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "refund_requested"],
      default: "pending",
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model("Booking", bookingSchema);
