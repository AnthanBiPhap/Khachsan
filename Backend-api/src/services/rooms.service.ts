import createError from "http-errors";
import Room from "../models/rooms.model";
import Booking from "../models/bookings.model";
import GroupBooking from "../models/groupBooking.model";

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

// Lấy danh sách phòng còn trống dựa trên checkIn, checkOut và extendHours
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

  const searchCheckIn = normalizeCheckIn(checkIn);
  const searchCheckOut = normalizeCheckOut(checkOut, extendHours);

  // Load tất cả phòng
  const rooms = await Room.find({})
    .populate("typeId", "name pricePerNight extraHourPrice maxExtendHours capacity");

  const allRoomIds = rooms.map((r) => r._id);

  // Tìm các booking thường có overlap
  const bookingQuery: any = {
    roomId: { $in: allRoomIds },
    paymentStatus: { $ne: "cancelled" },
    checkIn: { $lt: searchCheckOut },
    checkOut: { $gt: searchCheckIn },
  };
  
  // Nếu có excludeBookingId (khi update), loại trừ chính nó
  if (excludeBookingId) {
    bookingQuery._id = { $ne: excludeBookingId };
  }

  const bookings = await Booking.find(bookingQuery)
    .select("roomId checkIn checkOut paymentStatus");

  // Tìm các group booking đã được allocate có overlap
  const groupBookingQuery: any = {
    status: { $nin: ["cancelled", "rejected", "refunded"] },
    allocatedRoomIds: { $in: allRoomIds },
    checkIn: { $lt: searchCheckOut },
    checkOut: { $gt: searchCheckIn },
  };

  const groupBookings = await GroupBooking.find(groupBookingQuery)
    .select("allocatedRoomIds checkIn checkOut status");

  // Tạo map các phòng đã bị book
  const bookedRoomsMap = new Map<string, boolean>();

  // Thêm các phòng từ Booking thường
  bookings.forEach((b: any) => {
    if (b.roomId) {
      const roomId = String(b.roomId);
      const bookingCheckIn = normalizeCheckIn(b.checkIn);
      // Booking thường có thể có extra hours
      const bookingCheckOutNormalized = normalizeCheckOut(b.checkOut);
      const bookingCheckOutOriginal = new Date(b.checkOut);
      const bookingCheckOut = bookingCheckOutOriginal > bookingCheckOutNormalized
        ? bookingCheckOutOriginal
        : bookingCheckOutNormalized;

      // Kiểm tra overlap
      const isOverlap = bookingCheckIn < searchCheckOut && bookingCheckOut > searchCheckIn;
      if (isOverlap) {
        bookedRoomsMap.set(roomId, true);
      }
    }
  });

  // Thêm các phòng từ GroupBooking đã được allocate
  groupBookings.forEach((gb: any) => {
    if (gb.allocatedRoomIds && Array.isArray(gb.allocatedRoomIds)) {
      const gbCheckIn = normalizeCheckIn(gb.checkIn);
      const gbCheckOut = normalizeCheckOut(gb.checkOut);

      // Kiểm tra overlap
      const isOverlap = gbCheckIn < searchCheckOut && gbCheckOut > searchCheckIn;
      if (isOverlap) {
        gb.allocatedRoomIds.forEach((roomId: any) => {
          bookedRoomsMap.set(String(roomId), true);
        });
      }
    }
  });

  // Lọc các phòng khả dụng (không có trong bookedRoomsMap)
  const availableRooms = rooms.filter((r: any) => !bookedRoomsMap.has(String(r._id)));

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
