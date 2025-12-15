import createError from "http-errors";
import Booking from "../models/bookings.model";
import ServiceBooking from "../models/serviceBookings.model";
import invoicesService from "./invoices.service";
import bookingStatusService from "./bookingStatus.service";
import Invoice from "../models/invoices.model";
import User from "../models/users.model";
import { calculateRoomPriceWithBirthdayDiscount } from "../helpers/pricing.helper";
import Room from "../models/rooms.model";
import socketService from "./socket.service";
import notificationsService from "./notifications.service";
import GroupBooking from "../models/groupBooking.model";
import emailService from "./email.service";

/**
 * Lấy danh sách tất cả booking với các bộ lọc (customerId, roomId, paymentStatus, source, ngày, tên khách)
 * và phân trang. Tự động loại bỏ các booking đã bị hủy
 */
const getAll = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const sortField = query.sort_by || "createdAt";
  const sortType = query.sort_type === "asc" ? 1 : -1;
  const sortObject: Record<string, 1 | -1> = { [sortField]: sortType };

  const where: Record<string, any> = {};

  // Lọc theo customerId nếu có
  if (query.customerId) where.customerId = query.customerId;
  // Lọc theo roomId nếu có
  if (query.roomId) where.roomId = query.roomId;
  // Lọc theo paymentStatus nếu có
  if (query.paymentStatus) where.paymentStatus = query.paymentStatus;
  // Lọc theo nguồn đặt (online hoặc walk_in) nếu có
  if (query.source) where.source = query.source;

  // Luôn loại bỏ các booking đã bị hủy
  where.paymentStatus = { $ne: "cancelled" };

  // Lọc theo khoảng thời gian (kiểm tra overlap với checkIn và checkOut)
  if (query.startDate && query.endDate) {
    const start = new Date(query.startDate);
    const end = new Date(query.endDate);

    where.$and = [
      { checkIn: { $lt: end } }, // checkIn phải nhỏ hơn ngày kết thúc tìm kiếm
      { checkOut: { $gt: start } }, // checkOut phải lớn hơn ngày bắt đầu tìm kiếm
    ];
  }

  // Lọc theo tên khách hàng (tìm kiếm trong danh sách guests, dùng cho khách walk-in)
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

/**
 * Lấy thông tin chi tiết của một booking theo ID, bao gồm thông tin khách hàng và phòng
 */
const getById = async (id: string) => {
  const booking = await Booking.findById(id)
    .populate("customerId", "fullName email phoneNumber")
    .populate("roomId", "roomNumber typeId");
  if (!booking) throw createError(404, "Không tìm thấy đặt phòng");
  return booking;
};

/**
 * Tạo booking mới: kiểm tra trùng lịch phòng, khoảng cách 2 giờ dọn phòng,
 * sức chứa phòng, tính giá với giảm giá sinh nhật, tạo invoice, service bookings,
 * gửi email xác nhận và thông báo cho admin/staff
 */
