import express from "express";
import multer from "multer";
import groupBookingsController, { exportMembers, autoQuote } from "../../controllers/groupBookings.controller";

const router = express.Router();
const upload = multer();

router.post("/group-bookings", groupBookingsController.create);
router.get("/group-bookings", groupBookingsController.list);
router.get("/group-bookings/:id", groupBookingsController.getById);
router.post("/group-bookings/:id/approve", groupBookingsController.approve);
router.get("/group-bookings/:id/template", groupBookingsController.template);
router.post(
  "/group-bookings/:id/upload",
  upload.single("file"),
  groupBookingsController.upload
);
router.post("/group-bookings/:id/quote", groupBookingsController.quote);
router.get("/group-bookings/:id/auto-quote", autoQuote);
router.post("/group-bookings/:id/paid", groupBookingsController.markPaid);
router.post("/group-bookings/:id/full-payment", groupBookingsController.markFullPayment);
router.post("/group-bookings/:id/refund", groupBookingsController.refund);
router.post("/group-bookings/:id/confirm", groupBookingsController.confirm);
router.post("/group-bookings/:id/cancel", groupBookingsController.cancel);
router.get("/group-bookings/:id/members.xlsx", exportMembers);

export default router;


