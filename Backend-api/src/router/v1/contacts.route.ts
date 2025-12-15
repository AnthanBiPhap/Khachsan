import express from "express";
import contactController from "../../controllers/contacts.controller";
import { authenticateToken, authorize } from "../../middlewares/auth.middleware";

const router = express.Router();

// Public endpoint - không cần auth để gửi liên hệ
router.post("/contacts", contactController.create);

// Protected endpoints - chỉ admin/staff
// Admin/staff có thể tạo contact mới (có auth)
router.post(
  "/contacts/admin",
  authenticateToken,
  authorize(["admin", "staff"]),
  contactController.create
);
router.get(
  "/contacts",
  authenticateToken,
  authorize(["admin", "staff"]),
  contactController.getAll
);
router.get(
  "/contacts/count/new",
  authenticateToken,
  authorize(["admin", "staff"]),
  contactController.countNew
);
router.get(
  "/contacts/:id",
  authenticateToken,
  authorize(["admin", "staff"]),
  contactController.getById
);
router.put(
  "/contacts/:id",
  authenticateToken,
  authorize(["admin", "staff"]),
  contactController.update
);
router.put(
  "/contacts/:id/read",
  authenticateToken,
  authorize(["admin", "staff"]),
  contactController.markAsRead
);
router.delete(
  "/contacts/:id",
  authenticateToken,
  authorize(["admin", "staff"]),
  contactController.deleteContact
);

export default router;

