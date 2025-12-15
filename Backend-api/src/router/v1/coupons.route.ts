import express from "express";
import couponsController from "../../controllers/coupons.controller";
import { authenticateToken, authorize } from "../../middlewares/auth.middleware";

const router = express.Router();

// Public routes
// Get active coupons (for homepage display)
// IMPORTANT: This route must be defined BEFORE "/coupons" to avoid route matching conflicts
router.get("/coupons/public", (req, res, next) => {
  console.log('🎯 Route matched: /coupons/public');
  console.log('🎯 Request method:', req.method);
  console.log('🎯 Request URL:', req.originalUrl);
  couponsController.getPublicCoupons(req, res, next);
});

// Get coupon by code (for validation)
router.get("/coupons/code/:code", couponsController.getByCode);

// Validate coupon (for applying coupon)
router.post("/coupons/validate/:code", couponsController.validate);

// Protected routes (admin/staff only)
// Get all coupons
router.get(
  "/coupons",
  authenticateToken,
  authorize(["admin", "staff"]),
  couponsController.getAll
);

// Get coupon by id
router.get(
  "/coupons/:id",
  authenticateToken,
  authorize(["admin", "staff"]),
  couponsController.getById
);

// Create coupon
router.post(
  "/coupons",
  authenticateToken,
  authorize(["admin", "staff"]),
  couponsController.Create
);

// Update coupon
router.put(
  "/coupons/:id",
  authenticateToken,
  authorize(["admin", "staff"]),
  couponsController.Update
);

// Delete coupon
router.delete(
  "/coupons/:id",
  authenticateToken,
  authorize(["admin", "staff"]),
  couponsController.Delete
);

export default router;

