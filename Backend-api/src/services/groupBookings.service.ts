import createError from "http-errors";
import GroupBooking from "../models/groupBooking.model";
import Room from "../models/rooms.model";
import Booking from "../models/bookings.model";
import Payment from "../models/payments.model";
import Invoice from "../models/invoices.model";
import invoicesService from "./invoices.service";
import paymentsService from "./payments.service";
import socketService from "./socket.service";
import notificationsService from "./notifications.service";

const GROUP_DEPOSIT_RATE = Number(process.env.GROUP_DEPOSIT_RATE ?? 0.5);
const GROUP_DEPOSIT_PERCENT_LABEL = `${Math.round(GROUP_DEPOSIT_RATE * 100)}%`;

const calculateDepositAmount = (quoteAmount: number): number => {
  if (!quoteAmount || quoteAmount <= 0) return 0;
  return Math.max(0, Math.round(quoteAmount * GROUP_DEPOSIT_RATE));
};

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

  // Populate để lấy thông tin đầy đủ
  await gb.populate("requesterId", "fullName email phoneNumber");

  // Lưu notification vào database và gửi WebSocket notification cho admin và staff
  try {
    const notificationMessage = `Có yêu cầu đặt phòng nhóm mới từ ${payload.requesterName}`;
    
    // Lưu notification vào database
    await notificationsService.create({
      type: "new_booking",
      title: "Yêu cầu đặt phòng nhóm mới",
      message: notificationMessage,
      userId: gb.requesterId?._id || undefined,
      bookingData: {
        bookingId: gb._id,
        customerId: gb.requesterId?._id,
        roomId: null, // Group booking chưa có phòng cụ thể
        checkIn: gb.checkIn,
        checkOut: gb.checkOut,
        totalPrice: gb.quoteAmount || 0,
        paymentStatus: gb.status,
        source: "online",
        guestCount: gb.peopleCount,
        guests: [],
      },
      metadata: {
        groupBookingId: gb._id,
        roomCount: gb.roomCount,
        peopleCount: gb.peopleCount,
        requesterName: gb.requesterName,
        requesterPhone: gb.requesterPhone,
        requesterEmail: gb.requesterEmail,
      },
    });

    // Gửi WebSocket notification
    const groupBookingNotification = {
      type: "new_group_booking",
      groupBooking: {
        _id: gb._id,
        requesterId: gb.requesterId,
        requesterName: gb.requesterName,
        requesterPhone: gb.requesterPhone,
        checkIn: gb.checkIn,
        checkOut: gb.checkOut,
        peopleCount: gb.peopleCount,
        roomCount: gb.roomCount,
        status: gb.status,
        quoteAmount: gb.quoteAmount,
      },
      message: notificationMessage,
      timestamp: new Date().toISOString(),
    };

    // Gửi đến tất cả admin và staff
    try {
      socketService.sendToRoom("role:admin", "new_group_booking", groupBookingNotification);
      console.log(`📢 Đã gửi WebSocket notification đến room "role:admin" cho group booking: ${gb._id}`);
    } catch (adminError) {
      console.error("❌ Lỗi gửi notification đến admin:", adminError);
    }
    
    try {
      socketService.sendToRoom("role:staff", "new_group_booking", groupBookingNotification);
      console.log(`📢 Đã gửi WebSocket notification đến room "role:staff" cho group booking: ${gb._id}`);
    } catch (staffError) {
      console.error("❌ Lỗi gửi notification đến staff:", staffError);
    }
    
    console.log(`✅ Đã lưu và gửi WebSocket notification cho group booking mới: ${gb._id}`);
    console.log(`📊 Thông tin notification:`, {
      message: notificationMessage,
      requesterName: payload.requesterName,
      peopleCount: gb.peopleCount,
      roomCount: gb.roomCount,
      checkIn: gb.checkIn,
      checkOut: gb.checkOut,
    });
  } catch (notificationError) {
    console.error("❌ Lỗi lưu/gửi notification cho group booking:", notificationError);
    // Không throw error để không làm crash API, nhưng vẫn log chi tiết
    if (notificationError instanceof Error) {
      console.error("Error stack:", notificationError.stack);
    }
  }

  return gb;
};

