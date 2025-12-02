import createError from "http-errors";
import Invoice from "../models/invoices.model";
import { generateInvoicePdf } from "../utility/generateInvoicePdf";
import path from "path";
import PDFDocument from "pdfkit";
import moment from "moment";
import serviceBookingsService from "./serviceBookings.service";
import fs from "fs";

/**
 * Lấy danh sách tất cả invoice với các bộ lọc (bookingId, groupBookingId, customerId, status, khoảng giá)
 * và phân trang. Bao gồm thông tin chi tiết về booking, group booking và customer.
 */
const getAll = async (query: any) => {
  // Thiết lập phân trang
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  // Thiết lập sắp xếp
  const sortField = query.sort_by || "createdAt";
  const sortType = query.sort_type === "asc" ? 1 : -1;
  const sortObject: Record<string, 1 | -1> = { [sortField]: sortType };

  const where: Record<string, any> = {};

  // Lọc theo bookingId nếu có
  if (query.bookingId) where.bookingId = query.bookingId;
  // Lọc theo groupBookingId nếu có
  if (query.groupBookingId) where.groupBookingId = query.groupBookingId;
  // Lọc theo customerId nếu có
  if (query.customerId) where.customerId = query.customerId;
  // Lọc theo status nếu có
  if (query.status) where.status = query.status;

  // Lọc theo khoảng tổng tiền (minAmount, maxAmount)
  if (query.minAmount || query.maxAmount) {
    where.totalAmount = {};
    if (query.minAmount) where.totalAmount.$gte = Number(query.minAmount);
    if (query.maxAmount) where.totalAmount.$lte = Number(query.maxAmount);
  }

  // Tìm invoices với populate thông tin booking, group booking và customer
  const invoices = await Invoice.find(where)
    .populate("bookingId", "_id checkIn checkOut guestInfo source guests guestCount totalPrice paidAmount remainingAmount paymentStatus")
    .populate({
      path: "groupBookingId",
      select: "_id checkIn checkOut requesterName requesterPhone requesterEmail peopleCount roomCount quoteAmount status allocatedRoomIds members",
      populate: {
        path: "allocatedRoomIds",
        select: "roomNumber typeId",
        populate: { path: "typeId", select: "name pricePerNight capacity extraHourPrice maxExtendHours amenities" }
      }
    })
    .populate("customerId", "fullName email phoneNumber")
    .skip((page - 1) * limit)
    .limit(limit)
    .sort(sortObject);

  // Đếm tổng số invoice để phân trang
  const count = await Invoice.countDocuments(where);

  return {
    invoices,
    pagination: {
      totalRecord: count,
      limit,
      page,
    },
  };
};

/**
 * Lấy thông tin chi tiết của một invoice theo ID,
 * bao gồm thông tin booking, group booking và customer
 */
const getById = async (id: string) => {
  const invoice = await Invoice.findById(id)
    .populate("bookingId", "_id checkIn checkOut guestInfo source guests guestCount")
    .populate({
      path: "groupBookingId",
      select: "_id checkIn checkOut requesterName requesterPhone requesterEmail peopleCount roomCount quoteAmount status allocatedRoomIds members",
      populate: {
        path: "allocatedRoomIds",
        select: "roomNumber typeId",
        populate: { path: "typeId", select: "name pricePerNight capacity extraHourPrice maxExtendHours amenities" }
      }
    })
    .populate("customerId", "fullName email phoneNumber");
  // Nếu không tìm thấy invoice thì báo lỗi
  if (!invoice) throw createError(404, "Invoice not found");
  return invoice;
};

/**
 * Tạo invoice mới: tạo invoice với thông tin booking/group booking, customer,
 * số tiền và trạng thái thanh toán
 */
