import { Schema, model } from "mongoose";

const locationSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Tên địa điểm là bắt buộc"],
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "tham_quan",
        "an_uong",
        "the_thao",
        "phim_anh",
        "sach",
        "game",
        "du_lich",
        "thu_gian",
        "bao_tang",
        "vuon_quoc_gia",
      ], // loại địa điểm
      required: [true, "Thiếu loại địa điểm"],
    },
    description: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    images: {
      type: [String], // mảng URL ảnh
      default: [],
    },
    ratingAvg: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    status: {
      type: String,
      enum: ["active", "hidden", "deleted"],
      default: "active",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model("Location", locationSchema);
