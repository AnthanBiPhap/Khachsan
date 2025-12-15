import { NextFunction, Request, Response } from "express";
import aboutInfoService from "../services/aboutInfo.service";
import { sendJsonSuccess, httpStatus } from "../helpers/response.helper";

// Get about info (public - không cần auth)
const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const aboutInfo = await aboutInfoService.get();
    sendJsonSuccess(res, aboutInfo, httpStatus.OK.statusCode);
  } catch (error) {
    next(error);
  }
};

// Update about info (chỉ admin/staff)
const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.body;
    const updatedAboutInfo = await aboutInfoService.update(payload);
    sendJsonSuccess(
      res,
      updatedAboutInfo,
      httpStatus.OK.statusCode,
      "Cập nhật thông tin về chúng tôi thành công"
    );
  } catch (error) {
    next(error);
  }
};

export default {
  get,
  update,
};

