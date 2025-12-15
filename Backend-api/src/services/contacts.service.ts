import createError from "http-errors";
import Contact from "../models/contacts.model";
import emailService from "./email.service";

/**
 * Lấy danh sách tất cả contacts với các bộ lọc và phân trang
 */
const getAll = async (query: any) => {
  // Thiết lập phân trang
  const { page = 1, limit = 10 } = query;
  
  // Thiết lập sắp xếp
  let sortObject: Record<string, 1 | -1> = {};
  const sortType = query.sort_type || "desc";
  const sortBy = query.sort_by || "createdAt";
  sortObject = { ...sortObject, [sortBy]: sortType === "desc" ? -1 : 1 };

  // Xây dựng điều kiện tìm kiếm
  let where: any = { deletedAt: null }; // Chỉ lấy contacts chưa bị xóa

  // Lọc theo tên (tìm kiếm không phân biệt hoa thường)
  if (query.name && query.name.length > 0) {
    where = { ...where, name: { $regex: query.name, $options: "i" } };
  }

  // Lọc theo contact (email/phone)
  if (query.contact && query.contact.length > 0) {
    where = { ...where, contact: { $regex: query.contact, $options: "i" } };
  }

  // Lọc theo subject
  if (query.subject) {
    where = { ...where, subject: query.subject };
  }

  // Lọc theo status
  if (query.status) {
    where = { ...where, status: query.status };
  }

  // Tìm contacts với phân trang
  const contacts = await Contact.find(where)
    .populate("repliedBy", "fullName email")
    .skip((page - 1) * limit)
    .limit(limit)
    .sort(sortObject);

  // Đếm tổng số record hiện có của collection contact (chưa bị xóa)
  const count = await Contact.countDocuments(where);

  return {
    contacts,
    pagination: {
      totalRecord: count,
      limit,
      page,
    },
  };
};

/**
 * Lấy thông tin chi tiết của một contact theo ID.
 * Tự động loại bỏ contact đã bị xóa
 */
const getById = async (id: string) => {
  const contact = await Contact.findOne({
    _id: id,
    deletedAt: null,
  }).populate("repliedBy", "fullName email");

  if (!contact) {
    throw createError(404, "Không tìm thấy liên hệ");
  }

  return contact;
};

/**
 * Tạo contact mới từ form liên hệ hoặc admin
 */
const create = async (payload: any) => {
  const contact = new Contact({
    name: payload.name,
    contact: payload.contact,
    subject: payload.subject || "general",
    message: payload.message,
    status: payload.status || "new", // Cho phép admin set status khi tạo
  });

  const savedContact = await contact.save();
  return savedContact;
};

/**
 * Cập nhật thông tin contact theo ID
 */
const updateById = async (id: string, payload: any) => {
  const contact = await Contact.findOne({ _id: id, deletedAt: null });

  if (!contact) {
    throw createError(404, "Không tìm thấy liên hệ");
  }

  // Cho phép cập nhật tất cả các trường khi admin/staff sửa
  const allowedFields = [
    "name",
    "contact",
    "subject",
    "message",
    "status",
    "replyMessage",
    "repliedBy",
  ];
  allowedFields.forEach((field) => {
    if (payload[field] !== undefined) {
      contact[field] = payload[field];
    }
  });

  // Nếu có replyMessage thì cập nhật repliedAt và gửi email
  if (payload.replyMessage) {
    contact.repliedAt = new Date();
    if (payload.repliedBy) {
      contact.repliedBy = payload.repliedBy;
    }
  }

  const updatedContact = await contact.save();
  await updatedContact.populate("repliedBy", "fullName email");
  
  // Gửi email phản hồi đến khách hàng (nếu contact là email hợp lệ)
  if (payload.replyMessage) {
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(updatedContact.contact)) {
        const repliedByName = (updatedContact.repliedBy as any)?.fullName || "Miko Hotel";
        await emailService.sendContactReply({
          to: updatedContact.contact,
          customerName: updatedContact.name,
          subject: updatedContact.subject,
          originalMessage: updatedContact.message,
          replyMessage: payload.replyMessage,
          repliedBy: repliedByName,
        });
        console.log(`✅ Đã gửi email phản hồi đến ${updatedContact.contact}`);
      } else {
        console.log(`⚠️ Contact không phải email hợp lệ: ${updatedContact.contact}, bỏ qua gửi email`);
      }
    } catch (error: any) {
      console.error(`❌ Lỗi khi gửi email phản hồi:`, error);
      // Không throw error để không ảnh hưởng đến việc lưu contact
      // Chỉ log lỗi để admin biết
    }
  }
  
  return updatedContact;
};

/**
 * Xóa mềm contact (soft delete)
 */
const deleteById = async (id: string) => {
  const contact = await Contact.findOne({ _id: id, deletedAt: null });

  if (!contact) {
    throw createError(404, "Không tìm thấy liên hệ");
  }

  contact.deletedAt = new Date();
  await contact.save();

  return { message: "Đã xóa liên hệ thành công" };
};

/**
 * Đánh dấu contact đã đọc
 */
const markAsRead = async (id: string) => {
  const contact = await Contact.findOne({ _id: id, deletedAt: null });

  if (!contact) {
    throw createError(404, "Không tìm thấy liên hệ");
  }

  if (contact.status === "new") {
    contact.status = "read";
    await contact.save();
  }

  return contact;
};

/**
 * Đếm số lượng contact mới (chưa đọc)
 */
const countNew = async () => {
  const count = await Contact.countDocuments({
    status: "new",
    deletedAt: null,
  });
  return { count };
};

export default {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
  markAsRead,
  countNew,
};

