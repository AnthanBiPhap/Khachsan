import createError from "http-errors";
import GroupBooking from "../models/groupBooking.model";
import Room from "../models/rooms.model";
import Booking from "../models/bookings.model";
import Payment from "../models/payments.model";
import Invoice from "../models/invoices.model";
import User from "../models/users.model";
import invoicesService from "./invoices.service";
import paymentsService from "./payments.service";
import socketService from "./socket.service";
import notificationsService from "./notifications.service";
import emailService from "./email.service";

// Tỷ lệ đặt cọc cho group booking (mặc định 50%)
const GROUP_DEPOSIT_RATE = Number(process.env.GROUP_DEPOSIT_RATE ?? 0.5);
// Nhãn hiển thị tỷ lệ đặt cọc dưới dạng phần trăm
const GROUP_DEPOSIT_PERCENT_LABEL = `${Math.round(GROUP_DEPOSIT_RATE * 100)}%`;

const calculateDepositAmount = (quoteAmount: number): number => {
  if (!quoteAmount || quoteAmount <= 0) return 0;
  return Math.max(0, Math.round(quoteAmount * GROUP_DEPOSIT_RATE));
};

type CreateGroupBookingPayload = {
  requesterId?: string;
  requesterName: string;
  requesterPhone: string;
  requesterEmail: string;
  checkIn: string | Date;
  checkOut: string | Date;
  peopleCount: number;
  roomCount: number;
  notes?: string;
};

/**
 * Tạo yêu cầu đặt phòng nhóm mới: validate email, normalize thời gian,
 * tạo group booking, gửi notification và email xác nhận
 */
const create = async (payload: CreateGroupBookingPayload) => {
  // Kiểm tra email có tồn tại không
  if (!payload.requesterEmail || !payload.requesterEmail.trim()) {
    throw createError(400, "Email là bắt buộc để đặt phòng nhóm");
  }

  // Kiểm tra định dạng email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(payload.requesterEmail.trim())) {
    throw createError(400, "Email không hợp lệ");
  }

  // Normalize check-in và check-out với giờ cụ thể
  // Check-in: 14:00, Check-out: 12:00 (giống booking thường)
  const normalizeCheckIn = (date: Date | string): Date => {
    const d = new Date(date);
    d.setHours(14, 0, 0, 0);
    return d;
  };

  const normalizeCheckOut = (date: Date | string): Date => {
    const d = new Date(date);
    d.setHours(12, 0, 0, 0);
    return d;
  };

  // Chuẩn hóa payload: trim email, normalize thời gian và set status mặc định
  const normalizedPayload = {
    ...payload,
    requesterEmail: payload.requesterEmail.trim(),
    checkIn: normalizeCheckIn(payload.checkIn),
    checkOut: normalizeCheckOut(payload.checkOut),
    status: "pending_approval" as const,
  };

  // Tạo group booking mới trong database
  const gb = await GroupBooking.create(normalizedPayload);

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

  // Gửi email xác nhận đặt phòng nhóm cho khách hàng
  try {
    console.log(`📧 Bắt đầu gửi email xác nhận cho group booking ${gb._id}`);
    
    const customerEmail = gb.requesterEmail || (gb.requesterId as any)?.email;
    
    if (!customerEmail) {
      console.warn(`⚠️ Không có email để gửi xác nhận cho group booking ${gb._id}`);
    } else {
      // Lấy thông tin phòng nếu đã được phân bổ
      let allocatedRooms: Array<{ roomNumber: string; typeName?: string }> | undefined;
      if (gb.allocatedRoomIds && gb.allocatedRoomIds.length > 0) {
        await gb.populate({
          path: "allocatedRoomIds",
          select: "roomNumber typeId",
          populate: {
            path: "typeId",
            select: "name"
          }
        });
        allocatedRooms = (gb.allocatedRoomIds as any[]).map((room: any) => ({
          roomNumber: room.roomNumber || "N/A",
          typeName: room.typeId?.name
        }));
      }

      await emailService.sendGroupBookingConfirmation({
        to: customerEmail,
        groupBookingId: gb._id.toString(),
        requesterName: gb.requesterName,
        checkIn: gb.checkIn,
        checkOut: gb.checkOut,
        peopleCount: gb.peopleCount,
        roomCount: gb.roomCount,
        quoteAmount: gb.quoteAmount ?? undefined,
        status: gb.status,
        allocatedRooms,
      });
      
      console.log(`✅ Đã gửi email xác nhận group booking đến ${customerEmail}`);
    }
  } catch (emailError) {
    console.error("❌ Lỗi gửi email xác nhận group booking:", emailError);
    // Không throw error để không làm crash API, nhưng vẫn log chi tiết
    if (emailError instanceof Error) {
      console.error("Error stack:", emailError.stack);
    }
  }

  return gb;
};

/**
 * Lấy thông tin chi tiết của một group booking theo ID,
 * bao gồm thông tin phòng đã phân bổ và người yêu cầu
 */
const getById = async (id: string) => {
  const gb = await GroupBooking.findById(id)
    .populate({ path: "allocatedRoomIds", select: "roomNumber typeId", populate: { path: "typeId", select: "pricePerNight name capacity extraHourPrice maxExtendHours amenities" } })
    .populate("requesterId", "fullName email phoneNumber");
  if (!gb) throw createError(404, "Không tìm thấy đặt phòng nhóm");
  return gb;
};

/**
 * Lấy danh sách group bookings với các bộ lọc (status, requesterId, khoảng thời gian)
 */
const list = async (query: any = {}) => {
  const q: any = {};
  // Lọc theo status nếu có
  if (query.status) q.status = query.status;
  // Lọc theo requesterId nếu có
  if (query.requesterId) q.requesterId = query.requesterId;
  // Lọc theo khoảng thời gian tạo nếu có
  if (query.from || query.to) {
    q.createdAt = {} as any;
    if (query.from) q.createdAt.$gte = new Date(query.from);
    if (query.to) q.createdAt.$lte = new Date(query.to);
  }
  // Tìm và sắp xếp theo thời gian tạo mới nhất
  const items = await GroupBooking.find(q)
    .sort({ createdAt: -1 })
    .populate("allocatedRoomIds", "roomNumber typeId");
  return items;
};

/**
 * Kiểm tra phòng khả dụng cho group booking: tìm các phòng không bị trùng lịch
 * với booking thường và group booking khác trong khoảng thời gian chỉ định
 */
