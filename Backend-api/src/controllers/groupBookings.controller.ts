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
  // Build a simple Excel template
  const headers = [
    ["fullName", "idNumber", "dateOfBirth(YYYY-MM-DD)", "phoneNumber", "email", "isLeader(true/false)"],
  ];
  const ws = XLSX.utils.aoa_to_sheet(headers);
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
  const workbook = XLSX.read(file.buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(sheet, { defval: "" }) as any[];
  const members = json.map((row: any) => ({
    fullName: row.fullName || row["fullName"],
    idNumber: row.idNumber || row["idNumber"],
    dateOfBirth: row.dateOfBirth || row["dateOfBirth(YYYY-MM-DD)"],
    phoneNumber: row.phoneNumber || row["phoneNumber"],
    email: row.email || row["email"],
    isLeader: String(row.isLeader || row["isLeader(true/false)"]).toLowerCase() === "true",
  }));

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
  refund,
  confirm,
  cancel,
};

// Export members as the Excel the customer effectively uploaded (generated from stored data)
export const exportMembers = async (req: Request, res: Response) => {
  const id = req.params.id;
  const gb = await groupBookingsService.getById(id);
  const rows = [
    ["fullName", "idNumber", "dateOfBirth(YYYY-MM-DD)", "phoneNumber", "email", "isLeader(true/false)"],
    ...((gb as any).members || []).map((m: any) => [
      m.fullName || "",
      m.idNumber || "",
      m.dateOfBirth ? new Date(m.dateOfBirth).toISOString().slice(0, 10) : "",
      m.phoneNumber || "",
      m.email || "",
      m.isLeader ? "true" : "false",
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