const create = async (payload: any) => {
  // Tạo invoice mới với các thông tin từ payload
  const invoice = new Invoice({
    bookingId: payload.bookingId,
    groupBookingId: payload.groupBookingId,
    customerId: payload.customerId,
    totalAmount: payload.totalAmount,
    paidAmount: payload.paidAmount || 0,
    remainingAmount: payload.remainingAmount || 0,
    paymentStatus: payload.paymentStatus || "pending",
    status: payload.status || "pending",
    issuedAt: payload.issuedAt || Date.now(),
  });
  const savedInvoice = await invoice.save();
  // Populate thông tin booking nếu có
  if (savedInvoice.bookingId) {
    await savedInvoice.populate("bookingId", "_id checkIn checkOut guestInfo source guests guestCount totalPrice paidAmount remainingAmount paymentStatus");
  }
  // Populate thông tin group booking nếu có
  if (savedInvoice.groupBookingId) {
    await savedInvoice.populate({
      path: "groupBookingId",
      select: "_id checkIn checkOut requesterName requesterPhone requesterEmail peopleCount roomCount quoteAmount status allocatedRoomIds members",
      populate: {
        path: "allocatedRoomIds",
        select: "roomNumber typeId",
        populate: { path: "typeId", select: "name pricePerNight capacity extraHourPrice maxExtendHours amenities" }
      }
    });
  }
  // Populate thông tin customer
  await savedInvoice.populate("customerId", "fullName email phoneNumber");
  return savedInvoice;
};

/**
 * Cập nhật invoice theo ID: lọc bỏ các giá trị rỗng/null/undefined,
 * cập nhật và populate lại thông tin liên quan
 */
const updateById = async (id: string, payload: any) => {
  const invoice = await getById(id);

  // Lọc bỏ các giá trị rỗng, null hoặc undefined để chỉ cập nhật các trường hợp lệ
  const cleanUpdates = Object.fromEntries(
    Object.entries(payload).filter(
      ([, v]) => v !== "" && v !== null && v !== undefined
    )
  );

  // Cập nhật invoice với các giá trị đã lọc
  Object.assign(invoice, cleanUpdates);
  const updatedInvoice = await invoice.save();
  // Populate lại thông tin booking nếu có
  if (updatedInvoice.bookingId) {
    await updatedInvoice.populate("bookingId", "_id checkIn checkOut guestInfo source guests guestCount");
  }
  // Populate lại thông tin group booking nếu có
  if (updatedInvoice.groupBookingId) {
    await updatedInvoice.populate({
      path: "groupBookingId",
      select: "_id checkIn checkOut requesterName requesterPhone requesterEmail peopleCount roomCount quoteAmount status allocatedRoomIds members",
      populate: {
        path: "allocatedRoomIds",
        select: "roomNumber typeId",
        populate: { path: "typeId", select: "name pricePerNight capacity extraHourPrice maxExtendHours amenities" }
      }
    });
  }
  // Populate lại thông tin customer
  await updatedInvoice.populate("customerId", "fullName email phoneNumber");
  return updatedInvoice;
};

/**
 * Xóa invoice theo ID
 */
const deleteById = async (id: string) => {
  const invoice = await getById(id);
  await invoice.deleteOne();
  return invoice;
};

/**
 * In hóa đơn PDF: tạo PDF hóa đơn với đầy đủ thông tin booking/group booking,
 * customer, dịch vụ và tóm tắt thanh toán
 */