const getById = async (id: string) => {
  const gb = await GroupBooking.findById(id)
    .populate({ path: "allocatedRoomIds", select: "roomNumber typeId", populate: { path: "typeId", select: "pricePerNight name capacity extraHourPrice maxExtendHours amenities" } })
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
  const gb = await GroupBooking.findById(id)
    .populate("allocatedRoomIds", "roomNumber");
  if (!gb) throw createError(404, "Group booking not found");
  
  // Cho phép upload khi đã có báo giá (quoted hoặc awaiting_payment)
  if (!["quoted", "awaiting_payment"].includes(gb.status)) {
    throw createError(400, "Chỉ có thể upload danh sách sau khi admin đã báo giá");
  }
  
  if (!gb.allocatedRoomIds || gb.allocatedRoomIds.length === 0) {
    throw createError(400, "Chưa có phòng được phân bổ, không thể upload danh sách");
  }

  // Lấy danh sách số phòng hợp lệ
  const validRoomNumbers = (gb.allocatedRoomIds as any[])
    .map((r: any) => String(r.roomNumber || "").trim())
    .filter(Boolean);
  
  if (validRoomNumbers.length === 0) {
    throw createError(400, "Không có số phòng hợp lệ");
  }

  // Validate và xử lý members
  // Lọc bỏ các dòng trống (không có fullName) trước khi xử lý
  const validMembers = (Array.isArray(members) ? members : []).filter((m: any) => {
    const fullName = String(m.fullName || "").trim();
    return fullName.length > 0;
  });
  
  // Kiểm tra số lượng người phải khớp với peopleCount
  const expectedPeopleCount = gb.peopleCount || 0;
  const actualPeopleCount = validMembers.length;
  
  if (actualPeopleCount !== expectedPeopleCount) {
    throw createError(
      400,
      `Số lượng người trong file không khớp với yêu cầu. Yêu cầu: ${expectedPeopleCount} người, nhưng file có: ${actualPeopleCount} người. Vui lòng kiểm tra lại và đảm bảo file có đúng ${expectedPeopleCount} người.`
    );
  }
  
  const processedMembers = validMembers.map((m: any) => {
    const roomNumber = String(m.roomNumber || "").trim();
    
    // Validate roomNumber nếu có
    if (roomNumber && !validRoomNumbers.includes(roomNumber)) {
      throw createError(
        400,
        `Số phòng "${roomNumber}" không hợp lệ. Danh sách phòng hợp lệ: ${validRoomNumbers.join(", ")}`
      );
    }
    
    // Parse dateOfBirth từ string YYYY-MM-DD thành Date object với local time
    let dateOfBirth: Date | undefined = undefined;
    if (m.dateOfBirth) {
      if (typeof m.dateOfBirth === 'string') {
        // Nếu là string format YYYY-MM-DD, parse thành Date với local time
        const ymdMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(m.dateOfBirth);
        if (ymdMatch) {
          const year = parseInt(ymdMatch[1], 10);
          const month = parseInt(ymdMatch[2], 10) - 1; // month is 0-indexed
          const day = parseInt(ymdMatch[3], 10);
          dateOfBirth = new Date(year, month, day);
          // Validate date
          if (isNaN(dateOfBirth.getTime())) {
            dateOfBirth = undefined;
          }
        } else {
          // Thử parse với Date constructor
          const parsed = new Date(m.dateOfBirth);
          if (!isNaN(parsed.getTime())) {
            dateOfBirth = parsed;
          }
        }
      } else if (m.dateOfBirth instanceof Date) {
        dateOfBirth = m.dateOfBirth;
      }
    }
    
    return {
      fullName: m.fullName || "",
      idNumber: m.idNumber || "",
      dateOfBirth: dateOfBirth,
      phoneNumber: m.phoneNumber || "",
      email: m.email || "",
      isLeader: Boolean(m.isLeader),
      roomNumber: roomNumber || undefined,
    };
  });

  gb.members = processedMembers;
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
  // Cho phép báo giá sau khi approved hoặc info_uploaded
  if (gb.status !== "info_uploaded" && gb.status !== "approved")
    throw createError(400, "Can only quote after info uploaded or approval");

  gb.quoteAmount = quoteAmount;
  gb.paymentLink = paymentLink;
  gb.status = paymentLink ? "awaiting_payment" : "quoted";
  await gb.save();
  return gb;
};

