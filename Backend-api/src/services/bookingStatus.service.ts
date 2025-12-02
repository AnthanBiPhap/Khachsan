import createError from "http-errors";
import BookingStatus from "../models/bookingStatus.model";

/**
 * Lấy danh sách tất cả booking status logs với các bộ lọc (bookingId, actorId, action)
 * và phân trang. Bao gồm thông tin booking, customer và actor
 */
const getAll = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const sortField = query.sort_by || "createdAt";
  const sortType = query.sort_type === "asc" ? 1 : -1; // Mặc định sắp xếp mới nhất trước
  // Nếu không truyền sort_by, ưu tiên createdAt rồi fallback theo _id để đảm bảo bản ghi cũ (không có createdAt) vẫn được sắp xếp đúng
  const sortObject: Record<string, 1 | -1> = query.sort_by
    ? { [sortField]: sortType }
    : { createdAt: -1, _id: -1 };

  const where: Record<string, any> = {};
  // Lọc theo bookingId nếu có
  if (query.bookingId) where.bookingId = query.bookingId;
  // Lọc theo actorId nếu có
  if (query.actorId) where.actorId = query.actorId;
  // Lọc theo action nếu có
  if (query.action) where.action = query.action;

  const logs = await BookingStatus.find(where)
  .populate({
    path: "bookingId",
    select: "_id checkIn checkOut roomId customerId source guests guestCount", // Bao gồm source, guests, guestCount
    populate: [
      { path: "customerId", select: "fullName email phoneNumber" },
      { path: "roomId", select: "roomNumber typeId" },
    ],
  })
  .populate("actorId", "fullName email phoneNumber")
  .skip((page - 1) * limit)
  .limit(limit)
  .sort(sortObject);


  const count = await BookingStatus.countDocuments(where);

  return {
    logs,
    pagination: {
      totalRecord: count,
      limit,
      page,
    },
  };
};

/**
 * Lấy thông tin chi tiết của một booking status log theo ID,
 * bao gồm thông tin booking, customer và actor
 */
const getById = async (id: string) => {
  const log = await BookingStatus.findById(id)
    .populate({
      path: "bookingId",
      select: "_id checkIn checkOut roomNumber customerId source guests guestCount",
      populate: { path: "customerId", select: "fullName email phoneNumber" },
    })
    .populate("actorId", "fullName email phoneNumber");

  // Nếu không tìm thấy log thì báo lỗi
  if (!log) throw createError(404, "Không tìm thấy trạng thái đặt phòng");
  return log;
};

/**
 * Tạo booking status log mới: ghi lại hành động thay đổi trạng thái booking,
 * bao gồm thông tin booking, người thực hiện, hành động và ghi chú
 */
const create = async (payload: any) => {
  const log = new BookingStatus({
    bookingId: payload.bookingId,
    actorId: payload.actorId,
    actorName: payload.actorName,
    action: payload.action,
    note: payload.note || "",
  });

  const savedLog = await log.save();
  await savedLog.populate({
    path: "bookingId",
    select: "_id checkIn checkOut roomNumber customerId source guests guestCount",
    populate: { path: "customerId", select: "fullName email phoneNumber" },
  });
  await savedLog.populate("actorId", "fullName email phoneNumber");
  return savedLog;
};

/**
 * Cập nhật thông tin booking status log theo ID:
 * lọc các giá trị hợp lệ và cập nhật các trường được chỉ định
 */
const updateById = async (id: string, payload: any) => {
  const log = await getById(id);

  // Lọc các giá trị hợp lệ (loại bỏ rỗng, null, undefined)
  const cleanUpdates = Object.fromEntries(
    Object.entries(payload).filter(
      ([, v]) => v !== "" && v !== null && v !== undefined
    )
  );

  Object.assign(log, cleanUpdates);
  const updatedLog = await log.save();
  await updatedLog.populate({
    path: "bookingId",
    select: "_id checkIn checkOut roomNumber customerId source guests guestCount",
    populate: { path: "customerId", select: "fullName email phoneNumber" },
  });
  await updatedLog.populate("actorId", "fullName email phoneNumber");
  return updatedLog;
};

/**
 * Xóa booking status log theo ID
 */
const deleteById = async (id: string) => {
  const log = await getById(id);
  await log.deleteOne();
  return log;
};

export default {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
};
