import createError from "http-errors";
import Notification from "../models/notifications.model";
import User from "../models/users.model";
import { Types } from "mongoose";

/**
 * Tạo notification mới: nếu không có recipients thì mặc định gửi cho tất cả admin và staff,
 * tạo notification với thông tin booking, user và metadata
 */
const create = async (payload: any) => {
  const {
    type = "new_booking",
    title,
    message,
    bookingId,
    userId,
    bookingData,
    recipients = [],
    metadata = {},
  } = payload;

  // Nếu không có recipients, mặc định gửi cho tất cả admin và staff
  let finalRecipients = recipients;
  if (recipients.length === 0) {
    // Lấy tất cả admin và staff đang hoạt động
    const adminAndStaff = await User.find({
      role: { $in: ["admin", "staff"] },
      status: "active",
    }).select("_id role");

    // Tạo danh sách recipients từ admin và staff
    finalRecipients = adminAndStaff.map((user) => ({
      userId: user._id,
      role: user.role,
      read: false,
    }));
  }

  // Tạo notification mới với các thông tin từ payload
  const notification = new Notification({
    type,
    title: title || message, // Nếu không có title thì dùng message
    message,
    bookingId,
    userId,
    bookingData,
    recipients: finalRecipients,
    status: "active",
    metadata,
  });

  const savedNotification = await notification.save();
  return savedNotification;
};

/**
 * Lấy tất cả notifications với các bộ lọc (userId, role, bookingId, type, read)
 * và phân trang. Tự động loại bỏ các notification đã bị xóa
 */
const getAll = async (query: any) => {
  // Thiết lập phân trang
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  // Thiết lập sắp xếp
  const sortField = query.sort_by || "createdAt";
  const sortType = query.sort_type === "asc" ? 1 : -1;
  const sortObject: Record<string, 1 | -1> = { [sortField]: sortType };

  // Mặc định loại bỏ các notification đã bị xóa
  const where: Record<string, any> = {
    status: { $ne: "deleted" },
  };

  // Lọc theo userId trong recipients
  if (query.userId) {
    where["recipients.userId"] = query.userId;
  }
  // Lọc theo role trong recipients
  if (query.role) {
    where["recipients.role"] = query.role;
  }
  // Lọc theo bookingId
  if (query.bookingId) {
    where.bookingId = query.bookingId;
  }
  // Lọc theo loại notification
  if (query.type) {
    where.type = query.type;
  }
  // Lọc theo trạng thái đã đọc/chưa đọc
  if (query.read !== undefined) {
    where["recipients.read"] = query.read === "true";
  }

  // Tìm notifications với populate thông tin booking, user và phân trang
  const notifications = await Notification.find(where)
    .populate("bookingId", "checkIn checkOut totalPrice paymentStatus")
    .populate("userId", "fullName email")
    .populate("bookingData.customerId", "fullName email phoneNumber")
    .populate("bookingData.roomId", "roomNumber typeId")
    .skip((page - 1) * limit)
    .limit(limit)
    .sort(sortObject);

  // Đếm tổng số notification để phân trang
  const count = await Notification.countDocuments(where);

  return {
    notifications,
    pagination: { totalRecord: count, limit, page },
  };
};

/**
 * Lấy notifications của một user cụ thể với các bộ lọc (read) và phân trang
 */
const getByUserId = async (userId: string, query: any) => {
  // Thiết lập phân trang
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  // Thiết lập sắp xếp
  const sortField = query.sort_by || "createdAt";
  const sortType = query.sort_type === "asc" ? 1 : -1;
  const sortObject: Record<string, 1 | -1> = { [sortField]: sortType };

  // Lọc theo userId trong recipients và loại bỏ đã xóa
  const where: Record<string, any> = {
    status: { $ne: "deleted" },
    "recipients.userId": userId,
  };

  // Lọc theo trạng thái đã đọc/chưa đọc nếu có
  if (query.read !== undefined) {
    where["recipients.read"] = query.read === "true";
  }

  // Tìm notifications của user với populate thông tin booking, user và phân trang
  const notifications = await Notification.find(where)
    .populate("bookingId", "checkIn checkOut totalPrice paymentStatus")
    .populate("userId", "fullName email")
    .populate("bookingData.customerId", "fullName email phoneNumber")
    .populate("bookingData.roomId", "roomNumber typeId")
    .skip((page - 1) * limit)
    .limit(limit)
    .sort(sortObject);

  // Đếm tổng số notification để phân trang
  const count = await Notification.countDocuments(where);

  return {
    notifications,
    pagination: { totalRecord: count, limit, page },
  };
};