const checkAvailability = async (checkIn: Date, checkOut: Date, excludeGroupBookingId?: string) => {
  // Load tất cả phòng với thông tin loại phòng (giá/sức chứa)
  const rooms = await Room.find({}).populate('typeId', 'pricePerNight capacity name');
  const allRoomIds = rooms.map((r) => r._id);

  // Normalize checkIn và checkOut để so sánh chính xác
  const normalizeCheckIn = (date: Date | string): Date => {
    const d = new Date(date);
    d.setHours(14, 0, 0, 0); // Check-in lúc 14:00
    return d;
  };

  const normalizeCheckOut = (date: Date | string): Date => {
    const d = new Date(date);
    d.setHours(12, 0, 0, 0); // Check-out lúc 12:00 (không có extra hours cho group booking)
    return d;
  };

  const searchCheckIn = normalizeCheckIn(checkIn);
  const searchCheckOut = normalizeCheckOut(checkOut);

  console.log(`   🔍 [checkAvailability] Search range: ${searchCheckIn.toISOString()} → ${searchCheckOut.toISOString()}`);

  // Find bookings overlapping interval (đặt phòng thường)
  // Tìm các booking có overlap với khoảng thời gian tìm kiếm
  // Logic overlap: booking.checkIn < searchCheckOut && booking.checkOut > searchCheckIn
  const bookings = await Booking.find({
    roomId: { $in: allRoomIds },
    paymentStatus: { $ne: "cancelled" },
    checkIn: { $lt: searchCheckOut },
    checkOut: { $gt: searchCheckIn },
  }).select("roomId checkIn checkOut paymentStatus");

  console.log(`   📋 Found ${bookings.length} regular bookings that might overlap`);

  // Find group bookings overlapping interval (đặt phòng theo đoàn)
  // Tìm các group booking đã được allocate và có overlap với khoảng thời gian tìm kiếm
  // Logic overlap: groupBooking.checkIn < searchCheckOut && groupBooking.checkOut > searchCheckIn
  const groupBookingQuery: any = {
    status: { $nin: ["cancelled", "rejected", "refunded"] }, // Loại các status không còn hiệu lực
    allocatedRoomIds: { $in: allRoomIds }, // Có allocate phòng trong danh sách
    checkIn: { $lt: searchCheckOut },
    checkOut: { $gt: searchCheckIn },
  };
  
  // Nếu có excludeGroupBookingId (khi update), loại trừ chính nó
  if (excludeGroupBookingId) {
    groupBookingQuery._id = { $ne: excludeGroupBookingId };
  }
  
  const groupBookings = await GroupBooking.find(groupBookingQuery)
    .select("allocatedRoomIds checkIn checkOut status");

  // Tạo map các phòng đã bị book với khoảng thời gian overlap
  // Key: roomId, Value: array of {checkIn, checkOut}
  const bookedRoomsMap = new Map<string, Array<{ checkIn: Date; checkOut: Date }>>();
  
  // Thêm các phòng từ Booking thường (kiểm tra overlap chính xác với giờ)
  // Normalize checkIn về 14:00 và checkOut về 12:00 (ngày checkOut) để so sánh chính xác
  bookings.forEach((b: any) => {
    if (b.roomId) {
      const roomId = String(b.roomId);
      const bookingCheckIn = normalizeCheckIn(b.checkIn);
      // Booking thường có thể có extra hours, nhưng để so sánh overlap với group booking,
      // ta cần normalize checkOut về 12:00 của ngày checkOut để đảm bảo logic chính xác
      const bookingCheckOutNormalized = normalizeCheckOut(b.checkOut);
      // Nhưng nếu booking có extra hours, checkOut thực tế có thể muộn hơn 12:00
      // Nên ta lấy max giữa checkOut gốc và checkOut normalized
      const bookingCheckOutOriginal = new Date(b.checkOut);
      const bookingCheckOut = bookingCheckOutOriginal > bookingCheckOutNormalized 
        ? bookingCheckOutOriginal 
        : bookingCheckOutNormalized;
      
      // Kiểm tra overlap chính xác
      const isOverlap = bookingCheckIn < searchCheckOut && bookingCheckOut > searchCheckIn;
      
      if (isOverlap) {
        console.log(`   ⚠️  Regular booking overlaps: Room ${roomId}, CheckIn: ${bookingCheckIn.toISOString()}, CheckOut: ${bookingCheckOut.toISOString()}`);
        if (!bookedRoomsMap.has(roomId)) {
          bookedRoomsMap.set(roomId, []);
        }
        bookedRoomsMap.get(roomId)!.push({
          checkIn: bookingCheckIn,
          checkOut: bookingCheckOut
        });
      }
    }
  });
  
  // Thêm các phòng từ GroupBooking đã được allocate (kiểm tra overlap chính xác với giờ)
  groupBookings.forEach((gb: any) => {
    if (gb.allocatedRoomIds && Array.isArray(gb.allocatedRoomIds)) {
      const gbCheckIn = normalizeCheckIn(gb.checkIn);
      const gbCheckOut = normalizeCheckOut(gb.checkOut);
      
      // Kiểm tra overlap chính xác
      const isOverlap = gbCheckIn < searchCheckOut && gbCheckOut > searchCheckIn;
      
      if (isOverlap) {
        gb.allocatedRoomIds.forEach((roomId: any) => {
          const roomIdStr = String(roomId);
          if (!bookedRoomsMap.has(roomIdStr)) {
            bookedRoomsMap.set(roomIdStr, []);
          }
          bookedRoomsMap.get(roomIdStr)!.push({
            checkIn: gbCheckIn,
            checkOut: gbCheckOut
          });
        });
      }
    }
  });

  // Lọc các phòng khả dụng (không có trong bookedRoomsMap)
  const availableRooms = rooms.filter((r: any) => !bookedRoomsMap.has(String(r._id)));
  console.log(`   📊 Booked rooms: ${bookedRoomsMap.size}, Available rooms: ${availableRooms.length}`);
  return availableRooms as any[];
};

/**
 * Chọn tổ hợp phòng tối ưu về giá để đáp ứng số lượng phòng và sức chứa yêu cầu
 * Sử dụng thuật toán DFS với pruning để tìm tổ hợp có giá thấp nhất
 */
function chooseOptimalRooms(
  rooms: Array<any>,
  requiredRooms: number,
  requiredPeople: number
): Array<any> | null {
  // Sắp xếp theo giá tăng dần để hỗ trợ pruning
  const sorted = [...rooms].sort((a: any, b: any) => (
    Number(a?.typeId?.pricePerNight || 0) - Number(b?.typeId?.pricePerNight || 0)
  ));

  let bestCombo: Array<any> | null = null;
  let bestPrice = Infinity;

  const n = sorted.length;

  // Hàm đệ quy DFS để tìm tổ hợp phòng tối ưu
  const dfs = (start: number, picked: Array<any>, capSum: number, priceSum: number) => {
    // Nếu đã chọn đủ số phòng yêu cầu
    if (picked.length === requiredRooms) {
      // Nếu tổng sức chứa đủ và giá tốt hơn thì cập nhật
      if (capSum >= requiredPeople && priceSum < bestPrice) {
        bestPrice = priceSum;
        bestCombo = [...picked];
      }
      return;
    }

    // Nếu số phòng còn lại không đủ để chọn đủ số phòng yêu cầu thì dừng
    if (n - start < requiredRooms - picked.length) return;

    for (let i = start; i < n; i++) {
      const room = sorted[i];
      const price = Number(room?.typeId?.pricePerNight || 0);
      const capacity = Number(room?.typeId?.capacity || 0);

      // Pruning: nếu giá hiện tại đã vượt quá giá tốt nhất thì bỏ qua
      if (priceSum + price >= bestPrice) continue;

      // Thử chọn phòng này và tiếp tục đệ quy
      picked.push(room);
      dfs(i + 1, picked, capSum + capacity, priceSum + price);
      // Backtrack: bỏ phòng này ra để thử phòng khác
      picked.pop();
    }
  };

  // Bắt đầu tìm kiếm từ đầu
  dfs(0, [], 0, 0);
  return bestCombo;
}

