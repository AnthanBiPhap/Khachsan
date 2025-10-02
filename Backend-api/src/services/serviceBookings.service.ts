import createError from "http-errors";
import ServiceBooking from "../models/serviceBookings.model";

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
  const serviceBooking = await ServiceBooking.findById(id)
    .populate({
      path: "bookingId",
      select: "_id checkIn checkOut status guestInfo guests",
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
    .populate("serviceId", "name price description unit")
    .populate("customerId", "fullName email phoneNumber");

  if (!serviceBooking) {
    throw createError(404, "Service booking not found");
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
