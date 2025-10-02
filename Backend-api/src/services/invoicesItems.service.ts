import createError from "http-errors";
import mongoose from "mongoose";
import InvoiceItem from "../models/invoiceItems.model";

const getAll = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const sortField = query.sort_by || "createdAt";
  const sortType = query.sort_type === "asc" ? 1 : -1;
  const sortObject: Record<string, 1 | -1> = { [sortField]: sortType };

  const where: Record<string, any> = {};

  if (query.invoiceId) where.invoiceId = query.invoiceId;
  if (query.itemType) where.itemType = query.itemType;
  if (query.search) where.description = { $regex: query.search, $options: "i" };
  if (query.minAmount || query.maxAmount) {
    where.amount = {};
    if (query.minAmount) where.amount.$gte = Number(query.minAmount);
    if (query.maxAmount) where.amount.$lte = Number(query.maxAmount);
  }

  const items = await InvoiceItem.find(where)
    .populate("invoiceId", "bookingId customerId totalAmount status")
    .skip((page - 1) * limit)
    .limit(limit)
    .sort(sortObject);

  const count = await InvoiceItem.countDocuments(where);

  return {
    items,
    pagination: {
      totalRecord: count,
      limit,
      page,
    },
  };
};

const getById = async (id: string) => {
  const item = await InvoiceItem.findById(id).populate(
    "invoiceId",
    "bookingId customerId totalAmount status"
  );
  if (!item) throw createError(404, "Invoice item not found");
  return item;
};

const create = async (payload: any) => {
  const item = new InvoiceItem({
    invoiceId: payload.invoiceId,
    itemType: payload.itemType || "other",
    description: payload.description,
    amount: payload.amount,
  });

  await item.save();
  return item.populate("invoiceId", "bookingId customerId totalAmount status");
};

const updateById = async (id: string, payload: any) => {
  const item = await getById(id);

  // Không cho đổi invoiceId
  if (payload.invoiceId && payload.invoiceId.toString() !== item.invoiceId.toString()) {
    throw createError(400, "Cannot change invoice after creation");
  }

  const cleanUpdates = Object.fromEntries(
    Object.entries(payload).filter(
      ([, v]) => v !== "" && v !== null && v !== undefined
    )
  );

  Object.assign(item, cleanUpdates);
  await item.save();
  return item.populate("invoiceId", "bookingId customerId totalAmount status");
};

const deleteById = async (id: string) => {
  const item = await getById(id);
  await item.deleteOne();
  return item;
};

// Lấy toàn bộ item theo invoiceId
const getItemsByInvoiceId = async (invoiceId: string) => {
  return InvoiceItem.find({ invoiceId }).populate(
    "invoiceId",
    "bookingId customerId totalAmount status"
  );
};

// Tính tổng tiền của 1 invoice
const calculateInvoiceTotal = async (invoiceId: string | mongoose.Types.ObjectId) => {
  const objectId =
    typeof invoiceId === "string" ? new mongoose.Types.ObjectId(invoiceId) : invoiceId;

  const result = await InvoiceItem.aggregate([
    { $match: { invoiceId: objectId } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  return result[0]?.total || 0;
};

export default {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
  getItemsByInvoiceId,
  calculateInvoiceTotal,
};
