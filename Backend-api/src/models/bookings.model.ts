import { Schema, model } from "mongoose";

const bookingSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    guests: [
      {
        fullName: {
          type: String,
          required: [true, "Tên khách hàng là bắt buộc"],
        },
        idNumber: {
          type: String,
          required: [true, "Số CMND/CCCD là bắt buộc"],
        },
        dateOfBirth: {
          type: Date,
          required: [true, "Ngày sinh là bắt buộc"],
        },
        phoneNumber: {
          type: String,
          required: [true, "Số điện thoại là bắt buộc"],
        },
        email: { 
          type: String,
          required: false,
        },
        isMainGuest: {
          type: Boolean,
          default: false,
        },
      },
    ],
    guestCount: {
      type: Number,
      required: [true, "Cần khai báo số lượng khách"],
      min: 1,
      validate: {
        validator: function(this: any, value: number) {
          return value === this.guests.length;
        },
        message: "Số lượng khách phải khớp với danh sách khách",
      },
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
    notes: {
      type: String,
      trim: true,
    },
    newCustomerDiscount: {
      type: {
        applied: { type: Boolean, default: false },
        percentage: { type: Number, default: 0 },
        amount: { type: Number, default: 0 },
      },
      required: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model("Booking", bookingSchema);
