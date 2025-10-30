import { Schema, model } from "mongoose";

const groupBookingMemberSchema = new Schema(
  {
    fullName: { type: String, required: true },
    idNumber: { type: String, required: false },
    dateOfBirth: { type: Date, required: false },
    phoneNumber: { type: String, required: false },
    email: { type: String, required: false },
    isLeader: { type: Boolean, default: false },
  },
  { _id: false }
);

const groupBookingSchema = new Schema(
  {
    requesterId: { type: Schema.Types.ObjectId, ref: "User", required: false },
    requesterName: { type: String, required: true },
    requesterPhone: { type: String, required: true },
    requesterEmail: { type: String, required: false },

    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },

    peopleCount: { type: Number, required: true, min: 1 },
    roomCount: { type: Number, required: true, min: 1 },

    notes: { type: String, required: false },

    status: {
      type: String,
      enum: [
        "pending_approval",
        "approved",
        "info_uploaded",
        "quoted",
        "awaiting_payment",
        "paid",
        "confirmed",
        "cancelled",
      ],
      default: "pending_approval",
    },

    allocatedRoomIds: [{ type: Schema.Types.ObjectId, ref: "Room" }],

    members: { type: [groupBookingMemberSchema], default: [] },

    quoteAmount: { type: Number, required: false, min: 0 },
    paymentLink: { type: String, required: false },
  },
  { timestamps: true, versionKey: false }
);

export default model("GroupBooking", groupBookingSchema);


