import createError from "http-errors";
import BookingStatus from "../models/bookingStatus.model";

const getAll = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const sortField = query.sort_by || "createdAt";
  const sortType = query.sort_type === "asc" ? 1 : -1;
  const sortObject: Record<string, 1 | -1> = { [sortField]: sortType };

  const where: Record<string, any> = {};
  if (query.bookingId) where.bookingId = query.bookingId;
  if (query.actorId) where.actorId = query.actorId;
  if (query.action) where.action = query.action;

  const logs = await BookingStatus.find(where)
  .populate({
    path: "bookingId",
    select: "_id checkIn checkOut roomId customerId", // thêm roomId
    populate: [
      { path: "customerId", select: "fullName email" },
      { path: "roomId", select: "roomNumber typeId" }, // populate roomId để lấy roomNumber
    ],
  })
  .populate("actorId", "fullName email")
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
      select: "_id checkIn checkOut roomNumber customerId guestInfo",
      populate: { path: "customerId", select: "fullName email" },
    })
    .populate("actorId", "fullName email");

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
    select: "_id checkIn checkOut roomNumber customerId guestInfo",
    populate: { path: "customerId", select: "fullName email" },
  });
  await savedLog.populate("actorId", "fullName email");
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
    select: "_id checkIn checkOut roomNumber customerId guestInfo",
    populate: { path: "customerId", select: "fullName email" },
  });
  await updatedLog.populate("actorId", "fullName email");
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
