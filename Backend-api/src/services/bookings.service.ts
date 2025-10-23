import createError from "http-errors";
import Booking from "../models/bookings.model";
import ServiceBooking from "../models/serviceBookings.model";
import invoicesService from "./invoices.service";
import bookingStatusService from "./bookingStatus.service";
import Invoice from "../models/invoices.model";
import User from "../models/users.model";

// Lấy tất cả booking với filter + pagination
const getAll = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const sortField = query.sort_by || "createdAt";
  const sortType = query.sort_type === "asc" ? 1 : -1;
  const sortObject: Record<string, 1 | -1> = { [sortField]: sortType };

  const where: Record<string, any> = {};

  // filter theo customerId, roomId, paymentStatus
  if (query.customerId) where.customerId = query.customerId;
  if (query.roomId) where.roomId = query.roomId;
  if (query.paymentStatus) where.paymentStatus = query.paymentStatus;
  if (query.source) where.source = query.source; // filter theo nguồn đặt

  // luôn loại booking đã huỷ
  where.paymentStatus = { $ne: "cancelled" };

  // filter theo ngày (kiểm tra overlap chuẩn)
  if (query.startDate && query.endDate) {
    const start = new Date(query.startDate);
    const end = new Date(query.endDate);

    where.$and = [
      { checkIn: { $lt: end } }, // checkIn < searchCheckOut
      { checkOut: { $gt: start } }, // checkOut > searchCheckIn
    ];
  }

  // filter theo guests.fullName (khách walk-in)
  if (query.guestName) {
    where["guests.fullName"] = { $regex: query.guestName, $options: "i" };
  }

  const bookings = await Booking.find(where)
    .populate("customerId", "fullName email phoneNumber")
    .populate("roomId", "roomNumber typeId")
    .skip((page - 1) * limit)
    .limit(limit)
    .sort(sortObject);

  const count = await Booking.countDocuments(where);

  return {
    bookings,
    pagination: { totalRecord: count, limit, page },
  };
};

// Lấy booking theo id
const getById = async (id: string) => {
  const booking = await Booking.findById(id)
    .populate("customerId", "fullName email phoneNumber")
    .populate("roomId", "roomNumber typeId");
  if (!booking) throw createError(404, "Booking not found");
  return booking;
};

