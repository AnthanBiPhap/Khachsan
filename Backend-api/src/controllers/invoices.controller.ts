import { NextFunction, Request, Response } from "express";
import invoiceService from "../services/invoices.service";
import { sendJsonSuccess, httpStatus } from "../helpers/response.helper";
import path from "path";

/**
 * Controller:
 * - Nhận request từ route
 * - NHận kết quả từ revice tương ứng
 * - Response lai cho client
 * - Không nên xử lý logic nghiệp vụ ở controller
 */
// Get all users
const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await invoiceService.getAll(req.query);
    sendJsonSuccess(
      res,
      users,
      httpStatus.OK.statusCode,
      httpStatus.OK.message
    );
  } catch (error) {
    next(error);
  }
};
//  Get user by id
const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("JWT_SECRET:", process.env.JWT_SECRET);
    const { id } = req.params;
    const user = await invoiceService.getById(id);
    sendJsonSuccess(res, user, httpStatus.OK.statusCode, httpStatus.OK.message);
  } catch (error) {
    next(error);
  }
};

// Create user
const Create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.body;
    const user = await invoiceService.create(payload);
    sendJsonSuccess(
      res,
      user,
      httpStatus.CREATED.statusCode,
      httpStatus.CREATED.message
    );
  } catch (error) {
    next(error);
  }
};
// Update user
const Update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const user = await invoiceService.updateById(id, payload);
    sendJsonSuccess(res, user, httpStatus.OK.statusCode, httpStatus.OK.message);
  } catch (error) {
    next(error);
  }
};
// Delete user
const Delete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = invoiceService.deleteById(id);
    res.status(204).json({
      user,
      message: "users deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const Print = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Lấy PDF buffer từ service
    const pdfBuffer = await invoiceService.printInvoice(id);

    // Trả PDF trực tiếp cho client
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="invoice-${id}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

export default {
  getAll,
  getById,
  Create,
  Update,
  Delete,
  Print,
};
