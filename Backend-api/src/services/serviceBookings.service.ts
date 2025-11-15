import createError from "http-errors";
import ServiceBooking from "../models/serviceBookings.model";
import Booking from "../models/bookings.model";

// Hàm helper để tự động cập nhật trạng thái service booking
const autoUpdateServiceBookingStatus = async (serviceBooking: any) => {
  const now = new Date();
  const scheduledAt = new Date(serviceBooking.scheduledAt);
  
  // Nếu quá thời gian scheduledAt và status là "reserved", chuyển sang "completed"
  if (serviceBooking.status === "reserved" && scheduledAt < now) {
    serviceBooking.status = "completed";
    await serviceBooking.save();
  }
  
  // Nếu booking bị hoàn tiền hoặc hủy, chuyển service booking sang "cancelled"
  if (serviceBooking.bookingId) {
    const booking = await Booking.findById(serviceBooking.bookingId);
    if (booking && (booking.paymentStatus === "refunded" || booking.paymentStatus === "cancelled")) {
      if (serviceBooking.status !== "cancelled") {
        serviceBooking.status = "cancelled";
        await serviceBooking.save();
      }
    }
  }
  
  return serviceBooking;
};

const getAll = async (query: any) => {
  const pageNum = Number(query.page) || 1;
  const limitNum = Number(query.limit) || 10;

  const sortType = query.sort_type === "asc" ? 1 : -1;
  const sortBy = query.sort_by || "createdAt";
  const sortObject: any = { [sortBy]: sortType };

  // Build query conditions
  const where: any = {};
  if (query.bookingId) where.bookingId = query.bookingId;
  if (query.serviceId) where.serviceId = query.serviceId;
  if (query.customerId) where.customerId = query.customerId;
  if (query.status) where.status = query.status;

  // Tự động cập nhật trạng thái cho các service booking "reserved" đã quá thời gian
  const now = new Date();
  const updateReservedQuery: any = {
    status: "reserved",
    scheduledAt: { $lt: now }
  };
  if (query.bookingId) updateReservedQuery.bookingId = query.bookingId;
  if (query.serviceId) updateReservedQuery.serviceId = query.serviceId;
  if (query.customerId) updateReservedQuery.customerId = query.customerId;
  
  await ServiceBooking.updateMany(
    updateReservedQuery,
    {
      $set: { status: "completed" }
    }
  );

  // Tự động cập nhật trạng thái cho các service booking có booking bị hoàn tiền/hủy
  const cancelledBookings = await Booking.find({
    paymentStatus: { $in: ["refunded", "cancelled"] }
  }).select("_id");
  
  if (cancelledBookings.length > 0) {
    const cancelledBookingIds = cancelledBookings.map(b => b._id);
    const updateCancelledQuery: any = {
      bookingId: { $in: cancelledBookingIds },
      status: { $ne: "cancelled" }
    };
    if (query.serviceId) updateCancelledQuery.serviceId = query.serviceId;
    if (query.customerId) updateCancelledQuery.customerId = query.customerId;
    
    await ServiceBooking.updateMany(
      updateCancelledQuery,
      {
        $set: { status: "cancelled" }
      }
    );
  }

  const serviceBookings = await ServiceBooking.find(where)
    .populate({
      path: "bookingId",
      select: "_id checkIn checkOut status paymentStatus guests guestInfo",
      populate: [
        {
          path: "roomId",
          select: "roomNumber typeId",
          populate: {
            path: "typeId",
            select: "name pricePerNight",
          },
        },
        {
          path: "customerId",
          select: "fullName email phoneNumber",
        },
      ],
    })
    .populate("serviceId", "name price unit description")
    .populate("customerId", "fullName email phoneNumber")
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .sort(sortObject)
    .lean(); // Chuyển đổi sang plain object để dễ xử lý

  // Thêm thông tin từ guestInfo vào booking nếu có
  const enhancedServiceBookings = serviceBookings.map((booking) => {
    const bookingData = booking.bookingId as any;
    const guestInfo = bookingData?.guestInfo;

    return {
      ...booking,
      bookingId: {
        ...bookingData,
        // Thêm thông tin từ guestInfo vào trong booking
        guestName: guestInfo?.fullName,
        idNumber: guestInfo?.idNumber,
        guestAge: guestInfo?.age,
        guestPhone: guestInfo?.phoneNumber,
        guestEmail: guestInfo?.email,
        // Giữ nguyên thông tin room và customer đã populate
        roomId: bookingData?.roomId,
        customerId: bookingData?.customerId,
      },
    };
  });

  const count = await ServiceBooking.countDocuments(where);

  return {
    serviceBookings: enhancedServiceBookings,
    pagination: {
      totalRecord: count,
      limit: limitNum,
      page: pageNum,
    },
  };
};

