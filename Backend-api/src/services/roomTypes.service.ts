import createError from "http-errors";
import RoomType from "../models/roomTypes.model";

const getAll = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const sortField = query.sort_by || "createdAt";
  const sortType = query.sort_type === "asc" ? 1 : -1;
  const sortObject: Record<string, 1 | -1> = { [sortField]: sortType };

  const where: Record<string, any> = {};

  if (query.name?.trim()) where.name = { $regex: query.name, $options: "i" };
  if (query.minPrice) where.pricePerNight = { $gte: Number(query.minPrice) };
  if (query.maxPrice)
    where.pricePerNight = { ...(where.pricePerNight || {}), $lte: Number(query.maxPrice) };
  if (query.capacity) where.capacity = { $gte: Number(query.capacity) };

  const roomTypes = await RoomType.find(where)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort(sortObject);

  const count = await RoomType.countDocuments(where);

  return {
    roomTypes,
    pagination: {
      totalRecord: count,
      limit,
      page,
    },
  };
};

const getById = async (id: string) => {
  const roomType = await RoomType.findById(id);
  if (!roomType) throw createError(404, "Room type not found");
  return roomType;
};

const create = async (payload: any) => {
  const existing = await RoomType.findOne({ name: payload.name });
  if (existing) throw createError(400, "Room type with this name already exists");

  const roomType = new RoomType({
    name: payload.name,
    description: payload.description,
    pricePerNight: payload.pricePerNight,
    capacity: payload.capacity,
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

  await roomType.save();
  return roomType;
};

const updateById = async (id: string, payload: any) => {
  const roomType = await getById(id);

  if (payload.name && payload.name !== roomType.name) {
    const dup = await RoomType.findOne({ name: payload.name, _id: { $ne: id } });
    if (dup) throw createError(400, "Another room type with this name already exists");
  }

  const cleanUpdates = Object.fromEntries(
    Object.entries(payload).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
  );

  Object.assign(roomType, cleanUpdates);
  await roomType.save();
  return roomType;
};

const deleteById = async (id: string) => {
  const roomType = await getById(id);
  await roomType.deleteOne(); // xóa cứng, muốn soft delete thì đổi status = 'deleted'
  return roomType;
};

export default {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
};