const create = async (payload: any) => {
  const { roomId, checkIn, checkOut, services = [], extendHours = 0 } = payload;

  const newCheckIn = new Date(checkIn);
  const newCheckOut = new Date(checkOut);
  
  // Thêm số giờ gia hạn vào thời gian check-out nếu có
  if (extendHours > 0) {
    newCheckOut.setHours(newCheckOut.getHours() + extendHours);
  }

  // Kiểm tra trùng lịch phòng với booking khác (kiểm tra overlap thời gian)
  const conflictBooking = await Booking.findOne({
    roomId,
    paymentStatus: { $ne: "cancelled" },
    checkIn: { $lt: newCheckOut },
    checkOut: { $gt: newCheckIn },
  });
  // Nếu có booking trùng lịch thì báo lỗi
  if (conflictBooking)
    throw createError(400, "Phòng đã được đặt trong khoảng thời gian này");

  // Kiểm tra khoảng cách 2 giờ dọn phòng với booking trước đó
  // Tìm booking kết thúc trước check-in của booking mới
  const previousBooking = await Booking.findOne({
    roomId,
    paymentStatus: { $ne: "cancelled" },
    checkOut: { $lte: newCheckIn }, // Booking kết thúc trước hoặc bằng check-in mới
  }).sort({ checkOut: -1 }); // Lấy booking kết thúc gần nhất

  // Nếu có booking trước đó, kiểm tra khoảng cách thời gian
  if (previousBooking) {
    const timeDiff = newCheckIn.getTime() - new Date(previousBooking.checkOut).getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60); // Chuyển sang giờ
    
    // Nếu khoảng cách nhỏ hơn 2 giờ thì báo lỗi
    if (hoursDiff < 2) {
      const prevCheckOut = new Date(previousBooking.checkOut);
      const minCheckIn = new Date(prevCheckOut);
      minCheckIn.setHours(minCheckIn.getHours() + 2); // Thêm 2 giờ để đảm bảo đủ thời gian dọn phòng
      throw createError(
        400,
        `Cần ít nhất 2 giờ để dọn phòng. Check-in sớm nhất có thể là ${minCheckIn.toLocaleString('vi-VN')}`
      );
    }
  }

  // Kiểm tra khoảng cách 2 giờ dọn phòng với booking sau đó
  // Tìm booking bắt đầu sau check-out của booking mới
  const nextBooking = await Booking.findOne({
    roomId,
    paymentStatus: { $ne: "cancelled" },
    checkIn: { $gte: newCheckOut }, // Booking bắt đầu sau hoặc bằng check-out mới
  }).sort({ checkIn: 1 }); // Lấy booking bắt đầu sớm nhất

  // Nếu có booking sau đó, kiểm tra khoảng cách thời gian
  if (nextBooking) {
    const timeDiff = new Date(nextBooking.checkIn).getTime() - newCheckOut.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    // Nếu khoảng cách nhỏ hơn 2 giờ thì báo lỗi
    if (hoursDiff < 2) {
      const nextCheckIn = new Date(nextBooking.checkIn);
      const maxCheckOut = new Date(nextCheckIn);
      maxCheckOut.setHours(maxCheckOut.getHours() - 2); // Trừ 2 giờ để đảm bảo đủ thời gian dọn phòng
      throw createError(
        400,
        `Cần ít nhất 2 giờ để dọn phòng. Check-out muộn nhất có thể là ${maxCheckOut.toLocaleString('vi-VN')}`
      );
    }
  }

  // Kiểm tra trùng lịch phòng với GroupBooking đã được phân bổ
  const conflictGroupBooking = await GroupBooking.findOne({
    allocatedRoomIds: roomId,
    status: { $nin: ["cancelled", "rejected", "refunded"] },
    checkIn: { $lt: newCheckOut },
    checkOut: { $gt: newCheckIn },
  });
  // Nếu có group booking trùng lịch thì báo lỗi
  if (conflictGroupBooking)
    throw createError(400, "Phòng đã được đặt theo đoàn trong khoảng thời gian này");

  // Kiểm tra khoảng cách 2 giờ với group booking trước đó
  const previousGroupBooking = await GroupBooking.findOne({
    allocatedRoomIds: roomId,
    status: { $nin: ["cancelled", "rejected", "refunded"] },
    checkOut: { $lte: newCheckIn },
  }).sort({ checkOut: -1 });

  // Nếu có group booking trước đó, kiểm tra khoảng cách thời gian
  if (previousGroupBooking) {
    const timeDiff = newCheckIn.getTime() - new Date(previousGroupBooking.checkOut).getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    // Nếu khoảng cách nhỏ hơn 2 giờ thì báo lỗi
    if (hoursDiff < 2) {
      const prevCheckOut = new Date(previousGroupBooking.checkOut);
      const minCheckIn = new Date(prevCheckOut);
      minCheckIn.setHours(minCheckIn.getHours() + 2);
      throw createError(
        400,
        `Cần ít nhất 2 giờ để dọn phòng sau đặt đoàn. Check-in sớm nhất có thể là ${minCheckIn.toLocaleString('vi-VN')}`
      );
    }
  }

  // Kiểm tra khoảng cách 2 giờ với group booking sau đó
  const nextGroupBooking = await GroupBooking.findOne({
    allocatedRoomIds: roomId,
    status: { $nin: ["cancelled", "rejected", "refunded"] },
    checkIn: { $gte: newCheckOut },
  }).sort({ checkIn: 1 });

  // Nếu có group booking sau đó, kiểm tra khoảng cách thời gian
  if (nextGroupBooking) {
    const timeDiff = new Date(nextGroupBooking.checkIn).getTime() - newCheckOut.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    // Nếu khoảng cách nhỏ hơn 2 giờ thì báo lỗi
    if (hoursDiff < 2) {
      const nextCheckIn = new Date(nextGroupBooking.checkIn);
      const maxCheckOut = new Date(nextCheckIn);
      maxCheckOut.setHours(maxCheckOut.getHours() - 2);
      throw createError(
        400,
        `Cần ít nhất 2 giờ để dọn phòng trước đặt đoàn. Check-out muộn nhất có thể là ${maxCheckOut.toLocaleString('vi-VN')}`
      );
    }
  }

  // Kiểm tra danh sách khách hàng có hợp lệ không
  if (!payload.guests || !Array.isArray(payload.guests) || payload.guests.length === 0) {
    throw createError(400, "Danh sách khách hàng là bắt buộc");
  }

  // Kiểm tra sức chứa của phòng
  const room = await Room.findById(roomId).populate('typeId', 'capacity');
  // Nếu không tìm thấy phòng thì báo lỗi
  if (!room) {
    throw createError(404, "Không tìm thấy phòng");
  }
  
  const roomType = room.typeId as any;
  // Nếu phòng có thông tin sức chứa, kiểm tra số lượng khách
  if (roomType && roomType.capacity) {
    const guestCount = payload.guests.length;
    // Nếu số lượng khách vượt quá sức chứa thì báo lỗi
    if (guestCount > roomType.capacity) {
      throw createError(
        400,
        `Phòng ${room.roomNumber} chỉ có thể chứa tối đa ${roomType.capacity} người. Bạn đang đặt ${guestCount} người.`
      );
    }
  }

  // Đặt cờ isMainGuest cho khách hàng đầu tiên nếu chưa được chỉ định
  const guestsWithMainFlag = payload.guests.map((guest: any, index: number) => ({
    ...guest,
    isMainGuest: guest.isMainGuest !== undefined ? guest.isMainGuest : index === 0
  }));

  // Tính lại giá phòng với giảm giá sinh nhật (nếu có) và giảm giá khách hàng mới
  let finalTotalPrice = payload.totalPrice;
  let baseRoomPrice = 0; // Giá gốc phòng (chưa giảm gì)
  let newCustomerDiscount = {
    applied: false,
    percentage: 0,
    amount: 0,
  };
  
  try {
    console.log(`🎂 Checking birthday discount for booking:`, {
      roomId,
      checkIn,
      checkOut,
      customerId: payload.customerId,
      guestsCount: guestsWithMainFlag?.length,
      guestsData: guestsWithMainFlag?.map((g: any) => ({
        fullName: g.fullName,
        dateOfBirth: g.dateOfBirth,
        isMainGuest: g.isMainGuest
      }))
    });
    
    // Populate thêm các field cần thiết cho tính giá
    await room.populate('typeId', 'pricePerNight extraHourPrice');
    // Nếu có thông tin loại phòng, tính giá với giảm giá sinh nhật
    if (room && room.typeId) {
      const pricePerNight = (room.typeId as any).pricePerNight;
      const extraHourPrice = (room.typeId as any).extraHourPrice || 0;
      
      // Tính giá gốc phòng (chưa giảm gì)
      const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) || 1;
      baseRoomPrice = nights * pricePerNight;
      
      const pricingInfo = await calculateRoomPriceWithBirthdayDiscount(
        pricePerNight,
        new Date(checkIn),
        new Date(checkOut),
        payload.customerId || undefined,
        guestsWithMainFlag
      );
      
      // Tính giá dịch vụ và extra hours
      const servicesTotal = services.reduce((sum: number, s: any) => sum + (s.price * (s.quantity || 1)), 0);
      const extraHoursTotal = (extendHours || 0) * extraHourPrice;
      
      // Tính giảm giá khách hàng mới từ giá gốc phòng (10%)
      if (payload.customerId) {
        try {
          const customer = await User.findById(payload.customerId).select('createdAt');
          if (customer && customer.createdAt) {
            const accountCreatedAt = new Date(customer.createdAt);
            const now = new Date();
            const daysSinceRegistration = Math.floor(
              (now.getTime() - accountCreatedAt.getTime()) / (1000 * 60 * 60 * 24)
            );

            console.log(`🎁 Checking new customer discount:`, {
              customerId: payload.customerId,
              accountCreatedAt: accountCreatedAt.toISOString(),
              now: now.toISOString(),
              daysSinceRegistration,
              eligible: daysSinceRegistration > 2,
              baseRoomPrice,
            });

            // Nếu đăng ký hơn 2 ngày (3 ngày trở lên) thì được giảm giá 10% từ giá gốc phòng
            if (daysSinceRegistration > 2) {
              const discountAmount = Math.round(baseRoomPrice * 0.1); // Giảm 10% từ giá gốc phòng
              newCustomerDiscount = {
                applied: true,
                percentage: 10,
                amount: discountAmount,
              };

              console.log(`✅ New customer discount applied:`, {
                baseRoomPrice,
                discountAmount,
                daysSinceRegistration,
              });
            }
          }
        } catch (discountError) {
          console.error('❌ Error checking new customer discount:', discountError);
          // Nếu lỗi, không áp dụng discount
        }
      }
      
      // Tính tổng giá: giá phòng (đã giảm sinh nhật) - giảm giá khách hàng mới + dịch vụ + extra hours
      finalTotalPrice = pricingInfo.totalPrice - newCustomerDiscount.amount + servicesTotal + extraHoursTotal;
      
      console.log(`💰 Price calculation:`, {
        baseRoomPrice,
        pricePerNight,
        nights,
        roomPriceWithBirthdayDiscount: pricingInfo.totalPrice,
        birthdayDiscountAmount: pricingInfo.discountAmount,
        newCustomerDiscountAmount: newCustomerDiscount.amount,
        servicesTotal,
        extraHoursTotal,
        extraHours: extendHours || 0,
        extraHourPrice,
        finalTotalPrice,
        originalPrice: payload.totalPrice,
        difference: payload.totalPrice - finalTotalPrice
      });
      
      console.log(`🎂 Birthday discount result:`, {
        originalPrice: payload.totalPrice,
        baseRoomPrice,
        roomPriceWithDiscount: pricingInfo.totalPrice,
        servicesTotal,
        extraHoursTotal,
        extraHours: extendHours || 0,
        finalTotalPrice,
        discountAmount: pricingInfo.discountAmount,
        discountApplied: pricingInfo.discountApplied,
        breakdown: pricingInfo.breakdown
      });
    }
  } catch (pricingError) {
    console.error('❌ Error calculating discounts:', pricingError);
    // Nếu lỗi, sử dụng giá gốc
  }

  // Tính số tiền thanh toán dựa trên paymentStatus từ payload
  // Với booking online (có customerId): luôn là partial_paid (50%) - khách đặt online chỉ thanh toán đặt cọc
  // Với booking walk-in (không có customerId): có thể chọn paid, partial_paid hoặc pending
  const isOnlineBooking = !!payload.customerId;
  let paymentStatus: string;
  let paidAmount: number;
  let remainingAmount: number;

  if (isOnlineBooking) {
    // Booking online: luôn là partial_paid (50%) - khách đặt online chỉ thanh toán đặt cọc
    paymentStatus = "partial_paid";
    paidAmount = Math.round(finalTotalPrice * 0.5);
    remainingAmount = finalTotalPrice - paidAmount;
  } else {
    // Booking walk-in: sử dụng paymentStatus từ payload hoặc mặc định là partial_paid
    paymentStatus = payload.paymentStatus || "partial_paid";
    
    if (paymentStatus === "paid") {
      // Nếu đã thanh toán đủ, set paidAmount = totalPrice và remainingAmount = 0
      paidAmount = finalTotalPrice;
      remainingAmount = 0;
    } else if (paymentStatus === "partial_paid") {
      // Nếu thanh toán một phần, mặc định là 50%
      paidAmount = Math.round(finalTotalPrice * 0.5);
      remainingAmount = finalTotalPrice - paidAmount;
    } else if (paymentStatus === "pending") {
      // Nếu chưa thanh toán, set paidAmount = 0 và remainingAmount = totalPrice
      paidAmount = 0;
      remainingAmount = finalTotalPrice;
    } else {
      // Các trạng thái khác (failed, refunded, etc.), mặc định là pending
      paidAmount = 0;
      remainingAmount = finalTotalPrice;
    }
  }

  // Xử lý coupon discount từ payload
  let couponDiscount = undefined;
  if (payload.coupon && payload.coupon.code && payload.coupon.discountAmount) {
    couponDiscount = {
      applied: true,
      code: payload.coupon.code,
      amount: payload.coupon.discountAmount,
      roomDiscount: payload.coupon.roomDiscount || 0,
      serviceDiscount: payload.coupon.serviceDiscount || 0,
    };
  }

  const booking = new Booking({
    customerId: payload.customerId || undefined,
    guests: guestsWithMainFlag,
    guestCount: payload.guests.length,
    roomId,
    checkIn,
    checkOut,
    totalPrice: finalTotalPrice,
    paidAmount: paidAmount,
    remainingAmount: remainingAmount,
    source: payload.source || (payload.customerId ? "online" : "walk_in"),
    paymentStatus: paymentStatus,
    notes: payload.notes || "",
    services: services.map((s: any) => ({
      serviceId: s.serviceId,
      name: s.name,
      price: s.price,
      quantity: s.quantity,
    })),
    newCustomerDiscount: newCustomerDiscount.applied ? newCustomerDiscount : undefined,
    couponDiscount: couponDiscount,
  });

  try {
    const savedBooking = await booking.save();

    // Tạo các service booking nếu có dịch vụ
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

    // Xác định tên người thực hiện dựa trên loại khách hàng
    let actorName = "Guest";
    // Nếu có customerId thì là khách hàng online
    if (payload.customerId) {
      // Khách hàng online - lấy tên từ database
      const customer = await User.findById(payload.customerId);
      actorName = customer?.fullName || mainGuestName;
    } else {
      // Khách hàng walk_in - sử dụng tên từ danh sách guests
      actorName = mainGuestName;
    }

    await bookingStatusService.create({
      bookingId: savedBooking._id.toString(),
      actorId: payload.customerId || undefined,
      actorName: actorName,
      action: "pending", // trạng thái mặc định khi tạo booking
      note: "Khách hàng đã tạo booking",
    });
    // Tạo invoice cho tất cả booking
    let invoice = null;
    invoice = await invoicesService.create({
      bookingId: savedBooking._id,
      customerId: savedBooking.customerId?._id,
      totalAmount: savedBooking.totalPrice,
      paidAmount: savedBooking.paidAmount,
      remainingAmount: savedBooking.remainingAmount,
      paymentStatus: savedBooking.paymentStatus,
      status: savedBooking.paymentStatus === "paid" ? "paid" : "pending",
      issuedAt: new Date(),
    });
    console.log(`✅ Đã tạo invoice mới cho booking ${savedBooking._id}: totalAmount=${savedBooking.totalPrice}`);

    // Tạo payment cho khách hàng walk-in
    if (savedBooking.source === "walk_in") {
      try {
        const paymentService = require('./payments.service').default;
        const paymentMethod = savedBooking.paymentStatus === "paid" ? "cash" : "cash";
        
        await paymentService.create({
          bookingId: savedBooking._id.toString(),
          customerId: null, // Walk-in không có customerId
          paymentMethod: paymentMethod,
          amount: savedBooking.totalPrice,
          currency: 'VND',
          status: savedBooking.paymentStatus === "paid" ? "completed" : "pending",
          notes: `Payment for walk-in booking`,
          ...(paymentMethod === 'cash' && {
            cashInfo: {
              receivedBy: 'Admin',
              receivedAt: new Date(),
              notes: 'Cash payment received at front desk'
            }
          })
        });
        console.log(`✅ Đã tạo payment mới cho walk-in booking ${savedBooking._id}`);
      } catch (paymentError) {
        console.error(`❌ Lỗi tạo payment cho walk-in booking ${savedBooking._id}:`, paymentError);
        // Không throw error để không làm crash API
      }
    }

    await savedBooking.populate("customerId", "fullName email phoneNumber");
    await savedBooking.populate("roomId", "roomNumber typeId");

    // Lưu notification vào database và gửi WebSocket notification cho admin và staff
    try {
      const notificationMessage = `Có đặt phòng mới từ ${savedBooking.source === "online" ? "khách hàng online" : "khách walk-in"}`;
      
      // Lưu notification vào database
      await notificationsService.create({
        type: "new_booking",
        title: "Đặt phòng mới",
        message: notificationMessage,
        bookingId: savedBooking._id,
        userId: savedBooking.customerId || undefined,
        bookingData: {
          bookingId: savedBooking._id,
          customerId: savedBooking.customerId,
          roomId: savedBooking.roomId,
          checkIn: savedBooking.checkIn,
          checkOut: savedBooking.checkOut,
          totalPrice: savedBooking.totalPrice,
          paymentStatus: savedBooking.paymentStatus,
          source: savedBooking.source,
          guestCount: savedBooking.guestCount,
          guests: savedBooking.guests,
        },
      });

      // Gửi WebSocket notification
      const bookingNotification = {
        type: "new_booking",
        booking: {
          _id: savedBooking._id,
          customerId: savedBooking.customerId,
          roomId: savedBooking.roomId,
          checkIn: savedBooking.checkIn,
          checkOut: savedBooking.checkOut,
          totalPrice: savedBooking.totalPrice,
          paymentStatus: savedBooking.paymentStatus,
          source: savedBooking.source,
          guestCount: savedBooking.guestCount,
          guests: savedBooking.guests,
        },
        message: notificationMessage,
        timestamp: new Date().toISOString(),
      };

      // Gửi đến tất cả admin và staff
      socketService.sendToRoom("role:admin", "new_booking", bookingNotification);
      socketService.sendToRoom("role:staff", "new_booking", bookingNotification);
      
      console.log(`📢 Đã lưu và gửi WebSocket notification cho booking mới: ${savedBooking._id}`);
    } catch (notificationError) {
      console.error("❌ Lỗi lưu/gửi notification:", notificationError);
      // Không throw error để không làm crash API
    }

    // Gửi email xác nhận đặt phòng cho khách hàng
    try {
      console.log(`📧 Bắt đầu gửi email xác nhận cho booking ${savedBooking._id}`);
      
      // Lấy email từ customer hoặc main guest
      let customerEmail: string | null = null;
      let guestName: string = "Khách hàng";
      
      // Nếu là khách hàng online, lấy email từ customerId
      if (savedBooking.customerId && (savedBooking.customerId as any).email) {
        customerEmail = (savedBooking.customerId as any).email;
        guestName = (savedBooking.customerId as any)?.fullName || guestName;
        console.log(`📧 Lấy email từ customerId: ${customerEmail}, tên: ${guestName}`);
      } else {
        // Khách hàng walk-in - lấy email từ main guest
        const mainGuest = savedBooking.guests?.find((g: any) => g.isMainGuest) || savedBooking.guests?.[0];
        customerEmail = mainGuest?.email || null;
        guestName = mainGuest?.fullName || guestName;
        console.log(`📧 Lấy email từ main guest: ${customerEmail}, tên: ${guestName}`);
      }

      // Chỉ gửi email nếu có địa chỉ email
      if (customerEmail) {
        const room = savedBooking.roomId as any;
        const roomNumber = room?.roomNumber || "N/A";

        console.log(`📧 Đang gửi email đến ${customerEmail}...`);
        console.log(`📧 Thông tin booking: ID=${savedBooking._id}, Room=${roomNumber}, Guest=${guestName}`);

        await emailService.sendBookingConfirmation({
          to: customerEmail,
          bookingId: savedBooking._id.toString(),
          guestName: guestName,
          roomNumber: roomNumber,
          checkIn: savedBooking.checkIn,
          checkOut: savedBooking.checkOut,
          totalPrice: savedBooking.totalPrice,
          paidAmount: savedBooking.paidAmount,
          remainingAmount: savedBooking.remainingAmount,
          paymentStatus: savedBooking.paymentStatus,
          services: savedBooking.services?.map((s: any) => ({
            name: s.name,
            quantity: s.quantity || 1,
            price: s.price,
          })) || [],
        });
        
        console.log(`✅ Đã gửi email xác nhận đặt phòng thành công đến ${customerEmail} cho booking ${savedBooking._id}`);
      } else {
        console.log(`⚠️ Không tìm thấy email để gửi xác nhận cho booking ${savedBooking._id}`);
        console.log(`⚠️ Debug info: customerId=${savedBooking.customerId}, guests=${JSON.stringify(savedBooking.guests)}`);
      }
    } catch (emailError: any) {
      console.error("❌ Lỗi gửi email xác nhận đặt phòng:", emailError);
      console.error("❌ Error details:", {
        message: emailError?.message,
        stack: emailError?.stack,
        code: emailError?.code,
      });
      // Không throw error để không làm crash API - booking đã được tạo thành công
    }

    // Trả về booking + invoice
    return { booking: savedBooking, invoice };
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};

