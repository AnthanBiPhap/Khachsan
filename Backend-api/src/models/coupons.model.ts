import { Schema, model } from "mongoose";

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: [true, "Mã coupon là bắt buộc"],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z0-9]+$/, "Mã coupon chỉ được chứa chữ cái và số"],
    },
    name: {
      type: String,
      required: [true, "Tên coupon là bắt buộc"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: [true, "Loại giảm giá là bắt buộc"],
      default: "percentage",
    },
    discountValue: {
      type: Number,
      required: [true, "Giá trị giảm giá là bắt buộc"],
      min: 0,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    startDate: {
      type: Date,
      required: [true, "Ngày bắt đầu là bắt buộc"],
    },
    endDate: {
      type: Date,
      required: [true, "Ngày kết thúc là bắt buộc"],
    },
    usageLimit: {
      type: Number,
      default: 0, // 0 = không giới hạn
      min: 0,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "expired"],
      default: "active",
    },
    applicableTo: {
      type: String,
      enum: ["all", "room", "service"],
      default: "all",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index để tìm kiếm nhanh theo code
couponSchema.index({ code: 1 });

// Pre-save hook để tự động cập nhật status dựa trên ngày
couponSchema.pre("save", function (next) {
  const now = new Date();
  if (this.endDate && this.endDate < now && this.status === "active") {
    this.status = "expired";
  }
  next();
});

export default model("Coupon", couponSchema);

