import { Request, Response } from "express";
import paymentsService from "../services/payments.service";
import { sendJsonSuccess, httpStatus } from "../helpers/response.helper";
import createError from 'http-errors';

// Lấy tất cả payments
export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const result = await paymentsService.getAll(req.query);
    return sendJsonSuccess(res, result, httpStatus.OK.statusCode, "Payments retrieved successfully");
  } catch (error: any) {
    return res.status(error.status || 500).json({
      success: false,
      status: error.status || 500,
      message: error.message || 'Internal server error'
    });
  }
};

// Lấy payment theo ID
export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payment = await paymentsService.getById(id);
    return sendJsonSuccess(res, payment, httpStatus.OK.statusCode, "Payment retrieved successfully");
  } catch (error: any) {
    return res.status(error.status || 500).json({
      success: false,
      status: error.status || 500,
      message: error.message || 'Internal server error'
    });
  }
};

// Tạo payment mới
export const createPayment = async (req: Request, res: Response) => {
  try {
    const payment = await paymentsService.create(req.body);
    return sendJsonSuccess(res, payment, httpStatus.CREATED.statusCode, "Payment created successfully");
  } catch (error: any) {
    return res.status(error.status || 500).json({
      success: false,
      status: error.status || 500,
      message: error.message || 'Internal server error'
    });
  }
};

// Cập nhật payment
export const updatePayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payment = await paymentsService.updateById(id, req.body);
    return sendJsonSuccess(res, payment, httpStatus.OK.statusCode, "Payment updated successfully");
  } catch (error: any) {
    return res.status(error.status || 500).json({
      success: false,
      status: error.status || 500,
      message: error.message || 'Internal server error'
    });
  }
};

// Cập nhật trạng thái payment
export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, ...additionalData } = req.body;
    const payment = await paymentsService.updateStatus(id, status, additionalData);
    return sendJsonSuccess(res, payment, httpStatus.OK.statusCode, "Payment status updated successfully");
  } catch (error: any) {
    return res.status(error.status || 500).json({
      success: false,
      status: error.status || 500,
      message: error.message || 'Internal server error'
    });
  }
};

// Xóa payment
export const deletePayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await paymentsService.deleteById(id);
    return sendJsonSuccess(res, result, httpStatus.OK.statusCode, "Payment deleted successfully");
  } catch (error: any) {
    return res.status(error.status || 500).json({
      success: false,
      status: error.status || 500,
      message: error.message || 'Internal server error'
    });
  }
};

// Lấy payments theo booking
export const getPaymentsByBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const payments = await paymentsService.getByBookingId(bookingId);
    return sendJsonSuccess(res, payments, httpStatus.OK.statusCode, "Payments retrieved successfully");
  } catch (error: any) {
    return res.status(error.status || 500).json({
      success: false,
      status: error.status || 500,
      message: error.message || 'Internal server error'
    });
  }
};

// Lấy payments theo customer
export const getPaymentsByCustomer = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const result = await paymentsService.getByCustomerId(customerId, req.query);
    return sendJsonSuccess(res, result, httpStatus.OK.statusCode, "Payments retrieved successfully");
  } catch (error: any) {
    return res.status(error.status || 500).json({
      success: false,
      status: error.status || 500,
      message: error.message || 'Internal server error'
    });
  }
};

// Thống kê payments
export const getPaymentStats = async (req: Request, res: Response) => {
  try {
    const stats = await paymentsService.getStats(req.query);
    return sendJsonSuccess(res, stats, httpStatus.OK.statusCode, "Payment statistics retrieved successfully");
  } catch (error: any) {
    return res.status(error.status || 500).json({
      success: false,
      status: error.status || 500,
      message: error.message || 'Internal server error'
    });
  }
};

// Đồng bộ payments với bookings
export const syncWithBookings = async (req: Request, res: Response) => {
  try {
    const result = await paymentsService.syncWithBookings();
    return sendJsonSuccess(res, result, httpStatus.OK.statusCode, "Payments synced with bookings successfully");
  } catch (error: any) {
    return res.status(error.status || 500).json({
      success: false,
      status: error.status || 500,
      message: error.message || 'Internal server error'
    });
  }
};