const markPaid = async (
  id: string,
  options?: { stripeSessionId?: string; stripePaymentIntentId?: string; stripeCustomerId?: string }
) => {
  const gb = await GroupBooking.findById(id)
    .populate("requesterId", "fullName email phoneNumber");
  if (!gb) throw createError(404, "Group booking not found");
  if (!gb.quoteAmount) throw createError(400, "Quote not set");
  if (!["awaiting_payment", "quoted", "info_uploaded"].includes(gb.status))
    throw createError(400, "Invalid state to mark paid");

  const depositAmount = calculateDepositAmount(gb.quoteAmount);
  const paidAmount = depositAmount > 0 ? depositAmount : gb.quoteAmount;
  const remainingAmount = Math.max(0, gb.quoteAmount - paidAmount);

  gb.status = remainingAmount > 0 ? "deposit_paid" : "paid";
  gb.paidAmount = paidAmount;
  gb.remainingAmount = remainingAmount;
  appendNote(
    gb,
    remainingAmount > 0 ? "Deposit" : "Payment",
    remainingAmount > 0
      ? `Khách đã thanh toán đặt cọc ${paidAmount.toLocaleString("vi-VN")} VND (${GROUP_DEPOSIT_PERCENT_LABEL}), còn lại ${remainingAmount.toLocaleString(
          "vi-VN"
        )} VND.`
      : `Khách đã thanh toán đủ ${paidAmount.toLocaleString("vi-VN")} VND.`
  );
  await gb.save();

  // Tạo invoice cho group booking khi thanh toán
  try {
    const invoice = await invoicesService.create({
      groupBookingId: gb._id,
      customerId: gb.requesterId || undefined,
      totalAmount: gb.quoteAmount,
      paidAmount,
      remainingAmount,
      paymentStatus: remainingAmount > 0 ? "partial_paid" : "paid",
      status: remainingAmount > 0 ? "pending" : "paid",
      issuedAt: new Date(),
    });
    console.log(
      `✅ Đã tạo invoice mới cho group booking ${gb._id}: invoiceId=${invoice._id}, total=${gb.quoteAmount}, paid=${paidAmount}, remain=${remainingAmount}`
    );
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
        amount: paidAmount,
        currency: "VND",
        stripeSessionId: options?.stripeSessionId,
        stripePaymentIntentId: options?.stripePaymentIntentId,
        stripeCustomerId: options?.stripeCustomerId,
        status: "completed",
        paidAt: new Date(),
        notes:
          remainingAmount > 0
            ? `Deposit ${GROUP_DEPOSIT_PERCENT_LABEL} cho group booking ${gb._id}`
            : `Payment for group booking ${gb._id}`,
        metadata: {
          depositRate: GROUP_DEPOSIT_RATE,
          paidAmount,
          remainingAmount,
        },
      });
      console.log(
        `✅ Đã tạo payment mới cho group booking ${gb._id}: paymentId=${payment._id}, amount=${paidAmount}, remaining=${remainingAmount}`
      );
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

  // Lưu notification vào database và gửi WebSocket notification cho admin và staff
  try {
    const isDeposit = remainingAmount > 0;
    const notificationMessage = isDeposit 
      ? `Khách hàng ${gb.requesterName} đã thanh toán đặt cọc ${paidAmount.toLocaleString("vi-VN")} VND cho đặt phòng nhóm ${gb._id}`
      : `Khách hàng ${gb.requesterName} đã thanh toán đủ ${paidAmount.toLocaleString("vi-VN")} VND cho đặt phòng nhóm ${gb._id}`;
    
    // Lưu notification vào database
    await notificationsService.create({
      type: "payment_received",
      title: isDeposit ? "Nhận đặt cọc đặt phòng nhóm" : "Thanh toán đủ đặt phòng nhóm",
      message: notificationMessage,
      userId: gb.requesterId?._id || undefined,
      bookingData: {
        bookingId: null,
        customerId: gb.requesterId?._id,
        roomId: null,
        checkIn: gb.checkIn,
        checkOut: gb.checkOut,
        totalPrice: gb.quoteAmount,
        paymentStatus: isDeposit ? "partial_paid" : "paid",
        source: "online",
        guestCount: gb.peopleCount,
        guests: [],
      },
      metadata: {
        groupBookingId: gb._id,
        roomCount: gb.roomCount,
        peopleCount: gb.peopleCount,
        requesterName: gb.requesterName,
        requesterPhone: gb.requesterPhone,
        requesterEmail: gb.requesterEmail,
        paidAmount,
        remainingAmount,
        isDeposit,
      },
    });

    // Gửi WebSocket notification
    const paymentNotification = {
      type: "group_booking_payment",
      groupBooking: {
        _id: gb._id,
        requesterId: gb.requesterId,
        requesterName: gb.requesterName,
        requesterPhone: gb.requesterPhone,
        checkIn: gb.checkIn,
        checkOut: gb.checkOut,
        peopleCount: gb.peopleCount,
        roomCount: gb.roomCount,
        status: gb.status,
        quoteAmount: gb.quoteAmount,
        paidAmount,
        remainingAmount,
      },
      message: notificationMessage,
      isDeposit,
      timestamp: new Date().toISOString(),
    };

    // Gửi đến tất cả admin và staff
    try {
      socketService.sendToRoom("role:admin", "group_booking_payment", paymentNotification);
      console.log(`📢 Đã gửi WebSocket notification thanh toán đến room "role:admin" cho group booking: ${gb._id}`);
    } catch (adminError) {
      console.error("❌ Lỗi gửi notification thanh toán đến admin:", adminError);
    }
    
    try {
      socketService.sendToRoom("role:staff", "group_booking_payment", paymentNotification);
      console.log(`📢 Đã gửi WebSocket notification thanh toán đến room "role:staff" cho group booking: ${gb._id}`);
    } catch (staffError) {
      console.error("❌ Lỗi gửi notification thanh toán đến staff:", staffError);
    }
    
    console.log(`✅ Đã lưu và gửi WebSocket notification thanh toán cho group booking: ${gb._id}`);
    console.log(`📊 Thông tin thanh toán:`, {
      message: notificationMessage,
      requesterName: gb.requesterName,
      paidAmount,
      remainingAmount,
      isDeposit,
      status: gb.status,
    });
  } catch (notificationError) {
    console.error("❌ Lỗi lưu/gửi notification thanh toán cho group booking:", notificationError);
    // Không throw error để không làm crash API, nhưng vẫn log chi tiết
    if (notificationError instanceof Error) {
      console.error("Error stack:", notificationError.stack);
    }
  }

  return gb;
};

