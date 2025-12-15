import { NextFunction, Request, Response } from "express";
import contactInfoService from "../services/contactInfo.service";
import { sendJsonSuccess, httpStatus } from "../helpers/response.helper";

/**
 * Controller:
 * - Nhận request từ route
 * - Nhận kết quả từ service tương ứng
 * - Response lại cho client
 */

// Get contact info (public - không cần auth)
const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contactInfo = await contactInfoService.get();
    sendJsonSuccess(
      res,
      contactInfo,
      httpStatus.OK.statusCode,
      httpStatus.OK.message
    );
  } catch (error) {
    next(error);
  }
};

// Update contact info (chỉ admin/staff)
const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.body;
    const contactInfo = await contactInfoService.update(payload);
    sendJsonSuccess(
      res,
      contactInfo,
      httpStatus.OK.statusCode,
      "Cập nhật thông tin liên hệ thành công"
    );
  } catch (error) {
    next(error);
  }
};

// Upload file và trả về đường dẫn
const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Không có file được upload",
      });
    }

    // Trả về đường dẫn file
    const filePath = `/uploads/zalo-qr/${file.filename}`;
    
    sendJsonSuccess(
      res,
      { path: filePath },
      httpStatus.OK.statusCode,
      "Upload thành công"
    );
  } catch (error) {
    next(error);
  }
};

export default {
  get,
  update,
  uploadFile,
};