// Tạo booking mới
const create = async (payload: any) => {
  const { roomId, checkIn, checkOut, services = [] } = payload;

  // check trùng phòng
  const conflict = await Booking.findOne({
    roomId,
    paymentStatus: { $ne: "cancelled" }, // hoặc $nin: ["cancelled"]
    checkIn: { $lt: new Date(checkOut) },
    checkOut: { $gt: new Date(checkIn) },
  });
  if (conflict)
    throw createError(400, "Phòng đã được đặt trong khoảng thời gian này");

  // Validate guests array
  if (!payload.guests || !Array.isArray(payload.guests) || payload.guests.length === 0) {
    throw createError(400, "Danh sách khách hàng là bắt buộc");
  }

  // Set isMainGuest for the first guest if not specified
  const guestsWithMainFlag = payload.guests.map((guest: any, index: number) => ({
    ...guest,
    isMainGuest: guest.isMainGuest !== undefined ? guest.isMainGuest : index === 0
  }));

  const booking = new Booking({
    customerId: payload.customerId || undefined,
    guests: guestsWithMainFlag,
    guestCount: payload.guests.length,
    roomId,
    checkIn,
    checkOut,
    totalPrice: payload.totalPrice,
    source: payload.source || (payload.customerId ? "online" : "walk_in"),
    paymentStatus: payload.paymentStatus || "pending",
    notes: payload.notes || "",
    services: services.map((s: any) => ({
      serviceId: s.serviceId,
      name: s.name,
      price: s.price,
      quantity: s.quantity,
    })),
  });

  try {
    const savedBooking = await booking.save();

    // Tạo các service booking nếu có
    if (services && services.length > 0) {
      const serviceBookings = services.map((service: any) => ({
        bookingId: savedBooking._id,
        serviceId: service.serviceId,
        customerId: payload.customerId || null,
        scheduledAt: new Date(checkIn),
        quantity: service.quantity || 1,
        price: service.price,
        status: "reserved",
      }));
      await ServiceBooking.insertMany(serviceBookings);
    }
    // Get main guest name for logging
    const mainGuest = guestsWithMainFlag.find((guest: any) => guest.isMainGuest);
    const mainGuestName = mainGuest?.fullName || "Guest";

    // Xác định actorName dựa trên loại khách hàng
    let actorName = "Guest";
    if (payload.customerId) {
      // Khách hàng online - sử dụng tên từ customerId (cần populate từ database)
      // Vì payload.customerId chỉ là ID, cần lấy thông tin từ database
      const customer = await User.findById(payload.customerId);
      actorName = customer?.fullName || mainGuestName;
    } else {
      // Khách hàng walk_in - sử dụng tên từ guests array
      actorName = mainGuestName;
    }

    await bookingStatusService.create({
      bookingId: savedBooking._id.toString(),
      actorId: payload.customerId || undefined,
      actorName: actorName,
      action: "pending", // trạng thái mặc định khi tạo booking
      note: "Khách hàng đã tạo booking",
    });
    // Tạo invoice (luôn tạo cho admin, hoặc khi đã thanh toán)
    let invoice = null;
    if (savedBooking.paymentStatus === "paid" || payload.source === "walk_in") {
      invoice = await invoicesService.create({
        bookingId: savedBooking._id,
        customerId: savedBooking.customerId?._id,
        totalAmount: savedBooking.totalPrice,
        status: savedBooking.paymentStatus === "paid" ? "paid" : "pending",
        issuedAt: new Date(),
      });
      console.log(`✅ Đã tạo invoice mới cho booking ${savedBooking._id}: totalAmount=${savedBooking.totalPrice}`);
    }

    await savedBooking.populate("customerId", "fullName email phoneNumber");
    await savedBooking.populate("roomId", "roomNumber typeId");

    // Trả về booking + invoice
    return { booking: savedBooking, invoice };
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};

// Cập nhật booking
const updateById = async (id: string, payload: any) => {
  const booking = await getById(id);

  const roomId = payload.roomId ?? booking.roomId;
  const checkIn = payload.checkIn ?? booking.checkIn;
  const checkOut = payload.checkOut ?? booking.checkOut;
  const services = payload.services || booking.services || [];

  // check trùng phòng
  const conflict = await Booking.findOne({
    _id: { $ne: id },
    roomId,
    status: { $nin: ["cancelled"] },
    checkIn: { $lt: new Date(checkOut) },
    checkOut: { $gt: new Date(checkIn) },
  });
  if (conflict)
    throw createError(400, "Phòng đã được đặt trong khoảng thời gian này");

  if (payload.services) {
    // 1. Xóa tất cả dịch vụ cũ của booking này
    await ServiceBooking.deleteMany({ bookingId: id });

    // 2. Thêm các dịch vụ mới
    const serviceBookings = payload.services.map((service: any) => ({
      bookingId: id,
      serviceId: service.serviceId,
      customerId: payload.customerId || booking.customerId || null,
      serviceName: service.name,
      price: service.price,
      quantity: service.quantity,
      totalPrice: service.price * service.quantity,
      bookingDate: new Date(),
      scheduledAt: new Date(), // Sử dụng thời gian hiện tại
      status: "reserved", // Sử dụng giá trị hợp lệ từ enum
      notes: service.notes || "",
    }));

    if (serviceBookings.length > 0) {
      await ServiceBooking.insertMany(serviceBookings);
    }
  }

  // Không cho phép đổi nguồn đặt (source) khi update
  if (payload && Object.prototype.hasOwnProperty.call(payload, 'source')) {
    delete payload.source;
  }
  // lọc payload hợp lệ
  const cleanUpdates = Object.fromEntries(
    Object.entries(payload).filter(
      ([k, v]) => k !== 'source' && v !== "" && v !== null && v !== undefined
    )
  );

  const previousPaymentStatus = (booking as any).paymentStatus;
  const previousTotalPrice = (booking as any).totalPrice;
  
  console.log(`🔄 Updating booking ${booking._id}:`, {
    previousPaymentStatus,
    newPaymentStatus: cleanUpdates.paymentStatus,
    previousTotalPrice,
    newTotalPrice: cleanUpdates.totalPrice,
    cleanUpdates,
    bookingSource: booking.source,
    hasCustomerId: !!booking.customerId
  });
  
  Object.assign(booking, cleanUpdates);
  const updatedBooking = await booking.save();

  try {
    await updatedBooking.populate("customerId", "fullName email phoneNumber");
    await updatedBooking.populate("roomId", "roomNumber typeId");
  } catch (populateError) {
    console.error('❌ Lỗi populate booking:', populateError);
    // Không throw error ở đây, chỉ log để không làm crash API
  }

  // Đồng bộ invoice với booking khi có thay đổi
  const totalPriceChanged = updatedBooking.totalPrice !== previousTotalPrice;
  if (updatedBooking.paymentStatus !== previousPaymentStatus || totalPriceChanged) {
    try {
      console.log(`🔄 Booking ${updatedBooking._id} thay đổi:`, {
        paymentStatus: `${previousPaymentStatus} → ${updatedBooking.paymentStatus}`,
        totalPrice: `${previousTotalPrice} → ${updatedBooking.totalPrice}`,
        totalPriceChanged
      });
      
      const existingInvoice = await Invoice.findOne({ bookingId: updatedBooking._id });
      
      if (existingInvoice) {
        // Cập nhật invoice theo booking (cả status và totalAmount)
        await invoicesService.updateById(existingInvoice._id.toString(), { 
          status: updatedBooking.paymentStatus,
          totalAmount: updatedBooking.totalPrice
        });
        console.log(`✅ Đã cập nhật invoice ${existingInvoice._id}: status=${updatedBooking.paymentStatus}, totalAmount=${updatedBooking.totalPrice}`);
      } else if (updatedBooking.paymentStatus === "paid") {
        // Tạo invoice mới nếu booking = paid và chưa có invoice
        await invoicesService.create({
          bookingId: updatedBooking._id,
          customerId: (updatedBooking as any).customerId?._id,
          totalAmount: updatedBooking.totalPrice,
          status: "paid",
          issuedAt: new Date(),
        });
        console.log(`✅ Đã tạo invoice mới cho booking ${updatedBooking._id}: totalAmount=${updatedBooking.totalPrice}`);
      }
    } catch (invoiceError) {
      console.error('❌ Lỗi đồng bộ invoice:', invoiceError);
      // Không throw error ở đây để không làm crash API
    }
  }

  // Đồng bộ payment với booking khi paymentStatus thay đổi
  if (updatedBooking.paymentStatus !== previousPaymentStatus) {
    try {
      const paymentService = require('./payments.service').default;
      await paymentService.syncPaymentWithBooking(updatedBooking._id.toString(), updatedBooking.paymentStatus);
      console.log(`✅ Đồng bộ payment cho booking ${updatedBooking._id}: ${previousPaymentStatus} → ${updatedBooking.paymentStatus}`);
    } catch (error) {
      console.error(`❌ Lỗi đồng bộ payment cho booking ${updatedBooking._id}:`, error);
      // Không throw error để không làm crash API
    }
  }

  // Log refund transition
  if (updatedBooking.paymentStatus === "refunded" && previousPaymentStatus !== "refunded") {
    // Xác định actorName dựa trên loại khách hàng
    let actorName = "Admin";
    if (updatedBooking.customerId) {
      // Khách hàng online - lấy tên từ database
      const customer = await User.findById(updatedBooking.customerId);
      actorName = customer?.fullName || "Khách hàng online";
    } else {
      // Khách hàng walk_in - sử dụng tên từ guests array
      const mainGuest = updatedBooking.guests?.find((g: any) => g.isMainGuest);
      actorName = mainGuest?.fullName || "Khách hàng walk-in";
    }

    await bookingStatusService.create({
      bookingId: updatedBooking._id.toString(),
      actorId: updatedBooking.customerId || undefined,
      actorName: actorName,
      action: "refunded",
      note: payload.note || "Hoàn tiền cho đặt phòng",
    });
  }

  // Log refund requested transition (khách gửi yêu cầu)
  if (updatedBooking.paymentStatus === "refund_requested" && previousPaymentStatus !== "refund_requested") {
    try {
      // Xác định actorName dựa trên loại khách hàng
      let actorName = "Admin";
      if (updatedBooking.customerId) {
        // Khách hàng online - lấy tên từ database
        const customer = await User.findById(updatedBooking.customerId);
        actorName = customer?.fullName || "Khách hàng online";
      } else {
        // Khách hàng walk_in - sử dụng tên từ guests array
        const mainGuest = updatedBooking.guests?.find((g: any) => g.isMainGuest);
        actorName = mainGuest?.fullName || "Khách hàng walk-in";
      }

      await bookingStatusService.create({
        bookingId: updatedBooking._id.toString(),
        actorId: updatedBooking.customerId || undefined,
        actorName: actorName,
        action: "refund_requested",
        note: payload.note || "Khách hàng yêu cầu hoàn tiền",
      });
      console.log(`✅ Đã tạo booking status log cho refund_requested: ${updatedBooking._id}`);
    } catch (statusError) {
      console.error('❌ Lỗi tạo booking status log:', statusError);
      // Không throw error ở đây để không làm crash API
    }
  }

  // Log failed payment transition
  if (updatedBooking.paymentStatus === "failed" && previousPaymentStatus !== "failed") {
    // Xác định actorName dựa trên loại khách hàng
    let actorName = "Admin";
    if (updatedBooking.customerId) {
      // Khách hàng online - lấy tên từ database
      const customer = await User.findById(updatedBooking.customerId);
      actorName = customer?.fullName || "Khách hàng online";
    } else {
      // Khách hàng walk_in - sử dụng tên từ guests array
      const mainGuest = updatedBooking.guests?.find((g: any) => g.isMainGuest);
      actorName = mainGuest?.fullName || "Khách hàng walk-in";
    }

    await bookingStatusService.create({
      bookingId: updatedBooking._id.toString(),
      actorId: updatedBooking.customerId || undefined,
      actorName: actorName,
      action: "failed",
      note: payload.note || "Thanh toán thất bại",
    });
  }

  // If extend hours or checkOut changed forward, log extension
  if (payload.extendHours || (payload.checkOut && new Date(payload.checkOut) > new Date(booking.checkOut))) {
    // Xác định actorName dựa trên loại khách hàng
    let actorName = "Admin";
    if (updatedBooking.customerId) {
      // Khách hàng online - lấy tên từ database
      const customer = await User.findById(updatedBooking.customerId);
      actorName = customer?.fullName || "Khách hàng online";
    } else {
      // Khách hàng walk_in - sử dụng tên từ guests array
      const mainGuest = updatedBooking.guests?.find((g: any) => g.isMainGuest);
      actorName = mainGuest?.fullName || "Khách hàng walk-in";
    }

    await bookingStatusService.create({
      bookingId: updatedBooking._id.toString(),
      actorId: updatedBooking.customerId || undefined,
      actorName: actorName,
      action: "extend_check_out",
      note: `Gia hạn trả phòng đến ${new Date(updatedBooking.checkOut).toISOString()}`,
    });
  }

  // Log general booking updates (không phải payment status changes)
  const hasNonPaymentChanges = Object.keys(cleanUpdates).some(key => 
    !['paymentStatus', 'totalPrice'].includes(key) && 
    cleanUpdates[key] !== undefined && 
    cleanUpdates[key] !== null
  );

  if (hasNonPaymentChanges && updatedBooking.paymentStatus === previousPaymentStatus) {
    try {
      // Xác định actorName dựa trên loại khách hàng
      let actorName = "Admin";
      if (updatedBooking.customerId) {
        // Khách hàng online - lấy tên từ database
        const customer = await User.findById(updatedBooking.customerId);
        actorName = customer?.fullName || "Khách hàng online";
      } else {
        // Khách hàng walk_in - sử dụng tên từ guests array
        const mainGuest = updatedBooking.guests?.find((g: any) => g.isMainGuest);
        actorName = mainGuest?.fullName || "Khách hàng walk-in";
      }

      await bookingStatusService.create({
        bookingId: updatedBooking._id.toString(),
        actorId: updatedBooking.customerId || undefined,
        actorName: actorName,
        action: "updated",
        note: payload.note || "Cập nhật thông tin đặt phòng",
      });
      console.log(`✅ Đã tạo booking status log cho general update: ${updatedBooking._id}`);
    } catch (statusError) {
      console.error('❌ Lỗi tạo booking status log cho general update:', statusError);
    }
  }

  // Log payment status changes (nếu chưa được log ở trên)
  if (updatedBooking.paymentStatus !== previousPaymentStatus && 
      !['refunded', 'refund_requested', 'failed'].includes(updatedBooking.paymentStatus)) {
    try {
      // Xác định actorName dựa trên loại khách hàng
      let actorName = "Admin";
      if (updatedBooking.customerId) {
        // Khách hàng online - lấy tên từ database
        const customer = await User.findById(updatedBooking.customerId);
        actorName = customer?.fullName || "Khách hàng online";
      } else {
        // Khách hàng walk_in - sử dụng tên từ guests array
        const mainGuest = updatedBooking.guests?.find((g: any) => g.isMainGuest);
        actorName = mainGuest?.fullName || "Khách hàng walk-in";
      }

      await bookingStatusService.create({
        bookingId: updatedBooking._id.toString(),
        actorId: updatedBooking.customerId || undefined,
        actorName: actorName,
        action: updatedBooking.paymentStatus,
        note: `Thay đổi trạng thái thanh toán: ${previousPaymentStatus} → ${updatedBooking.paymentStatus}`,
      });
      console.log(`✅ Đã tạo booking status log cho payment status change: ${updatedBooking._id}`);
    } catch (statusError) {
      console.error('❌ Lỗi tạo booking status log cho payment status change:', statusError);
    }
  }
  return updatedBooking;
};

// Xoá booking
const deleteById = async (id: string) => {
  const booking = await getById(id);
  await booking.deleteOne();
  return booking;
};

export default {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
};