const markFullPayment = async (
  id: string,
  options?: { stripeSessionId?: string; stripePaymentIntentId?: string; stripeCustomerId?: string }
) => {
  const gb = await GroupBooking.findById(id)
    .populate("requesterId", "fullName email phoneNumber");
  if (!gb) throw createError(404, "Group booking not found");
  if (!gb.quoteAmount) throw createError(400, "Quote not set");

  if (!["deposit_paid", "awaiting_payment", "quoted", "confirmed"].includes(gb.status)) {
    throw createError(400, "Chỉ có thể tất toán sau khi đã nhận đặt cọc");
  }

  const currentPaid = Number(gb.paidAmount || 0);
  const outstanding = Math.max(0, gb.quoteAmount - currentPaid);
  if (outstanding <= 0) {
    throw createError(400, "Không còn số tiền cần tất toán");
  }

  gb.paidAmount = gb.quoteAmount;
  gb.remainingAmount = 0;
  gb.status = "paid";
  appendNote(
    gb,
    "Payment",
    `Admin xác nhận đã thu đủ ${gb.quoteAmount.toLocaleString("vi-VN")} VND.`
  );
  await gb.save();

  try {
    const invoice = await Invoice.findOne({ groupBookingId: gb._id });
    if (invoice) {
      await invoicesService.updateById(invoice._id.toString(), {
        totalAmount: gb.quoteAmount,
        paidAmount: gb.quoteAmount,
        remainingAmount: 0,
        paymentStatus: "paid",
        status: "paid",
      });
    }
  } catch (invoiceError) {
    console.error(`❌ Lỗi cập nhật invoice khi tất toán group booking ${gb._id}:`, invoiceError);
  }

  try {
    const payment = await Payment.findOne({ groupBookingId: gb._id });
    if (payment) {
      await Payment.findByIdAndUpdate(payment._id, {
        amount: gb.quoteAmount,
        status: "completed",
        metadata: {
          ...(payment.metadata || {}),
          depositRate: GROUP_DEPOSIT_RATE,
          fullyPaid: true,
        },
        stripeSessionId: options?.stripeSessionId || payment.stripeSessionId,
        stripePaymentIntentId: options?.stripePaymentIntentId || payment.stripePaymentIntentId,
        stripeCustomerId: options?.stripeCustomerId || payment.stripeCustomerId,
      });
    } else {
      await paymentsService.create({
        groupBookingId: gb._id.toString(),
        customerId: gb.requesterId || undefined,
        paymentMethod: "other",
        amount: gb.quoteAmount,
        currency: "VND",
        status: "completed",
        paidAt: new Date(),
        notes: `Full payment for group booking ${gb._id}`,
        metadata: {
          depositRate: GROUP_DEPOSIT_RATE,
          fullyPaid: true,
        },
        stripeSessionId: options?.stripeSessionId,
        stripePaymentIntentId: options?.stripePaymentIntentId,
        stripeCustomerId: options?.stripeCustomerId,
      });
    }
  } catch (paymentError) {
    console.error(`❌ Lỗi cập nhật payment khi tất toán group booking ${gb._id}:`, paymentError);
  }

  // Lưu notification vào database và gửi WebSocket notification cho admin và staff
  try {
    const notificationMessage = `Admin đã xác nhận thanh toán đủ ${gb.quoteAmount.toLocaleString("vi-VN")} VND cho đặt phòng nhóm ${gb._id} từ ${gb.requesterName}`;
    
    // Lưu notification vào database
    await notificationsService.create({
      type: "payment_received",
      title: "Thanh toán đủ đặt phòng nhóm",
      message: notificationMessage,
      userId: gb.requesterId?._id || undefined,
      bookingData: {
        bookingId: null,
        customerId: gb.requesterId?._id,
        roomId: null,
        checkIn: gb.checkIn,
        checkOut: gb.checkOut,
        totalPrice: gb.quoteAmount,
        paymentStatus: "paid",
        source: "online",
        guestCount: gb.peopleCount,
        guests: [],
      },
      metadata: {
        groupBookingId: gb._id,
        roomCount: gb.roomCount,
        peopleCount: gb.peopleCount,
        requesterName: gb.requesterName,
        requesterPhone: gb.requesterPhone,
        requesterEmail: gb.requesterEmail,
        paidAmount: gb.quoteAmount,
        remainingAmount: 0,
        isDeposit: false,
        isFullPayment: true,
      },
    });

    // Gửi WebSocket notification
    const paymentNotification = {
      type: "group_booking_payment",
      groupBooking: {
        _id: gb._id,
        requesterId: gb.requesterId,
        requesterName: gb.requesterName,
        requesterPhone: gb.requesterPhone,
        checkIn: gb.checkIn,
        checkOut: gb.checkOut,
        peopleCount: gb.peopleCount,
        roomCount: gb.roomCount,
        status: gb.status,
        quoteAmount: gb.quoteAmount,
        paidAmount: gb.quoteAmount,
        remainingAmount: 0,
      },
      message: notificationMessage,
      isDeposit: false,
      isFullPayment: true,
      timestamp: new Date().toISOString(),
    };

    // Gửi đến tất cả admin và staff
    try {
      socketService.sendToRoom("role:admin", "group_booking_payment", paymentNotification);
      console.log(`📢 Đã gửi WebSocket notification thanh toán đủ đến room "role:admin" cho group booking: ${gb._id}`);
    } catch (adminError) {
      console.error("❌ Lỗi gửi notification thanh toán đủ đến admin:", adminError);
    }
    
    try {
      socketService.sendToRoom("role:staff", "group_booking_payment", paymentNotification);
      console.log(`📢 Đã gửi WebSocket notification thanh toán đủ đến room "role:staff" cho group booking: ${gb._id}`);
    } catch (staffError) {
      console.error("❌ Lỗi gửi notification thanh toán đủ đến staff:", staffError);
    }
    
    console.log(`✅ Đã lưu và gửi WebSocket notification thanh toán đủ cho group booking: ${gb._id}`);
    console.log(`📊 Thông tin thanh toán đủ:`, {
      message: notificationMessage,
      requesterName: gb.requesterName,
      paidAmount: gb.quoteAmount,
      status: gb.status,
    });
  } catch (notificationError) {
    console.error("❌ Lỗi lưu/gửi notification thanh toán đủ cho group booking:", notificationError);
    // Không throw error để không làm crash API, nhưng vẫn log chi tiết
    if (notificationError instanceof Error) {
      console.error("Error stack:", notificationError.stack);
    }
  }

  return gb;
};

