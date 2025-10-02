import { Schema, model } from "mongoose";

const invoiceItemSchema = new Schema(
  {
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
      required: [true, "Cần liên kết với hóa đơn"],
    },
    itemType: {
      type: String,
      enum: ["room", "service",'late_fee', "other"],
      default: "other",
      required: [true, "Loại item là bắt buộc"],
    },
    description: {
      type: String,
      trim: true,
      required: [true, "Mô tả item là bắt buộc"],
    },
    amount: {
      type: Number,
      required: [true, "Số tiền là bắt buộc"],
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model("InvoiceItem", invoiceItemSchema);