const printInvoice = async (invoiceId: string) => {
  // Lấy invoice với populate đầy đủ thông tin booking, group booking, customer
  const invoice = await Invoice.findById(invoiceId)
    .populate({
      path: "bookingId",
      select: "_id checkIn checkOut roomId services guestInfo source guests guestCount totalPrice paidAmount remainingAmount paymentStatus",
      populate: { path: "roomId", select: "roomNumber" },
    })
    .populate({
      path: "groupBookingId",
      select: "_id checkIn checkOut requesterName requesterPhone requesterEmail peopleCount roomCount quoteAmount status allocatedRoomIds members",
      populate: {
        path: "allocatedRoomIds",
        select: "roomNumber typeId",
        populate: { path: "typeId", select: "name pricePerNight capacity extraHourPrice maxExtendHours amenities" }
      }
    })
    .populate("customerId", "fullName email phoneNumber");

  // Nếu không tìm thấy invoice thì báo lỗi
  if (!invoice) throw createError(404, "Invoice not found");

  // Tạo PDF document với kích thước A4
  const doc = new PDFDocument({ margin: 50, size: "A4" });
  const chunks: Uint8Array[] = [];
  // Thu thập các chunk dữ liệu PDF
  doc.on("data", (chunk) => chunks.push(chunk));

  // Sử dụng font Noto Sans hỗ trợ tiếng Việt
  const fontPath = path.join(__dirname, "../../font/NotoSans-Regular.ttf");
  doc.registerFont("NotoSans", fontPath);
  doc.font("NotoSans");

  // Đường dẫn đến logo khách sạn
  // Thử nhiều đường dẫn để tương thích với cả development và production
  const possibleLogoPaths = [
    path.join(__dirname, "../../../hotel-management/public/718f64e051ef2e1e1390493be6f8a29b.jpg"), // Từ dist/services
    path.join(process.cwd(), "hotel-management/public/718f64e051ef2e1e1390493be6f8a29b.jpg"), // Từ root project
    path.join(__dirname, "../../../../hotel-management/public/718f64e051ef2e1e1390493be6f8a29b.jpg"), // Từ src/services
  ];
  
  let logoPath: string | null = null;
  for (const possiblePath of possibleLogoPaths) {
    if (fs.existsSync(possiblePath)) {
      logoPath = possiblePath;
      break;
    }
  }
  
  // --- Header: Logo và Tiêu đề hóa đơn ---
  // Vẽ logo nếu file tồn tại
  if (logoPath) {
    try {
      // Kích thước logo (hình vuông, nhỏ hơn)
      const logoSize = 80; // Chiều rộng và chiều cao bằng nhau (hình vuông)
      
      // Tính toán vị trí để căn giữa logo
      const pageWidth = (doc.page as any).width || 595.28; // A4 width in pt
      const margin = 50;
      const logoX = (pageWidth - logoSize) / 2; // Căn giữa
      const logoY = margin - 10; // Đẩy lên trên một chút (giảm 10px)
      
      // Vẽ logo (hình vuông)
      doc.image(logoPath, logoX, logoY, { width: logoSize, height: logoSize });
      
      // Di chuyển xuống dưới logo
      doc.y = logoY + logoSize + 15;
    } catch (error) {
      console.error("Error loading logo:", error);
      // Nếu không load được logo, tiếp tục mà không có logo
    }
  }

  // Lấy thông tin customer, booking và group booking
  const customer = invoice.customerId as { fullName?: string; email?: string; phoneNumber?: string };
  const booking = invoice.bookingId as any;
  const groupBooking = invoice.groupBookingId as any;

  // --- Tiêu đề hóa đơn ---
  doc
    .fontSize(20)
    .text("HÓA ĐƠN THANH TOÁN KHÁCH SẠN MIKO", { align: "center", underline: true })
    .moveDown(1);

  // --- Thông tin hóa đơn: mã và ngày xuất ---
  doc.fontSize(12).text(`Mã hóa đơn: ${invoice._id}`);
  doc.text(
    `Ngày xuất: ${
      invoice.issuedAt
        ? moment(invoice.issuedAt).format("DD/MM/YYYY HH:mm")
        : "-"
    }`
  );
  doc.moveDown(0.5);

  // --- Thông tin khách hàng ---
  doc.fontSize(14).text("THÔNG TIN KHÁCH HÀNG", { underline: true });
  
  // Xử lý cho Group Booking (đặt phòng theo đoàn)
  if (groupBooking) {
    doc.fontSize(12).text(`Tên người yêu cầu: ${groupBooking.requesterName || "-"}`);
    doc.text(`Điện thoại: ${groupBooking.requesterPhone || "-"}`);
    doc.text(`Email: ${groupBooking.requesterEmail || "-"}`);
    doc.text(`Số người: ${groupBooking.peopleCount || "-"}`);
    doc.text(`Số phòng: ${groupBooking.roomCount || "-"}`);
    doc.moveDown(0.5);
    
    // --- Thông tin đặt phòng cho Group Booking ---
    doc.fontSize(14).text("THÔNG TIN ĐẶT PHÒNG", { underline: true });
    doc.fontSize(12).text(`Loại: Đặt theo đoàn`);
    
    // Tính số đêm từ check-in đến check-out
    let nights = 0;
    if (groupBooking.checkIn && groupBooking.checkOut) {
      nights = Math.ceil((new Date(groupBooking.checkOut).getTime() - new Date(groupBooking.checkIn).getTime()) / (1000 * 60 * 60 * 24));
      // Đảm bảo ít nhất 1 đêm
      nights = Math.max(1, nights);
    }
    
    // Hiển thị danh sách phòng đã phân bổ
    if (groupBooking.allocatedRoomIds && groupBooking.allocatedRoomIds.length > 0) {
      doc.text(`Phòng: ${groupBooking.allocatedRoomIds.map((r: any) => r.roomNumber || "-").join(", ")}`);
      doc.moveDown(0.5);
      doc.fontSize(12).text("CHI TIẾT PHÒNG:", { underline: true });
      doc.moveDown(0.3);
      // Duyệt từng phòng đã phân bổ để hiển thị chi tiết
      groupBooking.allocatedRoomIds.forEach((room: any, idx: number) => {
        const roomNum = room.roomNumber || "-";
        const typeName = room.typeId?.name || "-";
        const pricePerNight = room.typeId?.pricePerNight || 0;
        const capacity = room.typeId?.capacity || 0;
        const extraHourPrice = room.typeId?.extraHourPrice || 0;
        const maxExtendHours = room.typeId?.maxExtendHours || 0;
        const amenities = room.typeId?.amenities || [];
        // Tính tổng phụ cho phòng này
        const subtotal = pricePerNight * nights;
        
        doc.fontSize(11).text(`${idx + 1}. Phòng ${roomNum} - ${typeName}`, { underline: true });
        doc.fontSize(10);
        
        // Dòng 1: Số người tối đa và Giá/đêm
        const line1 = [];
        line1.push(`Số người tối đa: ${capacity > 0 ? capacity : '-'} người`);
        line1.push(`Giá/đêm: ${new Intl.NumberFormat("vi-VN").format(pricePerNight)} VND`);
        doc.text(`   ${line1.join(" | ")}`);
        
        // Dòng 2: Số đêm và Tổng phụ
        const line2 = [];
        line2.push(`Số đêm: ${nights} đêm`);
        line2.push(`Tổng phụ: ${new Intl.NumberFormat("vi-VN").format(subtotal)} VND`);
        doc.text(`   ${line2.join(" | ")}`);
        
        // Dòng 3: Giá giờ thêm và Số giờ tối đa (nếu có)
        if (extraHourPrice > 0) {
          const line3 = [];
          line3.push(`Giá giờ thêm: ${new Intl.NumberFormat("vi-VN").format(extraHourPrice)} VND/giờ`);
          if (maxExtendHours > 0) {
            line3.push(`Số giờ tối đa: ${maxExtendHours} giờ`);
          }
          doc.text(`   ${line3.join(" | ")}`);
        }
        
        // Hiển thị tiện ích nếu có
        if (amenities && amenities.length > 0) {
          doc.text(`   Tiện ích:`);
          doc.text(`   ${amenities.join(", ")}`);
        }
        
        doc.moveDown(0.4);
      });
    } else {
      // Nếu chưa có phòng được phân bổ
      doc.text(`Phòng: Chưa phân bổ`);
    }
    
    doc.text(
      `Ngày nhận phòng: ${
        groupBooking.checkIn
          ? moment(groupBooking.checkIn).format("DD/MM/YYYY HH:mm")
          : "-"
      }`
    );
    doc.text(
      `Ngày trả phòng: ${
        groupBooking.checkOut
          ? moment(groupBooking.checkOut).format("DD/MM/YYYY HH:mm")
          : "-"
      }`
    );
    
    // Tính số đêm
    if (groupBooking.checkIn && groupBooking.checkOut) {
      const nights = Math.ceil((new Date(groupBooking.checkOut).getTime() - new Date(groupBooking.checkIn).getTime()) / (1000 * 60 * 60 * 24));
      doc.text(`Số đêm: ${nights} đêm`);
    }
    
    doc.moveDown(0.5);
    
    // --- Thông tin thành viên đoàn ---
    if (groupBooking.members && groupBooking.members.length > 0) {
      doc.fontSize(14).text("THÀNH VIÊN ĐOÀN", { underline: true });
      doc.fontSize(11);
      // Duyệt từng thành viên để hiển thị thông tin
      groupBooking.members.forEach((member: any, idx: number) => {
        const isLeader = member.isLeader ? " (Trưởng đoàn)" : "";
        const roomNumber = member.roomNumber ? ` - Phòng ${member.roomNumber}` : "";
        doc.text(`${idx + 1}. ${member.fullName || "-"}${isLeader}${roomNumber}`);
        // Hiển thị thông tin bổ sung nếu có
        if (member.idNumber) doc.text(`   CMND/CCCD: ${member.idNumber}`);
        if (member.phoneNumber) doc.text(`   Điện thoại: ${member.phoneNumber}`);
        if (member.email) doc.text(`   Email: ${member.email}`);
        doc.moveDown(0.2);
      });
      doc.moveDown(0.3);
    }
    
    // Group booking không có dịch vụ
    doc.fontSize(12).text("Dịch vụ: Không có dịch vụ (đặt theo đoàn)");
    doc.moveDown(0.5);
  } else if (booking) {
    // Xử lý cho Booking thông thường
    // Nếu có thông tin customer (khách online có tài khoản)
    if (customer?.fullName) {
      // Khách online (có tài khoản)
      doc.fontSize(12).text(`Tên: ${customer.fullName}`);
      doc.text(`Email: ${customer.email || "-"}`);
      doc.text(`Điện thoại: ${customer.phoneNumber || "-"}`);
    } 
    // Nếu có danh sách guests (khách walk_in)
    else if (booking?.guests && booking.guests.length > 0) {
      // Lấy thông tin khách chính (có isMainGuest hoặc khách đầu tiên)
      const mainGuest = booking.guests.find((guest: any) => guest.isMainGuest) || booking.guests[0];
      
      // Tính tuổi từ dateOfBirth nếu không có age
      let age: number | string = mainGuest?.age;
      if (!age && mainGuest?.dateOfBirth) {
        const birthDate = new Date(mainGuest.dateOfBirth);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        // Điều chỉnh nếu chưa đến sinh nhật trong năm
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }
      
      doc.fontSize(12).text(`Tên: ${mainGuest?.fullName || "-"}`);
      doc.text(`Số CMND/CCCD: ${mainGuest?.idNumber || "-"}`);
      doc.text(`Tuổi: ${age || "-"}`);
      doc.text(`Điện thoại: ${mainGuest?.phoneNumber || "-"}`);
      // Không hiển thị email cho khách walk_in
      
      // Hiển thị thông tin khách phụ nếu có nhiều khách
      if (booking.guests.length > 1) {
        doc.text(`Số khách: ${booking.guestCount || booking.guests.length} người`);
        const otherGuests = booking.guests.filter((guest: any) => !guest.isMainGuest);
        if (otherGuests.length > 0) {
          doc.text(`Khách phụ: ${otherGuests.map((g: any) => g.fullName).join(", ")}`);
        }
      }
    } 
    // Fallback cho dữ liệu cũ (sử dụng guestInfo)
    else if (booking?.guestInfo) {
      // Tính tuổi từ dateOfBirth nếu không có age
      let age: number | string = booking.guestInfo.age;
      if (!age && booking.guestInfo.dateOfBirth) {
        const birthDate = new Date(booking.guestInfo.dateOfBirth);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        // Điều chỉnh nếu chưa đến sinh nhật trong năm
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }
      
      doc.fontSize(12).text(`Tên: ${booking.guestInfo.fullName || "-"}`);
      doc.text(`Số CMND/CCCD: ${booking.guestInfo.idNumber || "-"}`);
      doc.text(`Tuổi: ${age || "-"}`);
      doc.text(`Điện thoại: ${booking.guestInfo.phoneNumber || "-"}`);
      // Không hiển thị email cho khách walk_in
    } else {
      // Không có thông tin khách hàng
      doc.fontSize(12).text("Không có thông tin khách hàng");
    }
    doc.moveDown(0.5);

    // --- Thông tin đặt phòng ---
    doc.fontSize(14).text("THÔNG TIN ĐẶT PHÒNG", { underline: true });
    doc.fontSize(12).text(`Phòng: ${booking?.roomId?.roomNumber || "-"}`);
    doc.text(
      `Ngày nhận phòng: ${
        booking?.checkIn
          ? moment(booking.checkIn).format("DD/MM/YYYY HH:mm")
          : "-"
      }`
    );
    doc.text(
      `Ngày trả phòng: ${
        booking?.checkOut
          ? moment(booking.checkOut).format("DD/MM/YYYY HH:mm")
          : "-"
      }`
    );
    doc.moveDown(0.5);

    // --- Dịch vụ đã sử dụng ---
    doc.fontSize(14).text("DỊCH VỤ", { underline: true });
    console.log(booking?.services);
    
    // Hiển thị danh sách dịch vụ nếu có
    if (booking?.services && booking.services.length > 0) {
      booking.services.forEach((s: any, idx: number) => {
        const name = s?.name || "Unknown";
        const price = s?.price || 0;
        const quantity = s?.quantity || 1;
        const totalPrice = price * quantity;
        
        const priceFormatted = new Intl.NumberFormat("vi-VN").format(price);
        const totalFormatted = new Intl.NumberFormat("vi-VN").format(totalPrice);
        
        doc.fontSize(12)
          .text(
            `${idx + 1}. ${name} x ${quantity}: ${priceFormatted} VND = ${totalFormatted} VND`
          );
      });
    } else {
      // Không có dịch vụ
      doc.fontSize(12).text("Không có dịch vụ");
    }
    doc.moveDown(0.5);
  } else {
    // Không có thông tin booking hoặc group booking
    doc.fontSize(12).text("Không có thông tin đặt phòng");
    doc.moveDown(0.5);
  }

  // --- Tóm tắt thanh toán ---
  const nf = new Intl.NumberFormat("vi-VN");
  const totalFormatted = nf.format(invoice.totalAmount);

  // Xác định số tiền đã thanh toán và còn lại (ưu tiên theo invoice, fallback theo booking/groupBooking)
  const paidAmount = (invoice as any).paidAmount ?? booking?.paidAmount ?? groupBooking?.quoteAmount ?? 0;
  const remainingAmount = (invoice as any).remainingAmount ?? booking?.remainingAmount ?? (groupBooking ? 0 : Math.max((invoice.totalAmount || 0) - (paidAmount || 0), 0));
  const paymentStatus = (invoice as any).paymentStatus ?? booking?.paymentStatus ?? (groupBooking?.status === "paid" ? "paid" : "pending");

  // Xác định nhãn trạng thái thanh toán
  let paymentLabel = "Chờ thanh toán";
  if (paymentStatus === "partial_paid") paymentLabel = "Đã thanh toán 50%";
  else if (paymentStatus === "paid") paymentLabel = "Đã thanh toán đủ";
  else if (paymentStatus === "failed") paymentLabel = "Thanh toán thất bại";
  else if (paymentStatus === "refunded") paymentLabel = "Đã hoàn tiền";

  // Hiển thị tóm tắt thanh toán
  doc.fontSize(14).text("TÓM TẮT THANH TOÁN", { underline: true }).moveDown(0.5);
  doc.fontSize(12).text(`Trạng thái: ${paymentLabel}`);
  doc.text(`Tổng giá trị: ${totalFormatted} VND`);
  doc.text(`Đã thanh toán: ${nf.format(paidAmount)} VND`);
  doc.text(`Còn lại: ${nf.format(remainingAmount)} VND`).moveDown(0.5);

  // Dòng tổng cộng nổi bật ở cuối
  doc.fontSize(16).text(`TỔNG CỘNG: ${totalFormatted} VND`, { align: "right" });

  // --- Phần chữ ký ---
  doc.moveDown(2);
  // Tính toán kích thước trang và cột
  const pageWidth = (doc.page as any).width || 595.28; // A4 width in pt
  const margin = 50;
  const columnWidth = (pageWidth - margin * 2) / 2;

  // Ngày ký (tạo thủ công để tránh lỗi render ký tự)
  const signDate = `Ngày ${moment().format("DD")} tháng ${moment().format("MM")} năm ${moment().format("YYYY")}`;

  // Cột bên phải: Giám đốc khách sạn
  const directorTitle = "Giám đốc khách sạn";
  const directorName = "Nguyễn Văn Tứ";
  const rightX = margin + columnWidth;
  doc.font("NotoSans").fontSize(12).text(signDate, rightX, undefined, { width: columnWidth, align: "right" });
  doc.text(directorTitle, rightX, undefined, { width: columnWidth, align: "right" });
  doc.text(directorName, rightX, undefined, { width: columnWidth, align: "right" }).moveDown(3);
  // Vẽ dòng ký giám đốc
  const rightX1 = margin + columnWidth + 40;
  const rightX2 = margin + columnWidth * 2;
  const yLineRight = (doc.y || 0) + 10;
  doc.moveTo(rightX1, yLineRight).lineTo(rightX2, yLineRight).stroke();

  // Gợi ý: có thể chèn chữ ký hình ảnh nếu có file signature.png trong thư mục public
  // try {
  //   const sigPath = path.join(process.cwd(), "public/signature.png");
  //   if (fs.existsSync(sigPath)) {
  //     // Vẽ ảnh chữ ký phía cột phải, phía trên dòng ký
  //     doc.image(sigPath, rightX + columnWidth - 160, yLineRight - 60, { width: 120 });
  //   }
  // } catch {}

  // Kết thúc tạo PDF
  doc.end();

  // Đợi PDF hoàn thành và trả về buffer
  await new Promise((resolve) => doc.on("end", resolve));
  return Buffer.concat(chunks);
};

export default {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
  printInvoice,
};