import { Schema, model } from "mongoose";

const paymentSchema = new Schema(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Cần liên kết với booking"],
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    // Thông tin thanh toán
    paymentMethod: {
      type: String,
      enum: ["stripe", "cash", "bank_transfer", "other"],
      required: [true, "Phương thức thanh toán là bắt buộc"],
    },
    amount: {
      type: Number,
      required: [true, "Số tiền thanh toán là bắt buộc"],
      min: 0,
    },
    currency: {
      type: String,
      default: "VND",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled", "refunded"],
      default: "pending",
    },
    // Thông tin Stripe (nếu sử dụng Stripe)
    stripeSessionId: {
      type: String,
      required: function (this: any) {
        return this.paymentMethod === "stripe";
      },
    },
    stripePaymentIntentId: {
      type: String,
    },
    stripeCustomerId: {
      type: String,
    },
    // Thông tin giao dịch
    transactionId: {
      type: String,
      unique: true,
      sparse: true, // Cho phép null nhưng unique khi có giá trị
    },
    // Thông tin ngân hàng (nếu chuyển khoản)
    bankInfo: {
      bankName: String,
      accountNumber: String,
      transactionCode: String,
    },
    // Thông tin tiền mặt
    cashInfo: {
      receivedBy: String, // Người nhận tiền
      receivedAt: Date,
      notes: String,
    },
    // Thông tin hoàn tiền
    refundInfo: {
      refundAmount: Number,
      refundReason: String,
      refundedAt: Date,
      refundedBy: String,
    },
    // Metadata bổ sung
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
    // Ghi chú
    notes: {
      type: String,
      trim: true,
    },
    // Thời gian thanh toán
    paidAt: {
      type: Date,
    },
    // Thời gian hết hạn (cho thanh toán pending)
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index để tối ưu truy vấn
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ customerId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentMethod: 1 });
paymentSchema.index({ stripeSessionId: 1 }, { sparse: true });

export default model("Payment", paymentSchema);
