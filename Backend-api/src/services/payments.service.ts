import Payment from "../models/payments.model";
import Booking from "../models/bookings.model";
import GroupBooking from "../models/groupBooking.model";
import ServiceBooking from "../models/serviceBookings.model";
import createError from 'http-errors';

const GROUP_DEPOSIT_RATE = Number(process.env.GROUP_DEPOSIT_RATE ?? 0.5);

const calculateDepositAmount = (quoteAmount: number): number => {
  if (!quoteAmount || quoteAmount <= 0) return 0;
  return Math.max(0, Math.round(quoteAmount * GROUP_DEPOSIT_RATE));
};

// Lấy tất cả payments
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

  if (status) query.status = status;
  if (paymentMethod) query.paymentMethod = paymentMethod;
  if (customerId) query.customerId = customerId;
  if (bookingId) query.bookingId = bookingId;
  if (filters.groupBookingId) query.groupBookingId = filters.groupBookingId;

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const sortOptions: any = {};
  sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

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

// Lấy payment theo ID
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

  if (!payment) throw createError(404, "Payment not found");
  return payment;
};

// Tạo payment mới
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
    if (!booking) throw createError(404, "Booking not found");

    // Kiểm tra xem đã có payment cho booking này chưa
    const existingPayment = await Payment.findOne({ bookingId });
    if (existingPayment && existingPayment.status !== "failed") {
      throw createError(400, "Payment already exists for this booking");
    }
  } else if (groupBookingId) {
    const groupBooking = await GroupBooking.findById(groupBookingId);
    if (!groupBooking) throw createError(404, "Group booking not found");

    // Kiểm tra xem đã có payment cho group booking này chưa
    const existingPayment = await Payment.findOne({ groupBookingId });
    if (existingPayment && existingPayment.status !== "failed") {
      throw createError(400, "Payment already exists for this group booking");
    }
  } else {
    throw createError(400, "Either bookingId or groupBookingId is required");
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
    await savedPayment.populate("customerId", "fullName email phoneNumber");

    return savedPayment;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
};

// Cập nhật payment
const updateById = async (id: string, payload: any) => {
  const payment = await Payment.findById(id);
  if (!payment) throw createError(404, "Payment not found");

  // Không cho phép cập nhật payment đã completed
  if (payment.status === "completed") {
    throw createError(400, "Cannot update completed payment");
  }

  const updateData = { ...payload, updatedAt: new Date() };

  const updatedPayment = await Payment.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );
  
  if (updatedPayment.bookingId) {
    await updatedPayment.populate("bookingId", "roomId checkIn checkOut guests totalPrice source");
  }
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
  await updatedPayment.populate("customerId", "fullName email phoneNumber");

  return updatedPayment;
};

// Cập nhật trạng thái payment
const updateStatus = async (id: string, status: string, additionalData: any = {}) => {
  const payment = await Payment.findById(id);
  if (!payment) throw createError(404, "Payment not found");

  const updateData: any = { status };

  if (status === "refunded" && additionalData.refundInfo) {
    updateData.refundInfo = {
      ...payment.refundInfo,
      ...additionalData.refundInfo,
    };
  }

  const updatedPayment = await Payment.findByIdAndUpdate(
    id,
    { ...updateData, ...additionalData, updatedAt: new Date() },
    { new: true, runValidators: true }
  );
  
  if (updatedPayment.bookingId) {
    await updatedPayment.populate("bookingId", "roomId checkIn checkOut guests totalPrice");
  }
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

    if (status === "completed") {
      let newStatus = "paid";
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
    } else if (status === "refunded") {
      await GroupBooking.findByIdAndUpdate(payment.groupBookingId, {
        status: "refunded",
        updatedAt: new Date()
      });
    } else if (status === "cancelled") {
      await GroupBooking.findByIdAndUpdate(payment.groupBookingId, {
        status: "cancelled",
        updatedAt: new Date()
      });
    }
  }

  return updatedPayment;
};

// Xóa payment
const deleteById = async (id: string) => {
  const payment = await Payment.findById(id);
  if (!payment) throw createError(404, "Payment not found");

  // Không cho phép xóa payment đã completed
  if (payment.status === "completed") {
    throw createError(400, "Cannot delete completed payment");
  }

  await Payment.findByIdAndDelete(id);
  return { message: "Payment deleted successfully" };
};

// Lấy payments theo booking
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

// Lấy payments theo group booking
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

// Lấy payments theo customer
const getByCustomerId = async (customerId: string, filters: any = {}) => {
  const { page = 1, limit = 10, status, paymentMethod } = filters;

  const query: any = { customerId };
  if (status) query.status = status;
  if (paymentMethod) query.paymentMethod = paymentMethod;

  const payments = await Payment.find(query)
    .populate("bookingId", "roomId checkIn checkOut guests totalPrice")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

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

// Thống kê payments
const getStats = async (filters: any = {}) => {
  const { startDate, endDate, paymentMethod } = filters;

  const matchQuery: any = {};
  if (startDate || endDate) {
    matchQuery.createdAt = {};
    if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
    if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
  }
  if (paymentMethod) matchQuery.paymentMethod = paymentMethod;

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

const syncWithBookings = async (): Promise<any> => {
  try {
    // Lấy tất cả payments
    const payments = await Payment.find({}).populate('bookingId');
    
    let updatedCount = 0;
    
    for (const payment of payments) {
      if (payment.bookingId && payment.bookingId.paymentStatus) {
        const bookingPaymentStatus = payment.bookingId.paymentStatus;
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
    throw createError(500, "Error syncing payments with bookings");
  }
};

const syncPaymentWithBooking = async (bookingId: string, bookingPaymentStatus: string): Promise<any> => {
  try {
    // Tìm payment theo bookingId
    const payment = await Payment.findOne({ bookingId }).populate('bookingId');
    
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
    throw createError(500, "Error syncing payment with booking");
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
