import createError from "http-errors";
import Room from "../models/rooms.model";
import Booking from "../models/bookings.model";
import GroupBooking from "../models/groupBooking.model";

/**
 * Lấy danh sách tất cả phòng với các bộ lọc (roomNumber, typeId, status)
 * và phân trang. Bao gồm thông tin chi tiết về loại phòng
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
  // Lọc theo số phòng (tìm kiếm không phân biệt hoa thường)
  if (query.roomNumber?.trim())
    where.roomNumber = { $regex: query.roomNumber, $options: "i" };
  // Lọc theo loại phòng
  if (query.typeId) where.typeId = query.typeId;
  // Lọc theo trạng thái
  if (query.status) where.status = query.status;

  // Tìm phòng với populate thông tin loại phòng và phân trang
  const rooms = await Room.find(where)
    .populate(
      "typeId",
      "name pricePerNight extraHourPrice maxExtendHours capacity"
    )
    .skip((page - 1) * limit)
    .limit(limit)
    .sort(sortObject);

  // Đếm tổng số phòng để phân trang
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

/**
 * Lấy thông tin chi tiết của một phòng theo ID,
 * bao gồm thông tin loại phòng
 */
const getById = async (id: string) => {
  const room = await Room.findById(id).populate(
    "typeId",
    "name pricePerNight extraHourPrice maxExtendHours capacity"
  );
  // Nếu không tìm thấy phòng thì báo lỗi
  if (!room) throw createError(404, "Không tìm thấy phòng");
  return room;
};

/**
 * Tạo phòng mới: kiểm tra trùng lặp số phòng,
 * tạo phòng với các thông tin từ payload
 */
