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
    .populate("customerId", "fullName email phoneNumber");
  if (!invoice) throw createError(404, "Invoice not found");
  return invoice;
};

const create = async (payload: any) => {
  const invoice = new Invoice({
    bookingId: payload.bookingId,
    customerId: payload.customerId,
    totalAmount: payload.totalAmount,
    paidAmount: payload.paidAmount || 0,
    remainingAmount: payload.remainingAmount || 0,
    paymentStatus: payload.paymentStatus || "pending",
    status: payload.status || "pending",
    issuedAt: payload.issuedAt || Date.now(),
  });
  const savedInvoice = await invoice.save();
  await savedInvoice.populate("bookingId", "_id checkIn checkOut guestInfo source guests guestCount totalPrice paidAmount remainingAmount paymentStatus");
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
  await updatedInvoice.populate("bookingId", "_id checkIn checkOut guestInfo source guests guestCount");
  await updatedInvoice.populate("customerId", "fullName email phoneNumber");
  return updatedInvoice;
};

const deleteById = async (id: string) => {
  const invoice = await getById(id);
  await invoice.deleteOne();
  return invoice;
};
const printInvoice = async (invoiceId: string) => {
  // Lấy invoice, populate booking, customer, services
  const invoice = await Invoice.findById(invoiceId)
    .populate({
      path: "bookingId",
      select: "_id checkIn checkOut roomId services guestInfo source guests guestCount",
      populate: { path: "roomId", select: "roomNumber" },
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

  // --- Header ---
  doc
    .fontSize(20)
    .text("HÓA ĐƠN THANH TOÁN", { align: "center", underline: true })
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
  
  // Logic mới với mảng guests
  if (customer?.fullName) {
    // Khách online (có tài khoản)
    doc.fontSize(12).text(`Tên: ${customer.fullName}`);
    doc.text(`Email: ${customer.email || "-"}`);
    doc.text(`Điện thoại: ${customer.phoneNumber || "-"}`);
  } else if (booking?.guests && booking.guests.length > 0) {
    // Khách hàng walk_in - lấy thông tin khách chính
    const mainGuest = booking.guests.find((guest: any) => guest.isMainGuest) || booking.guests[0];
    doc.fontSize(12).text(`Tên: ${mainGuest?.fullName || "-"}`);
    doc.text(`Số CMND/CCCD: ${mainGuest?.idNumber || "-"}`);
    doc.text(`Tuổi: ${mainGuest?.age || "-"}`);
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
    doc.fontSize(12).text(`Tên: ${booking.guestInfo.fullName || "-"}`);
    doc.text(`Số CMND/CCCD: ${booking.guestInfo.idNumber || "-"}`);
    doc.text(`Tuổi: ${booking.guestInfo.age || "-"}`);
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

  // --- Total ---
  const totalFormatted = new Intl.NumberFormat("vi-VN").format(
    invoice.totalAmount
  );
  doc
    .fontSize(16)
    .text(`TỔNG CỘNG: ${totalFormatted} VND`, { align: "right" });

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