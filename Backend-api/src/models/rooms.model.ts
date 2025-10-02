import { Schema, model } from "mongoose";

const roomSchema = new Schema(
  {
    roomNumber: {
      type: String,
      required: [true, "Số phòng là bắt buộc"],
      trim: true,
    },
    typeId: {
      type: Schema.Types.ObjectId,
      ref: "RoomType", // liên kết tới collection roomTypes
      required: [true, "Loại phòng là bắt buộc"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["available", "booked", "maintenance", "checked_in"],
      default: "available",
    },
    amenities: {
      type: [String],
      default: [
        "wifi",
        "air conditioning",
        "television",
        "kitchen",
        "bathroom",
        "balcony",
        "gym",
        "pool",
        "free parking",
      ],
    },
    images: {
      type: [String],
      default: [],
    },
    
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model("Room", roomSchema);
