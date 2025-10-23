import createError from "http-errors";
import BookingStatus from "../models/bookingStatus.model";

const getAll = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const sortField = query.sort_by || "createdAt";
  const sortType = query.sort_type === "asc" ? 1 : -1; // mặc định mới nhất trước
  // Nếu không truyền sort_by, ưu tiên createdAt rồi fallback theo _id để đảm bảo bản ghi cũ (không có createdAt) vẫn được sắp xếp đúng
  const sortObject: Record<string, 1 | -1> = query.sort_by
    ? { [sortField]: sortType }
    : { createdAt: -1, _id: -1 };

  const where: Record<string, any> = {};
  if (query.bookingId) where.bookingId = query.bookingId;
  if (query.actorId) where.actorId = query.actorId;
  if (query.action) where.action = query.action;

  const logs = await BookingStatus.find(where)
  .populate({
    path: "bookingId",
    select: "_id checkIn checkOut roomId customerId source guests guestCount", // thêm source, guests, guestCount
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

const getById = async (id: string) => {
  const log = await BookingStatus.findById(id)
    .populate({
      path: "bookingId",
      select: "_id checkIn checkOut roomNumber customerId source guests guestCount",
      populate: { path: "customerId", select: "fullName email phoneNumber" },
    })
    .populate("actorId", "fullName email phoneNumber");

  if (!log) throw createError(404, "Booking status not found");
  return log;
};

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

const updateById = async (id: string, payload: any) => {
  const log = await getById(id);

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