/**
 * Thêm ghi chú vào group booking
 */
const appendNote = (gb: any, label: string, content?: string) => {
  // Nếu không có nội dung thì không thêm
  if (!content) return;
  const entry = `${label}: ${content}`.trim();
  // Nối thêm vào notes hiện có hoặc tạo mới
  gb.notes = gb.notes ? `${gb.notes}\n${entry}` : entry;
};

/**
 * Định dạng khoảng thời gian check-in đến check-out theo định dạng tiếng Việt
 */
const formatDateRange = (checkIn: Date | string, checkOut: Date | string) => {
  const formatter = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" });
  const start = formatter.format(new Date(checkIn));
  const end = formatter.format(new Date(checkOut));
  return `${start} → ${end}`;
};

/**
 * Từ chối group booking: cập nhật status, ghi chú và gửi email thông báo
 */
const rejectGroupBooking = async (gb: any, reason: string) => {
  // Cập nhật status và thời gian từ chối
  gb.status = "rejected";
  gb.rejectedAt = new Date();
  appendNote(gb, "Rejected", reason);
  await gb.save();

  // Gửi email thông báo từ chối
  try {
    if (gb.requesterEmail) {
      await emailService.sendGroupBookingRejected({
        to: gb.requesterEmail,
        groupBookingId: gb._id.toString(),
        requesterName: gb.requesterName,
        checkIn: gb.checkIn,
        checkOut: gb.checkOut,
        reason: reason,
      });
      console.log(`✅ Đã gửi email từ chối group booking đến ${gb.requesterEmail}`);
    }
  } catch (emailError) {
    console.error("❌ Lỗi gửi email từ chối group booking:", emailError);
    // Không throw error để không ảnh hưởng đến flow chính
  }
};

/**
 * Duyệt group booking: kiểm tra phòng khả dụng, chọn phòng tối ưu,
 * phân bổ phòng, gửi email và notification
 */
const approve = async (id: string) => {
  const gb = await GroupBooking.findById(id);
  // Nếu không tìm thấy group booking thì báo lỗi
  if (!gb) throw createError(404, "Không tìm thấy đặt phòng nhóm");
  // Chỉ có thể duyệt khi status là pending_approval
  if (gb.status !== "pending_approval")
    throw createError(400, "Only pending_approval can be approved");

  console.log(`🔍 [Group Booking Approve] Checking availability for group booking ${id}`);
  console.log(`   Check-in: ${gb.checkIn}, Check-out: ${gb.checkOut}`);
  console.log(`   Required rooms: ${gb.roomCount}, Required people: ${gb.peopleCount}`);

  const availableRooms = await checkAvailability(gb.checkIn, gb.checkOut);
  console.log(`   Available rooms: ${availableRooms.length}`);
  
  if (availableRooms.length < gb.roomCount) {
    const reason = `Không đủ phòng trống trong giai đoạn ${formatDateRange(
      gb.checkIn,
      gb.checkOut
    )}. Yêu cầu ${gb.roomCount} phòng, khả dụng ${availableRooms.length} phòng.`;
    console.log(`   ❌ Rejecting: ${reason}`);
    await rejectGroupBooking(gb, reason);
    throw createError(400, "Không đủ phòng trống để duyệt yêu cầu đặt đoàn");
  }

  // Chọn tổ hợp phòng tối ưu về giá đáp ứng sức chứa và số lượng phòng
  const optimal = chooseOptimalRooms(availableRooms, gb.roomCount, gb.peopleCount);
  // Nếu không tìm được tổ hợp phòng phù hợp thì từ chối
  if (!optimal) {
    const reason = `Không tìm được tổ hợp phòng đáp ứng ${gb.peopleCount} khách trong giai đoạn ${formatDateRange(
      gb.checkIn,
      gb.checkOut
    )}.`;
    await rejectGroupBooking(gb, reason);
    throw createError(400, "Không thể tìm được tổ hợp phòng đáp ứng yêu cầu đoàn");
  }
  // Phân bổ phòng đã chọn
  gb.allocatedRoomIds = optimal.map((r: any) => r._id);
  gb.status = "approved";
  await gb.save();

  // Populate allocatedRoomIds để lấy thông tin phòng
  await gb.populate({
    path: "allocatedRoomIds",
    select: "roomNumber typeId",
    populate: { path: "typeId", select: "name" }
  });

  // Gửi email thông báo duyệt group booking
  try {
    if (gb.requesterEmail) {
      const allocatedRooms = (gb.allocatedRoomIds as any[]).map((room: any) => ({
        roomNumber: room.roomNumber,
        typeName: room.typeId?.name || undefined,
      }));

      await emailService.sendGroupBookingApproval({
        to: gb.requesterEmail,
        groupBookingId: gb._id.toString(),
        requesterName: gb.requesterName,
        checkIn: gb.checkIn,
        checkOut: gb.checkOut,
        peopleCount: gb.peopleCount,
        roomCount: gb.roomCount,
        allocatedRooms: allocatedRooms,
      });
      console.log(`✅ Đã gửi email duyệt group booking đến ${gb.requesterEmail}`);
    }
  } catch (emailError) {
    console.error("❌ Lỗi gửi email duyệt group booking:", emailError);
    // Không throw error để không ảnh hưởng đến flow chính
  }

  // Gửi socket notification và lưu vào database cho khách hàng
  try {
    console.log(`📢 [Approve Group Booking] Bắt đầu gửi notification cho group booking ${gb._id}`);
    console.log(`   requesterId (before populate):`, gb.requesterId);
    console.log(`   requesterEmail:`, gb.requesterEmail);
    
    await gb.populate("requesterId", "fullName email phoneNumber");
    
    console.log(`   requesterId (after populate):`, gb.requesterId);
    
    // Lấy userId từ requesterId hoặc từ requesterEmail (nếu có user với email đó)
    let userId: string | null = null;
    if (gb.requesterId) {
      const requester = gb.requesterId as any;
      userId = requester._id.toString();
      console.log(`   ✅ Tìm thấy userId từ requesterId: ${userId}`);
    } else if (gb.requesterEmail) {
      // Nếu không có requesterId, tìm user theo email
      console.log(`   🔍 Tìm user theo email: ${gb.requesterEmail}`);
      const userByEmail = await User.findOne({ email: gb.requesterEmail, role: "customer" });
      if (userByEmail) {
        userId = userByEmail._id.toString();
        console.log(`   ✅ Tìm thấy userId từ email: ${userId}`);
      } else {
        console.log(`   ⚠️ Không tìm thấy user với email: ${gb.requesterEmail}`);
      }
    }
    
    if (userId) {
      const notificationMessage = `Yêu cầu đặt phòng nhóm của bạn đã được duyệt. Vui lòng chờ báo giá từ khách sạn.`;
      
      console.log(`📢 [Approve Group Booking] Gửi notification đến user ${userId} cho group booking ${gb._id}`);
      
      // Lưu notification vào database
      const notification = await notificationsService.create({
        type: "group_booking_approved",
        title: "Đặt phòng nhóm đã được duyệt",
        message: notificationMessage,
        userId: userId,
        recipients: [{
          userId: userId,
          role: "customer",
          read: false,
        }],
        metadata: {
          groupBookingId: gb._id.toString(),
          requesterName: gb.requesterName,
          requesterPhone: gb.requesterPhone,
          requesterEmail: gb.requesterEmail,
          roomCount: gb.roomCount,
          peopleCount: gb.peopleCount,
        },
      });
      console.log(`✅ Đã lưu notification vào database: ${notification._id}`);
      
      // Gửi socket notification
      const socketNotification = {
        type: "group_booking_approved",
        groupBooking: {
          _id: gb._id.toString(),
          requesterName: gb.requesterName,
          checkIn: gb.checkIn,
          checkOut: gb.checkOut,
          roomCount: gb.roomCount,
          peopleCount: gb.peopleCount,
        },
        message: notificationMessage,
        timestamp: new Date().toISOString(),
      };
      
      console.log(`📤 [Approve Group Booking] Gửi socket notification đến user ${userId}`);
      console.log(`   Event: group_booking_update`);
      console.log(`   Data:`, JSON.stringify(socketNotification, null, 2));
      console.log(`   UserId type: ${typeof userId}, value: ${userId}`);
      
      // Đảm bảo userId là string
      const userIdStr = userId.toString();
      console.log(`   UserId string: ${userIdStr}`);
      
      socketService.sendToUser(userIdStr, "group_booking_update", socketNotification);
      console.log(`✅ Đã gửi socket notification và lưu notification duyệt group booking đến customer ${userIdStr}`);
    } else {
      console.log(`⚠️ ⚠️ ⚠️ Không tìm thấy user để gửi notification cho group booking ${gb._id}`);
      console.log(`   requesterEmail: ${gb.requesterEmail}`);
      console.log(`   requesterId: ${gb.requesterId}`);
    }
  } catch (notificationError) {
    console.error("❌ ❌ ❌ Lỗi gửi notification duyệt group booking:", notificationError);
    console.error("❌ Error details:", notificationError);
    if (notificationError instanceof Error) {
      console.error("❌ Error stack:", notificationError.stack);
    }
  }

  return gb;
};

