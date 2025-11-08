import createError from "http-errors";
import GroupBooking from "../models/groupBooking.model";
import Room from "../models/rooms.model";
import Booking from "../models/bookings.model";
import Payment from "../models/payments.model";
import Invoice from "../models/invoices.model";
import invoicesService from "./invoices.service";
import paymentsService from "./payments.service";

type CreateGroupBookingPayload = {
  requesterId?: string;
  requesterName: string;
  requesterPhone: string;
  requesterEmail?: string;
  checkIn: string | Date;
  checkOut: string | Date;
  peopleCount: number;
  roomCount: number;
  notes?: string;
};

const create = async (payload: CreateGroupBookingPayload) => {
  const gb = await GroupBooking.create({
    ...payload,
    status: "pending_approval",
  });
  return gb;
};

const getById = async (id: string) => {
  const gb = await GroupBooking.findById(id)
    .populate({ path: "allocatedRoomIds", select: "roomNumber typeId", populate: { path: "typeId", select: "pricePerNight name" } })
    .populate("requesterId", "fullName email phoneNumber");
  if (!gb) throw createError(404, "Group booking not found");
  return gb;
};

const list = async (query: any = {}) => {
  const q: any = {};
  if (query.status) q.status = query.status;
  if (query.requesterId) q.requesterId = query.requesterId;
  if (query.from || query.to) {
    q.createdAt = {} as any;
    if (query.from) q.createdAt.$gte = new Date(query.from);
    if (query.to) q.createdAt.$lte = new Date(query.to);
  }
  const items = await GroupBooking.find(q)
    .sort({ createdAt: -1 })
    .populate("allocatedRoomIds", "roomNumber typeId");
  return items;
};

const checkAvailability = async (checkIn: Date, checkOut: Date) => {
  // Load rooms with type info (price/capacity)
  const rooms = await Room.find({}).populate('typeId', 'pricePerNight capacity name');
  const allRoomIds = rooms.map((r) => r._id);

  // Find bookings overlapping interval
  const bookings = await Booking.find({
    roomId: { $in: allRoomIds },
    paymentStatus: { $ne: "cancelled" },
    checkIn: { $lt: new Date(checkOut) },
    checkOut: { $gt: new Date(checkIn) },
  }).select("roomId checkIn checkOut paymentStatus");

  const bookedSet = new Set<string>(bookings.map((b: any) => String(b.roomId)));
  const availableRooms = rooms.filter((r: any) => !bookedSet.has(String(r._id)));
  return availableRooms as any[];
};

function chooseOptimalRooms(
  rooms: Array<any>,
  requiredRooms: number,
  requiredPeople: number
): Array<any> | null {
  // Sort by price ascending to help pruning
  const sorted = [...rooms].sort((a: any, b: any) => (
    Number(a?.typeId?.pricePerNight || 0) - Number(b?.typeId?.pricePerNight || 0)
  ));

  let bestCombo: Array<any> | null = null;
  let bestPrice = Infinity;

  const n = sorted.length;

  const dfs = (start: number, picked: Array<any>, capSum: number, priceSum: number) => {
    if (picked.length === requiredRooms) {
      if (capSum >= requiredPeople && priceSum < bestPrice) {
        bestPrice = priceSum;
        bestCombo = [...picked];
      }
      return;
    }

    // If even picking all remaining cannot reach requiredRooms, stop
    if (n - start < requiredRooms - picked.length) return;

    for (let i = start; i < n; i++) {
      const room = sorted[i];
      const price = Number(room?.typeId?.pricePerNight || 0);
      const capacity = Number(room?.typeId?.capacity || 0);

      // Prune: if current price already exceeds best
      if (priceSum + price >= bestPrice) continue;

      picked.push(room);
      dfs(i + 1, picked, capSum + capacity, priceSum + price);
      picked.pop();
    }
  };

  dfs(0, [], 0, 0);
  return bestCombo;
}

const appendNote = (gb: any, label: string, content?: string) => {
  if (!content) return;
  const entry = `${label}: ${content}`.trim();
  gb.notes = gb.notes ? `${gb.notes}\n${entry}` : entry;
};

const formatDateRange = (checkIn: Date | string, checkOut: Date | string) => {
  const formatter = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" });
  const start = formatter.format(new Date(checkIn));
  const end = formatter.format(new Date(checkOut));
  return `${start} → ${end}`;
};

const rejectGroupBooking = async (gb: any, reason: string) => {
  gb.status = "rejected";
  gb.rejectedAt = new Date();
  appendNote(gb, "Rejected", reason);
  await gb.save();
};

