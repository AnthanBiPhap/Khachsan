import createError from "http-errors";
import Invoice from "../models/invoices.model";
import { generateInvoicePdf } from "../utility/generateInvoicePdf";
import path from "path";
import PDFDocument from "pdfkit";
import moment from "moment";
import serviceBookingsService from "./serviceBookings.service";
import fs from "fs";

const getAll = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const sortField = query.sort_by || "createdAt";
  const sortType = query.sort_type === "asc" ? 1 : -1;
  const sortObject: Record<string, 1 | -1> = { [sortField]: sortType };

  const where: Record<string, any> = {};

  if (query.bookingId) where.bookingId = query.bookingId;
  if (query.groupBookingId) where.groupBookingId = query.groupBookingId;
  if (query.customerId) where.customerId = query.customerId;
  if (query.status) where.status = query.status;

  // Filter tổng tiền
  if (query.minAmount || query.maxAmount) {
    where.totalAmount = {};
    if (query.minAmount) where.totalAmount.$gte = Number(query.minAmount);
    if (query.maxAmount) where.totalAmount.$lte = Number(query.maxAmount);
  }

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
  if (!invoice) throw createError(404, "Invoice not found");
  return invoice;
};

const create = async (payload: any) => {
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
  if (savedInvoice.bookingId) {
    await savedInvoice.populate("bookingId", "_id checkIn checkOut guestInfo source guests guestCount totalPrice paidAmount remainingAmount paymentStatus");
  }
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
  await savedInvoice.populate("customerId", "fullName email phoneNumber");
  return savedInvoice;
};

const updateById = async (id: string, payload: any) => {
  const invoice = await getById(id);

  const cleanUpdates = Object.fromEntries(
    Object.entries(payload).filter(
      ([, v]) => v !== "" && v !== null && v !== undefined
    )
  );

  Object.assign(invoice, cleanUpdates);
  const updatedInvoice = await invoice.save();
  if (updatedInvoice.bookingId) {
    await updatedInvoice.populate("bookingId", "_id checkIn checkOut guestInfo source guests guestCount");
  }
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
  await updatedInvoice.populate("customerId", "fullName email phoneNumber");
  return updatedInvoice;
};

