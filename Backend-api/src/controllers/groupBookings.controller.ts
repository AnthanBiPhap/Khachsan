import { Request, Response } from "express";
import groupBookingsService, { computeAutoQuote } from "../services/groupBookings.service";
import * as XLSX from "xlsx";

const create = async (req: Request, res: Response) => {
  const gb = await groupBookingsService.create(req.body);
  res.status(201).json({ data: gb });
};

const list = async (req: Request, res: Response) => {
  const items = await groupBookingsService.list(req.query);
  res.json({ data: items });
};

const getById = async (req: Request, res: Response) => {
  const gb = await groupBookingsService.getById(req.params.id);
  res.json({ data: gb });
};

const approve = async (req: Request, res: Response) => {
  const gb = await groupBookingsService.approve(req.params.id);
  res.json({ data: gb });
};

const template = async (req: Request, res: Response) => {
  const id = req.params.id;
  const gb = await groupBookingsService.getById(id);
  
  // Lấy danh sách số phòng đã được phân bổ với capacity
  const allocatedRooms = (gb as any).allocatedRoomIds || [];
  const roomInfoList = allocatedRooms
    .map((r: any) => {
      const roomNumber = r.roomNumber || String(r);
      const capacity = r.typeId?.capacity || 0;
      if (!roomNumber) return null;
      // Format: "103 (2 người)" hoặc chỉ "103" nếu không có capacity
      return capacity > 0 ? `${roomNumber} (${capacity} người)` : roomNumber;
    })
    .filter(Boolean);
  const roomNumbersStr = roomInfoList.length > 0 ? roomInfoList.join(", ") : "Chưa có phòng";
  
  // Lấy số người từ groupBooking
  const peopleCount = (gb as any).peopleCount || 1;
  
  // Build Excel template với cột STT và roomNumber
  const headers = [
    ["STT", "fullName", "idNumber", "dateOfBirth(YYYY-MM-DD)", "phoneNumber", "email", "isLeader(true/false)", `roomNumber (số phòng, ${roomNumbersStr})`],
  ];
  
  // Tạo các dòng dữ liệu trống theo số người
  const dataRows: any[] = [];
  for (let i = 1; i <= peopleCount; i++) {
    dataRows.push([
      i, // STT
      "", // fullName
      "", // idNumber
      "", // dateOfBirth
      "", // phoneNumber
      "", // email
      "", // isLeader
      "", // roomNumber - để khách hàng điền
    ]);
  }
  
  const ws = XLSX.utils.aoa_to_sheet([headers[0], ...dataRows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Members");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
  res.setHeader("Content-Disposition", "attachment; filename=group_members_template.xlsx");
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.send(buf);
};

const upload = async (req: Request, res: Response) => {
  // File uploaded via multer as req.file
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) {
    return res.status(400).json({ message: "Missing file" });
  }
  
  // Đọc Excel với cellDates để tự động parse ngày tháng
  const workbook = XLSX.read(file.buffer, { type: "buffer", cellDates: true, cellNF: false, cellText: false });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false }) as any[];
  
  // Helper function để parse ngày sinh từ nhiều format khác nhau
  // Trả về Date object với local time (không có time component, chỉ ngày)
  const parseDateOfBirth = (value: any): Date | undefined => {
    if (!value) return undefined;
    
    // Nếu là Date object (từ cellDates: true)
    if (value instanceof Date) {
      // Tạo Date mới với chỉ ngày (không có giờ) để tránh timezone issues
      const year = value.getFullYear();
      const month = value.getMonth();
      const day = value.getDate();
      return new Date(year, month, day);
    }
    
    // Nếu là string, kiểm tra format
    const str = String(value).trim();
    if (!str) return undefined;
    
    // Nếu đã là format YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const parts = str.split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // month is 0-indexed
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    // Nếu là số (Excel serial number), convert sang Date
    const num = Number(str);
    if (!isNaN(num) && num > 0 && num < 1000000) { // Reasonable date range check
      // Excel date serial: số ngày từ 1900-01-01
      // Excel có bug: coi 1900 là năm nhuận, nhưng thực tế không phải
      // Epoch: 1899-12-30 (Excel date 0 = 1900-01-00, nhưng trong JS là 1899-12-30)
      const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
      const date = new Date(excelEpoch.getTime() + (num - 1) * 24 * 60 * 60 * 1000);
      // Excel có leap year bug: nó coi 1900 là năm nhuận, nên cần điều chỉnh nếu date >= 1900-03-01
      if (date.getFullYear() >= 1900 && date.getMonth() >= 2) {
        // Điều chỉnh cho leap year bug: trừ đi 1 ngày nếu >= 1900-03-01
        date.setDate(date.getDate() - 1);
      }
      if (!isNaN(date.getTime())) {
        // Tạo Date mới chỉ với ngày (không có giờ)
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        return new Date(year, month, day);
      }
    }
    
    // Thử parse với các format khác (DD/MM/YYYY, DD-MM-YYYY, MM/DD/YYYY, etc.)
    // Thử parse với Date constructor (sẽ tự động detect format)
    let date = new Date(str);
    if (!isNaN(date.getTime())) {
      // Kiểm tra xem date có hợp lý không (năm từ 1900-2100)
      const year = date.getFullYear();
      if (year >= 1900 && year <= 2100) {
        // Tạo Date mới chỉ với ngày (không có giờ)
        const month = date.getMonth();
        const day = date.getDate();
        return new Date(year, month, day);
      }
    }
    
    // Thử parse format DD/MM/YYYY hoặc DD-MM-YYYY
    const ddmmyyyy = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/.exec(str);
    if (ddmmyyyy) {
      const day = parseInt(ddmmyyyy[1], 10);
      const month = parseInt(ddmmyyyy[2], 10) - 1;
      const year = parseInt(ddmmyyyy[3], 10);
      date = new Date(year, month, day);
      if (!isNaN(date.getTime()) && year >= 1900 && year <= 2100) {
        return date;
      }
    }
    
    return undefined;
  };
  
  const members = json.map((row: any) => {
    // Tìm cột roomNumber (có thể có header dạng "roomNumber (số phòng, ...)")
    let roomNumber = "";
    const roomNumberKey = Object.keys(row).find(key => key.toLowerCase().startsWith("roomnumber"));
    if (roomNumberKey) {
      roomNumber = String(row[roomNumberKey] || "").trim();
    }
    
    // Tìm cột dateOfBirth (có thể có header dạng "dateOfBirth(YYYY-MM-DD)")
    let dateOfBirthValue: any = row.dateOfBirth;
    if (!dateOfBirthValue) {
      const dateOfBirthKey = Object.keys(row).find(key => key.toLowerCase().includes("dateofbirth") || key.toLowerCase().includes("ngày sinh"));
      if (dateOfBirthKey) {
        dateOfBirthValue = row[dateOfBirthKey];
      }
    }
    
    const parsedDateOfBirth = parseDateOfBirth(dateOfBirthValue);
    
    // Format Date thành YYYY-MM-DD string (sử dụng local date để tránh timezone issues)
    let dateOfBirthStr: string | undefined = undefined;
    if (parsedDateOfBirth) {
      const year = parsedDateOfBirth.getFullYear();
      const month = String(parsedDateOfBirth.getMonth() + 1).padStart(2, '0');
      const day = String(parsedDateOfBirth.getDate()).padStart(2, '0');
      dateOfBirthStr = `${year}-${month}-${day}`;
    }
    
    return {
      fullName: row.fullName || row["fullName"] || "",
      idNumber: row.idNumber || row["idNumber"] || "",
      dateOfBirth: dateOfBirthStr,
      phoneNumber: row.phoneNumber || row["phoneNumber"] || "",
      email: row.email || row["email"] || "",
      isLeader: String(row.isLeader || row["isLeader(true/false)"] || "").toLowerCase() === "true",
      roomNumber: roomNumber,
    };
  }).filter(m => m.fullName); // Lọc bỏ các dòng trống (không có fullName)

  const gb = await groupBookingsService.uploadMembers(req.params.id, members);
  res.json({ data: gb });
};

