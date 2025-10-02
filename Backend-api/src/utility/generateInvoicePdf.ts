import PDFDocument from "pdfkit";
import fs from "fs";

interface ServiceItem {
  name: string;
  price: number;
  quantity: number;
  total: number;
  scheduledAt?: string;
}

interface InvoiceData {
  invoiceId: string;
  issuedAt: string;
  customerName: string;
  customerEmail?: string;
  checkIn: string;
  checkOut: string;
  roomName: string;
  services: ServiceItem[];
  totalAmount: number;
}

export const generateInvoicePdf = (data: InvoiceData, filePath: string) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  // Ghi ra file
  doc.pipe(fs.createWriteStream(filePath));

  // Header
  doc.fontSize(20).text("HÓA ĐƠN THANH TOÁN", { align: "center" }).moveDown();

  // Thông tin hóa đơn
  doc.fontSize(12).text(`Mã hóa đơn: ${data.invoiceId}`);
  doc.text(`Ngày xuất: ${new Date(data.issuedAt).toLocaleDateString()}`);
  doc.text(`Khách hàng: ${data.customerName}`);
  if (data.customerEmail) doc.text(`Email: ${data.customerEmail}`);
  doc.text(`Phòng: ${data.roomName}`);
  doc.text(`Ngày nhận phòng: ${new Date(data.checkIn).toLocaleDateString()}`);
  doc.text(`Ngày trả phòng: ${new Date(data.checkOut).toLocaleDateString()}`);
  doc.moveDown();

  // Dịch vụ
  doc.text("Dịch vụ đã sử dụng:", { underline: true });
  data.services.forEach((s, index) => {
    const scheduled = s.scheduledAt
      ? ` (Giờ: ${new Date(s.scheduledAt).toLocaleTimeString()})`
      : "";
    doc.text(
      `${index + 1}. ${s.name} - ${
        s.quantity
      } x ${s.price.toLocaleString()} = ${s.total.toLocaleString()}${scheduled}`
    );
  });

  doc.moveDown();
  doc.fontSize(14).text(`Tổng tiền: ${data.totalAmount.toLocaleString()} VND`, {
    align: "right",
  });

  doc.end();
};
