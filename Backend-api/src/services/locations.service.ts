import createError from "http-errors";
import Location from "../models/locations.model";

const getAll = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const sortField = query.sort_by || "createdAt";
  const sortType = query.sort_type === "asc" ? 1 : -1;
  const sortObject: Record<string, 1 | -1> = { [sortField]: sortType };

  const where: Record<string, any> = { status: { $ne: "deleted" } };

  // Filter by name
  if (query.name?.trim()) {
    where.name = { $regex: query.name, $options: "i" };
  }

  // Filter by type
  if (query.type) {
    where.type = query.type;
  }

  // Filter by status (active/hidden)
  if (query.status) {
    where.status = query.status;
  }

  const locations = await Location.find(where)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort(sortObject);

  const count = await Location.countDocuments(where);

  return {
    locations,
    pagination: {
      totalRecord: count,
      limit,
      page,
    },
  };
};

const getById = async (id: string) => {
  const location = await Location.findById(id);
  if (!location || location.status === "deleted") {
    throw createError(404, "Location not found");
  }
  return location;
};

const create = async (payload: any) => {
  const existing = await Location.findOne({
    name: payload.name,
    type: payload.type,
    status: { $ne: "deleted" },
  });
  if (existing) throw createError(400, "Location with this name and type already exists");

  const location = new Location({
    name: payload.name,
    type: payload.type,
    description: payload.description,
    address: payload.address,
    images: payload.images || [],
    ratingAvg: payload.ratingAvg || 0,
    status: payload.status || "active",
  });

  await location.save();
  return location;
};

const updateById = async (id: string, payload: any) => {
  const location = await getById(id);

  // Check if changing name+type would conflict with existing record
  if ((payload.name && payload.name !== location.name) || (payload.type && payload.type !== location.type)) {
    const duplicate = await Location.findOne({
      name: payload.name || location.name,
      type: payload.type || location.type,
      _id: { $ne: id },
      status: { $ne: "deleted" },
    });
    if (duplicate) throw createError(400, "Another location with this name and type already exists");
  }

  const cleanUpdates = Object.fromEntries(
    Object.entries(payload).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
  );

  Object.assign(location, cleanUpdates);
  await location.save();
  return location;
};

const deleteById = async (id: string) => {
  const location = await getById(id);
  location.status = "deleted"; // soft delete
  await location.save();
  return location;
};

export default {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
};