const deleteById = async (id: string) => {
  const invoice = await getById(id);
  await invoice.deleteOne();
  return invoice;
};
const printInvoice = async (invoiceId: string) => {
  // Lấy invoice, populate booking hoặc groupBooking, customer, services
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

  if (!invoice) throw createError(404, "Invoice not found");

  // Tạo PDF
  const doc = new PDFDocument({ margin: 50, size: "A4" });
  const chunks: Uint8Array[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  // Sử dụng font Noto Sans hỗ trợ tiếng Việt
  const fontPath = path.join(__dirname, "../../font/NotoSans-Regular.ttf");
  doc.registerFont("NotoSans", fontPath);
  doc.font("NotoSans");

  const customer = invoice.customerId as { fullName?: string; email?: string; phoneNumber?: string };
  const booking = invoice.bookingId as any;
  const groupBooking = invoice.groupBookingId as any;

  // --- Header ---
  doc
    .fontSize(20)
    .text("HÓA ĐƠN THANH TOÁN KHÁCH SẠN MIKO", { align: "center", underline: true })
    .moveDown(1);

  // --- Invoice info ---
  doc.fontSize(12).text(`Mã hóa đơn: ${invoice._id}`);
  doc.text(
    `Ngày xuất: ${
      invoice.issuedAt
        ? moment(invoice.issuedAt).format("DD/MM/YYYY HH:mm")
        : "-"
    }`
  );
  doc.moveDown(0.5);

  // --- Customer info ---
  doc.fontSize(14).text("THÔNG TIN KHÁCH HÀNG", { underline: true });
  
  // Xử lý cho Group Booking
  if (groupBooking) {
    doc.fontSize(12).text(`Tên người yêu cầu: ${groupBooking.requesterName || "-"}`);
    doc.text(`Điện thoại: ${groupBooking.requesterPhone || "-"}`);
    doc.text(`Email: ${groupBooking.requesterEmail || "-"}`);
    doc.text(`Số người: ${groupBooking.peopleCount || "-"}`);
    doc.text(`Số phòng: ${groupBooking.roomCount || "-"}`);
    doc.moveDown(0.5);
    
    // --- Booking info cho Group Booking ---
    doc.fontSize(14).text("THÔNG TIN ĐẶT PHÒNG", { underline: true });
    doc.fontSize(12).text(`Loại: Đặt theo đoàn`);
    
    // Tính số đêm
    let nights = 0;
    if (groupBooking.checkIn && groupBooking.checkOut) {
      nights = Math.ceil((new Date(groupBooking.checkOut).getTime() - new Date(groupBooking.checkIn).getTime()) / (1000 * 60 * 60 * 24));
      nights = Math.max(1, nights);
    }
    
    // Hiển thị danh sách phòng
    if (groupBooking.allocatedRoomIds && groupBooking.allocatedRoomIds.length > 0) {
      doc.text(`Phòng: ${groupBooking.allocatedRoomIds.map((r: any) => r.roomNumber || "-").join(", ")}`);
      doc.moveDown(0.5);
      doc.fontSize(12).text("CHI TIẾT PHÒNG:", { underline: true });
      doc.moveDown(0.3);
      groupBooking.allocatedRoomIds.forEach((room: any, idx: number) => {
        const roomNum = room.roomNumber || "-";
        const typeName = room.typeId?.name || "-";
        const pricePerNight = room.typeId?.pricePerNight || 0;
        const capacity = room.typeId?.capacity || 0;
        const extraHourPrice = room.typeId?.extraHourPrice || 0;
        const maxExtendHours = room.typeId?.maxExtendHours || 0;
        const amenities = room.typeId?.amenities || [];
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
        
        // Tiện ích
        if (amenities && amenities.length > 0) {
          doc.text(`   Tiện ích:`);
          doc.text(`   ${amenities.join(", ")}`);
        }
        
        doc.moveDown(0.4);
      });
    } else {
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
    
    // --- Members info ---
    if (groupBooking.members && groupBooking.members.length > 0) {
      doc.fontSize(14).text("THÀNH VIÊN ĐOÀN", { underline: true });
      doc.fontSize(11);
      groupBooking.members.forEach((member: any, idx: number) => {
        const isLeader = member.isLeader ? " (Trưởng đoàn)" : "";
        const roomNumber = member.roomNumber ? ` - Phòng ${member.roomNumber}` : "";
        doc.text(`${idx + 1}. ${member.fullName || "-"}${isLeader}${roomNumber}`);
        if (member.idNumber) doc.text(`   CMND/CCCD: ${member.idNumber}`);
        if (member.phoneNumber) doc.text(`   Điện thoại: ${member.phoneNumber}`);
        if (member.email) doc.text(`   Email: ${member.email}`);
        doc.moveDown(0.2);
      });
      doc.moveDown(0.3);
    }
    
    doc.fontSize(12).text("Dịch vụ: Không có dịch vụ (đặt theo đoàn)");
    doc.moveDown(0.5);
  } else if (booking) {
    // Logic cũ cho Booking thông thường
    if (customer?.fullName) {
      // Khách online (có tài khoản)
      doc.fontSize(12).text(`Tên: ${customer.fullName}`);
      doc.text(`Email: ${customer.email || "-"}`);
      doc.text(`Điện thoại: ${customer.phoneNumber || "-"}`);
    } else if (booking?.guests && booking.guests.length > 0) {
      // Khách hàng walk_in - lấy thông tin khách chính
      const mainGuest = booking.guests.find((guest: any) => guest.isMainGuest) || booking.guests[0];
      
      // Tính tuổi từ dateOfBirth nếu không có age
      let age: number | string = mainGuest?.age;
      if (!age && mainGuest?.dateOfBirth) {
        const birthDate = new Date(mainGuest.dateOfBirth);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }
      
      doc.fontSize(12).text(`Tên: ${mainGuest?.fullName || "-"}`);
      doc.text(`Số CMND/CCCD: ${mainGuest?.idNumber || "-"}`);
      doc.text(`Tuổi: ${age || "-"}`);
      doc.text(`Điện thoại: ${mainGuest?.phoneNumber || "-"}`);
      // Không hiển thị email cho khách walk_in
      
      // Hiển thị thông tin khách phụ nếu có
      if (booking.guests.length > 1) {
        doc.text(`Số khách: ${booking.guestCount || booking.guests.length} người`);
        const otherGuests = booking.guests.filter((guest: any) => !guest.isMainGuest);
        if (otherGuests.length > 0) {
          doc.text(`Khách phụ: ${otherGuests.map((g: any) => g.fullName).join(", ")}`);
        }
      }
    } else if (booking?.guestInfo) {
      // Fallback cho dữ liệu cũ
      // Tính tuổi từ dateOfBirth nếu không có age
      let age: number | string = booking.guestInfo.age;
      if (!age && booking.guestInfo.dateOfBirth) {
        const birthDate = new Date(booking.guestInfo.dateOfBirth);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
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
      // Không có thông tin
      doc.fontSize(12).text("Không có thông tin khách hàng");
    }
    doc.moveDown(0.5);

    // --- Booking info ---
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

    // --- Services ---
    doc.fontSize(14).text("DỊCH VỤ", { underline: true });
    console.log(booking?.services);
    
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
      doc.fontSize(12).text("Không có dịch vụ");
    }
    doc.moveDown(0.5);
  } else {
    doc.fontSize(12).text("Không có thông tin đặt phòng");
    doc.moveDown(0.5);
  }

  // --- Total & Payment Summary ---
  const nf = new Intl.NumberFormat("vi-VN");
  const totalFormatted = nf.format(invoice.totalAmount);

  // Xác định số tiền đã thanh toán và còn lại (ưu tiên theo invoice, fallback theo booking/groupBooking)
  const paidAmount = (invoice as any).paidAmount ?? booking?.paidAmount ?? groupBooking?.quoteAmount ?? 0;
  const remainingAmount = (invoice as any).remainingAmount ?? booking?.remainingAmount ?? (groupBooking ? 0 : Math.max((invoice.totalAmount || 0) - (paidAmount || 0), 0));
  const paymentStatus = (invoice as any).paymentStatus ?? booking?.paymentStatus ?? (groupBooking?.status === "paid" ? "paid" : "pending");

  // Nhãn trạng thái thanh toán
  let paymentLabel = "Chờ thanh toán";
  if (paymentStatus === "partial_paid") paymentLabel = "Đã thanh toán 50%";
  else if (paymentStatus === "paid") paymentLabel = "Đã thanh toán đủ";
  else if (paymentStatus === "failed") paymentLabel = "Thanh toán thất bại";
  else if (paymentStatus === "refunded") paymentLabel = "Đã hoàn tiền";

  doc.fontSize(14).text("TÓM TẮT THANH TOÁN", { underline: true }).moveDown(0.5);
  doc.fontSize(12).text(`Trạng thái: ${paymentLabel}`);
  doc.text(`Tổng giá trị: ${totalFormatted} VND`);
  doc.text(`Đã thanh toán: ${nf.format(paidAmount)} VND`);
  doc.text(`Còn lại: ${nf.format(remainingAmount)} VND`).moveDown(0.5);

  // Dòng tổng cộng nổi bật ở cuối
  doc.fontSize(16).text(`TỔNG CỘNG: ${totalFormatted} VND`, { align: "right" });

  // --- Signature Section ---
  doc.moveDown(2);
  const pageWidth = (doc.page as any).width || 595.28; // A4 width in pt
  const margin = 50;
  const columnWidth = (pageWidth - margin * 2) / 2;

  // Ngày ký (tạo thủ công để tránh lỗi render ký tự)
  const signDate = `Ngày ${moment().format("DD")} tháng ${moment().format("MM")} năm ${moment().format("YYYY")}`;

  // Cột bên phải: Giám đốc khách sạn
  const directorTitle = "Giám đốc khách sạn";
  const rightX = margin + columnWidth;
  doc.font("NotoSans").fontSize(12).text(signDate, rightX, undefined, { width: columnWidth, align: "right" });
  doc.text(directorTitle, rightX, undefined, { width: columnWidth, align: "right" }).moveDown(3);
  // Dòng ký giám đốc
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

  doc.end();

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