const quote = async (req: Request, res: Response) => {
  const { quoteAmount, paymentLink } = req.body;
  const gb = await groupBookingsService.quote(req.params.id, quoteAmount, paymentLink);
  res.json({ data: gb });
};

const markPaid = async (req: Request, res: Response) => {
  const { stripeSessionId, stripePaymentIntentId, stripeCustomerId } = req.body;
  const gb = await groupBookingsService.markPaid(req.params.id, {
    stripeSessionId,
    stripePaymentIntentId,
    stripeCustomerId,
  });
  res.json({ data: gb });
};

const markFullPayment = async (req: Request, res: Response) => {
  const { stripeSessionId, stripePaymentIntentId, stripeCustomerId } = req.body || {};
  const gb = await groupBookingsService.markFullPayment(req.params.id, {
    stripeSessionId,
    stripePaymentIntentId,
    stripeCustomerId,
  });
  res.json({ data: gb });
};

const refund = async (req: Request, res: Response) => {
  const { amount, note } = req.body || {};
  const gb = await groupBookingsService.markRefunded(req.params.id, {
    amount,
    note,
  });
  res.json({ data: gb });
};

const confirm = async (req: Request, res: Response) => {
  const gb = await groupBookingsService.confirm(req.params.id);
  res.json({ data: gb });
};

const cancel = async (req: Request, res: Response) => {
  const { reason } = req.body || {};
  const gb = await groupBookingsService.cancel(req.params.id, reason);
  res.json({ data: gb });
};

export default {
  create,
  list,
  getById,
  approve,
  template,
  upload,
  // New export endpoint is added below
  quote,
  markPaid,
  markFullPayment,
  refund,
  confirm,
  cancel,
};

// Export members as the Excel the customer effectively uploaded (generated from stored data)
export const exportMembers = async (req: Request, res: Response) => {
  const id = req.params.id;
  const gb = await groupBookingsService.getById(id);
  const members = (gb as any).members || [];
  const rows = [
    ["STT", "fullName", "idNumber", "dateOfBirth(YYYY-MM-DD)", "phoneNumber", "email", "isLeader(true/false)", "roomNumber"],
    ...members.map((m: any, index: number) => [
      index + 1, // STT
      m.fullName || "",
      m.idNumber || "",
      m.dateOfBirth ? new Date(m.dateOfBirth).toISOString().slice(0, 10) : "",
      m.phoneNumber || "",
      m.email || "",
      m.isLeader ? "true" : "false",
      m.roomNumber || "",
    ]),
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Members");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
  res.setHeader("Content-Disposition", `attachment; filename=group_${id}_members.xlsx`);
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.send(buf);
};

export const autoQuote = async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await computeAutoQuote(id);
  res.json({ data: result });
};


