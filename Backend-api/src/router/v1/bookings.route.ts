import express from "express";
import bookingController from "../../controllers/bookings.controller";
const router = express.Router();

//Get all users
router.get("/bookings", bookingController.getAll);
//Get user by id
router.get("/bookings/:id", bookingController.getById);
//Calculate price
router.get("/bookings/price/calculate", bookingController.calculatePrice);
router.patch("/bookings/:id/payment", bookingController.updatePaymentStatus);
//Create user
router.post("/bookings", bookingController.Create);
//Update user
router.put("/bookings/:id", bookingController.Update);
//Delete user
router.delete("/bookings/:id", bookingController.Delete);
//Resend confirmation email
router.post("/bookings/:id/resend-email", bookingController.resendConfirmationEmail);

export default router;