const getById = async (id: string) => {
  let serviceBooking = await ServiceBooking.findById(id);

  if (!serviceBooking) {
    throw createError(404, "Service booking not found");
  }

  // Tự động cập nhật trạng thái trước khi populate (chỉ update nếu cần)
  const now = new Date();
  const scheduledAt = new Date(serviceBooking.scheduledAt);
  
  // Nếu quá thời gian scheduledAt và status là "reserved", chuyển sang "completed"
  if (serviceBooking.status === "reserved" && scheduledAt < now) {
    serviceBooking.status = "completed";
    await serviceBooking.save();
  }
  
  // Nếu booking bị hoàn tiền hoặc hủy, chuyển service booking sang "cancelled"
  // Chỉ check nếu status chưa phải cancelled để tránh query không cần thiết
  if (serviceBooking.bookingId && serviceBooking.status !== "cancelled") {
    const booking = await Booking.findById(serviceBooking.bookingId);
    if (booking && (booking.paymentStatus === "refunded" || booking.paymentStatus === "cancelled")) {
      serviceBooking.status = "cancelled";
      await serviceBooking.save();
    }
  }

  // Populate sau khi đã update trạng thái
  // Chỉ populate bookingId nếu nó tồn tại
  if (serviceBooking.bookingId) {
    try {
      // Populate bookingId với tất cả thông tin cần thiết, kể cả khi booking đã bị hủy/hoàn thành
      await serviceBooking.populate({
        path: "bookingId",
        select: "_id checkIn checkOut status paymentStatus guestInfo guests guestCount services",
        populate: [
          {
            path: "roomId",
            select: "roomNumber typeId",
            populate: {
              path: "typeId",
              select: "name pricePerNight",
            },
          },
          {
            path: "customerId",
            select: "fullName email phoneNumber",
          },
        ],
      });
    } catch (error) {
      // Nếu populate booking thất bại (booking đã bị xóa), vẫn tiếp tục với các populate khác
      console.warn("Failed to populate bookingId:", error);
      // Không set bookingId về null, giữ nguyên để có thể hiển thị ID
    }
  }
  
  try {
    await serviceBooking.populate("serviceId", "name price description unit");
  } catch (error) {
    console.warn("Failed to populate serviceId:", error);
  }
  
  try {
    await serviceBooking.populate("customerId", "fullName email phoneNumber");
  } catch (error) {
    console.warn("Failed to populate customerId:", error);
  }

  // Nếu không có customerId nhưng có bookingId.customerId, gán lại
  const booking = serviceBooking.bookingId as any;
  if (!serviceBooking.customerId && booking?.customerId) {
    serviceBooking.customerId = booking.customerId;
  }

  return serviceBooking;
};

const create = async (payload: any) => {
  // Check if the service booking already exists
  const existingBooking = await ServiceBooking.findOne({
    bookingId: payload.bookingId,
    serviceId: payload.serviceId,
    scheduledAt: payload.scheduledAt,
  });

  if (existingBooking) {
    throw createError(400, "Dịch vụ đã được đặt cho khung giờ này");
  }

  const serviceBooking = new ServiceBooking({
    bookingId: payload.bookingId,
    serviceId: payload.serviceId,
    customerId: payload.customerId,
    guestName: payload.guestName || null,
    phoneNumber: payload.phoneNumber || null,
    scheduledAt: payload.scheduledAt,
    quantity: payload.quantity || 1,
    price: payload.price,
    status: payload.status || "reserved",
  });

  await serviceBooking.save();
  return serviceBooking;
};

const updateById = async (id: string, payload: any) => {
  const serviceBooking = await getById(id);

  // If updating scheduled time, check for conflicts
  if (
    payload.scheduledAt &&
    new Date(payload.scheduledAt).getTime() !==
      new Date(serviceBooking.scheduledAt).getTime()
  ) {
    const existingBooking = await ServiceBooking.findOne({
      _id: { $ne: id },
      serviceId: serviceBooking.serviceId,
      scheduledAt: payload.scheduledAt,
    });

    if (existingBooking) {
      throw createError(400, "Đã có đặt chỗ khác cho khung giờ này");
    }
  }
  const cleanUpdates = Object.fromEntries(
    Object.entries(payload).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined
    )
  );

  Object.assign(serviceBooking, cleanUpdates);
  await serviceBooking.save();
  return serviceBooking;
};

const deleteById = async (id: string) => {
  const serviceBooking = await getById(id);
  await serviceBooking.deleteOne();
  return serviceBooking;
};

export default {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
};