/**
 * Upload danh sách thành viên cho group booking: validate số lượng người,
 * kiểm tra sức chứa phòng và lưu thông tin thành viên
 */
const uploadMembers = async (id: string, members: any[]) => {
  const gb = await GroupBooking.findById(id)
    .populate({
      path: "allocatedRoomIds",
      select: "roomNumber typeId",
      populate: {
        path: "typeId",
        select: "capacity"
      }
    });
  // Nếu không tìm thấy group booking thì báo lỗi
  if (!gb) throw createError(404, "Không tìm thấy đặt phòng nhóm");
  
  // Chỉ cho phép upload khi đã có báo giá (quoted hoặc awaiting_payment)
  if (!["quoted", "awaiting_payment"].includes(gb.status)) {
    throw createError(400, "Chỉ có thể upload danh sách sau khi admin đã báo giá");
  }
  
  // Phải có phòng được phân bổ mới có thể upload danh sách
  if (!gb.allocatedRoomIds || gb.allocatedRoomIds.length === 0) {
    throw createError(400, "Chưa có phòng được phân bổ, không thể upload danh sách");
  }

  // Lấy danh sách số phòng hợp lệ và capacity của từng phòng
  const roomInfoMap = new Map<string, { roomNumber: string; capacity: number }>();
  const validRoomNumbers: string[] = [];
  
  (gb.allocatedRoomIds as any[]).forEach((r: any) => {
    const roomNumber = String(r.roomNumber || "").trim();
    if (roomNumber) {
      const roomType = r.typeId as any;
      const capacity = roomType?.capacity || 0;
      validRoomNumbers.push(roomNumber);
      roomInfoMap.set(roomNumber, { roomNumber, capacity });
    }
  });
  
  if (validRoomNumbers.length === 0) {
    throw createError(400, "Không có số phòng hợp lệ");
  }

  // Validate và xử lý danh sách thành viên
  // Lọc bỏ các dòng trống (không có fullName) trước khi xử lý
  const validMembers = (Array.isArray(members) ? members : []).filter((m: any) => {
    const fullName = String(m.fullName || "").trim();
    return fullName.length > 0;
  });
  
  // Kiểm tra số lượng người phải khớp với peopleCount
  const expectedPeopleCount = gb.peopleCount || 0;
  const actualPeopleCount = validMembers.length;
  
  // Nếu số lượng không khớp thì báo lỗi
  if (actualPeopleCount !== expectedPeopleCount) {
    throw createError(
      400,
      `Số lượng người trong file không khớp với yêu cầu. Yêu cầu: ${expectedPeopleCount} người, nhưng file có: ${actualPeopleCount} người. Vui lòng kiểm tra lại và đảm bảo file có đúng ${expectedPeopleCount} người.`
    );
  }
  
  // Đếm số người trong từng phòng
  const roomGuestCount = new Map<string, number>();
  
  const processedMembers = validMembers.map((m: any) => {
    const roomNumber = String(m.roomNumber || "").trim();
    
    // Kiểm tra số phòng có hợp lệ không (nếu có)
    if (roomNumber && !validRoomNumbers.includes(roomNumber)) {
      throw createError(
        400,
        `Số phòng "${roomNumber}" không hợp lệ. Danh sách phòng hợp lệ: ${validRoomNumbers.join(", ")}`
      );
    }
    
    // Đếm số người trong phòng
    if (roomNumber) {
      const currentCount = roomGuestCount.get(roomNumber) || 0;
      roomGuestCount.set(roomNumber, currentCount + 1);
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

  // Kiểm tra sức chứa của từng phòng
  for (const [roomNumber, guestCount] of roomGuestCount.entries()) {
    const roomInfo = roomInfoMap.get(roomNumber);
    // Nếu phòng có thông tin sức chứa, kiểm tra số lượng khách
    if (roomInfo && roomInfo.capacity > 0) {
      // Nếu số lượng khách vượt quá sức chứa thì báo lỗi
      if (guestCount > roomInfo.capacity) {
        throw createError(
          400,
          `Phòng ${roomNumber} chỉ có thể chứa tối đa ${roomInfo.capacity} người. Bạn đang đặt ${guestCount} người trong phòng này.`
        );
      }
    }
  }

  // Gán danh sách thành viên đã xử lý vào group booking
  // Sử dụng type assertion vì Mongoose DocumentArray có thể nhận array thông thường
  gb.members = processedMembers as any;
  gb.status = "info_uploaded";
  await gb.save();
  return gb;
};

/**
 * Báo giá cho group booking: cập nhật quoteAmount, paymentLink, status
 * và gửi email, notification cho khách hàng
 */
const quote = async (
  id: string,
  quoteAmount: number,
  paymentLink?: string
) => {
  const gb = await GroupBooking.findById(id);
  // Nếu không tìm thấy group booking thì báo lỗi
  if (!gb) throw createError(404, "Không tìm thấy đặt phòng nhóm");
  // Chỉ cho phép báo giá sau khi đã duyệt hoặc đã upload thông tin thành viên
  if (gb.status !== "info_uploaded" && gb.status !== "approved")
    throw createError(400, "Can only quote after info uploaded or approval");

  // Cập nhật báo giá và link thanh toán
  gb.quoteAmount = quoteAmount;
  gb.paymentLink = paymentLink;
  // Nếu có paymentLink thì status là awaiting_payment, không thì là quoted
  gb.status = paymentLink ? "awaiting_payment" : "quoted";
  await gb.save();

  // Gửi email thông báo báo giá
  try {
    if (gb.requesterEmail) {
      await emailService.sendGroupBookingQuoted({
        to: gb.requesterEmail,
        groupBookingId: gb._id.toString(),
        requesterName: gb.requesterName,
        checkIn: gb.checkIn,
        checkOut: gb.checkOut,
        peopleCount: gb.peopleCount,
        roomCount: gb.roomCount,
        quoteAmount: quoteAmount,
        paymentLink: paymentLink,
      });
      console.log(`✅ Đã gửi email báo giá group booking đến ${gb.requesterEmail}`);
    }
  } catch (emailError) {
    console.error("❌ Lỗi gửi email báo giá group booking:", emailError);
    // Không throw error để không ảnh hưởng đến flow chính
  }

  // Gửi socket notification và lưu vào database cho khách hàng
  try {
    await gb.populate("requesterId", "fullName email phoneNumber");
    if (gb.requesterId) {
      const requester = gb.requesterId as any;
      const formattedAmount = new Intl.NumberFormat("vi-VN").format(quoteAmount);
      const notificationMessage = paymentLink 
        ? `Khách sạn đã báo giá ${formattedAmount} VND cho đặt phòng nhóm của bạn. Vui lòng thanh toán qua link: ${paymentLink}`
        : `Khách sạn đã báo giá ${formattedAmount} VND cho đặt phòng nhóm của bạn.`;
      
      // Lưu notification vào database
      await notificationsService.create({
        type: "group_booking_quoted",
        title: "Đã nhận báo giá đặt phòng nhóm",
        message: notificationMessage,
        userId: requester._id,
        recipients: [{
          userId: requester._id,
          role: "customer",
          read: false,
        }],
        metadata: {
          groupBookingId: gb._id.toString(),
          requesterName: gb.requesterName,
          requesterPhone: gb.requesterPhone,
          requesterEmail: gb.requesterEmail,
          quoteAmount: quoteAmount,
          paymentLink: paymentLink,
          roomCount: gb.roomCount,
          peopleCount: gb.peopleCount,
        },
      });
      
      // Gửi socket notification
      const socketNotification = {
        type: "group_booking_quoted",
        groupBooking: {
          _id: gb._id.toString(),
          requesterName: gb.requesterName,
          checkIn: gb.checkIn,
          checkOut: gb.checkOut,
          quoteAmount: quoteAmount,
          roomCount: gb.roomCount,
          peopleCount: gb.peopleCount,
        },
        message: notificationMessage,
        timestamp: new Date().toISOString(),
      };
      
      socketService.sendToUser(requester._id.toString(), "group_booking_update", socketNotification);
      console.log(`✅ Đã gửi socket notification và lưu notification báo giá group booking đến customer ${requester._id}`);
    }
  } catch (notificationError) {
    console.error("❌ Lỗi gửi notification báo giá group booking:", notificationError);
  }

  return gb;
};

/**
 * Đánh dấu group booking đã thanh toán: tính số tiền đặt cọc hoặc thanh toán đủ,
 * tạo invoice và payment, gửi notification cho admin/staff
 */
const markPaid = async (
  id: string,
  options?: { stripeSessionId?: string; stripePaymentIntentId?: string; stripeCustomerId?: string }
) => {
  const gb = await GroupBooking.findById(id)
    .populate("requesterId", "fullName email phoneNumber");
  // Nếu không tìm thấy group booking thì báo lỗi
  if (!gb) throw createError(404, "Không tìm thấy đặt phòng nhóm");
  // Phải có báo giá mới có thể đánh dấu đã thanh toán
  if (!gb.quoteAmount) throw createError(400, "Quote not set");
  // Chỉ có thể đánh dấu thanh toán khi ở các trạng thái hợp lệ
  if (!["awaiting_payment", "quoted", "info_uploaded"].includes(gb.status))
    throw createError(400, "Invalid state to mark paid");

  // Tính số tiền đặt cọc và số tiền thanh toán
  const depositAmount = calculateDepositAmount(gb.quoteAmount);
  // Nếu có đặt cọc thì thanh toán số tiền đặt cọc, không thì thanh toán đủ
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
  if (!gb) throw createError(404, "Không tìm thấy đặt phòng nhóm");
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

  // Tìm hoặc tạo invoice và gửi email với PDF
  let invoice = await Invoice.findOne({ groupBookingId: gb._id });
  try {
    if (invoice) {
      await invoicesService.updateById(invoice._id.toString(), {
        totalAmount: gb.quoteAmount,
        paidAmount: gb.quoteAmount,
        remainingAmount: 0,
        paymentStatus: "paid",
        status: "paid",
      });
    } else {
      // Nếu chưa có invoice, tạo mới
      try {
        invoice = await invoicesService.create({
          groupBookingId: gb._id.toString(),
          customerId: gb.requesterId || undefined,
          totalAmount: gb.quoteAmount,
          paidAmount: gb.quoteAmount,
          remainingAmount: 0,
          paymentStatus: "paid",
          status: "paid",
          issuedAt: new Date(),
        });
        console.log(`✅ Đã tạo invoice mới cho group booking ${gb._id}`);
      } catch (createInvoiceError) {
        console.error("❌ Lỗi tạo invoice:", createInvoiceError);
      }
    }
  } catch (invoiceError) {
    console.error(`❌ Lỗi cập nhật invoice khi tất toán group booking ${gb._id}:`, invoiceError);
  }

  // Gửi email thông báo thanh toán đủ với PDF hóa đơn
  try {
    if (gb.requesterEmail) {
      let invoicePdfBuffer: Buffer | undefined = undefined;
      let invoiceFileName: string | undefined = undefined;

      if (invoice) {
        try {
          // Tạo PDF hóa đơn
          invoicePdfBuffer = await invoicesService.printInvoice(invoice._id.toString());
          invoiceFileName = `HoaDon_GroupBooking_${gb._id.toString()}.pdf`;
          console.log(`✅ Đã tạo PDF hóa đơn: ${invoiceFileName}`);
        } catch (pdfError) {
          console.error("❌ Lỗi tạo PDF hóa đơn:", pdfError);
          // Vẫn gửi email nhưng không có PDF
        }
      }

      await emailService.sendGroupBookingFullPayment({
        to: gb.requesterEmail,
        groupBookingId: gb._id.toString(),
        requesterName: gb.requesterName,
        checkIn: gb.checkIn,
        checkOut: gb.checkOut,
        peopleCount: gb.peopleCount,
        roomCount: gb.roomCount,
        totalAmount: gb.quoteAmount,
        paidAmount: gb.quoteAmount,
        invoicePdfBuffer: invoicePdfBuffer,
        invoiceFileName: invoiceFileName,
      });
      console.log(`✅ Đã gửi email thanh toán đủ group booking với hóa đơn đến ${gb.requesterEmail}`);
    }
  } catch (emailError) {
    console.error("❌ Lỗi gửi email thanh toán đủ group booking:", emailError);
    // Không throw error để không ảnh hưởng đến flow chính
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

  // Gửi socket notification và lưu vào database cho khách hàng
  try {
    console.log(`📢 [Mark Full Payment] Bắt đầu gửi notification cho customer - group booking ${gb._id}`);
    
    // Lấy userId từ requesterId hoặc từ requesterEmail (nếu có user với email đó)
    let userId: string | null = null;
    if (gb.requesterId) {
      const requester = gb.requesterId as any;
      userId = requester._id.toString();
      console.log(`   ✅ Tìm thấy userId từ requesterId: ${userId}`);
    } else if (gb.requesterEmail) {
      // Nếu không có requesterId, tìm user theo email
      console.log(`   🔍 Tìm user theo email: ${gb.requesterEmail}`);
      const userByEmail = await User.findOne({ email: gb.requesterEmail, role: "customer" });
      if (userByEmail) {
        userId = userByEmail._id.toString();
        console.log(`   ✅ Tìm thấy userId từ email: ${userId}`);
      } else {
        console.log(`   ⚠️ Không tìm thấy user với email: ${gb.requesterEmail}`);
      }
    }
    
    if (userId) {
      const formattedAmount = new Intl.NumberFormat("vi-VN").format(gb.quoteAmount);
      const notificationMessage = `Đặt phòng nhóm của bạn đã được thanh toán đầy đủ ${formattedAmount} VND.`;
      
      console.log(`📢 [Mark Full Payment] Gửi notification đến user ${userId} cho group booking ${gb._id}`);
      
      // Lưu notification vào database
      const notification = await notificationsService.create({
        type: "group_booking_paid",
        title: "Đã thanh toán đầy đủ đặt phòng nhóm",
        message: notificationMessage,
        userId: userId,
        recipients: [{
          userId: userId,
          role: "customer",
          read: false,
        }],
        metadata: {
          groupBookingId: gb._id.toString(),
          requesterName: gb.requesterName,
          requesterPhone: gb.requesterPhone,
          requesterEmail: gb.requesterEmail,
          quoteAmount: gb.quoteAmount,
          paidAmount: gb.quoteAmount,
          roomCount: gb.roomCount,
          peopleCount: gb.peopleCount,
        },
      });
      console.log(`✅ Đã lưu notification vào database: ${notification._id}`);
      
      // Gửi socket notification
      const socketNotification = {
        type: "group_booking_paid",
        groupBooking: {
          _id: gb._id.toString(),
          requesterName: gb.requesterName,
          checkIn: gb.checkIn,
          checkOut: gb.checkOut,
          quoteAmount: gb.quoteAmount,
          paidAmount: gb.quoteAmount,
          roomCount: gb.roomCount,
          peopleCount: gb.peopleCount,
        },
        message: notificationMessage,
        timestamp: new Date().toISOString(),
      };
      
      console.log(`📤 [Mark Full Payment] Gửi socket notification đến user ${userId}`);
      console.log(`   Event: group_booking_update`);
      console.log(`   Data:`, JSON.stringify(socketNotification, null, 2));
      
      socketService.sendToUser(userId, "group_booking_update", socketNotification);
      console.log(`✅ Đã gửi socket notification và lưu notification thanh toán đủ đến customer ${userId}`);
    } else {
      console.log(`⚠️ ⚠️ ⚠️ Không tìm thấy user để gửi notification cho group booking ${gb._id}`);
      console.log(`   requesterEmail: ${gb.requesterEmail}`);
      console.log(`   requesterId: ${gb.requesterId}`);
    }
  } catch (notificationError) {
    console.error("❌ ❌ ❌ Lỗi gửi notification thanh toán đủ cho customer:", notificationError);
    console.error("❌ Error details:", notificationError);
    if (notificationError instanceof Error) {
      console.error("❌ Error stack:", notificationError.stack);
    }
  }

  return gb;
};

const confirm = async (id: string) => {
  const gb = await GroupBooking.findById(id);
  if (!gb) throw createError(404, "Không tìm thấy đặt phòng nhóm");
  if (!["paid", "deposit_paid"].includes(gb.status))
    throw createError(400, "Chỉ có thể xác nhận đặt đoàn sau khi đã nhận đặt cọc");
  gb.status = "confirmed";
  await gb.save();

  // Gửi email thông báo xác nhận
  try {
    if (gb.requesterEmail) {
      await emailService.sendGroupBookingConfirmed({
        to: gb.requesterEmail,
        groupBookingId: gb._id.toString(),
        requesterName: gb.requesterName,
        checkIn: gb.checkIn,
        checkOut: gb.checkOut,
        peopleCount: gb.peopleCount,
        roomCount: gb.roomCount,
      });
      console.log(`✅ Đã gửi email xác nhận group booking đến ${gb.requesterEmail}`);
    }
  } catch (emailError) {
    console.error("❌ Lỗi gửi email xác nhận group booking:", emailError);
    // Không throw error để không ảnh hưởng đến flow chính
  }

  // Gửi socket notification và lưu vào database cho khách hàng
  try {
    console.log(`📢 [Confirm Group Booking] Bắt đầu gửi notification cho customer - group booking ${gb._id}`);
    
    await gb.populate("requesterId", "fullName email phoneNumber");
    
    // Lấy userId từ requesterId hoặc từ requesterEmail (nếu có user với email đó)
    let userId: string | null = null;
    if (gb.requesterId) {
      const requester = gb.requesterId as any;
      userId = requester._id.toString();
      console.log(`   ✅ Tìm thấy userId từ requesterId: ${userId}`);
    } else if (gb.requesterEmail) {
      // Nếu không có requesterId, tìm user theo email
      console.log(`   🔍 Tìm user theo email: ${gb.requesterEmail}`);
      const userByEmail = await User.findOne({ email: gb.requesterEmail, role: "customer" });
      if (userByEmail) {
        userId = userByEmail._id.toString();
        console.log(`   ✅ Tìm thấy userId từ email: ${userId}`);
      } else {
        console.log(`   ⚠️ Không tìm thấy user với email: ${gb.requesterEmail}`);
      }
    }
    
    if (userId) {
      const notificationMessage = `Đặt phòng nhóm của bạn đã được xác nhận hoàn tất. Chúng tôi rất mong được phục vụ bạn!`;
      
      console.log(`📢 [Confirm Group Booking] Gửi notification đến user ${userId} cho group booking ${gb._id}`);
      
      // Lưu notification vào database
      const notification = await notificationsService.create({
        type: "group_booking_confirmed",
        title: "Đặt phòng nhóm đã được xác nhận hoàn tất",
        message: notificationMessage,
        userId: userId,
        recipients: [{
          userId: userId,
          role: "customer",
          read: false,
        }],
        metadata: {
          groupBookingId: gb._id.toString(),
          requesterName: gb.requesterName,
          requesterPhone: gb.requesterPhone,
          requesterEmail: gb.requesterEmail,
          quoteAmount: gb.quoteAmount,
          paidAmount: gb.paidAmount,
          roomCount: gb.roomCount,
          peopleCount: gb.peopleCount,
        },
      });
      console.log(`✅ Đã lưu notification vào database: ${notification._id}`);
      
      // Gửi socket notification
      const socketNotification = {
        type: "group_booking_confirmed",
        groupBooking: {
          _id: gb._id.toString(),
          requesterName: gb.requesterName,
          checkIn: gb.checkIn,
          checkOut: gb.checkOut,
          quoteAmount: gb.quoteAmount,
          paidAmount: gb.paidAmount,
          roomCount: gb.roomCount,
          peopleCount: gb.peopleCount,
        },
        message: notificationMessage,
        timestamp: new Date().toISOString(),
      };
      
      console.log(`📤 [Confirm Group Booking] Gửi socket notification đến user ${userId}`);
      console.log(`   Event: group_booking_update`);
      console.log(`   Data:`, JSON.stringify(socketNotification, null, 2));
      console.log(`   UserId type: ${typeof userId}, value: ${userId}`);
      
      // Đảm bảo userId là string
      const userIdStr = userId.toString();
      console.log(`   UserId string: ${userIdStr}`);
      
      socketService.sendToUser(userIdStr, "group_booking_update", socketNotification);
      console.log(`✅ Đã gửi socket notification và lưu notification xác nhận hoàn tất đến customer ${userIdStr}`);
    } else {
      console.log(`⚠️ ⚠️ ⚠️ Không tìm thấy user để gửi notification cho group booking ${gb._id}`);
      console.log(`   requesterEmail: ${gb.requesterEmail}`);
      console.log(`   requesterId: ${gb.requesterId}`);
    }
  } catch (notificationError) {
    console.error("❌ ❌ ❌ Lỗi gửi notification xác nhận hoàn tất cho customer:", notificationError);
    console.error("❌ Error details:", notificationError);
    if (notificationError instanceof Error) {
      console.error("❌ Error stack:", notificationError.stack);
    }
  }

  return gb;
};

const cancel = async (id: string, reason?: string) => {
  const gb = await GroupBooking.findById(id);
  if (!gb) throw createError(404, "Không tìm thấy đặt phòng nhóm");

  if (["cancelled", "refund_requested", "refunded", "rejected"].includes(gb.status)) {
    throw createError(400, `Group booking is already ${gb.status}, không thể hủy thêm lần nữa`);
  }

  const now = new Date();
  const trimmedReason = reason?.trim();

  // Kiểm tra xem đã có thanh toán chưa (dựa vào status hoặc paidAmount)
  const wasDepositPaid = gb.status === "deposit_paid";
  const wasFullyPaid = gb.status === "paid" || gb.status === "confirmed";
  const hasPayment = (gb.paidAmount && gb.paidAmount > 0) || wasDepositPaid || wasFullyPaid;

  console.log(`🔍 [Cancel Group Booking] Group booking ${gb._id}:`);
  console.log(`   Status: ${gb.status}`);
  console.log(`   Paid Amount: ${gb.paidAmount || 0}`);
  console.log(`   Was Deposit Paid: ${wasDepositPaid}`);
  console.log(`   Was Fully Paid: ${wasFullyPaid}`);
  console.log(`   Has Payment: ${hasPayment}`);

  if (hasPayment) {
    gb.status = "refund_requested";
    gb.refundRequestedAt = now;
    // Tính số tiền hoàn: nếu đã đặt cọc thì hoàn số tiền đặt cọc, nếu đã thanh toán đủ thì hoàn toàn bộ
    const defaultRefund = wasDepositPaid
      ? calculateDepositAmount(gb.quoteAmount || 0)
      : (gb.paidAmount || gb.quoteAmount || 0);
    if (!gb.refundAmount) {
      gb.refundAmount = defaultRefund;
    }
    gb.remainingAmount = Math.max(0, (gb.quoteAmount || 0) - (gb.paidAmount || 0));
    appendNote(gb, "Refund requested", trimmedReason || "Khách hàng yêu cầu hoàn tiền");
    
    // Gửi notification cho admin và staff khi khách hàng yêu cầu hoàn tiền
    console.log(`📢 [Refund Request] Bắt đầu gửi notification cho admin/staff - group booking ${gb._id}`);
    try {
      await gb.populate("requesterId", "fullName email phoneNumber");
      const formattedRefund = new Intl.NumberFormat("vi-VN").format(gb.refundAmount || defaultRefund);
      const notificationMessage = `Khách hàng ${gb.requesterName} yêu cầu hủy phòng và hoàn tiền ${formattedRefund} VND cho đặt phòng nhóm ${gb._id}`;
      
      console.log(`📢 [Refund Request] Notification message: ${notificationMessage}`);
      console.log(`📢 [Refund Request] Refund amount: ${gb.refundAmount || defaultRefund}`);
      
      // Lưu notification vào database
      await notificationsService.create({
        type: "group_booking_refund_requested",
        title: "Yêu cầu hủy phòng hoàn tiền",
        message: notificationMessage,
        userId: gb.requesterId?._id || undefined,
        bookingData: {
          bookingId: null,
          customerId: gb.requesterId?._id,
          roomId: null,
          checkIn: gb.checkIn,
          checkOut: gb.checkOut,
          totalPrice: gb.quoteAmount || 0,
          paymentStatus: "refund_requested",
          source: "online",
          guestCount: gb.peopleCount,
          guests: [],
        },
        metadata: {
          groupBookingId: gb._id.toString(),
          requesterName: gb.requesterName,
          requesterPhone: gb.requesterPhone,
          requesterEmail: gb.requesterEmail,
          refundAmount: gb.refundAmount || defaultRefund,
          roomCount: gb.roomCount,
          peopleCount: gb.peopleCount,
          reason: trimmedReason || "Khách hàng yêu cầu hoàn tiền",
        },
      });
      
      // Gửi WebSocket notification
      const refundRequestNotification = {
        type: "group_booking_refund_requested",
        groupBooking: {
          _id: gb._id.toString(),
          requesterId: gb.requesterId?._id?.toString(),
          requesterName: gb.requesterName,
          requesterPhone: gb.requesterPhone,
          checkIn: gb.checkIn,
          checkOut: gb.checkOut,
          peopleCount: gb.peopleCount,
          roomCount: gb.roomCount,
          status: gb.status,
          quoteAmount: gb.quoteAmount,
          paidAmount: gb.paidAmount,
          refundAmount: gb.refundAmount || defaultRefund,
        },
        message: notificationMessage,
        reason: trimmedReason || "Khách hàng yêu cầu hoàn tiền",
        timestamp: new Date().toISOString(),
      };
      
      // Gửi đến tất cả admin và staff
      console.log(`📤 [Refund Request] Bắt đầu gửi socket notification...`);
      console.log(`   Event: group_booking_refund_requested`);
      console.log(`   Room admin: role:admin`);
      console.log(`   Room staff: role:staff`);
      
      try {
        socketService.sendToRoom("role:admin", "group_booking_refund_requested", refundRequestNotification);
        console.log(`✅ Đã gửi WebSocket notification yêu cầu hoàn tiền đến room "role:admin" cho group booking: ${gb._id}`);
      } catch (adminError) {
        console.error("❌ Lỗi gửi notification yêu cầu hoàn tiền đến admin:", adminError);
        if (adminError instanceof Error) {
          console.error("Error stack:", adminError.stack);
        }
      }
      
      try {
        socketService.sendToRoom("role:staff", "group_booking_refund_requested", refundRequestNotification);
        console.log(`✅ Đã gửi WebSocket notification yêu cầu hoàn tiền đến room "role:staff" cho group booking: ${gb._id}`);
      } catch (staffError) {
        console.error("❌ Lỗi gửi notification yêu cầu hoàn tiền đến staff:", staffError);
        if (staffError instanceof Error) {
          console.error("Error stack:", staffError.stack);
        }
      }
      
      console.log(`✅ Đã lưu và gửi WebSocket notification yêu cầu hoàn tiền cho group booking: ${gb._id}`);
    } catch (notificationError) {
      console.error("❌ Lỗi lưu/gửi notification yêu cầu hoàn tiền:", notificationError);
      if (notificationError instanceof Error) {
        console.error("Error stack:", notificationError.stack);
      }
    }
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
  if (!gb) throw createError(404, "Không tìm thấy đặt phòng nhóm");

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

  // Gửi email thông báo hoàn tiền
  try {
    if (gb.requesterEmail) {
      await emailService.sendGroupBookingRefunded({
        to: gb.requesterEmail,
        groupBookingId: gb._id.toString(),
        requesterName: gb.requesterName,
        checkIn: gb.checkIn,
        checkOut: gb.checkOut,
        refundAmount: refundAmount,
        note: options?.note,
      });
      console.log(`✅ Đã gửi email hoàn tiền group booking đến ${gb.requesterEmail}`);
    }
  } catch (emailError) {
    console.error("❌ Lỗi gửi email hoàn tiền group booking:", emailError);
    // Không throw error để không ảnh hưởng đến flow chính
  }

  // Gửi socket notification và lưu vào database cho khách hàng
  try {
    console.log(`📢 [Mark Refunded] Bắt đầu gửi notification cho customer - group booking ${gb._id}`);
    
    await gb.populate("requesterId", "fullName email phoneNumber");
    
    // Lấy userId từ requesterId hoặc từ requesterEmail (nếu có user với email đó)
    let userId: string | null = null;
    if (gb.requesterId) {
      const requester = gb.requesterId as any;
      userId = requester._id.toString();
      console.log(`   ✅ Tìm thấy userId từ requesterId: ${userId}`);
    } else if (gb.requesterEmail) {
      // Nếu không có requesterId, tìm user theo email
      console.log(`   🔍 Tìm user theo email: ${gb.requesterEmail}`);
      const userByEmail = await User.findOne({ email: gb.requesterEmail, role: "customer" });
      if (userByEmail) {
        userId = userByEmail._id.toString();
        console.log(`   ✅ Tìm thấy userId từ email: ${userId}`);
      } else {
        console.log(`   ⚠️ Không tìm thấy user với email: ${gb.requesterEmail}`);
      }
    }
    
    if (userId) {
      const formattedRefundAmount = new Intl.NumberFormat("vi-VN").format(refundAmount);
      const notificationMessage = `Yêu cầu hoàn tiền của bạn đã được xử lý. Số tiền hoàn: ${formattedRefundAmount} VND.`;
      
      console.log(`📢 [Mark Refunded] Gửi notification đến user ${userId} cho group booking ${gb._id}`);
      
      // Lưu notification vào database
      const notification = await notificationsService.create({
        type: "group_booking_refunded",
        title: "Hoàn tiền đã được xử lý",
        message: notificationMessage,
        userId: userId,
        recipients: [{
          userId: userId,
          role: "customer",
          read: false,
        }],
        metadata: {
          groupBookingId: gb._id.toString(),
          requesterName: gb.requesterName,
          requesterPhone: gb.requesterPhone,
          requesterEmail: gb.requesterEmail,
          refundAmount: refundAmount,
          roomCount: gb.roomCount,
          peopleCount: gb.peopleCount,
        },
      });
      console.log(`✅ Đã lưu notification vào database: ${notification._id}`);
      
      // Gửi socket notification
      const socketNotification = {
        type: "group_booking_refunded",
        groupBooking: {
          _id: gb._id.toString(),
          requesterName: gb.requesterName,
          checkIn: gb.checkIn,
          checkOut: gb.checkOut,
          roomCount: gb.roomCount,
          peopleCount: gb.peopleCount,
          refundAmount: refundAmount,
        },
        message: notificationMessage,
        timestamp: new Date().toISOString(),
      };
      
      console.log(`📤 [Mark Refunded] Gửi socket notification đến user ${userId}`);
      console.log(`   Event: group_booking_update`);
      console.log(`   Data:`, JSON.stringify(socketNotification, null, 2));
      
      // Đảm bảo userId là string
      const userIdStr = userId.toString();
      socketService.sendToUser(userIdStr, "group_booking_update", socketNotification);
      console.log(`✅ Đã gửi socket notification và lưu notification hoàn tiền đến customer ${userIdStr}`);
    } else {
      console.log(`⚠️ ⚠️ ⚠️ Không tìm thấy user để gửi notification cho group booking ${gb._id}`);
      console.log(`   requesterEmail: ${gb.requesterEmail}`);
      console.log(`   requesterId: ${gb.requesterId}`);
    }
  } catch (notificationError) {
    console.error("❌ ❌ ❌ Lỗi gửi notification hoàn tiền group booking:", notificationError);
    console.error("❌ Error details:", notificationError);
    if (notificationError instanceof Error) {
      console.error("❌ Error stack:", notificationError.stack);
    }
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
  if (!gb) throw createError(404, "Không tìm thấy đặt phòng nhóm");
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


