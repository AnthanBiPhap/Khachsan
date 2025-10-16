import createError from "http-errors";
import Invoice from "../models/invoices.model";
import { generateInvoicePdf } from "../utility/generateInvoicePdf";
import path from "path";
import PDFDocument from "pdfkit";
import moment from "moment";
import serviceBookingsService from "./serviceBookings.service";

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
    .populate("bookingId", "_id checkIn checkOut guestInfo")
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
    .populate("bookingId", "_id checkIn checkOut guestInfo")
    .populate("customerId", "fullName email phoneNumber");
  if (!invoice) throw createError(404, "Invoice not found");
  return invoice;
};

const create = async (payload: any) => {
  const invoice = new Invoice({
    bookingId: payload.bookingId,
    customerId: payload.customerId,
    totalAmount: payload.totalAmount,
    status: payload.status || "pending",
    issuedAt: payload.issuedAt || Date.now(),
  });
  await invoice.save();
  return invoice.populate("customerId", "fullName email phoneNumber");
};

const updateById = async (id: string, payload: any) => {
  const invoice = await getById(id);

  const cleanUpdates = Object.fromEntries(
    Object.entries(payload).filter(
      ([, v]) => v !== "" && v !== null && v !== undefined
    )
  );

  Object.assign(invoice, cleanUpdates);
  await invoice.save();
  return invoice.populate("customerId", "fullName email phoneNumber");
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
      select: "_id checkIn checkOut roomId services guestInfo",
      populate: { path: "roomId", select: "roomNumber" },
    })

    .populate("customerId", "fullName email phoneNumber");

  if (!invoice) throw createError(404, "Invoice not found");

  // Tạo PDF
  const doc = new PDFDocument({ margin: 50, size: "A4" });
  const chunks: Uint8Array[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  // Font Unicode (Google Noto Sans)
  doc.font("Helvetica");

  const customer = invoice.customerId as { fullName?: string; email?: string; phoneNumber?: string };
  const booking = invoice.bookingId as any;

  // --- Header ---
  doc
    .fontSize(20)
    .text("Invoice", { align: "center", underline: true })
    .moveDown(1);

  // --- Invoice info ---
  doc.fontSize(12).text(`Invoice ID: ${invoice._id}`);
  doc.text(
    `Issued At: ${
      invoice.issuedAt
        ? moment(invoice.issuedAt).format("DD/MM/YYYY HH:mm")
        : "-"
    }`
  );
  doc.moveDown(0.5);

  // --- Customer info ---
  doc.font("Helvetica-Bold").text("Customer Information", { underline: true });
  doc
    .font("Helvetica")
    .text(`Name: ${customer?.fullName || booking?.guestInfo?.fullName || "-"}`);
  doc.text(
    `Email: ${
      customer?.email ||
      booking?.guestInfo?.email ||
      "-"
    }`
  );
  doc.text(
    `Phone: ${
      customer?.phoneNumber ||
      booking?.guestInfo?.phoneNumber ||
      "-"
    }`
  );
  doc.moveDown(0.5);

  // --- Booking info ---
  doc.font("Helvetica-Bold").text("Booking Information", { underline: true });
  doc.font("Helvetica").text(`Room: ${booking?.roomId?.roomNumber || "-"}`);
  doc.text(
    `Check-in: ${
      booking?.checkIn
        ? moment(booking.checkIn).format("DD/MM/YYYY HH:mm")
        : "-"
    }`
  );
  doc.text(
    `Check-out: ${
      booking?.checkOut
        ? moment(booking.checkOut).format("DD/MM/YYYY HH:mm")
        : "-"
    }`
  );
  doc.moveDown(0.5);

  // --- Services ---
  doc.font("Helvetica-Bold").text("Services", { underline: true });
  console.log(booking?.services);
  const services = (booking.services || []).map((s: any) => ({
    name: s.serviceId?.name || "Unknown",
    unit: s.serviceId?.unit || "",
    price: s.serviceId?.price || 0,
    quantity: s.quantity || 1,
  }));
  if (booking?.services.length > 0) {
    booking?.services?.forEach((s: any, idx: number) => {
      const name = s?.name || "Unknown";
      const unit = s?.quantity || "";
      const price = s?.price || 0;
      const quantity = s.quantity || 1;
      const priceFormatted = new Intl.NumberFormat("vi-VN").format(price);
      doc
        .font("Helvetica")
        .text(
          `${idx + 1}. ${name} x ${quantity} ${unit}: ${priceFormatted} VND`
        );
    });
  } else {
    doc.font("Helvetica").text("No services");
  }
  doc.moveDown(0.5);

  // --- Total ---
  const totalFormatted = new Intl.NumberFormat("vi-VN").format(
    invoice.totalAmount
  );
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text(`Total Amount: ${totalFormatted} VND`, { align: "right" });

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