const confirm = async (id: string) => {
  const gb = await GroupBooking.findById(id);
  if (!gb) throw createError(404, "Group booking not found");
  if (!["paid", "deposit_paid"].includes(gb.status))
    throw createError(400, "Chỉ có thể xác nhận đặt đoàn sau khi đã nhận đặt cọc");
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

  const wasDepositPaid = gb.status === "deposit_paid";
  const wasFullyPaid = gb.status === "paid" || gb.status === "confirmed";

  if (wasDepositPaid || wasFullyPaid) {
    gb.status = "refund_requested";
    gb.refundRequestedAt = now;
    const defaultRefund = wasDepositPaid
      ? calculateDepositAmount(gb.quoteAmount || 0)
      : gb.quoteAmount || 0;
    if (!gb.refundAmount) {
      gb.refundAmount = defaultRefund;
    }
    gb.remainingAmount = Math.max(0, (gb.quoteAmount || 0) - (gb.paidAmount || 0));
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

  if (!["refund_requested", "paid", "confirmed", "deposit_paid"].includes(gb.status)) {
    throw createError(400, "Chỉ có thể hoàn tiền cho đặt đoàn đã thanh toán hoặc đang chờ hoàn tiền");
  }

  const suggestedDeposit = calculateDepositAmount(gb.quoteAmount || 0);
  const defaultRefund =
    gb.status === "deposit_paid" && suggestedDeposit > 0 ? suggestedDeposit : gb.quoteAmount || 0;
  const refundAmount = options?.amount ?? defaultRefund;
  if (refundAmount < 0) {
    throw createError(400, "Số tiền hoàn không hợp lệ");
  }

  const processedAt = new Date();
  gb.status = "refunded";
  gb.refundProcessedAt = processedAt;
  gb.refundAmount = refundAmount;
  gb.paidAmount = Math.max(0, (gb.paidAmount || 0) - refundAmount);
  gb.remainingAmount = Math.max(0, (gb.quoteAmount || 0) - gb.paidAmount);
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
  markFullPayment,
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
  const breakdown: Array<{ 
    roomId: string; 
    roomNumber: string; 
    typeName?: string; 
    pricePerNight: number; 
    capacity?: number;
    extraHourPrice?: number;
    maxExtendHours?: number;
    amenities?: string[];
    nights: number; 
    subtotal: number;
  }> = [];
  for (const room of gb.allocatedRoomIds) {
    const pricePerNight = Number((room as any)?.typeId?.pricePerNight || 0);
    const typeName = (room as any)?.typeId?.name;
    const capacity = Number((room as any)?.typeId?.capacity || 0);
    const extraHourPrice = Number((room as any)?.typeId?.extraHourPrice || 0);
    const maxExtendHours = Number((room as any)?.typeId?.maxExtendHours || 0);
    const amenities = Array.isArray((room as any)?.typeId?.amenities) ? (room as any).typeId.amenities : [];
    const subtotal = pricePerNight * nights;
    total += subtotal;
    breakdown.push({
      roomId: String((room as any)?._id || room),
      roomNumber: (room as any)?.roomNumber || '',
      typeName,
      pricePerNight,
      capacity,
      extraHourPrice,
      maxExtendHours,
      amenities,
      nights,
      subtotal,
    });
  }

  return { nights, rooms: gb.allocatedRoomIds.length, amount: total, breakdown };
};