const create = async (payload: any) => {
  // Kiểm tra xem đã có phòng với số phòng này chưa
  const existing = await Room.findOne({ roomNumber: payload.roomNumber });
  // Nếu đã tồn tại thì báo lỗi
  if (existing) throw createError(400, "Phòng với số phòng này đã tồn tại");

  // Tạo phòng mới với các thông tin từ payload
  const room = new Room({
    roomNumber: payload.roomNumber,
    typeId: payload.typeId,
    status: payload.status || "available", // Mặc định là available
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

/**
 * Cập nhật phòng theo ID: kiểm tra trùng lặp số phòng nếu thay đổi,
 * kiểm tra booking active trước khi đổi trạng thái,
 * lọc bỏ các giá trị rỗng và cập nhật
 */
const updateById = async (id: string, payload: any) => {
  const room = await getById(id);

  // Kiểm tra nếu thay đổi số phòng có gây trùng lặp với phòng khác không
  if (payload.roomNumber && payload.roomNumber !== room.roomNumber) {
    const dup = await Room.findOne({
      roomNumber: payload.roomNumber,
      _id: { $ne: id }, // Loại trừ chính phòng đang cập nhật
    });
    // Nếu tìm thấy phòng trùng lặp thì báo lỗi
    if (dup)
      throw createError(400, "Đã có phòng khác với số phòng này");
  }

  // Kiểm tra trạng thái trước khi đổi
  if (payload.status && payload.status !== room.status) {
    const newStatus = payload.status;
    const now = new Date();

    // Nếu đổi sang maintenance hoặc unavailable, cần check xem phòng có booking active không
    if (newStatus === 'maintenance' || newStatus === 'unavailable') {
      // Kiểm tra booking thường đang hoạt động (chưa kết thúc và chưa bị hủy)
      const activeBooking = await Booking.findOne({
        roomId: id,
        paymentStatus: { $ne: "cancelled" },
        checkOut: { $gt: now }, // Booking chưa kết thúc
      });

      // Nếu có booking đang hoạt động thì không cho phép đổi trạng thái
      if (activeBooking) {
        throw createError(
          400,
          `Không thể đổi trạng thái phòng sang "${newStatus === 'maintenance' ? 'Bảo trì' : 'Không khả dụng'}" vì phòng đang có booking đang hoạt động`
        );
      }

      // Kiểm tra group booking đang hoạt động (chưa kết thúc và chưa bị hủy/từ chối/hoàn tiền)
      const activeGroupBooking = await GroupBooking.findOne({
        allocatedRoomIds: id,
        status: { $nin: ["cancelled", "rejected", "refunded"] },
        checkOut: { $gt: now }, // Group booking chưa kết thúc
      });

      // Nếu có group booking đang hoạt động thì không cho phép đổi trạng thái
      if (activeGroupBooking) {
        throw createError(
          400,
          `Không thể đổi trạng thái phòng sang "${newStatus === 'maintenance' ? 'Bảo trì' : 'Không khả dụng'}" vì phòng đang có booking đoàn đang hoạt động`
        );
      }
    }

    // Nếu đổi từ occupied/checked_in sang available, cần check xem có booking trong tương lai không
    if ((room.status === 'occupied' || room.status === 'checked_in') && newStatus === 'available') {
      // Kiểm tra booking thường trong tương lai
      const futureBooking = await Booking.findOne({
        roomId: id,
        paymentStatus: { $ne: "cancelled" },
        checkIn: { $gt: now }, // Booking trong tương lai
      });

      // Nếu có booking trong tương lai thì không cho phép đổi sang available
      if (futureBooking) {
        throw createError(
          400,
          `Không thể đổi trạng thái phòng sang "Sẵn sàng" vì phòng đã có booking trong tương lai`
        );
      }

      // Kiểm tra group booking trong tương lai
      const futureGroupBooking = await GroupBooking.findOne({
        allocatedRoomIds: id,
        status: { $nin: ["cancelled", "rejected", "refunded"] },
        checkIn: { $gt: now }, // Group booking trong tương lai
      });

      // Nếu có group booking trong tương lai thì không cho phép đổi sang available
      if (futureGroupBooking) {
        throw createError(
          400,
          `Không thể đổi trạng thái phòng sang "Sẵn sàng" vì phòng đã có booking đoàn trong tương lai`
        );
      }
    }
  }

  // Lọc bỏ các giá trị rỗng, null hoặc undefined để chỉ cập nhật các trường hợp lệ
  const cleanUpdates = Object.fromEntries(
    Object.entries(payload).filter(
      ([_, v]) => v !== "" && v !== null && v !== undefined
    )
  );

  // Cập nhật phòng với các giá trị đã lọc
  Object.assign(room, cleanUpdates);
  await room.save();
  return room.populate("typeId", "name pricePerNight capacity");
};

/**
 * Xóa phòng theo ID: thực hiện xóa cứng (hard delete)
 * Lưu ý: Nếu muốn soft delete thì nên dùng updateById để đổi status = 'deleted'
 */
const deleteById = async (id: string) => {
  const room = await getById(id);
  // Xóa cứng phòng (muốn soft delete thì đổi status = 'deleted')
  await room.deleteOne();
  return room;
};

/**
 * Lấy danh sách phòng còn trống dựa trên checkIn, checkOut và extendHours.
 * Kiểm tra overlap với booking thường và group booking đã được phân bổ,
 * loại bỏ các phòng đã bị book và chỉ trả về phòng có status = "available"
 * @param {Date | string} checkIn - Ngày giờ check-in
 * @param {Date | string} checkOut - Ngày giờ check-out
 * @param {number} extendHours - Số giờ mở rộng (mặc định 0)
 * @param {string} excludeBookingId - ID booking cần loại trừ (khi update booking)
 * @returns {Promise<any[]>} Danh sách phòng còn trống
 */
const getAvailableRooms = async (checkIn: Date | string, checkOut: Date | string, extendHours: number = 0, excludeBookingId?: string) => {
  // Normalize checkIn và checkOut để so sánh chính xác
  const normalizeCheckIn = (date: Date | string): Date => {
    const d = new Date(date);
    d.setHours(14, 0, 0, 0); // Check-in lúc 14:00
    return d;
  };

  const normalizeCheckOut = (date: Date | string, extraHours: number = 0): Date => {
    const d = new Date(date);
    d.setHours(12, 0, 0, 0); // Check-out lúc 12:00
    // Thêm extra hours nếu có
    if (extraHours > 0) {
      d.setHours(d.getHours() + extraHours);
    }
    return d;
  };

  // Normalize thời gian check-in và check-out để so sánh
  const searchCheckIn = normalizeCheckIn(checkIn);
  const searchCheckOut = normalizeCheckOut(checkOut, extendHours);

  // Load tất cả phòng với thông tin loại phòng
  const rooms = await Room.find({})
    .populate("typeId", "name pricePerNight extraHourPrice maxExtendHours capacity");

  const allRoomIds = rooms.map((r) => r._id);

  // Tìm các booking thường có overlap với khoảng thời gian tìm kiếm
  const bookingQuery: any = {
    roomId: { $in: allRoomIds },
    paymentStatus: { $ne: "cancelled" }, // Chỉ lấy booking chưa bị hủy
    checkIn: { $lt: searchCheckOut }, // Booking bắt đầu trước khi search kết thúc
    checkOut: { $gt: searchCheckIn }, // Booking kết thúc sau khi search bắt đầu
  };
  
  // Nếu có excludeBookingId (khi update booking), loại trừ chính booking đó
  if (excludeBookingId) {
    bookingQuery._id = { $ne: excludeBookingId };
  }

  const bookings = await Booking.find(bookingQuery)
    .select("roomId checkIn checkOut paymentStatus");

  // Tìm các group booking đã được allocate có overlap với khoảng thời gian tìm kiếm
  const groupBookingQuery: any = {
    status: { $nin: ["cancelled", "rejected", "refunded"] }, // Chỉ lấy group booking chưa bị hủy/từ chối/hoàn tiền
    allocatedRoomIds: { $in: allRoomIds },
    checkIn: { $lt: searchCheckOut }, // Group booking bắt đầu trước khi search kết thúc
    checkOut: { $gt: searchCheckIn }, // Group booking kết thúc sau khi search bắt đầu
  };

  const groupBookings = await GroupBooking.find(groupBookingQuery)
    .select("allocatedRoomIds checkIn checkOut status");

  // Tạo map các phòng đã bị book để đánh dấu
  const bookedRoomsMap = new Map<string, boolean>();

  // Thêm các phòng từ Booking thường vào map
  bookings.forEach((b: any) => {
    if (b.roomId) {
      const roomId = String(b.roomId);
      const bookingCheckIn = normalizeCheckIn(b.checkIn);
      // Booking thường có thể có extra hours, lấy thời gian check-out lớn hơn
      const bookingCheckOutNormalized = normalizeCheckOut(b.checkOut);
      const bookingCheckOutOriginal = new Date(b.checkOut);
      const bookingCheckOut = bookingCheckOutOriginal > bookingCheckOutNormalized
        ? bookingCheckOutOriginal
        : bookingCheckOutNormalized;

      // Kiểm tra overlap: booking bắt đầu trước khi search kết thúc và booking kết thúc sau khi search bắt đầu
      const isOverlap = bookingCheckIn < searchCheckOut && bookingCheckOut > searchCheckIn;
      if (isOverlap) {
        bookedRoomsMap.set(roomId, true);
      }
    }
  });

  // Thêm các phòng từ GroupBooking đã được allocate vào map
  groupBookings.forEach((gb: any) => {
    if (gb.allocatedRoomIds && Array.isArray(gb.allocatedRoomIds)) {
      const gbCheckIn = normalizeCheckIn(gb.checkIn);
      const gbCheckOut = normalizeCheckOut(gb.checkOut);

      // Kiểm tra overlap: group booking bắt đầu trước khi search kết thúc và group booking kết thúc sau khi search bắt đầu
      const isOverlap = gbCheckIn < searchCheckOut && gbCheckOut > searchCheckIn;
      if (isOverlap) {
        // Đánh dấu tất cả các phòng trong group booking là đã bị book
        gb.allocatedRoomIds.forEach((roomId: any) => {
          bookedRoomsMap.set(String(roomId), true);
        });
      }
    }
  });

  // Lọc các phòng khả dụng (không có trong bookedRoomsMap và có status available)
  const availableRooms = rooms.filter((r: any) => {
    // Loại bỏ phòng đã bị book (có trong bookedRoomsMap)
    if (bookedRoomsMap.has(String(r._id))) {
      return false;
    }
    // Chỉ lấy phòng có status available (loại bỏ maintenance, unavailable, occupied, checked_in)
    if (r.status !== "available") {
      return false;
    }
    return true;
  });

  return availableRooms;
};

export default {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
  getAvailableRooms,
};
