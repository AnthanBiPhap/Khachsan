import { Schema, model } from "mongoose";

const contactInfoSchema = new Schema(
  {
    phone: {
      type: String,
      default: "0704627402",
      trim: true,
    },
    email: {
      type: String,
      default: "info@mikohotel.com",
      trim: true,
    },
    address: {
      type: String,
      default: "Thanh khê, Hùng Vương, Đà Nẵng",
      trim: true,
    },
    addressLink: {
      type: String,
      default: "",
      trim: true,
    },
    workingHours: {
      reception: {
        type: String,
        default: "Lễ tân 24/7",
      },
      onlineSupport: {
        type: String,
        default: "Hỗ trợ online: 8:00 - 22:00 hàng ngày",
      },
    },
    socialMedia: {
      facebook: {
        type: String,
        default: "https://facebook.com/mikohotel",
      },
      zalo: {
        type: String,
        default: "https://zalo.me/84912345678",
      },
      instagram: {
        type: String,
        default: "https://instagram.com/mikohotel",
      },
    },
    zaloQR: {
      type: String,
      default: "/zalo-qr.jpg",
    },
    mapEmbedUrl: {
      type: String,
      default: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.641108987922!2d108.21948517490328!3d16.032187484641973!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219ee598df9c5%3A0xaadb53409be7c909!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBLaeG6v24gdHLDumMgxJDDoCBO4bq1bmc!5e0!3m2!1svi!2s!4v1759427019279!5m2!1svi!2s",
    },
    mapLink: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model("ContactInfo", contactInfoSchema);