/**
 * Cập nhật thông tin booking: kiểm tra trùng lịch, khoảng cách dọn phòng,
 * cập nhật dịch vụ, đồng bộ invoice và payment, gửi email và thông báo khi có thay đổi trạng thái
 */
const updateById = async (id: string, payload: any) => {
  const booking = await getById(id);

  const roomId = payload.roomId ?? booking.roomId;
  let checkIn = payload.checkIn ? new Date(payload.checkIn) : booking.checkIn;
  let checkOut = payload.checkOut ? new Date(payload.checkOut) : booking.checkOut;
  const extendHours = payload.extendHours || 0;
  const services = payload.services || booking.services || [];

  // Thêm số giờ gia hạn vào thời gian check-out nếu có
  if (extendHours > 0) {
    checkOut = new Date(checkOut);
    checkOut.setHours(checkOut.getHours() + extendHours);
  }

  // Kiểm tra trùng lịch phòng với booking khác (kiểm tra overlap thời gian)
  const conflictBooking = await Booking.findOne({
    _id: { $ne: id },
    roomId,
    paymentStatus: { $ne: "cancelled" },
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  });
  // Nếu có booking trùng lịch thì báo lỗi
  if (conflictBooking)
    throw createError(400, "Phòng đã được đặt trong khoảng thời gian này");

  // Kiểm tra khoảng cách 2 giờ dọn phòng với booking trước đó
  const previousBooking = await Booking.findOne({
    _id: { $ne: id },
    roomId,
    paymentStatus: { $ne: "cancelled" },
    checkOut: { $lte: checkIn },
  }).sort({ checkOut: -1 });

  // Nếu có booking trước đó, kiểm tra khoảng cách thời gian
  if (previousBooking) {
    const timeDiff = checkIn.getTime() - new Date(previousBooking.checkOut).getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    // Nếu khoảng cách nhỏ hơn 2 giờ thì báo lỗi
    if (hoursDiff < 2) {
      const prevCheckOut = new Date(previousBooking.checkOut);
      const minCheckIn = new Date(prevCheckOut);
      minCheckIn.setHours(minCheckIn.getHours() + 2);
      throw createError(
        400,
        `Cần ít nhất 2 giờ để dọn phòng. Check-in sớm nhất có thể là ${minCheckIn.toLocaleString('vi-VN')}`
      );
    }
  }

  // Kiểm tra khoảng cách 2 giờ dọn phòng với booking sau đó
  const nextBooking = await Booking.findOne({
    _id: { $ne: id },
    roomId,
    paymentStatus: { $ne: "cancelled" },
    checkIn: { $gte: checkOut },
  }).sort({ checkIn: 1 });

  // Nếu có booking sau đó, kiểm tra khoảng cách thời gian
  if (nextBooking) {
    const timeDiff = new Date(nextBooking.checkIn).getTime() - checkOut.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    // Nếu khoảng cách nhỏ hơn 2 giờ thì báo lỗi
    if (hoursDiff < 2) {
      const nextCheckIn = new Date(nextBooking.checkIn);
      const maxCheckOut = new Date(nextCheckIn);
      maxCheckOut.setHours(maxCheckOut.getHours() - 2);
      throw createError(
        400,
        `Cần ít nhất 2 giờ để dọn phòng. Check-out muộn nhất có thể là ${maxCheckOut.toLocaleString('vi-VN')}`
      );
    }
  }

  // Kiểm tra trùng lịch phòng với GroupBooking đã được phân bổ
  const conflictGroupBooking = await GroupBooking.findOne({
    allocatedRoomIds: roomId,
    status: { $nin: ["cancelled", "rejected", "refunded"] },
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  });
  // Nếu có group booking trùng lịch thì báo lỗi
  if (conflictGroupBooking)
    throw createError(400, "Phòng đã được đặt theo đoàn trong khoảng thời gian này");

  // Kiểm tra khoảng cách 2 giờ với group booking trước đó
  const previousGroupBooking = await GroupBooking.findOne({
    allocatedRoomIds: roomId,
    status: { $nin: ["cancelled", "rejected", "refunded"] },
    checkOut: { $lte: checkIn },
  }).sort({ checkOut: -1 });

  // Nếu có group booking trước đó, kiểm tra khoảng cách thời gian
  if (previousGroupBooking) {
    const timeDiff = checkIn.getTime() - new Date(previousGroupBooking.checkOut).getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    // Nếu khoảng cách nhỏ hơn 2 giờ thì báo lỗi
    if (hoursDiff < 2) {
      const prevCheckOut = new Date(previousGroupBooking.checkOut);
      const minCheckIn = new Date(prevCheckOut);
      minCheckIn.setHours(minCheckIn.getHours() + 2);
      throw createError(
        400,
        `Cần ít nhất 2 giờ để dọn phòng sau đặt đoàn. Check-in sớm nhất có thể là ${minCheckIn.toLocaleString('vi-VN')}`
      );
    }
  }

  // Kiểm tra khoảng cách 2 giờ với group booking sau đó
  const nextGroupBooking = await GroupBooking.findOne({
    allocatedRoomIds: roomId,
    status: { $nin: ["cancelled", "rejected", "refunded"] },
    checkIn: { $gte: checkOut },
  }).sort({ checkIn: 1 });

  // Nếu có group booking sau đó, kiểm tra khoảng cách thời gian
  if (nextGroupBooking) {
    const timeDiff = new Date(nextGroupBooking.checkIn).getTime() - checkOut.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    // Nếu khoảng cách nhỏ hơn 2 giờ thì báo lỗi
    if (hoursDiff < 2) {
      const nextCheckIn = new Date(nextGroupBooking.checkIn);
      const maxCheckOut = new Date(nextCheckIn);
      maxCheckOut.setHours(maxCheckOut.getHours() - 2);
      throw createError(
        400,
        `Cần ít nhất 2 giờ để dọn phòng trước đặt đoàn. Check-out muộn nhất có thể là ${maxCheckOut.toLocaleString('vi-VN')}`
      );
    }
  }

  // Kiểm tra sức chứa phòng nếu đang cập nhật danh sách khách
  if (payload.guests && Array.isArray(payload.guests) && payload.guests.length > 0) {
    const roomIdToCheck = payload.roomId || booking.roomId;
    const room = await Room.findById(roomIdToCheck).populate('typeId', 'capacity');
    // Nếu tìm thấy phòng, kiểm tra sức chứa
    if (room) {
      const roomType = room.typeId as any;
      // Nếu phòng có thông tin sức chứa, kiểm tra số lượng khách
      if (roomType && roomType.capacity) {
        const guestCount = payload.guests.length;
        // Nếu số lượng khách vượt quá sức chứa thì báo lỗi
        if (guestCount > roomType.capacity) {
          throw createError(
            400,
            `Phòng ${room.roomNumber} chỉ có thể chứa tối đa ${roomType.capacity} người. Bạn đang đặt ${guestCount} người.`
          );
        }
      }
    }
  }

  // Nếu có cập nhật dịch vụ, xóa dịch vụ cũ và thêm dịch vụ mới
  if (payload.services) {
    // Xóa tất cả dịch vụ cũ của booking này
    await ServiceBooking.deleteMany({ bookingId: id });

    // Tạo danh sách dịch vụ mới
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

    // Nếu có dịch vụ mới, thêm vào database
    if (serviceBookings.length > 0) {
      await ServiceBooking.insertMany(serviceBookings);
    }
  }

  // Không cho phép đổi nguồn đặt (source) khi cập nhật
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
  
  // Cập nhật paidAmount và remainingAmount khi paymentStatus thay đổi
  // Nếu trạng thái là đã thanh toán đủ
  if (cleanUpdates.paymentStatus === "paid") {
    cleanUpdates.paidAmount = booking.totalPrice;
    cleanUpdates.remainingAmount = 0;
  } 
  // Nếu trạng thái là thanh toán một phần
  else if (cleanUpdates.paymentStatus === "partial_paid") {
    cleanUpdates.paidAmount = Math.round(booking.totalPrice * 0.5);
    cleanUpdates.remainingAmount = booking.totalPrice - cleanUpdates.paidAmount;
  } 
  // Nếu trạng thái là chưa thanh toán
  else if (cleanUpdates.paymentStatus === "pending") {
    cleanUpdates.paidAmount = 0;
    cleanUpdates.remainingAmount = booking.totalPrice;
  }
  
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
  // Nếu trạng thái thanh toán hoặc tổng giá thay đổi
  if (updatedBooking.paymentStatus !== previousPaymentStatus || totalPriceChanged) {
    try {
      console.log(`🔄 Booking ${updatedBooking._id} thay đổi:`, {
        paymentStatus: `${previousPaymentStatus} → ${updatedBooking.paymentStatus}`,
        totalPrice: `${previousTotalPrice} → ${updatedBooking.totalPrice}`,
        totalPriceChanged
      });
      
      const existingInvoice = await Invoice.findOne({ bookingId: updatedBooking._id });
      
      // Nếu đã có invoice, cập nhật thông tin
      if (existingInvoice) {
        // Cập nhật invoice theo booking (cả status và totalAmount)
        await invoicesService.updateById(existingInvoice._id.toString(), { 
          status: updatedBooking.paymentStatus,
          totalAmount: updatedBooking.totalPrice,
          paidAmount: updatedBooking.paidAmount,
          remainingAmount: updatedBooking.remainingAmount,
          paymentStatus: updatedBooking.paymentStatus
        });
        console.log(`✅ Đã cập nhật invoice ${existingInvoice._id}: status=${updatedBooking.paymentStatus}, totalAmount=${updatedBooking.totalPrice}`);
      } 
      // Nếu chưa có invoice và booking đã thanh toán đủ, tạo invoice mới
      else if (updatedBooking.paymentStatus === "paid") {
        // Tạo invoice mới nếu booking = paid và chưa có invoice
        await invoicesService.create({
          bookingId: updatedBooking._id,
          customerId: (updatedBooking as any).customerId?._id,
          totalAmount: updatedBooking.totalPrice,
          paidAmount: updatedBooking.paidAmount,
          remainingAmount: updatedBooking.remainingAmount,
          paymentStatus: updatedBooking.paymentStatus,
          status: updatedBooking.paymentStatus === "paid" ? "paid" : "pending",
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
      
      // Kiểm tra xem đã có payment chưa
      const existingPayment = await paymentService.getByBookingId(updatedBooking._id.toString());
      
      // Nếu chưa có payment và là khách walk-in, tạo payment mới
      if (!existingPayment && updatedBooking.source === 'walk_in') {
        // Tạo payment mới cho khách hàng walk-in
        const paymentMethod = updatedBooking.paymentStatus === 'paid' ? 'cash' : 'cash';
        await paymentService.create({
          bookingId: updatedBooking._id.toString(),
          customerId: null, // Walk-in không có customerId
          paymentMethod: paymentMethod,
          amount: updatedBooking.totalPrice,
          currency: 'VND',
          status: updatedBooking.paymentStatus === 'paid' ? 'completed' : 'pending',
          notes: `Payment for walk-in booking`,
          ...(paymentMethod === 'cash' && {
            cashInfo: {
              receivedBy: 'Admin',
              receivedAt: new Date(),
              notes: 'Cash payment received at front desk'
            }
          })
        });
        console.log(`✅ Đã tạo payment mới cho walk-in booking ${updatedBooking._id}`);
      } 
      // Nếu đã có payment, đồng bộ thông tin
      else if (existingPayment) {
        // Đồng bộ payment hiện có
        await paymentService.syncPaymentWithBooking(updatedBooking._id.toString(), updatedBooking.paymentStatus);
        console.log(`✅ Đồng bộ payment cho booking ${updatedBooking._id}: ${previousPaymentStatus} → ${updatedBooking.paymentStatus}`);
      }
    } catch (error) {
      console.error(`❌ Lỗi đồng bộ payment cho booking ${updatedBooking._id}:`, error);
      // Không throw error để không làm crash API
    }
  }

  // Ghi log khi chuyển sang trạng thái hoàn tiền
  if (updatedBooking.paymentStatus === "refunded" && previousPaymentStatus !== "refunded") {
    // Xác định tên người thực hiện dựa trên loại khách hàng
    let actorName = "Admin";
    // Nếu có customerId thì là khách hàng online
    if (updatedBooking.customerId) {
      // Khách hàng online - lấy tên từ database
      const customer = await User.findById(updatedBooking.customerId);
      actorName = customer?.fullName || "Khách hàng online";
    } else {
      // Khách hàng walk_in - sử dụng tên từ danh sách guests
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

    // Gửi email xác nhận hủy phòng khi admin duyệt hoàn tiền
    try {
      await updatedBooking.populate("customerId", "fullName email phoneNumber");
      await updatedBooking.populate("roomId", "roomNumber typeId");
      
      // Lấy email từ customer hoặc main guest
      let customerEmail: string | null = null;
      let guestName: string = "Khách hàng";
      
      if (updatedBooking.customerId && (updatedBooking.customerId as any).email) {
        customerEmail = (updatedBooking.customerId as any).email;
        guestName = (updatedBooking.customerId as any)?.fullName || guestName;
      } else {
        const mainGuest = updatedBooking.guests?.find((g: any) => g.isMainGuest) || updatedBooking.guests?.[0];
        customerEmail = mainGuest?.email || null;
        guestName = mainGuest?.fullName || guestName;
      }

      if (customerEmail) {
        const room = updatedBooking.roomId as any;
        const roomNumber = room?.roomNumber || "N/A";
        const refundAmount = updatedBooking.paidAmount || updatedBooking.totalPrice || 0;

        await emailService.sendBookingCancellation({
          to: customerEmail,
          bookingId: updatedBooking._id.toString(),
          guestName: guestName,
          roomNumber: roomNumber,
          checkIn: updatedBooking.checkIn,
          checkOut: updatedBooking.checkOut,
          totalPrice: updatedBooking.totalPrice,
          refundAmount: refundAmount,
          cancellationReason: payload.note || "Admin đã duyệt hủy phòng và hoàn tiền",
        });
        
        console.log(`✅ Đã gửi email hủy phòng đến ${customerEmail}`);
      }
    } catch (emailError) {
      console.error("❌ Lỗi gửi email hủy phòng:", emailError);
      // Không throw error để không làm crash API
    }

    // Gửi socket notification và lưu vào database cho khách hàng
    try {
      if (updatedBooking.customerId) {
        const customer = await User.findById(updatedBooking.customerId);
        if (customer) {
          const room = updatedBooking.roomId as any;
          const roomNumber = room?.roomNumber || "N/A";
          const refundAmount = updatedBooking.paidAmount || updatedBooking.totalPrice || 0;
          
          const notificationMessage = `Đặt phòng của bạn đã được hủy và hoàn tiền ${new Intl.NumberFormat("vi-VN").format(refundAmount)} VND`;
          
          // Lưu notification vào database
          await notificationsService.create({
            type: "booking_refunded",
            title: "Hoàn tiền thành công",
            message: notificationMessage,
            bookingId: updatedBooking._id,
            userId: customer._id,
            bookingData: {
              bookingId: updatedBooking._id,
              customerId: customer._id,
              roomId: updatedBooking.roomId,
              checkIn: updatedBooking.checkIn,
              checkOut: updatedBooking.checkOut,
              totalPrice: updatedBooking.totalPrice,
              paymentStatus: updatedBooking.paymentStatus,
              source: updatedBooking.source,
              guestCount: updatedBooking.guestCount,
              guests: updatedBooking.guests,
            },
            recipients: [{
              userId: customer._id,
              role: "customer",
              read: false,
            }],
            metadata: {
              refundAmount: refundAmount,
            },
          });
          
          // Gửi socket notification
          const socketNotification = {
            type: "booking_refunded",
            booking: {
              _id: updatedBooking._id.toString(),
              roomNumber: roomNumber,
              checkIn: updatedBooking.checkIn,
              checkOut: updatedBooking.checkOut,
              totalPrice: updatedBooking.totalPrice,
              refundAmount: refundAmount,
            },
            message: notificationMessage,
            timestamp: new Date().toISOString(),
          };
          
          socketService.sendToUser(customer._id.toString(), "booking_update", socketNotification);
          console.log(`✅ Đã gửi socket notification và lưu notification hoàn tiền đến customer ${customer._id}`);
        }
      }
    } catch (socketError) {
      console.error("❌ Lỗi gửi socket notification hoàn tiền:", socketError);
    }

    // Gửi notification cho admin và staff khi admin hoàn tiền đặt phòng online
    try {
      await updatedBooking.populate("roomId", "roomNumber");
      await updatedBooking.populate("customerId", "fullName email phoneNumber");
      
      const refundAmount = updatedBooking.paidAmount || updatedBooking.totalPrice || 0;
      const formattedRefund = new Intl.NumberFormat("vi-VN").format(refundAmount);
      const roomNumber = updatedBooking.roomId?.roomNumber || "N/A";
      const customerName = (updatedBooking.customerId as any)?.fullName || 
                          updatedBooking.guests?.find((g: any) => g.isMainGuest)?.fullName || 
                          "Khách hàng";
      
      const notificationMessage = `Đã hoàn tiền ${formattedRefund} VND cho đặt phòng ${roomNumber} của khách hàng ${customerName} (Booking ${updatedBooking._id})`;
      
      console.log(`📢 [Refund Processed] Bắt đầu gửi notification cho admin/staff - booking ${updatedBooking._id}`);
      
      // Lưu notification vào database
      await notificationsService.create({
        type: "booking_refunded",
        title: "Đã hoàn tiền đặt phòng",
        message: notificationMessage,
        bookingId: updatedBooking._id,
        userId: updatedBooking.customerId || undefined,
        bookingData: {
          bookingId: updatedBooking._id,
          customerId: updatedBooking.customerId,
          roomId: updatedBooking.roomId?._id,
          checkIn: updatedBooking.checkIn,
          checkOut: updatedBooking.checkOut,
          totalPrice: updatedBooking.totalPrice,
          paymentStatus: "refunded",
          source: updatedBooking.source || "online",
          guestCount: updatedBooking.guests?.length || 0,
          guests: updatedBooking.guests || [],
        },
        metadata: {
          bookingId: updatedBooking._id.toString(),
          customerName: customerName,
          customerPhone: (updatedBooking.customerId as any)?.phoneNumber || updatedBooking.guests?.find((g: any) => g.isMainGuest)?.phoneNumber || "N/A",
          customerEmail: (updatedBooking.customerId as any)?.email || "N/A",
          roomNumber: roomNumber,
          refundAmount: refundAmount,
          reason: payload.note || "Admin đã duyệt hoàn tiền",
        },
      });
      
      // Gửi WebSocket notification
      const refundProcessedNotification = {
        type: "booking_refunded",
        booking: {
          _id: updatedBooking._id.toString(),
          customerId: updatedBooking.customerId?.toString(),
          roomId: updatedBooking.roomId?._id?.toString(),
          roomNumber: roomNumber,
          checkIn: updatedBooking.checkIn,
          checkOut: updatedBooking.checkOut,
          totalPrice: updatedBooking.totalPrice,
          paidAmount: updatedBooking.paidAmount || updatedBooking.totalPrice,
          refundAmount: refundAmount,
          paymentStatus: "refunded",
          source: updatedBooking.source || "online",
          guestCount: updatedBooking.guests?.length || 0,
          guests: updatedBooking.guests || [],
        },
        message: notificationMessage,
        reason: payload.note || "Admin đã duyệt hoàn tiền",
        timestamp: new Date().toISOString(),
      };
      
      // Gửi đến tất cả admin và staff
      console.log(`📤 [Refund Processed] Bắt đầu gửi socket notification...`);
      console.log(`   Event: booking_refunded`);
      console.log(`   Room admin: role:admin`);
      console.log(`   Room staff: role:staff`);
      
      try {
        socketService.sendToRoom("role:admin", "booking_refunded", refundProcessedNotification);
        console.log(`✅ Đã gửi WebSocket notification hoàn tiền đến room "role:admin" cho booking: ${updatedBooking._id}`);
      } catch (adminError) {
        console.error("❌ Lỗi gửi notification hoàn tiền đến admin:", adminError);
        if (adminError instanceof Error) {
          console.error("Error stack:", adminError.stack);
        }
      }
      
      try {
        socketService.sendToRoom("role:staff", "booking_refunded", refundProcessedNotification);
        console.log(`✅ Đã gửi WebSocket notification hoàn tiền đến room "role:staff" cho booking: ${updatedBooking._id}`);
      } catch (staffError) {
        console.error("❌ Lỗi gửi notification hoàn tiền đến staff:", staffError);
        if (staffError instanceof Error) {
          console.error("Error stack:", staffError.stack);
        }
      }
      
      console.log(`✅ Đã lưu và gửi WebSocket notification hoàn tiền cho booking: ${updatedBooking._id}`);
    } catch (notificationError) {
      console.error("❌ Lỗi lưu/gửi notification hoàn tiền:", notificationError);
      if (notificationError instanceof Error) {
        console.error("Error stack:", notificationError.stack);
      }
    }
  }

  // Ghi log khi chuyển sang trạng thái hủy (hủy phòng không hoàn tiền hoặc hủy trước khi thanh toán)
  if (updatedBooking.paymentStatus === "cancelled" && previousPaymentStatus !== "cancelled") {
    // Xác định tên người thực hiện dựa trên loại khách hàng
    let actorName = "Admin";
    // Nếu có customerId thì là khách hàng online
    if (updatedBooking.customerId) {
      const customer = await User.findById(updatedBooking.customerId);
      actorName = customer?.fullName || "Khách hàng online";
    } else {
      // Khách hàng walk-in - sử dụng tên từ danh sách guests
      const mainGuest = updatedBooking.guests?.find((g: any) => g.isMainGuest);
      actorName = mainGuest?.fullName || "Khách hàng walk-in";
    }

    await bookingStatusService.create({
      bookingId: updatedBooking._id.toString(),
      actorId: updatedBooking.customerId || undefined,
      actorName: actorName,
      action: "cancelled",
      note: payload.note || "Hủy đặt phòng",
    });

    // Gửi email xác nhận hủy phòng
    try {
      await updatedBooking.populate("customerId", "fullName email phoneNumber");
      await updatedBooking.populate("roomId", "roomNumber typeId");
      
      // Lấy email từ customer hoặc main guest
      let customerEmail: string | null = null;
      let guestName: string = "Khách hàng";
      
      if (updatedBooking.customerId && (updatedBooking.customerId as any).email) {
        customerEmail = (updatedBooking.customerId as any).email;
        guestName = (updatedBooking.customerId as any)?.fullName || guestName;
      } else {
        const mainGuest = updatedBooking.guests?.find((g: any) => g.isMainGuest) || updatedBooking.guests?.[0];
        customerEmail = mainGuest?.email || null;
        guestName = mainGuest?.fullName || guestName;
      }

      if (customerEmail) {
        const room = updatedBooking.roomId as any;
        const roomNumber = room?.roomNumber || "N/A";

        await emailService.sendBookingCancellation({
          to: customerEmail,
          bookingId: updatedBooking._id.toString(),
          guestName: guestName,
          roomNumber: roomNumber,
          checkIn: updatedBooking.checkIn,
          checkOut: updatedBooking.checkOut,
          totalPrice: updatedBooking.totalPrice,
          cancellationReason: payload.note || "Đặt phòng đã được hủy",
        });
        
        console.log(`✅ Đã gửi email hủy phòng đến ${customerEmail}`);
      }
    } catch (emailError) {
      console.error("❌ Lỗi gửi email hủy phòng:", emailError);
      // Không throw error để không làm crash API
    }

    // Gửi socket notification và lưu vào database cho khách hàng
    try {
      if (updatedBooking.customerId) {
        const customer = await User.findById(updatedBooking.customerId);
        if (customer) {
          const room = updatedBooking.roomId as any;
          const roomNumber = room?.roomNumber || "N/A";
          const notificationMessage = `Đặt phòng của bạn đã được hủy`;
          
          // Lưu notification vào database
          await notificationsService.create({
            type: "booking_cancelled",
            title: "Đặt phòng đã bị hủy",
            message: notificationMessage,
            bookingId: updatedBooking._id,
            userId: customer._id,
            bookingData: {
              bookingId: updatedBooking._id,
              customerId: customer._id,
              roomId: updatedBooking.roomId,
              checkIn: updatedBooking.checkIn,
              checkOut: updatedBooking.checkOut,
              totalPrice: updatedBooking.totalPrice,
              paymentStatus: updatedBooking.paymentStatus,
              source: updatedBooking.source,
              guestCount: updatedBooking.guestCount,
              guests: updatedBooking.guests,
            },
            recipients: [{
              userId: customer._id,
              role: "customer",
              read: false,
            }],
          });
          
          // Gửi socket notification
          const socketNotification = {
            type: "booking_cancelled",
            booking: {
              _id: updatedBooking._id.toString(),
              roomNumber: roomNumber,
              checkIn: updatedBooking.checkIn,
              checkOut: updatedBooking.checkOut,
              totalPrice: updatedBooking.totalPrice,
            },
            message: notificationMessage,
            timestamp: new Date().toISOString(),
          };
          
          socketService.sendToUser(customer._id.toString(), "booking_update", socketNotification);
          console.log(`✅ Đã gửi socket notification và lưu notification hủy phòng đến customer ${customer._id}`);
        }
      }
    } catch (socketError) {
      console.error("❌ Lỗi gửi socket notification hủy phòng:", socketError);
    }
  }

  // Ghi log khi chuyển sang trạng thái yêu cầu hoàn tiền (khách gửi yêu cầu)
  if (updatedBooking.paymentStatus === "refund_requested" && previousPaymentStatus !== "refund_requested") {
    try {
      // Xác định tên người thực hiện dựa trên loại khách hàng
      let actorName = "Admin";
      let customer = null;
      // Nếu có customerId thì là khách hàng online
      if (updatedBooking.customerId) {
        // Khách hàng online - lấy tên từ database
        customer = await User.findById(updatedBooking.customerId);
        actorName = customer?.fullName || "Khách hàng online";
      } else {
        // Khách hàng walk_in - sử dụng tên từ danh sách guests
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

      // Gửi notification cho admin và staff khi khách hàng yêu cầu hoàn tiền
      try {
        await updatedBooking.populate("roomId", "roomNumber");
        await updatedBooking.populate("customerId", "fullName email phoneNumber");
        
        const refundAmount = updatedBooking.paidAmount || updatedBooking.totalPrice || 0;
        const formattedRefund = new Intl.NumberFormat("vi-VN").format(refundAmount);
        const roomNumber = updatedBooking.roomId?.roomNumber || "N/A";
        const customerName = customer?.fullName || actorName;
        
        const notificationMessage = `Khách hàng ${customerName} yêu cầu hủy phòng ${roomNumber} và hoàn tiền ${formattedRefund} VND cho đặt phòng ${updatedBooking._id}`;
        
        console.log(`📢 [Refund Request] Bắt đầu gửi notification cho admin/staff - booking ${updatedBooking._id}`);
        
        // Lưu notification vào database
        await notificationsService.create({
          type: "booking_refund_requested",
          title: "Yêu cầu hủy phòng hoàn tiền",
          message: notificationMessage,
          bookingId: updatedBooking._id,
          userId: updatedBooking.customerId || undefined,
          bookingData: {
            bookingId: updatedBooking._id,
            customerId: updatedBooking.customerId,
            roomId: updatedBooking.roomId?._id,
            checkIn: updatedBooking.checkIn,
            checkOut: updatedBooking.checkOut,
            totalPrice: updatedBooking.totalPrice,
            paymentStatus: "refund_requested",
            source: updatedBooking.source || "online",
            guestCount: updatedBooking.guests?.length || 0,
            guests: updatedBooking.guests || [],
          },
          metadata: {
            bookingId: updatedBooking._id.toString(),
            customerName: customerName,
            customerPhone: customer?.phoneNumber || updatedBooking.guests?.find((g: any) => g.isMainGuest)?.phoneNumber || "N/A",
            customerEmail: customer?.email || "N/A",
            roomNumber: roomNumber,
            refundAmount: refundAmount,
            reason: payload.note || "Khách hàng yêu cầu hoàn tiền",
          },
        });
        
        // Gửi WebSocket notification
        const refundRequestNotification = {
          type: "booking_refund_requested",
          booking: {
            _id: updatedBooking._id.toString(),
            customerId: updatedBooking.customerId?.toString(),
            roomId: updatedBooking.roomId?._id?.toString(),
            roomNumber: roomNumber,
            checkIn: updatedBooking.checkIn,
            checkOut: updatedBooking.checkOut,
            totalPrice: updatedBooking.totalPrice,
            paidAmount: updatedBooking.paidAmount || updatedBooking.totalPrice,
            refundAmount: refundAmount,
            paymentStatus: "refund_requested",
            source: updatedBooking.source || "online",
            guestCount: updatedBooking.guests?.length || 0,
            guests: updatedBooking.guests || [],
          },
          message: notificationMessage,
          reason: payload.note || "Khách hàng yêu cầu hoàn tiền",
          timestamp: new Date().toISOString(),
        };
        
        // Gửi đến tất cả admin và staff
        console.log(`📤 [Refund Request] Bắt đầu gửi socket notification...`);
        console.log(`   Event: booking_refund_requested`);
        console.log(`   Room admin: role:admin`);
        console.log(`   Room staff: role:staff`);
        
        try {
          socketService.sendToRoom("role:admin", "booking_refund_requested", refundRequestNotification);
          console.log(`✅ Đã gửi WebSocket notification yêu cầu hoàn tiền đến room "role:admin" cho booking: ${updatedBooking._id}`);
        } catch (adminError) {
          console.error("❌ Lỗi gửi notification yêu cầu hoàn tiền đến admin:", adminError);
          if (adminError instanceof Error) {
            console.error("Error stack:", adminError.stack);
          }
        }
        
        try {
          socketService.sendToRoom("role:staff", "booking_refund_requested", refundRequestNotification);
          console.log(`✅ Đã gửi WebSocket notification yêu cầu hoàn tiền đến room "role:staff" cho booking: ${updatedBooking._id}`);
        } catch (staffError) {
          console.error("❌ Lỗi gửi notification yêu cầu hoàn tiền đến staff:", staffError);
          if (staffError instanceof Error) {
            console.error("Error stack:", staffError.stack);
          }
        }
        
        console.log(`✅ Đã lưu và gửi WebSocket notification yêu cầu hoàn tiền cho booking: ${updatedBooking._id}`);
      } catch (notificationError) {
        console.error("❌ Lỗi lưu/gửi notification yêu cầu hoàn tiền:", notificationError);
        if (notificationError instanceof Error) {
          console.error("Error stack:", notificationError.stack);
        }
      }
    } catch (statusError) {
      console.error('❌ Lỗi tạo booking status log:', statusError);
      // Không throw error ở đây để không làm crash API
    }
  }

  // Ghi log khi chuyển sang trạng thái thanh toán thất bại
  if (updatedBooking.paymentStatus === "failed" && previousPaymentStatus !== "failed") {
    // Xác định tên người thực hiện dựa trên loại khách hàng
    let actorName = "Admin";
    // Nếu có customerId thì là khách hàng online
    if (updatedBooking.customerId) {
      // Khách hàng online - lấy tên từ database
      const customer = await User.findById(updatedBooking.customerId);
      actorName = customer?.fullName || "Khách hàng online";
    } else {
      // Khách hàng walk_in - sử dụng tên từ danh sách guests
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

  // Ghi log khi chuyển sang trạng thái đã thanh toán đủ và gửi email xác nhận kèm hóa đơn
  if (updatedBooking.paymentStatus === "paid" && previousPaymentStatus !== "paid") {
    // Xác định tên người thực hiện dựa trên loại khách hàng
    let actorName = "Admin";
    // Nếu có customerId thì là khách hàng online
    if (updatedBooking.customerId) {
      const customer = await User.findById(updatedBooking.customerId);
      actorName = customer?.fullName || "Khách hàng online";
    } else {
      // Khách hàng walk-in - sử dụng tên từ danh sách guests
      const mainGuest = updatedBooking.guests?.find((g: any) => g.isMainGuest);
      actorName = mainGuest?.fullName || "Khách hàng walk-in";
    }

    await bookingStatusService.create({
      bookingId: updatedBooking._id.toString(),
      actorId: updatedBooking.customerId || undefined,
      actorName: actorName,
      action: "paid",
      note: payload.note || "Đã thanh toán đủ",
    });

    // Gửi email xác nhận thanh toán đủ kèm hóa đơn
    try {
      await updatedBooking.populate("customerId", "fullName email phoneNumber");
      await updatedBooking.populate("roomId", "roomNumber typeId");
      
      // Lấy email từ customer hoặc main guest
      let customerEmail: string | null = null;
      let guestName: string = "Khách hàng";
      
      // Nếu là khách hàng online, lấy email từ customerId
      if (updatedBooking.customerId && (updatedBooking.customerId as any).email) {
        customerEmail = (updatedBooking.customerId as any).email;
        guestName = (updatedBooking.customerId as any)?.fullName || guestName;
      } else {
        // Khách hàng walk-in - lấy email từ main guest
        const mainGuest = updatedBooking.guests?.find((g: any) => g.isMainGuest) || updatedBooking.guests?.[0];
        customerEmail = mainGuest?.email || null;
        guestName = mainGuest?.fullName || guestName;
      }

      // Chỉ gửi email nếu có địa chỉ email
      if (customerEmail) {
        const room = updatedBooking.roomId as any;
        const roomNumber = room?.roomNumber || "N/A";

        // Tìm hoặc tạo invoice (đảm bảo invoice đã được tạo)
        let invoice = await Invoice.findOne({ bookingId: updatedBooking._id });
        
        // Nếu chưa có invoice, tạo mới
        if (!invoice) {
          try {
            invoice = await invoicesService.create({
              bookingId: updatedBooking._id,
              customerId: (updatedBooking as any).customerId?._id,
              totalAmount: updatedBooking.totalPrice,
              paidAmount: updatedBooking.paidAmount || updatedBooking.totalPrice,
              remainingAmount: 0,
              paymentStatus: "paid",
              status: "paid",
              issuedAt: new Date(),
            });
            console.log(`✅ Đã tạo invoice mới cho booking ${updatedBooking._id}`);
          } catch (invoiceError) {
            console.error("❌ Lỗi tạo invoice:", invoiceError);
            // Vẫn gửi email nhưng không có PDF
          }
        }

        let invoicePdfBuffer: Buffer | undefined = undefined;
        let invoiceFileName: string | undefined = undefined;

        // Nếu có invoice, tạo PDF hóa đơn
        if (invoice) {
          try {
            // Tạo PDF hóa đơn
            invoicePdfBuffer = await invoicesService.printInvoice(invoice._id.toString());
            invoiceFileName = `HoaDon_${invoice._id.toString()}.pdf`;
            console.log(`✅ Đã tạo PDF hóa đơn: ${invoiceFileName}`);
          } catch (pdfError) {
            console.error("❌ Lỗi tạo PDF hóa đơn:", pdfError);
            // Vẫn gửi email nhưng không có PDF
          }
        }

        await emailService.sendPaymentConfirmation({
          to: customerEmail,
          bookingId: updatedBooking._id.toString(),
          guestName: guestName,
          roomNumber: roomNumber,
          checkIn: updatedBooking.checkIn,
          checkOut: updatedBooking.checkOut,
          totalPrice: updatedBooking.totalPrice,
          paidAmount: updatedBooking.paidAmount || updatedBooking.totalPrice,
          invoicePdfBuffer: invoicePdfBuffer,
          invoiceFileName: invoiceFileName,
        });
        
        console.log(`✅ Đã gửi email xác nhận thanh toán đủ đến ${customerEmail}`);
      }

      // Gửi socket notification và lưu vào database cho khách hàng
      try {
        // Chỉ gửi notification cho khách hàng online (có customerId)
        if (updatedBooking.customerId) {
          const customer = await User.findById(updatedBooking.customerId);
          // Nếu tìm thấy khách hàng, gửi notification
          if (customer) {
            const room = updatedBooking.roomId as any;
            const roomNumber = room?.roomNumber || "N/A";
            const paidAmount = updatedBooking.paidAmount || updatedBooking.totalPrice;
            const notificationMessage = `Đặt phòng của bạn đã được xác nhận thanh toán đủ ${new Intl.NumberFormat("vi-VN").format(paidAmount)} VND`;
            
            // Lưu notification vào database
            await notificationsService.create({
              type: "booking_paid",
              title: "Thanh toán thành công",
              message: notificationMessage,
              bookingId: updatedBooking._id,
              userId: customer._id,
              bookingData: {
                bookingId: updatedBooking._id,
                customerId: customer._id,
                roomId: updatedBooking.roomId,
                checkIn: updatedBooking.checkIn,
                checkOut: updatedBooking.checkOut,
                totalPrice: updatedBooking.totalPrice,
                paymentStatus: updatedBooking.paymentStatus,
                source: updatedBooking.source,
                guestCount: updatedBooking.guestCount,
                guests: updatedBooking.guests,
              },
              recipients: [{
                userId: customer._id,
                role: "customer",
                read: false,
              }],
              metadata: {
                paidAmount: paidAmount,
              },
            });
            
            // Gửi socket notification
            const socketNotification = {
              type: "booking_paid",
              booking: {
                _id: updatedBooking._id.toString(),
                roomNumber: roomNumber,
                checkIn: updatedBooking.checkIn,
                checkOut: updatedBooking.checkOut,
                totalPrice: updatedBooking.totalPrice,
                paidAmount: paidAmount,
              },
              message: notificationMessage,
              timestamp: new Date().toISOString(),
            };
            
            socketService.sendToUser(customer._id.toString(), "booking_update", socketNotification);
            console.log(`✅ Đã gửi socket notification và lưu notification thanh toán đủ đến customer ${customer._id}`);
          }
        }
      } catch (socketError) {
        console.error("❌ Lỗi gửi socket notification thanh toán đủ:", socketError);
      }
    } catch (emailError) {
      console.error("❌ Lỗi gửi email xác nhận thanh toán:", emailError);
      // Không throw error để không làm crash API
    }
  }

  // Ghi log khi gia hạn giờ hoặc thay đổi checkOut về sau
  if (payload.extendHours || (payload.checkOut && new Date(payload.checkOut) > new Date(booking.checkOut))) {
    // Xác định tên người thực hiện dựa trên loại khách hàng
    let actorName = "Admin";
    // Nếu có customerId thì là khách hàng online
    if (updatedBooking.customerId) {
      // Khách hàng online - lấy tên từ database
      const customer = await User.findById(updatedBooking.customerId);
      actorName = customer?.fullName || "Khách hàng online";
    } else {
      // Khách hàng walk_in - sử dụng tên từ danh sách guests
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

  // Ghi log các cập nhật chung của booking (không phải thay đổi payment status)
  const hasNonPaymentChanges = Object.keys(cleanUpdates).some(key => 
    !['paymentStatus', 'totalPrice'].includes(key) && 
    cleanUpdates[key] !== undefined && 
    cleanUpdates[key] !== null
  );

  // Nếu có thay đổi không liên quan đến thanh toán và paymentStatus không đổi
  if (hasNonPaymentChanges && updatedBooking.paymentStatus === previousPaymentStatus) {
    try {
      // Xác định tên người thực hiện dựa trên loại khách hàng
      let actorName = "Admin";
      // Nếu có customerId thì là khách hàng online
      if (updatedBooking.customerId) {
        // Khách hàng online - lấy tên từ database
        const customer = await User.findById(updatedBooking.customerId);
        actorName = customer?.fullName || "Khách hàng online";
      } else {
        // Khách hàng walk_in - sử dụng tên từ danh sách guests
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

  // Ghi log thay đổi payment status (nếu chưa được log ở trên)
  if (updatedBooking.paymentStatus !== previousPaymentStatus && 
      !['refunded', 'refund_requested', 'failed'].includes(updatedBooking.paymentStatus)) {
    try {
      // Xác định tên người thực hiện dựa trên loại khách hàng
      let actorName = "Admin";
      // Nếu có customerId thì là khách hàng online
      if (updatedBooking.customerId) {
        // Khách hàng online - lấy tên từ database
        const customer = await User.findById(updatedBooking.customerId);
        actorName = customer?.fullName || "Khách hàng online";
      } else {
        // Khách hàng walk_in - sử dụng tên từ danh sách guests
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

/**
 * Xóa booking theo ID (soft delete)
 */
const deleteById = async (id: string) => {
  const booking = await getById(id);
  await booking.deleteOne();
  return booking;
};

/**
 * Cập nhật trạng thái thanh toán của booking: cộng thêm số tiền thanh toán,
 * tính lại số tiền còn lại và cập nhật paymentStatus (partial_paid hoặc paid)
 */
const updatePaymentStatus = async (id: string, paymentData: { amount: number; paymentMethod?: string }) => {
  const booking = await Booking.findById(id);
  // Nếu không tìm thấy booking thì báo lỗi
  if (!booking) throw createError(404, "Không tìm thấy đặt phòng");

  const newPaidAmount = (booking.paidAmount || 0) + paymentData.amount;
  const remainingAmount = booking.totalPrice - newPaidAmount;
  
  let newPaymentStatus = "partial_paid";
  // Nếu số tiền còn lại <= 0 thì đã thanh toán đủ
  if (remainingAmount <= 0) {
    newPaymentStatus = "paid";
  }

  const updatedBooking = await Booking.findByIdAndUpdate(
    id,
    {
      paidAmount: newPaidAmount,
      remainingAmount: Math.max(0, remainingAmount),
      paymentStatus: newPaymentStatus,
    },
    { new: true }
  );

  return updatedBooking;
};

/**
 * Gửi lại email xác nhận đặt phòng cho booking hiện có
 * Lấy email từ customer hoặc main guest để gửi
 */
const resendConfirmationEmail = async (id: string) => {
  try {
    const booking = await getById(id);
    
    // Populate các thông tin cần thiết
    await booking.populate("customerId", "fullName email phoneNumber");
    await booking.populate("roomId", "roomNumber typeId");

    // Lấy email từ customer hoặc main guest
    let customerEmail: string | null = null;
    let guestName: string = "Khách hàng";
    
    // Nếu là khách hàng online, lấy email từ customerId
    if (booking.customerId && (booking.customerId as any).email) {
      customerEmail = (booking.customerId as any).email;
      guestName = (booking.customerId as any)?.fullName || guestName;
    } else {
      // Khách hàng walk-in - lấy email từ main guest
      const mainGuest = booking.guests?.find((g: any) => g.isMainGuest) || booking.guests?.[0];
      customerEmail = mainGuest?.email || null;
      guestName = mainGuest?.fullName || guestName;
    }

    // Nếu không có email thì báo lỗi
    if (!customerEmail) {
      throw createError(400, "Không tìm thấy email để gửi xác nhận. Vui lòng cập nhật thông tin email của khách hàng.");
    }

    const room = booking.roomId as any;
    const roomNumber = room?.roomNumber || "N/A";

    await emailService.sendBookingConfirmation({
      to: customerEmail,
      bookingId: booking._id.toString(),
      guestName: guestName,
      roomNumber: roomNumber,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      totalPrice: booking.totalPrice,
      paidAmount: booking.paidAmount,
      remainingAmount: booking.remainingAmount,
      paymentStatus: booking.paymentStatus,
      services: booking.services?.map((s: any) => ({
        name: s.name,
        quantity: s.quantity || 1,
        price: s.price,
      })) || [],
    });

    return { success: true, message: `Đã gửi email xác nhận đến ${customerEmail}` };
  } catch (error: any) {
    // Nếu là lỗi HTTP đã có statusCode thì throw lại
    if (error.statusCode) {
      throw error;
    }
    // Nếu không phải lỗi HTTP thì tạo lỗi 500
    throw createError(500, `Lỗi gửi email: ${error.message}`);
  }
};

export default {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
  updatePaymentStatus,
  resendConfirmationEmail,
};
