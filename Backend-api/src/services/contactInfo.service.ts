import createError from "http-errors";
import ContactInfo from "../models/contactInfo.model";

/**
 * Lấy thông tin liên hệ (chỉ có 1 document)
 */
const get = async () => {
  let contactInfo = await ContactInfo.findOne();

  // Nếu chưa có thì tạo mới với giá trị mặc định
  if (!contactInfo) {
    contactInfo = new ContactInfo();
    await contactInfo.save();
  }

  return contactInfo;
};

/**
 * Cập nhật thông tin liên hệ
 */
const update = async (payload: any) => {
  let contactInfo = await ContactInfo.findOne();

  // Nếu chưa có thì tạo mới
  if (!contactInfo) {
    contactInfo = new ContactInfo();
  }

  // Cập nhật các trường được phép
  const allowedFields = [
    "phone",
    "email",
    "address",
    "addressLink",
    "workingHours",
    "socialMedia",
    "zaloQR",
    "mapEmbedUrl",
    "mapLink",
  ];

  allowedFields.forEach((field) => {
    if (payload[field] !== undefined) {
      if (field === "workingHours" || field === "socialMedia") {
        // Merge object
        contactInfo[field] = { ...contactInfo[field], ...payload[field] };
      } else {
        contactInfo[field] = payload[field];
      }
    }
  });

  const updatedContactInfo = await contactInfo.save();
  return updatedContactInfo;
};

export default {
  get,
  update,
};

