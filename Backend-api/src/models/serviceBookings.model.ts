import { Schema, model } from "mongoose";

const serviceBookingSchema = new Schema(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: false,
      default: null
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: [true, "Thiếu dịch vụ"],
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null
    },
    guestName: {
      type: String,
      required: false,
      trim: true
    },
    phoneNumber: {
      type: String,
      required: false,
      trim: true
    },
    scheduledAt: {
      type: Date,
      required: [true, "Cần thời gian thực hiện"],
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    price: {
      type: Number,
      required: [true, "Thiếu giá dịch vụ"],
      min: 0,
    },
    status: {
      type: String,
      enum: ["reserved", "completed", "cancelled"],
      default: "reserved",
    },
  },
  { timestamps: true, versionKey: false }
);

export default model("ServiceBooking", serviceBookingSchema);
