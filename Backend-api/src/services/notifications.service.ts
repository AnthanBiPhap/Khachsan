import createError from "http-errors";
import Notification from "../models/notifications.model";
import User from "../models/users.model";

// Tạo notification mới
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
    // Lấy tất cả admin và staff
    const adminAndStaff = await User.find({
      role: { $in: ["admin", "staff"] },
      status: "active",
    }).select("_id role");

    finalRecipients = adminAndStaff.map((user) => ({
      userId: user._id,
      role: user.role,
      read: false,
    }));
  }

  const notification = new Notification({
    type,
    title: title || message,
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

// Lấy tất cả notifications với filter + pagination
const getAll = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const sortField = query.sort_by || "createdAt";
  const sortType = query.sort_type === "asc" ? 1 : -1;
  const sortObject: Record<string, 1 | -1> = { [sortField]: sortType };

  const where: Record<string, any> = {
    status: { $ne: "deleted" },
  };

  // Filter theo userId hoặc role
  if (query.userId) {
    where["recipients.userId"] = query.userId;
  }
  if (query.role) {
    where["recipients.role"] = query.role;
  }
  if (query.bookingId) {
    where.bookingId = query.bookingId;
  }
  if (query.type) {
    where.type = query.type;
  }
  if (query.read !== undefined) {
    where["recipients.read"] = query.read === "true";
  }

  const notifications = await Notification.find(where)
    .populate("bookingId", "checkIn checkOut totalPrice paymentStatus")
    .populate("userId", "fullName email")
    .populate("bookingData.customerId", "fullName email phoneNumber")
    .populate("bookingData.roomId", "roomNumber typeId")
    .skip((page - 1) * limit)
    .limit(limit)
    .sort(sortObject);

  const count = await Notification.countDocuments(where);

  return {
    notifications,
    pagination: { totalRecord: count, limit, page },
  };
};

// Lấy notifications của một user cụ thể
const getByUserId = async (userId: string, query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const sortField = query.sort_by || "createdAt";
  const sortType = query.sort_type === "asc" ? 1 : -1;
  const sortObject: Record<string, 1 | -1> = { [sortField]: sortType };

  const where: Record<string, any> = {
    status: { $ne: "deleted" },
    "recipients.userId": userId,
  };

  if (query.read !== undefined) {
    where["recipients.read"] = query.read === "true";
  }

  const notifications = await Notification.find(where)
    .populate("bookingId", "checkIn checkOut totalPrice paymentStatus")
    .populate("userId", "fullName email")
    .populate("bookingData.customerId", "fullName email phoneNumber")
    .populate("bookingData.roomId", "roomNumber typeId")
    .skip((page - 1) * limit)
    .limit(limit)
    .sort(sortObject);

  const count = await Notification.countDocuments(where);

  return {
    notifications,
    pagination: { totalRecord: count, limit, page },
  };
};

// Lấy notification theo id
const getById = async (id: string) => {
  const notification = await Notification.findById(id)
    .populate("bookingId", "checkIn checkOut totalPrice paymentStatus")
    .populate("userId", "fullName email")
    .populate("bookingData.customerId", "fullName email phoneNumber")
    .populate("bookingData.roomId", "roomNumber typeId");

  if (!notification) throw createError(404, "Notification not found");
  return notification;
};

// Đánh dấu notification là đã đọc
const markAsRead = async (id: string, userId: string) => {
  const notification = await Notification.findById(id);
  if (!notification) throw createError(404, "Notification not found");

  // Tìm recipient và đánh dấu đã đọc
  const recipient = notification.recipients.find(
    (r: any) => r.userId?.toString() === userId
  );

  if (recipient) {
    recipient.read = true;
    recipient.readAt = new Date();
    await notification.save();
  }

  return notification;
};

// Đánh dấu tất cả notifications của user là đã đọc
const markAllAsRead = async (userId: string) => {
  const result = await Notification.updateMany(
    {
      "recipients.userId": userId,
      "recipients.read": false,
    },
    {
      $set: {
        "recipients.$[elem].read": true,
        "recipients.$[elem].readAt": new Date(),
      },
    },
    {
      arrayFilters: [{ "elem.userId": userId, "elem.read": false }],
    }
  );

  return result;
};

// Đếm số notifications chưa đọc của user
const getUnreadCount = async (userId: string) => {
  const count = await Notification.countDocuments({
    status: { $ne: "deleted" },
    "recipients.userId": userId,
    "recipients.read": false,
  });

  return count;
};

// Xóa notification (soft delete)
const deleteById = async (id: string) => {
  const notification = await Notification.findById(id);
  if (!notification) throw createError(404, "Notification not found");

  notification.status = "deleted";
  await notification.save();

  return notification;
};

// Xóa tất cả notifications đã đọc của user
const deleteAllRead = async (userId: string) => {
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