const approve = async (id: string) => {
  const gb = await GroupBooking.findById(id);
  if (!gb) throw createError(404, "Group booking not found");
  if (gb.status !== "pending_approval")
    throw createError(400, "Only pending_approval can be approved");

  const availableRooms = await checkAvailability(gb.checkIn, gb.checkOut);
  if (availableRooms.length < gb.roomCount) {
    const reason = `Không đủ phòng trống trong giai đoạn ${formatDateRange(
      gb.checkIn,
      gb.checkOut
    )}. Yêu cầu ${gb.roomCount} phòng, khả dụng ${availableRooms.length} phòng.`;
    await rejectGroupBooking(gb, reason);
    throw createError(400, "Không đủ phòng trống để duyệt yêu cầu đặt đoàn");
  }

  // Choose cost-optimized allocation meeting capacity and room count
  const optimal = chooseOptimalRooms(availableRooms, gb.roomCount, gb.peopleCount);
  if (!optimal) {
    const reason = `Không tìm được tổ hợp phòng đáp ứng ${gb.peopleCount} khách trong giai đoạn ${formatDateRange(
      gb.checkIn,
      gb.checkOut
    )}.`;
    await rejectGroupBooking(gb, reason);
    throw createError(400, "Không thể tìm được tổ hợp phòng đáp ứng yêu cầu đoàn");
  }
  gb.allocatedRoomIds = optimal.map((r: any) => r._id);
  gb.status = "approved";
  await gb.save();
  return gb;
};

const uploadMembers = async (id: string, members: any[]) => {
  const gb = await GroupBooking.findById(id);
  if (!gb) throw createError(404, "Group booking not found");
  if (gb.status !== "approved")
    throw createError(400, "Members can only be uploaded after approval");

  gb.members = Array.isArray(members) ? members : [];
  gb.status = "info_uploaded";
  await gb.save();
  return gb;
};

const quote = async (
  id: string,
  quoteAmount: number,
  paymentLink?: string
) => {
  const gb = await GroupBooking.findById(id);
  if (!gb) throw createError(404, "Group booking not found");
  if (gb.status !== "info_uploaded" && gb.status !== "approved")
    throw createError(400, "Can only quote after info uploaded or approval");

  gb.quoteAmount = quoteAmount;
  gb.paymentLink = paymentLink;
  gb.status = paymentLink ? "awaiting_payment" : "quoted";
  await gb.save();
  return gb;
};

const markPaid = async (id: string, options?: { stripeSessionId?: string; stripePaymentIntentId?: string; stripeCustomerId?: string }) => {
  const gb = await GroupBooking.findById(id);
  if (!gb) throw createError(404, "Group booking not found");
  if (!gb.quoteAmount) throw createError(400, "Quote not set");
  if (gb.status !== "awaiting_payment" && gb.status !== "quoted")
    throw createError(400, "Invalid state to mark paid");
  gb.status = "paid";
  await gb.save();

  // Tạo invoice cho group booking khi thanh toán
  try {
    const invoice = await invoicesService.create({
      groupBookingId: gb._id,
      customerId: gb.requesterId || undefined,
      totalAmount: gb.quoteAmount,
      paidAmount: gb.quoteAmount, // Đã thanh toán đủ
      remainingAmount: 0,
      paymentStatus: "paid",
      status: "paid",
      issuedAt: new Date(),
    });
    console.log(`✅ Đã tạo invoice mới cho group booking ${gb._id}: invoiceId=${invoice._id}, totalAmount=${gb.quoteAmount}`);
  } catch (invoiceError: any) {
    console.error(`❌ Lỗi tạo invoice cho group booking ${gb._id}:`, invoiceError);
    // Không throw error để không làm crash API, vì group booking đã được đánh dấu paid
    // Nhưng log lại để admin biết và có thể tạo invoice thủ công sau
  }

  // Tạo payment record cho group booking khi thanh toán
  try {
    // Kiểm tra xem đã có payment chưa
    const existingPayment = await Payment.findOne({ groupBookingId: gb._id });
    if (!existingPayment) {
      // Tạo payment record mới
      const payment = await paymentsService.create({
        groupBookingId: gb._id.toString(),
        customerId: gb.requesterId || undefined,
        paymentMethod: "stripe", // Mặc định là stripe vì thanh toán online
        amount: gb.quoteAmount,
        currency: "VND",
        stripeSessionId: options?.stripeSessionId,
        stripePaymentIntentId: options?.stripePaymentIntentId,
        stripeCustomerId: options?.stripeCustomerId,
        status: "completed",
        paidAt: new Date(),
        notes: `Payment for group booking ${gb._id}`,
      });
      console.log(`✅ Đã tạo payment mới cho group booking ${gb._id}: paymentId=${payment._id}, amount=${gb.quoteAmount}`);
    } else {
      // Cập nhật payment hiện có nếu có thông tin Stripe mới
      if (options?.stripeSessionId || options?.stripePaymentIntentId) {
        const updateData: any = {};
        if (options.stripeSessionId) updateData.stripeSessionId = options.stripeSessionId;
        if (options.stripePaymentIntentId) updateData.stripePaymentIntentId = options.stripePaymentIntentId;
        if (options.stripeCustomerId) updateData.stripeCustomerId = options.stripeCustomerId;
        await paymentsService.updateById(existingPayment._id.toString(), updateData);
        console.log(`✅ Đã cập nhật payment ${existingPayment._id} với thông tin Stripe`);
      }
      console.log(`ℹ️ Payment đã tồn tại cho group booking ${gb._id}: paymentId=${existingPayment._id}`);
    }
  } catch (paymentError: any) {
    console.error(`❌ Lỗi tạo payment cho group booking ${gb._id}:`, paymentError);
    // Không throw error để không làm crash API
  }

  return gb;
};

