import createError from "http-errors";
import RoomType from "../models/roomTypes.model";
import Room from "../models/rooms.model";

/**
 * Lấy danh sách tất cả loại phòng với các bộ lọc (name, minPrice, maxPrice, capacity)
 * và phân trang
 */
const getAll = async (query: any) => {
  // Thiết lập phân trang
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  // Thiết lập sắp xếp
  const sortField = query.sort_by || "createdAt";
  const sortType = query.sort_type === "asc" ? 1 : -1;
  const sortObject: Record<string, 1 | -1> = { [sortField]: sortType };

  const where: Record<string, any> = {};

  // Lọc theo tên loại phòng (tìm kiếm không phân biệt hoa thường)
  if (query.name?.trim()) where.name = { $regex: query.name, $options: "i" };
  // Lọc theo giá tối thiểu
  if (query.minPrice) where.pricePerNight = { $gte: Number(query.minPrice) };
  // Lọc theo giá tối đa (kết hợp với minPrice nếu có)
  if (query.maxPrice)
    where.pricePerNight = { ...(where.pricePerNight || {}), $lte: Number(query.maxPrice) };
  // Lọc theo sức chứa tối thiểu
  if (query.capacity) where.capacity = { $gte: Number(query.capacity) };

  // Tìm loại phòng với phân trang
  const roomTypes = await RoomType.find(where)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort(sortObject);

  // Đếm tổng số loại phòng để phân trang
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

/**
 * Lấy thông tin chi tiết của một loại phòng theo ID
 */
const getById = async (id: string) => {
  const roomType = await RoomType.findById(id);
  // Nếu không tìm thấy loại phòng thì báo lỗi
  if (!roomType) throw createError(404, "Không tìm thấy loại phòng");
  return roomType;
};

/**
 * Tạo loại phòng mới: kiểm tra trùng lặp tên,
 * tạo loại phòng với các thông tin từ payload
 */
const create = async (payload: any) => {
  // Kiểm tra xem đã có loại phòng với tên này chưa
  const existing = await RoomType.findOne({ name: payload.name });
  // Nếu đã tồn tại thì báo lỗi
  if (existing) throw createError(400, "Loại phòng với tên này đã tồn tại");

  // Tạo loại phòng mới với các thông tin từ payload
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

/**
 * Cập nhật loại phòng theo ID: kiểm tra xem có phòng nào đang sử dụng loại phòng này không,
 * kiểm tra trùng lặp tên nếu thay đổi, lọc bỏ các giá trị rỗng và cập nhật
 */
const updateById = async (id: string, payload: any) => {
  const roomType = await getById(id);

  // Kiểm tra xem có phòng nào đang sử dụng loại phòng này không
  const roomsUsingThisType = await Room.find({ typeId: id });
  // Nếu có phòng đang sử dụng thì không cho phép chỉnh sửa
  if (roomsUsingThisType.length > 0) {
    const roomNumbers = roomsUsingThisType.map(r => r.roomNumber).join(', ');
    throw createError(
      400,
      `Không thể chỉnh sửa loại phòng này vì có ${roomsUsingThisType.length} phòng đang sử dụng: ${roomNumbers}`
    );
  }

  // Kiểm tra nếu thay đổi tên có gây trùng lặp với loại phòng khác không
  if (payload.name && payload.name !== roomType.name) {
    const dup = await RoomType.findOne({ name: payload.name, _id: { $ne: id } }); // Loại trừ chính loại phòng đang cập nhật
    // Nếu tìm thấy loại phòng trùng lặp thì báo lỗi
    if (dup) throw createError(400, "Đã có loại phòng khác với tên này");
  }

  // Lọc bỏ các giá trị rỗng, null hoặc undefined để chỉ cập nhật các trường hợp lệ
  const cleanUpdates = Object.fromEntries(
    Object.entries(payload).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
  );

  // Cập nhật loại phòng với các giá trị đã lọc
  Object.assign(roomType, cleanUpdates);
  await roomType.save();
  return roomType;
};

/**
 * Xóa loại phòng theo ID: thực hiện xóa cứng (hard delete)
 * Lưu ý: Nếu muốn soft delete thì nên dùng updateById để đổi status = 'deleted'
 */
const deleteById = async (id: string) => {
  const roomType = await getById(id);
  // Xóa cứng loại phòng (muốn soft delete thì đổi status = 'deleted')
  await roomType.deleteOne();
  return roomType;
};

export default {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
};
