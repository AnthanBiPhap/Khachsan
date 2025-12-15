import { NextFunction, Request, Response } from "express";
import contactService from "../services/contacts.service";
import { sendJsonSuccess, httpStatus } from "../helpers/response.helper";

/**
 * Controller:
 * - Nhận request từ route
 * - Nhận kết quả từ service tương ứng
 * - Response lại cho client
 * - Không nên xử lý logic nghiệp vụ ở controller
 */

// Get all contacts
const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await contactService.getAll(req.query);
    sendJsonSuccess(
      res,
      result,
      httpStatus.OK.statusCode,
      httpStatus.OK.message
    );
  } catch (error) {
    next(error);
  }
};

// Get contact by id
const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const contact = await contactService.getById(id);
    sendJsonSuccess(
      res,
      contact,
      httpStatus.OK.statusCode,
      httpStatus.OK.message
    );
  } catch (error) {
    next(error);
  }
};

// Create contact (public endpoint - không cần auth)
const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.body;
    const contact = await contactService.create(payload);
    sendJsonSuccess(
      res,
      contact,
      httpStatus.CREATED.statusCode,
      "Gửi tin nhắn thành công. Chúng tôi sẽ phản hồi sớm nhất có thể."
    );
  } catch (error) {
    next(error);
  }
};

// Update contact (chỉ admin/staff)
const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    
    // Nếu có replyMessage thì thêm repliedBy từ user hiện tại
    if (payload.replyMessage && !payload.repliedBy) {
      payload.repliedBy = res.locals.user._id;
    }
    
    const contact = await contactService.updateById(id, payload);
    sendJsonSuccess(
      res,
      contact,
      httpStatus.OK.statusCode,
      "Cập nhật liên hệ thành công"
    );
  } catch (error) {
    next(error);
  }
};

// Delete contact (soft delete)
const deleteContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await contactService.deleteById(id);
    sendJsonSuccess(
      res,
      result,
      httpStatus.OK.statusCode,
      "Xóa liên hệ thành công"
    );
  } catch (error) {
    next(error);
  }
};

// Mark as read
const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const contact = await contactService.markAsRead(id);
    sendJsonSuccess(
      res,
      contact,
      httpStatus.OK.statusCode,
      "Đã đánh dấu đã đọc"
    );
  } catch (error) {
    next(error);
  }
};

// Count new contacts
const countNew = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await contactService.countNew();
    sendJsonSuccess(
      res,
      result,
      httpStatus.OK.statusCode,
      httpStatus.OK.message
    );
  } catch (error) {
    next(error);
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  deleteContact,
  markAsRead,
  countNew,
};