const confirm = async (id: string) => {
  const gb = await GroupBooking.findById(id);
  if (!gb) throw createError(404, "Group booking not found");
  if (gb.status !== "paid")
    throw createError(400, "Only paid bookings can be confirmed");
  gb.status = "confirmed";
  await gb.save();
  return gb;
};

const cancel = async (id: string, reason?: string) => {
  const gb = await GroupBooking.findById(id);
  if (!gb) throw createError(404, "Group booking not found");

  if (["cancelled", "refund_requested", "refunded", "rejected"].includes(gb.status)) {
    throw createError(400, `Group booking is already ${gb.status}, không thể hủy thêm lần nữa`);
  }

  const now = new Date();
  const trimmedReason = reason?.trim();

  if (["paid", "confirmed"].includes(gb.status)) {
    gb.status = "refund_requested";
    gb.refundRequestedAt = now;
    if (!gb.refundAmount && gb.quoteAmount) {
      gb.refundAmount = gb.quoteAmount;
    }
    appendNote(gb, "Refund requested", trimmedReason || "Khách hàng yêu cầu hoàn tiền");
  } else {
    gb.status = "cancelled";
    appendNote(gb, "Cancelled", trimmedReason || "Khách hàng hủy yêu cầu");

    const invoice = await Invoice.findOne({ groupBookingId: gb._id });
    if (invoice) {
      await invoicesService.updateById(invoice._id.toString(), {
        status: "failed",
        paymentStatus: "cancelled",
        remainingAmount: 0,
      });
    }

    const payment = await Payment.findOne({ groupBookingId: gb._id });
    if (payment) {
      await paymentsService.updateStatus(payment._id.toString(), "cancelled");
    }
  }

  await gb.save();
  return gb;
};

const markRefunded = async (
  id: string,
  options?: { amount?: number; note?: string }
) => {
  const gb = await GroupBooking.findById(id);
  if (!gb) throw createError(404, "Group booking not found");

  if (!["refund_requested", "paid", "confirmed"].includes(gb.status)) {
    throw createError(400, "Chỉ có thể hoàn tiền cho đặt đoàn đã thanh toán hoặc đang chờ hoàn tiền");
  }

  const refundAmount = options?.amount ?? gb.quoteAmount ?? 0;
  if (refundAmount < 0) {
    throw createError(400, "Số tiền hoàn không hợp lệ");
  }

  const processedAt = new Date();
  gb.status = "refunded";
  gb.refundProcessedAt = processedAt;
  gb.refundAmount = refundAmount;
  appendNote(
    gb,
    "Refund processed",
    options?.note || `Hoàn tiền ${refundAmount.toLocaleString("vi-VN")} VND`
  );
  await gb.save();

  const payment = await Payment.findOne({ groupBookingId: gb._id });
  if (payment) {
    await paymentsService.updateStatus(payment._id.toString(), "refunded", {
      refundInfo: {
        refundAmount,
        refundedAt: processedAt,
        refundReason: options?.note || "Hoàn tiền đặt đoàn",
      },
    });
  }

  const invoice = await Invoice.findOne({ groupBookingId: gb._id });
  if (invoice) {
    await invoicesService.updateById(invoice._id.toString(), {
      status: "refunded",
      paymentStatus: "refunded",
      paidAmount: 0,
      remainingAmount: 0,
    });
  }

  return gb;
};

export default {
  create,
  getById,
  list,
  approve,
  uploadMembers,
  quote,
  markPaid,
  confirm,
  cancel,
  markRefunded,
};

export const computeAutoQuote = async (id: string) => {
  const gb: any = await getById(id);
  if (!gb) throw createError(404, "Group booking not found");
  if (!gb.allocatedRoomIds || gb.allocatedRoomIds.length === 0) {
    throw createError(400, "No allocated rooms to compute quote");
  }
  const checkIn = new Date(gb.checkIn);
  const checkOut = new Date(gb.checkOut);
  const ms = checkOut.getTime() - checkIn.getTime();
  const nights = Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));

  let total = 0;
  const breakdown: Array<{ roomId: string; roomNumber: string; typeName?: string; pricePerNight: number; nights: number; subtotal: number }> = [];
  for (const room of gb.allocatedRoomIds) {
    const pricePerNight = Number((room as any)?.typeId?.pricePerNight || 0);
    const typeName = (room as any)?.typeId?.name;
    const subtotal = pricePerNight * nights;
    total += subtotal;
    breakdown.push({
      roomId: String((room as any)?._id || room),
      roomNumber: (room as any)?.roomNumber || '',
      typeName,
      pricePerNight,
      nights,
      subtotal,
    });
  }

  return { nights, rooms: gb.allocatedRoomIds.length, amount: total, breakdown };
};


