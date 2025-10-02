import createError from "http-errors";
import Room from "../models/rooms.model";

const getAll = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const sortField = query.sort_by || "createdAt";
  const sortType = query.sort_type === "asc" ? 1 : -1;
  const sortObject: Record<string, 1 | -1> = { [sortField]: sortType };

  const where: Record<string, any> = {};
  if (query.roomNumber?.trim())
    where.roomNumber = { $regex: query.roomNumber, $options: "i" };
  if (query.typeId) where.typeId = query.typeId;
  if (query.status) where.status = query.status;

  const rooms = await Room.find(where)
    .populate(
      "typeId",
      "name pricePerNight extraHourPrice maxExtendHours capacity"
    )
    .skip((page - 1) * limit)
    .limit(limit)
    .sort(sortObject);

  const count = await Room.countDocuments(where);

  return {
    rooms,
    pagination: {
      totalRecord: count,
      limit,
      page,
    },
  };
};

const getById = async (id: string) => {
  const room = await Room.findById(id).populate(
    "typeId",
    "name pricePerNight extraHourPrice maxExtendHours capacity"
  );
  if (!room) throw createError(404, "Room not found");
  return room;
};

const create = async (payload: any) => {
  const existing = await Room.findOne({ roomNumber: payload.roomNumber });
  if (existing) throw createError(400, "Room with this number already exists");

  const room = new Room({
    roomNumber: payload.roomNumber,
    typeId: payload.typeId,
    status: payload.status || "available",
    amenities: payload.amenities || [
      "wifi",
      "air conditioning",
      "television",
      "kitchen",
      "bathroom",
      "balcony",
      "gym",
      "pool",
      "free parking",
    ],
    images: payload.images || [],
  });

  await room.save();
  return room.populate("typeId", "name pricePerNigh capacity");
};

const updateById = async (id: string, payload: any) => {
  const room = await getById(id);

  if (payload.roomNumber && payload.roomNumber !== room.roomNumber) {
    const dup = await Room.findOne({
      roomNumber: payload.roomNumber,
      _id: { $ne: id },
    });
    if (dup)
      throw createError(400, "Another room with this number already exists");
  }

  const cleanUpdates = Object.fromEntries(
    Object.entries(payload).filter(
      ([_, v]) => v !== "" && v !== null && v !== undefined
    )
  );

  Object.assign(room, cleanUpdates);
  await room.save();
  return room.populate("typeId", "name pricePerNight capacity");
};

const deleteById = async (id: string) => {
  const room = await getById(id);
  await room.deleteOne(); // xóa cứng, muốn soft delete thì đổi status = 'deleted'
  return room;
};

export default {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
};
