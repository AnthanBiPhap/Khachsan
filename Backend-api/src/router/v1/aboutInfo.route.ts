import express from "express";
import aboutInfoController from "../../controllers/aboutInfo.controller";
import { authenticateToken, authorize } from "../../middlewares/auth.middleware";

const router = express.Router();

// Public endpoint - không cần auth để xem thông tin về chúng tôi
router.get("/about-info", aboutInfoController.get);

// Protected endpoint - chỉ admin/staff
router.put(
  "/about-info",
  authenticateToken,
  authorize(["admin", "staff"]),
  aboutInfoController.update
);

export default router;

