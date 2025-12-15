import express from "express";
import contactInfoController from "../../controllers/contactInfo.controller";
import { authenticateToken, authorize } from "../../middlewares/auth.middleware";
import { uploadZaloQR } from "../../middlewares/upload.middleware";

const router = express.Router();

// Public endpoint - không cần auth để xem thông tin liên hệ
router.get("/contact-info", contactInfoController.get);

// Protected endpoint - chỉ admin/staff
router.put(
  "/contact-info",
  authenticateToken,
  authorize(["admin", "staff"]),
  contactInfoController.update
);

// Upload file và trả về đường dẫn
router.post(
  "/contact-info/upload",
  authenticateToken,
  authorize(["admin", "staff"]),
  uploadZaloQR.single("file"),
  contactInfoController.uploadFile
);

export default router;

