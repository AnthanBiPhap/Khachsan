import Payment from "../models/payments.model";
import Booking from "../models/bookings.model";
import GroupBooking from "../models/groupBooking.model";
import ServiceBooking from "../models/serviceBookings.model";
import createError from 'http-errors';

// Tỷ lệ đặt cọc cho group booking (mặc định 50%)
const GROUP_DEPOSIT_RATE = Number(process.env.GROUP_DEPOSIT_RATE ?? 0.5);

/**
 * Tính số tiền đặt cọc dựa trên tỷ lệ GROUP_DEPOSIT_RATE
 */
const calculateDepositAmount = (quoteAmount: number): number => {
  // Nếu không có quoteAmount hoặc <= 0 thì trả về 0
  if (!quoteAmount || quoteAmount <= 0) return 0;
  return Math.max(0, Math.round(quoteAmount * GROUP_DEPOSIT_RATE));
};

/**
 * Lấy danh sách tất cả payments với các bộ lọc (status, paymentMethod, customerId, bookingId, groupBookingId, khoảng thời gian)
 * và phân trang. Bao gồm thông tin chi tiết về booking, group booking và customer.
 */
const getAll = async (filters: any = {}) => {
  const {
    page = 1,
    limit = 10,
    status,
    paymentMethod,
    customerId,
    bookingId,
    startDate,
    endDate,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = filters;

  const query: any = {};

  // Lọc theo status nếu có
  if (status) query.status = status;
  // Lọc theo phương thức thanh toán nếu có
  if (paymentMethod) query.paymentMethod = paymentMethod;
  // Lọc theo customerId nếu có
  if (customerId) query.customerId = customerId;
  // Lọc theo bookingId nếu có
  if (bookingId) query.bookingId = bookingId;
  // Lọc theo groupBookingId nếu có
  if (filters.groupBookingId) query.groupBookingId = filters.groupBookingId;

  // Lọc theo khoảng thời gian tạo nếu có
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // Thiết lập sắp xếp
  const sortOptions: any = {};
  sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

  // Tìm payments với populate thông tin booking, group booking, customer và phân trang
  const payments = await Payment.find(query)
    .populate({
      path: "bookingId",
      select: "roomId checkIn checkOut guests totalPrice source createdAt updatedAt",
      populate: {
        path: "roomId",
        select: "roomNumber typeId",
        populate: {
          path: "typeId",
          select: "name"
        }
      }
    })
    .populate({
      path: "groupBookingId",
      select: "_id checkIn checkOut requesterName requesterPhone requesterEmail peopleCount roomCount quoteAmount status allocatedRoomIds",
      populate: {
        path: "allocatedRoomIds",
        select: "roomNumber typeId",
        populate: { path: "typeId", select: "name pricePerNight" }
      }
    })
    .populate("customerId", "fullName email phoneNumber")
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  // Đếm tổng số payment để phân trang
  const total = await Payment.countDocuments(query);

  return {
    payments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Lấy thông tin chi tiết của một payment theo ID,
 * bao gồm thông tin booking, group booking và customer
 */
const getById = async (id: string) => {
  const payment = await Payment.findById(id)
    .populate({
      path: "bookingId",
      select: "roomId checkIn checkOut guests totalPrice source createdAt updatedAt",
      populate: {
        path: "roomId",
        select: "roomNumber typeId",
        populate: {
          path: "typeId",
          select: "name"
        }
      }
    })
    .populate({
      path: "groupBookingId",
      select: "_id checkIn checkOut requesterName requesterPhone requesterEmail peopleCount roomCount quoteAmount status allocatedRoomIds members",
      populate: {
        path: "allocatedRoomIds",
        select: "roomNumber typeId",
        populate: { path: "typeId", select: "name pricePerNight" }
      }
    })
    .populate("customerId", "fullName email phoneNumber");

  // Nếu không tìm thấy payment thì báo lỗi
  if (!payment) throw createError(404, "Không tìm thấy thanh toán");
  return payment;
};

/**
 * Tạo payment mới: kiểm tra booking/group booking tồn tại,
 * kiểm tra trùng lặp payment và tạo payment với thông tin từ payload
 */
const create = async (payload: any) => {
  const {
    bookingId,
    groupBookingId,
    customerId,
    paymentMethod,
    amount,
    currency = "VND",
    stripeSessionId,
    stripePaymentIntentId,
    stripeCustomerId,
    transactionId,
    bankInfo,
    cashInfo,
    metadata,
    notes,
    expiresAt,
  } = payload;

  // Kiểm tra booking hoặc groupBooking có tồn tại không
  if (bookingId) {
    const booking = await Booking.findById(bookingId);
    // Nếu không tìm thấy booking thì báo lỗi
    if (!booking) throw createError(404, "Không tìm thấy đặt phòng");

    // Kiểm tra xem đã có payment cho booking này chưa (trừ khi payment đã failed)
    const existingPayment = await Payment.findOne({ bookingId });
    if (existingPayment && existingPayment.status !== "failed") {
      throw createError(400, "Đã tồn tại thanh toán cho đặt phòng này");
    }
  } else if (groupBookingId) {
    const groupBooking = await GroupBooking.findById(groupBookingId);
    // Nếu không tìm thấy group booking thì báo lỗi
    if (!groupBooking) throw createError(404, "Không tìm thấy đặt phòng nhóm");

    // Kiểm tra xem đã có payment cho group booking này chưa (trừ khi payment đã failed)
    const existingPayment = await Payment.findOne({ groupBookingId });
    if (existingPayment && existingPayment.status !== "failed") {
      throw createError(400, "Đã tồn tại thanh toán cho đặt phòng nhóm này");
    }
  } else {
    // Phải có bookingId hoặc groupBookingId
    throw createError(400, "Cần có bookingId hoặc groupBookingId");
  }

  const payment = new Payment({
    bookingId,
    groupBookingId,
    customerId,
    paymentMethod,
    amount,
    currency,
    stripeSessionId,
    stripePaymentIntentId,
    stripeCustomerId,
    transactionId,
    bankInfo,
    cashInfo,
    metadata,
    notes,
    expiresAt,
    status: payload.status || "pending",
  });

  try {
    const savedPayment = await payment.save();
    // Populate thông tin booking nếu có
    if (savedPayment.bookingId) {
      await savedPayment.populate({
        path: "bookingId",
        select: "roomId checkIn checkOut guests totalPrice source createdAt updatedAt",
        populate: {
          path: "roomId",
          select: "roomNumber typeId",
          populate: {
            path: "typeId",
            select: "name"
          }
        }
      });
    }
    // Populate thông tin group booking nếu có
    if (savedPayment.groupBookingId) {
      await savedPayment.populate({
        path: "groupBookingId",
        select: "_id checkIn checkOut requesterName requesterPhone requesterEmail peopleCount roomCount quoteAmount status allocatedRoomIds",
        populate: {
          path: "allocatedRoomIds",
          select: "roomNumber typeId",
          populate: { path: "typeId", select: "name pricePerNight" }
        }
      });
    }
    // Populate thông tin customer
    await savedPayment.populate("customerId", "fullName email phoneNumber");

    return savedPayment;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
};

/**
 * Cập nhật payment theo ID: không cho phép cập nhật payment đã completed,
 * cập nhật và populate lại thông tin liên quan
 */
const updateById = async (id: string, payload: any) => {
  const payment = await Payment.findById(id);
  // Nếu không tìm thấy payment thì báo lỗi
  if (!payment) throw createError(404, "Không tìm thấy thanh toán");

  // Không cho phép cập nhật payment đã completed
  if (payment.status === "completed") {
    throw createError(400, "Không thể cập nhật thanh toán đã hoàn thành");
  }

  // Cập nhật payment với thông tin từ payload
  const updateData = { ...payload, updatedAt: new Date() };

  const updatedPayment = await Payment.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );
  
  // Nếu không tìm thấy payment sau khi cập nhật thì báo lỗi
  if (!updatedPayment) throw createError(404, "Không tìm thấy thanh toán");
  
  // Populate lại thông tin booking nếu có
  if (updatedPayment.bookingId) {
    await updatedPayment.populate("bookingId", "roomId checkIn checkOut guests totalPrice source");
  }
  // Populate lại thông tin group booking nếu có
  if (updatedPayment.groupBookingId) {
    await updatedPayment.populate({
      path: "groupBookingId",
      select: "_id checkIn checkOut requesterName requesterPhone requesterEmail peopleCount roomCount quoteAmount status allocatedRoomIds",
      populate: {
        path: "allocatedRoomIds",
        select: "roomNumber typeId",
        populate: { path: "typeId", select: "name pricePerNight" }
      }
    });
  }
  // Populate lại thông tin customer
  await updatedPayment.populate("customerId", "fullName email phoneNumber");

  return updatedPayment;
};

/**
 * Cập nhật trạng thái payment: cập nhật status, refundInfo nếu có,
 * và đồng bộ trạng thái với booking/group booking tương ứng
 */
const updateStatus = async (id: string, status: string, additionalData: any = {}) => {
  const payment = await Payment.findById(id);
  // Nếu không tìm thấy payment thì báo lỗi
  if (!payment) throw createError(404, "Không tìm thấy thanh toán");

  const updateData: any = { status };

  // Nếu status là refunded và có thông tin hoàn tiền thì cập nhật refundInfo
  if (status === "refunded" && additionalData.refundInfo) {
    updateData.refundInfo = {
      ...payment.refundInfo,
      ...additionalData.refundInfo,
    };
  }

  // Cập nhật payment với status và additionalData
  const updatedPayment = await Payment.findByIdAndUpdate(
    id,
    { ...updateData, ...additionalData, updatedAt: new Date() },
    { new: true, runValidators: true }
  );
  
  // Nếu không tìm thấy payment sau khi cập nhật thì báo lỗi
  if (!updatedPayment) throw createError(404, "Không tìm thấy thanh toán");
  
  // Populate lại thông tin booking nếu có
  if (updatedPayment.bookingId) {
    await updatedPayment.populate("bookingId", "roomId checkIn checkOut guests totalPrice");
  }
  // Populate lại thông tin group booking nếu có
  if (updatedPayment.groupBookingId) {
    await updatedPayment.populate({
      path: "groupBookingId",
      select: "_id checkIn checkOut requesterName requesterPhone requesterEmail peopleCount roomCount quoteAmount status allocatedRoomIds",
      populate: {
        path: "allocatedRoomIds",
        select: "roomNumber typeId",
        populate: { path: "typeId", select: "name pricePerNight" }
      }
    });
  }
  // Populate lại thông tin customer
  await updatedPayment.populate("customerId", "fullName email phoneNumber");

  // Cập nhật trạng thái booking tương ứng với payment status
  if (payment.bookingId) {
    let bookingPaymentStatus = status;
    
    // Map payment status sang booking paymentStatus
    if (status === "completed") {
      bookingPaymentStatus = "paid";
    } else if (status === "refunded") {
      bookingPaymentStatus = "refunded";
    } else if (status === "failed") {
      bookingPaymentStatus = "failed";
    } else if (status === "pending") {
      bookingPaymentStatus = "pending";
    } else if (status === "cancelled") {
      bookingPaymentStatus = "cancelled";
    }
    
    // Cập nhật paymentStatus của booking
    await Booking.findByIdAndUpdate(payment.bookingId, {
      paymentStatus: bookingPaymentStatus,
      updatedAt: new Date()
    });

    // Cập nhật trạng thái service booking nếu booking bị hoàn tiền hoặc hủy
    if (status === "refunded" || status === "cancelled") {
      await ServiceBooking.updateMany(
        {
          bookingId: payment.bookingId,
          status: { $ne: "cancelled" }
        },
        {
          $set: { status: "cancelled" }
        }
      );
    }
  }
  
  // Cập nhật trạng thái group booking tương ứng với payment status
  if (payment.groupBookingId) {
    const groupBooking = await GroupBooking.findById(payment.groupBookingId);

    // Nếu payment completed, xác định status là paid hay deposit_paid
    if (status === "completed") {
      let newStatus = "paid";
      // Nếu có quoteAmount và số tiền thanh toán < tổng tiền thì là deposit_paid
      if (groupBooking && groupBooking.quoteAmount) {
        const depositAmount = calculateDepositAmount(groupBooking.quoteAmount);
        if (depositAmount > 0 && payment.amount < groupBooking.quoteAmount) {
          newStatus = "deposit_paid";
        }
      }
      await GroupBooking.findByIdAndUpdate(payment.groupBookingId, {
        status: newStatus,
        updatedAt: new Date()
      });
    } 
    // Nếu payment refunded thì cập nhật status = "refunded"
    else if (status === "refunded") {
      await GroupBooking.findByIdAndUpdate(payment.groupBookingId, {
        status: "refunded",
        updatedAt: new Date()
      });
    } 
    // Nếu payment cancelled thì cập nhật status = "cancelled"
    else if (status === "cancelled") {
      await GroupBooking.findByIdAndUpdate(payment.groupBookingId, {
        status: "cancelled",
        updatedAt: new Date()
      });
    }
  }

  return updatedPayment;
};

/**
 * Xóa payment theo ID: không cho phép xóa payment đã completed
 */
const deleteById = async (id: string) => {
  const payment = await Payment.findById(id);
  // Nếu không tìm thấy payment thì báo lỗi
  if (!payment) throw createError(404, "Không tìm thấy thanh toán");

  // Không cho phép xóa payment đã completed
  if (payment.status === "completed") {
    throw createError(400, "Không thể xóa thanh toán đã hoàn thành");
  }

  await Payment.findByIdAndDelete(id);
  return { message: "Payment deleted successfully" };
};

/**
 * Lấy tất cả payments theo bookingId, sắp xếp theo thời gian tạo mới nhất
 */
const getByBookingId = async (bookingId: string) => {
  const payments = await Payment.find({ bookingId })
    .populate({
      path: "bookingId",
      select: "roomId checkIn checkOut guests totalPrice source",
      populate: {
        path: "roomId",
        select: "roomNumber typeId",
        populate: { path: "typeId", select: "name" }
      }
    })
    .populate("customerId", "fullName email phoneNumber")
    .sort({ createdAt: -1 });

  return payments;
};

/**
 * Lấy tất cả payments theo groupBookingId, sắp xếp theo thời gian tạo mới nhất
 */
const getByGroupBookingId = async (groupBookingId: string) => {
  const payments = await Payment.find({ groupBookingId })
    .populate({
      path: "groupBookingId",
      select: "_id checkIn checkOut requesterName requesterPhone requesterEmail peopleCount roomCount quoteAmount status allocatedRoomIds",
      populate: {
        path: "allocatedRoomIds",
        select: "roomNumber typeId",
        populate: { path: "typeId", select: "name pricePerNight" }
      }
    })
    .populate("customerId", "fullName email phoneNumber")
    .sort({ createdAt: -1 });

  return payments;
};

/**
 * Lấy payments theo customerId với các bộ lọc (status, paymentMethod) và phân trang
 */
const getByCustomerId = async (customerId: string, filters: any = {}) => {
  const { page = 1, limit = 10, status, paymentMethod } = filters;

  const query: any = { customerId };
  // Lọc theo status nếu có
  if (status) query.status = status;
  // Lọc theo paymentMethod nếu có
  if (paymentMethod) query.paymentMethod = paymentMethod;

  // Tìm payments với populate thông tin booking và phân trang
  const payments = await Payment.find(query)
    .populate("bookingId", "roomId checkIn checkOut guests totalPrice")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  // Đếm tổng số payment để phân trang
  const total = await Payment.countDocuments(query);

  return {
    payments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Thống kê payments: thống kê theo status và tổng quan
 * với các bộ lọc (startDate, endDate, paymentMethod)
 */
const getStats = async (filters: any = {}) => {
  const { startDate, endDate, paymentMethod } = filters;

  const matchQuery: any = {};
  // Lọc theo khoảng thời gian nếu có
  if (startDate || endDate) {
    matchQuery.createdAt = {};
    if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
    if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
  }
  // Lọc theo paymentMethod nếu có
  if (paymentMethod) matchQuery.paymentMethod = paymentMethod;

  // Thống kê theo status: đếm số lượng và tổng tiền theo từng status
  const stats = await Payment.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  // Thống kê tổng quan: tổng số payment, tổng tiền và trung bình
  const totalStats = await Payment.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
        averageAmount: { $avg: "$amount" },
      },
    },
  ]);

  return {
    byStatus: stats,
    totals: totalStats[0] || { totalPayments: 0, totalAmount: 0, averageAmount: 0 },
  };
};

/**
 * Đồng bộ tất cả payments với bookings: cập nhật payment status
 * dựa trên booking paymentStatus để đảm bảo đồng bộ dữ liệu
 */
const syncWithBookings = async (): Promise<any> => {
  try {
    // Lấy tất cả payments với populate bookingId
    const payments = await Payment.find({}).populate('bookingId');
    
    let updatedCount = 0;
    
    // Duyệt từng payment để đồng bộ status
    for (const payment of payments) {
      // Nếu có bookingId và booking có paymentStatus (kiểm tra type để tránh lỗi ObjectId)
      const booking = payment.bookingId as any;
      if (booking && booking.paymentStatus) {
        const bookingPaymentStatus = booking.paymentStatus;
        let paymentStatus = payment.status;
        
        // Đồng bộ status - map booking paymentStatus sang payment status
        if (bookingPaymentStatus === 'paid' && payment.status !== 'completed') {
          paymentStatus = 'completed';
        } else if (bookingPaymentStatus === 'refunded' && payment.status !== 'refunded') {
          paymentStatus = 'refunded';
        } else if (bookingPaymentStatus === 'pending' && payment.status !== 'pending') {
          paymentStatus = 'pending';
        } else if (bookingPaymentStatus === 'failed' && payment.status !== 'failed') {
          paymentStatus = 'failed';
        } else if (bookingPaymentStatus === 'completed' && payment.status !== 'completed') {
          paymentStatus = 'completed';
        }
        
        // Nếu status khác nhau thì cập nhật
        if (paymentStatus !== payment.status) {
          await Payment.findByIdAndUpdate(payment._id, { 
            status: paymentStatus,
            updatedAt: new Date()
          });
          updatedCount++;
        }
      }
    }
    
    return {
      message: `Đã đồng bộ ${updatedCount} payments`,
      updatedCount
    };
  } catch (error) {
    throw createError(500, "Lỗi đồng bộ payments với bookings");
  }
};

/**
 * Đồng bộ payment với booking cụ thể: cập nhật payment status
 * dựa trên booking paymentStatus để đảm bảo đồng bộ dữ liệu
 */
const syncPaymentWithBooking = async (bookingId: string, bookingPaymentStatus: string): Promise<any> => {
  try {
    // Tìm payment theo bookingId
    const payment = await Payment.findOne({ bookingId }).populate('bookingId');
    
    // Nếu không tìm thấy payment thì trả về null
    if (!payment) {
      console.log(`⚠️ Không tìm thấy payment cho booking ${bookingId}`);
      return null;
    }

    let paymentStatus = payment.status;
    
    // Map booking paymentStatus sang payment status
    if (bookingPaymentStatus === 'paid' && payment.status !== 'completed') {
      paymentStatus = 'completed';
    } else if (bookingPaymentStatus === 'refunded' && payment.status !== 'refunded') {
      paymentStatus = 'refunded';
    } else if (bookingPaymentStatus === 'pending' && payment.status !== 'pending') {
      paymentStatus = 'pending';
    } else if (bookingPaymentStatus === 'failed' && payment.status !== 'failed') {
      paymentStatus = 'failed';
    } else if (bookingPaymentStatus === 'completed' && payment.status !== 'completed') {
      paymentStatus = 'completed';
    }
    
    // Cập nhật payment nếu status khác
    if (paymentStatus !== payment.status) {
      const updateData: any = {
        status: paymentStatus,
        updatedAt: new Date()
      };
      
      await Payment.findByIdAndUpdate(payment._id, updateData);
      
      console.log(`✅ Đã đồng bộ payment ${payment._id}: ${payment.status} → ${paymentStatus}`);
      return { updated: true, paymentId: payment._id, oldStatus: payment.status, newStatus: paymentStatus };
    }
    
    return { updated: false, paymentId: payment._id, status: payment.status };
  } catch (error) {
    console.error(`❌ Lỗi đồng bộ payment với booking ${bookingId}:`, error);
    throw createError(500, "Lỗi đồng bộ payment với booking");
  }
};

export default {
  getAll,
  getById,
  create,
  updateById,
  updateStatus,
  deleteById,
  getByBookingId,
  getByGroupBookingId,
  getByCustomerId,
  getStats,
  syncWithBookings,
  syncPaymentWithBooking,
};
