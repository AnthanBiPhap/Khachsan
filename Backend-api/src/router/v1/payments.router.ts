import { Router } from "express";
import {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  updatePaymentStatus,
  deletePayment,
  getPaymentsByBooking,
  getPaymentsByCustomer,
  getPaymentStats,
  syncWithBookings,
} from "../../controllers/payments.controller";
// import { authenticateToken } from "../../middlewares/auth.middleware";
// import { validateRequest } from "../../middlewares/validate.middleware";

const router = Router();

// Bỏ authentication để test dễ dàng
// router.use(authenticateToken);

// GET /api/v1/payments - Lấy tất cả payments
router.get("/payments", getAllPayments);

// GET /api/v1/payments/stats - Thống kê payments
router.get("/payments/stats", getPaymentStats);

// GET /api/v1/payments/sync - Đồng bộ payments với bookings
router.get("/payments/sync", syncWithBookings);

// GET /api/v1/payments/booking/:bookingId - Lấy payments theo booking
router.get("/payments/booking/:bookingId", getPaymentsByBooking);

// GET /api/v1/payments/customer/:customerId - Lấy payments theo customer
router.get("/payments/customer/:customerId", getPaymentsByCustomer);

// GET /api/v1/payments/:id - Lấy payment theo ID
router.get("/payments/:id", getPaymentById);

// POST /api/v1/payments - Tạo payment mới
router.post("/payments", createPayment);

// PUT /api/v1/payments/:id - Cập nhật payment
router.put("/payments/:id", updatePayment);

// PATCH /api/v1/payments/:id/status - Cập nhật trạng thái payment
router.patch("/payments/:id/status", updatePaymentStatus);

// DELETE /api/v1/payments/:id - Xóa payment
router.delete("/payments/:id", deletePayment);

export default router;