/**
 * Lấy thông tin chi tiết của một notification theo ID,
 * bao gồm thông tin booking, user và booking data
 */
const getById = async (id: string) => {
  const notification = await Notification.findById(id)
    .populate("bookingId", "checkIn checkOut totalPrice paymentStatus")
    .populate("userId", "fullName email")
    .populate("bookingData.customerId", "fullName email phoneNumber")
    .populate("bookingData.roomId", "roomNumber typeId");

  // Nếu không tìm thấy notification thì báo lỗi
  if (!notification) throw createError(404, "Không tìm thấy thông báo");
  return notification;
};

/**
 * Đánh dấu notification là đã đọc cho một user cụ thể
 */
const markAsRead = async (id: string, userId: string) => {
  const notification = await Notification.findById(id);
  // Nếu không tìm thấy notification thì báo lỗi
  if (!notification) throw createError(404, "Không tìm thấy thông báo");

  // Tìm recipient tương ứng với userId và đánh dấu đã đọc
  const recipient = notification.recipients.find(
    (r: any) => r.userId?.toString() === userId
  );

  // Nếu tìm thấy recipient thì đánh dấu đã đọc
  if (recipient) {
    recipient.read = true;
    recipient.readAt = new Date();
    await notification.save();
  }

  return notification;
};

/**
 * Đánh dấu tất cả notifications chưa đọc của user là đã đọc
 */
const markAllAsRead = async (userId: string) => {
  const userObjId = new Types.ObjectId(userId);
  const userIdStr = userId.toString();

  // Update theo ObjectId
  const byObjectId = await Notification.updateMany(
    {
      status: { $ne: "deleted" },
      "recipients.userId": userObjId,
      "recipients.read": false,
    },
    {
      $set: {
        "recipients.$[elem].read": true,
        "recipients.$[elem].readAt": new Date(),
      },
    },
    {
      arrayFilters: [
        {
          "elem.read": false,
          "elem.userId": userObjId,
        },
      ],
    }
  );

  // Update theo string (phòng khi userId lưu dạng string)
  const byStringId = await Notification.updateMany(
    {
      status: { $ne: "deleted" },
      "recipients.userId": userIdStr,
      "recipients.read": false,
    },
    {
      $set: {
        "recipients.$[elem].read": true,
        "recipients.$[elem].readAt": new Date(),
      },
    },
    {
      arrayFilters: [
        {
          "elem.read": false,
          "elem.userId": userIdStr,
        },
      ],
    }
  );

  return { byObjectId, byStringId };
};

/**
 * Đếm số notifications chưa đọc của user
 */
const getUnreadCount = async (userId: string) => {
  const userObjId = new Types.ObjectId(userId);
  // Đếm số notification có recipient là userId và chưa đọc, không bao gồm đã xóa
  const count = await Notification.countDocuments({
    status: { $ne: "deleted" },
    "recipients.read": false,
    $or: [
      { "recipients.userId": userObjId },
      { "recipients.userId": userId.toString() },
    ],
  });

  return count;
};

/**
 * Xóa notification theo ID: thực hiện soft delete bằng cách đặt status = "deleted"
 */
const deleteById = async (id: string) => {
  const notification = await Notification.findById(id);
  // Nếu không tìm thấy notification thì báo lỗi
  if (!notification) throw createError(404, "Không tìm thấy thông báo");

  // Soft delete: chỉ đánh dấu status = "deleted" thay vì xóa thật
  notification.status = "deleted";
  await notification.save();

  return notification;
};

/**
 * Xóa tất cả notifications đã đọc của user: thực hiện soft delete
 */
const deleteAllRead = async (userId: string) => {
  // Cập nhật tất cả notifications đã đọc của user thành status = "deleted"
  const result = await Notification.updateMany(
    {
      "recipients.userId": userId,
      "recipients.read": true,
    },
    {
      $set: { status: "deleted" },
    }
  );

  return result;
};

export default {
  create,
  getAll,
  getByUserId,
  getById,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteById,
  deleteAllRead,
};