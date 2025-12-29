import { NextFunction, Request, Response } from "express";
import couponsService from "../services/coupons.service";
import { sendJsonSuccess, sendJsonError, httpStatus } from "../helpers/response.helper";

/**
 * Controller:
 * - Nhận request từ route
 * - Nhận kết quả từ service tương ứng
 * - Response lại cho client
 * - Không nên xử lý logic nghiệp vụ ở controller
 */

// Get all coupons
const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await couponsService.getAll(req.query);
    sendJsonSuccess(res, result, httpStatus.OK.statusCode, httpStatus.OK.message);
  } catch (error) {
    next(error);
  }
};

// Get coupon by id
const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const coupon = await couponsService.getById(id);
    sendJsonSuccess(res, coupon, httpStatus.OK.statusCode, httpStatus.OK.message);
  } catch (error) {
    next(error);
  }
};

// Get public coupons (for homepage)
const getPublicCoupons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('📥 getPublicCoupons controller - Request received');
    console.log('📥 Query params:', req.query);
    console.log('📥 Full URL:', req.originalUrl);
    
    const result = await couponsService.getPublicCoupons(req.query);
    
    console.log('📤 getPublicCoupons controller - Service result:', {
      couponCount: result.coupons?.length || 0,
      coupons: result.coupons?.map((c: any) => ({ 
        code: c.code, 
        name: c.name, 
        status: c.status,
        startDate: c.startDate,
        endDate: c.endDate
      }))
    });
    
    console.log('📤 Sending response with data structure:', {
      statusCode: httpStatus.OK.statusCode,
      message: httpStatus.OK.message,
      data: result
    });
    
    sendJsonSuccess(res, result, httpStatus.OK.statusCode, httpStatus.OK.message);
  } catch (error) {
    console.error('❌ getPublicCoupons controller error:', error);
    next(error);
  }
};

// Get coupon by code (public endpoint)
const getByCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params;
    const coupon = await couponsService.getByCode(code);
    sendJsonSuccess(res, coupon, httpStatus.OK.statusCode, httpStatus.OK.message);
  } catch (error) {
    next(error);
  }
};

// Validate coupon (public endpoint)
const validate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params;
    const { orderAmount, applicableTo, roomAmount, serviceAmount, pricePerNight, checkInDate } = req.body;

    console.log('📥 Validate coupon controller - Request body:', {
      code,
      orderAmount,
      applicableTo,
      roomAmount,
      serviceAmount,
      pricePerNight,
      checkInDate,
    });

    if (!orderAmount || orderAmount <= 0) {
      return sendJsonError(
        res,
        "Giá trị đơn hàng không hợp lệ",
        httpStatus.BAD_REQUEST.statusCode
      );
    }

    const result = await couponsService.validateCoupon(
      code,
      orderAmount,
      applicableTo || "all",
      roomAmount,
      serviceAmount,
      pricePerNight,
      checkInDate
    );
    
    console.log('📤 Validate coupon controller - Result:', {
      discountAmount: result.discountAmount,
      finalAmount: result.finalAmount,
    });
    
    sendJsonSuccess(res, result, httpStatus.OK.statusCode, httpStatus.OK.message);
  } catch (error) {
    next(error);
  }
};

// Create coupon
const Create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.body;
    const coupon = await couponsService.create(payload);
    sendJsonSuccess(
      res,
      coupon,
      httpStatus.CREATED.statusCode,
      httpStatus.CREATED.message
    );
  } catch (error) {
    next(error);
  }
};

// Update coupon
const Update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const coupon = await couponsService.updateById(id, payload);
    sendJsonSuccess(res, coupon, httpStatus.OK.statusCode, httpStatus.OK.message);
  } catch (error) {
    next(error);
  }
};

// Delete coupon
const Delete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const coupon = await couponsService.deleteById(id);
    sendJsonSuccess(res, coupon, httpStatus.OK.statusCode, httpStatus.OK.message);
  } catch (error) {
    next(error);
  }
};

export default {
  getAll,
  getPublicCoupons,
  getById,
  getByCode,
  validate,
  Create,
  Update,
  Delete,
};

