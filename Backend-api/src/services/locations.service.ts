import createError from "http-errors";
import Location from "../models/locations.model";

/**
 * Lấy danh sách tất cả locations với các bộ lọc (name, type, types, status)
 * và phân trang. Tự động loại bỏ các location đã bị xóa (soft delete)
 */
const getAll = async (query: any) => {
  // Thiết lập phân trang
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  // Thiết lập sắp xếp
  const sortField = query.sort_by || "createdAt";
  const sortType = query.sort_type === "asc" ? 1 : -1;
  const sortObject: Record<string, 1 | -1> = { [sortField]: sortType };

  // Mặc định loại bỏ các location đã bị xóa
  const where: Record<string, any> = { status: { $ne: "deleted" } };

  // Lọc theo tên (tìm kiếm không phân biệt hoa thường)
  if (query.name?.trim()) {
    where.name = { $regex: query.name, $options: "i" };
  }

  // Lọc theo loại địa điểm (type)
  if (query.type) {
    where.type = query.type;
  }

  // Lọc theo nhiều loại địa điểm (dùng cho user preferences)
  if (query.types) {
    const typesArray = query.types.split(',').map((type: string) => type.trim());
    console.log('Filtering by types:', typesArray);
    where.type = { $in: typesArray };
  }

  // Lọc theo trạng thái (active/hidden)
  if (query.status) {
    where.status = query.status;
  }

  console.log('Final where clause:', where);
  console.log('Query parameters:', query);

  // Tìm locations với phân trang và sắp xếp
  const locations = await Location.find(where)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort(sortObject);

  // Đếm tổng số location để phân trang
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

/**
 * Lấy thông tin chi tiết của một location theo ID.
 * Tự động loại bỏ các location đã bị xóa
 */
const getById = async (id: string) => {
  const location = await Location.findById(id);
  // Nếu không tìm thấy hoặc đã bị xóa thì báo lỗi
  if (!location || location.status === "deleted") {
    throw createError(404, "Không tìm thấy địa điểm");
  }
  return location;
};

/**
 * Tạo location mới: kiểm tra trùng lặp tên và loại,
 * tạo location với các thông tin từ payload
 */
const create = async (payload: any) => {
  // Kiểm tra xem đã có location với cùng tên và loại chưa (không bao gồm đã xóa)
  const existing = await Location.findOne({
    name: payload.name,
    type: payload.type,
    status: { $ne: "deleted" },
  });
  // Nếu đã tồn tại thì báo lỗi
  if (existing) throw createError(400, "Địa điểm với tên và loại này đã tồn tại");

  // Tạo location mới với các thông tin từ payload
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

/**
 * Cập nhật location theo ID: kiểm tra trùng lặp nếu thay đổi tên/loại,
 * lọc bỏ các giá trị rỗng và cập nhật
 */
const updateById = async (id: string, payload: any) => {
  const location = await getById(id);

  // Kiểm tra nếu thay đổi tên hoặc loại có gây trùng lặp với location khác không
  if ((payload.name && payload.name !== location.name) || (payload.type && payload.type !== location.type)) {
    const duplicate = await Location.findOne({
      name: payload.name || location.name,
      type: payload.type || location.type,
      _id: { $ne: id }, // Loại trừ chính location đang cập nhật
      status: { $ne: "deleted" },
    });
    // Nếu tìm thấy location trùng lặp thì báo lỗi
    if (duplicate) throw createError(400, "Đã có địa điểm khác với tên và loại này");
  }

  // Lọc bỏ các giá trị rỗng, null hoặc undefined để chỉ cập nhật các trường hợp lệ
  const cleanUpdates = Object.fromEntries(
    Object.entries(payload).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
  );

  // Cập nhật location với các giá trị đã lọc
  Object.assign(location, cleanUpdates);
  await location.save();
  return location;
};

/**
 * Xóa location theo ID: thực hiện soft delete bằng cách đặt status = "deleted"
 */
const deleteById = async (id: string) => {
  const location = await getById(id);
  // Soft delete: chỉ đánh dấu status = "deleted" thay vì xóa thật
  location.status = "deleted";
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
