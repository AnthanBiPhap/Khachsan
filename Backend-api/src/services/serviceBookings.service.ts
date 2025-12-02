import createError from "http-errors";
import ServiceBooking from "../models/serviceBookings.model";
import Booking from "../models/bookings.model";

/**
 * Hàm helper để tự động cập nhật trạng thái service booking:
 * - Nếu quá thời gian scheduledAt và status là "reserved", chuyển sang "completed"
 * - Nếu booking bị hoàn tiền hoặc hủy, chuyển service booking sang "cancelled"
 */
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
    // Nếu booking bị hoàn tiền hoặc hủy thì cập nhật service booking thành cancelled
    if (booking && (booking.paymentStatus === "refunded" || booking.paymentStatus === "cancelled")) {
      if (serviceBooking.status !== "cancelled") {
        serviceBooking.status = "cancelled";
        await serviceBooking.save();
      }
    }
  }
  
  return serviceBooking;
};

/**
 * Lấy danh sách tất cả service bookings với các bộ lọc (bookingId, serviceId, customerId, status)
 * và phân trang. Tự động cập nhật trạng thái cho các service booking quá thời gian
 * hoặc có booking bị hoàn tiền/hủy. Bao gồm thông tin chi tiết về booking, service và customer
 */
const getAll = async (query: any) => {
  // Thiết lập phân trang
  const pageNum = Number(query.page) || 1;
  const limitNum = Number(query.limit) || 10;

  // Thiết lập sắp xếp
  const sortType = query.sort_type === "asc" ? 1 : -1;
  const sortBy = query.sort_by || "createdAt";
  const sortObject: any = { [sortBy]: sortType };

  // Xây dựng điều kiện tìm kiếm
  const where: any = {};
  // Lọc theo bookingId nếu có
  if (query.bookingId) where.bookingId = query.bookingId;
  // Lọc theo serviceId nếu có
  if (query.serviceId) where.serviceId = query.serviceId;
  // Lọc theo customerId nếu có
  if (query.customerId) where.customerId = query.customerId;
  // Lọc theo status nếu có
  if (query.status) where.status = query.status;

  // Tự động cập nhật trạng thái cho các service booking "reserved" đã quá thời gian scheduledAt
  const now = new Date();
  const updateReservedQuery: any = {
    status: "reserved",
    scheduledAt: { $lt: now } // Đã quá thời gian scheduled
  };
  // Áp dụng các filter từ query nếu có
  if (query.bookingId) updateReservedQuery.bookingId = query.bookingId;
  if (query.serviceId) updateReservedQuery.serviceId = query.serviceId;
  if (query.customerId) updateReservedQuery.customerId = query.customerId;
  
  // Cập nhật tất cả service booking "reserved" đã quá thời gian thành "completed"
  await ServiceBooking.updateMany(
    updateReservedQuery,
    {
      $set: { status: "completed" }
    }
  );

  // Tự động cập nhật trạng thái cho các service booking có booking bị hoàn tiền/hủy
  const cancelledBookings = await Booking.find({
    paymentStatus: { $in: ["refunded", "cancelled"] } // Tìm các booking đã bị hoàn tiền hoặc hủy
  }).select("_id");
  
  // Nếu có booking bị hoàn tiền/hủy thì cập nhật service booking tương ứng
  if (cancelledBookings.length > 0) {
    const cancelledBookingIds = cancelledBookings.map(b => b._id);
    const updateCancelledQuery: any = {
      bookingId: { $in: cancelledBookingIds }, // Service booking thuộc các booking đã bị hủy
      status: { $ne: "cancelled" } // Chỉ cập nhật những service booking chưa bị cancelled
    };
    // Áp dụng các filter từ query nếu có
    if (query.serviceId) updateCancelledQuery.serviceId = query.serviceId;
    if (query.customerId) updateCancelledQuery.customerId = query.customerId;
    
    // Cập nhật tất cả service booking có booking bị hoàn tiền/hủy thành "cancelled"
    await ServiceBooking.updateMany(
      updateCancelledQuery,
      {
        $set: { status: "cancelled" }
      }
    );
  }

  // Tìm service bookings với populate thông tin booking, service, customer và phân trang
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

  // Thêm thông tin từ guestInfo vào booking nếu có (cho khách walk_in)
  const enhancedServiceBookings = serviceBookings.map((booking) => {
    const bookingData = booking.bookingId as any;
    const guestInfo = bookingData?.guestInfo;

    return {
      ...booking,
      bookingId: {
        ...bookingData,
        // Thêm thông tin từ guestInfo vào trong booking (cho khách walk_in không có tài khoản)
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

  // Đếm tổng số service booking để phân trang
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

/**
 * Lấy thông tin chi tiết của một service booking theo ID.
 * Tự động cập nhật trạng thái trước khi populate (nếu cần).
 * Bao gồm thông tin chi tiết về booking, service và customer
 */
const getById = async (id: string) => {
  let serviceBooking = await ServiceBooking.findById(id);

  // Nếu không tìm thấy service booking thì báo lỗi
  if (!serviceBooking) {
    throw createError(404, "Không tìm thấy đặt dịch vụ");
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
    // Nếu booking bị hoàn tiền hoặc hủy thì cập nhật service booking thành cancelled
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
  
  // Populate serviceId với thông tin dịch vụ
  try {
    await serviceBooking.populate("serviceId", "name price description unit");
  } catch (error) {
    console.warn("Failed to populate serviceId:", error);
  }
  
  // Populate customerId với thông tin khách hàng
  try {
    await serviceBooking.populate("customerId", "fullName email phoneNumber");
  } catch (error) {
    console.warn("Failed to populate customerId:", error);
  }

  // Nếu không có customerId nhưng có bookingId.customerId, gán lại từ booking
  const booking = serviceBooking.bookingId as any;
  if (!serviceBooking.customerId && booking?.customerId) {
    serviceBooking.customerId = booking.customerId;
  }

  return serviceBooking;
};

/**
 * Tạo service booking mới: kiểm tra trùng lặp (bookingId, serviceId, scheduledAt),
 * tạo service booking với các thông tin từ payload
 */
const create = async (payload: any) => {
  // Kiểm tra xem đã có service booking với cùng bookingId, serviceId và scheduledAt chưa
  const existingBooking = await ServiceBooking.findOne({
    bookingId: payload.bookingId,
    serviceId: payload.serviceId,
    scheduledAt: payload.scheduledAt,
  });

  // Nếu đã tồn tại thì báo lỗi
  if (existingBooking) {
    throw createError(400, "Dịch vụ đã được đặt cho khung giờ này");
  }

  // Tạo service booking mới với các thông tin từ payload
  const serviceBooking = new ServiceBooking({
    bookingId: payload.bookingId,
    serviceId: payload.serviceId,
    customerId: payload.customerId,
    guestName: payload.guestName || null,
    phoneNumber: payload.phoneNumber || null,
    scheduledAt: payload.scheduledAt,
    quantity: payload.quantity || 1, // Mặc định số lượng là 1
    price: payload.price,
    status: payload.status || "reserved", // Mặc định status là "reserved"
  });

  await serviceBooking.save();
  return serviceBooking;
};

/**
 * Cập nhật service booking theo ID: kiểm tra trùng lặp nếu thay đổi scheduledAt,
 * lọc bỏ các giá trị rỗng và cập nhật
 */
const updateById = async (id: string, payload: any) => {
  const serviceBooking = await getById(id);

  // Nếu cập nhật thời gian scheduled, kiểm tra xung đột với service booking khác
  if (
    payload.scheduledAt &&
    new Date(payload.scheduledAt).getTime() !==
      new Date(serviceBooking.scheduledAt).getTime()
  ) {
    // Kiểm tra xem đã có service booking khác với cùng serviceId và scheduledAt chưa
    const existingBooking = await ServiceBooking.findOne({
      _id: { $ne: id }, // Loại trừ chính service booking đang cập nhật
      serviceId: serviceBooking.serviceId,
      scheduledAt: payload.scheduledAt,
    });

    // Nếu tìm thấy service booking trùng lặp thì báo lỗi
    if (existingBooking) {
      throw createError(400, "Đã có đặt chỗ khác cho khung giờ này");
    }
  }
  
  // Lọc bỏ các giá trị rỗng, null hoặc undefined để chỉ cập nhật các trường hợp lệ
  const cleanUpdates = Object.fromEntries(
    Object.entries(payload).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined
    )
  );

  // Cập nhật service booking với các giá trị đã lọc
  Object.assign(serviceBooking, cleanUpdates);
  await serviceBooking.save();
  return serviceBooking;
};

/**
 * Xóa service booking theo ID: thực hiện xóa cứng (hard delete)
 */
const deleteById = async (id: string) => {
  const serviceBooking = await getById(id);
  // Xóa cứng service booking
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
